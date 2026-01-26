import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, ComposedChart, Area,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie
} from 'recharts';

// ===== 설정 =====
const SHEET_ID = '1hF1Z-3LLgzzzFwc66xVqEXszNm3qSH8Xwl6DT01dQRs';
const API_KEY = 'AIzaSyAs_UERCv_a4ZCfrZI2XvThGMFPFRkStO0';

// ===== 지역별 그룹핑 (개선사항 #3) =====
const REGION_GROUPS = {
  '東アジア': ['韓国', '台湾', '香港', '中国'],
  '東南アジア': ['タイ', 'シンガポール', 'マレーシア', 'インドネシア', 'フィリピン', 'ベトナム'],
  '欧米豪': ['米国', 'カナダ', '英国', 'ドイツ', 'フランス', 'イタリア', 'スペイン', 'オーストラリア', 'ロシア'],
  'その他': ['インド', 'その他']
};

const REGION_COLORS = {
  '東アジア': '#3B82F6',
  '東南アジア': '#10B981',
  '欧米豪': '#8B5CF6',
  'その他': '#6B7280'
};

// 국가별 색상 (차트용)
const COUNTRY_COLORS = {
  '韓国': '#3B82F6', '台湾': '#60A5FA', '香港': '#93C5FD', '中国': '#1D4ED8',
  'タイ': '#10B981', 'シンガポール': '#34D399', 'マレーシア': '#6EE7B7',
  'インドネシア': '#059669', 'フィリピン': '#047857', 'ベトナム': '#065F46',
  '米国': '#8B5CF6', 'カナダ': '#A78BFA', '英国': '#C4B5FD',
  'ドイツ': '#7C3AED', 'フランス': '#6D28D9', 'オーストラリア': '#5B21B6',
  'イタリア': '#4C1D95', 'スペイン': '#DDD6FE', 'ロシア': '#EDE9FE',
  'インド': '#F59E0B', 'その他': '#6B7280'
};

// ===== 유틸리티 함수 =====
const parseNumber = (str) => {
  if (!str) return 0;
  const cleaned = String(str).replace(/,/g, '').replace(/円/g, '').replace(/泊/g, '').replace(/人/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const formatNumber = (num, unit = '') => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  if (Math.abs(num) >= 10000) {
    return (num / 10000).toFixed(1) + '兆' + unit;
  }
  if (Math.abs(num) >= 1) {
    return num.toLocaleString('ja-JP', { maximumFractionDigits: 1 }) + unit;
  }
  return num.toFixed(1) + unit;
};

const formatPercent = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const sign = num > 0 ? '+' : '';
  return sign + num.toFixed(1) + '%';
};

// 전년 대비 변화 표시 (개선사항 #6)
const formatChange = (current, previous, unit = '') => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const diff = current - previous;
  return {
    percent: change,
    diff: diff,
    text: `${formatPercent(change)} (${diff >= 0 ? '+' : ''}${formatNumber(diff)}${unit})`
  };
};

// 국가가 속한 지역 찾기
const getRegionForCountry = (country) => {
  for (const [region, countries] of Object.entries(REGION_GROUPS)) {
    if (countries.includes(country)) return region;
  }
  return 'その他';
};

// ===== Google Sheets API =====
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

// ===== 인사이트 요약 컴포넌트 (개선사항 #1) =====
const InsightsSummary = ({ data, previousData, loading }) => {
  const insights = useMemo(() => {
    if (!data || data.length === 0 || !previousData || previousData.length === 0) return [];
    
    const results = [];
    
    // 전년 대비 변화율 계산
    const changes = data.slice(1).map(item => {
      const prevItem = previousData.find(p => p.country === item.country);
      if (!prevItem || !prevItem.total || prevItem.total === 0) return null;
      return {
        country: item.country,
        currentTotal: item.total,
        previousTotal: prevItem.total,
        change: ((item.total - prevItem.total) / prevItem.total) * 100,
        region: getRegionForCountry(item.country)
      };
    }).filter(Boolean);
    
    // 가장 큰 성장
    const maxGrowth = changes.reduce((max, c) => c.change > max.change ? c : max, { change: -Infinity });
    if (maxGrowth.change > 10) {
      results.push({
        type: 'growth',
        icon: '🚀',
        title: `${maxGrowth.country} 폭발 성장`,
        value: formatPercent(maxGrowth.change),
        description: `전년 대비 소비액 급증`,
        color: '#10B981'
      });
    }
    
    // 가장 큰 하락
    const maxDecline = changes.reduce((min, c) => c.change < min.change ? c : min, { change: Infinity });
    if (maxDecline.change < -10) {
      results.push({
        type: 'decline',
        icon: '📉',
        title: `${maxDecline.country} 급감`,
        value: formatPercent(maxDecline.change),
        description: `전년 대비 소비액 감소`,
        color: '#EF4444'
      });
    }
    
    // 전체 시장 동향
    const totalCurrent = data[0]?.total || 0;
    const totalPrevious = previousData.find(p => p.country === '全国籍・地域')?.total || 0;
    if (totalPrevious > 0) {
      const totalChange = ((totalCurrent - totalPrevious) / totalPrevious) * 100;
      results.push({
        type: 'total',
        icon: totalChange >= 0 ? '📈' : '📉',
        title: '전체 인바운드 시장',
        value: formatPercent(totalChange),
        description: `총 소비액 ${formatNumber(totalCurrent)}억엔`,
        color: totalChange >= 0 ? '#3B82F6' : '#F59E0B'
      });
    }
    
    // 지역별 트렌드
    const regionTotals = {};
    const prevRegionTotals = {};
    
    changes.forEach(c => {
      if (!regionTotals[c.region]) regionTotals[c.region] = 0;
      regionTotals[c.region] += c.currentTotal;
    });
    
    previousData.slice(1).forEach(p => {
      const region = getRegionForCountry(p.country);
      if (!prevRegionTotals[region]) prevRegionTotals[region] = 0;
      prevRegionTotals[region] += p.total || 0;
    });
    
    // 가장 성장한 지역
    let maxRegionGrowth = { region: '', change: -Infinity };
    Object.keys(regionTotals).forEach(region => {
      if (prevRegionTotals[region] > 0) {
        const change = ((regionTotals[region] - prevRegionTotals[region]) / prevRegionTotals[region]) * 100;
        if (change > maxRegionGrowth.change) {
          maxRegionGrowth = { region, change };
        }
      }
    });
    
    if (maxRegionGrowth.change > 5) {
      results.push({
        type: 'region',
        icon: '🌏',
        title: `${maxRegionGrowth.region} 강세`,
        value: formatPercent(maxRegionGrowth.change),
        description: '지역 전체 성장률',
        color: REGION_COLORS[maxRegionGrowth.region] || '#6B7280'
      });
    }
    
    return results.slice(0, 4);
  }, [data, previousData]);

  if (loading) {
    return (
      <div style={styles.insightsContainer}>
        <div style={styles.insightsHeader}>
          <span style={styles.insightsIcon}>💡</span>
          <span style={styles.insightsTitle}>핵심 인사이트</span>
        </div>
        <div style={styles.insightsLoading}>데이터 분석 중...</div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div style={styles.insightsContainer}>
      <div style={styles.insightsHeader}>
        <span style={styles.insightsIcon}>💡</span>
        <span style={styles.insightsTitle}>핵심 인사이트</span>
      </div>
      <div style={styles.insightsGrid}>
        {insights.map((insight, idx) => (
          <div key={idx} style={{...styles.insightCard, borderLeftColor: insight.color}}>
            <div style={styles.insightIcon}>{insight.icon}</div>
            <div style={styles.insightContent}>
              <div style={styles.insightTitle}>{insight.title}</div>
              <div style={{...styles.insightValue, color: insight.color}}>{insight.value}</div>
              <div style={styles.insightDesc}>{insight.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== KPI 카드 컴포넌트 (개선사항 #6 - 맥락 추가) =====
const KPICard = ({ title, value, unit, icon, change, subtitle }) => (
  <div style={styles.kpiCard}>
    <div style={styles.kpiHeader}>
      <span style={styles.kpiIcon}>{icon}</span>
      <span style={styles.kpiTitle}>{title}</span>
    </div>
    <div style={styles.kpiValue}>
      {value}<span style={styles.kpiUnit}>{unit}</span>
    </div>
    {change && (
      <div style={{
        ...styles.kpiChange,
        color: change.percent >= 0 ? '#10B981' : '#EF4444'
      }}>
        {change.percent >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(change.percent))} 전년비
      </div>
    )}
    {subtitle && <div style={styles.kpiSubtitle}>{subtitle}</div>}
  </div>
);

// ===== 국가 리스트 컴포넌트 (개선사항 #5 - 더보기/접기) =====
const CountryList = ({ data, previousData, expandedCountry, setExpandedCountry, salesData }) => {
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState('region'); // 'region' or 'ranking'
  const INITIAL_SHOW = 5;

  // 데이터를 지역별로 그룹화
  const groupedByRegion = useMemo(() => {
    if (!data || data.length <= 1) return {};
    
    const groups = {};
    data.slice(1).forEach(item => {
      const region = getRegionForCountry(item.country);
      if (!groups[region]) groups[region] = [];
      groups[region].push(item);
    });
    
    // 각 지역 내에서 소비액 순으로 정렬
    Object.keys(groups).forEach(region => {
      groups[region].sort((a, b) => (b.total || 0) - (a.total || 0));
    });
    
    return groups;
  }, [data]);

  // 소비액 순 랭킹
  const rankedData = useMemo(() => {
    if (!data || data.length <= 1) return [];
    return [...data.slice(1)].sort((a, b) => (b.total || 0) - (a.total || 0));
  }, [data]);

  const displayData = showAll ? rankedData : rankedData.slice(0, INITIAL_SHOW);

  const getPreviousData = (country) => {
    return previousData?.find(p => p.country === country);
  };

  const renderCountryCard = (item, rank) => {
    const prev = getPreviousData(item.country);
    const change = prev ? formatChange(item.total, prev.total, '億円') : null;
    const region = getRegionForCountry(item.country);
    const isExpanded = expandedCountry === item.country;
    const countrySales = salesData?.[item.country];

    return (
      <div key={item.country} style={styles.countryCard}>
        <div 
          style={styles.countryHeader}
          onClick={() => setExpandedCountry(isExpanded ? null : item.country)}
        >
          <div style={styles.countryLeft}>
            {viewMode === 'ranking' && (
              <span style={{
                ...styles.rankBadge,
                backgroundColor: rank <= 3 ? '#F59E0B' : '#E5E7EB',
                color: rank <= 3 ? '#FFF' : '#374151'
              }}>
                {rank}
              </span>
            )}
            <span style={{
              ...styles.regionDot,
              backgroundColor: REGION_COLORS[region]
            }} />
            <span style={styles.countryName}>{item.country}</span>
            <span style={styles.regionTag}>{region}</span>
          </div>
          <div style={styles.countryRight}>
            <div style={styles.countryTotal}>
              {formatNumber(item.total)}億円
              {change && (
                <span style={{
                  ...styles.changeIndicator,
                  color: change.percent >= 0 ? '#10B981' : '#EF4444'
                }}>
                  {formatPercent(change.percent)}
                </span>
              )}
            </div>
            <span style={{
              ...styles.expandIcon,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>▼</span>
          </div>
        </div>
        
        {isExpanded && (
          <div style={styles.countryDetail}>
            {/* 費目別 상세 */}
            <div style={styles.detailSection}>
              <h4 style={styles.detailTitle}>費目別 消費額</h4>
              <div style={styles.expenseGrid}>
                {[
                  { key: 'accommodation', label: '宿泊費', icon: '🏨' },
                  { key: 'food', label: '飲食費', icon: '🍽️' },
                  { key: 'transport', label: '交通費', icon: '🚃' },
                  { key: 'entertainment', label: '娯楽費', icon: '🎭' },
                  { key: 'shopping', label: '買物代', icon: '🛍️' },
                  { key: 'other', label: 'その他', icon: '📦' }
                ].map(exp => {
                  const value = item[exp.key] || 0;
                  const prevValue = prev?.[exp.key] || 0;
                  const expChange = prevValue ? formatChange(value, prevValue, '億円') : null;
                  const ratio = item.total ? ((value / item.total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={exp.key} style={styles.expenseItem}>
                      <div style={styles.expenseHeader}>
                        <span>{exp.icon} {exp.label}</span>
                        <span style={styles.expenseRatio}>{ratio}%</span>
                      </div>
                      <div style={styles.expenseValue}>
                        {formatNumber(value)}億円
                        {expChange && (
                          <span style={{
                            fontSize: '11px',
                            marginLeft: '6px',
                            color: expChange.percent >= 0 ? '#10B981' : '#EF4444'
                          }}>
                            {formatPercent(expChange.percent)}
                          </span>
                        )}
                      </div>
                      <div style={styles.expenseBar}>
                        <div style={{
                          ...styles.expenseBarFill,
                          width: `${ratio}%`,
                          backgroundColor: COUNTRY_COLORS[item.country] || '#3B82F6'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 買物品目別 (영업 시트 데이터) */}
            {countrySales && countrySales.length > 0 && (
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>買物品目別 客単価</h4>
                <div style={styles.salesTable}>
                  <div style={styles.salesHeader}>
                    <span>品目</span>
                    <span>2024年</span>
                    <span>2025年</span>
                    <span>前年比</span>
                  </div>
                  {countrySales.slice(0, 6).map((sale, idx) => (
                    <div key={idx} style={styles.salesRow}>
                      <span>{sale.item}</span>
                      <span>{formatNumber(sale.y2024)}円</span>
                      <span>{formatNumber(sale.y2025)}円</span>
                      <span style={{
                        color: sale.yoy >= 100 ? '#10B981' : '#EF4444'
                      }}>
                        {sale.yoy}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.countryListContainer}>
      <div style={styles.listHeader}>
        <h3 style={styles.listTitle}>国家別 詳細データ</h3>
        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.toggleBtn,
              backgroundColor: viewMode === 'ranking' ? '#3B82F6' : '#F3F4F6',
              color: viewMode === 'ranking' ? '#FFF' : '#374151'
            }}
            onClick={() => setViewMode('ranking')}
          >
            📊 랭킹순
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              backgroundColor: viewMode === 'region' ? '#3B82F6' : '#F3F4F6',
              color: viewMode === 'region' ? '#FFF' : '#374151'
            }}
            onClick={() => setViewMode('region')}
          >
            🌏 지역별
          </button>
        </div>
      </div>

      {viewMode === 'ranking' ? (
        <>
          {displayData.map((item, idx) => renderCountryCard(item, idx + 1))}
          {rankedData.length > INITIAL_SHOW && (
            <button
              style={styles.showMoreBtn}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? '접기 ▲' : `더보기 (${rankedData.length - INITIAL_SHOW}개국) ▼`}
            </button>
          )}
        </>
      ) : (
        Object.entries(REGION_GROUPS).map(([region, countries]) => {
          const regionData = groupedByRegion[region];
          if (!regionData || regionData.length === 0) return null;
          
          const regionTotal = regionData.reduce((sum, d) => sum + (d.total || 0), 0);
          
          return (
            <div key={region} style={styles.regionGroup}>
              <div style={styles.regionHeader}>
                <span style={{
                  ...styles.regionDot,
                  backgroundColor: REGION_COLORS[region]
                }} />
                <span style={styles.regionName}>{region}</span>
                <span style={styles.regionTotal}>{formatNumber(regionTotal)}億円</span>
              </div>
              <div style={styles.regionCountries}>
                {regionData.map((item, idx) => renderCountryCard(item, idx + 1))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ===== 분기별 추이 차트 =====
const QuarterlyTrendChart = ({ quarterlyData }) => {
  if (!quarterlyData || quarterlyData.length === 0) return null;

  return (
    <div style={styles.chartContainer}>
      <h3 style={styles.chartTitle}>📈 分期別 推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={quarterlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => [formatNumber(value), name]}
            contentStyle={styles.tooltipStyle}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="total" name="総消費額(億円)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="visitors" name="訪日客数(万人)" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// ===== 費目構成 100% 스택 바 =====
const ExpenseCompositionChart = ({ data }) => {
  if (!data || data.length <= 1) return null;

  const chartData = data.slice(1, 11).map(item => ({
    country: item.country,
    宿泊費: item.total ? ((item.accommodation / item.total) * 100).toFixed(1) : 0,
    飲食費: item.total ? ((item.food / item.total) * 100).toFixed(1) : 0,
    交通費: item.total ? ((item.transport / item.total) * 100).toFixed(1) : 0,
    娯楽費: item.total ? ((item.entertainment / item.total) * 100).toFixed(1) : 0,
    買物代: item.total ? ((item.shopping / item.total) * 100).toFixed(1) : 0,
    その他: item.total ? ((item.other / item.total) * 100).toFixed(1) : 0
  }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

  return (
    <div style={styles.chartContainer}>
      <h3 style={styles.chartTitle}>📊 費目構成比 (100%スタック)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis dataKey="country" type="category" width={80} tick={{ fontSize: 11 }} />
          <Tooltip 
            formatter={(value) => `${value}%`}
            contentStyle={styles.tooltipStyle}
          />
          <Legend />
          {['宿泊費', '飲食費', '交通費', '娯楽費', '買物代', 'その他'].map((key, idx) => (
            <Bar key={key} dataKey={key} stackId="a" fill={colors[idx]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ===== 매트릭스 버블 차트 =====
const MatrixChart = ({ data, previousData }) => {
  if (!data || data.length <= 1) return null;

  const chartData = data.slice(1).map(item => {
    const prev = previousData?.find(p => p.country === item.country);
    const growth = prev && prev.total ? ((item.total - prev.total) / prev.total) * 100 : 0;
    const perPerson = item.visitors ? (item.total * 100000000 / item.visitors) : 0;
    
    return {
      country: item.country,
      growth: growth,
      perPerson: perPerson / 10000, // 만엔 단위
      total: item.total,
      region: getRegionForCountry(item.country)
    };
  }).filter(d => d.total > 100); // 100억엔 이상만

  return (
    <div style={styles.chartContainer}>
      <h3 style={styles.chartTitle}>📍 成長率 × 客単価 マトリクス</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            type="number" 
            dataKey="growth" 
            name="成長率" 
            unit="%" 
            tick={{ fontSize: 11 }}
            label={{ value: '成長率 (%)', position: 'bottom', fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="perPerson" 
            name="客単価" 
            unit="万円"
            tick={{ fontSize: 11 }}
            label={{ value: '客単価 (万円)', angle: -90, position: 'left', fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="total" range={[100, 1000]} />
          <Tooltip 
            content={({ payload }) => {
              if (!payload || !payload[0]) return null;
              const d = payload[0].payload;
              return (
                <div style={styles.tooltipStyle}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{d.country}</div>
                  <div>成長率: {d.growth.toFixed(1)}%</div>
                  <div>客単価: {d.perPerson.toFixed(1)}万円</div>
                  <div>総消費額: {formatNumber(d.total)}億円</div>
                </div>
              );
            }}
          />
          <Scatter data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={REGION_COLORS[entry.region] || '#6B7280'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div style={styles.legendGrid}>
        {Object.entries(REGION_COLORS).map(([region, color]) => (
          <div key={region} style={styles.legendItem}>
            <span style={{...styles.legendDot, backgroundColor: color}} />
            <span>{region}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== 메인 앱 =====
export default function App() {
  const [year, setYear] = useState('2025');
  const [quarter, setQuarter] = useState('Q1');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expenseData, setExpenseData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [previousExpenseData, setPreviousExpenseData] = useState([]);
  const [previousVisitorData, setPreviousVisitorData] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [expandedCountry, setExpandedCountry] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 현재 분기 데이터
        const [expense, visitor] = await Promise.all([
          fetchSheetData(`${year}_${quarter}_図表3`),
          fetchSheetData(`${year}_${quarter}_図表4`)
        ]);
        
        // 전년 동기 데이터
        const prevYear = String(parseInt(year) - 1);
        const [prevExpense, prevVisitor] = await Promise.all([
          fetchSheetData(`${prevYear}_${quarter}_図表3`),
          fetchSheetData(`${prevYear}_${quarter}_図表4`)
        ]);
        
        // 図表3 파싱 (費目別消費額)
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
        
        // 図表4 파싱 (訪日客数・客単価)
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
        
        // 데이터 병합
        const mergedData = parsedExpense.map(exp => {
          const vis = parsedVisitor.find(v => v.country === exp.country) || {};
          return { ...exp, ...vis };
        });
        
        const mergedPrevData = parsedPrevExpense.map(exp => {
          const vis = parsedPrevVisitor.find(v => v.country === exp.country) || {};
          return { ...exp, ...vis };
        });
        
        setExpenseData(mergedData);
        setPreviousExpenseData(mergedPrevData);
        setVisitorData(parsedVisitor);
        setPreviousVisitorData(parsedPrevVisitor);
        
        // 영업 시트 데이터 로드
        const salesCountries = ['韓国', '中国', '台湾', '香港', '米国', 'タイ', 'ベトナム', 'オーストラリア', 'シンガポール'];
        const salesPromises = salesCountries.map(async (country) => {
          const rows = await fetchSheetData(`営業_${country}`);
          if (!rows || rows.length < 2) return { country, data: [] };
          return {
            country,
            data: rows.slice(1).map(row => ({
              item: row[0] || '',
              y2024: parseNumber(row[1]),
              y2025: parseNumber(row[2]),
              yoy: parseNumber(row[3])
            })).filter(d => d.item)
          };
        });
        
        const salesResults = await Promise.all(salesPromises);
        const salesMap = {};
        salesResults.forEach(r => {
          if (r.data.length > 0) salesMap[r.country] = r.data;
        });
        setSalesData(salesMap);
        
      } catch (err) {
        console.error('Data load error:', err);
        setError('데이터 로드 실패. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [year, quarter]);

  // KPI 계산
  const kpiData = useMemo(() => {
    const total = expenseData[0];
    const prevTotal = previousExpenseData.find(d => d.country === '全国籍・地域');
    
    if (!total) return null;
    
    const shoppingRatio = total.total ? ((total.shopping / total.total) * 100) : 0;
    const prevShoppingRatio = prevTotal?.total ? ((prevTotal.shopping / prevTotal.total) * 100) : 0;
    
    return {
      totalSpend: {
        value: total.total,
        change: formatChange(total.total, prevTotal?.total, '億円'),
        subtitle: '全国籍・地域 合計'
      },
      visitors: {
        value: total.visitors ? (total.visitors / 10000).toFixed(1) : '-',
        change: prevTotal?.visitors ? formatChange(total.visitors, prevTotal.visitors) : null,
        subtitle: `平均泊数 ${total.avgNights || '-'}泊`
      },
      perPerson: {
        value: total.perPerson ? (total.perPerson / 10000).toFixed(1) : '-',
        change: prevTotal?.perPerson ? formatChange(total.perPerson, prevTotal.perPerson, '円') : null,
        subtitle: '1人当たり旅行支出'
      },
      shoppingRatio: {
        value: shoppingRatio.toFixed(1),
        change: prevShoppingRatio ? { percent: shoppingRatio - prevShoppingRatio, diff: shoppingRatio - prevShoppingRatio } : null,
        subtitle: '総消費額に占める割合'
      }
    };
  }, [expenseData, previousExpenseData]);

  // 분기별 추이 데이터 (모든 분기)
  const quarterlyTrendData = useMemo(() => {
    // 실제로는 모든 분기 데이터를 로드해야 하지만, 
    // 여기서는 현재 데이터만 표시
    if (!expenseData[0]) return [];
    return [{
      quarter: `${year} ${quarter}`,
      total: expenseData[0].total,
      visitors: expenseData[0].visitors ? expenseData[0].visitors / 10000 : 0
    }];
  }, [expenseData, year, quarter]);

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* 인사이트 요약 (개선사항 #1) */}
            <InsightsSummary 
              data={expenseData} 
              previousData={previousExpenseData}
              loading={loading}
            />
            
            {/* KPI 카드 (개선사항 #6) */}
            {kpiData && (
              <div style={styles.kpiGrid}>
                <KPICard 
                  title="総消費額" 
                  value={formatNumber(kpiData.totalSpend.value)} 
                  unit="億円" 
                  icon="💰"
                  change={kpiData.totalSpend.change}
                  subtitle={kpiData.totalSpend.subtitle}
                />
                <KPICard 
                  title="訪日客数" 
                  value={kpiData.visitors.value} 
                  unit="万人" 
                  icon="✈️"
                  change={kpiData.visitors.change}
                  subtitle={kpiData.visitors.subtitle}
                />
                <KPICard 
                  title="客単価" 
                  value={kpiData.perPerson.value} 
                  unit="万円" 
                  icon="👤"
                  change={kpiData.perPerson.change}
                  subtitle={kpiData.perPerson.subtitle}
                />
                <KPICard 
                  title="買物代比率" 
                  value={kpiData.shoppingRatio.value} 
                  unit="%" 
                  icon="🛍️"
                  change={kpiData.shoppingRatio.change}
                  subtitle={kpiData.shoppingRatio.subtitle}
                />
              </div>
            )}
            
            {/* 국가 리스트 (개선사항 #3, #5) */}
            <CountryList
              data={expenseData}
              previousData={previousExpenseData}
              expandedCountry={expandedCountry}
              setExpandedCountry={setExpandedCountry}
              salesData={salesData}
            />
          </>
        );
      
      case 'matrix':
        return (
          <MatrixChart 
            data={expenseData} 
            previousData={previousExpenseData}
          />
        );
      
      case 'composition':
        return (
          <ExpenseCompositionChart data={expenseData} />
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🇯🇵 インバウンド消費統計</h1>
        <p style={styles.headerSubtitle}>訪日外国人消費動向調査ダッシュボード</p>
      </header>

      {/* 컨트롤 바 */}
      <div style={styles.controlBar}>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>年度</label>
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            style={styles.select}
          >
            <option value="2025">2025年</option>
            <option value="2024">2024年</option>
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>四半期</label>
          <div style={styles.quarterButtons}>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <button
                key={q}
                onClick={() => setQuarter(q)}
                style={{
                  ...styles.quarterBtn,
                  backgroundColor: quarter === q ? '#3B82F6' : '#F3F4F6',
                  color: quarter === q ? '#FFF' : '#374151'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={styles.tabNav}>
        {[
          { id: 'overview', label: '国家別', icon: '🌏' },
          { id: 'matrix', label: 'マトリクス', icon: '📍' },
          { id: 'composition', label: '費目構成', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === tab.id ? '#3B82F6' : 'transparent',
              color: activeTab === tab.id ? '#FFF' : '#6B7280'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 메인 컨텐츠 */}
      <main style={styles.main}>
        {error && <div style={styles.errorBox}>{error}</div>}
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p>データを読み込み中...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      {/* 푸터 */}
      <footer style={styles.footer}>
        <p>データソース: 観光庁「訪日外国人消費動向調査」</p>
        <p>最終更新: {year}年 {quarter}</p>
      </footer>
    </div>
  );
}

// ===== 스타일 (개선사항 #4 - 모바일 최적화) =====
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    color: '#FFF',
    padding: '24px 16px',
    textAlign: 'center'
  },
  headerTitle: {
    margin: 0,
    fontSize: 'clamp(20px, 5vw, 28px)',
    fontWeight: '700'
  },
  headerSubtitle: {
    margin: '8px 0 0',
    fontSize: 'clamp(12px, 3vw, 14px)',
    opacity: 0.9
  },
  controlBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#FFF',
    borderBottom: '1px solid #E5E7EB'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  controlLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    backgroundColor: '#FFF',
    cursor: 'pointer'
  },
  quarterButtons: {
    display: 'flex',
    gap: '4px'
  },
  quarterBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#FFF',
    borderBottom: '1px solid #E5E7EB',
    overflowX: 'auto'
  },
  tabBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  main: {
    padding: '16px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  
  // 인사이트 섹션
  insightsContainer: {
    backgroundColor: '#FFF',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  insightsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  insightsIcon: {
    fontSize: '20px'
  },
  insightsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  insightsLoading: {
    textAlign: 'center',
    color: '#6B7280',
    padding: '20px'
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  insightCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    borderLeft: '4px solid'
  },
  insightIcon: {
    fontSize: '24px'
  },
  insightContent: {
    flex: 1
  },
  insightTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },
  insightValue: {
    fontSize: '20px',
    fontWeight: '700'
  },
  insightDesc: {
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '2px'
  },
  
  // KPI 카드
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  kpiCard: {
    backgroundColor: '#FFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  kpiIcon: {
    fontSize: '16px'
  },
  kpiTitle: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500'
  },
  kpiValue: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: '700',
    color: '#111827'
  },
  kpiUnit: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: '4px'
  },
  kpiChange: {
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '4px'
  },
  kpiSubtitle: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '4px'
  },
  
  // 국가 리스트
  countryListContainer: {
    backgroundColor: '#FFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px'
  },
  listTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  viewToggle: {
    display: 'flex',
    gap: '4px'
  },
  toggleBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  countryCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    marginBottom: '8px',
    overflow: 'hidden'
  },
  countryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    cursor: 'pointer',
    backgroundColor: '#FAFAFA',
    transition: 'background-color 0.2s'
  },
  countryLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  rankBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600'
  },
  regionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  countryName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  regionTag: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#F3F4F6',
    color: '#6B7280'
  },
  countryRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  countryTotal: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right'
  },
  changeIndicator: {
    fontSize: '12px',
    marginLeft: '8px',
    fontWeight: '500'
  },
  expandIcon: {
    fontSize: '10px',
    color: '#9CA3AF',
    transition: 'transform 0.2s'
  },
  countryDetail: {
    padding: '16px',
    backgroundColor: '#FFF',
    borderTop: '1px solid #E5E7EB'
  },
  detailSection: {
    marginBottom: '16px'
  },
  detailTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  expenseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  },
  expenseItem: {
    padding: '10px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px'
  },
  expenseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#374151',
    marginBottom: '4px'
  },
  expenseRatio: {
    fontWeight: '600',
    color: '#6B7280'
  },
  expenseValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '6px'
  },
  expenseBar: {
    height: '4px',
    backgroundColor: '#E5E7EB',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  expenseBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s'
  },
  salesTable: {
    fontSize: '12px'
  },
  salesHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '4px',
    fontWeight: '600',
    color: '#374151'
  },
  salesRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '8px',
    padding: '8px',
    borderBottom: '1px solid #F3F4F6'
  },
  showMoreBtn: {
    width: '100%',
    padding: '12px',
    border: '1px dashed #D1D5DB',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#6B7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s'
  },
  regionGroup: {
    marginBottom: '16px'
  },
  regionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 0',
    borderBottom: '2px solid #E5E7EB',
    marginBottom: '8px'
  },
  regionName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  regionTotal: {
    marginLeft: 'auto',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6B7280'
  },
  regionCountries: {
    paddingLeft: '8px'
  },
  
  // 차트
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  tooltipStyle: {
    backgroundColor: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    fontSize: '12px'
  },
  legendGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '16px',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6B7280'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  
  // 상태 표시
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#6B7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  errorBox: {
    padding: '16px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    color: '#DC2626',
    textAlign: 'center'
  },
  
  // 푸터
  footer: {
    textAlign: 'center',
    padding: '24px 16px',
    fontSize: '12px',
    color: '#9CA3AF',
    borderTop: '1px solid #E5E7EB',
    marginTop: '24px'
  }
};

// CSS 애니메이션 추가 (index.css 또는 글로벌 스타일에 추가 필요)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
  
  /* 모바일 최적화 */
  @media (max-width: 640px) {
    .recharts-wrapper {
      font-size: 10px;
    }
  }
`;
document.head.appendChild(styleSheet);
