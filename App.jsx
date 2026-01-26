import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell, ComposedChart, Line, ReferenceLine, LabelList } from 'recharts';

const SHEET_ID = '1hF1Z-3LLgzzzFwc66xVqEXszNm3qSH8Xwl6DT01dQRs';
const API_KEY = 'AIzaSyAs_UERCv_a4ZCfrZI2XvThGMFPFRkStO0';

const COLORS = {
  bg: '#ffffff', bgSection: '#f8f9fa', accent: '#0066cc', accentLight: '#e6f0ff',
  positive: '#10b981', negative: '#ef4444', text: '#1a1a2e', textMuted: '#6b7280',
  border: '#e5e7eb', chart: ['#0066cc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  prev: '#94a3b8', current: '#0066cc'
};

const COUNTRIES = ['韓国', '台湾', '香港', '中国', 'タイ', 'シンガポール', 'マレーシア', 'インドネシア', 'フィリピン', 'ベトナム', 'インド', '英国', 'ドイツ', 'フランス', 'イタリア', 'スペイン', 'ロシア', '米国', 'カナダ', 'オーストラリア'];

// 분기별 추이 데이터 - 연속 데이터로 수정
const quarterlyTrendData = [
  { key: '2024-Q1', label: '24/1-3', total: 17707, perCapita: 20.9 },
  { key: '2024-Q2', label: '24/4-6', total: 21402, perCapita: 23.2 },
  { key: '2024-Q3', label: '24/7-9', total: 19186, perCapita: 21.0 },
  { key: '2024-Q4', label: '24/10-12', total: 22969, perCapita: 22.3 },
  { key: '2025-Q1', label: '25/1-3', total: 22803, perCapita: 22.8 },
  { key: '2025-Q2', label: '25/4-6', total: 25043, perCapita: 23.7 },
  { key: '2025-Q3', label: '25/7-9', total: 21384, perCapita: 21.4 },
  { key: '2025-Q4', label: '25/10-12', total: 25330, perCapita: 23.4 },
];

async function fetchSheetData(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.values || [];
  } catch (error) { return []; }
}

function parse図表3(data) {
  if (!data || data.length < 5) return [];
  const results = [];
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || row[0] === 'クルーズ客（再掲）') continue;
    const country = row[0];
    if (!COUNTRIES.includes(country) && country !== '全国籍・地域' && country !== 'その他') continue;
    results.push({
      country, total: parseFloat(String(row[1]).replace(/,/g, '')) || 0,
      accommodation: parseFloat(String(row[2]).replace(/,/g, '')) || 0,
      food: parseFloat(String(row[3]).replace(/,/g, '')) || 0,
      transport: parseFloat(String(row[4]).replace(/,/g, '')) || 0,
      entertainment: parseFloat(String(row[5]).replace(/,/g, '')) || 0,
      shopping: parseFloat(String(row[6]).replace(/,/g, '')) || 0,
      other: parseFloat(String(row[7]).replace(/,/g, '')) || 0
    });
  }
  return results;
}

function parse図表4(data) {
  if (!data || data.length < 5) return [];
  const results = [];
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    const country = row[0];
    if (!COUNTRIES.includes(country) && country !== '全国籍・地域' && country !== 'その他') continue;
    results.push({
      country, perCapita: parseFloat(String(row[1]).replace(/,/g, '')) || 0,
      visitors: parseFloat(String(row[2]).replace(/,/g, '')) || 0,
      avgNights: parseFloat(String(row[4]).replace(/,/g, '')) || 0
    });
  }
  return results;
}

// 영업팀 시트 파싱 - 불필요한 행 필터링
function parseSalesSheet(data) {
  if (!data || data.length < 5) return null;
  const products = [];
  
  // 유효한 품목명 리스트
  const validItems = [
    '菓子類', '酒類', '生鮮農産物', 'その他食料品・飲料・たばこ',
    '化粧品・香水', '医薬品', '健康グッズ・トイレタリー',
    '衣類', '靴・かばん・革製品', '電気製品', 'カメラ・ビデオカメラ・時計',
    '時計・フィルムカメラ', '宝石・貴金属', '民芸品・伝統工芸品',
    '本・雑誌・ガイドブック', '書籍・絵葉書・CD・DVD', 
    '音楽・映像・ゲームなど', 'その他買物代', 'マンガ・アニメ関連'
  ];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    
    const itemName = String(row[0]).trim();
    
    // 불필요한 행 스킵: 숫자로 시작, PPT, 企画, 항목, --- 등
    if (/^\d/.test(itemName)) continue;
    if (itemName.includes('PPT')) continue;
    if (itemName.includes('企画')) continue;
    if (itemName.includes('項目')) continue;
    if (itemName.includes('---')) continue;
    if (itemName.includes('費目別')) continue;
    if (itemName.includes('買物品目別')) continue;
    if (itemName === '品目' || itemName === '') continue;
    
    // 유효한 품목인지 확인 (부분 일치도 허용)
    const isValid = validItems.some(valid => itemName.includes(valid) || valid.includes(itemName));
    if (!isValid && itemName.length < 3) continue;
    
    const y2024 = parseFloat(String(row[1] || '0').replace(/[^0-9.-]/g, '')) || 0;
    const y2025 = parseFloat(String(row[2] || '0').replace(/[^0-9.-]/g, '')) || 0;
    
    // 둘 다 0이면 스킵
    if (y2024 === 0 && y2025 === 0) continue;
    
    const yoy = y2024 > 0 ? ((y2025 - y2024) / y2024 * 100) : 0;
    
    products.push({ name: itemName, y2024, y2025, yoy });
  }
  return products.length > 0 ? products : null;
}

export default function InboundDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('2025-Q4');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [viewMode, setViewMode] = useState('ranking');
  const [sortBy, setSortBy] = useState('total');
  const [spendingData, setSpendingData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [prevSpendingData, setPrevSpendingData] = useState([]);
  const [prevVisitorData, setPrevVisitorData] = useState([]);
  const [salesData, setSalesData] = useState({});

  const [currentYear, currentQ] = selectedQuarter.split('-');
  const prevYear = parseInt(currentYear) - 1;

  const quarterOptions = [
    { value: '2025-Q4', label: '2025年 Q4（10-12月）' },
    { value: '2025-Q3', label: '2025年 Q3（7-9月）' },
    { value: '2025-Q2', label: '2025年 Q2（4-6月）' },
    { value: '2025-Q1', label: '2025年 Q1（1-3月）' },
    { value: '2024-Q4', label: '2024年 Q4（10-12月）' },
    { value: '2024-Q3', label: '2024年 Q3（7-9月）' },
    { value: '2024-Q2', label: '2024年 Q2（4-6月）' },
    { value: '2024-Q1', label: '2024年 Q1（1-3月）' },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const sheetPrefix = `${currentYear}_${currentQ}`;
        const prevSheetPrefix = `${prevYear}_${currentQ}`;
        const [spending, visitors] = await Promise.all([
          fetchSheetData(`${sheetPrefix}_図表3`),
          fetchSheetData(`${sheetPrefix}_図表4`)
        ]);
        const parsedSpending = parse図表3(spending);
        const parsedVisitors = parse図表4(visitors);
        if (parsedSpending.length === 0 && parsedVisitors.length === 0) {
          setError(`${sheetPrefix}のデータが見つかりません`);
        } else {
          setSpendingData(parsedSpending);
          setVisitorData(parsedVisitors);
        }
        const [prevSpending, prevVisitors] = await Promise.all([
          fetchSheetData(`${prevSheetPrefix}_図表3`),
          fetchSheetData(`${prevSheetPrefix}_図表4`)
        ]);
        setPrevSpendingData(parse図表3(prevSpending));
        setPrevVisitorData(parse図表4(prevVisitors));
      } catch (err) {
        setError('データの読み込みに失敗しました: ' + err.message);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedQuarter]);

  useEffect(() => {
    async function loadSalesData() {
      if (selectedCountry && !salesData[selectedCountry]) {
        const data = await fetchSheetData(`営業_${selectedCountry}`);
        const parsed = parseSalesSheet(data);
        if (parsed) setSalesData(prev => ({ ...prev, [selectedCountry]: parsed }));
      }
    }
    loadSalesData();
  }, [selectedCountry]);

  const enrichedData = useMemo(() => {
    return spendingData
      .filter(d => d.country !== '全国籍・地域' && d.country !== 'その他')
      .map(spending => {
        const visitor = visitorData.find(v => v.country === spending.country) || {};
        const prevSpending = prevSpendingData.find(p => p.country === spending.country);
        const visitors = visitor.visitors || 0;
        const perCapita = visitor.perCapita || 0;
        const avgNights = visitor.avgNights || 0;
        const perNight = avgNights > 0 ? Math.round(perCapita / avgNights) : 0;
        const shoppingRatio = spending.total > 0 ? (spending.shopping / spending.total * 100) : 0;
        const yoyGrowth = prevSpending && prevSpending.total > 0 
          ? ((spending.total - prevSpending.total) / prevSpending.total * 100) : 0;
        return { ...spending, visitors, perCapita, avgNights, perNight, shoppingRatio, yoyGrowth, prev: prevSpending };
      });
  }, [spendingData, visitorData, prevSpendingData, prevVisitorData]);

  const sortedData = useMemo(() => {
    return [...enrichedData].sort((a, b) => {
      if (sortBy === 'total') return b.total - a.total;
      if (sortBy === 'perCapita') return b.perCapita - a.perCapita;
      if (sortBy === 'growth') return b.yoyGrowth - a.yoyGrowth;
      return 0;
    });
  }, [enrichedData, sortBy]);

  const totals = useMemo(() => {
    const allSpending = spendingData.find(d => d.country === '全国籍・地域');
    const allVisitor = visitorData.find(d => d.country === '全国籍・地域');
    const prevAllSpending = prevSpendingData.find(d => d.country === '全国籍・地域');
    if (!allSpending || !allVisitor) return null;
    const yoyGrowth = prevAllSpending && prevAllSpending.total > 0
      ? ((allSpending.total - prevAllSpending.total) / prevAllSpending.total * 100) : 0;
    return {
      total: allSpending.total, visitors: allVisitor.visitors, perCapita: allVisitor.perCapita,
      shopping: allSpending.shopping, shoppingRatio: allSpending.total > 0 ? (allSpending.shopping / allSpending.total * 100) : 0,
      yoyGrowth
    };
  }, [spendingData, visitorData, prevSpendingData]);

  const matrixData = useMemo(() => {
    if (enrichedData.length === 0) return [];
    const avgPerCapita = enrichedData.reduce((s, d) => s + d.perCapita, 0) / enrichedData.length;
    const avgGrowth = enrichedData.reduce((s, d) => s + d.yoyGrowth, 0) / enrichedData.length;
    return enrichedData.map(d => ({
      ...d,
      quadrant: d.perCapita >= avgPerCapita 
        ? (d.yoyGrowth >= avgGrowth ? 'star' : 'cashCow')
        : (d.yoyGrowth >= avgGrowth ? 'questionMark' : 'dog'),
      avgPerCapita, avgGrowth
    }));
  }, [enrichedData]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: COLORS.textMuted }}>データを読み込み中...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>エラー</h2>
          <p style={{ color: COLORS.textMuted, marginBottom: '16px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ background: COLORS.accent, color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>再読み込み</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: '"Noto Sans JP", -apple-system, sans-serif' }}>
      <div style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, padding: '32px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ background: COLORS.accent, color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>INBOUND</span>
            <span style={{ color: COLORS.textMuted, fontSize: '14px' }}>旅行消費額</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>訪日外国人 旅行消費額ダッシュボード</h1>
          <p style={{ color: COLORS.textMuted, marginTop: '8px', fontSize: '14px' }}>観光庁「インバウンド消費動向調査」| {currentYear}年 {currentQ}</p>
        </div>
      </div>

      <div style={{ background: COLORS.bgSection, borderBottom: `1px solid ${COLORS.border}`, padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: COLORS.textMuted, fontSize: '13px', fontWeight: 500 }}>期間</span>
            <select value={selectedQuarter} onChange={(e) => { setSelectedQuarter(e.target.value); setSelectedCountry(null); }}
              style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${COLORS.border}`, background: '#fff', fontSize: '14px', fontWeight: 500 }}>
              {quarterOptions.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ key: 'ranking', label: '国家別' }, { key: 'matrix', label: 'マトリクス' }, { key: 'breakdown', label: '費目構成' }].map(({ key, label }) => (
              <button key={key} onClick={() => setViewMode(key)}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  border: viewMode === key ? 'none' : `1px solid ${COLORS.border}`,
                  background: viewMode === key ? COLORS.accent : '#fff',
                  color: viewMode === key ? '#fff' : COLORS.textMuted }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {totals && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '4px' }}>総消費額</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: COLORS.accent }}>{(totals.total / 10000).toFixed(2)}<span style={{ fontSize: '14px', fontWeight: 400, color: COLORS.textMuted }}> 兆円</span></div>
              <div style={{ fontSize: '12px', color: totals.yoyGrowth >= 0 ? COLORS.positive : COLORS.negative, fontWeight: 600, marginTop: '4px' }}>前年同期比 {totals.yoyGrowth >= 0 ? '+' : ''}{totals.yoyGrowth.toFixed(1)}%</div>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '4px' }}>訪日客数</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{(totals.visitors / 10000).toFixed(1)}<span style={{ fontSize: '14px', fontWeight: 400, color: COLORS.textMuted }}> 万人</span></div>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '4px' }}>1人当たり支出</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{(totals.perCapita / 10000).toFixed(1)}<span style={{ fontSize: '14px', fontWeight: 400, color: COLORS.textMuted }}> 万円</span></div>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ color: COLORS.textMuted, fontSize: '12px', marginBottom: '4px' }}>買物代比率</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{totals.shoppingRatio.toFixed(1)}<span style={{ fontSize: '14px', fontWeight: 400, color: COLORS.textMuted }}> %</span></div>
            </div>
          </div>
        )}

        {/* 분기별 추이 차트 - 折れ線 추가 */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: `1px solid ${COLORS.border}`, marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>四半期の旅行消費額・1人当たり旅行支出の推移</h3>
          <p style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '20px' }}>棒グラフ：消費額（億円）/ 折れ線：1人当たり支出（万円）</p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={quarterlyTrendData} margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.textMuted }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: COLORS.textMuted }} tickFormatter={(v) => v.toLocaleString()} domain={[0, 30000]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: COLORS.textMuted }} domain={[15, 30]} tickFormatter={(v) => v.toFixed(0)} />
              <Tooltip formatter={(value, name) => name === '消費額' ? [`${value.toLocaleString()}億円`, name] : [`${value.toFixed(1)}万円`, name]} />
              <Legend />
              <Bar yAxisId="left" dataKey="total" name="消費額" radius={[4, 4, 0, 0]}>
                {quarterlyTrendData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.key === selectedQuarter ? COLORS.accent : '#c7d2e8'} />)}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="perCapita" name="1人当たり支出" stroke={COLORS.negative} strokeWidth={2} dot={{ r: 4, fill: COLORS.negative }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {viewMode === 'ranking' && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>国籍・地域別 消費データ</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ key: 'total', label: '総額順' }, { key: 'perCapita', label: '客単価順' }, { key: 'growth', label: '成長率順' }].map(({ key, label }) => (
                  <button key={key} onClick={() => setSortBy(key)}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      border: `1px solid ${sortBy === key ? COLORS.accent : COLORS.border}`,
                      background: sortBy === key ? COLORS.accentLight : '#fff',
                      color: sortBy === key ? COLORS.accent : COLORS.textMuted }}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedData.map((d, i) => (
                <div key={d.country}>
                  <div onClick={() => setSelectedCountry(selectedCountry === d.country ? null : d.country)}
                    style={{ background: '#fff', borderRadius: selectedCountry === d.country ? '12px 12px 0 0' : '12px',
                      border: `1px solid ${selectedCountry === d.country ? COLORS.accent : COLORS.border}`,
                      borderBottom: selectedCountry === d.country ? 'none' : `1px solid ${COLORS.border}`,
                      padding: '16px 20px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: i < 3 ? COLORS.accent : COLORS.bgSection,
                        color: i < 3 ? '#fff' : COLORS.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{d.country}</div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                          <span style={{ color: COLORS.textMuted }}>消費額 <strong style={{ color: COLORS.text }}>{d.total.toLocaleString()}億円</strong></span>
                          <span style={{ color: COLORS.textMuted }}>客単価 <strong style={{ color: COLORS.accent }}>¥{d.perCapita.toLocaleString()}</strong></span>
                          <span style={{ color: COLORS.textMuted }}>訪日客数 <strong style={{ color: COLORS.text }}>{d.visitors.toFixed(1)}万人</strong></span>
                          <span style={{ color: d.yoyGrowth >= 0 ? COLORS.positive : COLORS.negative, fontWeight: 600 }}>YoY {d.yoyGrowth >= 0 ? '+' : ''}{d.yoyGrowth.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px',
                        background: selectedCountry === d.country ? COLORS.accent : COLORS.bgSection,
                        color: selectedCountry === d.country ? '#fff' : COLORS.accent, fontSize: '13px', fontWeight: 500 }}>
                        {selectedCountry === d.country ? '閉じる' : '詳細'}
                        <span style={{ transform: selectedCountry === d.country ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      </div>
                    </div>
                  </div>
                  {selectedCountry === d.country && (
                    <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', border: `1px solid ${COLORS.accent}`, borderTop: `1px dashed ${COLORS.border}`, padding: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: COLORS.textMuted }}>📊 費目別消費額（億円）</h4>
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={[
                              { name: '宿泊費', prev: d.prev?.accommodation || 0, current: d.accommodation },
                              { name: '飲食費', prev: d.prev?.food || 0, current: d.food },
                              { name: '交通費', prev: d.prev?.transport || 0, current: d.transport },
                              { name: '娯楽等', prev: d.prev?.entertainment || 0, current: d.entertainment },
                              { name: '買物代', prev: d.prev?.shopping || 0, current: d.shopping },
                            ]} barGap={2}>
                              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                              <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.textMuted }} />
                              <YAxis tick={{ fontSize: 11, fill: COLORS.textMuted }} />
                              <Tooltip formatter={(v) => [`${v.toLocaleString()}億円`]} />
                              <Legend />
                              <Bar dataKey="prev" fill={COLORS.prev} name={`${prevYear}年`} radius={[2, 2, 0, 0]} />
                              <Bar dataKey="current" fill={COLORS.current} name={`${currentYear}年`} radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: COLORS.textMuted }}>📈 主要指標</h4>
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {[{ label: '1人当たり支出', value: `¥${d.perCapita.toLocaleString()}` },
                              { label: '1泊当たり支出', value: `¥${d.perNight.toLocaleString()}` },
                              { label: '平均泊数', value: `${d.avgNights}泊` },
                              { label: '買物代比率', value: `${d.shoppingRatio.toFixed(1)}%` }
                            ].map(({ label, value }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: COLORS.bgSection, borderRadius: '8px' }}>
                                <span style={{ fontSize: '12px', color: COLORS.textMuted }}>{label}</span>
                                <span style={{ fontSize: '18px', fontWeight: 700 }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: COLORS.textMuted }}>📋 前年同期比較</h4>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ background: COLORS.bgSection }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>費目</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{prevYear}年</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{currentYear}年</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>増減</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>前年比</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[{ name: '宿泊費', curr: d.accommodation, prev: d.prev?.accommodation },
                                { name: '飲食費', curr: d.food, prev: d.prev?.food },
                                { name: '交通費', curr: d.transport, prev: d.prev?.transport },
                                { name: '娯楽等', curr: d.entertainment, prev: d.prev?.entertainment },
                                { name: '買物代', curr: d.shopping, prev: d.prev?.shopping },
                                { name: '合計', curr: d.total, prev: d.prev?.total, isTotal: true },
                              ].map(({ name, curr, prev, isTotal }) => {
                                const diff = curr - (prev || 0);
                                const pct = prev ? ((curr - prev) / prev * 100) : 0;
                                return (
                                  <tr key={name} style={{ borderTop: `1px solid ${COLORS.border}`, background: isTotal ? COLORS.accentLight : 'transparent', fontWeight: isTotal ? 600 : 400 }}>
                                    <td style={{ padding: '10px 12px' }}>{name}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: COLORS.textMuted }}>{(prev || 0).toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{curr.toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: diff >= 0 ? COLORS.positive : COLORS.negative }}>{diff >= 0 ? '+' : ''}{diff.toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: pct >= 0 ? COLORS.positive : COLORS.negative }}>{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {salesData[d.country] && salesData[d.country].length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                          <details style={{ background: COLORS.bgSection, borderRadius: '8px', overflow: 'hidden' }}>
                            <summary style={{ padding: '14px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                              🛍️ 買物品目別 客単価（円）<span style={{ fontSize: '11px', fontWeight: 400, color: COLORS.textMuted, marginLeft: '8px' }}>クリックで展開</span>
                            </summary>
                            <div style={{ padding: '16px', borderTop: `1px solid ${COLORS.border}`, background: '#fff' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                  <tr style={{ background: COLORS.bgSection }}>
                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>品目</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>2024年</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>2025年</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>前年比</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {salesData[d.country].map((item, idx) => (
                                    <tr key={idx} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                                      <td style={{ padding: '10px 12px' }}>{item.name}</td>
                                      <td style={{ padding: '10px 12px', textAlign: 'right', color: COLORS.textMuted }}>¥{item.y2024.toLocaleString()}</td>
                                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500 }}>¥{item.y2025.toLocaleString()}</td>
                                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: item.yoy >= 0 ? COLORS.positive : COLORS.negative }}>{item.yoy >= 0 ? '+' : ''}{item.yoy.toFixed(1)}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {viewMode === 'matrix' && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>成長率 × 客単価 マトリクス</h2>
            <p style={{ color: COLORS.textMuted, fontSize: '13px', marginBottom: '16px' }}>縦軸：前年同期比成長率 / 横軸：1人当たり支出額 / 円のサイズ：総消費額</p>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: `1px solid ${COLORS.border}` }}>
              <ResponsiveContainer width="100%" height={520}>
                <ScatterChart margin={{ top: 20, right: 40, bottom: 60, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" dataKey="perCapita" domain={['auto', 'auto']} tickFormatter={(v) => `¥${(v/10000).toFixed(0)}万`} tick={{ fontSize: 11, fill: COLORS.textMuted }}
                    label={{ value: '1人当たり支出（円）', position: 'bottom', offset: 40, fontSize: 12, fill: COLORS.textMuted }} />
                  <YAxis type="number" dataKey="yoyGrowth" domain={['auto', 'auto']} tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: COLORS.textMuted }}
                    label={{ value: 'YoY成長率（%）', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: COLORS.textMuted }} />
                  {matrixData.length > 0 && (
                    <>
                      <ReferenceLine x={matrixData[0]?.avgPerCapita} stroke="#d1d5db" strokeDasharray="5 5" />
                      <ReferenceLine y={matrixData[0]?.avgGrowth} stroke="#d1d5db" strokeDasharray="5 5" />
                    </>
                  )}
                  <Tooltip content={({ payload }) => {
                    if (!payload || !payload[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>{d.country}</div>
                        <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>消費額: <strong style={{ color: COLORS.text }}>{d.total.toLocaleString()}億円</strong></div>
                        <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>客単価: <strong style={{ color: COLORS.accent }}>¥{d.perCapita.toLocaleString()}</strong></div>
                        <div style={{ fontSize: '12px', color: COLORS.textMuted }}>成長率: <strong style={{ color: d.yoyGrowth >= 0 ? COLORS.positive : COLORS.negative }}>{d.yoyGrowth >= 0 ? '+' : ''}{d.yoyGrowth.toFixed(1)}%</strong></div>
                      </div>
                    );
                  }} />
                  <Scatter data={matrixData} style={{ cursor: 'pointer' }}>
                    {matrixData.map((d) => (
                      <Cell key={d.country} fill={d.quadrant === 'star' ? COLORS.positive : d.quadrant === 'questionMark' ? '#22c55e' : d.quadrant === 'cashCow' ? COLORS.accent : '#9ca3af'}
                        r={Math.max(Math.sqrt(d.total) / 2.5, 6)} />
                    ))}
                    <LabelList dataKey="country" position="top" offset={8} style={{ fontSize: '10px', fontWeight: 500, fill: COLORS.text }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.positive }} />高単価・高成長</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />成長市場</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS.accent }} />安定市場</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9ca3af' }} />様子見</span>
              </div>
            </div>
          </section>
        )}

        {viewMode === 'breakdown' && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>費目別構成比（国籍・地域別）</h2>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: `1px solid ${COLORS.border}` }}>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={sortedData.slice(0, 12)} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <YAxis type="category" dataKey="country" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey={(d) => d.total > 0 ? (d.accommodation / d.total * 100) : 0} stackId="a" fill={COLORS.chart[0]} name="宿泊費" />
                  <Bar dataKey={(d) => d.total > 0 ? (d.food / d.total * 100) : 0} stackId="a" fill={COLORS.chart[1]} name="飲食費" />
                  <Bar dataKey={(d) => d.total > 0 ? (d.transport / d.total * 100) : 0} stackId="a" fill={COLORS.chart[2]} name="交通費" />
                  <Bar dataKey={(d) => d.total > 0 ? (d.entertainment / d.total * 100) : 0} stackId="a" fill={COLORS.chart[3]} name="娯楽等" />
                  <Bar dataKey={(d) => d.total > 0 ? (d.shopping / d.total * 100) : 0} stackId="a" fill={COLORS.chart[4]} name="買物代" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section>
          <div style={{ background: COLORS.bgSection, borderRadius: '12px', padding: '24px', border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>データについて</h3>
            <div style={{ fontSize: '13px', color: COLORS.textMuted, lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>出典</strong>：観光庁「インバウンド消費動向調査」</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>1人当たり支出</strong> = 総消費額 ÷ 訪日客数</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>マトリクス分類</strong>：平均客単価・平均成長率を基準に4象限に分類</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
