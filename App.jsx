import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';

const SHEET_ID = '1hF1Z-3LLgzzzFwc66xVqEXszNm3qSH8Xwl6DT01dQRs';
const API_KEY = 'AIzaSyAs_UERCv_a4ZCfrZI2XvThGMFPFRkStO0';

const REGION_GROUPS = {
  '東アジア': ['韓国', '台湾', '香港', '中国'],
  '東南アジア': ['タイ', 'シンガポール', 'マレーシア', 'インドネシア', 'フィリピン', 'ベトナム'],
  '欧米豪': ['米国', 'カナダ', '英国', 'ドイツ', 'フランス', 'イタリア', 'スペイン', 'オーストラリア', 'ロシア'],
  'その他': ['インド', 'その他']
};

// 국기 이모지 매핑
const COUNTRY_FLAGS = {
  '韓国': '🇰🇷',
  '台湾': '🇹🇼',
  '香港': '🇭🇰',
  '中国': '🇨🇳',
  'タイ': '🇹🇭',
  'シンガポール': '🇸🇬',
  'マレーシア': '🇲🇾',
  'インドネシア': '🇮🇩',
  'フィリピン': '🇵🇭',
  'ベトナム': '🇻🇳',
  '米国': '🇺🇸',
  'カナダ': '🇨🇦',
  '英国': '🇬🇧',
  'ドイツ': '🇩🇪',
  'フランス': '🇫🇷',
  'イタリア': '🇮🇹',
  'スペイン': '🇪🇸',
  'オーストラリア': '🇦🇺',
  'ロシア': '🇷🇺',
  'インド': '🇮🇳',
  'その他': '🌐'
};

const REGION_COLORS = {
  '東アジア': '#1a1a1a',
  '東南アジア': '#c41e3a',
  '欧米豪': '#4a5568',
  'その他': '#a0aec0'
};

// ============================================================
// 📊 트렌드 데이터 (하드코딩)
// 새 분기 데이터 추가 시 여기에 1줄 추가하세요!
// 형식: { label: 'YY/Q#', total: 소비액(억엔), perPerson: 객단가(만엔) }
// 출처: 観光庁「訪日外国人消費動向調査」
// ============================================================
const TREND_DATA = [
  // 2023年 (観光庁 確報値)
  { label: '23/Q1', total: 10103, perPerson: 21.1 },
  { label: '23/Q2', total: 12319, perPerson: 20.9 },
  { label: '23/Q3', total: 13801, perPerson: 20.9 },
  { label: '23/Q4', total: 16831, perPerson: 22.0 },
  // 2024年 (観光庁 確報値)
  { label: '24/Q1', total: 17700, perPerson: 21.1 },
  { label: '24/Q2', total: 21402, perPerson: 23.9 },
  { label: '24/Q3', total: 19186, perPerson: 22.0 },
  { label: '24/Q4', total: 22969, perPerson: 23.6 },
  // 2025年 (観光庁 確報値) - 新しい四半期発表時は以下に追加
  { label: '25/Q1', total: 22803, perPerson: 22.3 },
  { label: '25/Q2', total: 25043, perPerson: 23.7 },
  { label: '25/Q3', total: 21384, perPerson: 22.0 },
  { label: '25/Q4', total: 25330, perPerson: 23.4 },
  // ↓ 2026年 Q1 発表時はここに追加 ↓
];

const parseNumber = (str) => {
  if (!str) return 0;
  const cleaned = String(str).replace(/,/g, '').replace(/円/g, '').replace(/泊/g, '').replace(/人/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return num.toLocaleString('ja-JP', { maximumFractionDigits: decimals });
};

const formatChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return { percent: change, isPositive: change >= 0 };
};

const getRegionForCountry = (country) => {
  for (const [region, countries] of Object.entries(REGION_GROUPS)) {
    if (countries.includes(country)) return region;
  }
  return 'その他';
};

// API 요청 딜레이 (429 에러 방지)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSheetData = async (sheetName, retries = 2) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (response.status === 429 && retries > 0) {
      // Rate limit - 잠시 대기 후 재시도
      await delay(1000);
      return fetchSheetData(sheetName, retries - 1);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
};

// 순차적으로 API 호출 (동시 요청 제한)
const fetchSequential = async (requests, delayMs = 100) => {
  const results = [];
  for (const req of requests) {
    results.push(await req());
    if (delayMs > 0) await delay(delayMs);
  }
  return results;
};

const InsightsSummary = ({ data, previousData, loading }) => {
  const insights = useMemo(() => {
    if (!data?.length || !previousData?.length) return [];
    
    const results = [];
    const changes = data.slice(1).map(item => {
      const prevItem = previousData.find(p => p.country === item.country);
      if (!prevItem?.total) return null;
      return {
        country: item.country,
        change: ((item.total - prevItem.total) / prevItem.total) * 100,
        region: getRegionForCountry(item.country)
      };
    }).filter(Boolean);
    
    const maxGrowth = changes.reduce((max, c) => c.change > max.change ? c : max, { change: -Infinity });
    const maxDecline = changes.reduce((min, c) => c.change < min.change ? c : min, { change: Infinity });
    
    if (maxGrowth.change > 10) {
      results.push({ type: 'growth', country: maxGrowth.country, value: maxGrowth.change });
    }
    if (maxDecline.change < -10) {
      results.push({ type: 'decline', country: maxDecline.country, value: maxDecline.change });
    }
    
    const totalCurrent = data[0]?.total || 0;
    const totalPrevious = previousData.find(p => p.country === '全国籍・地域')?.total || 0;
    if (totalPrevious > 0) {
      results.push({ type: 'total', value: ((totalCurrent - totalPrevious) / totalPrevious) * 100, amount: totalCurrent });
    }
    
    return results.slice(0, 3);
  }, [data, previousData]);

  if (loading || insights.length === 0) return null;

  return (
    <div style={styles.insightBar}>
      {insights.map((item, idx) => (
        <div key={idx} style={styles.insightItem}>
          {item.type === 'growth' && (
            <span style={styles.insightGrowth}>
              <span style={styles.insightFlag}>{COUNTRY_FLAGS[item.country] || '🌐'}</span>
              <strong>{item.country}</strong> <span style={styles.insightArrowUp}>↑</span> +{item.value.toFixed(1)}%
            </span>
          )}
          {item.type === 'decline' && (
            <span style={styles.insightDecline}>
              <span style={styles.insightFlag}>{COUNTRY_FLAGS[item.country] || '🌐'}</span>
              <strong>{item.country}</strong> <span style={styles.insightArrowDown}>↓</span> {item.value.toFixed(1)}%
            </span>
          )}
          {item.type === 'total' && (
            <span style={styles.insightTotal}>
              📊 市場全体 {item.value >= 0 ? <span style={styles.insightArrowUp}>↑</span> : <span style={styles.insightArrowDown}>↓</span>} {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}%（{formatNumber(item.amount)}億円）
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const KPI_ICONS = {
  '総消費額': '💰',
  '訪日客数': '✈️',
  '客単価': '👤',
  '買物代比率': '🛍️'
};

const KPICard = ({ label, value, unit, change, note }) => (
  <div style={styles.kpiCard}>
    <div style={styles.kpiHeader}>
      <span style={styles.kpiIcon}>{KPI_ICONS[label] || '📊'}</span>
      <span style={styles.kpiLabel}>{label}</span>
    </div>
    <div style={styles.kpiValue}>
      {value}<span style={styles.kpiUnit}>{unit}</span>
    </div>
    {change && (
      <div style={{ ...styles.kpiChange, color: change.isPositive ? '#16a34a' : '#c41e3a' }}>
        <span style={styles.changeArrow}>{change.isPositive ? '↑' : '↓'}</span>
        {change.isPositive ? '+' : ''}{change.percent.toFixed(1)}% 前年比
      </div>
    )}
    {note && <div style={styles.kpiNote}>{note}</div>}
  </div>
);

const CountryList = ({ data, previousData, expandedCountry, setExpandedCountry, salesData, loadingSales }) => {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState('ranking');
  const INITIAL_COUNT = 5;
  
  // 영업 시트가 있는 국가 목록
  const salesCountries = ['韓国', '中国', '台湾', '香港', '米国', 'タイ', 'ベトナム', 'オーストラリア', 'シンガポール', 'マレーシア', 'インドネシア', 'フィリピン', 'インド', '英国', 'ドイツ', 'フランス', 'イタリア', 'スペイン', 'ロシア', 'カナダ'];

  const groupedByRegion = useMemo(() => {
    if (!data?.length) return {};
    const groups = {};
    data.slice(1).forEach(item => {
      const region = getRegionForCountry(item.country);
      if (!groups[region]) groups[region] = [];
      groups[region].push(item);
    });
    Object.keys(groups).forEach(r => groups[r].sort((a, b) => (b.total || 0) - (a.total || 0)));
    return groups;
  }, [data]);

  const rankedData = useMemo(() => {
    if (!data?.length) return [];
    return [...data.slice(1)].sort((a, b) => (b.total || 0) - (a.total || 0));
  }, [data]);

  const displayData = showAll ? rankedData : rankedData.slice(0, INITIAL_COUNT);

  const renderCountryRow = (item, rank) => {
    const prev = previousData?.find(p => p.country === item.country);
    const change = prev ? formatChange(item.total, prev.total) : null;
    const region = getRegionForCountry(item.country);
    const isExpanded = expandedCountry === item.country;
    const countrySales = salesData?.[item.country];
    const flag = COUNTRY_FLAGS[item.country] || '🌐';

    return (
      <div key={item.country} style={styles.countryRow}>
        <div 
          style={styles.countryHeader}
          onClick={() => setExpandedCountry(isExpanded ? null : item.country)}
        >
          <div style={styles.countryLeft}>
            {viewMode === 'ranking' && <span style={styles.rank}>{rank}</span>}
            <span style={styles.flag}>{flag}</span>
            <span style={{ ...styles.regionIndicator, backgroundColor: REGION_COLORS[region] }} />
            <span style={styles.countryName}>{item.country}</span>
          </div>
          <div style={styles.countryRight}>
            <span style={styles.countryValue}>{formatNumber(item.total)}億円</span>
            {change && (
              <span style={{ ...styles.changeText, color: change.isPositive ? '#1a1a1a' : '#c41e3a' }}>
                {change.isPositive ? '+' : ''}{change.percent.toFixed(1)}%
              </span>
            )}
            <span style={{ ...styles.expandArrow, transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
              ▾
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div style={styles.expandedContent}>
            <div style={styles.expenseSection}>
              <div style={styles.sectionTitle}>費目別内訳</div>
              <div style={styles.expenseGrid}>
                {[
                  { key: 'accommodation', label: '宿泊', icon: '🏨' },
                  { key: 'food', label: '飲食', icon: '🍽️' },
                  { key: 'transport', label: '交通', icon: '🚃' },
                  { key: 'entertainment', label: '娯楽', icon: '🎭' },
                  { key: 'shopping', label: '買物', icon: '🛒' },
                  { key: 'other', label: 'その他', icon: '📦' }
                ].map(exp => {
                  const val = item[exp.key] || 0;
                  const prevVal = prev?.[exp.key] || 0;
                  const expChange = prevVal ? formatChange(val, prevVal) : null;
                  const ratio = item.total ? ((val / item.total) * 100) : 0;
                  
                  return (
                    <div key={exp.key} style={styles.expenseItem}>
                      <div style={styles.expenseLabel}>
                        <span><span style={styles.expenseIcon}>{exp.icon}</span> {exp.label}</span>
                        <span style={styles.expenseRatio}>{ratio.toFixed(0)}%</span>
                      </div>
                      <div style={styles.expenseValue}>
                        {formatNumber(val)}億円
                        {expChange && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: expChange.isPositive ? '#16a34a' : '#c41e3a' }}>
                            {expChange.isPositive ? '↑' : '↓'}{Math.abs(expChange.percent).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div style={styles.barTrack}>
                        <div style={{ ...styles.barFill, width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {countrySales?.length > 0 ? (
              <div style={styles.salesSection}>
                <div style={styles.sectionTitle}>買物品目別 購入者単価（10〜12月）</div>
                <table style={styles.salesTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>品目</th>
                      <th style={styles.thRight}>2024年</th>
                      <th style={styles.thRight}>2025年</th>
                      <th style={styles.thRight}>前年比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countrySales.map((sale, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{sale.item}</td>
                        <td style={styles.tdRight}>{formatNumber(sale.y2024, 0)}円</td>
                        <td style={styles.tdRight}>{formatNumber(sale.y2025, 0)}円</td>
                        <td style={{ ...styles.tdRight, color: sale.yoy >= 1 ? '#16a34a' : '#c41e3a' }}>
                          {(sale.yoy * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : loadingSales && salesCountries.includes(item.country) ? (
              <div style={styles.salesSection}>
                <div style={styles.sectionTitle}>買物品目別 購入者単価</div>
                <div style={styles.salesLoading}>データを読み込み中...</div>
              </div>
            ) : salesCountries.includes(item.country) ? (
              <div style={styles.salesSection}>
                <div style={styles.sectionTitle}>買物品目別 購入者単価</div>
                <div style={styles.salesLoading}>データがありません</div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.listContainer}>
      <div style={styles.listHeader}>
        <h3 style={styles.listTitle}>国別消費額</h3>
        <div style={styles.toggleGroup}>
          <button
            onClick={() => setViewMode('ranking')}
            style={{ ...styles.toggleBtn, ...(viewMode === 'ranking' ? styles.toggleActive : {}) }}
          >
            順位
          </button>
          <button
            onClick={() => setViewMode('region')}
            style={{ ...styles.toggleBtn, ...(viewMode === 'region' ? styles.toggleActive : {}) }}
          >
            地域別
          </button>
        </div>
      </div>

      {viewMode === 'ranking' ? (
        <>
          {displayData.map((item, idx) => renderCountryRow(item, idx + 1))}
          {rankedData.length > INITIAL_COUNT && (
            <button style={styles.moreBtn} onClick={() => setShowAll(!showAll)}>
              {showAll ? '閉じる' : `他${rankedData.length - INITIAL_COUNT}カ国を表示`}
            </button>
          )}
        </>
      ) : (
        Object.entries(REGION_GROUPS).map(([region, _]) => {
          const regionData = groupedByRegion[region];
          if (!regionData?.length) return null;
          const regionTotal = regionData.reduce((s, d) => s + (d.total || 0), 0);
          const regionIcons = {
            '東アジア': '🌏',
            '東南アジア': '🌴',
            '欧米豪': '🌍',
            'その他': '🌐'
          };
          
          return (
            <div key={region} style={styles.regionBlock}>
              <div style={styles.regionHeader}>
                <span style={styles.regionIcon}>{regionIcons[region]}</span>
                <span style={{ ...styles.regionIndicator, backgroundColor: REGION_COLORS[region] }} />
                <span style={styles.regionName}>{region}</span>
                <span style={styles.regionTotal}>{formatNumber(regionTotal)}億円</span>
              </div>
              {regionData.map((item, idx) => renderCountryRow(item, idx + 1))}
            </div>
          );
        })
      )}
    </div>
  );
};

const TrendChart = ({ data, year, onYearSelect }) => {
  if (!data?.length) return null;

  // 선택된 연도의 약자 (예: "2025" → "25")
  const selectedYearShort = year.slice(2);

  // 해당 연도의 막대인지 확인
  const isSelectedYear = (label) => label?.startsWith(selectedYearShort + '/');

  // 막대 위에 금액 라벨 표시하는 커스텀 컴포넌트
  const CustomBarLabel = ({ x, y, width, value, index }) => {
    const isSelected = isSelectedYear(data[index]?.label);
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill={isSelected ? '#1d4ed8' : '#4a5568'}
        fontSize={10}
        fontWeight={isSelected ? 700 : 500}
        textAnchor="middle"
      >
        {formatNumber(value, 0)}
      </text>
    );
  };

  // 라인 위에 객단가 라벨 표시
  const CustomLineLabel = ({ x, y, value, index }) => {
    const isSelected = isSelectedYear(data[index]?.label);
    return (
      <text 
        x={x} 
        y={y - 12} 
        fill="#c41e3a"
        fontSize={10}
        fontWeight={isSelected ? 700 : 500}
        textAnchor="middle"
      >
        {value.toFixed(1)}
      </text>
    );
  };

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>四半期別 旅行消費額・1人当たり旅行支出の推移</h3>
      <div style={styles.chartSubtitle}>
        <span style={styles.legendBar}>■ 訪日外国人旅行消費額（左軸）</span>
        <span style={styles.legendLine}>● 1人当たり旅行支出（右軸）</span>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 30, right: 50, bottom: 60, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 10, fill: '#4a5568' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
            tickFormatter={(value) => {
              // 23/Q1 → 1-3月期 형식으로 변환
              const qMap = { 'Q1': '1-3月期', 'Q2': '4-6月期', 'Q3': '7-9月期', 'Q4': '10-12月期' };
              const [yy, q] = value.split('/');
              return qMap[q] || value;
            }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#4a5568' }}
            domain={[0, 30000]}
            tickFormatter={(v) => v.toLocaleString()}
            label={{ value: '（億円）', position: 'top', offset: 15, fontSize: 11, fill: '#4a5568' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#c41e3a' }}
            domain={[20, 25]}
            label={{ value: '（万円）', position: 'top', offset: 15, fontSize: 11, fill: '#c41e3a' }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === '旅行消費額') return [`${formatNumber(value, 0)}億円`, name];
              return [`${value.toFixed(1)}万円`, name];
            }}
            labelFormatter={(label) => {
              const qMap = { 'Q1': '1-3月期', 'Q2': '4-6月期', 'Q3': '7-9月期', 'Q4': '10-12月期' };
              const [yy, q] = label.split('/');
              return `20${yy}年 ${qMap[q]}`;
            }}
          />
          <Bar 
            yAxisId="left" 
            dataKey="total" 
            name="旅行消費額" 
            radius={[2, 2, 0, 0]}
            label={<CustomBarLabel />}
            onClick={(data) => {
              if (onYearSelect && data?.label) {
                const [y] = data.label.split('/');
                onYearSelect(`20${y}`);
              }
            }}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={isSelectedYear(entry.label) ? '#2563eb' : '#4a90a4'} 
                fillOpacity={isSelectedYear(entry.label) ? 1 : 0.75}
                stroke={isSelectedYear(entry.label) ? '#1d4ed8' : 'none'}
                strokeWidth={isSelectedYear(entry.label) ? 2 : 0}
              />
            ))}
          </Bar>
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="perPerson" 
            name="1人当たり旅行支出" 
            stroke="#c41e3a" 
            strokeWidth={2} 
            dot={{ r: 5, fill: '#c41e3a', stroke: '#fff', strokeWidth: 2 }}
            label={<CustomLineLabel />}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {/* 연도 구분선 - 클릭 가능하게 */}
      <div style={styles.yearLabelsContainer}>
        {['2023', '2024', '2025'].map(y => (
          <div 
            key={y}
            style={{
              ...styles.yearLabelGroup,
              cursor: 'pointer',
              backgroundColor: year === y ? '#f0f7ff' : 'transparent',
              borderRadius: 4
            }}
            onClick={() => onYearSelect(y)}
          >
            <div style={{
              ...styles.yearBracket,
              borderColor: year === y ? '#2563eb' : '#cbd5e0'
            }}></div>
            <span style={{
              ...styles.yearLabel,
              color: year === y ? '#2563eb' : '#4a5568',
              fontWeight: year === y ? 700 : 600
            }}>{y}年</span>
          </div>
        ))}
      </div>
      {/* 각주 */}
      <div style={styles.chartFootnote}>
        ※ 出典：観光庁「訪日外国人消費動向調査」各四半期確報値
      </div>
    </div>
  );
};

const CompositionChart = ({ data }) => {
  if (!data?.length) return null;

  const chartData = data.slice(1, 11).map(item => ({
    country: item.country,
    宿泊: item.total ? ((item.accommodation / item.total) * 100) : 0,
    飲食: item.total ? ((item.food / item.total) * 100) : 0,
    交通: item.total ? ((item.transport / item.total) * 100) : 0,
    娯楽: item.total ? ((item.entertainment / item.total) * 100) : 0,
    買物: item.total ? ((item.shopping / item.total) * 100) : 0,
    他: item.total ? ((item.other / item.total) * 100) : 0
  }));

  const colors = ['#1a1a1a', '#c41e3a', '#4a5568', '#718096', '#a0aec0', '#e2e8f0'];

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>費目構成比</h3>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#4a5568' }} />
          <YAxis dataKey="country" type="category" tick={{ fontSize: 11, fill: '#1a1a1a' }} width={56} />
          <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {['宿泊', '飲食', '交通', '娯楽', '買物', '他'].map((k, i) => (
            <Bar key={k} dataKey={k} stackId="a" fill={colors[i]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MatrixChart = ({ data, previousData }) => {
  if (!data?.length) return null;

  const chartData = data.slice(1).map(item => {
    const prev = previousData?.find(p => p.country === item.country);
    const growth = prev?.total ? ((item.total - prev.total) / prev.total) * 100 : 0;
    const perPerson = item.perPerson ? (item.perPerson / 10000) : (item.visitors ? (item.total * 100000000 / item.visitors) / 10000 : 0);
    
    return {
      country: item.country,
      growth,
      perPerson,
      total: item.total,
      region: getRegionForCountry(item.country),
      hasPrevData: !!prev?.total
    };
  }).filter(d => d.total > 100 && d.perPerson > 0);

  // 전년 데이터가 없는 경우 안내
  const hasPrevData = previousData?.length > 0;

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>成長率 × 客単価</h3>
      {!hasPrevData && (
        <div style={styles.noDataNote}>※ 前年データがないため、成長率は0%で表示されます</div>
      )}
      {chartData.length === 0 ? (
        <div style={styles.noDataMessage}>データがありません</div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              dataKey="growth" 
              name="成長率" 
              unit="%"
              tick={{ fontSize: 11, fill: '#4a5568' }}
              label={{ value: '成長率（%）', position: 'bottom', offset: 20, fontSize: 11, fill: '#4a5568' }}
            />
            <YAxis 
              type="number" 
              dataKey="perPerson" 
              name="客単価" 
              unit="万円"
              tick={{ fontSize: 11, fill: '#4a5568' }}
              label={{ value: '客単価（万円）', angle: -90, position: 'left', offset: 10, fontSize: 11, fill: '#4a5568' }}
            />
            <ZAxis type="number" dataKey="total" range={[60, 600]} />
            <Tooltip 
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                const flag = COUNTRY_FLAGS[d.country] || '🌐';
                return (
                  <div style={styles.tooltip}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{flag} {d.country}</div>
                    <div>成長率: {d.hasPrevData ? (d.growth >= 0 ? '+' : '') + d.growth.toFixed(1) + '%' : 'データなし'}</div>
                    <div>客単価: {d.perPerson.toFixed(1)}万円</div>
                    <div>消費額: {formatNumber(d.total)}億円</div>
                  </div>
                );
              }}
            />
            <Scatter data={chartData}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={REGION_COLORS[entry.region] || '#a0aec0'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
      <div style={styles.legendRow}>
        {Object.entries(REGION_COLORS).map(([region, color]) => (
          <div key={region} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: color }} />
            <span>{region}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [year, setYear] = useState('2025');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expenseData, setExpenseData] = useState([]);
  const [previousExpenseData, setPreviousExpenseData] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [expandedCountry, setExpandedCountry] = useState(null);
  
  // 트렌드 데이터는 하드코딩 사용 (API 호출 절감)
  const trendData = TREND_DATA;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      // 년도 변경 시 이전 데이터 초기화
      setExpenseData([]);
      setPreviousExpenseData([]);
      setExpandedCountry(null);
      
      try {
        // 연간 시트에서 데이터 로드 (API 2번만 호출!)
        await delay(100);
        const expense = await fetchSheetData(`${year}_年間_図表3`);
        await delay(200);
        const visitor = await fetchSheetData(`${year}_年間_図表4`);
        
        // 전년도 데이터 로드
        const prevYear = String(parseInt(year) - 1);
        await delay(200);
        const prevExpense = await fetchSheetData(`${prevYear}_年間_図表3`);
        await delay(200);
        const prevVisitor = await fetchSheetData(`${prevYear}_年間_図表4`);
        
        const parseExpense = (rows) => {
          if (!rows || rows.length < 5) return [];
          return rows.slice(4).map(row => ({
            country: row[0] || '',
            total: parseNumber(row[1]),
            accommodation: parseNumber(row[2]),
            food: parseNumber(row[3]),
            transport: parseNumber(row[4]),
            entertainment: parseNumber(row[5]),
            shopping: parseNumber(row[6]),
            other: parseNumber(row[7])
          })).filter(d => d.country);
        };
        
        const parseVisitor = (rows) => {
          if (!rows || rows.length < 5) return [];
          return rows.slice(4).map(row => ({
            country: row[0] || '',
            perPerson: parseNumber(row[1]),
            visitors: parseNumber(row[2]),
            totalSpend: parseNumber(row[3]),
            avgNights: parseNumber(row[4])
          })).filter(d => d.country);
        };
        
        const parsedExpense = parseExpense(expense);
        const parsedVisitor = parseVisitor(visitor);
        const parsedPrevExpense = parseExpense(prevExpense);
        const parsedPrevVisitor = parseVisitor(prevVisitor);
        
        const merged = parsedExpense.map(exp => {
          const vis = parsedVisitor.find(v => v.country === exp.country) || {};
          return { ...exp, ...vis };
        });
        
        const mergedPrev = parsedPrevExpense.map(exp => {
          const vis = parsedPrevVisitor.find(v => v.country === exp.country) || {};
          return { ...exp, ...vis };
        });
        
        setExpenseData(merged);
        setPreviousExpenseData(mergedPrev);
        
        // 영업 데이터 초기화
        setSalesData({});
        
      } catch (err) {
        console.error(err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [year]);

  // 국가 확장 시 해당 국가의 영업(買物상세) 데이터 로드 - 최신 분기 (Q4) 기준
  const [loadingSales, setLoadingSales] = useState(false);
  
  useEffect(() => {
    const loadSalesData = async () => {
      if (!expandedCountry) return;
      
      // 이미 로드된 데이터가 있으면 스킵
      if (salesData[expandedCountry]) return;
      
      // 영업 시트가 있는 국가 목록
      const salesCountries = ['韓国', '中国', '台湾', '香港', '米国', 'タイ', 'ベトナム', 'オーストラリア', 'シンガポール', 'マレーシア', 'インドネシア', 'フィリピン', 'インド', '英国', 'ドイツ', 'フランス', 'イタリア', 'スペイン', 'ロシア', 'カナダ'];
      if (!salesCountries.includes(expandedCountry)) return;
      
      setLoadingSales(true);
      try {
        await delay(100);
        const rows = await fetchSheetData(`営業_${expandedCountry}`);
        if (!rows || rows.length < 5) {
          setLoadingSales(false);
          return;
        }
        
        // Q4 (최신 분기) 데이터: N(13)=2024年10-12月, O(14)=2025年10-12月, P(15)=伸び率
        // 買物品目의 하위항목만 (11행부터)
        const validItems = ['菓子類', '酒類', '生鮮農産物', 'その他食料品・飲料・たばこ', '化粧品・香水', '医薬品', '健康グッズ・トイレタリー', '衣類', '靴・かばん・革製品', '電気製品', '時計・フィルムカメラ', '宝石・貴金属', '民芸品・伝統工芸品', '本・雑誌・ガイドブックなど', '音楽・映像・ゲームなどソフト', 'その他買物代'];
        
        const countryData = rows.slice(4).map(row => ({
          item: row[0] || '',
          y2024: parseNumber(row[13]),  // N열: 2024年10-12月
          y2025: parseNumber(row[14]),  // O열: 2025年10-12月
          yoy: parseNumber(row[15]?.toString().replace('%', ''))  // P열: 伸び率
        })).filter(d => validItems.includes(d.item) && (d.y2024 > 0 || d.y2025 > 0));
        
        if (countryData.length > 0) {
          setSalesData(prev => ({ ...prev, [expandedCountry]: countryData }));
        }
      } catch (err) {
        console.error(`Error loading sales data for ${expandedCountry}:`, err);
      } finally {
        setLoadingSales(false);
      }
    };
    
    loadSalesData();
  }, [expandedCountry, salesData]);

  const kpiData = useMemo(() => {
    const total = expenseData[0];
    const prev = previousExpenseData.find(d => d.country === '全国籍・地域');
    if (!total) return null;
    
    const shopRatio = total.total ? ((total.shopping / total.total) * 100) : 0;
    const prevShopRatio = prev?.total ? ((prev.shopping / prev.total) * 100) : 0;
    
    return {
      spend: { value: total.total, change: formatChange(total.total, prev?.total) },
      visitors: { value: total.visitors ? (total.visitors / 10000) : 0, change: formatChange(total.visitors, prev?.visitors), note: `平均${total.avgNights || '—'}泊` },
      perPerson: { value: total.perPerson ? (total.perPerson / 10000) : 0, change: formatChange(total.perPerson, prev?.perPerson) },
      shopRatio: { value: shopRatio, change: prevShopRatio ? { percent: shopRatio - prevShopRatio, isPositive: shopRatio >= prevShopRatio } : null }
    };
  }, [expenseData, previousExpenseData]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.title}>インバウンド消費動向</h1>
          <p style={styles.subtitle}>訪日外国人消費統計ダッシュボード</p>
        </div>
      </header>

      <main style={styles.main}>
        {error && <div style={styles.errorBox}>{error}</div>}
        
        {/* 사분기별 추이 차트 - 항상 먼저 표시 */}
        <TrendChart 
          data={trendData} 
          year={year}
          onYearSelect={setYear}
        />

        {/* 년도 선택 - 차트 아래 */}
        <div style={styles.periodSelector}>
          <span style={styles.periodLabel}>年度選択</span>
          <div style={styles.controls}>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={styles.select}>
              <option value="2025">2025年</option>
              <option value="2024">2024年</option>
              <option value="2023">2023年</option>
            </select>
            <span style={styles.periodNote}>※ 選択年度の年間（Q1〜Q4合計）データを表示</span>
          </div>
        </div>

        <InsightsSummary data={expenseData} previousData={previousExpenseData} loading={loading} />

        <nav style={styles.tabs}>
          {[
            { id: 'overview', label: '国別', icon: '🌏' },
            { id: 'matrix', label: 'マトリクス', icon: '📈' },
            { id: 'composition', label: '費目構成', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                {kpiData && (
                  <div style={styles.kpiRow}>
                    <KPICard label="総消費額" value={formatNumber(kpiData.spend.value)} unit="億円" change={kpiData.spend.change} />
                    <KPICard label="訪日客数" value={formatNumber(kpiData.visitors.value, 1)} unit="万人" change={kpiData.visitors.change} note={kpiData.visitors.note} />
                    <KPICard label="客単価" value={formatNumber(kpiData.perPerson.value, 1)} unit="万円" change={kpiData.perPerson.change} />
                    <KPICard label="買物代比率" value={formatNumber(kpiData.shopRatio.value, 1)} unit="%" change={kpiData.shopRatio.change} />
                  </div>
                )}
                <div style={{ marginTop: 24 }}>
                  <CountryList
                    data={expenseData}
                    previousData={previousExpenseData}
                    expandedCountry={expandedCountry}
                    setExpandedCountry={setExpandedCountry}
                    salesData={salesData}
                    loadingSales={loadingSales}
                  />
                </div>
              </>
            )}
            {activeTab === 'matrix' && <MatrixChart data={expenseData} previousData={previousExpenseData} />}
            {activeTab === 'composition' && <CompositionChart data={expenseData} />}
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <span>出典：観光庁「訪日外国人消費動向調査」</span>
        <span>{year}年 年間</span>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
    color: '#1a1a1a',
    lineHeight: 1.6
  },
  header: {
    backgroundColor: '#1a1a1a',
    color: '#fff'
  },
  headerInner: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '32px 20px'
  },
  title: {
    margin: 0,
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: 700,
    letterSpacing: '0.02em'
  },
  subtitle: {
    margin: '8px 0 0',
    fontSize: 13,
    opacity: 0.7,
    fontWeight: 400
  },
  periodSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: '20px 0',
    marginTop: 16,
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 6
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4a5568'
  },
  periodNote: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 8
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  controlItem: {},
  select: {
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  insightBar: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 24px',
    fontSize: 13,
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0'
  },
  insightItem: {},
  insightFlag: {
    marginRight: 4
  },
  insightGrowth: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  insightDecline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  insightTotal: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  insightArrowUp: {
    color: '#16a34a',
    fontWeight: 700
  },
  insightArrowDown: {
    color: '#c41e3a',
    fontWeight: 700
  },
  tabs: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid #e2e8f0'
  },
  tab: {
    padding: '14px 20px',
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    color: '#718096',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  tabIcon: {
    fontSize: 14
  },
  tabActive: {
    color: '#1a1a1a',
    borderBottomColor: '#1a1a1a'
  },
  main: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '24px 20px'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 24
  },
  kpiCard: {
    padding: 20,
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden'
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  kpiIcon: {
    fontSize: 14
  },
  kpiLabel: {
    fontSize: 12,
    color: '#718096'
  },
  kpiValue: {
    fontSize: 'clamp(26px, 5vw, 32px)',
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  kpiUnit: {
    fontSize: 14,
    fontWeight: 500,
    color: '#718096',
    marginLeft: 4
  },
  kpiChange: {
    fontSize: 12,
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  changeArrow: {
    fontWeight: 700
  },
  kpiNote: {
    fontSize: 11,
    color: '#a0aec0',
    marginTop: 4
  },
  listContainer: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 6
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0'
  },
  listTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600
  },
  toggleGroup: {
    display: 'flex',
    gap: 4
  },
  toggleBtn: {
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    backgroundColor: '#fff',
    color: '#718096',
    cursor: 'pointer'
  },
  toggleActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: '#fff'
  },
  countryRow: {
    borderBottom: '1px solid #f0f0f0'
  },
  countryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.1s'
  },
  countryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  rank: {
    width: 22,
    fontSize: 12,
    fontWeight: 600,
    color: '#718096'
  },
  flag: {
    fontSize: 18,
    lineHeight: 1
  },
  regionIndicator: {
    width: 6,
    height: 6,
    borderRadius: '50%'
  },
  countryName: {
    fontSize: 14,
    fontWeight: 500
  },
  countryRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  countryValue: {
    fontSize: 14,
    fontWeight: 600
  },
  changeText: {
    fontSize: 12,
    fontWeight: 500
  },
  expandArrow: {
    fontSize: 10,
    color: '#a0aec0',
    transition: 'transform 0.2s'
  },
  expandedContent: {
    padding: '0 20px 20px',
    backgroundColor: '#fafafa'
  },
  expenseSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#4a5568',
    marginBottom: 12,
    paddingTop: 16
  },
  expenseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12
  },
  expenseItem: {
    padding: 12,
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 4
  },
  expenseLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 4
  },
  expenseIcon: {
    marginRight: 2
  },
  expenseRatio: {
    fontWeight: 600
  },
  expenseValue: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8
  },
  barTrack: {
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    transition: 'width 0.3s'
  },
  salesSection: {
    marginTop: 16
  },
  salesLoading: {
    padding: '20px',
    textAlign: 'center',
    fontSize: 12,
    color: '#718096',
    backgroundColor: '#f7f7f7',
    borderRadius: 4
  },
  salesTable: {
    width: '100%',
    fontSize: 12,
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '10px 8px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
    color: '#4a5568'
  },
  thRight: {
    textAlign: 'right',
    padding: '10px 8px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
    color: '#4a5568'
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #f0f0f0'
  },
  tdRight: {
    textAlign: 'right',
    padding: '10px 8px',
    borderBottom: '1px solid #f0f0f0'
  },
  moreBtn: {
    width: '100%',
    padding: 14,
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#718096',
    cursor: 'pointer'
  },
  regionBlock: {
    borderBottom: '1px solid #e2e8f0'
  },
  regionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    backgroundColor: '#f7f7f7'
  },
  regionIcon: {
    fontSize: 16
  },
  regionName: {
    fontSize: 13,
    fontWeight: 600
  },
  regionTotal: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#718096'
  },
  chartBox: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 24
  },
  chartTitle: {
    margin: '0 0 8px',
    fontSize: 15,
    fontWeight: 600,
    textAlign: 'center'
  },
  chartSubtitle: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
    fontSize: 12,
    color: '#4a5568'
  },
  legendBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#4a90a4',
    fontWeight: 500
  },
  legendLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#c41e3a',
    fontWeight: 500
  },
  yearLabelsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 8,
    marginLeft: 50,
    marginRight: 50
  },
  yearLabelGroup: {
    flex: 1,
    textAlign: 'center',
    position: 'relative'
  },
  yearBracket: {
    position: 'absolute',
    top: -8,
    left: '10%',
    right: '10%',
    height: 6,
    borderLeft: '1px solid #cbd5e0',
    borderRight: '1px solid #cbd5e0',
    borderTop: '1px solid #cbd5e0'
  },
  yearLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#4a5568',
    paddingTop: 4
  },
  chartFootnote: {
    marginTop: 12,
    fontSize: 11,
    color: '#718096',
    textAlign: 'right'
  },
  noDataNote: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
    padding: '8px 12px',
    backgroundColor: '#f7f7f7',
    borderRadius: 4
  },
  noDataMessage: {
    textAlign: 'center',
    padding: 60,
    color: '#a0aec0',
    fontSize: 14
  },
  tooltip: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    padding: 12,
    fontSize: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  legendRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#4a5568'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%'
  },
  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    padding: 60
  },
  spinner: {
    width: 32,
    height: 32,
    border: '2px solid #e2e8f0',
    borderTop: '2px solid #1a1a1a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  errorBox: {
    padding: 16,
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 4,
    color: '#c41e3a',
    fontSize: 13
  },
  footer: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '24px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#a0aec0',
    borderTop: '1px solid #e2e8f0'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap');
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  * { box-sizing: border-box; }
  body { margin: 0; }
`;
document.head.appendChild(styleSheet);
