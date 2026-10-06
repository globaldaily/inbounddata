<?php
/**
 * Template Name: Inbound Statistics
 * Template Post Type: page
 */
if ( ! defined('ABSPATH') ) { exit; }
add_filter('document_title_parts', function($title) {
    $title['title'] = '訪日インバウンドデータ｜訪日外客数・旅行消費額・訪日需要カレンダー2027';
    return $title;
});
add_action('wp_head', function() {
    echo '<meta name="description" content="JNTO・観光庁の公表データをもとに、訪日外客数と旅行消費額を毎月更新。主要8か国・地域の2027年の連休と月別の訪日需要をまとめた「訪日需要カレンダー」はPDFで保存できます。">';
    echo '<meta name="keywords" content="インバウンド,訪日外客数,旅行消費額,訪日需要カレンダー,2027,連休,春節,国慶節">';
}, 1);
/* 資料DLモーダル（/download/ と同じもの）をこのページでも使う */
add_action( 'wp_enqueue_scripts', function () {
  wp_enqueue_script( 'gld-download-preview-script', get_template_directory_uri() . '/assets/gld-download-preview.js', array(), null, true );
}, 20 );
get_header();
?>


<header class="archive__mainVisual">
  <div class="archive__mainVisualLeft">
    <div class="sectionTitle">
      <p class="sectionTitle__sub">インバウンドデータ</p>
      <h2 class="sectionTitle__main"><?php the_title(); ?></h2>
    </div>
  </div>

<?php
/* =====================================================================
   [A] 既存ヘッダーに「最新データ」を追加（Inbound Statistics テンプレート）
   ■ 既存の <header class="archive__mainVisual"> はそのまま。
     その中の <div class="archive__mainVisualRight tabBigPcOnly"> の直前に貼る
   ■ 毎月の更新：$gld_mv の中だけ（monthly_prev＝前年12か月、monthly_curr＝今年の発表済みの月）
   ===================================================================== */
$gld_mv = array(
  'updated'       => '2026.9.30',
  'source'        => '訪日外客数：JNTO 9/16発表　旅行消費額：観光庁 9/30公表',
  'month_label'   => '8月の訪日外客数',
  'month_value'   => '309.9',
  'month_diff'    => '前年同月比 −9.6%',
  'month_up'      => false,
  'monthly_prev'  => array( 3781629, 3258491, 3497755, 3909128, 3693587, 3377985, 3437118, 3428406, 3267228, 3896524, 3517659, 3617791 ),
  'monthly_curr'  => array( 3597881, 3466848, 3619159, 3692364, 3560256, 3148754, 3442100, 3098900 ),
  'subs'          => array(
    array( 'label' => '1〜8月 累計',            'value' => '2,762.6', 'unit' => '万人', 'diff' => '前年同期比 −2.7%', 'up' => false, 'note' => 'JNTO 推計値（9/16発表）' ),
    array( 'label' => '旅行消費額（4〜6月期）', 'value' => '2.51',    'unit' => '兆円', 'diff' => '前年同期比 +0.3%', 'up' => true, 'note' => '観光庁 2次速報（9/30公表）' ),
  ),
);
/* 折れ線（前年＝灰、今年＝黒）を作る */
$gld_sp_all = array_merge( $gld_mv['monthly_prev'], $gld_mv['monthly_curr'] );
$gld_sp_max = max( $gld_sp_all );
$gld_sp_min = min( $gld_sp_all ) * 0.92;
$gld_sp = function ( $v ) use ( $gld_sp_max, $gld_sp_min ) {
  $p = array();
  foreach ( $v as $i => $x ) { $p[] = round( $i * 230 / 11, 1 ) . ',' . round( 46 - ( $x - $gld_sp_min ) / ( $gld_sp_max - $gld_sp_min ) * 46, 1 ); }
  return implode( ' ', $p );
};
$gld_last = end( $gld_mv['monthly_curr'] );
$gld_lx   = round( ( count( $gld_mv['monthly_curr'] ) - 1 ) * 230 / 11, 1 );
$gld_ly   = round( 46 - ( $gld_last - $gld_sp_min ) / ( $gld_sp_max - $gld_sp_min ) * 46, 1 );
?>
<div class="gld-mv-data">
  <p class="gld-mv-data__updated">最終更新 <?php echo esc_html( $gld_mv['updated'] ); ?>　<?php echo esc_html( $gld_mv['source'] ); ?></p>
  <div class="gld-mv-data__main">
    <div>
      <p class="gld-mv-data__label"><?php echo esc_html( $gld_mv['month_label'] ); ?></p>
      <p class="gld-mv-data__num"><b><?php echo esc_html( $gld_mv['month_value'] ); ?></b><span>万人</span></p>
      <p class="gld-mv-data__diff <?php echo $gld_mv['month_up'] ? 'is-up' : 'is-down'; ?>"><?php echo esc_html( $gld_mv['month_diff'] ); ?></p>
      <p class="gld-mv-data__note">JNTO 推計値（9/16発表）</p>
    </div>
    <figure class="gld-mv-data__chart">
      <svg viewBox="0 -4 230 54" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="<?php echo esc_attr( $gld_sp( $gld_mv['monthly_prev'] ) ); ?>" fill="none" stroke="#bbb" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
        <polyline points="<?php echo esc_attr( $gld_sp( $gld_mv['monthly_curr'] ) ); ?>" fill="none" stroke="#222" stroke-width="2" vector-effect="non-scaling-stroke"/>
        <circle cx="<?php echo esc_attr( $gld_lx ); ?>" cy="<?php echo esc_attr( $gld_ly ); ?>" r="3" fill="#c0392b"/>
      </svg>
      <figcaption><span class="is-cur">2026年</span><span class="is-prev">2025年</span><span class="is-axis">1月〜12月</span></figcaption>
    </figure>
  </div>
  <dl class="gld-mv-data__subs">
    <?php foreach ( $gld_mv['subs'] as $k ) : ?>
      <div>
        <dt><?php echo esc_html( $k['label'] ); ?></dt>
        <dd><b><?php echo esc_html( $k['value'] ); ?></b><span><?php echo esc_html( $k['unit'] ); ?></span><em class="<?php echo $k['up'] ? 'is-up' : 'is-down'; ?>"><?php echo esc_html( $k['diff'] ); ?></em></dd>
        <?php if ( ! empty( $k['note'] ) ) : ?><p class="gld-mv-data__note"><?php echo esc_html( $k['note'] ); ?></p><?php endif; ?>
      </div>
    <?php endforeach; ?>
  </dl>
</div>
<style>
/* 既存ヘッダーの右側の余白に置く。色・書体はテーマのまま、数字は等幅 */
/* 右端をページ本文の幅（約1120px）にそろえる。ブラウザが広くても端に寄りすぎない */
header.archive__mainVisual { --gld-mv-edge: max(32px, calc((100vw - 1120px) / 2)); }
@media (min-width: 1024px) {
  /* テンプレート下部の「right:32px !important」より強くするため、body のクラスを付けて指定 */
  html body.page-inbound-statistics header.archive__mainVisual .archive__mainVisualRight.tabBigPcOnly { right: var(--gld-mv-edge) !important; left: auto !important; }
}
/* データ欄の高さぶん、ヘッダーの最低の高さを確保（このテンプレートのみ） */
@media (min-width: 1024px) { header.archive__mainVisual { min-height: 340px; } }
.gld-mv-data { position: absolute; top: 50%; right: var(--gld-mv-edge); z-index: 2; width: min(540px, 44vw); transform: translateY(-54%); font-variant-numeric: tabular-nums; }
.gld-mv-data__updated { margin: 0 0 10px; font-size: 12px; letter-spacing: .02em; color: #888; }
.gld-mv-data__main { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: end; padding: 14px 0 16px; border-top: 1px solid #222; border-bottom: 1px solid #ddd; }
.gld-mv-data__label { margin: 0 0 4px; font-size: 12px; color: #666; }
.gld-mv-data__num { margin: 0; color: #222; line-height: 1; }
.gld-mv-data__num b { font-size: 44px; font-weight: 700; letter-spacing: -.02em; }
.gld-mv-data__num span { margin-left: 4px; font-size: 14px; }
.gld-mv-data__diff { margin: 8px 0 0; font-size: 12px; font-weight: 700; }
.gld-mv-data__chart { margin: 0; }
.gld-mv-data__chart svg { display: block; width: 100%; height: 56px; }
.gld-mv-data__chart figcaption { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: #888; }
.gld-mv-data__chart .is-cur::before, .gld-mv-data__chart .is-prev::before { content: ''; display: inline-block; width: 14px; height: 2px; margin-right: 5px; vertical-align: middle; background: #222; }
.gld-mv-data__chart .is-prev::before { background: #bbb; }
.gld-mv-data__chart .is-axis { margin-left: auto; }
.gld-mv-data__subs { display: grid; grid-template-columns: 1fr 1fr; margin: 0; }
.gld-mv-data__subs div { padding: 12px 0 0; }
.gld-mv-data__subs div + div { padding-left: 20px; border-left: 1px solid #ddd; }
.gld-mv-data__subs dt { margin: 0 0 4px; font-size: 12px; color: #666; }
.gld-mv-data__subs dd { margin: 0; color: #222; }
.gld-mv-data__subs b { font-size: 22px; font-weight: 700; letter-spacing: -.01em; }
.gld-mv-data__subs span { margin-left: 3px; font-size: 12px; }
.gld-mv-data__subs em { margin-left: 10px; font-size: 12px; font-style: normal; font-weight: 700; }
.gld-mv-data__note { margin: 4px 0 0; font-size: 11px; color: #888; }
.gld-mv-data .is-up { color: #1f7a5a; }
.gld-mv-data .is-down { color: #c0392b; }
/* スマホ・タブレットでは非表示（ヘッダーの下に別の簡易版を出す） */
@media (max-width: 1023px) { .gld-mv-data { display: none; } }
</style>

  <div class="archive__mainVisualRight tabBigPcOnly">
    <ul class="breadcrumb__list">
      <li class="breadcrumb__item"><a href="<?php echo home_url(); ?>">TOP</a></li>
      <li class="breadcrumb__item current"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
    </ul>
  </div>
</header>
<?php /* スマホ・タブレット用：ヘッダーの下に最新データを1行で表示（PCでは非表示） */ ?>
<div class="gld-mv-sp">
  <p class="gld-mv-sp__updated">最終更新 <?php echo esc_html( $gld_mv['updated'] ); ?>　<?php echo esc_html( $gld_mv['source'] ); ?></p>
  <dl class="gld-mv-sp__list">
    <div><dt><?php echo esc_html( $gld_mv['month_label'] ); ?></dt><dd><b><?php echo esc_html( $gld_mv['month_value'] ); ?></b>万人<em class="<?php echo $gld_mv['month_up'] ? 'is-up' : 'is-down'; ?>"><?php echo esc_html( str_replace( '前年同月比 ', '', $gld_mv['month_diff'] ) ); ?></em><small>JNTO 推計値（9/16発表）</small></dd></div>
    <?php foreach ( $gld_mv['subs'] as $k ) : ?>
      <div><dt><?php echo esc_html( str_replace( '旅行消費額', '消費額', $k['label'] ) ); ?></dt><dd><b><?php echo esc_html( $k['value'] ); ?></b><?php echo esc_html( $k['unit'] ); ?><em class="<?php echo $k['up'] ? 'is-up' : 'is-down'; ?>"><?php echo esc_html( preg_replace( '/^前年同.比 /u', '', $k['diff'] ) ); ?></em><?php if ( ! empty( $k['note'] ) ) : ?><small><?php echo esc_html( $k['note'] ); ?></small><?php endif; ?></dd></div>
    <?php endforeach; ?>
  </dl>
</div>
<style>
.gld-mv-sp { display: none; }
@media (max-width: 1023px) {
  .gld-mv-sp { display: block; padding: 14px 16px 16px; background: #f5f5f5; border-top: 1px solid #e5e5e5; font-variant-numeric: tabular-nums; }
  .gld-mv-sp__updated { margin: 0 0 10px; font-size: 11px; color: #888; }
  .gld-mv-sp__list { display: grid; grid-template-columns: repeat(3, 1fr); margin: 0; border-top: 1px solid #222; }
  .gld-mv-sp__list div { padding: 10px 0 0; }
  .gld-mv-sp__list div + div { padding-left: 10px; border-left: 1px solid #ddd; }
  .gld-mv-sp__list dt { margin: 0 0 4px; font-size: 10.5px; line-height: 1.3; color: #666; }
  .gld-mv-sp__list dd { margin: 0; font-size: 11px; color: #222; }
  .gld-mv-sp__list b { margin-right: 2px; font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
  .gld-mv-sp__list em { display: block; margin-top: 3px; font-size: 11px; font-style: normal; font-weight: 700; }
  .gld-mv-sp__list small { display: block; margin-top: 2px; font-size: 9.5px; line-height: 1.3; color: #888; }
  .gld-mv-sp .is-up { color: #1f7a5a; }
  .gld-mv-sp .is-down { color: #c0392b; }
}
</style>


<!-- 페이지 내 네비게이션 -->
<nav class="page-navigation">
  <div class="nav-container">
    <div class="nav-toggle">
      <span class="nav-toggle-text">目次</span>
      <span class="nav-toggle-icon">▼</span>
    </div>
    <div class="nav-items">
  <span class="nav-indicator" aria-hidden="true"></span>
  <a href="#visitors" class="nav-item">
    <span class="nav-number">01</span>
    <span class="nav-text">訪日外客統計</span>
  </a>
    <a href="#spending" class="nav-item">
    <span class="nav-number">02</span>
    <span class="nav-text">旅行消費額</span>
  </a>
  <a href="#stay" class="nav-item">
    <span class="nav-number">03</span>
    <span class="nav-text">外国人宿泊</span>
  </a>
  <a href="#calendar" class="nav-item">
    <span class="nav-number">04</span>
    <span class="nav-text">連休カレンダー</span>
  </a>
  <a href="<?php echo esc_url( home_url( '/download/?from=inbound_statistics&doc=market&via=nav' ) ); ?>" class="nav-item nav-item--report">
    <span class="nav-text">市場レポート（PDF）</span>
  </a>
</div>

  </div>
</nav>

<script>
(function () {
  'use strict';

  // ====== 0) 1회만 바인딩 ======
  var nav = document.querySelector('.page-navigation');
  if (!nav) return;
  if (nav.dataset.boundOnce === '1') return;
  nav.dataset.boundOnce = '1';

  // ====== 1) 요소 참조 ======
  var items  = nav.querySelector('.nav-items');
  var links  = items ? Array.prototype.slice.call(items.querySelectorAll('.nav-item')) : [];
  var toggle = nav.querySelector('.nav-toggle');

  // 인디케이터 준비(없으면 생성)
  var indicator = items && items.querySelector('.nav-indicator');
  if (items && !indicator) {
    indicator = document.createElement('span'); // span로 생성
    indicator.className = 'nav-indicator';
    items.appendChild(indicator);
  }

  // 현재 스크롤 스파이가 대상으로 삼을 섹션 목록
  var sections = [];

  // ====== 2) 유틸 ======
  function isMobile(){ return matchMedia('(max-width:768px)').matches; }

  // 스티키 내비 높이 + WP adminbar 보정
  function headerOffset(){
    var admin  = document.getElementById('wpadminbar');
    var navH   = nav ? nav.offsetHeight : 0;
    var adminH = admin ? admin.offsetHeight : 0;
    return navH + adminH + 12; // 여유 12px
  }

  function sectionByHash(h){
    if(!h || h.charAt(0) !== '#') return null;
    try { return document.querySelector(h); } catch(e){ return null; }
  }

  function throttle(fn, wait){
    var t, last=0;
    return function(){
      var now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, arguments); }
      else {
        clearTimeout(t);
        t = setTimeout(function(){ last = Date.now(); fn.apply(null, arguments); }, wait - (now - last));
      }
    };
  }

  // ====== 3) 토글(모바일) ======
  if (toggle && items) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'page-nav-items');
    if (!items.id) items.id = 'page-nav-items';

    toggle.addEventListener('click', function(){
      var willShow = !items.classList.contains('show');
      toggle.classList.toggle('active', willShow);
      items.classList.toggle('show', willShow);
      toggle.setAttribute('aria-expanded', String(willShow));
    });
  }

  if (!items || !links.length) return;

  // ====== 4) 인디케이터 / active 이동 ======
  function moveIndicator(active){
    if (!indicator || !active) return;
    var p = items.getBoundingClientRect();
    var a = active.getBoundingClientRect();
    var left = (a.left - p.left) + items.scrollLeft;
    indicator.style.width = a.width + 'px';
    indicator.style.transform = 'translateX(' + left + 'px)';
    indicator.style.opacity = '1';
  }

  function centerIntoView(active){
    if (!active) return;
    var box = active.getBoundingClientRect();
    var parent = items.getBoundingClientRect();
    var offset = (box.left - parent.left) - (parent.width / 2 - box.width / 2);
    if (items.scrollWidth > items.clientWidth) {
      items.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  function setActive(hash){
    if (!hash) return;
    links.forEach(function(a){ a.classList.remove('active'); });
    var target = items.querySelector('a[href="'+hash+'"]');
    if (target){
      target.classList.add('active');
      centerIntoView(target);
      moveIndicator(target);
    }
  }

  // ====== 5) 섹션 목록 재빌드 ======
  function rebuildSections() {
    sections = links
      .map(function(a){ return sectionByHash(a.getAttribute('href')); })
      .filter(Boolean);
  }

  // ====== 6) 스크롤스파이 (센터 가중치 + 가시영역 + 고정헤더 보정) ======
  function markByScrollPosition() {
    if (!sections.length) rebuildSections();

    var offset  = headerOffset();
    var centerY = window.scrollY + (window.innerHeight / 2);

    var best = null, bestScore = -1;

    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (!sec || !sec.id) continue;

      var r = sec.getBoundingClientRect();
      var top = r.top + window.pageYOffset;
      var bottom = top + Math.max(1, r.height);

      // 현재 뷰포트와의 겹치는 픽셀
      var visiblePx = Math.max(0, Math.min(bottom, window.scrollY + window.innerHeight) - Math.max(top, window.scrollY));
      var ratio = visiblePx / Math.max(1, r.height);

      // 섹션 중앙과 뷰포트 중앙의 거리
      var mid = top + r.height / 2;
      var dist = Math.abs(mid - centerY);

      // 스코어: 가시비율↑, 거리↓
      var score = ratio * 1000 - dist / 1000;

      // 헤더 하단 기준으로 "지금 지나가고 있는 섹션" 가중치
      var cur = window.scrollY + offset + 1;
      if (cur >= top && cur < bottom) score += 50;

      if (score > bestScore) { bestScore = score; best = sec; }
    }

    // 페이지 최상단 근처 → 첫 섹션
    if (window.scrollY < offset && sections[0]) best = sections[0];

    // 페이지 바닥 근처 → 마지막 섹션
    var isEnd = (window.innerHeight + window.pageYOffset) >= (document.body.offsetHeight - 1);
    if (isEnd && sections.length) best = sections[sections.length - 1];

    if (best) setActive('#' + best.id);
  }

  // ====== 7) 스무스 스크롤 (클릭) ======
  links.forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if (!href || href.indexOf('#') !== 0) return;
      var sec = sectionByHash(href); if(!sec) return;

      e.preventDefault();

      var top = Math.max(0, sec.getBoundingClientRect().top + window.pageYOffset - headerOffset());
      window.scrollTo({ top: top, behavior: 'smooth' });

      if (isMobile()) {
        toggle && toggle.classList.remove('active');
        items.classList.remove('show');
        toggle && toggle.setAttribute('aria-expanded', 'false');
      }

      setActive(href);
      if (history.replaceState) history.replaceState(null, '', href);
    });
  });

  // ====== 8) 초기화 ======
  function initFromHashOrFirst(){
    rebuildSections();

    var h = location.hash;
    if (h && sectionByHash(h)) {
      setTimeout(function(){
        var sec = sectionByHash(h);
        if (sec) {
          var top = Math.max(0, sec.getBoundingClientRect().top + window.pageYOffset - headerOffset());
          window.scrollTo(0, top);
          setActive(h);
        }
      }, 0);
    } else {
      // 첫 로드 위치에서 판단
      markByScrollPosition();
    }
  }

  function refreshIndicator(){
    var act = items.querySelector('.nav-item.active') || links[0];
    if (act) moveIndicator(act);
  }

  // ====== 9) 이벤트 바인딩 ======
  window.addEventListener('scroll', throttle(markByScrollPosition, 80), { passive: true });

  window.addEventListener('load', function(){
    setTimeout(initFromHashOrFirst, 50);
    setTimeout(refreshIndicator, 150);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){ setTimeout(refreshIndicator, 0); });
  }

  window.addEventListener('resize', throttle(function(){
    refreshIndicator();
    markByScrollPosition(); // 리사이즈 시 재계산
  }, 120));

  items.addEventListener('scroll', throttle(function(){
    var act = items.querySelector('.nav-item.active');
    if (act) moveIndicator(act);
  }, 80));

  // ====== 10) 동적 콘텐츠(숏코드/차트) 감지 → 섹션 재빌드 & 재계산 ======
  (function(){
    if (!('MutationObserver' in window)) return;

    // 섹션들이 들어있는 컨테이너들을 관찰(필요시 추가 가능)
    var targets = Array.prototype.slice.call(document.querySelectorAll(
      '.pageSection, #overview, #country, #spending, #spending-details, #historical, #calendar'
    )).filter(Boolean);

    if (!targets.length) return;

    var mo = new MutationObserver(throttle(function(){
      rebuildSections();
      markByScrollPosition();
      refreshIndicator();
    }, 150));

    targets.forEach(function(el){
      mo.observe(el, { childList: true, subtree: true, attributes: true });
    });

    // 레이아웃이 늦게 안정되는 경우를 한 번 더 커버
    setTimeout(function(){
      rebuildSections();
      markByScrollPosition();
      refreshIndicator();
    }, 600);
  })();

})();
</script>

<!-- 🔧 올바른 HTML 구조 시작 -->
<div class="inboundCaseWrapper">
  <article class="archive__contents archive__contents--single">

<?php
/* =====================================================================
   月次レポートの案内（Inbound Statistics テンプレート用）
   ■ 毎月の更新は $gld_report の中だけ
     - 'pages' と 'toc' は render_report.py が出力する out/gld_report_toc-YYYYMM.txt をそのまま貼る
   ■ 置き場所：<article class="archive__contents archive__contents--single"> の直後
   ■ 呼び出し：
       上   <?php gld_report_cta( 'top', false, 'details' ); ?>  … 大きい版＋収録内容（開閉式）
       中   <?php gld_report_cta( 'mid', true ); ?>              … 小さい版
       下   <?php gld_report_cta( 'bottom', true, 'open' ); ?>   … 小さい版＋収録内容（常に表示）
   ===================================================================== */
$GLOBALS['gld_report'] = array(
  'data_month' => '2026年8月',       // レポートの対象月
  'issue'      => '2026年9月発行',
  'next'       => '10月下旬',          // 次回更新の目安
  'next_note'  => 'JNTO 9月推計値の発表後',
  'tags'       => array( '主要9市場の動き', '都道府県・国籍別データ', '訪日需要カレンダー' ),
  'pages'      => 38,
  'toc'        => array(   // 収録内容（render_report.py が自動で作成）
    array( 'no' => '1', 'title' => '訪日客数', 'note' => '5ページ', 'items' => array( array( '', '長期推移と2030年目標', '' ), array( '', '月別推移（過去の年との比較）', '' ), array( '', '国・地域別 上位10市場', '' ), array( '', '主要9市場の動きと背景', '' ), array( '', '累計の構成', '' ) ) ),
    array( 'no' => '2', 'title' => '旅行消費', 'note' => '4ページ', 'items' => array( array( '', '旅行消費額と1人当たり支出の推移（四半期）', '' ), array( '', '旅行消費額（国・地域別・費目別）', '' ), array( '', '前年同期との比較（国・地域別）', '' ), array( '', '買物代 上位10市場', '' ) ) ),
    array( 'no' => '3', 'title' => 'これからの需要', 'note' => '1ページ', 'items' => array( array( '', '訪日需要カレンダー2027', '' ) ) ),
    array( 'no' => '資', 'title' => '資料編', 'note' => '数表・23ページ', 'items' => array( array( 'A1', '訪日外客数 全市場一覧', '' ), array( 'A2', '旅行消費額 国・地域別（四半期・累計・前年）', '' ), array( 'A3', '買物代 全市場', '' ), array( 'A4', '購入者単価 市場の比較', '' ), array( 'A5', '購入者単価 市場別・前年比', '全国籍＋10市場' ), array( 'A6', '都道府県別の旅行消費額', '47都道府県' ), array( 'A7', '国籍別の訪問地域', '' ), array( 'A8', '出発前に役立った旅行情報源（市場別）', '' ), array( 'A9', '日本で利用した買物場所（市場別）', '' ), array( 'A10', '都道府県別の外国人延べ宿泊者数', '' ), array( 'A11', '都道府県別の外国人宿泊（国籍別の割合）', '主要9市場' ) ) ),
  ),
  'images'     => array(               // 後ろ → 手前の順（3枚目が表紙）
    'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/inbound-report-202608-v3-teaser2.jpg',
    'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/inbound-report-202608-v3-teaser1.jpg',
    'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/inbound-report-202608-v3-thumb.jpg',
  ),
  // このページ内で開く資料DLモーダル用（/download/ の市場レポートのカードと同じ値にする）
  'pdf'        => 'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/gld-inbound-report-202608-v4-final_1.pdf',
  'teasers'    => array(
    'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/inbound-report-202608-v3-teaser1.jpg',
    'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/inbound-report-202608-v3-teaser2.jpg',
    'https://www.gldaily.com/gld-kanri/wp-content/uploads/2026/10/inbound-report-202608-v3-teaser3.jpg',
  ),
);
/* ヘッダーの「◯月更新」タグ用：data_month が変わったら保存（header.php が読む） */
if ( get_option( 'gld_report_month' ) !== $GLOBALS['gld_report']['data_month'] ) {
  update_option( 'gld_report_month', $GLOBALS['gld_report']['data_month'], false );
  update_option( 'gld_report_month_at', current_time( 'timestamp' ), false );
}
if ( ! function_exists( 'gld_report_toc' ) ) {
  /* 収録内容：1列目＝最初の章、2列目＝残りの章、3列目＝資料編 */
  function gld_report_toc( $toc ) {
    $cols = array( array(), array(), array() );
    foreach ( $toc as $i => $g ) {
      if ( $g['no'] === '資' ) { $cols[2][] = $g; } elseif ( $i === 0 ) { $cols[0][] = $g; } else { $cols[1][] = $g; }
    }
    echo '<div class="gld-report__toc">';
    foreach ( $cols as $col ) {
      echo '<div>';
      foreach ( $col as $g ) {
        echo '<h4><b>' . esc_html( $g['no'] ) . '</b>' . esc_html( $g['title'] ) . '<small>' . esc_html( $g['note'] ) . '</small></h4><ul>';
        foreach ( $g['items'] as $it ) {
          echo '<li>' . ( $it[0] !== '' ? '<i>' . esc_html( $it[0] ) . '</i>' : '' ) . esc_html( $it[1] ) . ( $it[2] !== '' ? '<em>' . esc_html( $it[2] ) . '</em>' : '' ) . '</li>';
        }
        echo '</ul>';
      }
      echo '</div>';
    }
    echo '</div>';
  }
}

if ( ! function_exists( 'gld_report_cta' ) ) {
  /* $toc：'none'＝出さない／'details'＝「収録内容を見る」で開閉／'open'＝常に表示 */
  function gld_report_cta( $via, $compact = false, $toc = 'none' ) {
    $r   = $GLOBALS['gld_report'];
    $url = home_url( '/download/?from=inbound_statistics&doc=market&via=' . rawurlencode( $via ) ); ?>
    <aside class="gld-report<?php echo $compact ? ' gld-report--compact' : ''; ?>">
      <div class="gld-report__stack" aria-hidden="true">
        <?php foreach ( $r['images'] as $img ) : ?>
          <img src="<?php echo esc_url( $img ); ?>" alt="" loading="lazy">
        <?php endforeach; ?>
      </div>
      <div class="gld-report__body">
        <?php if ( $compact ) : ?>
          <p class="gld-report__title">このデータを、毎月PDFで</p>
          <p class="gld-report__issue">市場レポート最新号：<?php echo esc_html( $r['data_month'] ); ?>データ（全<?php echo (int) $r['pages']; ?>ページ）</p>
        <?php else : ?>
          <p class="gld-report__badge"><span>毎月更新</span>JNTOの発表にあわせてPDFでお届け</p>
          <p class="gld-report__title">インバウンド市場レポート</p>
          <p class="gld-report__issue">最新号：<?php echo esc_html( $r['data_month'] ); ?>データ<span class="gld-report__issue-sub">（<?php echo esc_html( $r['issue'] ); ?>）</span></p>
          <ul class="gld-report__meta">
            <li>PDF <?php echo (int) $r['pages']; ?>ページ</li>
            <?php foreach ( $r['tags'] as $t ) : ?><li><?php echo esc_html( $t ); ?></li><?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div>
      <div class="gld-report__action">
        <a class="gld-report__btn" href="<?php echo esc_url( $url ); ?>">最新号をダウンロード</a>
        <?php if ( ! $compact ) : ?>
          <p class="gld-report__next">次回更新：<?php echo esc_html( $r['next'] ); ?><br>（<?php echo esc_html( $r['next_note'] ); ?>）</p>
        <?php endif; ?>
      </div>
      <?php if ( ! empty( $r['toc'] ) && $toc === 'details' ) : ?>
        <details class="gld-report__more"><summary>収録内容を見る（全<?php echo (int) $r['pages']; ?>ページ）</summary><?php gld_report_toc( $r['toc'] ); ?></details>
      <?php elseif ( ! empty( $r['toc'] ) && $toc === 'open' ) : ?>
        <div class="gld-report__more is-open"><p class="gld-report__toc-h">収録内容（全<?php echo (int) $r['pages']; ?>ページ）</p><?php gld_report_toc( $r['toc'] ); ?></div>
      <?php endif; ?>
    </aside>
  <?php }
}
?>
<style>
.gld-report {
  display: grid;
  grid-template-columns: 260px 1fr auto;
  gap: 36px;
  align-items: center;
  margin: 40px 0 16px;
  padding: 28px 32px;
  border-top: 3px solid #1f3557;
  background: #f3f5f8;
}
.gld-report__stack { position: relative; height: 170px; }
.gld-report__stack img {
  position: absolute;
  width: 200px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid #d5dbe5;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 53, 87, 0.18);
}
.gld-report__stack img:nth-child(1) { left: 52px; top: 0;    transform: rotate(4deg); }
.gld-report__stack img:nth-child(2) { left: 28px; top: 22px; transform: rotate(-2deg); }
.gld-report__stack img:nth-child(3) { left: 0;    top: 48px; }
.gld-report__badge { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font-size: 12px; font-weight: 700; color: #1f3557; }
.gld-report__badge span { flex-shrink: 0; white-space: nowrap; padding: 3px 10px; background: #1f3557; font-size: 11px; letter-spacing: 0.06em; color: #fff; }
.gld-report__title { margin: 0; font-size: 22px; font-weight: 900; line-height: 1.4; color: #1d2433; }
.gld-report__issue { margin: 6px 0 12px; font-size: 14px; font-weight: 700; color: #c8343a; }
.gld-report__meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.gld-report__meta li { padding: 3px 10px; border: 1px solid #c9d0db; background: #fff; font-size: 12px; font-weight: 600; color: #556074; }
.gld-report__action { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.gld-report__btn {
  padding: 15px 34px;
  border-radius: 999px;
  background: #1f3557;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  color: #fff;
  text-decoration: none;
  transition: background 0.2s;
}
.gld-report__btn:hover { background: #2b4a78; color: #fff; }
.gld-report__next { margin: 0; font-size: 11.5px; line-height: 1.5; text-align: center; color: #8a93a3; }

/* 収録内容（目次） */
.gld-report__more { grid-column: 1 / -1; margin-top: -8px; border-top: 1px solid #d5dbe5; }
.gld-report__more summary { padding: 12px 0 2px; font-size: 13px; font-weight: 800; color: #1f3557; cursor: pointer; list-style: none; }
.gld-report__more summary::-webkit-details-marker { display: none; }
.gld-report__more summary::before { content: '＋ '; }
.gld-report__more[open] summary::before { content: '－ '; }
.gld-report__toc-h { margin: 0; padding: 12px 0 2px; font-size: 13px; font-weight: 800; color: #1f3557; }
.gld-report__toc { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 0 28px; padding-top: 10px; }
.gld-report__toc h4 { display: flex; align-items: baseline; gap: 8px; margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #1d2433; }
.gld-report__toc h4 b { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #1f3557; font-size: 10px; color: #fff; }
.gld-report__toc h4 small { font-size: 11px; font-weight: 600; color: #8a93a3; }
.gld-report__toc ul { margin: 0 0 12px; padding: 0; list-style: none; }
.gld-report__toc li { display: flex; gap: 8px; padding: 3px 0; border-bottom: 1px dotted #c9d0db; font-size: 12px; line-height: 1.5; color: #556074; }
.gld-report__toc li i { flex-shrink: 0; min-width: 22px; font-style: normal; font-weight: 800; color: #1f3557; }
.gld-report__toc li em { margin-left: auto; padding-left: 8px; font-size: 11px; font-style: normal; white-space: nowrap; color: #8a93a3; }

/* 小さい版（中段・下段） */
.gld-report--compact { grid-template-columns: 120px 1fr auto; gap: 24px; padding: 18px 24px; }
.gld-report--compact .gld-report__stack { height: 72px; }
.gld-report--compact .gld-report__stack img { width: 110px; box-shadow: 0 3px 10px rgba(31, 53, 87, 0.15); }
.gld-report--compact .gld-report__stack img:nth-child(1),
.gld-report--compact .gld-report__stack img:nth-child(2) { display: none; }
.gld-report--compact .gld-report__stack img:nth-child(3) { top: 6px; }
.gld-report--compact .gld-report__title { font-size: 17px; }
.gld-report--compact .gld-report__issue { margin: 2px 0 0; font-size: 13px; }

/* 目次右端のリンク：上の案内が画面から消えたら表示 */
.nav-items .nav-item--report {
  margin-left: auto;
  border-color: #1f3557;
  font-weight: 700;
  color: #1f3557;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
}
.nav-items .nav-item--report.is-visible { opacity: 1; visibility: visible; }
.nav-items .nav-item--report:hover { background: #1f3557; color: #fff; }

@media (max-width: 900px) {
  .gld-report { grid-template-columns: 1fr; gap: 18px; padding: 22px 20px; }
  .gld-report__badge { font-size: 11px; }
  .gld-report__title { font-size: 20px; }
  .gld-report__issue-sub { display: block; font-size: 12px; font-weight: 600; color: #8a93a3; }
  .gld-report--compact .gld-report__title { font-size: 15px; }
  .gld-report--compact .gld-report__issue { font-size: 12px; }
  .gld-report__stack { height: 150px; }
  .gld-report__action { align-items: stretch; }
  .gld-report__btn { text-align: center; }
  .gld-report--compact { grid-template-columns: 90px 1fr; }
  .gld-report--compact .gld-report__stack { height: 56px; }
  .gld-report--compact .gld-report__stack img { width: 86px; }
  .gld-report--compact .gld-report__action { grid-column: 1 / -1; }
  .gld-report__more { margin-top: 0; }
  .gld-report__toc { grid-template-columns: 1fr; }
  .nav-items .nav-item--report { margin-left: 0; opacity: 1; visibility: visible; }
}
</style>
<?php gld_report_cta( 'top', false, 'details' ); ?>
<script>
(function () {
  var link = document.querySelector('.nav-item--report');
  var card = document.querySelector('.gld-report');
  if (!link || !card) return;
  if (!('IntersectionObserver' in window)) { link.classList.add('is-visible'); return; }
  new IntersectionObserver(function (entries) {
    link.classList.toggle('is-visible', !entries[0].isIntersecting);
  }).observe(card);
})();
</script>



<!-- ============================================
     01. 訪日外客統計ダッシュボード (React)
     - 最新月次 / 年間総括 / 推移データ / 国・地域別 を統合
============================================ -->
<section id="visitors" class="pageSection visitorsSection">
  <header class="pageSectionTitle">
    <div class="pageSectionTitle__title">
      <span class="pageSectionTitle__number">01</span>
      <h3 class="pageSectionTitle__main">訪日外客統計</h3>
      <p class="pageSectionTitle__sub">インタラクティブダッシュボード</p>
    </div>
    <a href="https://www.jnto.go.jp/statistics/data/_files/20260916_1615-1.pdf" target="_blank" class="source-badge">
  出典：JNTO（2026.9.16）<span class="external-icon">↗</span>
</a>
  </header>

<style>
.pageSectionTitle {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}
.source-badge {
  font-size: 11px;
  color: #666;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  transition: all 0.2s;
  white-space: nowrap;
}
.source-badge:hover {
  background: #f0f0f0;
  border-color: #ccc;
  color: #333;
}
.source-badge .external-icon {
  margin-left: 4px;
  font-size: 10px;
}
@media (max-width: 600px) {
  .source-badge {
    font-size: 10px;
    padding: 4px 8px;
  }
}
</style>
  
  <div class="visitors-dashboard-wrapper">
    <iframe 
      src="https://inbound-visitors.vercel.app" 
      width="100%" 
      frameborder="0"
      style="border: none; min-height: 900px;"
      loading="lazy"
      title="訪日外客統計ダッシュボード"
    ></iframe>
  </div>

<script>
// iframe 높이 자동 조절 (sender 검증)
(function() {
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setHeight') {
      var iframe = document.querySelector('.visitors-dashboard-wrapper iframe');
      // 이 iframe이 직접 보낸 메시지만 처리 (다른 iframe 메시지 무시)
      if (iframe && e.source === iframe.contentWindow) {
        iframe.style.display = 'block';
        iframe.style.minHeight = '0';
        iframe.style.height = e.data.height + 'px';
        var el = iframe.parentElement;
        while (el && el !== document.body) {
          el.style.height = 'auto';
          el = el.parentElement;
        }
      }
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    var iframe = document.querySelector('.visitors-dashboard-wrapper iframe');
    if (iframe) {
      iframe.addEventListener('load', function() {
        iframe.contentWindow.postMessage({ type: 'requestHeight' }, '*');
      });
    }
  });
})();
</script>

<style>
.visitors-dashboard-wrapper {
  margin: 0;
  padding: 0;
}
.visitors-dashboard-wrapper iframe {
  width: 100%;
  min-height: 900px;
  transition: height 0.3s ease;
}
@media (max-width: 768px) {
  .visitors-dashboard-wrapper iframe {
    min-height: 700px;
  }
}
</style>
</section>


<!-- 02. 旅行消費額 - React Dashboard -->
<section id="spending" class="pageSection spendingSection">
  <header class="pageSectionTitle">
    <div class="pageSectionTitle__title">
      <span class="pageSectionTitle__number">02</span>
      <h3 class="pageSectionTitle__main">訪日外国人旅行消費額</h3>
      <p class="pageSectionTitle__sub">インタラクティブダッシュボード</p>
    </div>
  </header>
  
  <div class="spending-dashboard-wrapper">
    <iframe 
      src="https://inbounddata0128.vercel.app" 
      width="100%" 
      frameborder="0"
      style="border: none;"
      loading="lazy"
      title="訪日外国人消費動向ダッシュボード"
    ></iframe>
  </div>

<script>
// 리스너를 최대한 빨리 등록 (sender 검증)
(function() {
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setHeight') {
      var iframe = document.querySelector('.spending-dashboard-wrapper iframe');
      // 이 iframe이 직접 보낸 메시지만 처리 (다른 iframe 메시지 무시)
      if (iframe && e.source === iframe.contentWindow) {
        iframe.style.display = 'block';
        iframe.style.minHeight = '0';
        iframe.style.height = e.data.height + 'px';
        
        // 모든 부모 요소 높이를 auto로
        var el = iframe.parentElement;
        while (el && el !== document.body) {
          el.style.height = 'auto';
          el = el.parentElement;
        }
      }
    }
  });

  // iframe 로드 완료 후 높이 재요청
  document.addEventListener('DOMContentLoaded', function() {
    var iframe = document.querySelector('.spending-dashboard-wrapper iframe');
    if (iframe) {
      iframe.addEventListener('load', function() {
        iframe.contentWindow.postMessage({ type: 'requestHeight' }, '*');
      });
    }
  });
})();
</script>
</section>


 <?php gld_report_cta( 'mid', true ); ?>

<?php
/* =====================================================================
   03 外国人宿泊（Inbound Statistics テンプレート用）2026.10.6 v2
   ■ 置き場所：<?php gld_report_cta( 'mid', true ); ?> の直後（訪日需要カレンダーの前）
   ■ 毎月の更新：$gld_stay = array( … ); の中だけ。
     render_report.py が出力する out/gld_stay_section-YYYYMM.txt をそのまま貼り替える（画像のアップロードは不要）
   ■ $gld_jp_geo（地図の形）は毎月さわらない
   ===================================================================== */
$gld_stay = array(   // 外国人宿泊（render_report.py が自動で作成。ここから下の行ごと差し替え）
  'period'   => '2026年1〜7月（第2次速報）',          // 都道府県別（推移表）
  'period_n' => '2026年1〜7月（第2次速報）',          // 国籍別（各月の集計結果）
  'total'    => '9,656',   // 外国人延べ宿泊者数（万人泊）
  'yoy'      => -8.5,
  'published'=> '2026年9月30日',   // 最新月の第2次速報の公表日
  'next'     => '2026年10月30日',   // 次回（2026年8月分）の公表予定
  'next_m'   => '2026年8月分',
  'metro'    => array( 64.4, -11.2 ),   // 三大都市圏（構成比・前年同期比）
  'local'    => array( 35.6, -3.0 ),   // 地方部
  'map'      => '{"markets":["韓国","中国","台湾","香港","米国","タイ","マレーシア","インドネシア","ベトナム"],"rows":[["東京都",[2232970,3191330,2571120,931660,4885500,726960,403580,523290,137500],[0.6,1.06,0.58,0.73,1.46,0.92,0.96,1.32,0.78]],["大阪府",[2165520,1548160,1534180,550070,1215980,357710,223370,199260,108750],[1.28,1.13,0.75,0.95,0.8,0.99,1.17,1.11,1.36]],["京都府",[397150,697350,737300,145650,1448390,82250,96880,82560,40440],[0.39,0.84,0.6,0.42,1.57,0.38,0.84,0.76,0.84]],["北海道",[1394140,884400,1602010,434120,403650,342770,204600,115220,28020],[1.5,1.18,1.43,1.37,0.48,1.73,1.95,1.16,0.64]],["福岡県",[1630370,392270,943980,464000,104830,93310,32910,19890,6030],[2.81,0.84,1.35,2.34,0.2,0.76,0.5,0.32,0.22]],["沖縄県",[699050,210520,1356530,254230,342460,30270,11760,4430,1330],[1.4,0.52,2.25,1.48,0.76,0.28,0.21,0.08,0.06]],["千葉県",[168210,218970,336940,54110,430440,129180,48980,45310,29020],[0.5,0.81,0.84,0.47,1.43,1.82,1.3,1.27,1.84]],["神奈川県",[128940,347940,222340,84470,395810,55120,30990,18040,17420],[0.43,1.44,0.62,0.83,1.47,0.87,0.92,0.57,1.24]],["愛知県",[376370,232320,616960,141550,78340,76820,26450,35610,38760],[1.28,0.98,1.75,1.41,0.3,1.23,0.8,1.14,2.8]],["長野県",[31680,102590,248580,65590,87410,71140,24780,28180,7770],[0.2,0.8,1.31,1.22,0.61,2.12,1.39,1.68,1.04]],["広島県",[98530,59950,97490,26290,159280,5550,4460,4720,4990],[0.64,0.48,0.53,0.5,1.14,0.17,0.26,0.29,0.69]],["山梨県",[49210,122300,181060,73040,75380,108130,36020,22560,26870],[0.33,1.02,1.02,1.44,0.56,3.44,2.16,1.43,3.84]],["石川県",[28570,66740,205550,32700,120740,10110,11880,16340,3820],[0.21,0.6,1.24,0.69,0.97,0.34,0.76,1.11,0.59]],["兵庫県",[125890,172400,291390,52620,54290,13230,7690,5970,4610],[0.99,1.67,1.9,1.21,0.47,0.49,0.54,0.44,0.77]],["岐阜県",[74690,57190,176600,43400,55190,53330,23150,21270,12390],[0.64,0.6,1.25,1.08,0.52,2.13,1.75,1.7,2.23]],["静岡県",[136900,161310,107310,52240,56150,42070,20190,16570,18700],[1.19,1.73,0.77,1.32,0.54,1.71,1.55,1.35,3.43]],["熊本県",[259530,44740,249340,23990,18420,12660,6890,2460,1650],[2.55,0.54,2.03,0.69,0.2,0.58,0.6,0.23,0.34]],["大分県",[278810,33890,182380,56840,16680,20310,6120,5110,3080],[2.89,0.43,1.57,1.72,0.19,0.99,0.56,0.5,0.68]],["宮城県",[20400,65270,305620,46990,32320,41230,7020,5240,2320],[0.23,0.89,2.8,1.52,0.39,2.14,0.69,0.54,0.54]],["香川県",[148260,46470,219810,31950,9810,1710,1130,580,600],[2.12,0.82,2.61,1.34,0.16,0.12,0.14,0.08,0.18]],["新潟県",[32950,51950,153370,41100,23920,16790,6890,4410,3180],[0.51,1.0,1.98,1.87,0.41,1.23,0.95,0.64,1.05]],["鹿児島県",[163860,35460,63900,14950,24100,2920,2230,1580,900],[3.14,0.84,1.02,0.84,0.51,0.26,0.38,0.28,0.37]],["長崎県",[123600,21990,45980,17030,34390,6170,3490,3270,1510],[2.42,0.53,0.75,0.97,0.74,0.57,0.61,0.6,0.63]],["愛媛県",[176730,15070,81700,10840,11910,1160,1110,670,1140],[3.73,0.39,1.43,0.67,0.28,0.12,0.21,0.13,0.51]],["岡山県",[22380,20080,179290,12400,14440,3490,2160,1770,2830],[0.48,0.53,3.17,0.77,0.34,0.35,0.41,0.35,1.28]],["青森県",[37100,58190,129670,21720,23050,8170,4890,2050,1850],[0.79,1.53,2.3,1.36,0.54,0.82,0.93,0.41,0.84]],["和歌山県",[26940,60180,43600,38120,16290,2930,3010,900,1070],[0.7,1.92,0.94,2.88,0.47,0.36,0.69,0.22,0.59]],["福島県",[2850,13120,173310,9570,9080,16460,3250,3100,2050],[0.08,0.43,3.8,0.74,0.27,2.04,0.76,0.77,1.15]],["岩手県",[12050,17920,111890,22310,12660,10380,2160,2190,5800],[0.35,0.64,2.71,1.9,0.41,1.42,0.56,0.6,3.57]],["富山県",[12890,26550,53650,10030,8330,17510,4850,4130,930],[0.42,1.06,1.44,0.95,0.3,2.66,1.39,1.25,0.64]],["奈良県",[23320,29100,24980,11260,35050,3830,2210,1590,790],[0.78,1.2,0.69,1.1,1.3,0.6,0.66,0.5,0.56]],["茨城県",[31700,42650,34900,3670,16890,7550,1840,4440,3940],[1.11,1.84,1.01,0.37,0.65,1.24,0.57,1.45,2.91]],["栃木県",[25010,23310,32660,8400,22100,7210,2540,2300,3360],[0.91,1.04,0.98,0.89,0.89,1.23,0.82,0.78,2.58]],["山形県",[5270,23090,79450,17240,6320,11500,3910,2210,1220],[0.2,1.09,2.53,1.93,0.27,2.07,1.33,0.8,0.99]],["群馬県",[10650,21400,40720,18350,16720,10460,2920,2270,2060],[0.42,1.04,1.33,2.12,0.73,1.94,1.02,0.84,1.72]],["三重県",[13080,25260,44660,16610,13260,8910,2430,2090,3930],[0.52,1.24,1.48,1.93,0.58,1.67,0.86,0.78,3.31]],["埼玉県",[13870,32450,23890,5590,18800,10590,2980,2960,2760],[0.59,1.7,0.84,0.69,0.88,2.11,1.12,1.18,2.48]],["滋賀県",[16340,21490,46190,20770,10320,4550,2810,1010,1860],[0.71,1.15,1.67,2.64,0.5,0.93,1.08,0.41,1.71]],["佐賀県",[72820,14250,25820,11000,3680,1410,620,390,290],[3.72,0.9,1.1,1.64,0.21,0.34,0.28,0.19,0.31]],["宮崎県",[48670,6700,40080,4450,4330,1350,1040,910,790],[2.64,0.45,1.81,0.71,0.26,0.34,0.5,0.46,0.91]],["鳥取県",[32310,14880,33910,8020,5330,1810,1120,370,360],[2.03,1.16,1.77,1.47,0.37,0.53,0.62,0.22,0.48]],["山口県",[53950,6220,12400,4320,11790,1120,560,710,840],[3.52,0.5,0.67,0.82,0.85,0.34,0.32,0.43,1.16]],["徳島県",[33440,6770,18400,10310,4730,1030,950,710,440],[2.44,0.61,1.12,2.2,0.38,0.35,0.62,0.49,0.68]],["高知県",[9750,9580,35270,6110,4180,640,660,580,530],[0.85,1.03,2.56,1.56,0.4,0.26,0.51,0.47,0.98]],["秋田県",[3580,8130,36640,2260,4740,2360,1430,900,1080],[0.32,0.91,2.76,0.6,0.48,1.01,1.15,0.77,2.08]],["福井県",[3350,8750,20250,5730,3630,2600,560,940,1100],[0.4,1.3,2.02,2.01,0.48,1.47,0.6,1.06,2.79]],["島根県",[10260,6680,17720,2260,2870,640,260,230,680],[1.38,1.11,1.98,0.89,0.43,0.4,0.31,0.29,1.93]]]}',
  'top10'    => array(   // 都道府県・万人泊・前年同期比・外国人比率
    array( '東京都', '3,140', -10.3, 57.9 ),
    array( '大阪府', '1,296', -13.0, 45.9 ),
    array( '京都府', '882', -16.2, 52.6 ),
    array( '北海道', '729', -10.7, 30.1 ),
    array( '福岡県', '483', -1.3, 38.0 ),
    array( '沖縄県', '480', -8.0, 28.2 ),
    array( '神奈川県', '276', 3.5, 20.0 ),
    array( '千葉県', '251', -10.1, 15.5 ),
    array( '愛知県', '230', -20.1, 19.8 ),
    array( '長野県', '170', 5.3, 15.9 ),
  ),
  'nat'      => array(   // 国籍・特化係数の高い3県
    array( '韓国', '愛媛（3.7倍）・佐賀（3.7倍）・鹿児島（3.1倍）' ),
    array( '中国', '和歌山（1.9倍）・静岡（1.7倍）・兵庫（1.7倍）' ),
    array( '台湾', '福島（3.8倍）・岡山（3.2倍）・宮城（2.8倍）' ),
    array( '香港', '和歌山（2.9倍）・滋賀（2.6倍）・福岡（2.3倍）' ),
    array( '米国', '京都（1.6倍）・神奈川（1.5倍）・東京（1.5倍）' ),
    array( 'タイ', '山梨（3.4倍）・富山（2.7倍）・宮城（2.1倍）' ),
    array( 'マレーシア', '山梨（2.2倍）・北海道（2.0倍）・岐阜（1.7倍）' ),
    array( 'インドネシア', '岐阜（1.7倍）・長野（1.7倍）・山梨（1.4倍）' ),
    array( 'ベトナム', '山梨（3.8倍）・岩手（3.6倍）・静岡（3.4倍）' ),
  ),
);
$gld_jp_geo = <<<'JSON'
{"w":420,"h":440,"box":[8,8,120,128],"p":{"群馬県":"M252.7,244.6L252.7,244.6L251.9,244.4L251.5,244.9L251.3,245.5L250.5,246.8L250.6,247.5L250.1,248.2L248.9,248.4L248.6,248.3L248,249.1L247.5,249L246.4,249.6L246.1,250.3L246,250.4L244.6,250.4L243.8,251.6L243.3,251.5L242.2,250.6L242.2,249.1L242.4,248.4L241.5,247.9L241.1,247.2L242.3,247.1L242.3,246.3L241.6,245.3L241.6,244.5L242.6,243.9L242.5,241.4L242.4,241.3L241,241.1L240,241.4L239.7,241.3L238.8,241.3L237.7,240.8L237.6,239.5L237.9,238.2L238.5,236.5L239.1,235.7L239.8,235.6L240.1,235.5L240.3,235.2L240,234.6L242.4,233.8L243.4,233.4L244,232.8L245.2,233.2L245.9,232.6L245.8,231.5L246.5,231.6L247.9,231.1L247.7,230.7L248,229.6L248.9,229.7L248.7,227.5L250.2,227.4L251,226.6L251.1,225.6L252.7,227.2L252.8,227.9L253.7,228L253.8,228.5L256,229.1L256.9,229.2L256,230.6L257.2,231.1L256.1,232.5L256.4,233.6L255.9,234.5L255.7,235.9L256.2,236.3L257.6,236.6L258.4,236.5L258.7,237.2L258.1,237.9L257.5,239.1L257.7,240.1L257.3,240.4L256.4,241.9L256.6,242.3L257.5,243.1L258,244.2L259.1,244.5L259.8,244.4L260.9,244.7L261.4,244.5L262.4,246.1L261.3,246.4L260.8,246.1L259.1,246.5L259,246.5L258,246.4L257.5,245.9L256.8,245.4L255.8,245.4L254.7,245.2L254.1,245.3Z","埼玉県":"M265.7,251.9L266,252.6L266.5,253.2L267,254.3L266.8,255.2L267,256.3L266.3,256.1L266,256L265.5,255.6L264.5,255.5L263.9,256.4L263.1,256L263.1,256L262.1,256L261.7,256.5L261.1,256.5L261.1,256.5L260.5,256.9L260.1,257.1L259.6,256.8L260,255.8L259.2,256.5L258.1,256.8L257.1,256.9L256.9,256.7L256.9,256.7L255.9,256.2L255.6,255.6L254.9,255.1L253.3,255.1L252.6,254.8L251.4,254.5L249.9,253.7L248.8,254.1L248.3,254.8L247.3,255.1L246.7,254.7L245.8,254.6L245.1,253.7L244.1,253.5L244.3,252.8L243.8,251.6L244.6,250.4L246,250.4L246.1,250.3L246.4,249.6L247.5,249L248,249.1L248.6,248.3L248.9,248.4L250.1,248.2L250.6,247.5L250.5,246.8L251.3,245.5L251.5,244.9L251.9,244.4L252.7,244.6L252.7,244.6L254.1,245.3L254.7,245.2L255.8,245.4L256.8,245.4L257.5,245.9L258,246.4L259,246.5L259.1,246.5L260.8,246.1L261.3,246.4L262.4,246.1L262.8,246.3L263.1,247.6L263.3,247.8L263.6,248.5L263.7,249L264.6,248.9L264.8,249.6L265.2,250.1Z","千葉県":"M277.4,263.7L277,265L276.9,265.8L277.1,267.1L277.4,267.7L277.3,269.3L276.9,270.5L276.1,270.9L275.7,271.7L274.2,271.9L273.5,272.4L273.1,272.1L271.5,272.6L271.3,273.3L270.1,274L269,275L268.6,276.7L267.7,277.5L265.9,277.4L265.6,276.7L264.5,276.2L266.5,275.5L266,274.5L265.8,273.7L266.1,272.9L265.7,271.5L265.8,270.5L266.6,270L266.1,268.2L265,267.8L265.7,267.6L266.3,266.8L266.2,266.2L267,266.5L267.6,266L267.2,265.1L268.2,264.6L268.5,263.9L269.6,263.9L269.4,263.5L270.6,261.9L271.4,261.9L270.8,260.8L269.5,259.4L269.1,259.1L268.4,258.8L267.5,259.4L267.9,259.8L267.1,260.4L266.6,259.8L266.9,259L267.5,258.4L266.9,257.1L266.9,257.1L267,256.3L266.8,255.2L267,254.3L266.5,253.2L266,252.6L265.7,251.9L265.2,250.1L264.8,249.6L264.6,248.9L264.8,248.6L265.4,249.7L267.5,251.8L267.7,251.8L268.1,252.6L268.9,253.2L269.6,253.4L270.5,254L271.5,254.1L271.9,254.7L272.3,254.7L273.2,254.3L274.7,254.1L275.2,254.2L276.4,253.3L276.4,253.3L277.5,253L278.5,252.6L279,251.9L280.7,253.2L281.7,254.3L282.9,254.7L283.2,255.3L283.7,256.1L285.2,257L285.8,256.9L286.1,258.1L285,257.7L284,258.1L282.6,258.1L281.4,258.8L280.1,259.9L279.5,260.5L278.4,261.8L277.6,263Z","東京都":"M264.5,259.4L264.2,260.2L264.1,261.1L264.5,261.7L264.9,261.5L265.4,262.3L265,262.6L264.4,262.1L263.3,262.3L262.3,261.1L261.1,260.4L260.5,260.1L259.8,259.8L259.1,260.7L258.6,260.3L258.3,260.6L259.4,261.4L259,261.6L258.7,261.6L259,263.2L258.7,263.2L258.4,262.8L257.3,261.3L256.2,260.8L254.7,260.7L254,260.6L253.4,259.6L252.6,259.3L252,259.2L250.7,258.5L249.7,257.6L249.7,257.6L249.1,256.8L248.8,255.3L248.3,254.8L248.8,254.1L249.9,253.7L251.4,254.5L252.6,254.8L253.3,255.1L254.9,255.1L255.6,255.6L255.9,256.2L256.9,256.7L256.9,256.7L257.1,256.9L258.1,256.8L259.2,256.5L260,255.8L259.6,256.8L260.1,257.1L260.5,256.9L261.1,256.5L261.1,256.5L261.7,256.5L262.1,256L263.1,256L263.1,256L263.9,256.4L264.5,255.5L265.5,255.6L266,256L266.3,256.1L267,256.3L266.9,257.1L266.9,257.1L267.5,258.4L266.9,259L266.6,259.8L266.1,259.7L264.7,259.8L265,259.4ZM258.3,283.2L256.7,282.6L256.5,281.1L256.7,280.3L257.7,280.5L258.4,281.5ZM255,291.6L254.5,291.2L254.7,289.9L255.2,289.4ZM252.2,295.1L252.4,293.7L253,294.6ZM259.7,298.5L259.1,297.7L259.5,296.7L260.4,296.6L260.9,297.1L260.9,297.9ZM262.1,303.1L261.3,302.9L261.8,301.9L262.4,302.7ZM266.6,322.6L265.6,321.9L265.5,321.3L264.7,320.5L265.4,319.9L266.3,320.8L266.9,320.9L267.2,321.8ZM319.9,464.8L319.2,464.5L319.3,464ZM320,466.5L319.2,466.4L319.6,465L320.2,465.5ZM319.4,476.9L318.3,475L319,474.6ZM301.1,522.4L301.1,521.3L302,520.7L302.4,521.4Z","神奈川県":"M259.8,259.8L260.5,260.1L261.1,260.4L262.3,261.1L263.3,262.3L264.4,262.1L265,262.6L263.5,263.5L262.2,263.8L262,264.4L263.1,264.7L262.7,265.6L261.7,265.8L262.4,267.1L262,267.5L262.1,267.4L262.1,267.4L262,268.2L263.3,268.9L264.2,269.2L263.8,270.2L262.6,270.7L262.9,272L261.6,271.9L261.7,270.8L261.8,270L260.9,269.2L260.7,268.5L260.4,268.1L259.1,267.9L258.1,267.7L256.9,267.8L256,267.9L254.8,268.2L254.1,268.5L252.3,269.8L252.2,271.1L252.2,271.8L251.7,272L250.1,271.8L250,271.2L249.8,271L249.5,270.9L249,269.7L249.3,268.6L249.6,268.4L249.8,267.5L249.5,265.8L247.8,265.8L248.2,264.6L250,263.8L250.8,263.1L251.7,262.1L252.1,260.5L251.8,259.6L252,259.2L252.6,259.3L253.4,259.6L254,260.6L254.7,260.7L256.2,260.8L257.3,261.3L258.4,262.8L258.7,263.2L259,263.2L258.7,261.6L259,261.6L259.4,261.4L258.3,260.6L258.6,260.3L259.1,260.7Z","新潟県":"M261.1,204.7L261.2,205.3L262.2,206.5L262.2,206.5L262.8,206.3L263.1,207.3L262.2,208.2L261.1,209.8L261.2,210.3L259.7,211.3L260.4,214.6L258,214.5L257.2,214.7L256.9,215.9L256.2,215.6L254.1,216.1L253.5,216.2L253,217.1L253.7,217.7L253.7,218.7L253.3,220.1L252.4,221.3L253.2,222.3L253.8,222.5L254.1,223.2L253.8,224.2L254.3,226L254,226.7L254.1,227.9L253.8,228.5L253.7,228L252.8,227.9L252.7,227.2L251.1,225.6L251,226.6L250.2,227.4L248.7,227.5L248.9,229.7L248,229.6L247.7,230.7L247.9,231.1L246.5,231.6L245.8,231.5L245.9,232.6L245.2,233.2L244,232.8L243.4,233.4L243,232.6L243.4,231.7L243.3,230.8L243.1,230.3L242.1,229.9L241.2,228.8L241.3,227.4L240.9,226.6L240.4,226.6L240.1,226.3L238.8,226.6L237.3,227.5L236.6,229L235.6,229.5L235.7,230.6L235.3,230.9L234.9,230.2L234.1,230.3L233.1,230.8L232.2,230.7L231.7,231L231.3,231.8L230,231.3L230.6,229.7L230.2,229.4L229.2,229.4L228.4,229L227.3,229.1L227.5,230.3L226.4,231.9L225.4,232.6L225.3,232.7L224.7,231.2L224.8,230.2L224.4,229.6L224.4,228.4L223.5,228.2L222.9,227.5L224.8,227L226.7,226L228.2,225.6L231.3,223.5L231.9,222.8L232.8,223.2L234.9,222.6L236.7,221.1L238,219.7L240.6,217.9L241.9,215.7L242.7,214.4L244,213.1L244.7,211.4L245.1,210L245.7,207.8L246.6,206.8L250.6,204L253.4,203L254.6,202.1L255.1,201.6L256.9,199.1L257.7,197L257.7,193.4L258.3,192L259.4,189.8L259.5,189.4L260.5,190.1L262.8,190.7L262.7,192.5L262.4,193.1L263,193.8L264.1,194.3L264.6,194.1L265.7,195L266.2,196L265.5,197.1L264.1,198.1L262.7,197.7L262.2,198.9L262.3,200L261.9,200.9L262.3,201.4L261.7,201.8ZM234.7,207.7L234.2,206.8L235.1,206.7L235.5,206.1L235.5,204.8L236.6,203.8L236.3,203L235.3,202.8L234.9,203.7L234.6,203.5L234.5,201.4L236.3,198.2L238.2,196.7L238.9,195.1L239.9,194.9L239.5,198L238.4,200.1L238.5,201L239.3,201.4L240.8,200.8L241,201.4L239.7,204.2L239.6,204.8L236.7,207.1L235.9,207.1Z","富山県":"M218,231.8L218.5,230.3L218.8,228.8L220.2,228L221.1,227.9L222.9,227.5L223.5,228.2L224.4,228.4L224.4,229.6L224.8,230.2L224.7,231.2L225.3,232.7L225.1,234.2L225.3,235.1L225,236.1L225.1,236.8L223.8,237.6L224.1,238.5L223.2,239.3L222.7,240.9L221.8,241.8L220.9,241.7L220.4,240.9L219.4,241.2L218.3,240.8L218,240L216.5,240.9L216.6,240L215.2,239.9L214.4,240.6L213.6,240L211.5,242.1L211.5,242.8L210.5,244.1L209.9,244.4L209.5,242.9L208.6,242.3L208.1,242.7L207.2,242.6L207,243.7L206.3,243.7L206.2,242.7L206.6,242.3L205.9,240.6L206.5,240.2L206.5,238.7L206.9,237.6L206.4,237.2L206.4,236.3L206.3,235.8L207.1,234.8L206.4,233.6L207.3,233L207.5,232.7L207.7,232L208.1,230L208.4,228.9L209.3,228L210.1,228.2L210.3,227.7L211.6,227.9L210.3,229.9L210.9,231L211.9,231.9L212.4,232.3L212.3,232.4L212.3,232.4L212.5,232.5L214,232.8L215.3,232.6L216.7,232.8Z","石川県":"M198.2,241.5L199.3,240.4L200,239.4L201.9,237.2L203.1,235.5L204.1,234L205.2,231.9L205.9,230L206.1,227.7L206.1,226.7L205.3,225.4L205.3,223.3L204.3,223.1L204.9,221.4L205.6,219.9L205.4,219L206.1,218L208.4,217L209.3,217.3L212.5,215.6L213.6,214.8L214.2,214.8L215.8,214.1L217.1,214.1L217.7,216L215.7,216.5L215.4,217.9L215.9,218.3L215.8,219L215.3,219.7L213.9,219.5L212.6,220.1L212.3,220.9L212,221.6L210.8,222.4L209.8,221.5L208.6,222.7L208.6,224.1L208,224.2L208.4,225.2L209,224.6L209.6,224.8L210.1,225.7L210.6,225.5L211.2,224.3L211.8,224.3L211.5,225.9L211.6,227.9L210.3,227.7L210.1,228.2L209.3,228L208.4,228.9L208.1,230L207.7,232L207.5,232.7L207.3,233L206.4,233.6L207.1,234.8L206.3,235.8L206.4,236.3L206.4,237.2L206.9,237.6L206.5,238.7L206.5,240.2L205.9,240.6L206.6,242.3L206.2,242.7L206.3,243.7L206.7,244.6L207.5,245L206.4,246.8L205.8,247L205.7,248.4L205.5,248.9L203.6,249.2L203.3,248.6L201.6,247.1L200.4,247L199.4,247.5L198.8,246.7L197.8,246.8L197.2,245.9L197.3,245.3L196,244.4L195.6,243.6L196.7,242.3ZM209.6,224.6L208.9,223.6L210.3,223.3L210.8,223.6L211.4,222.8L211.6,223.9L210.6,224Z","福井県":"M200.4,247L201.6,247.1L203.3,248.6L203.6,249.2L205.5,248.9L205.7,249.3L205.1,249.8L204.9,251.1L205.4,251.2L205.4,252L206.2,252.3L206.9,254.4L206.3,254.8L206,255.8L204.8,255.6L203.6,256.1L203.2,255.6L201.8,256.3L200.8,256L200.6,256.6L198.7,256.1L197.6,256L197,256.2L196.9,257.7L196,259L194.3,258L193.4,258L193.1,258.7L193.9,260.5L193.6,261.1L192.7,260.8L192.5,262.1L190.9,262L190.5,263L190,263.1L189.3,262.2L188.7,263.3L188.6,264.4L188.2,265L187.4,264.8L186.6,264.8L186.2,265.4L185.7,266.1L184.4,266.4L183.2,265.8L181.1,265.5L181,264.4L180.2,263.7L179.9,263.6L180,262.3L179.5,261.9L180.3,261.1L179.9,261.7L180.6,261.9L181.2,262.8L182.6,262.2L183.7,261.4L182.6,262.8L182.6,263L183.4,263.1L183.7,262.7L185.2,262.8L185.7,261.7L184.8,262.1L184.3,261.5L184.8,260.9L185.5,261L186.4,262L187.1,261.8L186.8,260.9L187.3,261.1L187.6,260.2L186.8,259.2L187.8,260.1L189.2,259.9L190.2,259.3L189.8,258.9L190,258.3L189.8,257.2L190.9,256.4L191.3,257L191,258.4L191.5,259L192.2,258.3L192.5,256.4L191.9,254.9L190.8,253.7L190.6,252.2L189.9,251.2L190,250.7L190.9,249.8L191.4,248.2L192.7,246.5L193.4,245.3L193.3,244.6L194.4,244.5L195.6,243.6L196,244.4L197.3,245.3L197.2,245.9L197.8,246.8L198.8,246.7L199.4,247.5Z","山梨県":"M244.1,253.5L245.1,253.7L245.8,254.6L246.7,254.7L247.3,255.1L248.3,254.8L248.8,255.3L249.1,256.8L249.7,257.6L249.7,257.6L250.7,258.5L252,259.2L251.8,259.6L252.1,260.5L251.7,262.1L250.8,263.1L250,263.8L248.2,264.6L247.8,265.8L246.8,266L246,266.4L244.2,266.6L243.2,266.8L243,266L242.4,265.8L241.8,266L241.2,264.7L240.2,265.6L240.2,266.3L240.3,267.5L239.9,267.9L239.9,269.1L240.3,270.1L240.1,270.7L239.4,271.4L237.6,270.6L237,268.9L237.1,268.2L236.4,267.6L235.4,268.1L234.8,267.8L234.3,266.4L234.8,265.6L234.6,264.4L235,263L234.6,261.9L234.3,259.8L234.1,259.9L233.6,259.2L233.4,258L234.3,257.2L233.7,256.6L233.4,256.2L234.5,254.1L235.4,254.7L236.9,252.3L237.1,252L237.1,252L238.4,252.4L238.7,253.7L239.6,253.4L239.8,253.2L241.8,253.5L242,254.4L242.8,254.3Z","長野県":"M235.3,230.9L235.7,230.6L235.6,229.5L236.6,229L237.3,227.5L238.8,226.6L240.1,226.3L240.4,226.6L240.9,226.6L241.3,227.4L241.2,228.8L242.1,229.9L243.1,230.3L243.3,230.8L243.4,231.7L243,232.6L243.4,233.4L242.4,233.8L240,234.6L240.3,235.2L240.1,235.5L239.8,235.6L239.1,235.7L238.5,236.5L237.9,238.2L237.6,239.5L237.7,240.8L238.8,241.3L239.7,241.3L240,241.4L241,241.1L242.4,241.3L242.5,241.4L242.6,243.9L241.6,244.5L241.6,245.3L242.3,246.3L242.3,247.1L241.1,247.2L241.5,247.9L242.4,248.4L242.2,249.1L242.2,250.6L243.3,251.5L243.8,251.6L244.3,252.8L244.1,253.5L242.8,254.3L242,254.4L241.8,253.5L239.8,253.2L239.6,253.4L238.7,253.7L238.4,252.4L237.1,252L237.1,252L236.9,252.3L235.4,254.7L234.5,254.1L233.4,256.2L233.7,256.6L234.3,257.2L233.4,258L233.6,259.2L234.1,259.9L233.4,261.6L232.8,261.7L232.9,262.3L232.5,263.4L233,263.5L232.8,264.4L232.1,264.5L232.8,265.8L232.5,266.5L231.5,267.3L230.9,267.1L230.1,268.2L227.7,269.2L227.2,270.1L226.5,270.3L225.7,270.5L224.2,269.8L224,269.8L223.1,269.9L222.9,270.1L221.4,270.6L220.8,269.3L221.1,268.4L221.4,267.7L221.9,267.2L221.8,266.2L221.4,265.7L222.5,265.7L221.7,264.6L222.5,264L222.5,263.1L221.5,262.4L221.3,261.3L220.2,260.7L220.8,259.7L220.1,258.9L219.7,258L219,256.9L217.2,256.1L216.6,255.7L217.7,253.8L218.8,253.5L219.5,253.7L219.7,253.3L220.5,252.5L220.9,251.6L222,250.6L222.2,249.3L221.1,248.5L221.1,247.9L221.8,247.2L221.7,245.8L223,244.2L223,242.9L221.8,242.2L221.8,241.8L222.7,240.9L223.2,239.3L224.1,238.5L223.8,237.6L225.1,236.8L225,236.1L225.3,235.1L225.1,234.2L225.3,232.7L225.4,232.6L226.4,231.9L227.5,230.3L227.3,229.1L228.4,229L229.2,229.4L230.2,229.4L230.6,229.7L230,231.3L231.3,231.8L231.7,231L232.2,230.7L233.1,230.8L234.1,230.3L234.9,230.2Z","岐阜県":"M206,255.8L206.3,254.8L206.9,254.4L206.2,252.3L205.4,252L205.4,251.2L204.9,251.1L205.1,249.8L205.7,249.3L205.5,248.9L205.7,248.4L205.8,247L206.4,246.8L207.5,245L206.7,244.6L206.3,243.7L207,243.7L207.2,242.6L208.1,242.7L208.6,242.3L209.5,242.9L209.9,244.4L210.5,244.1L211.5,242.8L211.5,242.1L213.6,240L214.4,240.6L215.2,239.9L216.6,240L216.5,240.9L218,240L218.3,240.8L219.4,241.2L220.4,240.9L220.9,241.7L221.8,241.8L221.8,242.2L223,242.9L223,244.2L221.7,245.8L221.8,247.2L221.1,247.9L221.1,248.5L222.2,249.3L222,250.6L220.9,251.6L220.5,252.5L219.7,253.3L219.5,253.7L218.8,253.5L217.7,253.8L216.6,255.7L217.2,256.1L219,256.9L219.7,258L220.1,258.9L220.8,259.7L220.2,260.7L221.3,261.3L221.5,262.4L222.5,263.1L222.5,264L221.7,264.6L222.5,265.7L221.4,265.7L221.8,266.2L221.9,267.2L221.4,267.7L221.1,268.4L218.5,270L216.8,269.1L216.1,268.3L215.4,268.3L214.4,269.1L213.7,269.2L213.5,268.8L212,268L211.9,268.2L210.9,267L211,266.4L209.6,265.5L209.9,265L209.3,265.2L208.5,266L207.9,266.1L206.7,266.6L206,266.3L205.6,266.2L205.6,266.2L205.2,266.8L204.1,268.5L203.6,269.3L203.6,269.6L203.5,271.9L202.3,271.5L201.9,270.7L201.3,270.1L200.8,269L200.6,268.8L200.1,269.4L199.3,269.3L198.4,269.8L197.7,269.1L198,268.1L198.2,267.8L199.1,265.6L198.4,264.8L198.7,264.2L198,263L198.3,262.2L197.7,261.5L197.2,262L196.7,261.8L196.7,259.9L196.1,260L196,259L196.9,257.7L197,256.2L197.6,256L198.7,256.1L200.6,256.6L200.8,256L201.8,256.3L203.2,255.6L203.6,256.1L204.8,255.6Z","静岡県":"M241.2,264.7L241.8,266L242.4,265.8L243,266L243.2,266.8L244.2,266.6L246,266.4L246.8,266L247.8,265.8L249.5,265.8L249.8,267.5L249.6,268.4L249.3,268.6L249,269.7L249.5,270.9L249.8,271L250,271.2L250.1,271.8L251.7,272L251,273.2L251,274.3L251.5,274.7L251.4,276L252.4,276.5L252.1,278.4L251.2,279L250.7,280.6L250.1,281.2L249.4,282.3L249,282.9L249.3,283.5L248,283.8L247.7,284.4L246.1,285L245.1,283.8L245.3,283.5L244.4,282.7L245.1,281.2L244.6,280.3L244.9,278.9L244.7,278.3L245.4,277.7L245.1,276.9L244.8,276.4L245.3,274.9L246.5,275.1L247.4,275L247.7,274.3L246.1,272.9L244.6,272.3L243.5,272.2L242.4,272.7L241.1,272.8L240.3,274.1L239.7,274.5L239.9,275.9L236.8,277.5L236.6,277.9L236.2,278.7L236.4,279.5L235.5,281.1L234.6,281.8L233.6,283.5L233.8,284.6L233.5,285.1L231.2,284.1L229.1,283.5L227.9,283.5L225.7,284L223.3,283.4L221.7,283.2L219.4,283.3L219.3,281.5L219.6,280.5L219.7,279.6L220.8,279L221.5,279L222.5,278L222.8,277L223.3,276.7L223.9,275.1L225.3,273.6L225.3,273L225.8,272.9L226.3,271.4L225.8,271L226.5,270.3L227.2,270.1L227.7,269.2L230.1,268.2L230.9,267.1L231.5,267.3L232.5,266.5L232.8,265.8L232.1,264.5L232.8,264.4L233,263.5L232.5,263.4L232.9,262.3L232.8,261.7L233.4,261.6L234.1,259.9L234.3,259.8L234.6,261.9L235,263L234.6,264.4L234.8,265.6L234.3,266.4L234.8,267.8L235.4,268.1L236.4,267.6L237.1,268.2L237,268.9L237.6,270.6L239.4,271.4L240.1,270.7L240.3,270.1L239.9,269.1L239.9,267.9L240.3,267.5L240.2,266.3L240.2,265.6Z","愛知県":"M207.3,274.1L207.3,273.2L206.8,274.4L206.9,273.2L206.4,273.2L206.7,274.4L206.1,273.9L205.8,274.8L205.3,274.7L205,273.3L204.3,272.6L204,272.3L203.5,271.9L203.6,269.6L203.6,269.3L204.1,268.5L205.2,266.8L205.6,266.2L205.6,266.2L206,266.3L206.7,266.6L207.9,266.1L208.5,266L209.3,265.2L209.9,265L209.6,265.5L211,266.4L210.9,267L211.9,268.2L212,268L213.5,268.8L213.7,269.2L214.4,269.1L215.4,268.3L216.1,268.3L216.8,269.1L218.5,270L221.1,268.4L220.8,269.3L221.4,270.6L222.9,270.1L223.1,269.9L224,269.8L224.2,269.8L225.7,270.5L226.5,270.3L225.8,271L226.3,271.4L225.8,272.9L225.3,273L225.3,273.6L223.9,275.1L223.3,276.7L222.8,277L222.5,278L221.5,279L220.8,279L219.7,279.6L219.6,280.5L219.3,281.5L219.4,283.3L216.5,283.9L212.6,285.2L210.1,285.5L210.9,283.8L212.1,284.1L212.4,283.6L213.2,283.6L214.9,282.7L215.8,281.9L215.9,283.1L216.2,280.4L215.7,279.9L213.8,279.9L213.6,280.7L213.1,280.4L211.2,280.4L210.3,280.6L209.8,279.7L209.2,279.6L208.9,278.7L209.4,277.5L209.6,276.3L209.5,276.2L209.4,276.9L208.7,278.5L208.2,279.7L208.1,280.8L208.6,281.3L209.3,282.5L208.4,282.4L206.8,281.3L206.7,280.9L207.1,279.7L207,278.5L206.3,278L206.4,276.7L206.3,276L206.9,274.9L207.3,275Z","三重県":"M197.9,276.2L198.3,275.4L198.4,275L198.4,274.6L198.9,273L199,271L198.3,270.5L198.4,269.8L199.3,269.3L200.1,269.4L200.6,268.8L200.8,269L201.3,270.1L201.9,270.7L202.3,271.5L203.5,271.9L204,272.3L204.3,272.6L205,273.3L205.3,274.7L204.9,274.3L203.9,274.6L203.4,275L203,275.3L202.8,277.5L201.3,279.8L200.5,281.1L200.2,282.4L200.7,282.8L200.8,283.9L200.4,284.5L201.8,284.8L203,285.6L204.4,286.3L206,287.6L206.3,287.1L207,287.8L207.3,288.8L208.2,288.7L207.9,290.3L207,290L207.1,290.9L207.6,292.7L206.5,293.3L204.6,292.8L206.3,292.8L206.4,292L204.6,292.3L203.9,292L203.4,292.4L203.8,291.2L203.5,290.9L202.4,291.9L203.2,291.7L201.7,293.1L200.6,292.4L199.7,292.8L199.9,293.5L199.3,293.8L198.7,293.4L198.2,293.9L197.1,294.4L196.6,294.2L196.2,294.8L195.1,295.3L195.6,296.8L194.6,297L194.3,297L193.6,297.3L194.5,297.6L194.4,298.2L195.1,298.7L194.5,300L193.7,299.1L194.1,300.4L193.4,301.1L192.8,300.9L191.8,301.5L190.7,302.9L190,304.6L189.5,305.7L188.1,305.4L187.4,304.3L186.5,303.4L186.5,302L186.9,302.3L187.3,302.2L187,301.2L187.6,301L188,300.4L188.8,300.7L189,299.8L189.7,299.7L189.5,298.8L189.9,298.2L190.6,298.2L191.5,298.5L191.4,297.1L191.9,297.1L191.6,296.3L191.8,295L191.5,294.3L192.2,293L191.5,291.8L192.2,291.5L191.5,290.3L191.1,289.7L191.6,288.5L193.8,288.3L194.1,286.4L193.1,286.5L193,285.8L191.9,285.6L190.8,285L191.1,284.1L191.6,282.7L191,282.1L191,281.2L190.5,280.7L190.4,279.9L191.8,279.3L191.7,278.8L192.5,278.2L191.7,277.8L192.2,277.3L195,278.4L195.6,278.1L197.3,277.3Z","滋賀県":"M188.9,277.8L188,277.9L187.4,277.4L187.6,276L186.4,273.6L187.2,271.6L186.8,269.4L187.5,267.9L187,268.1L186.2,267L185.7,266.1L186.2,265.4L186.6,264.8L187.4,264.8L188.2,265L188.6,264.4L188.7,263.3L189.3,262.2L190,263.1L190.5,263L190.9,262L192.5,262.1L192.7,260.8L193.6,261.1L193.9,260.5L193.1,258.7L193.4,258L194.3,258L196,259L196.1,260L196.7,259.9L196.7,261.8L197.2,262L197.7,261.5L198.3,262.2L198,263L198.7,264.2L198.4,264.8L199.1,265.6L198.2,267.8L198,268.1L197.7,269.1L198.4,269.8L198.3,270.5L199,271L198.9,273L198.4,274.6L198.4,275L198.3,275.4L197.9,276.2L197.3,277.3L195.6,278.1L195,278.4L192.2,277.3L191.7,277.8L192.5,278.2L191.7,278.8L191.8,279.3L190.4,279.9L190.5,279.2L190,278.6L188.9,278.4Z","京都府":"M187.4,277.4L188,277.9L188.9,277.8L188.9,278.4L190,278.6L190.5,279.2L190.4,279.9L190.5,280.7L191,281.2L190.5,282L189.6,281.7L189.3,281.1L188.4,280.7L187.7,281.8L186.9,281.9L185.5,281.4L185,281.3L184.7,280.7L184.5,280.1L184.6,279L184.5,278.9L184.4,278.8L183.6,277.5L183.7,277.4L183.4,277L182.9,276.4L182.7,276.2L182.4,275.3L181.5,275.4L181.6,276.6L180.6,276.3L179.8,275.8L180,274.9L178.9,274.3L177.8,274.3L177.9,273.7L177.6,273.4L178.2,272.7L178.1,272.1L178.1,271.4L177.1,270.8L176,270.9L176.1,270.3L175,270.1L174.8,270.4L174.1,270.2L174.4,269.7L173.5,268.9L173.7,268.1L172.6,267.9L171.8,268.5L171.6,267.9L169.3,266.8L169,266.5L169.1,264.7L169.3,264.3L170.4,264.7L171.6,264.4L171.6,263.4L171.4,262.8L171.5,261.3L170.6,261.3L169.3,261.8L169,261L167.9,259.9L168.3,259.2L168.2,258.2L169.3,258.5L170.2,258.1L170.6,257.5L171.3,257.6L172.6,256.4L174.7,255.8L175.5,255.8L176.5,256.9L176.8,258.4L176.2,258.3L175.6,259.4L174.5,260.6L174.5,261.4L175.2,260.2L175.6,260.2L175.5,261.4L176.4,261.9L177.3,262.2L176.8,263.3L177.6,262.6L178.5,262.9L178.4,262L177.5,262.3L177.3,261.6L178.2,260.9L179.6,260.8L180.3,261.1L179.5,261.9L180,262.3L179.9,263.6L180.2,263.7L181,264.4L181.1,265.5L183.2,265.8L184.4,266.4L185.7,266.1L186.2,267L187,268.1L187.5,267.9L186.8,269.4L187.2,271.6L186.4,273.6L187.6,276Z","大阪府":"M183.4,281.9L183.3,282.9L183.2,283.3L183,284L182.9,284.2L183.5,284.7L183.3,285.1L182.9,285.6L183,285.8L183.2,286L183.3,286.6L183.4,287.6L183.4,287.6L183,288.6L183.3,289L183,289.3L182.7,289.6L181.1,289.8L180.3,290.3L179.8,290.6L179.4,290L178.8,290.3L178.6,290.3L178.4,290.3L177.9,290.4L176.5,290.6L176.3,291L175.5,291.4L175.3,290.9L175.1,291.1L173.8,291.1L173.8,291.6L171.9,291.9L171.5,291L173.6,290.4L174.7,289.5L175.3,289.1L175.5,288.9L176.4,288.2L177,287.5L177.2,286.6L177.3,286.4L178.2,286.1L178.6,285.6L178.1,285.1L177.9,284.2L178.9,285L178.6,284L178.9,283.1L178.2,282.9L178,281.9L179.2,281L178.9,280.1L178.8,279.6L178.5,279.3L178.4,278.9L178.8,277.5L179,277.1L178.5,276.7L179.5,276.3L178.5,276.1L177.1,275.3L177.3,273.9L177,273.8L177.6,273.4L177.9,273.7L177.8,274.3L178.9,274.3L180,274.9L179.8,275.8L180.6,276.3L181.6,276.6L181.5,275.4L182.4,275.3L182.7,276.2L182.9,276.4L183.4,277L183.7,277.4L183.6,277.5L184.4,278.8L184.5,278.9L184.6,279L184.5,280.1L184.2,280L183.9,280.9L183.4,281.9ZM174.8,288.2L174.6,288.4L174.4,288.2L174.4,288.2L174.1,288L174.4,287.8L174.6,288L174.6,288Z","兵庫県":"M176.5,281.1L176.1,281.2L174.7,281.7L173.5,282.5L173.6,282.8L171.1,283.3L170.3,282.9L169.6,282.9L167.4,281.3L167,281L166.2,280.9L166.3,280.3L165.3,279.8L164.3,279.4L163.4,279.6L161.5,279.4L160.7,279.1L159.6,279.8L159.5,278.9L159.1,279.8L158.3,280.4L157.5,279.9L156.6,280.4L156.8,279.3L156.1,278.1L155.3,277.3L155.6,276.4L156.2,275.9L155.4,275L156.1,273.8L155.7,273.3L156.8,272.7L156.9,271.7L157.5,271.6L157.9,270.2L158.7,270.2L158.8,269.3L158.2,269.1L158.7,268L159.4,268.2L160.9,267.2L160.8,265.7L160.8,265L160.2,264.7L160.3,263.5L159.6,263.1L159.5,262.4L159.2,261.3L159.4,260.7L159.1,259.6L158.4,258.9L160,258.6L161.3,257.8L162.5,257.9L163.5,258.5L164.2,257.9L165.6,258.1L166.8,257.9L168.2,258.2L168.3,259.2L167.9,259.9L169,261L169.3,261.8L170.6,261.3L171.5,261.3L171.4,262.8L171.6,263.4L171.6,264.4L170.4,264.7L169.3,264.3L169.1,264.7L169,266.5L169.3,266.8L171.6,267.9L171.8,268.5L172.6,267.9L173.7,268.1L173.5,268.9L174.4,269.7L174.1,270.2L174.8,270.4L175,270.1L176.1,270.3L176,270.9L177.1,270.8L178.1,271.4L178.1,272.1L178.2,272.7L177.6,273.4L177,273.8L177.3,273.9L177.1,275.3L178.5,276.1L179.5,276.3L178.5,276.7L179,277.1L178.8,277.5L178.4,278.9L178.5,279.3L178.8,279.6L178.9,280.1L179.2,281L178,281.9L177.4,281.9ZM174.3,282.8L174.4,282.1L174.8,282.9ZM159.4,282.5L159.4,281.9L160,282.4ZM167.7,288.7L167.6,289.8L168.7,291.9L167,292.5L165.5,293.5L164.2,293.7L163.6,292.9L164,292L163.1,292L162.9,291L164.5,289.7L165.5,287.9L166.2,286.9L166.5,287L167.6,285.6L168.6,285.1L170,283.7L170.4,284.5L169.8,285.2L169.4,286.2L167.7,288.2Z","奈良県":"M191.1,284.1L190.8,285L191.9,285.6L193,285.8L193.1,286.5L194.1,286.4L193.8,288.3L191.6,288.5L191.1,289.7L191.5,290.3L192.2,291.5L191.5,291.8L192.2,293L191.5,294.3L191.8,295L191.6,296.3L191.9,297.1L191.4,297.1L191.5,298.5L190.6,298.2L189.9,298.2L189.5,298.8L189,299.3L187.8,299.7L187.3,300.4L187.6,301L187,301.2L186.6,301.7L186.9,302.3L186.5,302L186.4,301.5L185.4,301.5L184.5,301.7L184,301.3L182.6,301.3L181.7,301.9L181.5,301.3L182.2,299.1L181.4,298.5L181.1,297.4L180.5,297.1L180.5,297.1L180.4,296.4L181.6,295.1L183,293.4L183.8,293.8L184.2,293.4L184,292.6L183.3,292.3L182.7,289.6L183,289.3L183.3,289L183,288.6L183.4,287.6L183.4,287.6L183.3,286.6L183.2,286L183,285.8L182.9,285.6L183.3,285.1L183.5,284.7L182.9,284.2L183,284L183.2,283.3L183.3,282.9L183.4,281.9L183.4,281.9L183.9,280.9L184.2,280L184.5,280.1L184.7,280.7L185,281.3L185.5,281.4L186.9,281.9L187.7,281.8L188.4,280.7L189.3,281.1L189.6,281.7L190.5,282L191,281.2L191,282.1L191.6,282.7Z","和歌山県":"M176.3,291L176.5,290.6L177.9,290.4L178.4,290.3L178.6,290.3L178.8,290.3L179.4,290L179.8,290.6L180.3,290.3L181.1,289.8L182.7,289.6L183.3,292.3L184,292.6L184.2,293.4L183.8,293.8L183,293.4L181.6,295.1L180.4,296.4L180.5,297.1L180.5,297.1L181.1,297.4L181.4,298.5L182.2,299.1L181.5,301.3L181.7,301.9L182.6,301.3L184,301.3L184.5,301.7L185.4,301.5L186.4,301.5L186.5,302L186.5,303.4L187.4,304.3L188.1,305.4L189.5,305.7L188.7,307L188.8,307.5L188,307.6L187.9,308.2L187.8,308.5L187.8,308.7L188,309.2L187.2,310L185.1,311L184.8,312.5L184.3,311.4L183.7,311.5L181.8,310.8L180.8,310.7L179.3,310.2L178.9,309.6L178.3,309.7L176.9,308.4L177,307.4L175.8,306.7L176.9,306.2L177,305.6L176,304.8L174.6,303.9L173.3,303.1L172.4,301.5L171.6,301.1L170.5,301.4L170.7,300.3L171.4,299.6L171,299.5L171.3,298.7L172.1,298.5L172.9,297.8L172.2,297.1L171.2,296.8L171.8,295.8L172,295.2L172.9,295.3L173.4,294.7L173.2,294L172.5,294.1L172.4,293.1L171.4,292.2L170.9,292.1L171.5,291L171.9,291.9L173.8,291.6L173.8,291.1L175.1,291.1L175.3,290.9L175.5,291.4ZM187,301.2L187.3,302.2L186.9,302.3L186.6,301.7ZM187.8,299.7L189,299.3L189.5,298.8L189.7,299.7L189,299.8L188.8,300.7L188,300.4L187.6,301L187.3,300.4ZM185.7,312.3L185.2,311.7L186.3,311.8Z","鳥取県":"M158.4,258.9L159.1,259.6L159.4,260.7L159.2,261.3L159.5,262.4L159.6,263.1L160.3,263.5L160.2,264.7L160.8,265L160.8,265.7L160.9,267.2L159.4,268.2L158.7,268L158.3,267.8L157,268.8L156.2,268.9L156,268.6L155,269L154,269.4L153.9,267.9L153.5,266.8L152.7,266.1L151.4,266.1L150.8,265.8L151.1,265L149.5,265.3L149.3,265.9L148.1,266.2L147.7,267.2L147.2,267.2L146.8,266.1L146.1,265.7L142.9,264.7L142.5,265.4L142.2,266.8L141,267.3L141.3,268.6L139.6,268.7L138.7,268.6L139,269.9L137.3,270.5L136.7,270.2L136.1,271.3L135.8,270.8L133.6,271L133.5,270.8L134,269L134.8,268.5L134,267.4L136.1,266.4L137.2,266.3L137,264.4L137.6,263.7L137.2,262.2L135.8,261.1L135.7,261L135.3,260L136.2,259.4L136.5,260.6L137.5,261.4L138.7,261.8L139,261.9L139.8,261.5L140.1,261L141.1,260.5L143,260.2L143.3,260.4L145.5,261L148.2,261.1L150.4,260.8L151.9,260.9L155.6,260.4L156.6,259.8Z","島根県":"M134,267.4L134.8,268.5L134,269L133.5,270.8L132,270.5L131.4,270.8L130.6,270L129.8,270.5L128.7,269.8L128,270L126.1,272.4L125.1,273.4L124.4,273.3L123.3,274.3L124.6,274.9L124.7,275.7L123.9,276.1L122.9,275.8L121.2,276.9L119.7,276.5L119.3,276.1L118.4,277.1L118.2,276.7L116.9,276.4L116.5,277L115.8,276.2L114.9,277.5L113,278.5L113.6,279.1L113.2,279.8L112.6,280.7L112.8,281.5L110.9,283.3L111.4,284.2L111.2,284.2L110.4,284.5L109.8,285.4L110.2,286.2L109,287.9L108.2,287.2L107.5,287.8L106.2,287.8L105.3,286.5L105.3,285.9L105.9,284.6L104,284.5L104,283.4L103.5,282.8L104.3,282.1L104.8,281.2L104.7,280.2L104.3,280L104.3,278.5L104.5,278.7L106.4,278.5L107.9,277.5L108.4,276.8L110.4,275.4L113.1,272.5L113.7,272.3L115.7,270.7L117.2,270.1L117.6,269.3L118.7,268.6L119.2,267.5L120.5,266.6L122.7,265.4L123.7,265.1L124.5,263.9L124.8,262.4L124.1,261.9L125.1,261.2L126.5,261.3L126,260.8L127,260.6L128,260L129.5,259.9L130.7,259.9L131,259.2L131.9,259.4L133.1,258L133.7,258.1L134.2,259L136.6,258.9L137.8,259.1L136.2,259.4L135.3,260L135.7,261L135.8,261.1L137.2,262.2L137.6,263.7L137,264.4L137.2,266.3L136.1,266.4ZM133.4,247.5L133.7,246.7L133.4,245.9L134.4,245.5L134.8,245.7L134.4,246.8ZM132.1,247.3L131.1,246.6L131.8,245.4L132.7,244.9L133.1,246.7L132.6,246.7L132.2,246L131.7,246.2ZM133.2,248.5L132.3,248.2L132.1,247.5L132.8,247.6ZM137.1,244.6L137.1,244.1L135.9,243.3L135.9,242.4L136.3,241.2L137.9,240.4L139.4,241.4L139.7,242.4L139.5,243.7L138.8,243.8L138.9,244.5Z","岡山県":"M154.7,280.5L155,280.9L153.9,282L153.4,282.9L152.3,283.5L151.1,283.5L151.2,283L150,282.8L149.2,283.1L150.7,283.2L150.7,283.8L149.9,284.7L149.2,284.9L148.6,286.1L148.7,286.5L147.5,286.5L146.6,286L145.7,286.8L144.9,285.6L144,285.8L144.1,284.3L143.8,284.9L142,285.3L141.4,285.9L139.7,286.4L139.6,285.9L138.9,285.5L139,284L137.8,282L138.3,280.8L137.7,279.8L137.7,279L137.9,277.5L137,276.3L137,276.3L136.4,275.4L136.7,274.3L136.5,273.8L137,273.1L136.1,271.3L136.7,270.2L137.3,270.5L139,269.9L138.7,268.6L139.6,268.7L141.3,268.6L141,267.3L142.2,266.8L142.5,265.4L142.9,264.7L146.1,265.7L146.8,266.1L147.2,267.2L147.7,267.2L148.1,266.2L149.3,265.9L149.5,265.3L151.1,265L150.8,265.8L151.4,266.1L152.7,266.1L153.5,266.8L153.9,267.9L154,269.4L155,269L156,268.6L156.2,268.9L157,268.8L158.3,267.8L158.7,268L158.2,269.1L158.8,269.3L158.7,270.2L157.9,270.2L157.5,271.6L156.9,271.7L156.8,272.7L155.7,273.3L156.1,273.8L155.4,275L156.2,275.9L155.6,276.4L155.3,277.3L156.1,278.1L156.8,279.3L156.6,280.4L155.5,280.2ZM140.7,288.3L140.1,287.9L140.9,287.7ZM156.5,280.9L155.7,280.8L156,280.2L157,280.8Z","広島県":"M124.7,275.7L124.6,274.9L123.3,274.3L124.4,273.3L125.1,273.4L126.1,272.4L128,270L128.7,269.8L129.8,270.5L130.6,270L131.4,270.8L132,270.5L133.5,270.8L133.6,271L135.8,270.8L136.1,271.3L137,273.1L136.5,273.8L136.7,274.3L136.4,275.4L137,276.3L137,276.3L137.9,277.5L137.7,279L137.7,279.8L138.3,280.8L137.8,282L139,284L138.9,285.5L138.7,286.5L137.6,286.9L137.5,287.8L135.6,287.5L135.3,286.9L134.8,286.6L132.9,287.3L132.2,287.5L131.6,287.1L131.4,288.3L130,288.7L129.7,288.5L127.7,288.6L126.8,289.3L126.5,288.8L125.8,288.9L125.4,289.7L124.8,289.5L125.2,290.2L123.6,290.6L122.4,291.3L121.6,290.6L120.4,291.4L120.3,290.7L120.8,290.2L120,289.8L119.9,288.9L120.1,287.5L120.2,287.4L120.4,287.4L120.4,287.4L120.3,287.3L118.8,287.5L117.9,287.1L116.8,287.2L116.2,288L114.5,289.4L114.1,290L114.6,290.6L113.5,290.6L113.8,290.2L112.8,290.1L112.3,288.2L111.3,286.9L111.4,284.2L110.9,283.3L112.8,281.5L112.6,280.7L113.2,279.8L113.6,279.1L113,278.5L114.9,277.5L115.8,276.2L116.5,277L116.9,276.4L118.2,276.7L118.4,277.1L119.3,276.1L119.7,276.5L121.2,276.9L122.9,275.8L123.9,276.1ZM124.3,292.5L124.4,292.1L123.3,291.8L123.8,291.3L124.8,291.7ZM120.5,294.2L120.3,293.7L118.7,294L118.5,293.3L119.6,292.8L119.5,292.2L120.2,291.2L120.7,291.8L120,292.3L120.5,292.4L120.3,293.5L121.1,293ZM126,292.8L125.6,292.2L126.6,291.8L126.9,292.2ZM134.1,288.2L133.3,287.5L134.6,287ZM133.6,290.2L132.9,289.6L132.6,288.4L133.4,288.2L134,289.3ZM131.4,290.5L131.4,289.3L132.6,289.1L132.7,289.8ZM135.9,288.6L136.2,287.9L136.5,288.4ZM115.2,290.2L115,289.7L115.6,288.8L116.5,288.3L116.7,289ZM118.1,292.8L118.6,291.5L117.4,290.4L117.2,289.6L118.2,289.8L119.1,291L119.3,290.4L118.6,289L119.7,289.5L119.5,291.1L119,291.6L119.4,292.4ZM127.2,291.5L126.5,290.6L127.7,290.5L128.6,289.8L128,290.8L128.1,291.3Z","山口県":"M95.9,285.2L96.7,284.4L97.8,284.5L99.4,282.9L99.3,282.2L100.3,281.8L101.4,280.8L101.5,280.2L102.5,278.9L103.3,279.2L104.3,278.5L104.3,280L104.7,280.2L104.8,281.2L104.3,282.1L103.5,282.8L104,283.4L104,284.5L105.9,284.6L105.3,285.9L105.3,286.5L106.2,287.8L107.5,287.8L108.2,287.2L109,287.9L110.2,286.2L109.8,285.4L110.4,284.5L111.2,284.2L111.4,284.2L111.3,286.9L112.3,288.2L112.8,290.1L113.8,290.2L113.5,290.6L114.6,290.6L114.4,291L114.5,292.1L113.6,292.6L113.8,294.5L113.3,296.1L113,296.6L111.9,296.6L111.7,298L112.2,299.4L111.4,299.6L111.4,298.9L110.4,297.3L109.7,297.8L108.4,296.5L107.2,295.7L106.1,294.9L104.7,295.6L105.9,294.6L105.4,293.9L104.4,293.9L104.4,293.5L102.9,293.9L101.5,294L100.3,294.8L98.9,293.8L99,294.4L98.1,295L97.1,293.4L96.6,294.6L96.3,295.3L94.6,296.2L93.2,295.7L92.5,295.4L92.8,294.8L91.8,294.1L91.3,293.2L90.8,293.1L90.3,292.7L89.2,294.3L87.2,295.8L87.7,294.3L87.7,292.4L86.8,291.3L86.9,290.5L87.5,290.6L88.2,289.8L88.2,288.1L87.2,286.8L88.1,285.1L88.6,285.6L89.6,285.2L90.7,285.1L90.4,284.3L89.1,284.1L89.6,283.3L90.2,284L91.6,283.8L92.7,284.2L93.1,285.2L94,284.7ZM93.5,275.9L93.4,274.9L93.9,275.8ZM100.7,295.1L101.1,294.3L101.4,294.5ZM94,284.7L93.8,284L94.6,284ZM114.1,301.4L112.9,300.4L113.5,300.1ZM113.3,299.1L112.7,298.2L112.9,296.8L114,296.5L115,296.8L115.8,298.2L117.6,297.1L118.7,297.3L117.6,297.9L116.7,298L116.5,299.2L115,298.2ZM110,300.7L110.8,299.3L110.9,299.7Z","徳島県":"M161.6,295.7L161.2,297.4L161.4,297.7L161.7,298.5L162.1,297.9L162.4,298.5L163.3,299.4L163.3,300.5L161.9,301.4L162.6,302L164.3,302.2L162.8,302.9L160.6,303.9L160.4,304.6L158.5,305.7L156.9,306.4L156.3,307.9L155.2,308.1L155.1,308.8L154.6,308.5L152.9,308.4L152.1,307.1L152.7,306.3L152.3,305.3L150.2,305.1L150.4,304.5L150.3,303L149.9,301.8L149.1,301.9L148.9,301.5L147.4,302.6L146.6,302.2L146,301.2L144.1,301.3L142.8,300.7L142.4,300.2L143,299.4L143.2,298.2L143,297L143.8,296.8L144.2,296.2L145.1,295.5L145.9,295.7L145.9,295.2L147.6,295.1L148.3,294.8L148.9,295.8L149.5,295.8L150.5,294.8L152,294.9L152.3,294.1L152.7,293.7L153.7,293.6L154.8,293.4L157.1,293.8L157.8,294.2L158.4,293.4L158.4,293L159.6,292.6L161.1,292.7L161.3,293.2L162.4,293.8L161.8,294.7ZM162,293.6L161.4,293.1L162,293Z","香川県":"M158.4,293L158.4,293.4L157.8,294.2L157.1,293.8L154.8,293.4L153.7,293.6L152.7,293.7L152.3,294.1L152,294.9L150.5,294.8L149.5,295.8L148.9,295.8L148.3,294.8L147.6,295.1L145.9,295.2L145.9,295.7L145.1,295.5L144.2,296.2L143.8,296.8L143,297L141.4,296.2L142,296L142.5,293.3L142.6,292.6L141.1,290.8L142.1,291.6L143.8,291.5L145,290.5L145.8,289.9L146.3,289.7L146.3,289.6L146.2,289.3L146.8,289.6L147.7,289L147.7,288.3L148.4,288.1L149.8,289L151.1,289.2L151.6,288.4L152.1,289L152.3,288.2L152.9,288.3L153,289.9L153.4,289.3L155,290.1L154.7,290.4L155.4,291.2L156.9,291.9L157.2,291.6ZM145.1,288.5L144.9,287.8L145.7,288ZM143.8,288.8L144,287.7L144.4,288.3ZM153.9,286.1L152.7,286.4L153.6,285.3L154.7,285L155.1,284.6L156.6,284.3L157.3,284.4L156.5,287.1L155.8,286.3L155.2,286.5L154.5,287.8L154.7,286.8ZM151.5,286.6L150.7,286.1L151.6,285.6L152,286.1Z","愛媛県":"M126.7,309.3L125.6,309L124.8,309.4L125.6,311.2L126.5,312.8L126.4,313.1L124.1,314.1L124.1,314.2L123.8,315.5L123.2,315.6L121.9,317.2L121,315.9L120.5,316.2L121.4,317.8L121.2,319L121.6,319.4L121.8,321.1L121,322.2L119.8,322.4L119.7,321.7L118.2,321.4L118.4,322.2L117.6,322.6L117.2,321.7L117.9,321.3L119,321.2L118.2,320.8L117.6,319L116.3,318.7L115.5,319.5L116.1,318.4L116.6,318.8L117.8,318.6L117.7,317.8L116.8,316.4L117.2,315.9L116.6,314.9L117.4,315L117.4,315.7L118.4,316L118.3,315.2L119.1,315.1L119.3,314.5L118.4,313.7L117.7,314L118.3,312.7L116.8,312.7L115.8,312.2L116.6,311.8L116.7,310.8L116,310.7L116.1,310L117,308.9L116,308.7L114.7,308.5L114.1,309.1L112.1,309.8L111,310.9L110.8,310.3L109.3,310.8L110.9,309.6L111.5,309.9L112,309L113.2,308.7L113.7,309L114.5,308.2L115.8,307.5L117.2,306.8L118.2,305.5L119.5,304.8L120.8,304.4L122.2,303.3L123,301.7L122.8,301L123.4,299.8L123.4,298.5L124.2,298.6L124.7,297.3L124.8,296.4L125.5,295.9L126.6,295.1L127.9,294.9L128,293.7L128.4,293.1L129.1,293.8L129.9,295.2L130.7,297.1L131,298L131.9,298.5L134,298L135,297.2L135.8,297.1L137.1,297.4L139.6,297.9L140.2,297.5L141.4,296.2L143,297L143.2,298.2L143,299.4L142.4,300.2L140.9,300.4L140,300.1L139.3,301.1L138.9,301.2L138.3,301L137,301.3L136.3,301L135.7,301.4L134.7,301L134.3,301.9L133.5,302.2L133,301.8L132.2,302.8L132.2,303.3L131.4,304.2L131.3,304.9L130.5,305.1L130.4,306.2L129.7,306.9L130,307.7L129,309.2L128.4,309.3ZM121.3,297.5L120.9,296.9L122.2,296.1L122.2,297.1ZM122.6,299.4L122.4,298.4L123.3,298ZM128.8,291.9L128.8,291.1L129.4,291.2L129.4,289.6L130.2,289.5L130.8,290.4L130.8,291.3ZM131.8,292.1L131.2,292L130.8,291.2L131.8,290.9L132.3,291.6ZM130.2,294L129.8,293.2L130.4,292.8L130.3,291.9L131.2,292.6L131.8,292.4ZM133.8,291.1L133.7,290.3L134.3,289.8ZM132.3,290.9L132.8,290L133,290.6Z","高知県":"M140.8,308.9L138.3,310.2L137.3,310.7L135.9,310.8L136.3,311.3L137,310.6L137.4,310.9L137.5,311.1L135.6,311.5L135,312.3L134.4,311.9L133.7,312.2L133.8,312.8L133.1,313.2L133.7,313.6L133.5,315.3L131.6,317.7L131,318.6L130.3,319.1L130,320.3L128.9,319.9L128,321.3L127.8,322.4L128.1,322.9L128.1,323.6L127.1,324L126.9,325.3L127.8,325.9L128.2,327.4L127,327.1L126.6,326L125.5,325.7L124.5,325.9L124.2,326.4L123.4,326.4L122.8,326.5L122.1,325.3L120.4,326L120.3,325.2L121.2,324.2L120.9,323.9L121.9,323.1L122.2,322.6L121,322.2L121.8,321.1L121.6,319.4L121.2,319L121.4,317.8L120.5,316.2L121,315.9L121.9,317.2L123.2,315.6L123.8,315.5L124.1,314.2L124.1,314.1L126.4,313.1L126.5,312.8L125.6,311.2L124.8,309.4L125.6,309L126.7,309.3L128.4,309.3L129,309.2L130,307.7L129.7,306.9L130.4,306.2L130.5,305.1L131.3,304.9L131.4,304.2L132.2,303.3L132.2,302.8L133,301.8L133.5,302.2L134.3,301.9L134.7,301L135.7,301.4L136.3,301L137,301.3L138.3,301L138.9,301.2L139.3,301.1L140,300.1L140.9,300.4L142.4,300.2L142.8,300.7L144.1,301.3L146,301.2L146.6,302.2L147.4,302.6L148.9,301.5L149.1,301.9L149.9,301.8L150.3,303L150.4,304.5L150.2,305.1L152.3,305.3L152.7,306.3L152.1,307.1L152.9,308.4L154.6,308.5L155.1,308.8L153.7,310.8L153.5,311.3L153,312.4L152.1,316.1L151.4,314.8L150.9,314.8L150.7,314L149.4,312.7L149,311.6L148.6,311.5L147.9,311L147.5,310L145.2,309.2L144.2,309.1L143.4,308.5L142.5,308.6ZM118.4,327.4L118.5,326.2L119,326.7Z","福岡県":"M89,300L89.7,301.6L90.4,302.9L92,303.5L92.4,303.5L92.1,304.2L92.4,304.8L91.9,305.6L92,306.1L89.8,305.9L88.3,305.8L88.1,305.8L87.4,306.3L86.9,307L86.4,307.1L86,308.8L85.4,308.9L84.9,309.6L85.2,309.8L85.4,311.6L84.5,311.7L85.1,312.4L84.7,312.8L85.6,313.4L84.8,315.3L84.5,315.4L83.2,314.8L82.4,314L81.6,314L81.4,313.5L80.8,315L79.3,314.7L78.9,314.9L79,315.3L78.5,315.4L77.5,316.1L77.8,317.1L77.6,317.3L75.8,317.1L76,315.5L75.9,315.1L74.8,313.7L74.8,313L74.6,312.2L75.4,311.8L75.4,311.2L75.6,311.4L76.3,310.7L77,310.8L77.7,310L77.7,309.3L78.9,309.1L79.1,307.9L79.1,306.8L78.6,306.5L77.5,306.9L77.5,306.9L77,307.6L76.4,307.7L76.2,306.9L75.8,306.9L75.1,306.3L73.8,305.4L72.3,305.2L71.7,305.5L70.5,305.2L69.1,305.2L69.3,304.7L70.9,304.4L71.5,303.8L71,302.9L70.4,302.6L71.5,302.4L71.8,301.6L72.6,301.4L72.9,300.8L73.4,301.2L73.3,302L74.1,302.2L73.9,302.8L74.8,302.6L76.3,302.8L77.4,301.2L77.1,300.6L76,301.2L75.8,301.6L74.5,300.6L74.9,300.4L75.5,301.1L76.7,300.6L77.2,300L77.8,299.8L78.3,299.1L77.9,297.6L78.3,297.7L78.7,296.8L80,295.9L81,296.3L81.9,296.2L82.7,295.4L83.2,295L84.3,295.3L84.3,294.9L85.7,295.6L86.3,295.5L87,296.5L87.8,296.1L88.6,294.8L89.8,295L88.9,296.4L89.2,296.7L88.6,297.9L88.6,298.5L89.3,299.6ZM85.7,295.4L84.8,294.9L85.9,294.9ZM77.7,295.8L77.4,295.2L78.1,295.2Z","佐賀県":"M76.4,307.7L77,307.6L77.5,306.9L77.5,306.9L78.6,306.5L79.1,306.8L79.1,307.9L78.9,309.1L77.7,309.3L77.7,310L77,310.8L76.3,310.7L75.6,311.4L75.4,311.2L75.4,311.8L74.6,312.2L74.8,313L74.8,313.7L73.5,313.5L72.5,312.1L72.1,312.1L72.2,312.9L70.6,314L70.1,313.7L70.9,315.5L71.2,317L71.8,317.5L71.4,317.9L69.1,317.3L68.9,316.9L68.3,316.5L68.3,316.5L67.6,316.1L67.2,315.1L66,314.2L66.1,313.8L66.6,313.8L66.5,312.4L65.2,312.3L64.1,311.8L64.1,310.5L63.5,309.6L63.1,309.1L63.9,307.9L64.6,308.9L65.5,306.8L64,305.2L64.5,304.5L65.3,305.5L65,303.7L65.5,303.9L65.6,303.1L66.1,303.6L66.4,303.1L67.8,304.1L67.1,305L68.2,305.7L69.1,305.2L70.5,305.2L71.7,305.5L72.3,305.2L73.8,305.4L75.1,306.3L75.8,306.9L76.2,306.9Z","長崎県":"M63.5,317.1L63.4,318.2L63,317.4L63,319.3L64,320.3L64.1,319.6L64.4,320L64.9,319.4L66.1,319.7L66.6,320.4L67.3,320.2L66.5,319.5L65.9,318.3L65.9,317.1L66.3,316.6L66.3,316.1L65,314.7L63.6,314.5L62.3,314.6L62.2,313.5L63,312.6L62.1,313L62.2,312.1L61.7,312L61.8,313.2L61,313.1L61.2,311.9L60.7,311.7L60.7,310.9L60.5,310.4L60.5,311.1L59,310.4L59.3,309.2L60.1,308.2L59.5,307.8L59.7,306.6L60.7,307.1L61.6,306.6L61.5,307.2L62.2,307.6L63,307.2L63.9,307.2L63.9,307.9L63.1,309.1L63.5,309.6L64.1,310.5L64.1,311.8L65.2,312.3L66.5,312.4L66.6,313.8L66.1,313.8L66,314.2L67.2,315.1L67.6,316.1L68.3,316.5L68.3,316.5L68.9,316.9L69.1,317.3L71.4,317.9L70.9,318.9L69.4,319.4L70.1,320.5L70.2,320.6L70.3,320.6L70.8,320.7L72,319.9L73.6,320.3L74,320.6L74.6,322.5L74.4,323.5L73.8,324.1L73.7,325L72.3,325.3L71.1,326.4L70,326.7L70,325.9L69.3,325L71,323.4L70.6,321.8L69.9,321.7L68.7,321.6L67.4,322.4L66.7,322.3L66,322.7L64.6,324.5L63.4,324.9L63.3,325.3L62.2,326.2L61.2,326.2L62.3,325.5L63.3,323.3L63.4,322.3L62.3,320.6L61.7,320.7L61,320.1L60.5,318.4L59.9,317.8L59.8,316.4L60.3,316.2L60.3,315L61.1,313.5L61.7,313.9L62.4,315.1L62.1,316.3L62.7,315.6L63.4,316L63.8,316.9L63.4,317.1L63.5,317.1ZM50.2,309L49.2,308.3L50.7,307.8L51,308.4ZM59.4,304.4L58.9,303.9L59.5,303.4L60,303.8ZM56.4,307L56,306.8L56.6,305.3L56.7,306.9ZM55.2,311.3L54.9,310.5L55.7,311.1L55.5,309.9L56.4,309.5L56,308.7L56.8,308.5L56.9,307L58.3,307L59.1,306.3L59.4,307.1L58.6,308.1L58,308.4L58,309.1L57,310.4ZM62.8,306.2L63.7,305L63.4,306.1ZM64.3,307.8L64.3,306.7L65.3,307ZM58,281L57.5,282.9L57.7,283.7L57.1,284.1L56.8,283.5L57.3,282.9L56.5,281.8L55.3,282.6L54.8,282.2L55.8,281.9L56,279.8L56.7,278.4L57.3,278.4L56.8,277.4L57.3,275.5L57.6,275.8L58.7,275.6L59.3,274.6L59.9,274.3L60.7,275.4L60.1,276.7L60,278.1L58,280.3ZM53.9,288.9L53.2,287.3L54.3,282.9L54.5,283.9L55.5,283.3L57.1,284.2L56.6,284.5L55.4,287.9ZM57.2,284.7L57.1,284.1L58,284ZM63.1,299L62.4,298.4L62,296.4L62.8,296.5L62.5,296L62.9,295.3L64.4,295.7L64.2,296.7L64.8,297.2L64.6,298.2L63.5,298.2ZM45.6,319.4L45.6,318.9L44.7,317.8L45.2,317.6L45.5,318.5L45.9,317.7L46.1,318.2ZM44,320.1L43.4,319.6L43.6,318.3L44.8,318.8L44.9,319.4ZM41.7,324.5L41,323.7L39.6,323.5L39.3,323.9L38.2,323.2L38.6,322.4L39,323.4L39.7,321L39.4,319.7L39.9,319.2L40.6,319.7L40.4,320.4L41.9,320L42.5,319.4L43.6,320.3L43.3,321.3L44.4,322.9L42.7,323.1L42.6,322.6L41.7,322.8L42.1,323.7ZM46.4,320.9L46.6,319.7L46.9,320.2ZM59.6,315.3L59.1,315.1L60,314.3ZM58.6,315.7L58.6,315L59.2,315.2ZM48.6,310.3L48.2,309.9L48.8,309.5L49.4,310.4ZM50.2,311.1L50,309.9L50.4,310.3ZM48,319.2L47.7,319.1L48.1,317.2L47.8,316L46.9,316.1L47.1,315.5L48.1,315.1L48.1,314.3L48.6,313.8L49,314.2L49.1,313L49.9,312.3L49.2,313.9L49,315.3L50.2,314.9L50.8,315.7L49.9,316.5L49.3,316.4L48.6,317.3L48.9,318.2L48.3,318.1ZM47.4,318.5L46.5,317.7L46.2,316.9L46.8,316.3L47.6,317.3Z","熊本県":"M84.6,315.7L85.5,315.9L86,316.7L86.8,317L87,317.5L87.6,317.4L88.1,315.9L87.4,314.7L87.8,313.7L89.6,313.7L90.2,313.9L90.8,314.6L91.3,315.9L91.6,316.5L91.7,316.7L92.2,318.2L92.9,319.1L92.5,319.5L92.6,320.7L92.7,321.5L94,322.7L92.7,322.7L92,323.8L91.9,324.4L91.9,324.7L90.7,325.4L90.6,326.3L90.1,326.1L89.3,327L89,328.5L88,328.2L87.2,329.1L86.9,331.1L87.5,332.5L87.9,332.5L88,333.8L88.7,334.5L88.4,334.9L87.8,335.6L87.4,335.4L87.2,336.5L88.2,337.6L88.3,338.6L87.3,338.6L86.9,338.2L86,338.5L85.5,339.3L84.3,339L83.6,339.2L83.1,339.7L80.6,339.2L80.3,339.4L79,338.5L79,338.1L77.8,337.2L77.6,337.9L76.7,338.3L75.4,338.1L75.4,338.5L73.9,338.4L73.1,337.2L74.1,335.7L74.7,335.8L74.7,335L75.4,334.8L76.1,332.6L77.2,331.6L77.9,331.1L77.9,330.1L77.4,329.6L77.9,328.6L78.9,327.3L79.4,327.2L79.4,326.7L77.4,326.5L76.1,326.8L75.8,326.4L76.8,325.7L77.6,325.5L78.3,324.7L79.2,324.4L79,322.9L79.4,322.5L78.6,321.1L77.7,321L77.8,320.3L76.8,319.6L76.1,318.6L75.8,317.1L77.6,317.3L77.8,317.1L77.5,316.1L78.5,315.4L79,315.3L78.9,314.9L79.3,314.7L80.8,315L81.4,313.5L81.6,314L82.4,314L83.2,314.8L84.5,315.4ZM75.1,328.2L74.6,327L75.6,326.3L75.8,327.4ZM75.9,328.4L75.9,327.6L76.4,327.7ZM68.9,327.7L70.3,327.8L70.5,329.4L70.4,330.2L72.2,329.4L72.9,328.7L73.8,328.5L74.3,329.2L74.9,328.7L75.7,328.8L74.9,330.9L74.3,331.7L73.4,332.2L73.3,331.6L73.3,331.5L73.4,331.5L72.5,331.6L70.7,330.8L70.2,331.2L70.7,332.2L70.1,333.2L69.7,332.8L68.9,333.2L67.9,335.3L66.1,336.1L65.6,335.8L66.1,334.9L65.2,334.7L66.3,333.5L65.6,332L66.6,330.1L67.3,328.9L67.1,328.1L67.7,328.3ZM76.4,327.6L76.2,326.9L76.9,326.9ZM72.2,333.8L73.2,332.8L73.7,333L73.1,333.7Z","大分県":"M106.2,316.4L105,317.2L106.5,317.8L108,317.9L107.4,318.4L106.7,318.2L105.8,319.3L105.7,319.9L106.5,320.6L107.8,320.6L107.2,321.4L107.7,322.5L106.7,323.3L106.9,324.3L105.9,324.6L105.1,324.4L105.1,325.5L104.3,325.7L104.7,323.7L102.2,323.2L101.6,324.6L100.7,324.7L99.2,324.4L98.7,324.9L97.5,324.3L97.7,323.7L96.9,322.8L95.8,323.3L94.5,323.4L94.3,322.8L94,322.7L92.7,321.5L92.6,320.7L92.5,319.5L92.9,319.1L92.2,318.2L91.7,316.7L91.6,316.5L91.3,315.9L90.8,314.6L90.2,313.9L89.6,313.7L87.8,313.7L87.4,314.7L88.1,315.9L87.6,317.4L87,317.5L86.8,317L86,316.7L85.5,315.9L84.6,315.7L84.5,315.4L84.8,315.3L85.6,313.4L84.7,312.8L85.1,312.4L84.5,311.7L85.4,311.6L85.2,309.8L84.9,309.6L85.4,308.9L86,308.8L86.4,307.1L86.9,307L87.4,306.3L88.1,305.8L88.3,305.8L89.8,305.9L92,306.1L91.9,305.6L92.4,304.8L92.1,304.2L92.4,303.5L94.2,304.5L97.2,304.9L97.1,304.5L98.1,304L98.7,302.8L99.7,302.6L100.6,302.3L101.3,302.9L102,302.9L103.3,305L103.5,306.1L102.8,308.4L102.5,309.3L101.1,308.8L101.3,309.8L100.7,310L100,310.6L99.1,310L98.2,310.5L98.5,312.5L99.9,313L102,312.4L103.2,313.4L104.1,313.4L106.3,313.1L105.7,313.5L105.1,314.8L104,316.3L104.8,316.6ZM101.6,301.7L102.3,301.2L102.7,301.4Z","宮崎県":"M92.9,355.1L92.4,355.6L92.5,356.6L91.9,357L91.7,358.2L91.2,357.5L90.1,357.6L89.1,355.8L88.2,355.5L88.5,354.6L89.1,354.3L89,353.3L89.3,352.8L89.1,351.7L88.7,351.4L87.8,351.5L86.9,350.6L86.4,351.2L85.8,350.4L85.8,348.5L85,348.3L85.3,347.7L83.1,346.8L83,345.9L83.9,344.9L82.9,343.7L82,343.4L81.4,342.5L81.3,341.6L79.9,340.4L80.3,339.4L80.6,339.2L83.1,339.7L83.6,339.2L84.3,339L85.5,339.3L86,338.5L86.9,338.2L87.3,338.6L88.3,338.6L88.2,337.6L87.2,336.5L87.4,335.4L87.8,335.6L88.4,334.9L88.7,334.5L88,333.8L87.9,332.5L87.5,332.5L86.9,331.1L87.2,329.1L88,328.2L89,328.5L89.3,327L90.1,326.1L90.6,326.3L90.7,325.4L91.9,324.7L91.9,324.4L92,323.8L92.7,322.7L94,322.7L94.3,322.8L94.5,323.4L95.8,323.3L96.9,322.8L97.7,323.7L97.5,324.3L98.7,324.9L99.2,324.4L100.7,324.7L101.6,324.6L102.2,323.2L104.7,323.7L104.3,325.7L105.1,325.5L104.6,325.8L104.1,326.8L102.5,327.5L102.7,328.1L102,329.1L101.3,329.2L100.7,330.1L100.7,331L101.3,330.8L101.5,331.4L100.8,332L100.1,331.6L99.9,332.2L100.5,333.2L99.6,333.4L98.5,335.8L98,337.4L97.2,339.3L96.6,341L96.2,342.2L94.9,346.1L94.8,347.4L95.5,348.2L95,349.7L94.5,350.7L94.9,351.6L93.9,352.4L92.9,353.6Z","鹿児島県":"M77.3,349.6L77.4,350L76.2,351.4L75.3,354L74.9,354.1L75.1,355.7L75.7,357.8L76.1,358.4L76.8,359.2L77.7,359.5L77.4,360.6L76.8,361.5L75.9,362L75.3,361.4L74.5,361.7L74.4,360.5L73.5,359.5L71.6,359.3L69.8,358.9L69.4,359.1L68.4,359L68.7,357.8L67.7,357.3L68.4,357L67.1,355L67.6,354.5L68.1,355.2L68.9,355.5L69.9,355L70.9,353.5L71.4,352L71.4,350.1L71.2,349.4L70.1,347.6L69.3,346.9L68.7,347L68.7,346.3L68.4,345.9L69.4,344.1L69.8,342.8L69.5,341.4L69.1,340.9L69.7,340L69.2,338.4L70.4,338L71.9,338.6L73.1,337.6L73.1,337.2L73.9,338.4L75.4,338.5L75.4,338.1L76.7,338.3L77.6,337.9L77.8,337.2L79,338.1L79,338.5L80.3,339.4L79.9,340.4L81.3,341.6L81.4,342.5L82,343.4L82.9,343.7L83.9,344.9L83,345.9L83.1,346.8L85.3,347.7L85,348.3L85.8,348.5L85.8,350.4L86.4,351.2L86.9,350.6L87.8,351.5L88.7,351.4L89.1,351.7L89.3,352.8L89,353.3L89.1,354.3L88.5,354.6L88.2,355.5L87.2,355.1L86.2,355.8L85.2,356.9L85.1,357.8L86.9,358.6L86.2,359.5L86.3,359.9L87.3,359.8L85.9,361L84.9,361L84.5,361.9L83.6,363.1L82.3,363.6L80.9,363.9L78.4,364.9L77.5,365.9L77,365.8L77.6,364.4L77.1,364.2L78.8,363.2L79.6,361.7L79.7,360.6L80.2,360.1L80.4,359L80.6,358L79.9,356.1L79.3,355.1L78.7,354.8L78.9,352.6L77.6,352.7L76.8,351.5L77.6,350.9L78.6,350.7L79.3,351.4L79.1,352.5L80.3,352.5L81.1,350.9L81.6,350.3L81.1,349.2L79.8,348.9L79.6,348.4L78.7,348.3L77.5,348.9ZM80.8,378.8L81.3,378.3L82.4,376.3L82.5,375.2L82.4,374.3L83.7,372.5L83.8,371.7L84.5,370.8L85.1,370.5L85.5,371.9L85.3,373.9L84.9,374.2L84.5,376.3L84.1,376.5L83.3,377.4L82.5,378.9L82.5,379.6L82.7,380.8L82.4,381.5L81.8,381.4L80.4,382.1L80.1,381.4L80.3,380.2L80.1,379.1ZM62.4,345.2L62.5,344.8L61.4,343.7L62.3,343.3L63.3,344.3L63.4,344.9ZM61.5,345.8L61.2,345.2L61.8,344.7ZM58.8,349.3L58.2,349.2L57.7,348.3L58.2,348.2L58.7,347L60.3,346.5L59.1,348.1L59.4,348.5ZM40,429.4L41,429.2L42.4,429.4L41.8,428.6L42.8,428L43.9,427.8L44.7,427.1L45.1,427.5L45.8,426.8L46.9,427L47.1,426.3L48,426.6L49,425.3L50.8,425L50.3,426.1L51,426.5L51.2,426.1L51.3,425.3L51.8,425.5L51.3,424.5L52.3,423.8L52.8,426.1L51.5,427L50.9,426.7L50.5,426.8L49.4,428.1L48.7,428.4L48.8,428.9L47.4,429.3L46.9,429.1L46.4,430.3L45.8,430.1L47.2,431L46.1,431.5L45.7,431.4L45.5,432.3L44.1,431.9L44.7,432.4L44.9,433.4L44,432.8L42.6,431.4L42.9,430.2L42.2,430.5L40.9,430.3ZM61.7,369.2L61.2,368.5L61.9,368.3L62.4,368.9ZM68.8,370.8L68.5,370.5L69.4,370L69.6,370.6ZM60.1,390L59.5,389.3L59.8,389L60.3,389.6ZM58.6,393.1L57.9,392.3L58.2,391.5L59.1,391.9L59.5,393.1ZM54.7,398L54.3,397L54.5,396.6L55.6,396.5L55.3,397.4ZM43.6,408.6L42.9,407.9L43.6,407.8ZM70.3,335L70.8,333.8L71.4,334.3ZM68.8,338.8L67.9,337.8L68.1,337.1L67.6,336.5L68.1,335.6L69,336.1L69.4,335.4L69.7,336.2ZM66.8,379.1L66.4,378.1L66,378.2L65.5,377.3L67.3,378L67.9,378.7ZM72.9,384.4L71.1,383.9L70.4,381.9L70.2,380.1L71,380.1L72.2,378.6L73,378.8L75.6,380.3L76.2,381L75.6,382.9L74,384.2ZM43.5,434.4L43.6,433.8L42.9,433.8L42.8,434.4L42,433.2L41.5,433.9L41.6,432.4L40.7,431.1L41.5,430.9L41.5,431.8L42.1,432.1L42.1,432.8L43.3,433L44.4,433.5ZM39.8,435.3L40.3,434L40.2,435.1ZM42.1,435.7L41.2,435.2L42.3,434.9ZM57.3,430.5L56.7,429.9L56.8,429.3L59.2,428.3L58,430.2ZM34.1,441.1L33.7,439.3L34,438L34.4,437.7L35.8,437.9L35.6,439.6L36.9,440.9L36.5,442.2L36,442.6L35.7,443.2L34.4,443.2L34.2,442.5L33.5,441.8ZM26.4,448.9L27.7,448.8L28.9,448.2L28.6,448.8L27.3,449.9L25.8,450.6L25.1,449.5L25.5,448.7ZM22.7,457.8L21.7,457.1L22.7,456.7Z","沖縄県":"M30.8,92.4L34.9,89.5L34.1,83L33.7,80.3L31.3,69.4L34.7,72.3L47.8,65.7L47.9,62.7L52.4,63.3L58.4,60.1L64.4,56.9L65.2,53L55.8,49.8L53.7,44.8L55.5,42.3L54.6,35.6L59.1,37.1L62.9,36.6L69.7,40.5L66.9,45.4L71,48.4L77.8,46.6L83.1,45.2L80.7,42.5L87.6,37.9L97.7,28.2L101.7,18L107,22.6L108.7,31.1L107.4,37.4L100.1,45.8L96.2,50.5L86,49.6L85.8,53.8L83,54.3L83.7,59.6L79.1,61.1L71.1,58.4L73.1,63L66.3,63.8L66.6,67.1L59.7,69.2L58.9,72.2L52.4,69.5L47,72.3L45.1,73.7L49.9,78.8L49.6,82.1L53.9,87.5L52.2,89.9L48.3,84.1L45.8,85.2L43.7,89.2L41.7,90.9L37.8,98.4L35.1,101.1L36.1,103.9L37.4,106.6L41.5,104.1L42.3,107.3L33.5,112.2L29.5,115.5L22.7,118L20.5,116.7L22.6,107.4L20.9,104.2L19.3,100.9L25,97.7L23.8,94.9L24.5,95.1L25.6,95.6ZM-424.6,299.9L-431.9,294.1L-427.9,291L-429.4,285.3L-434.3,286.9L-434,282.1L-429.7,283.4L-428.6,280.6L-422.4,284.1L-417.2,284L-415.6,278.2L-412,275.9L-409.9,278.3L-407,273.7L-408.2,271L-403.9,264.9L-400.6,265.9L-402.1,270.7L-409.4,280.6L-413.2,282.9L-413.4,290.1L-416.9,298.9L-421.4,297.2ZM72.1,46L67.7,43.7L71,41.4ZM56.5,86.8L62.3,81L64.5,82.8ZM-281.5,266.9L-286.7,263.1L-283.9,261.3L-286.6,255.9L-280.9,248.8L-283.1,240.7L-280.2,244.6L-277,255.6L-265.8,262.2L-263.2,266.9L-273.6,265.5ZM-295.1,251.7L-296.7,244.2L-291.4,247.4L-291.1,252.8ZM-295.1,251.7L-297.6,252.6L-299.5,247ZM45.9,35.2L39.8,34L40.6,30.4L46.4,30.8L48.9,33.6ZM-15.9,104.3L-16.6,99.4L-14.4,93.7L-12.6,94.6L-14,103ZM-20.2,93.9L-22.7,92.5L-19.3,89.6L-16.9,91.5ZM-27.2,45.1L-23.5,41.9L-23.3,45.3ZM448.6,190.3L446.7,188.9L448.2,182.7L453,183.1L452.7,189.1ZM458.6,175.5L456.5,171L462,172.5ZM64.7,-1.9L64.7,-5.4L73,-13.7L76.1,-14.3L72,-7.9L65.8,-4.7ZM64.2,9.4L61.9,4.5L66.5,4.9ZM-87.9,69.1L-89.5,65.8L-81,63.9L-76.2,70.7L-79.5,77.4L-83.5,71.5ZM-357.1,266.8L-359.9,263.5L-356.7,261.6L-353.1,265.2ZM-462.2,304.6L-466.8,301.8L-476.1,299.4L-479.9,296.1L-480.7,298.9L-485.1,297.7L-487.1,294L-483.9,291.1L-480.9,293.6L-478.9,290.4L-476.5,295L-475.8,283.9L-470.4,278.8L-467.2,282.9L-460.5,284.7L-452.5,291.1L-454.8,297.5L-458.3,298.8L-458.2,302.5ZM-447,297.5L-451.4,295.6L-446.3,294.6ZM-446,311.6L-448.1,307.7L-443.6,308.7ZM-475.4,331.2L-479.8,328.5L-473,329.2ZM-563.5,265.1L-572,262.9L-568.8,259.5L-559.2,262.5Z","北海道":"M288.9,76.5L290,75.2L291.2,73.3L291.2,71.1L289.9,68.7L290.3,67.1L289.6,65.7L289.2,64L289.3,63.5L290.2,61.8L292.2,60.6L293.1,60.4L293.9,59.3L294.3,58.7L294.6,57.1L294.8,56.6L294.5,51.9L294.3,49.4L294.8,48.6L295.9,46.5L296.1,43.5L296.4,42.8L296.4,41.4L295.8,37.4L295.3,35.7L293.9,32.1L292.3,28.6L292.1,27.2L292.8,26.2L293.5,24L293.1,23.4L293.2,22L294.3,23.3L296.4,22.6L297.1,21.6L297.3,20.4L298.2,20.1L298.7,21.1L299.5,21.7L300.1,22.9L302.2,24.3L303.9,26.5L305.4,28.2L308.2,31L309,32.6L309.7,33.2L309.9,34.2L310.6,34.9L312.5,37.7L314.5,39.6L315.4,40.3L317.3,42.6L319.2,43.9L321.3,45.2L322.4,46.1L323.7,46.8L324.1,47.7L324.9,48.2L327.5,49.4L331.4,50.9L333.5,51.5L337.5,52.1L339.1,52.4L339.6,52.1L339.9,53.8L340.5,54.3L340.7,55.1L341.9,55.7L345.3,56.4L348,56.2L349.5,55.8L351.5,53.6L352.9,51.6L354.7,49.9L355.9,49L356.4,47.7L358.1,45.3L358.8,47L357.9,49.5L357.2,50.3L356.7,52.8L355.7,54.1L354.8,56.4L354.9,57.2L354.3,58.5L354.5,59.8L356.1,62.3L357.9,62.9L359,63.2L358.5,63.4L357.9,62.9L357.1,63.1L358.1,65.2L358.8,67.8L359.5,69L361,70.5L362.9,71L363.4,70L365.2,68.2L365.4,67.8L366.7,67.9L367.4,67.4L368.4,67.7L368.2,68.3L367,69.2L364.9,69.8L364.2,70.6L364.1,72L363.4,72.8L363.6,73.4L362.7,72.9L360.2,73.5L358.8,73.9L358,74.5L357.5,74.2L356.5,74.9L356.7,76L356.2,76.8L355.2,77.3L354.7,78.2L354.1,78.6L352.6,78.5L351.8,77.9L352.1,77L350.8,77L350,78.3L349.9,78.9L350.9,79.9L349.1,79.9L348.3,79.7L346.5,79.8L345.7,80.1L343.6,79.5L343.4,78.8L341.1,79L340.1,79.4L337.3,81.1L335,83.1L332,86.4L330.4,88.2L329.2,89.9L327.7,92.4L327,93.9L326,96.6L325.8,98.1L326.4,99.1L326.2,100.1L326.1,102.8L325.3,104L325,105.8L323.6,104.5L323,103.5L321.7,102.7L320.7,102.3L319.8,101.4L318,101.1L317.2,101L316.1,100.2L314.5,99.9L314.1,99.5L312.9,98.7L310.9,98.1L310.3,97.4L309.6,97.3L308.3,96.5L307.2,95.7L306.2,94.7L304.9,93.7L302.7,93.3L301.5,92.3L299.9,90.9L298.5,90.6L298.4,90.4L296.2,90L294.9,90.1L293.1,90.8L291.7,91.5L290.5,92.3L288,94.5L287.7,94.6L286,96L285.4,97L284.4,98.3L284,97.8L284.1,97L282.7,96.5L282,94.5L281.4,94.3L280.2,93.1L279.3,91.9L277.8,91.6L276.8,92.1L276,91.6L274.9,91.6L273.7,92.7L272.7,94.4L271.8,96.8L271.5,99.1L271.7,99.8L272.6,100.4L273.4,100.4L274.8,101.5L275.8,102.7L277,103.2L279.3,102.4L280.4,103.3L281,103.8L281.4,104.8L282.2,105.4L283,106L283.9,107.6L284.9,108.1L286.7,108.6L287.4,109L287.4,109.6L288.1,109.9L287.6,110.7L286.8,110.7L286.1,111.8L284.2,112.6L283.6,112L280.7,111.1L279.4,112L279.2,111.4L279.8,110.9L279.5,110.3L278.7,110L278,110.4L277.6,112L276.8,112.5L276.3,113L275,113.2L274.6,114.1L274.6,115.8L274.8,116.6L274.2,117.5L273.4,117.6L271.5,118.4L270.6,120.3L269.5,119.7L268.3,119.9L267.4,119L266.6,116.8L266.7,114.9L266.9,113.4L267.8,111.9L268.1,110.6L268.9,110.1L269.2,108.5L269,107.1L268.8,105.8L267.9,104.5L267,103.2L265.2,102.7L264.4,101L262.9,100.4L262.3,98.5L262.6,97.5L263.4,96.5L263.8,94.8L263.2,91.2L264,89.9L265,89.4L266.9,89.3L267.5,88.6L268.8,87.7L269.4,86.4L269.6,86L270.5,86.7L270.7,87.3L271.7,87.1L271.7,85.9L272.6,84.7L273,84L273.6,83.1L275.5,81.9L275.6,81L274,78.8L272.5,77.4L271.9,76.4L272,74.9L272.3,73.7L273.6,73.7L274.2,73.3L274.3,72.7L275.3,73L276.8,74.5L277.2,74.5L277.4,75.2L278.5,75.5L279.8,76.1L280.1,76.8L281,76.7L282.3,76.4L282.5,76L284.1,75.7L284,76.8L286.7,77.9ZM377.3,61.3L376,61.3L376.4,60.6ZM373.5,65.5L372.7,63.8L373.7,63.3L374.9,63.6L374.6,64.8ZM369.7,66.8L369,66L370.5,65.8L370.7,66.6ZM372.3,67L372.3,66.3L373,66.3ZM254.9,118.3L254.9,117.6L255.6,118ZM256.7,104.9L256.2,104.4L256.2,102.8L255.9,101.8L256.4,100.9L258.4,100.3L258.6,100.6L257.9,101.8L257.7,103.8ZM282.9,26.6L282,23.9L282.1,22.9L282.8,22.5L283.2,23.4L283.3,25.5ZM286.7,30.6L285.3,29.8L284.6,28.7L284.9,27.7L285.7,26.8L286.4,27.4L287,27.4L287.8,28.3L288,29.4L287.4,30.4ZM382.2,58.9L380.9,56.6L381.3,56.2L383.2,55.6L384,54.5L384.8,54.7L385.2,54.1L386.6,55.2L386.5,55.8L385.1,56.2L384.5,57.3L383,57.7L382.7,58.7ZM368.2,50.5L367.9,52.1L367.2,52.2L366.7,53.4L366.6,54.6L365.6,55.1L364.2,55.5L363.2,57L363.3,58.6L363.2,61.3L362.9,61.1L363,59.9L362.6,59.7L361,60.2L360.3,57.3L360.8,57L361.2,56L363.2,54.3L363.3,53.9L364.6,52.8L365.8,51.4L365.6,50.5L367,48.6L367.7,46.9L368.7,46L369.5,44.8L369.6,43.5L370.3,42.5L370.6,41.2L371.4,40.2L372.4,40.2L373.6,41.5L375.1,42.1L377.3,41.9L378.9,41.5L378.7,42.7L378,43.4L377.2,42.9L376.1,43.6L375.9,44.4L374.9,45.5L371.7,46.1L371,46.9L370.7,48.2L369.7,48.5L368.4,49.8ZM407.9,19.4L407.2,19.5L403.5,22.7L402.9,23.8L402,25.4L400.8,26.5L399.8,26.5L398.7,27.1L397.7,26.4L397.6,25.8L396.8,25.9L395.9,26.8L395.8,27.5L396.5,27.8L395.8,29.6L395.1,30.6L394.5,30.8L394.1,31.6L393.3,31.9L391.7,33.4L390.7,35.4L390.6,36L389.8,37.2L388.8,37.5L388.1,37.3L386.9,38.6L386.3,40.3L385.8,41L384.2,40.6L384.5,38.9L385.5,37.9L385.1,37.3L385.3,36L385.6,36.9L386.2,37.2L386.6,36.7L386.5,35.2L387.4,35.7L388.2,35.3L389.1,34.3L389.1,32.5L388,32.5L387.4,31.4L387.9,31L389.2,31.6L389.9,31.2L390.1,29.9L392.2,28.4L393.5,26.6L394,26.3L393.9,23.9L394.6,23.6L395,24.1L395.8,24.2L396.7,23.7L396.6,22.5L397.1,21.7L397.3,21.2L398.7,20.5L399.2,20.6L399.6,19.4L398.7,16.9L399.8,15.1L400.5,15.4L401.6,18.4L402.7,19.1L404.4,18.9L407.3,17.8L407.4,17.4L408.8,16.2L409.3,14.5L410.4,13.4L410.7,12.7L411.6,12.1L411.8,11.4L414,10.6L415.5,11L415.9,12.2L415.1,12.8L415.1,13.7L416,14.4L415.5,15.8L414.6,16.2L413.9,16L412.2,16.2L410.5,17.4L409.9,18.4L409,18.6Z","青森県":"M286.9,132.5L287.7,132.8L288.4,132.3L289.4,130.3L289.7,127.1L290.2,126L290.2,125.5L289.2,123.5L288.2,122.9L288,123.7L286.2,125.3L285.3,125L284.2,125.6L282.9,125.8L281.8,126.7L280.9,126.3L281.1,124.8L281.1,123.7L281.8,121.5L282.1,119.7L282.9,118.5L283.3,117.8L283.4,116.6L283.8,117L285,118L286.2,118.1L287.1,118.7L288.5,120.3L289.5,120.9L290.5,121.1L292.3,120.4L293.4,119.1L293.5,119.4L292.6,123.4L292.3,125.4L292.4,126.3L292.3,129.5L292.6,132.3L293.1,135.5L293.6,137.5L294.1,139L294.8,140.4L295.5,140.9L296.2,140.5L297.6,142.1L298.3,142.6L297.7,143.2L296.5,143.8L296.5,144.6L296,144.9L295.7,145.2L294.6,144.6L293,145L292.2,145.7L291.6,144.7L289.5,146.3L288.7,146.5L287.6,147.1L287.8,147.6L286.3,148.5L285.5,148.6L285,147.9L284.8,147.7L285.2,145.8L285.6,145.4L285.5,144.4L285.4,144L285.4,143.6L284.3,143.8L283.1,143.3L283.4,141.6L282.2,142.2L281.8,143L279.7,144.1L278.9,144.3L278.1,143.5L277.6,143.8L277.8,144.4L276.9,144.2L275.3,142.6L274.4,142.4L273.7,142.9L273.4,143.6L271.9,143.5L271.3,143.8L270,143.7L269.2,143.7L268.5,142.9L267.2,143.8L266.1,144L266.3,142.4L266.1,141L265.7,140.2L264.8,140.2L264.7,139.4L265.4,138.7L265.9,138.8L267.2,136.3L268.1,135.7L269.4,136.3L269.8,136.1L270.7,135.3L271.7,134.9L272.3,133.5L272.9,130L272.9,127.9L272.6,127.5L271.5,127.1L272.5,126.9L272.9,126.3L273.2,124L273.7,124L275.1,125.4L276,125.4L276.9,124.4L277.8,124.7L278.6,125.5L278.6,128.1L278.8,129.2L279.1,131.1L279.9,133.4L280.6,134L281.7,133.8L282.8,132.5L282.8,132.1L282.8,130.8L283.1,129.6L284.4,129.9L285.3,131.3L286.5,131.8Z","岩手県":"M285,147.9L285.5,148.6L286.3,148.5L287.8,147.6L287.6,147.1L288.7,146.5L289.5,146.3L291.6,144.7L292.2,145.7L293,145L294.6,144.6L295.7,145.2L296,144.9L296.5,144.6L296.5,143.8L297.7,143.2L298.3,142.6L300,145.1L300.4,146.3L301.2,148.1L300.6,148.5L300.7,149L301.8,149.5L301.5,150.3L301.2,151L301.8,152.1L302.8,153.2L303.6,153.6L303.8,154.7L303.4,155L303.9,156.1L304.3,157.4L304.5,157.7L304.5,161L303.9,163.1L304.1,163.4L305.2,161.7L305.4,163.5L306,163.6L306.2,164.6L305.2,165.4L305.2,166L304.2,166L304.6,166.9L305.7,165.8L306.1,166.1L305.6,167.4L304.2,167.9L304.3,168.9L303.5,169.2L303.2,169.5L304.8,169.4L304.6,169.9L303.1,170.3L303.9,171.1L303.1,171L303.1,171.6L304.2,171.7L303.2,172.8L303.8,173.2L303.1,173.8L302.2,174.1L303.7,175L303.2,175.4L301.9,174.9L302,175.8L303,175.9L301.9,176.2L302.6,176.9L300.4,177.2L300.3,176L300,177.1L300.6,178L300.1,178L299.9,179.2L299.2,178.3L299.4,177.7L298.4,177.7L298.5,178.5L297.3,177.9L295.9,177.9L295.7,178.4L295.9,180.1L295.2,180.8L295.5,181.3L295,183.1L294.5,183.5L294.6,183.1L292.6,182.3L291.6,183.7L290.9,184L290.5,183.4L289.7,183.3L288.7,182.2L289.5,181.5L289.3,181L288.5,180.8L286.6,181.1L285.3,180L284.5,179.9L283.4,179.1L282.4,179.2L282.2,178.2L282.6,177.7L283,176.8L282.8,176.3L281.9,176.1L282.2,175.2L281.8,174.8L282.9,173.9L282.1,173.2L282.5,172.4L281.2,171.6L280.7,171L280.9,169.9L280,168.8L280.7,166.9L281.4,165.6L281.2,164.5L282.4,163.6L282.9,161.5L282,160.4L283.3,159L282.1,158.2L282.1,157.1L282.8,156.7L283.8,157L283.2,155L283.3,152.9L283,152.2L283.6,151.6L283.7,150.1L283.3,149.8L284.1,148.6Z","宮城県":"M287.8,194L287.8,194.8L288.5,194.5L288.8,194.9L287.9,195.6L287.7,195.5L287.7,195.4L287.7,195.4L287.6,195.4L286.5,198.1L286.1,199.1L285.8,201.2L285.7,202.5L286,204.8L284.6,205L284.6,206.2L284.6,207.3L283.1,207.1L283.5,207.7L282.2,207.7L281.6,207.2L281.3,206.4L281.4,205.1L280.1,204.6L279.7,204.7L277.6,204.9L277.5,204.9L277.3,203.8L275.6,203.3L274.9,203.8L273.6,203.1L273.7,202.4L273.5,201.2L275.3,201.2L276.2,200.4L276.6,199.4L276.6,199L277.3,198.1L277.1,196.4L277.4,195.2L278.1,194.7L278,194L279,193L279.2,191.8L279.8,191.5L279.8,191.4L278.9,190.5L278.5,189.7L278.9,188.7L278.1,187.2L278.3,186.8L279.3,187L279.7,185.7L279.4,185L280.1,183.9L279.3,183.5L279,182.3L278.1,181.6L278.2,181L278.5,181.3L279.4,180.8L279.9,181.1L281.2,180.2L282.1,179.2L282.4,179.2L283.4,179.1L284.5,179.9L285.3,180L286.6,181.1L288.5,180.8L289.3,181L289.5,181.5L288.7,182.2L289.7,183.3L290.5,183.4L290.9,184L291.6,183.7L292.6,182.3L294.6,183.1L294.5,183.5L295,183.1L295.5,181.3L295.2,180.8L295.9,180.1L295.7,178.4L295.9,177.9L297.3,177.9L298.5,178.5L299.4,181.2L298.6,180.1L297.9,180.4L297.7,181.4L298.1,181.9L296.6,182.9L296.8,183.9L297.4,184.1L297.4,185L296.8,184.6L296.2,185.7L295.2,185.7L295.3,186.5L296.2,186.4L296.9,186.7L296.8,187.2L295.6,188L296.4,189.1L297,188.7L297.1,190.1L295.8,189.4L296.4,190.4L296,192.5L296.6,192.4L297.3,194.3L297.1,195.4L296.7,194.8L295.6,194.4L296.1,194L294.9,193.5L295.2,193L294.8,192.3L294.4,192.7L293.8,192.1L292.1,192L291.7,192.3L290.1,193.4L290,194.4L289.4,193L288.7,193L288.2,193.8ZM298,195.5L297.5,194.7L298.3,194.6ZM298.5,181.8L298.1,180.8L298.7,180.8Z","秋田県":"M281.2,164.5L281.4,165.6L280.7,166.9L280,168.8L280.9,169.9L280.7,171L281.2,171.6L282.5,172.4L282.1,173.2L282.9,173.9L281.8,174.8L282.2,175.2L281.9,176.1L282.8,176.3L283,176.8L282.6,177.7L282.2,178.2L282.4,179.2L282.1,179.2L281.2,180.2L279.9,181.1L279.4,180.8L278.5,181.3L278.2,181L277.2,180.8L277.1,180.7L276.3,179.6L276,178.5L274.9,178.5L274.6,177.7L274,177.5L273.7,178L272.7,177.5L271.6,177.6L271.6,177L270.6,177.2L270.4,176.9L269,176.2L268.9,175.2L267.7,175.9L266.8,175.7L265.3,175.7L266,173.9L265.8,173.3L266.4,171.5L267.3,170.9L268.1,168.3L268.7,164L268.6,160.8L268.1,159L266.9,157.2L266,156.7L264.8,156.9L264.9,157.6L262.9,157.8L262,156.1L262.3,154.8L263.7,155.4L264.5,155.1L265.8,153.6L266.4,152.6L266.9,151.3L267.6,147.9L267.8,146.4L267.5,145.2L266.1,144L267.2,143.8L268.5,142.9L269.2,143.7L270,143.7L271.3,143.8L271.9,143.5L273.4,143.6L273.7,142.9L274.4,142.4L275.3,142.6L276.9,144.2L277.8,144.4L277.6,143.8L278.1,143.5L278.9,144.3L279.7,144.1L281.8,143L282.2,142.2L283.4,141.6L283.1,143.3L284.3,143.8L285.4,143.6L285.4,144L285.5,144.4L285.6,145.4L285.2,145.8L284.8,147.7L285,147.9L284.1,148.6L283.3,149.8L283.7,150.1L283.6,151.6L283,152.2L283.3,152.9L283.2,155L283.8,157L282.8,156.7L282.1,157.1L282.1,158.2L283.3,159L282,160.4L282.9,161.5L282.4,163.6Z","山形県":"M273.5,201.2L273.7,202.4L273.6,203.1L273.3,204.6L273.3,206.6L274,207.2L272.9,208.7L271.6,208.5L270.2,208.9L269.2,208L268.2,208.5L267.1,206.8L266.1,207.3L265.6,206.9L264.7,207.5L264.1,206.8L263.2,206.8L262.7,206.2L262.2,206.5L261.2,205.3L261.1,204.7L261.7,201.8L262.3,201.4L261.9,200.9L262.3,200L262.2,198.9L262.7,197.7L264.1,198.1L265.5,197.1L266.2,196L265.7,195L264.6,194.1L264.1,194.3L263,193.8L262.4,193.1L262.7,192.5L262.8,190.7L260.5,190.1L259.5,189.4L259.7,188.4L260.9,186.1L262.2,185.1L263.4,183.4L264.4,179.9L264.8,178.9L265.5,176.2L265.3,175.7L266.8,175.7L267.7,175.9L268.9,175.2L269,176.2L270.4,176.9L270.6,177.2L271.6,177L271.6,177.6L272.7,177.5L273.7,178L274,177.5L274.6,177.7L274.9,178.5L276,178.5L276.3,179.6L277.1,180.7L277.2,180.8L278.2,181L278.1,181.6L279,182.3L279.3,183.5L280.1,183.9L279.4,185L279.7,185.7L279.3,187L278.3,186.8L278.1,187.2L278.9,188.7L278.5,189.7L278.9,190.5L279.8,191.4L279.8,191.5L279.2,191.8L279,193L278,194L278.1,194.7L277.4,195.2L277.1,196.4L277.3,198.1L276.6,199L276.6,199.4L276.2,200.4L275.3,201.2Z","福島県":"M277.6,204.9L279.7,204.7L280.1,204.6L281.4,205.1L281.3,206.4L281.6,207.2L282.2,207.7L283.5,207.7L283.1,207.1L284.6,207.3L284.6,206.2L284.6,205L286,204.8L286.6,206.1L287.1,206.5L287.2,207.9L287.7,209L288,210.8L288.3,214L288.3,215.2L288.4,216.1L288.3,216.1L288.3,216.1L288.4,217.4L288.3,218.8L288,220.6L287.8,222L287.8,223.8L287.4,225.6L287.6,226.6L286.4,228.1L286.2,227.8L284.9,228.7L284.4,228.8L284,230L280.6,229L280,228L279.6,228.2L280.1,229.7L279.6,230L278.9,230.5L277.7,231.7L277.2,231L276,230.7L275.7,229.5L274.9,229.3L274.1,228.3L273.7,228.4L273.3,228.2L273.5,226.6L272.5,226.2L272.3,225.3L271.5,224.5L270.5,223.9L267.9,223.3L267.8,223.2L266,223.3L265,224.1L265.1,224.8L264.2,224.7L263.8,225.2L262.3,225.5L261.2,226.5L258.8,227.8L258.2,227.7L257.6,228.8L256.9,229.2L256,229.1L253.8,228.5L254.1,227.9L254,226.7L254.3,226L253.8,224.2L254.1,223.2L253.8,222.5L253.2,222.3L252.4,221.3L253.3,220.1L253.7,218.7L253.7,217.7L253,217.1L253.5,216.2L254.1,216.1L256.2,215.6L256.9,215.9L257.2,214.7L258,214.5L260.4,214.6L259.7,211.3L261.2,210.3L261.1,209.8L262.2,208.2L263.1,207.3L262.8,206.3L262.2,206.5L262.2,206.5L262.7,206.2L263.2,206.8L264.1,206.8L264.7,207.5L265.6,206.9L266.1,207.3L267.1,206.8L268.2,208.5L269.2,208L270.2,208.9L271.6,208.5L272.9,208.7L274,207.2L273.3,206.6L273.3,204.6L273.6,203.1L274.9,203.8L275.6,203.3L277.3,203.8L277.5,204.9Z","茨城県":"M280.4,242.7L279.8,243.8L279.8,244.7L280.1,246.4L280.9,248.8L282.6,252.4L285.4,256.7L285.8,256.9L285.2,257L283.7,256.1L283.2,255.3L282.9,254.7L281.7,254.3L280.7,253.2L279,251.9L278.5,252.6L277.5,253L276.4,253.3L276.4,253.3L275.2,254.2L274.7,254.1L273.2,254.3L272.3,254.7L271.9,254.7L271.5,254.1L270.5,254L269.6,253.4L268.9,253.2L268.1,252.6L267.7,251.8L267.5,251.8L265.4,249.7L264.8,248.6L264.6,248.9L263.7,249L263.6,248.5L263.3,247.8L263.1,247.6L262.8,246.3L262.8,246.2L263.6,246.3L264.7,245.6L265.4,245.3L265.9,243.6L267,243.9L267.2,243L268.1,242.6L268.3,241.9L269.6,242L270.1,241.3L270.8,241.5L271.6,241L272.4,241.4L272.7,240.5L273.3,238.8L273.7,238.3L273.3,235.9L273,234.7L273.2,234L274.4,233.7L273.6,232L273.8,231L273.5,230.4L273.4,228.7L273.7,228.4L274.1,228.3L274.9,229.3L275.7,229.5L276,230.7L277.2,231L277.7,231.7L278.9,230.5L279.6,230L280.1,229.7L279.6,228.2L280,228L280.6,229L284,230L284.3,230.6L283.6,230.9L282.9,232.7L282.6,234L282.6,234.8L281.5,236.9L280.7,239.2L280.7,240.5L280.9,242.1Z","栃木県":"M267.2,243L267,243.9L265.9,243.6L265.4,245.3L264.7,245.6L263.6,246.3L262.8,246.2L262.8,246.3L262.4,246.1L261.4,244.5L260.9,244.7L259.8,244.4L259.1,244.5L258,244.2L257.5,243.1L256.6,242.3L256.4,241.9L257.3,240.4L257.7,240.1L257.5,239.1L258.1,237.9L258.7,237.2L258.4,236.5L257.6,236.6L256.2,236.3L255.7,235.9L255.9,234.5L256.4,233.6L256.1,232.5L257.2,231.1L256,230.6L256.9,229.2L257.6,228.8L258.2,227.7L258.8,227.8L261.2,226.5L262.3,225.5L263.8,225.2L264.2,224.7L265.1,224.8L265,224.1L266,223.3L267.8,223.2L267.9,223.3L270.5,223.9L271.5,224.5L272.3,225.3L272.5,226.2L273.5,226.6L273.3,228.2L273.7,228.4L273.4,228.7L273.5,230.4L273.8,231L273.6,232L274.4,233.7L273.2,234L273,234.7L273.3,235.9L273.7,238.3L273.3,238.8L272.7,240.5L272.4,241.4L271.6,241L270.8,241.5L270.1,241.3L269.6,242L268.3,241.9L268.1,242.6Z"}}
JSON;
$gld_pct = function ( $v ) { return ( $v > 0 ? '+' : ( $v < 0 ? '−' : '±' ) ) . number_format( abs( $v ), 1 ) . '%'; };
?>
<section id="stay" class="pageSection gst">
  <header class="pageSectionTitle">
    <div class="pageSectionTitle__title">
      <span class="pageSectionTitle__number">03</span>
      <h3 class="pageSectionTitle__main">外国人宿泊（都道府県・国籍別）</h3>
      <p class="pageSectionTitle__sub">どの国の人が、どこに泊まるか</p>
    </div>
    <a href="https://www.mlit.go.jp/kankocho/tokei_hakusyo/shukuhakutokei.html" target="_blank" rel="noopener" class="source-badge">出典：観光庁 宿泊旅行統計調査<span class="external-icon">↗</span></a>
  </header>

  <div class="gst-srcw"><dl class="gst-src">
    <div><dt>データ</dt><dd>観光庁「宿泊旅行統計調査」第2次速報（<?php echo esc_html( $gld_stay['published'] ); ?>公表）<span class="gst-latest">公表済みの最新</span></dd></div>
    <div><dt>期間</dt><dd><?php echo esc_html( preg_replace( '/（.*）/u', '', $gld_stay['period'] ) ); ?>の累計（すべての数値・地図に共通）</dd></div>
    <div><dt>次回更新</dt><dd><?php echo esc_html( $gld_stay['next'] ); ?>ごろ（<?php echo esc_html( $gld_stay['next_m'] ); ?>の公表後）</dd></div>
  </dl></div>
  <dl class="gst-kpi">
    <div><dt>外国人延べ宿泊者数<small><?php echo esc_html( $gld_stay['period'] ); ?></small></dt>
      <dd><b><?php echo esc_html( $gld_stay['total'] ); ?></b>万人泊<em class="<?php echo $gld_stay['yoy'] >= 0 ? 'is-up' : 'is-down'; ?>">前年同期比 <?php echo esc_html( $gld_pct( $gld_stay['yoy'] ) ); ?></em></dd></div>
    <div><dt>三大都市圏の構成比<small>東京・神奈川・千葉・埼玉・愛知・京都・大阪・兵庫</small></dt>
      <dd><b><?php echo esc_html( $gld_stay['metro'][0] ); ?></b>%<em class="<?php echo $gld_stay['metro'][1] >= 0 ? 'is-up' : 'is-down'; ?>">前年同期比 <?php echo esc_html( $gld_pct( $gld_stay['metro'][1] ) ); ?></em></dd></div>
    <div><dt>地方部の構成比<small>三大都市圏以外の39道県</small></dt>
      <dd><b><?php echo esc_html( $gld_stay['local'][0] ); ?></b>%<em class="<?php echo $gld_stay['local'][1] >= 0 ? 'is-up' : 'is-down'; ?>">前年同期比 <?php echo esc_html( $gld_pct( $gld_stay['local'][1] ) ); ?></em></dd></div>
  </dl>

  <div class="gst-body">
    <div class="gst-minis" id="gstMinis" role="tablist" aria-label="国籍を選ぶ"></div>
    <div class="gst-big">
      <p class="gst-big__h"><b id="gstName"></b>の人が多く泊まる都道府県<em class="gst-chip"><?php echo esc_html( preg_replace( '/（.*）/u', '', $gld_stay['period_n'] ) ); ?>累計・客室数20室以上</em><span>地図にマウスを重ねる（タップする）と数字が出ます</span></p>
      <div class="gst-big__map" id="gstBig"></div>
      <div class="gst-key" id="gstKey"></div>
      <ol class="gst-rank" id="gstRank"></ol>
    </div>
  </div>
  <div class="gst-tip" id="gstTip" role="tooltip"></div>

  <div class="gst-lists">
    <div>
      <h4 class="gst-h">国籍ごとの特徴（割合が高い県）<em class="gst-chip"><?php echo esc_html( preg_replace( '/（.*）/u', '', $gld_stay['period_n'] ) ); ?>累計・客室数20室以上</em></h4>
      <dl class="gst-nat">
        <?php foreach ( $gld_stay['nat'] as $n ) : ?>
          <div><dt><?php echo esc_html( $n[0] ); ?></dt><dd><?php echo esc_html( $n[1] ); ?></dd></div>
        <?php endforeach; ?>
      </dl>
    </div>
    <div>
      <h4 class="gst-h">外国人の宿泊が多い都道府県 TOP10<em class="gst-chip"><?php echo esc_html( preg_replace( '/（.*）/u', '', $gld_stay['period'] ) ); ?>累計・全施設</em></h4>
      <table class="gst-top">
        <thead><tr><th></th><th>都道府県</th><th>万人泊</th><th>前年同期比</th><th>外国人比率</th></tr></thead>
        <tbody>
          <?php foreach ( $gld_stay['top10'] as $i => $r ) : ?>
            <tr><td><?php echo $i + 1; ?></td><td><?php echo esc_html( $r[0] ); ?></td><td><?php echo esc_html( $r[1] ); ?></td>
              <td class="<?php echo $r[2] >= 0 ? 'is-up' : 'is-down'; ?>"><?php echo esc_html( $gld_pct( $r[2] ) ); ?></td><td><?php echo esc_html( number_format( $r[3], 0 ) ); ?>%</td></tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <a class="gst-more" href="<?php echo esc_url( home_url( '/download/?from=inbound_statistics&doc=market&via=stay' ) ); ?>">47都道府県×国籍の一覧は「月次市場レポート」（PDF）で →</a>
    </div>
  </div>
  <dl class="gst-note">
    <div><dt>地図の色</dt><dd>外国人全体と比べて、その国の人の割合が高い県ほど濃い（宿泊者数の多さではない）</dd></div>
    <div><dt>倍率</dt><dd>その国の宿泊に占める県の割合 ÷ 外国人全体に占める県の割合</dd></div>
    <div><dt>対象施設</dt><dd>都道府県別（上の数字・TOP10）は全施設、国籍別（地図・特徴）は客室数20室以上の施設</dd></div>
    <div><dt>単位</dt><dd>延べ宿泊者数（人泊）＝人数×泊数。訪日外客数（人）とは異なる</dd></div>
    <div><dt>注意</dt><dd>2026年1月から観光庁の推計方法が変更。前年同期比に影響の可能性あり</dd></div>
    <div><dt>地図</dt><dd>地球地図日本（国土地理院）を加工</dd></div>
  </dl>
</section>
<style>
.gst { padding: 56px 0; font-variant-numeric: tabular-nums; color: #1d2433; }
.gst .pageSectionTitle { max-width: 1200px; margin: 0 auto 18px; padding: 0 20px; }
.gst-srcw, .gst-kpi, .gst-body, .gst-lists, .gst-note { max-width: 1200px; margin-left: auto; margin-right: auto; padding: 0 20px; }
.gst-src { display: flex; flex-wrap: wrap; gap: 6px 28px; margin: 0 0 18px; padding: 10px 14px; background: #f5f7fa; border-left: 3px solid #1f3557; font-size: 12.5px; }
.gst-src div { display: flex; gap: 8px; }
.gst-src dt { font-weight: 800; color: #1f3557; white-space: nowrap; }
.gst-src dd { margin: 0; color: #1d2433; }
.gst-latest { display: inline-block; margin-left: 6px; padding: 0 6px; background: #1f3557; font-size: 10.5px; font-weight: 700; color: #fff; vertical-align: 1px; }
.gst-chip { display: inline-block; margin-left: 8px; padding: 1px 7px; border: 1px solid #c9d0da; font-size: 10.5px; font-style: normal; font-weight: 700; color: #556074; vertical-align: 2px; white-space: nowrap; }
.gst-kpi { display: grid; grid-template-columns: 1.2fr 1fr 1fr; margin-top: 0; margin-bottom: 28px; }
.gst-kpi > div { padding: 12px 0 14px; border-top: 2px solid #1d2433; }
.gst-kpi > div + div { padding-left: 20px; margin-left: 20px; }
.gst-kpi dt { font-size: 12.5px; font-weight: 700; color: #556074; }
.gst-kpi dt small { display: block; margin-top: 2px; font-size: 11px; font-weight: 400; color: #8a93a3; }
.gst-kpi dd { margin: 6px 0 0; font-size: 13px; }
.gst-kpi b { margin-right: 3px; font-size: 30px; font-weight: 800; letter-spacing: -.01em; }
.gst-kpi em { display: block; margin-top: 2px; font-size: 12px; font-style: normal; font-weight: 700; }
.gst .is-up { color: #1f7a5a; } .gst .is-down { color: #c0392b; }
.gst-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 32px; align-items: start; }
.gst-minis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gst-mini { display: flex; flex-direction: column; padding: 8px 8px 4px; border: 1px solid #e3e7ee; border-top: 3px solid var(--c); background: #fff; font: inherit; text-align: left; cursor: pointer; transition: box-shadow .15s, transform .15s; }
.gst-mini:hover { box-shadow: 0 4px 14px rgba(29, 36, 51, .1); transform: translateY(-1px); }
.gst-mini[aria-selected="true"] { outline: 2px solid var(--c); outline-offset: -1px; background: #fafbfc; }
.gst-mini b { font-size: 13px; font-weight: 800; color: var(--c); }
.gst-mini svg { display: block; width: 100%; height: auto; }
.gst-map path { stroke: #fff; stroke-width: .8; }
.gst-box { fill: none; stroke: #c9d0da; stroke-dasharray: 3 3; }
.gst-oki { font-size: 15px; fill: #8a93a3; }
.gst-big { position: sticky; top: 120px; }
.gst-big__h { margin: 0 0 6px; font-size: 15px; font-weight: 800; }
.gst-big__h b { color: var(--c); }
.gst-big__h span { display: block; margin-top: 2px; font-size: 11.5px; font-weight: 400; color: #8a93a3; }
.gst-big__map svg { display: block; width: 100%; height: auto; max-height: 500px; margin: 0 auto; }
.gst-big__map path { cursor: pointer; transition: opacity .15s; }
.gst-big__map path.is-on { stroke: #1d2433; stroke-width: 2; }
.gst-key { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; margin-top: 6px; font-size: 11.5px; color: #556074; }
.gst-key i { display: inline-block; width: 16px; height: 10px; margin-right: 4px; vertical-align: -1px; border: 1px solid #e3e7ee; }
.gst-rank { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0 0; padding: 0; list-style: none; counter-reset: k; }
.gst-rank li { counter-increment: k; padding: 6px 8px; border-top: 2px solid var(--c); background: #fafbfc; font-size: 12px; line-height: 1.35; }
.gst-rank li::before { content: counter(k); margin-right: 4px; font-weight: 800; color: var(--c); }
.gst-rank li b { display: block; font-size: 15px; font-weight: 800; }
.gst-tip { position: fixed; z-index: 9999; display: none; min-width: 180px; padding: 10px 12px; background: #1d2433; font-size: 12px; line-height: 1.6; color: #fff; pointer-events: none; }
.gst-tip b { display: block; margin-bottom: 2px; font-size: 13.5px; }
.gst-tip em { font-style: normal; font-weight: 800; color: #ffd27a; }
.gst-lists { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-top: 40px; }
.gst-h { margin: 0 0 8px; padding-bottom: 6px; border-bottom: 2px solid #1d2433; font-size: 15px; font-weight: 900; }
.gst-nat { margin: 0; }
.gst-nat div { display: grid; grid-template-columns: 96px 1fr; padding: 6px 0; border-bottom: 1px solid #e3e7ee; font-size: 13px; }
.gst-nat dt { font-weight: 800; }
.gst-nat dd { margin: 0; color: #556074; }
.gst-top { width: 100%; border-collapse: collapse; font-size: 13px; }
.gst-top th { padding: 6px 4px; border-bottom: 1px solid #1d2433; font-size: 11.5px; font-weight: 700; color: #8a93a3; text-align: right; }
.gst-top th:nth-child(2) { text-align: left; }
.gst-top td { padding: 6px 4px; border-bottom: 1px solid #e3e7ee; text-align: right; }
.gst-top td:first-child { width: 22px; color: #c8343a; font-weight: 800; }
.gst-top td:nth-child(2) { text-align: left; font-weight: 700; }
.gst-more { display: inline-block; margin-top: 14px; font-size: 13px; font-weight: 700; color: #1f3557; text-decoration: none; }
.gst-more:hover { text-decoration: underline; }
.gst-note { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e3e7ee; font-size: 11.5px; line-height: 1.6; color: #8a93a3; }
.gst-note div { display: grid; grid-template-columns: 64px 1fr; gap: 8px; padding: 2px 0; }
.gst-note dt { font-weight: 700; color: #556074; }
.gst-note dd { margin: 0; }
@media (max-width: 900px) {
  .gst { padding: 36px 0; }
  .gst-src { flex-direction: column; font-size: 11.5px; }
  .gst-src div { display: grid; grid-template-columns: 56px 1fr; }
  .gst-kpi { grid-template-columns: repeat(3, 1fr); }
  .gst-kpi > div + div { padding-left: 10px; margin-left: 0; border-left: 1px solid #e3e7ee; }
  .gst-kpi dt { font-size: 10.5px; line-height: 1.35; }
  .gst-kpi dt small { display: none; }
  .gst-kpi > div:first-child dt small { display: block; font-size: 9.5px; }
  .gst-kpi dd { font-size: 11px; }
  .gst-kpi b { font-size: 19px; }
  .gst-kpi em { font-size: 10.5px; }
  .gst-body { grid-template-columns: 1fr; gap: 20px; }
  .gst-big { position: static; order: -1; }
  .gst-minis { gap: 6px; }
  .gst-mini { padding: 5px 5px 2px; }
  .gst-mini b { font-size: 11.5px; }
  .gst-rank { grid-template-columns: repeat(3, 1fr); }
  .gst-rank li:nth-child(n+4) { display: none; }
  .gst-lists { grid-template-columns: 1fr; gap: 28px; margin-top: 28px; }
  .gst-nat div { grid-template-columns: 84px 1fr; font-size: 12.5px; }
}
</style>
<script>
(function () {
  'use strict';
  var G = <?php echo $gld_jp_geo; ?>;
  var M = <?php echo $gld_stay['map']; ?>;
  var big = document.getElementById('gstBig'), minis = document.getElementById('gstMinis');
  if (!big || !minis) return;
  /* 国ごとの色（彩度を落とした9色。色覚の違いがあっても隣どうしが区別しやすい並び） */
  var HUE = { '韓国': '#2f6db5', '中国': '#c0463f', '台湾': '#2f8f5b', '香港': '#8a4fb0', '米国': '#1f7f8f', 'タイ': '#d27a1f', 'マレーシア': '#a88a12', 'インドネシア': '#a0522d', 'ベトナム': '#b8467e' };
  var STEP = [[1, .1], [1.5, .38], [2, .68], [1e9, 1]];   // 係数の区切りと、色の濃さ
  function mix(hex, t) {
    var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16), w = 243;
    return 'rgb(' + Math.round(w + (r - w) * t) + ',' + Math.round(w + (g - w) * t) + ',' + Math.round(w + (b - w) * t) + ')';
  }
  function col(hex, k) { for (var i = 0; i < STEP.length; i++) if (k < STEP[i][0]) return mix(hex, STEP[i][1]); return hex; }
  var byName = {}; M.rows.forEach(function (r) { byName[r[0]] = r; });
  var tot = M.markets.map(function (m, j) { return M.rows.reduce(function (t, r) { return t + (r[1][j] || 0); }, 0); });
  function svg(j, cls) {
    var hex = HUE[M.markets[j]] || '#1f3557', b = G.box;
    var s = '<svg viewBox="0 0 ' + G.w + ' ' + G.h + '" class="gst-map ' + (cls || '') + '"><rect class="gst-box" x="' + b[0] + '" y="' + b[1] + '" width="' + (b[2] - b[0]) + '" height="' + (b[3] - b[1]) + '"/><text class="gst-oki" x="' + (b[0] + 6) + '" y="' + (b[1] + 18) + '">沖縄</text>';
    Object.keys(G.p).forEach(function (k) { var r = byName[k]; s += '<path data-p="' + k + '" d="' + G.p[k] + '" fill="' + (r ? col(hex, r[2][j]) : '#fff') + '"/>'; });
    return s + '</svg>';
  }
  minis.innerHTML = M.markets.map(function (m, j) {
    return '<button type="button" class="gst-mini" role="tab" data-j="' + j + '" style="--c:' + (HUE[m] || '#1f3557') + '"><b>' + m + '</b>' + svg(j) + '</button>';
  }).join('');
  var cur = 0;
  function show(j) {
    cur = j;
    var m = M.markets[j], hex = HUE[m] || '#1f3557', sec = document.getElementById('stay');
    sec.style.setProperty('--c', hex);
    Array.prototype.forEach.call(minis.children, function (b, i) { b.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
    document.getElementById('gstName').textContent = m;
    big.innerHTML = svg(j, 'is-big');
    document.getElementById('gstKey').innerHTML = [['1倍未満', .5], ['1〜1.5倍', 1.2], ['1.5〜2倍', 1.7], ['2倍以上', 3]].map(function (x) { return '<span><i style="background:' + col(hex, x[1]) + '"></i>' + x[0] + '</span>'; }).join('') + '<span>（外国人全体と比べて）</span>';
    var top = M.rows.filter(function (r) { return r[1][j] / tot[j] >= .005; }).sort(function (a, b) { return b[2][j] - a[2][j]; }).slice(0, 5);
    document.getElementById('gstRank').innerHTML = top.map(function (r) { return '<li>' + r[0] + '<b>' + r[2][j].toFixed(1) + '倍</b></li>'; }).join('');
  }
  minis.addEventListener('click', function (e) {
    var b = e.target.closest('.gst-mini'); if (!b) return;
    show(+b.getAttribute('data-j'));
    if (window.innerWidth <= 900) {   /* スマホ：上の大きい地図へ戻す */
      var nav = document.querySelector('.page-navigation'), y = document.querySelector('.gst-big').getBoundingClientRect().top + window.pageYOffset - (nav ? nav.offsetHeight : 0) - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
  /* ツールチップ（マウス・タップ共通） */
  var tip = document.getElementById('gstTip'), on = null;
  function tipAt(e) {
    var p = e.target.closest && e.target.closest('path[data-p]');
    if (!p || !big.contains(p)) { tip.style.display = 'none'; if (on) on.classList.remove('is-on'); on = null; return; }
    if (on) on.classList.remove('is-on'); on = p; p.classList.add('is-on');
    var r = byName[p.getAttribute('data-p')], m = M.markets[cur];
    tip.innerHTML = '<b>' + r[0] + '｜' + m + '</b>' + (r[1][cur] / 10000).toFixed(1) + '万人泊（' + m + 'の宿泊の ' + (r[1][cur] / tot[cur] * 100).toFixed(1) + '%）<br>外国人全体と比べて <em>' + r[2][cur].toFixed(1) + '倍</em>';
    tip.style.display = 'block';
    var pt = e.touches ? e.touches[0] : e;
    tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 10, pt.clientX + 14) + 'px';
    tip.style.top = Math.min(window.innerHeight - tip.offsetHeight - 10, pt.clientY + 14) + 'px';
  }
  big.addEventListener('mousemove', tipAt);
  big.addEventListener('click', tipAt);
  big.addEventListener('mouseleave', function () { tip.style.display = 'none'; if (on) on.classList.remove('is-on'); on = null; });
  window.addEventListener('scroll', function () { tip.style.display = 'none'; }, { passive: true });
  show(0);
})();
</script>

<?php
$gld_cal_json = <<<'JSON'
{"season":{"CN":[1.0,0.87,0.83,0.96,0.99,1.1,1.31,1.31,1.07,0.97,0.84,0.74],"KR":[1.2,1.09,0.89,0.91,1.03,0.94,0.95,0.84,0.87,1.05,1.03,1.21],"TW":[1.02,0.95,0.94,0.93,0.94,1.09,1.1,1.11,0.93,1.0,0.97,1.01],"HK":[1.0,0.93,1.01,1.04,0.95,0.96,1.04,1.09,0.74,0.91,1.0,1.33],"US":[0.62,0.67,1.26,1.1,1.11,1.28,1.06,0.74,0.83,1.22,1.09,1.02],"TH":[0.94,1.1,1.41,1.52,1.03,0.54,0.52,0.35,0.49,1.3,1.19,1.61],"PH":[0.91,0.93,1.07,1.12,1.06,0.9,0.73,0.59,0.69,1.17,1.26,1.58],"VN":[0.88,1.23,1.22,1.16,1.01,0.93,0.95,1.05,0.89,0.96,0.94,0.77]},"v25":{"CN":[980520,722924,661817,765189,790089,798001,974564,1018747,775657,715804,562184,330435],"KR":[967100,847358,691725,721672,825883,729860,678566,660917,670563,867261,824567,974239],"TW":[593431,507346,522886,537638,538428,585070,604177,620753,526982,595915,542389,588409],"HK":[243687,195543,208369,263649,193044,166764,176019,226069,149472,196017,207633,291133],"US":[182556,191494,342752,327542,311933,345150,277080,194525,224793,335744,302547,270704],"TH":[96811,116797,148226,158470,108106,52059,48553,35499,51283,125894,117396,174009],"PH":[72185,66698,72333,90973,82723,63203,47366,44209,51615,86150,92011,115557],"VN":[50415,73813,64123,64089,59263,52935,53538,61215,50419,53238,51850,43696]},"v26":{"CN":[385519,396511,291686,330776,313123,340803,428200,418000],"KR":[1176089,1086381,795612,878579,951328,787151,894700,850500],"TW":[694551,693620,653346,643477,616804,670445,763800,666000],"HK":[200048,233940,216271,225991,207937,214290,272500,247300],"US":[207784,219741,375948,330052,333696,354496,286200,197400],"TH":[115100,116955,160861,164841,98756,48009,53800,32200],"PH":[79187,71697,90122,88422,85036,59861,45100,39100],"VN":[52871,61079,92051,76029,58058,56508,52100,56600]},"ytd26":{"CN":[2904600,-56.7],"KR":[7420300,21.2],"TW":[5402000,19.8],"HK":[1818300,8.7],"US":[2305300,6.1],"TH":[790500,3.4],"PH":[558500,3.5],"VN":[505300,5.4]},"ytdMonths":8,"h2027":[["CN",2,"春節","2/6前後",1,1],["CN",5,"労働節","5/1〜",0,1],["CN",10,"国慶節","10/1〜7",1,1],["KR",2,"旧正月","2/6〜9",1,0],["KR",5,"釈迦誕生日","5/13",0,0],["KR",9,"秋夕","9/14〜16",1,0],["KR",10,"開天節他","10/2〜4・9〜11",0,0],["TW",2,"春節","2/4〜10",1,0],["TW",4,"清明節","4/3〜6",0,0],["TW",10,"国慶日","10/9〜11",0,0],["HK",2,"旧正月","2/6〜",1,1],["HK",3,"イースター","3/26〜29",1,0],["US",3,"春休み","3月中〜下旬",1,0],["US",11,"感謝祭","11/25〜28",1,0],["US",12,"年末休暇","12月下旬",0,0],["TH",4,"ソンクラン","4/13〜15",1,0],["PH",3,"聖週間","3/25〜26",1,0],["PH",12,"クリスマス","12/24〜25",1,0],["VN",2,"テト","2月上旬",1,1],["VN",4,"統一記念日","4/30〜5/1",0,0],["VN",9,"国慶節","9/2",0,0]],"h2026":[["CN",2,"春節","2/14〜22",1,0],["CN",5,"労働節","5/1〜5",0,0],["CN",10,"国慶節","10/1〜8",1,0],["KR",2,"旧正月","2/14〜18",1,0],["KR",5,"こどもの日","5/5",0,0],["KR",9,"秋夕","9/24〜27",1,0],["KR",10,"開天節他","10/3〜5・9",0,0],["TW",2,"春節","2/14〜22",1,0],["TW",4,"清明節","4/3〜6",0,0],["TW",10,"国慶日","10/9〜11",0,0],["HK",2,"旧正月","2/17〜19",1,0],["HK",4,"イースター","4/3〜6",1,0],["US",3,"春休み","3月中〜下旬",1,0],["US",11,"感謝祭","11/26〜29",1,0],["US",12,"年末休暇","12月下旬",0,0],["TH",4,"ソンクラン","4/13〜15",1,0],["PH",4,"聖週間","4/2〜3",1,0],["PH",12,"クリスマス","12/24〜25",1,0],["VN",2,"テト","2/14〜22",1,0],["VN",4,"統一記念日","4/30〜5/1",0,0],["VN",9,"国慶節","9/2",0,0]],"breaks":{"KR":[[1.0,2.95,"冬休み"],[7.65,8.6,"夏休み"]],"TW":[[1.67,2.33,"冬休み"],[7.0,8.95,"夏休み"]],"CN":[[1.5,2.8,"冬休み"],[7.0,8.95,"夏休み"]],"HK":[[1.0,1.06,"クリスマス休み"],[2.1,2.45,"旧正月休み"],[3.85,4.15,"イースター休み"],[7.6,8.95,"夏休み"],[12.65,12.99,"クリスマス休み"]],"US":[[1.0,1.06,"冬休み"],[3.3,3.8,"春休み"],[6.0,8.5,"夏休み"],[12.7,12.99,"冬休み"]],"TH":[[3.5,5.5,"学年末休み"],[10.3,10.8,"学期休み"]],"PH":[[1.0,1.06,"年末年始休み"],[4.27,6.2,"夏休み"],[12.6,12.99,"年末年始休み"]],"VN":[[2.0,2.4,"テト休み"],[6.0,8.9,"夏休み"]]},"issue":"2026年10月版","dataUntil":"2026年8月"}
JSON;
// 印刷用ロゴ：サイト共通ヘッダーと同じロゴ（テーマの assets/images/logo.png）
$gld_logo = get_template_directory_uri() . '/assets/images/logo.png';?>
<section id="calendar" class="pageSection gdc-section">
  <div class="gdc">
    <div class="gdc-head">
      <div>
        <span class="pageSectionTitle__number">04</span>
        <h3 class="gdc-title">訪日需要カレンダー 2027</h3>
        <p class="gdc-lead">2027年の各国の連休と、月ごとの訪日客の多さ。需要が高まる時期の2〜3か月前から、現地向けの情報発信を準備するのが目安です。</p>
      </div>
      <div class="gdc-actions">
        <p class="gdc-issue" id="gdcIssue"></p>
                <button type="button" class="gdc-print" id="gdcPrint">カレンダーをPDFで保存（A4横1枚）</button>
        <a class="gdc-full" href="<?php echo esc_url( home_url( '/download/?from=inbound_statistics&doc=market&via=calendar' ) ); ?>">ページ全体のデータは「月次市場レポート」（PDF）で →</a>
      </div>
    </div>
    <div class="gdc-legend">
      <div class="gdc-lg"><p class="gdc-lg-h">色</p><div><div class="gdc-bar" id="gdcBar"></div><div class="gdc-ends"><span>訪日客が少ない月</span><span>多い月</span></div></div></div>
      <div class="gdc-lg"><p class="gdc-lg-h">数字</p><div class="gdc-lg-num"><span class="gdc-sample"><span>120</span><b>149</b></span><span><b>左</b> 2024〜25年平均　<b>右（太字）</b> 2026年実績　<span class="gdc-mute">平均的な月＝100</span></span></div></div>
      <div class="gdc-lg"><p class="gdc-lg-h">連休（2027年）</p><div class="gdc-lg-hol"><span class="gdc-hol"><b>大型連休</b><span class="gdc-mj">●</span></span><span class="gdc-hol is-minor"><b>祝日・連休</b></span><span class="gdc-mute">予定＝政府発表前</span><span class="gdc-mute"><i class="gdc-brk-key"></i>学校の長期休暇（目安）</span></div></div>
    </div>
    <div class="gdc-scroll"><div class="gdc-grid" id="gdcGrid"></div></div>
    <div class="gdc-list" id="gdcList"></div>
    <dl class="gdc-notes" id="gdcNotes"></dl>
    <div class="gdc-tip" id="gdcTip" role="tooltip"></div>
  </div>
</section>

<style>
.gdc-section { padding: 56px 0; background: #fff; }
.gdc { max-width: 1200px; margin: 0 auto; padding: 0 20px; color: #1d2433; }
.gdc-head { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; margin-bottom: 14px; }
.gdc-title { margin: 6px 0 0; font-size: 26px; font-weight: 900; line-height: 1.3; }
.gdc-lead { margin: 8px 0 0; font-size: 14px; line-height: 1.8; color: #556074; }
.gdc-actions { text-align: right; }
.gdc-issue { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #556074; }
.gdc-print { padding: 10px 18px; border: 1px solid #1f3557; background: #fff; font: inherit; font-size: 13px; font-weight: 800; color: #1f3557; cursor: pointer; }
.gdc-print:hover { background: #1f3557; color: #fff; }
.gdc-full { display: block; margin-top: 8px; font-size: 12px; font-weight: 700; color: #1f3557; text-decoration: none; }
.gdc-full:hover { text-decoration: underline; }
.gdc-legend { display: grid; grid-template-columns: .9fr 1.3fr 1.3fr; margin-bottom: 8px; border-top: 1px solid #e1e5ec; border-bottom: 1px solid #e1e5ec; }
.gdc-lg { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; padding: 8px 14px; font-size: 12px; color: #556074; }
.gdc-lg + .gdc-lg { border-left: 1px solid #e1e5ec; }
.gdc-lg-h { margin: 0; font-size: 12px; font-weight: 900; color: #1d2433; white-space: nowrap; }
.gdc-bar { display: flex; height: 12px; }
.gdc-bar i { flex: 1; }
.gdc-ends { display: flex; justify-content: space-between; margin-top: 3px; font-size: 11px; }
.gdc-lg-num { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.gdc-sample { display: inline-flex; gap: 8px; padding: 2px 6px; background: #c3cfdf; font-size: 11px; color: #1d2433; }
.gdc-lg-num b { color: #1d2433; }
.gdc-lg-hol { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.gdc-mute { color: #8a93a3; }
.gdc-brk-key { display: inline-block; width: 22px; height: 4px; margin-right: 5px; vertical-align: middle; background: #d9a336; }
.gdc-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.gdc-grid { display: grid; grid-template-columns: 104px repeat(12, minmax(68px, 1fr)) 120px; gap: 2px; min-width: 1100px; padding-top: 6px; border-top: 2px solid #1d2433; }
.gdc-mh { display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-size: 13px; font-weight: 800; color: #556074; }
.gdc-mh.is-left { justify-content: flex-start; font-size: 10.5px; line-height: 1.3; color: #8a93a3; }
.gdc-mh.is-side { display: block; text-align: center; font-size: 11.5px; line-height: 1.35; color: #1d2433; }
.gdc-mh.is-side span { font-weight: 600; color: #8a93a3; }
.gdc-c { display: flex; flex-direction: column; justify-content: center; }
.gdc-c b { font-size: 15px; font-weight: 800; white-space: nowrap; }
.gdc-c span { margin-top: 2px; font-size: 11px; color: #556074; white-space: nowrap; }
.gdc-c strong { font-weight: 800; }
.gdc-cell { position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; min-height: 64px; padding: 6px 5px; cursor: default; }
.gdc-cell:hover { outline: 2px solid #1d2433; outline-offset: -2px; }
.gdc-brk { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.gdc-brk i { position: absolute; top: 0; height: 4px; background: #d9a336; }
.gdc-nums { display: flex; justify-content: space-between; font-size: 11px; line-height: 1; opacity: .65; }
.gdc-nums b { font-weight: 800; opacity: 1; }
.gdc-hol { position: relative; display: block; padding: 3px 5px 4px; background: #fff; border-left: 3px solid #c8343a; font-size: 10.5px; line-height: 1.3; color: #1d2433; }
.gdc-lg-hol .gdc-hol { display: inline-block; padding-right: 14px; }
.gdc-hol.is-minor { border-left-color: #8a93a3; }
.gdc-hol b { display: block; overflow: hidden; font-size: 11.5px; font-weight: 900; letter-spacing: -.04em; white-space: nowrap; }
.gdc-hol + .gdc-hol { margin-top: 3px; }
.gdc-hol .gdc-pend { color: #8a93a3; font-weight: 600; }
.gdc-mj { position: absolute; right: 3px; bottom: 3px; font-size: 7px; line-height: 1; color: #c8343a; }
.gdc-side { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: #fbecec; color: #c8343a; text-align: center; }
.gdc-side span { font-size: 14px; font-weight: 900; line-height: 1.25; }
.gdc-side span + span { font-size: 12.5px; font-weight: 800; }
.gdc-side small { margin-top: 3px; font-size: 10.5px; font-weight: 700; color: #8a93a3; }
.gdc-notes { display: grid; gap: 3px; margin: 12px 0 0; font-size: 11.5px; line-height: 1.7; color: #556074; }
.gdc-notes div { display: grid; grid-template-columns: 40px 1fr; }
.gdc-notes dt { font-weight: 800; color: #1d2433; }
.gdc-notes dd { margin: 0; }
.gdc-tip { position: fixed; z-index: 9999; display: none; max-width: 280px; padding: 10px 12px; background: #1d2433; font-size: 12px; line-height: 1.6; color: #fff; pointer-events: none; }
.gdc-tip b { display: block; margin-bottom: 2px; font-size: 13px; }
.gdc-tip .gdc-up { color: #8fd6b5; }
.gdc-tip .gdc-down { color: #f5b1aa; }
/* スマホ：表の代わりに国別カード */
.gdc-list { display: none; }
@media (max-width: 768px) {
  .gdc-section { padding: 36px 0; }
  .gdc { padding: 0 16px; }
  .gdc-title { font-size: 21px; }
  .gdc-lead { font-size: 13px; }
  .gdc-print { width: 100%; padding: 12px 18px; font-size: 14px; }
  .gdc-actions { width: 100%; }
  .gdc-legend .gdc-lg:nth-child(2) { display: none; }
  .gdc-lg-hol .gdc-mute:last-child { display: none; }
  .gdc-scroll { display: none; }
  .gdc-list { display: grid; gap: 12px; }
  .gdc-card { padding: 14px 14px 12px; border-top: 2px solid #1d2433; background: #fff; }
  .gdc-card__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
  .gdc-card__head b { font-size: 17px; font-weight: 800; }
  .gdc-card__head span { font-size: 12px; color: #556074; }
  .gdc-strip { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2px; }
  .gdc-strip i { position: relative; height: 26px; }
  .gdc-strip i.has-hol::after { content: ''; position: absolute; left: 50%; bottom: 4px; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: #c8343a; }
  .gdc-strip-m { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2px; margin-top: 3px; font-size: 10px; text-align: center; color: #8a93a3; }
  .gdc-card__hi { margin: 10px 0 0; padding: 8px 10px; background: #fbecec; font-size: 13px; font-weight: 800; color: #c8343a; }
  .gdc-card__hi small { margin-left: 6px; font-size: 11px; font-weight: 700; color: #8a93a3; }
  .gdc-card__hol { margin: 8px 0 0; padding: 0; list-style: none; }
  .gdc-card__hol li { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid #eef1f6; font-size: 13px; }
  .gdc-card__hol li:last-child { border-bottom: 0; }
  .gdc-card__hol .m { flex: 0 0 34px; font-weight: 800; color: #556074; }
  .gdc-card__hol .n { font-weight: 800; }
  .gdc-card__hol .n.is-major::before { content: '●'; margin-right: 3px; font-size: 9px; vertical-align: 1px; color: #c8343a; }
  .gdc-card__hol .d { margin-left: auto; color: #556074; }
  .gdc-card__hol .p { margin-left: 4px; font-size: 11px; color: #8a93a3; }
  .gdc-notes div { grid-template-columns: 1fr; }
  .gdc-head { grid-template-columns: 1fr; }
  .gdc-actions { text-align: left; }
  .gdc-legend { grid-template-columns: 1fr; }
  .gdc-lg + .gdc-lg { border-left: 0; border-top: 1px solid #e1e5ec; }
}
</style>

<script>
(function () {
  'use strict';
  var D = <?php echo $gld_cal_json; ?>;
  var LOGO = <?php echo wp_json_encode( $gld_logo ); ?>;
  var PAGE = <?php echo wp_json_encode( home_url( '/inbound_statistics/?from=calendar_pdf' ) ); ?>;
  var C = [['CN','中国'],['KR','韓国'],['TW','台湾'],['HK','香港'],['US','米国'],['TH','タイ'],['PH','フィリピン'],['VN','ベトナム']];
  var LV = [[70,'#eef1f6','#556074'],[90,'#dfe5ee','#1d2433'],[110,'#c3cfdf','#1d2433'],[130,'#8ea3c2','#1d2433'],[999,'#5f7ba3','#fff']];
  function lv(v) { for (var i = 0; i < LV.length; i++) if (v < LV[i][0]) return LV[i]; return LV[4]; }
  function man(n) { return (n / 10000).toFixed(1); }
  function sg(v) { return (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v); }
  var NOTES = [
    ['出典', 'JNTO「国籍/月別 訪日外客数」（2026年は暫定値・推計値を含む）。左の指数・色＝2024・25年の平均、右＝2026年（平均的な月＝100）。色は国ごとの相対値。中国は2026年、前年の約4割。'],
    ['連休', '韓国：VISITKOREA、台湾：行政院人事行政総処。中国・香港・ベトナムの旧暦連休は予定。学校休暇は台湾・フィリピン公表日程、ほかは目安。需要が高い時期＝指数110以上の月（旧正月は別記）。']
  ];

  /* ---- 1行分のHTML（画面・印刷で共通） ---- */
  function build() {
    var h = '<div class="gdc-mh is-left">2026年1〜' + D.ytdMonths + '月<br>訪日客・前年比</div>';
    for (var m = 1; m <= 12; m++) h += '<div class="gdc-mh">' + m + '月</div>';
    h += '<div class="gdc-mh is-side">需要が高い時期<br><span>各時期の<br>2〜3か月前から準備</span></div>';
    C.forEach(function (c) {
      var s = D.season[c[0]], v25 = D.v25[c[0]], v26 = D.v26[c[0]], yt = D.ytd26[c[0]];
      var base = v25.reduce(function (t, x) { return t + x; }, 0) / 12;
      h += '<div class="gdc-c"><b>' + c[1] + '</b><span>' + man(yt[0]) + '万人 <strong style="color:' + (yt[1] >= 0 ? '#1f7a5a' : '#c0392b') + '">' + sg(yt[1].toFixed(1)) + '%</strong></span></div>';
      for (var i = 0; i < 12; i++) {
        var v = Math.round(s[i] * 100), l = lv(v), i26 = v26[i] ? Math.round(v26[i] / base * 100) : null;
        var br = (D.breaks[c[0]] || []).map(function (b) { var a = Math.max(b[0], i + 1), z = Math.min(b[1], i + 2); return z > a ? { l: (a - i - 1) * 100, w: (z - a) * 100 } : null; }).filter(Boolean);
        h += '<div class="gdc-cell" data-c="' + c[0] + '" data-m="' + i + '" style="background:' + l[1] + ';color:' + l[2] + '">'
          + '<div class="gdc-brk">' + br.map(function (x) { return '<i style="left:' + x.l.toFixed(0) + '%;width:' + x.w.toFixed(0) + '%"></i>'; }).join('') + '</div>'
          + '<div class="gdc-nums"><span>' + v + '</span>' + (i26 !== null ? '<b>' + i26 + '</b>' : '') + '</div><div>';
        D.h2027.filter(function (x) { return x[0] === c[0] && x[1] === i + 1; }).forEach(function (x) {
          h += '<div class="gdc-hol' + (x[4] ? '' : ' is-minor') + '"><b>' + x[2] + '</b>' + x[3] + (x[5] ? ' <span class="gdc-pend">予定</span>' : '') + (x[4] ? '<span class="gdc-mj">●</span>' : '') + '</div>';
        });
        h += '</div></div>';
      }
      /* 指数110以上の月を、連続する期間ごとにまとめる（12月→1月もつなぐ） */
      var hi = s.map(function (v) { return v >= 1.095; }), runs = [], st = -1;
      for (var k = 0; k < 12; k++) { if (hi[k] && st < 0) st = k; if (!hi[k] && st >= 0) { runs.push([st, k - 1]); st = -1; } }
      if (st >= 0) runs.push([st, 11]);
      if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][1] === 11) { var last = runs.pop(); runs[0] = [last[0], runs[0][1]]; }
      function peak(r) { var mx = 0; for (var q = r[0]; ; q = (q + 1) % 12) { mx = Math.max(mx, s[q]); if (q === r[1]) break; } return mx; }
      function inRun(mm) { return runs.some(function (r) { for (var q = r[0]; ; q = (q + 1) % 12) { if (q === mm) return true; if (q === r[1]) return false; } }); }
      runs.sort(function (a, b) { return peak(b) - peak(a); });
      var lny = D.h2027.filter(function (x) { return x[0] === c[0] && /春節|旧正月|テト/.test(x[2]); })[0];
      h += '<div class="gdc-side">' + runs.map(function (r) { return '<span>' + (r[0] === r[1] ? (r[0] + 1) + '月' : (r[0] + 1) + '〜' + (r[1] + 1) + '月') + '</span>'; }).join('')
        + ((lny && !inRun(lny[1] - 1)) ? '<small>＋旧正月（' + lny[1] + '月）</small>' : '') + '</div>';
    });
    return h;
  }

  var grid = document.getElementById('gdcGrid');
  if (!grid) return;
  grid.innerHTML = build();
  /* ---- スマホ用：国別カード ---- */
  var list = document.getElementById('gdcList');
  if (list) {
    list.innerHTML = C.map(function (c) {
      var s = D.season[c[0]], yt = D.ytd26[c[0]];
      var hol = D.h2027.filter(function (x) { return x[0] === c[0]; });
      var strip = s.map(function (v, i) {
        var l = lv(Math.round(v * 100)), has = hol.some(function (x) { return x[1] === i + 1 && x[4]; });
        return '<i class="' + (has ? 'has-hol' : '') + '" style="background:' + l[1] + '"></i>';
      }).join('');
      var ms = ''; for (var i = 1; i <= 12; i++) ms += '<span>' + i + '</span>';
      var side = grid.querySelectorAll('.gdc-side')[C.indexOf(c)];
      var hi = side ? Array.prototype.map.call(side.querySelectorAll('span'), function (e) { return e.textContent; }).join('・') : '';
      var lnyEl = side ? side.querySelector('small') : null;
      return '<article class="gdc-card"><div class="gdc-card__head"><b>' + c[1] + '</b><span>2026年1〜' + D.ytdMonths + '月 ' + man(yt[0]) + '万人 <strong style="color:' + (yt[1] >= 0 ? '#1f7a5a' : '#c0392b') + '">' + sg(yt[1].toFixed(1)) + '%</strong></span></div>'
        + '<div class="gdc-strip">' + strip + '</div><div class="gdc-strip-m">' + ms + '</div>'
        + '<p class="gdc-card__hi">需要が高い時期：' + hi + (lnyEl ? '<small>' + lnyEl.textContent + '</small>' : '') + '</p>'
        + '<ul class="gdc-card__hol">' + hol.map(function (x) { return '<li><span class="m">' + x[1] + '月</span><span class="n' + (x[4] ? ' is-major' : '') + '">' + x[2] + '</span><span class="d">' + x[3] + (x[5] ? '<span class="p">予定</span>' : '') + '</span></li>'; }).join('') + '</ul></article>';
    }).join('');
  }
  document.getElementById('gdcBar').innerHTML = LV.map(function (l) { return '<i style="background:' + l[1] + '"></i>'; }).join('');
  document.getElementById('gdcIssue').textContent = D.issue + '（' + D.dataUntil + 'までのデータ）';
  document.getElementById('gdcNotes').innerHTML = NOTES.map(function (n) { return '<div><dt>' + n[0] + '</dt><dd>' + n[1] + '</dd></div>'; }).join('');

  /* ---- ツールチップ（実数・2026年の連休・学校休暇） ---- */
  var tip = document.getElementById('gdcTip');
  grid.addEventListener('mousemove', function (e) {
    var cell = e.target.closest('.gdc-cell');
    if (!cell) { tip.style.display = 'none'; return; }
    var c = cell.getAttribute('data-c'), m = +cell.getAttribute('data-m');
    var name = C.filter(function (x) { return x[0] === c; })[0][1];
    var a = D.v26[c][m], p = D.v25[c][m];
    var t = '<b>' + name + '　' + (m + 1) + '月</b>2025年：' + man(p) + '万人';
    if (a) { var r = Math.round((a / p - 1) * 100); t += '<br>2026年：' + man(a) + '万人 <span class="' + (r >= 0 ? 'gdc-up' : 'gdc-down') + '">' + sg(r) + '%</span>'; }
    var h26 = D.h2026.filter(function (x) { return x[0] === c && x[1] === m + 1; }).map(function (x) { return x[2] + '（' + x[3] + '）'; });
    if (h26.length) t += '<br>2026年の連休：' + h26.join('、');
    var bk = (D.breaks[c] || []).filter(function (b) { return Math.max(b[0], m + 1) < Math.min(b[1], m + 2) && b[2]; }).map(function (b) { return b[2]; });
    if (bk.length) t += '<br>学校休暇：' + bk.filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join('、');
    tip.innerHTML = t;
    tip.style.display = 'block';
    var x = Math.min(window.innerWidth - tip.offsetWidth - 12, e.clientX + 14), y = Math.min(window.innerHeight - tip.offsetHeight - 12, e.clientY + 14);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  });
  grid.addEventListener('mouseleave', function () { tip.style.display = 'none'; });

  /* ---- PDF保存・印刷（A4横1枚。別ウィンドウに印刷用ページを組み立てる） ---- */
  document.getElementById('gdcPrint').addEventListener('click', function () {
    var css = '@page{size:A4 landscape;margin:5mm 8mm}*{box-sizing:border-box}body{margin:0;font-family:"Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif;color:#1d2433;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
      + '.w{width:1062px;margin:0 auto}.hd{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;padding-bottom:6px}.hd h1{margin:0;font-size:21px;font-weight:900}.hd p{margin:4px 0 0;font-size:12px;color:#556074}'
      + '.br{display:flex;flex-direction:column;align-items:flex-end;font-size:10px;line-height:1.45;color:#556074}.br img{width:100px;margin-bottom:3px}.br b{font-size:11px;color:#1d2433}.br a{color:#1f3557;text-decoration:none;font-weight:600}'
      + '.gdc-legend{display:grid;grid-template-columns:.9fr 1.3fr 1.3fr;margin:0 0 6px;border-top:1px solid #e1e5ec;border-bottom:1px solid #e1e5ec}.gdc-lg{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;padding:5px 12px;font-size:10.5px;color:#556074}.gdc-lg+.gdc-lg{border-left:1px solid #e1e5ec}.gdc-lg-h{margin:0;font-size:11.5px;font-weight:900;color:#1d2433}.gdc-bar{display:flex;height:11px}.gdc-bar i{flex:1}.gdc-ends{display:flex;justify-content:space-between;margin-top:2px}.gdc-lg-num,.gdc-lg-hol{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}.gdc-sample{display:inline-flex;gap:8px;padding:2px 6px;background:#c3cfdf;color:#1d2433}.gdc-mute{color:#8a93a3}.gdc-brk-key{display:inline-block;width:22px;height:4px;margin-right:4px;vertical-align:middle;background:#d9a336}'
      + '.gdc-grid{display:grid;grid-template-columns:92px repeat(12,minmax(0,1fr)) 112px;gap:2px;padding-top:4px;border-top:2px solid #1d2433}.gdc-mh{display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px;font-size:12.5px;font-weight:800;color:#556074}.gdc-mh.is-left{justify-content:flex-start;font-size:9.5px;line-height:1.3;color:#8a93a3}.gdc-mh.is-side{display:block;text-align:center;font-size:10.5px;line-height:1.3;color:#1d2433}.gdc-mh.is-side span{font-weight:600;color:#8a93a3}'
      + '.gdc-c{display:flex;flex-direction:column;justify-content:center}.gdc-c b{font-size:13.5px;font-weight:800;white-space:nowrap}.gdc-c span{margin-top:2px;font-size:10px;color:#556074;white-space:nowrap}'
      + '.gdc-cell{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:3px;min-height:50px;padding:4px}.gdc-brk{position:absolute;top:0;left:0;right:0;height:4px}.gdc-brk i{position:absolute;top:0;height:4px;background:#d9a336}.gdc-nums{display:flex;justify-content:space-between;font-size:10.5px;line-height:1;opacity:.65}.gdc-nums b{font-weight:800}'
      + '.gdc-hol{position:relative;display:block;padding:2px 4px 3px;background:#fff;border-left:3px solid #c8343a;font-size:10px;line-height:1.25;color:#1d2433}.gdc-lg-hol .gdc-hol{display:inline-block;padding-right:12px}.gdc-hol.is-minor{border-left-color:#8a93a3}.gdc-hol b{display:block;overflow:hidden;font-size:10.5px;font-weight:900;letter-spacing:-.05em;white-space:nowrap}.gdc-hol+.gdc-hol{margin-top:2px}.gdc-pend{color:#8a93a3;font-weight:600}.gdc-mj{position:absolute;right:3px;bottom:3px;font-size:7px;line-height:1;color:#c8343a}'
      + '.gdc-side{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#fbecec;color:#c8343a;text-align:center}.gdc-side span{font-size:12.5px;font-weight:900;line-height:1.25}.gdc-side span+span{font-size:11.5px;font-weight:800}.gdc-side small{margin-top:3px;font-size:9.5px;font-weight:700;color:#8a93a3}'
      + '.nt{display:grid;gap:1px;margin:8px 0 0;font-size:10px;line-height:1.55;color:#556074}.nt div{display:grid;grid-template-columns:32px 1fr}.nt dt{font-weight:800;color:#1d2433}.nt dd{margin:0;white-space:nowrap;overflow:hidden}.cp{margin:4px 0 0;text-align:right;font-size:9.5px;color:#8a93a3}';
    var legend = document.querySelector('.gdc-legend').outerHTML;
    var html = '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>訪日需要カレンダー2027｜グローバル・デイリー</title><style>' + css + '</style></head><body><div class="w">'
      + '<div class="hd"><div><h1>訪日需要カレンダー 2027</h1><p>2027年の各国の連休と、月ごとの訪日客の多さ。需要が高まる時期の2〜3か月前から、現地向けの情報発信を準備するのが目安です。</p></div>'
      + '<div class="br">' + (LOGO ? '<img src="' + LOGO + '" alt="GLOBAL DAILY">' : '<span style="font-size:15px;font-weight:700;letter-spacing:.04em;color:#1d2433">GLOBAL DAILY</span>') + '<b>' + D.issue + '（' + D.dataUntil.replace(/^\d+年/, '') + 'までのデータ）</b><a href="' + PAGE + '">最新版：www.gldaily.com/inbound_statistics/</a></div></div>'
      + legend + '<div class="gdc-grid">' + build() + '</div>'
      + '<dl class="nt">' + NOTES.map(function (n) { return '<div><dt>' + n[0] + '</dt><dd>' + n[1] + '</dd></div>'; }).join('') + '</dl>'
      + '<p class="cp">© Global Daily Co., Ltd.　無断転載・複製禁止</p></div>'
      + '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('ポップアップを許可してください'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  });
})();
</script>


<style>
/* ----- Layout / Width ----- */
.holidayCalendar { background:#f8fafc; padding:60px 0; }
.holidayCalendar .container { max-width:1200px; margin:0 auto; padding:0 20px; }

/* Legend */
.legend{display:flex;gap:24px;margin:16px 0;flex-wrap:wrap;justify-content:center}
.legend-item{display:flex;align-items:center;gap:8px;font-size:14px}
.legend-color{width:20px;height:20px;border-radius:4px;border:1px solid #e5e7eb}
.legend-major{background:#fef2f2;border:2px solid #dc2626}
.legend-normal{background:#e0f2fe;border:1px solid #0891b2}
.legend-season{background:#fff7ed;border:1px solid #f59e0b}

/* Calendar grid */
.calendar{background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.08);overflow-x:auto}
.calendar-header{display:grid;grid-template-columns:180px repeat(12,1fr);background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff}
.header-cell{padding:14px 10px;text-align:center;font-weight:700;font-size:14px;border-right:1px solid rgba(255,255,255,.2)}
.header-cell:first-child{ text-align:left;padding-left:20px;background:rgba(0,0,0,.08) }
.header-cell:last-child{ border-right:none }

/* Season row */
.season-row{display:grid;grid-template-columns:180px repeat(12,1fr);border-bottom:2px solid #f59e0b;background:#fff7ed}
.season-label{padding:12px 20px;background:rgba(245,158,11,.12);border-right:1px solid #e5e7eb;font-weight:700;font-size:13px;color:#92400e;display:flex;align-items:center}
.season-cell{padding:10px 6px;border-right:1px solid #e5e7eb;text-align:center;font-size:11px;display:flex;flex-direction:column;justify-content:center;min-height:54px;color:#92400e}
.season-cell:last-child{border-right:none}
.season-emoji{font-size:18px;margin-bottom:2px}
.season-text{line-height:1.1;font-weight:700}
.season-highlight{background:#fef3e2!important;border-left:3px solid #f59e0b!important;border-right:3px solid #f59e0b!important}

/* Country rows */
.country-row{display:grid;grid-template-columns:180px repeat(12,1fr);border-bottom:1px solid #e5e7eb;align-items:stretch}
.country-cell{padding:14px 20px;background:#fafbfc;border-right:1px solid #e5e7eb;display:flex;align-items:center;gap:12px;font-weight:700;font-size:15px}

/* Month cells: 칩 잘림/줄바꿈 개선 */
.month-cell{padding:6px;border-right:1px solid #e5e7eb;background:#fff;min-height:62px;display:flex;flex-direction:column;gap:4px;justify-content:center}
.month-cell:last-child{border-right:none}

/* Holiday pill (줄바꿈 허용 & 두 줄 표기 안정) */
.holiday-pill{
  background:#e0f2fe;border:1px solid #0891b2;border-radius:14px;padding:4px 8px;font-size:10px;
  font-weight:600;color:#0c4a6e;cursor:pointer;transition:all .2s;text-align:center;
  white-space:normal; line-height:1.2; display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.holiday-pill.is-major{
  background:#fef2f2;border:2px solid #dc2626;color:#dc2626;box-shadow:0 2px 8px rgba(220,38,38,.2)
}
.holiday-pill .pill-name{font-weight:800;margin:0}
.holiday-pill .pill-period{font-size:9px;opacity:.9;margin-top:2px}

/* Tooltip */
.tooltip{position:fixed;z-index:9999;background:#111827;color:#fff;padding:10px 12px;border-radius:8px;font-size:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);display:none;max-width:320px;line-height:1.45}

/* Mobile */
@media (max-width:768px){
  .calendar-header,.season-row{grid-template-columns:140px repeat(12,90px);min-width:1220px}
  .country-row{grid-template-columns:140px repeat(12,90px);min-width:1220px}
  .header-cell{font-size:12px;padding:10px 6px}
  .country-cell{font-size:14px;padding:12px}
  .season-cell,.month-cell{min-height:56px}
  .holiday-pill{font-size:9px;padding:3px 6px}
  .holiday-pill .pill-period{font-size:8px}
}

@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  
  @page { size: A4 landscape; margin: 8mm; }

  /* 모든 것 숨김 */
  body > * { display: none !important; }

  /* 캘린더 섹션만 표시 + 최상단 배치 */
  #calendar {
    display: block !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    background: #fff !important;
    z-index: 99999 !important;
    margin: 0 !important;
    padding: 10mm !important;
  }

  #calendar .pageSectionTitle,
  #calendar .calendar-structured-guide,
  #calendar .legend,
  #calendar .calendar-printbar {
    display: none !important;
  }

  #calendar .container,
  #calendar .calendar-wrapper {
    padding: 0 !important;
    margin: 0 !important;
  }

  #calendar .calendar {
    width: 100% !important;
    overflow: visible !important;
    box-shadow: none !important;
  }

  /* 타이틀 직접 추가 */
  #calendar::before {
    content: "2026年 主要国連休カレンダー";
    display: block !important;
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-bottom: 8mm;
  }

  /* 각주 */
  #calendar-footnotes {
    display: block !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    page-break-before: always !important;
  }
}

 /* 페이지 내 네비게이션 */      
        .page-navigation {
        background: #ffffff;
        border-bottom: 2px solid #e5e7eb;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        position: sticky;
        top: 0;
        z-index: 100;
        }

        .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
        }

        .nav-toggle {
        display: none;
        padding: 16px 20px;
        cursor: pointer;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        color: #1e40af;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        margin: 12px 0;
        font-size: 15px;
        transition: all 0.2s ease;
        }

        .nav-toggle:hover {
        background: #e2e8f0;
        border-color: #1e40af;
        }

        .nav-toggle-icon {
        transition: transform 0.3s ease;
        font-weight: bold;
        }

        .nav-toggle.active .nav-toggle-icon {
        transform: rotate(180deg);
        }

        .nav-items {
        display: flex;
        align-items: center;
        justify-content: flex-start;  
        gap: 4px;
        overflow-x: auto;
        padding: 16px 0;
        scrollbar-width: none;
        -ms-overflow-style: none;
        max-width: 1200px;
        margin: 0 auto;
        }

        .nav-items::-webkit-scrollbar {
        display: none;
        }

        .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        color: #475569;
        text-decoration: none;
        white-space: nowrap;
        border-radius: 6px;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        min-width: 0;
        flex-shrink: 0;
        border: 1px solid transparent;
        }

        .nav-item:hover {
        color: #1e40af;
        background: #f1f5f9;
        border-color: #cbd5e1;
        }

        .nav-item.active {
        color: #1e40af;
        background: #eff6ff;
        font-weight: 600;
        border-color: #1e40af;
        box-shadow: 0 2px 4px rgba(30, 64, 175, 0.1);
        }

        .nav-number {
        width: 26px;
        height: 26px;
        background: #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
        color: #64748b;
        }

        .nav-item:hover .nav-number {
        background: #cbd5e1;
        color: #1e40af;
        }

        .nav-item.active .nav-number {
        background: #1e40af;
        color: white;
        }

        .nav-text {
        font-weight: inherit;
        }

        /* 모바일 네비게이션 */
        @media (max-width: 768px) {
        .page-navigation {
            padding: 8px 0;
        }
        
        .nav-toggle {
            display: flex;
            font-size: 16px;
            padding: 18px 24px;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            margin: 12px 16px;
        }
        
        .nav-items {
            display: none;
            flex-direction: column;
            gap: 8px;
            padding: 8px 16px 20px 16px;
            background: #fafbfc;
            margin: 0;
        }
        
        .nav-items.show {
            display: flex;
        }
        
        .nav-item {
            width: 100%;
            justify-content: flex-start;
            padding: 16px 20px;
            border-radius: 8px;
            font-size: 15px;
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .nav-item:hover,
        .nav-item.active {
            background: #eff6ff;
            border-color: #1e40af;
            color: #1e40af;
        }
        
        .nav-number {
            width: 30px;
            height: 30px;
            font-size: 13px;
        }
        
        .nav-text {
            font-size: 15px;
            font-weight: inherit;
        }
        }

        @media (max-width: 480px) {
        .nav-container {
            padding: 0 12px;
        }
        
        .nav-toggle {
            margin: 12px 12px;
            padding: 16px 20px;
        }
        
        .nav-items {
            padding: 8px 12px 20px 12px;
        }
        
        .nav-item {
            padding: 14px 18px;
            font-size: 14px;
        }
        
        .nav-number {
            width: 28px;
            height: 28px;
            font-size: 12px;
        }
        
        .nav-text {
            font-size: 14px;
        }
        }


        /* 모바일 최적화 개선 */

        /* 1. 진행률 바 모바일 최적화 */
        @media (max-width: 768px) {
        .progress-section {
            margin: 20px 0;
        }
        
        .progress-container {
            position: relative;
            overflow-x: auto;
            padding-bottom: 60px; /* 마커 공간 확보 */
        }
        
        .progress-bar {
            min-width: 600px; /* 최소 너비 보장 */
            height: 20px;
            position: relative;
        }
        
        .month-markers {
            position: absolute;
            top: 25px;
            left: 0;
            right: 0;
            height: 50px;
        }
        
        .month-markers .marker {
            position: absolute;
            font-size: 9px;
            line-height: 1.1;
            text-align: center;
            top: 0;
            transform: translateX(-50%);
            width: 35px;
            white-space: nowrap;
            overflow: visible;
        }
        
        /* 현재 월 강조 */
        .month-markers .marker.current {
            font-weight: 700;
            color: #1e40af;
            background: rgba(30, 64, 175, 0.1);
            border-radius: 4px;
            padding: 2px;
        }
        }

        /* 2. 연휴 캘린더 모바일 최적화 */
        /* 캘린더 가독성 개선 - 기존 모바일 캘린더 CSS 교체 */
        @media (max-width: 768px) {
        .holidayCalendar {
            overflow-x: hidden !important;
            width: 100% !important;
        }
        
        .holidayCalendar .container {
            padding: 0 12px !important;
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100vw !important;
        }
        
        /* 캘린더 래퍼 */
        .calendar {
            overflow-x: auto !important;
            overflow-y: visible !important;
            width: 100% !important;
            max-width: calc(100vw - 24px) !important;
            border-radius: 8px;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .calendar::-webkit-scrollbar {
            height: 12px;
            display: block !important;
        }
        
        .calendar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 6px;
        }
        
        .calendar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 6px;
        }
        
        /* 그리드 크기 - 좀 더 여유있게 */
        .calendar-header,
        .season-row {
            grid-template-columns: 100px repeat(12, 75px) !important;
            min-width: 1000px !important;
        }
        
        .country-row {
            grid-template-columns: 100px repeat(12, 75px) !important;
            min-width: 1000px !important;
        }
        
        /* 셀 크기 조정 - 텍스트 크기 키우기 */
        .header-cell {
            font-size: 11px !important;
            padding: 6px 3px !important;
            min-width: 75px !important;
            font-weight: 700 !important;
        }
        
        .season-cell {
            font-size: 10px !important;
            padding: 4px 3px !important;
            min-width: 75px !important;
        }
        
        .country-cell {
            min-width: 100px !important;
            font-size: 12px !important;
            padding: 6px 8px !important;
            font-weight: 700 !important;
        }
        
        .month-cell {
            font-size: 10px !important;
            padding: 4px 3px !important;
            min-width: 75px !important;
        }
        
        .season-label {
            min-width: 100px !important;
            font-size: 11px !important;
            padding: 6px 8px !important;
        }
        
        .season-emoji {
            font-size: 14px !important;
            margin-bottom: 2px !important;
        }
        
        .season-text {
            font-size: 9px !important;
            line-height: 1.1 !important;
            font-weight: 600 !important;
        }
        
        /* 연휴 알 크기 - 가독성 향상 */
        .holiday-pill {
            font-size: 8px !important;
            padding: 2px 4px !important;
            margin-bottom: 2px !important;
            border-radius: 8px !important;
            line-height: 1.2 !important;
            min-height: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
        }
        
        .holiday-pill div:first-child {
            font-size: 8px !important;
            font-weight: 700 !important;
            margin-bottom: 1px !important;
        }
        
        .holiday-pill div:last-child {
            font-size: 7px !important;
            margin-top: 0 !important;
            opacity: 0.9 !important;
        }
        
        /* 범례 최적화 */
        .legend {
            flex-direction: column !important;
            gap: 10px !important;
            align-items: flex-start !important;
            margin: 16px 0 !important;
        }
        
        .legend-item {
            font-size: 13px !important;
        }
        
        .legend-color {
            width: 18px !important;
            height: 18px !important;
        }
        
        /* 헤더 텍스트 개선 */
        .holidayCalendar .header h1 {
            font-size: 20px !important;
            line-height: 1.4 !important;
        }
        
        .holidayCalendar .header p {
            font-size: 13px !important;
            line-height: 1.5 !important;
        }
        }

        /* 아주 작은 화면 (480px 이하)에서는 더 작게 */
        @media (max-width: 480px) {
        .calendar-header,
        .season-row,
        .country-row {
            grid-template-columns: 90px repeat(12, 70px) !important;
            min-width: 930px !important;
        }
        
        .header-cell,
        .season-cell,
        .month-cell {
            font-size: 10px !important;
            min-width: 70px !important;
        }
        
        .country-cell,
        .season-label {
            min-width: 90px !important;
            font-size: 11px !important;
        }
        }
        /* 모바일 안내문 */
        .mobile-guide {
        display: none;
        background: #e0f2fe;
        border: 1px solid #0891b2;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 16px;
        align-items: center;
        gap: 10px;
        }

        @media (max-width: 768px) {
        .mobile-guide {
            display: flex;
        }
        }
        /* 4. 국가별 분석 카드 모바일 최적화 */
        @media (max-width: 768px) {
        .countryGrid {
            grid-template-columns: 1fr;
            gap: 16px;
        }
        
        .countryBox {
            margin-bottom: 0;
        }
        
        .countryHeader h4 {
            font-size: 18px;
        }
        
        .statsQuick {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
        }
        
        .statsQuick .current {
            font-size: 16px;
            font-weight: 700;
        }
        
        .statsQuick .growth {
            font-size: 13px;
        }
        
        .countryChart {
            min-height: 250px;
        }
        
        .countryTopic {
            padding: 12px;
        }
        
        .countryTopic img,
        .topicPlaceholder {
            width: 50px;
            height: 50px;
        }
        
        .topicTitle {
            font-size: 13px;
            line-height: 1.3;
        }
        
        .topicDesc {
            font-size: 12px;
            line-height: 1.4;
        }
        }

        /* 5. 소비액 섹션 모바일 최적화 */
        @media (max-width: 768px) {
        .travelSpending__grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .travelSpending__amount {
            font-size: 24px;
            text-align: center;
        }
        
        .commentList {
            padding-left: 16px;
        }
        
        .commentList li {
            font-size: 13px;
            margin-bottom: 6px;
        }
        
        /* 탭 네비게이션 모바일 최적화 */
        .tabNav {
            overflow-x: auto;
            padding-bottom: 8px;
            gap: 8px;
        }
        
        .tabBtn {
            flex-shrink: 0;
            font-size: 13px;
            padding: 10px 16px;
            white-space: nowrap;
        }
        
        .subTabNav {
            overflow-x: auto;
            padding-bottom: 8px;
            gap: 6px;
        }
        
        .subTabBtn {
            flex-shrink: 0;
            font-size: 11px;
            padding: 8px 12px;
            white-space: nowrap;
        }
        }

        /* 6. 하이라이트 섹션 모바일 최적화 */
        @media (max-width: 768px) {
        .kpi-primary {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .kpi-number {
            font-size: 36px;
        }
        
        .comparison-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .comparison-item {
            padding: 12px;
        }
        
        .comp-label {
            font-size: 11px;
        }
        
        .comp-value {
            font-size: 14px;
        }
        
        .comp-change {
            font-size: 13px;
        }
        }

        /* 7. 로딩 상태 표시 */
        .countryChart.is-deferred::before {
        content: "チャート読み込み中...";
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #6b7280;
        font-size: 14px;
        background: #f9fafb;
        border-radius: 8px;
        }

        /* 8. 터치 친화적 요소 개선 */
        @media (max-width: 768px) {
        .tableViewBtn,
        .tabBtn,
        .subTabBtn {
            min-height: 44px; /* iOS 권장 터치 타겟 크기 */
            display: flex;
            align-items: center;
            justify-content: center;
        }
        }

        /* 구조화된 캘린더 안내 스타일 */
        .calendar-structured-guide {
        background: #f8f9fa;
        border-left: 4px solid #6c757d;
        border-radius: 6px;
        padding: 20px 24px;
        margin-bottom: 24px;
        text-align: left; /* 좌측 정렬 */
        }

        .guide-section {
        margin-bottom: 20px;
        }

        .guide-section:last-child {
        margin-bottom: 0;
        }

        .guide-section h4 {
        font-size: 15px;
        font-weight: 600;
        color: #212529;
        margin: 0 0 8px 0;
        padding: 0;
        }

        .guide-section p {
        font-size: 14px;
        color: #495057;
        line-height: 1.6;
        margin: 0;
        }

        .usage-desktop {
        font-size: 14px;
        color: #495057;
        line-height: 1.5;
        }

        .usage-mobile {
        display: none;
        font-size: 14px;
        color: #495057;
        line-height: 1.5;
        }

        /* 모바일 대응 */
        @media (max-width: 768px) {
        .calendar-structured-guide {
            padding: 16px 18px;
        }
        
        .guide-section {
            margin-bottom: 16px;
        }
        
        .guide-section h4 {
            font-size: 14px;
        }
        
        .guide-section p,
        .usage-desktop,
        .usage-mobile {
            font-size: 13px;
        }
        
        .usage-desktop {
            display: none;
        }
        
        .usage-mobile {
            display: block;
        }
        }
        .calendar-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        }


         /* 3번째 이후 카드 차트는 먼저 렌더되지만 화면에서는 스크롤 근처에 올 때까지 숨김 */
        .countryChart.is-deferred { visibility: hidden; }
        .countryChart:not(.is-deferred) { visibility: visible; }

        /* 인쇄 버튼 */
        .calendar-printbar{ display:flex; justify-content:flex-end; margin:10px 0 14px; }
        .btn-print{
        appearance:none; border:1px solid #1e40af; background:#eff6ff; color:#1e40af;
        font-weight:700; padding:8px 14px; border-radius:8px; cursor:pointer;
        }
        .btn-print:hover{ background:#dbeafe; }
        @media print{
             .calendar-printbar{ display:none !important; } 
              #calendar {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                box-shadow: none !important;
            }
         }
            	
</style>

<!-- Related Cases -->

<div class="inboundCaseWrapper">
  <?php gld_report_cta( 'bottom', true, 'open' ); ?>
</div>
<div class="latest latest--inboundData">
  <div class="inner">
    <h3 class="latestTitle">Related Cases</h3>
    <ul class="latest__list">
      <?php
      $custom_posts = new WP_Query(
        array(
          'post_type' => 'case',
          'posts_per_page' => 6,
        )
      );
      while ($custom_posts->have_posts()) : $custom_posts->the_post();
        $post_id = get_the_ID();
        $terms = get_the_terms($post_id, 'case_category');
      ?>
        <li class="latest__item">
          <a href="<?php the_permalink(); ?>" class="inner">
            <div class="latest__imgWrapper">
              <?php
              $og_img = get_field('og_img', $post_id);
              if ($og_img) :
                echo '<img class="latest__img" src="' . esc_url($og_img['url']) . '" alt="' . esc_attr($og_img['alt']) . '" />';
              else :
              ?>
                <img class="latest__img" src="<?php echo esc_url(get_template_directory_uri()); ?>/assets/images/logo-thumbnail.png" alt="logo">
              <?php endif; ?>
            </div>
            <div class="latest__catTime">
              <?php
              $days = 7;
              $now = date_i18n('U');
              $entry = get_the_time('U');
              $term = date('U', ($now - $entry)) / 86400;
              if ($days > $term) {
                echo '<span class="new">NEW</span>';
              }
              ?>
              <?php
              if ($terms && !is_wp_error($terms)) {
                foreach ($terms as $term) {
                  echo '<span class="postCat ' . esc_attr($term->slug) . '">' . esc_html($term->name) . '</span>';
                }
              }
              ?>
              <time><?php the_time('Y.m.d') ?></time>
            </div>
            <p class="latest__title"><?php the_title(); ?></p>
          </a>
          <?php
          $tags = wp_get_post_terms($post_id, 'case_tag', array(
            'orderby' => 'count',
            'order' => 'DESC',
          ));
          if ($tags && !is_wp_error($tags)) :
          ?>
            <div class="latest__tags">
              <?php
              $limited_tags = array_slice($tags, 0, 3);
              foreach ($limited_tags as $tag) {
                echo '<a class="tag" href="' . esc_url(get_term_link($tag)) . '">' . esc_html($tag->name) . '</a>';
              }
              ?>
            </div>
          <?php endif; ?>
        </li>
      <?php endwhile;
      wp_reset_postdata();
      ?>
    </ul>
  </div>
</div>

<div class="partsOurServices--inboundData">
  <?php get_template_part('template-parts/our_services'); ?>
</div>
<?php get_template_part('template-parts/banners_japankuru_korekoko'); ?>



<script>
// ===== 표(테이블) 개선 =====
jQuery(window).on('load', function() {
  var $ = jQuery;
  
  setTimeout(function() {
    var table = $('#wpdtSimpleTable-4, #foreignerTableWrapper table');
    
    if (table.length) {
      var description = '\
        <div style="\
          background: #F2F2F7;\
          border-left: 3px solid #007AFF;\
          padding: 12px 16px;\
          margin-bottom: 16px;\
          border-radius: 8px;\
          font-size: 13px;\
          color: #1C1C1E;\
          line-height: 1.5;\
        ">\
          <strong>データの見方：</strong><br>\
          • 2025年のデータは12月までの累計値です<br>\
          • 色の濃淡は前年比成長率を表示（緑=成長、赤=減少）<br>\
        </div>';
      table.before(description);
      
     

      // 초기 성장률 뷰 적용
      if (typeof applyView === 'function') {
        applyView('growth');
      }
    }
  }, 2000);
});

// ===== 뷰 전환(성장률/컴팩트) =====
jQuery(document).ready(function($) {
  $('.tableViewToggle').css({
    'display': 'flex',
    'justify-content': 'center',
    'margin': '20px 0'
  });
  
  var btnContainer = $('<div>').css({
    'background': '#F2F2F7',
    'padding': '4px',
    'border-radius': '10px',
    'display': 'inline-flex',
    'gap': '4px'
  });
  
  $('.tableViewToggle').wrapInner(btnContainer);
  
  $('.tableViewBtn').css({
    'background': 'transparent',
    'border': 'none',
    'padding': '8px 20px',
    'border-radius': '8px',
    'color': '#1C1C1E',
    'font-size': '13px',
    'font-weight': '500',
    'cursor': 'pointer',
    'transition': 'all 0.2s'
  });
  
  $('.tableViewBtn.active').css({
    'background': '#FFFFFF',
    'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
  });
  
  window.applyView = function(view) {
    var table = $('#wpdtSimpleTable-4, #foreignerTableWrapper table');
    table.find('tbody td').css({
      'background': '',
      'padding': '',
      'font-size': ''
    });
    
    if (view === 'growth') {
      table.find('tbody tr').each(function() {
        var cells = jQuery(this).find('td');
        cells.each(function(index) {
          if (index === 0 || index === 1) return;
          var cell = jQuery(this);
          var value = parseInt(cell.text().replace(/,/g, ''), 10);
          var prev  = parseInt(cells.eq(index-1).text().replace(/,/g, ''), 10);
          if (!isNaN(value) && !isNaN(prev) && prev > 0) {
            var growth = ((value - prev) / prev * 100);
            if (growth > 30)      { cell.css('background', 'rgba(52, 199, 89, 0.2)'); }
            else if (growth > 10) { cell.css('background', 'rgba(52, 199, 89, 0.1)'); }
            else if (growth > 0)  { cell.css('background', 'rgba(52, 199, 89, 0.05)'); }
            else if (growth > -10){ cell.css('background', 'rgba(255, 59, 48, 0.05)'); }
            else if (growth > -30){ cell.css('background', 'rgba(255, 59, 48, 0.1)'); }
            else                  { cell.css('background', 'rgba(255, 59, 48, 0.2)'); }
            cell.attr('data-tooltip', '前年比: ' + (growth > 0 ? '+' : '') + growth.toFixed(1) + '%');
cell.css('position', 'relative');
          }
        });
      });
    } else if (view === 'compact') {
      table.find('td, th').css({
        'padding': '3px 5px',
        'font-size': '11px',
        'line-height': '1.3'
      });
    }
  };
  
  jQuery('.tableViewBtn').on('click', function() {
    jQuery('.tableViewBtn').css({ 'background': 'transparent', 'box-shadow': 'none' });
    jQuery(this).css({ 'background': '#FFFFFF', 'box-shadow': '0 2px 8px rgba(0,0,0,0.1)' });
    jQuery('.tableViewBtn').removeClass('active');
    jQuery(this).addClass('active');
    window.applyView(jQuery(this).data('view'));
  });
});

// ===== 3번째 이후 country 차트 지연 노출(서버 렌더 그대로) =====
document.addEventListener('DOMContentLoaded', function(){
  if (!('IntersectionObserver' in window)) {
    // 구형 브라우저: 모두 표시
    var els = document.querySelectorAll('.countryChart.is-deferred');
    for (var i=0;i<els.length;i++) els[i].classList.remove('is-deferred');
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        e.target.classList.remove('is-deferred');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '200px' });
  var targets = document.querySelectorAll('.countryChart.is-deferred');
  for (var j=0;j<targets.length;j++) io.observe(targets[j]);
});

// ===== wpDataChart_6 전용 YTD(누계) 추가 – ES5 / 안전모드 =====
(function($){
  function addYTDToChart6(retry){
    retry = retry || 0;
    try {
      if (typeof Highcharts === 'undefined' || !Highcharts.charts) {
        if (retry < 40) { setTimeout(function(){ addYTDToChart6(retry+1); }, 200); }
        return;
      }
      var chart = null;
      for (var i=0; i<Highcharts.charts.length; i++) {
        var c = Highcharts.charts[i];
        if (c && c.renderTo && /wpDataChart[_-]6/.test(c.renderTo.id)) { chart = c; break; }
      }
      if (!chart) {
        if (retry < 40) { setTimeout(function(){ addYTDToChart6(retry+1); }, 200); }
        return;
      }

      // 2025 확정 시리즈만(予測/累計/YTD 제외)
      var act = null;
      var s, nm;
      for (s=0; s<(chart.series||[]).length; s++) {
        nm = (chart.series[s] && chart.series[s].name) ? String(chart.series[s].name) : '';
        if (/2025/.test(nm) && !/予測|累計|YTD/.test(nm) && chart.series[s].type !== 'pie') { act = chart.series[s]; break; }
      }
      if (!act) { return; }

      // 마지막 확정 월 index
      var lastIdx = -1;
      for (var j=0; j<act.data.length; j++) {
        var pt = act.data[j];
        if (pt && typeof pt.y === 'number') { lastIdx = j; }
      }
      if (lastIdx < 0) { return; }

      // YTD 배열
      var ytdData = [];
      for (var k=0; k<=lastIdx; k++) {
        var y = (act.data[k] && typeof act.data[k].y === 'number') ? act.data[k].y : 0;
        ytdData[k] = (k ? ytdData[k-1] : 0) + y;
      }

      // 오른쪽 축(opposite) 재사용/생성
      var rightAxis = null;
      for (var a=0; a<(chart.yAxis||[]).length; a++) {
        if (chart.yAxis[a] && chart.yAxis[a].opposite === true) { rightAxis = chart.yAxis[a]; break; }
      }
      if (!rightAxis) {
        chart.addAxis({
          id: 'ytd-right',
          opposite: true,
          title: { text: '累計（人｜YTD）' },
          gridLineWidth: 0,
          labels: { formatter: function(){ 
            var val = this.value;
            if (val >= 100000000) return (val / 100000000).toFixed(1).replace('.0', '') + '億';
            if (val >= 10000) return (val / 10000).toFixed(1).replace('.0', '') + '万';
            if (val >= 1000) return (val / 1000).toFixed(1).replace('.0', '') + '千';
            return val.toLocaleString('ja-JP');
          } },
          min: 0
        }, false, false);
        rightAxis = chart.yAxis[chart.yAxis.length - 1];
      } else {
        rightAxis.update({ title: { text: '累計（人｜YTD）' } }, false);
      }

      // 기존 ytd 시리즈 있으면 갱신, 없으면 추가
      var ytdSeries = null;
      for (var t=0; t<chart.series.length; t++) {
        var uo = chart.series[t] && chart.series[t].userOptions;
        if (uo && uo.id === 'ytd2025') { ytdSeries = chart.series[t]; break; }
      }

      var yAxisRef = rightAxis.options.id || rightAxis.index;

      if (ytdSeries) {
        ytdSeries.update({ yAxis: yAxisRef }, false);
        ytdSeries.setData(ytdData, false);
        if (!ytdSeries.visible) { ytdSeries.setVisible(true, false); }
      } else {
        chart.addSeries({
          id: 'ytd2025',
          name: '2025年 累計（YTD）',
          type: 'spline',
          yAxis: yAxisRef,
          data: ytdData,
          color: (act.color || '#00bbcc'),
          dashStyle: 'ShortDash',
          marker: { enabled: true, radius: 3 },
          dataLabels: {
            enabled: true,
            formatter: function(){
              if (!this.point) { return null; }
              var idx = this.point.index;
              var val = this.y;
              var formatted = '';
              if (val >= 100000000) formatted = (val / 100000000).toFixed(1).replace('.0', '') + '億';
              else if (val >= 10000) formatted = (val / 10000).toFixed(1).replace('.0', '') + '万';
              else if (val >= 1000) formatted = (val / 1000).toFixed(1).replace('.0', '') + '千';
              else formatted = val.toLocaleString('ja-JP');
              return (idx === ytdData.length - 1) ? formatted + ' 人' : null;
            },
            crop: false, overflow: 'allow', align: 'left', x: 6
          },
          tooltip: {
            pointFormatter: function(){
              var val = this.y;
              var formatted = '';
              if (val >= 100000000) formatted = (val / 100000000).toFixed(1).replace('.0', '') + '億';
              else if (val >= 10000) formatted = (val / 10000).toFixed(1).replace('.0', '') + '万';
              else if (val >= 1000) formatted = (val / 1000).toFixed(1).replace('.0', '') + '千';
              else formatted = val.toLocaleString('ja-JP');
              return 'YTD: ' + formatted + ' 人';
            }
          }
        }, false);
      }

      chart.update({ tooltip: { shared: true, headerFormat: '{point.key}月' } }, false);
      chart.redraw();

      // 재렌더 감시(해당 컨테이너만)
      if (!chart.__ytdObserverAttached) {
        chart.__ytdObserverAttached = true;
        var mo = new MutationObserver(function(){
          setTimeout(function(){ addYTDToChart6(0); }, 150);
        });
        mo.observe(chart.renderTo, { childList: true, subtree: true });
      }
    } catch(e){
      if (window.console && console.warn) { console.warn('[YTD-6] error', e); }
    }
  }
  jQuery(function(){ setTimeout(function(){ addYTDToChart6(0); }, 400); });
})(jQuery);
</script>
<style>



/* ===== PRINT: 8개국 A4 한 페이지 ===== */
@media print {
  /* 컬러 유지 */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  /* 캘린더 외 숨기기 */
  header, nav, footer,
  .archive__mainVisual,
  .page-navigation,
  .inboundCaseWrapper,
  .latest,
  .partsOurServices--inboundData,
  .single__share,
  .bnrJapankuruKorekoko,
  #wpadminbar,
  .calendar-structured-guide,
  .legend,
  .calendar-printbar { display: none !important; }

  /* A4 가로 */
  @page { size: A4 landscape; margin: 8mm; }

  #calendar {
    display: block !important;
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  #calendar::before {
    content: attr(data-print-title);
    display: block !important;
    text-align: center;
    font-size: 11pt;
    font-weight: 800;
    margin: 0 0 2mm 0;
  }

  #calendar .calendar {
    width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    margin-top: 1mm !important;
  }

  #calendar .pageSectionTitle { display: none !important; }

  /* ✅ 그리드 - 유연하게 */
  .calendar-header,
  .season-row,
  .country-row {
    grid-template-columns: 18mm repeat(12, 1fr) !important;
    width: 100% !important;
  }

  /* ✅ 헤더 */
  .header-cell { 
    font-size: 7pt !important; 
    padding: 2mm 1mm !important; 
  }

  /* ✅ 시즌 행 */
  .season-label { 
    font-size: 6.5pt !important; 
    padding: 1.5mm !important; 
  }
  .season-cell { 
    min-height: 10mm !important; 
    padding: 1mm !important; 
  }
  .season-emoji { font-size: 10px !important; }
  .season-text { font-size: 6pt !important; }

  /* ✅ 국가 행 - 동일 높이 */
  .country-row { 
    min-height: 18mm !important;
    height: 18mm !important;
  }
  .country-cell { 
    font-size: 7pt !important; 
    padding: 1.5mm !important; 
    gap: 1.5mm !important;
  }
  .country-cell span:first-child { font-size: 12px !important; }

  /* ✅ 월별 셀 */
  .month-cell { 
    min-height: 18mm !important;
    height: 18mm !important;
    padding: 1mm !important; 
    gap: 1mm !important;
    overflow: hidden !important;
  }

  /* ✅ 연휴 알약 */
  .holiday-pill {
    font-size: 6pt !important;
    line-height: 1.15 !important;
    padding: 0.5mm 1mm !important;
    border-radius: 1.5mm !important;
    margin: 0.3mm 0 !important;
  }
  .holiday-pill .pill-name { font-size: 6pt !important; font-weight: 700 !important; }
  .holiday-pill .pill-period { font-size: 5pt !important; margin-top: 0.5mm !important; }
  .holiday-pill.is-major { border-width: 1.5px !important; }

  /* ✅ 각주 (2페이지) */
  #calendar-footnotes {
    page-break-before: always !important;
    display: block !important;
    padding: 8mm !important;
    font-size: 8pt !important;
    line-height: 1.4 !important;
    column-count: 2 !important;
    column-gap: 8mm !important;
  }
  #calendar-footnotes .ft-title {
    column-span: all !important;
    text-align: center !important;
    font-size: 11pt !important;
    margin-bottom: 4mm !important;
  }
  #calendar-footnotes .footnote-country { break-inside: avoid !important; margin-bottom: 3mm !important; }
  #calendar-footnotes .ft-list li { font-size: 7pt !important; }
}
.page-navigation .nav-items{ position:relative; }

/* 네비 인디케이터용 포지셔닝 */
.nav-items { position: relative; -webkit-overflow-scrolling: touch; }

/* 동적 생성되는 하이라이트 바 */
.nav-indicator{
  position:absolute; left:0; bottom:0;
  height:2px; width:0; background:#1e40af;
  opacity:0; transition:transform .25s ease,width .25s ease,opacity .2s ease;
  pointer-events:none;
}

/* ===== 강제 보정 스코프 ===== */
header.archive__mainVisual,
header.archive__mainVisual.archive__mainVisual--hasDescription{
  position: relative !important;
  margin-bottom: 0 !important;
  /* 초기값 – 실제 값은 JS가 계산해 덮습니다 */
  padding-bottom: 0 !important;
  overflow: visible !important;
  z-index: 1;
}

/* 브레드크럼 우측 하단 고정 & 우측 정렬 */
header.archive__mainVisual .archive__mainVisualRight.tabBigPcOnly{
  position: absolute !important;
  right: 32px !important;
  bottom: 18px !important;
  left: auto !important;
  width: auto !important;
  max-width: 48vw !important;
  text-align: right !important;
  transform: none !important;
  z-index: 3 !important;
}
header.archive__mainVisual .archive__mainVisualRight .breadcrumb__list{
  display: flex !important;
  gap: .5em !important;
  align-items: center !important;
  justify-content: flex-end !important;
  margin: 0 !important;
}

/* 스티키 내비 – 헤더에 딱 붙도록 (여백은 JS로 0으로 맞춤) */

:root{
  --wp-adminbar-h: 0px;    /* 로그인 아닐 땐 0 */
  --site-header-h: 64px;   /* 공통 헤더 예상 높이(임시). JS가 실측으로 덮음 */
}
.page-navigation{
  position: sticky;
  top: calc(var(--wp-adminbar-h) + var(--site-header-h)); /* 헤더 바로 아래 붙이기 */
  z-index: 100;              /* 사이트 헤더보다 낮게 유지 (겹침 방지) */
  background:#fff;           /* 투명 겹침 방지 */
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
}

/* 섹션 앵커 점프 보정(제목 가리는 현상 방지) */
.pageSection{ 
  scroll-margin-top: calc(var(--wp-adminbar-h) + var(--site-header-h) + 12px);
}

@media (max-width:1023px){
  /* 모바일은 브레드크럼 흐름 배치 */
  header.archive__mainVisual .archive__mainVisualRight.tabBigPcOnly{
    position: static !important;
    right: auto !important; bottom: auto !important;
    max-width: none !important;
    text-align: left !important;
    margin-top: 8px !important;
  }
}
</style>

<script>
(function(){
  // 후보 셀렉터: 테마에 따라 다를 수 있어 여러 개 시도
  var headerSelectors = [
    'header[role="banner"]',
    'header.site-header',
    '#masthead',
    '.l-header',
    'header.header'
  ];
  function $(s){ try{ return document.querySelector(s); }catch(e){ return null; } }

  function getHeaderEl(){
    for(var i=0;i<headerSelectors.length;i++){
      var el = $(headerSelectors[i]);
      if (el) return el;
    }
    return null;
  }
  function getH(el){ return el ? (el.getBoundingClientRect().height || el.offsetHeight || 0) : 0; }

  function applyStickyTop(){
    var admin = document.getElementById('wpadminbar');
    var hdr   = getHeaderEl();
    var adminH = getH(admin);
    var headH  = getH(hdr);

    // WP 로그인바 높이 반영
    document.documentElement.style.setProperty('--wp-adminbar-h', adminH + 'px');

    // 헤더가 fixed/sticky가 아니어도 상관없이, 실제 높이로 보정
    // (테마가 스크롤에 따라 높이 변하면 resize/scroll에서 다시 계산)
    if (headH > 0){
      document.documentElement.style.setProperty('--site-header-h', headH + 'px');
    }

    // 섹션 앵커 보정(이미 CSS에 있지만, 다른 스크립트가 덮을 수 있어 1회 더 강제)
    var offset = adminH + headH + 12;
    var secs = document.querySelectorAll('.pageSection, section[id]');
    for (var i=0;i<secs.length;i++){
      secs[i].style.scrollMarginTop = offset + 'px';
    }
  }

  // 초기/리사이즈/폰트 로드/스크롤(헤더가 축소되는 테마일 때)마다 갱신
  var t;
  function onResize(){ clearTimeout(t); t=setTimeout(applyStickyTop, 80); }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyStickyTop);
  } else {
    applyStickyTop();
  }
  window.addEventListener('load', applyStickyTop);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', function(){
    // 헤더가 스크롤에 따라 높이가 바뀌는 테마용 미세 보정
    // (부하 적게: 120ms에 한 번)
    clearTimeout(t); t=setTimeout(applyStickyTop, 120);
  });
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(applyStickyTop);
  }
})();
</script>

<!-- 🔧 WordPress 차트 축 단위 일본식 변경 스크립트 -->
<script>
(function() {
  'use strict';

  // 일본식 숫자 포맷팅
  function formatJapaneseNumber(value) {
    if (value == null || value === '') return '';
    var num = parseFloat(value);
    if (isNaN(num)) return value.toString();
    if (Math.abs(num) >= 100000000) {
      return (num / 100000000).toFixed(1).replace('.0', '') + '億';
    } else if (Math.abs(num) >= 10000) {
      return (num / 10000).toFixed(1).replace('.0', '') + '万';
    } else if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + '千';
    } else {
      return num.toLocaleString('ja-JP');
    }
  }

  // Highcharts 글로벌 설정
  function fixHighchartsGlobal() {
    if (typeof Highcharts !== 'undefined') {
      Highcharts.setOptions({
        lang: {
          numericSymbols: ['千', '万', '千万', '億', '千億', '兆']
        }
      });
    }
  }

  // 각 차트 컨테이너의 축/데이터 라벨 수정
  function fixWordPressCharts() {
    var chartSelectors = [
      '.wpdatachart-wrapper',
      '.highcharts-container',
      '[id*="wpdatachart"]',
      '.chart-container'
    ];

    chartSelectors.forEach(function(selector) {
      var containers = document.querySelectorAll(selector);

      containers.forEach(function(container) {
        // 축 라벨
        var axisLabels = container.querySelectorAll(
          '.highcharts-axis-labels text, ' +
          '.highcharts-yaxis-labels text, ' +
          '.highcharts-xaxis-labels text, ' +
          'text[text-anchor]'
        );

        axisLabels.forEach(function(label) {
          var text = label.textContent || label.innerHTML || '';
          if (text && (text.indexOf('k') !== -1 || text.indexOf('M') !== -1 || text.indexOf('B') !== -1)) {
            var cleanNumber = parseFloat(text.replace(/[kmKMB,\s]/g, ''));
            if (!isNaN(cleanNumber)) {
              var multiplier = 1;
              var lower = text.toLowerCase();
              if (lower.indexOf('k') !== -1) multiplier = 1000;
              else if (lower.indexOf('m') !== -1) multiplier = 1000000;
              else if (lower.indexOf('b') !== -1) multiplier = 1000000000;

              var finalValue = cleanNumber * multiplier;
              label.textContent = formatJapaneseNumber(finalValue);
            }
          }
        });

        // 데이터 라벨
        var dataLabels = container.querySelectorAll(
          '.highcharts-data-labels text, ' +
          '.highcharts-series text'
        );

        dataLabels.forEach(function(label) {
          var text = label.textContent || label.innerHTML || '';
          if (text && (text.indexOf('k') !== -1 || text.indexOf('M') !== -1 || text.indexOf('B') !== -1)) {
            var match = text.match(/(\d+(?:\.\d+)?)\s*([kmKMB])/);
            if (match) {
              var num = parseFloat(match[1]);
              var unit = match[2].toLowerCase();
              var multiplier = unit === 'k' ? 1000 : unit === 'm' ? 1000000 : 1000000000;
              var finalValue = num * multiplier;
              label.textContent = text.replace(match[0], formatJapaneseNumber(finalValue));
            }
          }
        });
      });
    });
  }

  // 실제 적용
  function executeChartFix() {
    fixHighchartsGlobal();
    fixWordPressCharts();
  }

  // 초기화 + DOM 변경 감시
  function initChartFix() {
    executeChartFix();
    setTimeout(executeChartFix, 1000);
    setTimeout(executeChartFix, 3000);
    setTimeout(executeChartFix, 5000);

    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        var hasNewCharts = false;

        mutations.forEach(function(mutation) {
          if (!mutation.addedNodes) return;

          Array.prototype.forEach.call(mutation.addedNodes, function(node) {
            if (!node || node.nodeType !== 1 || !node.querySelector) return;

            // className 안전하게 문자열화 (SVGAnimatedString 대응)
            var cls = '';
            if (typeof node.className === 'string') {
              cls = node.className;
            } else if (node.className && typeof node.className.baseVal === 'string') {
              cls = node.className.baseVal;
            }

            var id = (typeof node.id === 'string') ? node.id : '';

            if (
              node.querySelector('.highcharts-container') ||
              cls.indexOf('chart') !== -1 ||
              id.indexOf('chart') !== -1
            ) {
              hasNewCharts = true;
            }
          });
        });

        if (hasNewCharts) {
          setTimeout(executeChartFix, 100);
          setTimeout(executeChartFix, 1000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // 실행 타이밍
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChartFix);
  } else {
    initChartFix();
  }

  window.addEventListener('load', function() {
    setTimeout(executeChartFix, 1000);
  });
})();
</script>
<?php
/* =====================================================================
   資料DLモーダル：このページの「市場レポート」ボタン（/download/?doc=market へのリンク）と、
   ダッシュボード（iframe）からの依頼で、ページを移らずにプレビュー＋フォームを開く。
   JSが動かない時は、今までどおり /download/ へ移動する。
   ===================================================================== */
$gld_r  = $GLOBALS['gld_report'];
$gld_at = get_option( 'gld_report_month_at' );
?>
<div class="gld-inpage-dl" hidden>
  <input id="document2" class="documentDl__input" type="hidden" value="インバウンド市場レポート（<?php echo esc_attr( $gld_r['data_month'] ); ?>）::<?php echo esc_url( $gld_r['pdf'] ); ?>">
  <label class="documentDl__label" for="document2" data-teaser="<?php echo esc_attr( implode( ', ', $gld_r['teasers'] ) ); ?>" data-tags="#市場動向,#月次レポート" data-updated="<?php echo esc_attr( $gld_at ? date( 'Y-m', $gld_at ) : '' ); ?>">
    <span class="documentDl__market">訪日外客数・主要9市場・旅行消費・外国人宿泊・都道府県別データ</span>
    <button class="gld-previewBtn" type="button">市場レポート</button>
  </label>
</div>
<div id="gld-modal-form-src" style="display:none;"><?php echo do_shortcode( '[contact-form-7 id="5bc11bb" title="downroad_modal"]' ); ?></div>
<script>
(function () {
  function openReport(from, via) {
    var btn = document.querySelector('.gld-inpage-dl .gld-previewBtn');
    if (!btn || !window.__gldPreviewBooted) return false;
    btn.click();
    // フォームの流入元・クリック位置（/download/ のURLと同じ値）
    setTimeout(function () {
      var set = function (n, v) { var el = document.querySelector('#gld-modal-form [name="' + n + '"]'); if (el) el.value = v || ''; };
      set('from', from); set('via', via);
    }, 0);
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="/download/"][href*="doc=market"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;   // 新しいタブで開く操作はそのまま
    var u = new URL(a.href, location.href);
    if (openReport(u.searchParams.get('from') || 'inbound_statistics', u.searchParams.get('via') || '')) e.preventDefault();
  });
  // ダッシュボード（inbound-visitors / inbounddata0128）からの依頼
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type !== 'gld-open-report') return;
    var h = ''; try { h = new URL(e.origin).hostname; } catch (_) {}
    if (!/\.vercel\.app$/.test(h)) return;
    var iframe = Array.prototype.find.call(document.querySelectorAll('iframe'), function (f) { return f.contentWindow === e.source; });
    if (iframe && openReport('inbound_statistics', d.via || 'dashboard') && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'gld-open-report-ok' }, e.origin);
    }
  });
})();
</script>
</article>
</div>
<?php get_footer(); ?>
