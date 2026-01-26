import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Google Sheets 설정
const SHEET_ID = '1hF1Z-3LLgzzzFwc66xVqEXszNm3qSH8Xwl6DT01dQRs';
const API_KEY = 'AIzaSyAs_UERCv_a4ZCfrZI2XvThGMFPFRkStO0';

const COLORS = ['#0066cc', '#00a0e9', '#00c8ff', '#5fd3f3', '#99e0f7', '#cceefb', '#ff6b6b', '#ffa94d', '#69db7c', '#da77f2'];

// 영업팀 대상 9개국
const SALES_COUNTRIES = ['韓国', '台湾', '香港', '中国', 'タイ', 'シンガポール', 'マレーシア', '米国', 'オーストラリア'];

// Google Sheets에서 데이터 가져오기
async function fetchSheetData(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
}

// 図表3 데이터 파싱 (費目別消費額)
function parse図表3(data) {
  if (!data || data.length < 5) return [];
  
  const results = [];
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || row[0] === 'クルーズ客（再掲）') continue;
    
    // 前年同期比 파싱 (예: "+28.8%" → 28.8)
    let yoyChange = null;
    if (row[1]) {
      const match = String(row[1]).match(/([+-]?\d+\.?\d*)/);
      if (match) yoyChange = parseFloat(match[1]);
    }
    
    results.push({
      country: row[0],
      total: parseFloat(String(row[1]).replace(/[^0-9.-]/g, '')) || 0,
      yoyChange: yoyChange,
      accommodation: parseFloat(row[2]) || 0,
      food: parseFloat(row[3]) || 0,
      transportation: parseFloat(row[4]) || 0,
      entertainment: parseFloat(row[5]) || 0,
      shopping: parseFloat(row[6]) || 0,
      other: parseFloat(row[7]) || 0
    });
  }
  return results;
}

// 図表4 데이터 파싱 (訪日客数・客単価)
function parse図表4(data) {
  if (!data || data.length < 5) return [];
  
  const results = [];
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || row[0] === 'クルーズ客' || row[0] === '全体') continue;
    
    results.push({
      country: row[0],
      perCapita: parseFloat(String(row[1]).replace(/,/g, '')) || 0,
      visitors: parseFloat(String(row[2]).replace(/,/g, '')) || 0,
      totalSpending: parseFloat(String(row[3]).replace(/,/g, '')) || 0,
      avgNights: parseFloat(row[4]) || 0
    });
  }
  return results;
}

// 영업팀 品目別 데이터 파싱
function parseSalesData(data) {
  if (!data || data.length < 28) return null;
  
  // 시트 구조에 따른 데이터 추출
  // 행 5: 宿泊費, 행 6: 飲食費, 행 7: 交通費, 행 8: 娯楽等サービス費, 행 9: 買物代
  // 행 11~27: 品目別 (菓子類, 酒類, 化粧品...)
  
  const categories = {
    accommodation: data[4] ? parseFloat(data[4][2]) || 0 : 0,
    food: data[5] ? parseFloat(data[5][2]) || 0 : 0,
    transportation: data[6] ? parseFloat(data[6][2]) || 0 : 0,
    entertainment: data[7] ? parseFloat(data[7][2]) || 0 : 0,
    shopping: data[8] ? parseFloat(data[8][2]) || 0 : 0,
  };
  
  // 品目別 데이터 (행 11~27)
  const products = [];
  const productNames = [
    '菓子類', '酒類', '生鮮農産物', 'その他食料品・飲料・たばこ',
    '化粧品・香水', '医薬品', '健康グッズ・トイレタリー',
    '衣類', '靴・かばん・革製品', '電気製品', 'カメラ・ビデオカメラ・時計',
    '宝石・貴金属', '民芸品・伝統工芸品', '書籍・絵葉書・CD・DVD',
    'その他買物代', 'マンガ・アニメ関連', 'その他娯楽サービス費'
  ];
  
  for (let i = 10; i < Math.min(28, data.length); i++) {
    if (data[i] && data[i][0]) {
      products.push({
        name: data[i][0],
        value2023: parseFloat(data[i][1]) || 0,
        value2024: parseFloat(data[i][2]) || 0
      });
    }
  }
  
  return { categories, products };
}

export default function InboundDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedQuarter, setSelectedQuarter] = useState('Q4');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCountry, setSelectedCountry] = useState('韓国');
  
  // 데이터 상태
  const [spendingData, setSpendingData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [prevYearData, setPrevYearData] = useState([]);
  
  // 시트명 생성
  const sheetName = `${selectedYear}_${selectedQuarter}`;
  const prevYearSheetName = `${parseInt(selectedYear) - 1}_${selectedQuarter}`;
  
  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // 현재 분기 데이터
        const [spending, visitors] = await Promise.all([
          fetchSheetData(`${sheetName}_図表3`),
          fetchSheetData(`${sheetName}_図表4`)
        ]);
        
        const parsedSpending = parse図表3(spending);
        const parsedVisitors = parse図表4(visitors);
        
        if (parsedSpending.length === 0 && parsedVisitors.length === 0) {
          setError(`${sheetName}のデータが見つかりません。`);
        }
        
        setSpendingData(parsedSpending);
        setVisitorData(parsedVisitors);
        
        // 전년 동기 데이터 (비교용)
        if (parseInt(selectedYear) > 2024) {
          const prevSpending = await fetchSheetData(`${prevYearSheetName}_図表3`);
          setPrevYearData(parse図表3(prevSpending));
        }
        
      } catch (err) {
        setError('データの読み込みに失敗しました: ' + err.message);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [sheetName]);
  
  // 영업팀 데이터 로드
  useEffect(() => {
    async function loadSalesData() {
      if (activeTab === 'sales' && SALES_COUNTRIES.includes(selectedCountry)) {
        const data = await fetchSheetData(`営業_${selectedCountry}`);
        const parsed = parseSalesData(data);
        setSalesData(parsed);
      }
    }
    loadSalesData();
  }, [activeTab, selectedCountry]);
  
  // 전체 통계 계산
  const totalStats = React.useMemo(() => {
    const allCountry = spendingData.find(d => d.country === '全国籍・地域');
    const allVisitor = visitorData.find(d => d.country === '全国籍・地域');
    
    if (!allCountry || !allVisitor) return null;
    
    // 전년 동기 데이터
    const prevAll = prevYearData.find(d => d.country === '全国籍・地域');
    
    return {
      totalSpending: allCountry.total,
      totalVisitors: allVisitor.visitors,
      perCapita: allVisitor.perCapita,
      shoppingRatio: ((allCountry.shopping / allCountry.total) * 100).toFixed(1),
      avgNights: allVisitor.avgNights,
      yoySpending: prevAll ? (((allCountry.total - prevAll.total) / prevAll.total) * 100).toFixed(1) : null,
      yoyVisitors: allCountry.yoyChange
    };
  }, [spendingData, visitorData, prevYearData]);
  
  // 국가별 랭킹 (전체 제외, 상위 10개)
  const countryRanking = React.useMemo(() => {
    return spendingData
      .filter(d => d.country !== '全国籍・地域' && d.country !== 'その他')
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [spendingData]);
  
  // 費目別 구성 데이터
  const categoryData = React.useMemo(() => {
    const all = spendingData.find(d => d.country === '全国籍・地域');
    if (!all) return [];
    
    return [
      { name: '宿泊費', value: all.accommodation, color: '#0066cc' },
      { name: '飲食費', value: all.food, color: '#00a0e9' },
      { name: '交通費', value: all.transportation, color: '#5fd3f3' },
      { name: '娯楽等サービス費', value: all.entertainment, color: '#ffa94d' },
      { name: '買物代', value: all.shopping, color: '#ff6b6b' },
      { name: 'その他', value: all.other, color: '#999999' }
    ].filter(d => d.value > 0);
  }, [spendingData]);

  // 분기 선택 옵션
  const years = ['2024', '2025'];
  const quarters = [
    { value: 'Q1', label: 'Q1 (1-3月)' },
    { value: 'Q2', label: 'Q2 (4-6月)' },
    { value: 'Q3', label: 'Q3 (7-9月)' },
    { value: 'Q4', label: 'Q4 (10-12月)' }
  ];

  // 伸び率 포맷
  const formatYoY = (value) => {
    if (value === null || value === undefined) return '-';
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  // 伸び率 색상
  const getYoYColor = (value) => {
    if (value === null || value === undefined) return 'text-gray-500';
    const num = parseFloat(value);
    if (isNaN(num)) return 'text-gray-500';
    return num >= 0 ? 'text-red-500' : 'text-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">エラー</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">インバウンド消費統計ダッシュボード</h1>
              <p className="text-sm text-gray-500">訪日外国人旅行消費額データ（観光庁）</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {quarters.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI 카드 */}
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-600">
              <p className="text-xs text-gray-500 mb-1">総消費額</p>
              <p className="text-2xl font-bold text-gray-900">{(totalStats.totalSpending / 10000).toFixed(2)}兆円</p>
              {totalStats.yoySpending && (
                <p className={`text-sm ${getYoYColor(totalStats.yoySpending)}`}>
                  前年同期比 {formatYoY(totalStats.yoySpending)}
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-xs text-gray-500 mb-1">訪日客数</p>
              <p className="text-2xl font-bold text-gray-900">{(totalStats.totalVisitors / 10000).toFixed(0)}万人</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
              <p className="text-xs text-gray-500 mb-1">1人当たり支出</p>
              <p className="text-2xl font-bold text-gray-900">{(totalStats.perCapita / 10000).toFixed(1)}万円</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
              <p className="text-xs text-gray-500 mb-1">買物代比率</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.shoppingRatio}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-pink-500">
              <p className="text-xs text-gray-500 mb-1">平均泊数</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.avgNights}泊</p>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { id: 'overview', label: '概要' },
            { id: 'ranking', label: '国別ランキング' },
            { id: 'category', label: '費目構成' },
            { id: 'detail', label: '国別詳細' },
            { id: 'sales', label: '品目別詳細' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 국가별 소비액 차트 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">国別消費額 Top 10</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={countryRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}億`} />
                  <YAxis type="category" dataKey="country" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(v) => `${v.toLocaleString()}億円`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="#0066cc" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 費目別 파이차트 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">費目別構成比</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    labelLine={{ stroke: '#666', strokeWidth: 1 }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toLocaleString()}億円`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">国別消費額ランキング</h3>
            <div className="space-y-3">
              {countryRanking.map((country, index) => {
                const maxTotal = countryRanking[0]?.total || 1;
                const percentage = (country.total / maxTotal) * 100;
                
                return (
                  <div key={country.country} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{country.country}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{country.total.toLocaleString()}億円</span>
                          {country.yoyChange !== null && (
                            <span className={`text-sm ${getYoYColor(country.yoyChange)}`}>
                              {formatYoY(country.yoyChange)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'category' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">国別費目構成</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={countryRanking}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v}億`} />
                <Tooltip formatter={(v) => `${v.toLocaleString()}億円`} />
                <Legend />
                <Bar dataKey="accommodation" name="宿泊費" stackId="a" fill="#0066cc" />
                <Bar dataKey="food" name="飲食費" stackId="a" fill="#00a0e9" />
                <Bar dataKey="transportation" name="交通費" stackId="a" fill="#5fd3f3" />
                <Bar dataKey="entertainment" name="娯楽等" stackId="a" fill="#ffa94d" />
                <Bar dataKey="shopping" name="買物代" stackId="a" fill="#ff6b6b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">国別詳細データ</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">国籍・地域</th>
                  <th className="text-right p-3 font-medium">消費額(億円)</th>
                  <th className="text-right p-3 font-medium">伸び率</th>
                  <th className="text-right p-3 font-medium">訪日客数</th>
                  <th className="text-right p-3 font-medium">客単価(円)</th>
                  <th className="text-right p-3 font-medium">平均泊数</th>
                </tr>
              </thead>
              <tbody>
                {visitorData.filter(d => d.country !== '全国籍・地域').map((row) => {
                  const spending = spendingData.find(s => s.country === row.country);
                  return (
                    <tr key={row.country} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{row.country}</td>
                      <td className="p-3 text-right">{spending?.total?.toLocaleString() || '-'}</td>
                      <td className={`p-3 text-right ${getYoYColor(spending?.yoyChange)}`}>
                        {formatYoY(spending?.yoyChange)}
                      </td>
                      <td className="p-3 text-right">{row.visitors?.toLocaleString() || '-'}</td>
                      <td className="p-3 text-right">{row.perCapita?.toLocaleString() || '-'}</td>
                      <td className="p-3 text-right">{row.avgNights || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* 국가 선택 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">品目別消費データ（営業用）</h3>
              <div className="flex flex-wrap gap-2">
                {SALES_COUNTRIES.map(country => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCountry === country
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 국가 데이터 */}
            {salesData ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* 費目別 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-bold text-gray-900 mb-4">{selectedCountry} - 費目別支出</h4>
                  <div className="space-y-3">
                    {Object.entries({
                      '宿泊費': salesData.categories.accommodation,
                      '飲食費': salesData.categories.food,
                      '交通費': salesData.categories.transportation,
                      '娯楽等サービス費': salesData.categories.entertainment,
                      '買物代': salesData.categories.shopping
                    }).map(([name, value]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="text-gray-700">{name}</span>
                        <span className="font-medium">{value.toLocaleString()}円</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 品目別 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-bold text-gray-900 mb-4">{selectedCountry} - 品目別買物代</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {salesData.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-sm text-gray-700">{product.name}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-500">2023: {product.value2023.toLocaleString()}円</span>
                          <span className="font-medium">2024: {product.value2024.toLocaleString()}円</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                「営業_{selectedCountry}」シートからデータを読み込み中...
              </div>
            )}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          データ出典: 観光庁「インバウンド消費動向調査」 | {selectedYear}年{selectedQuarter}
        </div>
      </footer>
    </div>
  );
}
