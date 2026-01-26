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
  '韓国': '🇰🇷',import React, { useState, useEffect, useMemo } from 'react';
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

const fetchSheetData = async (sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
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

const CountryList = ({ data, previousData, expandedCountry, setExpandedCountry, salesData }) => {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState('ranking');
  const INITIAL_COUNT = 5;

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

            {countrySales?.length > 0 && (
              <div style={styles.salesSection}>
                <div style={styles.sectionTitle}>買物品目別 客単価</div>
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
                    {countrySales.slice(0, 6).map((sale, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{sale.item}</td>
                        <td style={styles.tdRight}>{formatNumber(sale.y2024, 0)}円</td>
                        <td style={styles.tdRight}>{formatNumber(sale.y2025, 0)}円</td>
                        <td style={{ ...styles.tdRight, color: sale.yoy >= 100 ? '#1a1a1a' : '#c41e3a' }}>
                          {sale.yoy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

const TrendChart = ({ data }) => {
  if (!data?.length) return null;

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>四半期別推移（2023〜2025年）</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 11, fill: '#4a5568' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#4a5568' }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            label={{ value: '消費額（億円）', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#4a5568' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#c41e3a' }}
            domain={[20, 25]}
            label={{ value: '客単価（万円）', angle: 90, position: 'insideRight', fontSize: 11, fill: '#c41e3a' }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === '消費額') return [`${formatNumber(value)}億円`, name];
              return [`${value.toFixed(1)}万円`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="total" name="消費額" fill="#1a1a1a" radius={[2, 2, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="perPerson" name="客単価" stroke="#c41e3a" strokeWidth={2} dot={{ r: 3, fill: '#c41e3a' }} />
        </ComposedChart>
      </ResponsiveContainer>
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

  // 디버깅용 - 나중에 제거
  console.log('MatrixChart data:', data.slice(0, 3));
  console.log('MatrixChart previousData:', previousData?.slice(0, 3));

  const chartData = data.slice(1).map(item => {
    const prev = previousData?.find(p => p.country === item.country);
    const growth = prev?.total ? ((item.total - prev.total) / prev.total) * 100 : 0;
    const perPerson = item.perPerson ? (item.perPerson / 10000) : (item.visitors ? (item.total * 100000000 / item.visitors) / 10000 : 0);
    
    // 디버깅용 - 한국 데이터 확인
    if (item.country === '韓国' || item.country?.includes('韓')) {
      console.log('Korea data:', { item, prev, growth, perPerson });
    }
    
    return {
      country: item.country,
      growth,
      perPerson,
      total: item.total,
      region: getRegionForCountry(item.country),
      hasPrevData: !!prev?.total
    };
  }).filter(d => d.total > 100 && d.perPerson > 0);

  console.log('MatrixChart chartData:', chartData);

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
  const [quarter, setQuarter] = useState('Q1');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expenseData, setExpenseData] = useState([]);
  const [previousExpenseData, setPreviousExpenseData] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [expense, visitor] = await Promise.all([
          fetchSheetData(`${year}_${quarter}_図表3`),
          fetchSheetData(`${year}_${quarter}_図表4`)
        ]);
        
        const prevYear = String(parseInt(year) - 1);
        const [prevExpense, prevVisitor] = await Promise.all([
          fetchSheetData(`${prevYear}_${quarter}_図表3`),
          fetchSheetData(`${prevYear}_${quarter}_図表4`)
        ]);
        
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
        
        const salesCountries = ['韓国', '中国', '台湾', '香港', '米国', 'タイ', 'ベトナム', 'オーストラリア', 'シンガポール'];
        // 실제 비용 항목 리스트 (이것만 추출)
        const validItems = ['宿泊費', '飲食費', '交通費', '娯楽等サービス費', '買物代', '菓子類', '酒類', '化粧品・香水', '医薬品・健康グッズ', '衣類', 'カバン・靴', '電気製品', 'マンガ・アニメ関連商品', 'その他買物代'];
        const salesResults = await Promise.all(
          salesCountries.map(async (country) => {
            const rows = await fetchSheetData(`営業_${country}`);
            if (!rows || rows.length < 2) return { country, data: [] };
            return {
              country,
              data: rows.map(row => ({
                item: row[0] || '',
                y2024: parseNumber(row[1]),
                y2025: parseNumber(row[2]),
                yoy: parseNumber(row[3])
              })).filter(d => validItems.includes(d.item) && d.y2024 > 0)
            };
          })
        );
        
        const salesMap = {};
        salesResults.forEach(r => { if (r.data.length) salesMap[r.country] = r.data; });
        setSalesData(salesMap);
        
        // 분기별 추이 데이터 로드 (2023~2025년)
        const quarters = [];
        for (const y of ['2023', '2024', '2025']) {
          for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
            quarters.push({ year: y, quarter: q, label: `${y.slice(2)}/${q}` });
          }
        }
        
        const trendResults = await Promise.all(
          quarters.map(async ({ year, quarter, label }) => {
            const [exp, vis] = await Promise.all([
              fetchSheetData(`${year}_${quarter}_図表3`),
              fetchSheetData(`${year}_${quarter}_図表4`)
            ]);
            
            if (!exp || exp.length < 5) return null;
            
            const totalRow = exp[4]; // 全国籍・地域 행
            const visitorRow = vis && vis.length >= 5 ? vis[4] : null;
            
            return {
              label,
              total: parseNumber(totalRow?.[1]) || 0,
              perPerson: visitorRow ? (parseNumber(visitorRow[1]) / 10000) : 0
            };
          })
        );
        
        setTrendData(trendResults.filter(d => d && d.total > 0));
        
      } catch (err) {
        console.error(err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [year, quarter]);

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

      <div style={styles.controls}>
        <div style={styles.controlItem}>
          <select value={year} onChange={(e) => setYear(e.target.value)} style={styles.select}>
            <option value="2025">2025年</option>
            <option value="2024">2024年</option>
          </select>
        </div>
        <div style={styles.quarterGroup}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              style={{ ...styles.quarterBtn, ...(quarter === q ? styles.quarterActive : {}) }}
            >
              {q}
            </button>
          ))}
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

      <main style={styles.main}>
        {error && <div style={styles.errorBox}>{error}</div>}
        
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
                <TrendChart data={trendData} />
                <div style={{ marginTop: 24 }}>
                  <CountryList
                    data={expenseData}
                    previousData={previousExpenseData}
                    expandedCountry={expandedCountry}
                    setExpandedCountry={setExpandedCountry}
                    salesData={salesData}
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
        <span>{year}年 {quarter}</span>
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
  controls: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    borderBottom: '1px solid #e2e8f0'
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
  quarterGroup: {
    display: 'flex',
    gap: 4
  },
  quarterBtn: {
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    backgroundColor: '#fff',
    color: '#4a5568',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  quarterActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: '#fff'
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
  salesSection: {},
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
    margin: '0 0 20px',
    fontSize: 15,
    fontWeight: 600
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

const fetchSheetData = async (sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
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

const CountryList = ({ data, previousData, expandedCountry, setExpandedCountry, salesData }) => {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState('ranking');
  const INITIAL_COUNT = 5;

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

            {countrySales?.length > 0 && (
              <div style={styles.salesSection}>
                <div style={styles.sectionTitle}>買物品目別 客単価</div>
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
                    {countrySales.slice(0, 6).map((sale, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>{sale.item}</td>
                        <td style={styles.tdRight}>{formatNumber(sale.y2024, 0)}円</td>
                        <td style={styles.tdRight}>{formatNumber(sale.y2025, 0)}円</td>
                        <td style={{ ...styles.tdRight, color: sale.yoy >= 100 ? '#1a1a1a' : '#c41e3a' }}>
                          {sale.yoy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

const TrendChart = ({ data }) => {
  if (!data?.length) return null;

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>四半期別推移（2023〜2025年）</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 11, fill: '#4a5568' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#4a5568' }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            label={{ value: '消費額（億円）', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#4a5568' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#c41e3a' }}
            domain={[20, 25]}
            label={{ value: '客単価（万円）', angle: 90, position: 'insideRight', fontSize: 11, fill: '#c41e3a' }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === '消費額') return [`${formatNumber(value)}億円`, name];
              return [`${value.toFixed(1)}万円`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="total" name="消費額" fill="#1a1a1a" radius={[2, 2, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="perPerson" name="客単価" stroke="#c41e3a" strokeWidth={2} dot={{ r: 3, fill: '#c41e3a' }} />
        </ComposedChart>
      </ResponsiveContainer>
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
    const perPerson = item.visitors ? (item.total * 100000000 / item.visitors) / 10000 : 0;
    return {
      country: item.country,
      growth,
      perPerson,
      total: item.total,
      region: getRegionForCountry(item.country)
    };
  }).filter(d => d.total > 100);

  return (
    <div style={styles.chartBox}>
      <h3 style={styles.chartTitle}>成長率 × 客単価</h3>
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
                  <div>成長率: {d.growth >= 0 ? '+' : ''}{d.growth.toFixed(1)}%</div>
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
  const [quarter, setQuarter] = useState('Q1');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expenseData, setExpenseData] = useState([]);
  const [previousExpenseData, setPreviousExpenseData] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [expense, visitor] = await Promise.all([
          fetchSheetData(`${year}_${quarter}_図表3`),
          fetchSheetData(`${year}_${quarter}_図表4`)
        ]);
        
        const prevYear = String(parseInt(year) - 1);
        const [prevExpense, prevVisitor] = await Promise.all([
          fetchSheetData(`${prevYear}_${quarter}_図表3`),
          fetchSheetData(`${prevYear}_${quarter}_図表4`)
        ]);
        
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
        
        const salesCountries = ['韓国', '中国', '台湾', '香港', '米国', 'タイ', 'ベトナム', 'オーストラリア', 'シンガポール'];
        // 실제 비용 항목 리스트 (이것만 추출)
        const validItems = ['宿泊費', '飲食費', '交通費', '娯楽等サービス費', '買物代', '菓子類', '酒類', '化粧品・香水', '医薬品・健康グッズ', '衣類', 'カバン・靴', '電気製品', 'マンガ・アニメ関連商品', 'その他買物代'];
        const salesResults = await Promise.all(
          salesCountries.map(async (country) => {
            const rows = await fetchSheetData(`営業_${country}`);
            if (!rows || rows.length < 2) return { country, data: [] };
            return {
              country,
              data: rows.map(row => ({
                item: row[0] || '',
                y2024: parseNumber(row[1]),
                y2025: parseNumber(row[2]),
                yoy: parseNumber(row[3])
              })).filter(d => validItems.includes(d.item) && d.y2024 > 0)
            };
          })
        );
        
        const salesMap = {};
        salesResults.forEach(r => { if (r.data.length) salesMap[r.country] = r.data; });
        setSalesData(salesMap);
        
        // 분기별 추이 데이터 로드 (2023~2025년)
        const quarters = [];
        for (const y of ['2023', '2024', '2025']) {
          for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
            quarters.push({ year: y, quarter: q, label: `${y.slice(2)}/${q}` });
          }
        }
        
        const trendResults = await Promise.all(
          quarters.map(async ({ year, quarter, label }) => {
            const [exp, vis] = await Promise.all([
              fetchSheetData(`${year}_${quarter}_図表3`),
              fetchSheetData(`${year}_${quarter}_図表4`)
            ]);
            
            if (!exp || exp.length < 5) return null;
            
            const totalRow = exp[4]; // 全国籍・地域 행
            const visitorRow = vis && vis.length >= 5 ? vis[4] : null;
            
            return {
              label,
              total: parseNumber(totalRow?.[1]) || 0,
              perPerson: visitorRow ? (parseNumber(visitorRow[1]) / 10000) : 0
            };
          })
        );
        
        setTrendData(trendResults.filter(d => d && d.total > 0));
        
      } catch (err) {
        console.error(err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [year, quarter]);

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

      <div style={styles.controls}>
        <div style={styles.controlItem}>
          <select value={year} onChange={(e) => setYear(e.target.value)} style={styles.select}>
            <option value="2025">2025年</option>
            <option value="2024">2024年</option>
          </select>
        </div>
        <div style={styles.quarterGroup}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              style={{ ...styles.quarterBtn, ...(quarter === q ? styles.quarterActive : {}) }}
            >
              {q}
            </button>
          ))}
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

      <main style={styles.main}>
        {error && <div style={styles.errorBox}>{error}</div>}
        
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
                <TrendChart data={trendData} />
                <div style={{ marginTop: 24 }}>
                  <CountryList
                    data={expenseData}
                    previousData={previousExpenseData}
                    expandedCountry={expandedCountry}
                    setExpandedCountry={setExpandedCountry}
                    salesData={salesData}
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
        <span>{year}年 {quarter}</span>
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
  controls: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    borderBottom: '1px solid #e2e8f0'
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
  quarterGroup: {
    display: 'flex',
    gap: 4
  },
  quarterBtn: {
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    borderRadius: 4,
    backgroundColor: '#fff',
    color: '#4a5568',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  quarterActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
    color: '#fff'
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
  salesSection: {},
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
    margin: '0 0 20px',
    fontSize: 15,
    fontWeight: 600
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
