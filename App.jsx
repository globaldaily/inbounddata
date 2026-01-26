import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Google Sheets 설정
const SHEET_ID = '1hF1Z-3LLgzzzFwc66xVqEXszNm3qSH8Xwl6DT01dQRs';
const API_KEY = 'AIzaSyAs_UERCv_a4ZCfrZI2XvThGMFPFRkStO0';

const COLORS = ['#0066cc', '#00a0e9', '#00c8ff', '#5fd3f3', '#99e0f7', '#cceefb', '#ff6b6b', '#ffa94d', '#69db7c', '#da77f2'];

// 국가명 한글 매핑
const countryNameKo = {
  '全国籍・地域': '전체',
  '韓国': '한국',
  '台湾': '대만',
  '香港': '홍콩',
  '中国': '중국',
  'タイ': '태국',
  'シンガポール': '싱가포르',
  'マレーシア': '말레이시아',
  'インドネシア': '인도네시아',
  'フィリピン': '필리핀',
  'ベトナム': '베트남',
  'インド': '인도',
  '英国': '영국',
  'ドイツ': '독일',
  'フランス': '프랑스',
  'イタリア': '이탈리아',
  'スペイン': '스페인',
  'ロシア': '러시아',
  '米国': '미국',
  'カナダ': '캐나다',
  'オーストラリア': '호주',
  'その他': '기타'
};

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
  // 5행부터 데이터 시작 (헤더는 4행)
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || row[0] === 'クルーズ客（再掲）') continue;
    
    results.push({
      country: row[0],
      countryKo: countryNameKo[row[0]] || row[0],
      total: parseFloat(row[1]) || 0,
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
      countryKo: countryNameKo[row[0]] || row[0],
      perCapita: parseFloat(row[1]) || 0,
      visitors: parseFloat(row[2]) || 0,
      totalSpending: parseFloat(row[3]) || 0,
      avgNights: parseFloat(row[4]) || 0
    });
  }
  return results;
}

export default function InboundDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('2024_Q4');
  const [activeTab, setActiveTab] = useState('overview');
  
  // 데이터 상태
  const [spendingData, setSpendingData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  
  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        const [spending, visitors] = await Promise.all([
          fetchSheetData(`${selectedQuarter}_図表3`),
          fetchSheetData(`${selectedQuarter}_図表4`)
        ]);
        
        const parsedSpending = parse図表3(spending);
        const parsedVisitors = parse図表4(visitors);
        
        if (parsedSpending.length === 0 && parsedVisitors.length === 0) {
          setError('データが見つかりません。シート名を確認してください。');
        }
        
        setSpendingData(parsedSpending);
        setVisitorData(parsedVisitors);
      } catch (err) {
        setError('データの読み込みに失敗しました: ' + err.message);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [selectedQuarter]);
  
  // 전체 통계 계산
  const totalStats = React.useMemo(() => {
    const allCountry = spendingData.find(d => d.country === '全国籍・地域');
    const allVisitor = visitorData.find(d => d.country === '全国籍・地域');
    
    if (!allCountry || !allVisitor) return null;
    
    return {
      totalSpending: allCountry.total,
      totalVisitors: allVisitor.visitors,
      perCapita: allVisitor.perCapita,
      shoppingRatio: ((allCountry.shopping / allCountry.total) * 100).toFixed(1),
      avgNights: allVisitor.avgNights
    };
  }, [spendingData, visitorData]);
  
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
      { name: '娯楽等', value: all.entertainment, color: '#ffa94d' },
      { name: '買物代', value: all.shopping, color: '#ff6b6b' },
      { name: 'その他', value: all.other, color: '#999999' }
    ];
  }, [spendingData]);

  // 분기 선택 옵션
  const quarters = [
    { value: '2024_Q1', label: '2024년 Q1 (1-3월)' },
    { value: '2024_Q2', label: '2024년 Q2 (4-6월)' },
    { value: '2024_Q3', label: '2024년 Q3 (7-9월)' },
    { value: '2024_Q4', label: '2024년 Q4 (10-12월)' }
  ];

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">インバウンド消費統計</h1>
              <p className="text-sm text-gray-500">訪日外国人旅行消費額データ</p>
            </div>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {quarters.map(q => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
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
        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: 'overview', label: '概要' },
            { id: 'ranking', label: '国別ランキング' },
            { id: 'category', label: '費目構成' },
            { id: 'detail', label: '国別詳細' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countryRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}億`} />
                  <YAxis type="category" dataKey="countryKo" width={80} />
                  <Tooltip formatter={(v) => `${v.toLocaleString()}億円`} />
                  <Bar dataKey="total" fill="#0066cc" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 費目別 파이차트 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">費目別構成比</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{country.countryKo}</span>
                        <span className="text-gray-600">{country.total.toLocaleString()}億円</span>
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
                <XAxis dataKey="countryKo" />
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
                  <th className="text-left p-3 font-medium">国籍</th>
                  <th className="text-right p-3 font-medium">消費額(億円)</th>
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
                      <td className="p-3 font-medium">{row.countryKo}</td>
                      <td className="p-3 text-right">{spending?.total?.toLocaleString() || '-'}</td>
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
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          データ出典: 観光庁「インバウンド消費動向調査」
        </div>
      </footer>
    </div>
  );
}
