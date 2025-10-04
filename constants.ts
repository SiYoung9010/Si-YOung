export const INITIAL_HTML_INPUT = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>뽀글이 댕댕이 키링 - Fluffy Puppy Collection</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background: #FFF0F5;
  color: #333;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 메인 히어로 섹션 */
.hero-section {
  background: linear-gradient(135deg, #FFB3D9 0%, #FFC0CB 50%, #FFE4E1 100%);
  padding: 60px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: "♡";
  position: absolute;
  font-size: 300px;
  color: rgba(255,255,255,0.1);
  top: -50px;
  left: -50px;
}

.hero-section::after {
  content: "✧";
  position: absolute;
  font-size: 200px;
  color: rgba(255,255,255,0.15);
  bottom: -30px;
  right: -30px;
}

.brand-tag {
  display: inline-block;
  background: white;
  color: #FF69B4;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.main-title {
  font-family: 'Quicksand', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin-bottom: 15px;
  text-shadow: 3px 3px 0px rgba(255,105,180,0.3);
  letter-spacing: -1px;
}

.sub-title {
  font-size: 18px;
  color: white;
  margin-bottom: 30px;
  font-weight: 400;
  opacity: 0.95;
}

.emoji-deco {
  font-size: 32px;
  margin: 20px 0;
}

/* 이미지 섹션 */
.full-image {
  width: 100%;
  margin-bottom: 0;
  position: relative;
}

.full-image img {
  width: 100%;
  height: auto;
  display: block;
}

.image-with-sticker {
  position: relative;
}

.sticker {
  position: absolute;
  background: #FF69B4;
  color: white;
  padding: 15px 25px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
  transform: rotate(-15deg);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  z-index: 10;
}

.sticker.top-right {
  top: 30px;
  right: 30px;
}

/* 캐치프레이즈 섹션 */
.catch-section {
  background: white;
  padding: 80px 30px;
  text-align: center;
  position: relative;
}

.catch-bubble {
  display: inline-block;
  background: linear-gradient(45deg, #FFE0EC, #FFF0F5);
  padding: 40px 60px;
  border-radius: 100px;
  position: relative;
}

.catch-bubble::before {
  content: "˚₊‧꒰ა ☆ ໒꒱ ‧₊˚";
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  color: #FFB3D9;
  font-size: 20px;
}

.catch-text {
  font-size: 24px;
  font-weight: 700;
  color: #FF69B4;
  line-height: 1.8;
}

.catch-highlight {
  background: linear-gradient(180deg, transparent 60%, #FFE0EC 60%);
  padding: 0 5px;
}

/* 스토리 카드 섹션 */
.story-card {
  background: white;
  margin: 60px 20px;
  padding: 60px;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(255,105,180,0.1);
  position: relative;
  overflow: hidden;
}

.story-card::before {
  content: "";
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, #FFE0EC, transparent);
  border-radius: 50%;
}

.story-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #FF69B4;
  color: white;
  padding: 10px 25px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 30px;
}

.story-main {
  font-size: 20px;
  line-height: 2;
  color: #666;
  margin-bottom: 30px;
}

.story-point {
  font-size: 24px;
  font-weight: 700;
  color: #FF69B4;
  text-align: center;
  padding: 30px;
  background: linear-gradient(45deg, #FFF0F5, #FFE0EC);
  border-radius: 20px;
  margin-top: 30px;
}

/* 선택 섹션 */
.choice-section {
  padding: 80px 20px;
  background: linear-gradient(180deg, #FFF0F5 0%, white 100%);
  text-align: center;
}

.section-title {
  font-size: 36px;
  font-weight: 900;
  color: #FF69B4;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.section-subtitle {
  font-size: 16px;
  color: #999;
  margin-bottom: 50px;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.choice-card {
  background: white;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
}

.choice-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(255,105,180,0.2);
}

.choice-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.choice-label {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 700;
  color: #FF69B4;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.choice-name {
  padding: 25px;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(45deg, #FFF0F5, white);
}

/* 포인트 섹션 */
.points-section {
  background: white;
  padding: 100px 20px;
  position: relative;
}

.points-header {
  text-align: center;
  margin-bottom: 60px;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.point-item {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(145deg, #FFF0F5, white);
  border-radius: 30px;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.point-item:hover {
  border: 2px solid #FFB3D9;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(255,105,180,0.15);
}

.point-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #FF69B4, #FFB3D9);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  transform: rotate(-5deg);
}

.point-title {
  font-size: 20px;
  font-weight: 700;
  color: #FF69B4;
  margin-bottom: 10px;
}

.point-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
}

/* 디테일 뷰 */
.detail-section {
  padding: 80px 20px;
  background: #FFF0F5;
}

.detail-item {
  max-width: 1000px;
  margin: 0 auto 80px;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.detail-content {
  padding: 50px;
}

.detail-label {
  display: inline-block;
  background: linear-gradient(45deg, #FF69B4, #FFB3D9);
  color: white;
  padding: 8px 20px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.detail-text {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
}

/* 활용 가이드 */
.usage-section {
  padding: 100px 20px;
  background: white;
  text-align: center;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 900px;
  margin: 60px auto 0;
}

.usage-item {
  background: linear-gradient(135deg, #FFF0F5, white);
  border-radius: 25px;
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.usage-item::before {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 80px;
  height: 80px;
  background: rgba(255,105,180,0.1);
  border-radius: 50%;
}

.usage-item:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(255,105,180,0.15);
}

.usage-emoji {
  font-size: 48px;
  margin-bottom: 20px;
}

.usage-title {
  font-size: 18px;
  font-weight: 700;
  color: #FF69B4;
  margin-bottom: 10px;
}

.usage-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
}

/* MD 추천 */
.recommend-section {
  background: linear-gradient(135deg, #FF69B4, #FFB3D9);
  padding: 100px 30px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.recommend-section::before,
.recommend-section::after {
  content: "★";
  position: absolute;
  font-size: 100px;
  opacity: 0.1;
}

.recommend-section::before {
  top: 20px;
  left: 50px;
}

.recommend-section::after {
  bottom: 20px;
  right: 50px;
}

.recommend-badge {
  display: inline-block;
  background: white;
  color: #FF69B4;
  padding: 10px 25px;
  border-radius: 20px;
  font-weight: 700;
  margin-bottom: 30px;
  font-size: 14px;
}

.recommend-text {
  font-size: 24px;
  line-height: 1.8;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 400;
}

.recommend-text strong {
  font-weight: 700;
  font-size: 28px;
  display: block;
  margin-top: 20px;
}

/* 제품 정보 */
.info-section {
  padding: 80px 20px;
  background: #FFF0F5;
}

.info-card {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table tr {
  border-bottom: 1px solid #FFE0EC;
}

.info-table tr:last-child {
  border-bottom: none;
}

.info-table td {
  padding: 20px 15px;
  font-size: 15px;
}

.info-table td:first-child {
  width: 150px;
  font-weight: 700;
  color: #FF69B4;
}

.info-table td:last-child {
  color: #666;
}

/* 주의사항 */
.notice-section {
  background: linear-gradient(135deg, #FFE0EC, #FFF0F5);
  padding: 60px 30px;
  text-align: center;
}

.notice-title {
  font-size: 20px;
  font-weight: 700;
  color: #FF69B4;
  margin-bottom: 30px;
}

.notice-list {
  max-width: 700px;
  margin: 0 auto;
  text-align: left;
  list-style: none;
}

.notice-list li {
  position: relative;
  padding-left: 30px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #888;
  line-height: 1.6;
}

.notice-list li::before {
  content: "💝";
  position: absolute;
  left: 0;
  top: 0;
}

/* 푸터 */
.footer-section {
  background: white;
  padding: 80px 20px;
  text-align: center;
}

.footer-logo {
  font-family: 'Quicksand', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #FF69B4;
  margin-bottom: 15px;
}

.footer-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 30px;
}

.footer-emoji {
  font-size: 24px;
}

/* 반응형 */
@media (max-width: 768px) {
  .main-title { font-size: 32px; }
  .section-title { font-size: 28px; }
  
  .choice-grid,
  .points-grid,
  .usage-grid {
    grid-template-columns: 1fr;
  }
  
  .story-card,
  .detail-content,
  .info-card {
    padding: 30px 20px;
  }
  
  .recommend-text {
    font-size: 18px;
  }
}
</style>
</head>
<body>

<div class="container">

<!-- 히어로 섹션 -->
<div class="hero-section">
  <div class="brand-tag">NEW ARRIVAL</div>
  <h1 class="main-title">Fluffy Puppy Keyring</h1>
  <p class="sub-title">나만의 작은 친구, 뽀글이 댕댕이를 만나보세요</p>
  <div class="emoji-deco">🐶💕🎄</div>
</div>

<!-- 메인 이미지 -->
<div class="full-image image-with-sticker">
  <div class="sticker top-right">HOT!</div>
  <img src="https://images.pexels.com/photos/4588035/pexels-photo-4588035.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="뽀글이 댕댕이 메인" crossorigin="anonymous">
</div>

<!-- 캐치프레이즈 -->
<div class="catch-section">
  <div class="catch-bubble">
    <div class="catch-text">
      <span class="catch-highlight">매일매일</span> 보고 싶은<br>
      <span class="catch-highlight">세상에서 제일</span> 귀여운<br>
      나만의 뽀글이 친구 🎀
    </div>
  </div>
</div>

<!-- 제품 이미지 -->
<div class="full-image">
  <img src="https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="제품 전체" crossorigin="anonymous">
</div>

<div class="full-image">
  <img src="https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="제품 감성컷" crossorigin="anonymous">
</div>

<!-- 스토리 카드 -->
<div class="story-card">
  <div class="story-badge">
    <span>🌟</span>
    <span>BRAND STORY</span>
  </div>
  <div class="story-main">
    하루하루 바쁜 일상 속에서<br>
    문득 나를 보고 웃어주는 작은 친구가 있다면?<br><br>
    
    <strong>뽀글이 댕댕이</strong>는 당신의 가방, 파우치, 열쇠고리에<br>
    매달려 언제나 당신과 함께해요
  </div>
  <div class="story-point">
    "오늘도 수고했어, 내일은 더 좋은 날이 될거야" 🌸<br>
    작은 위로가 되어줄 나만의 반려 키링
  </div>
</div>

<!-- 선택 섹션 -->
<div class="choice-section">
  <h2 class="section-title">Choose Your Buddy</h2>
  <p class="section-subtitle">어떤 친구가 마음에 드시나요?</p>
  
  <div class="choice-grid">
    <div class="choice-card">
      <div class="choice-label">Type A</div>
      <img src="https://images.pexels.com/photos/3361739/pexels-photo-3361739.jpeg?auto=compress&cs=tinysrgb&w=800" alt="산타 댕댕이" crossorigin="anonymous">
      <div class="choice-name">🎅 산타 댕댕이</div>
    </div>
    <div class="choice-card">
      <div class="choice-label">Type B</div>
      <img src="https://images.pexels.com/photos/3725403/pexels-photo-3725403.jpeg?auto=compress&cs=tinysrgb&w=800" alt="눈꽃 댕댕이" crossorigin="anonymous">
      <div class="choice-name">❄️ 눈꽃 댕댕이</div>
    </div>
  </div>
</div>

<!-- 포인트 섹션 -->
<div class="points-section">
  <div class="points-header">
    <h2 class="section-title">Why So Special?</h2>
    <p class="section-subtitle">뽀글이가 특별한 이유</p>
  </div>
  
  <div class="points-grid">
    <div class="point-item">
      <div class="point-icon">✨</div>
      <div class="point-title">심쿵 비주얼</div>
      <div class="point-desc">
        살포시 감은 눈과<br>
        발그레한 볼터치까지<br>
        디테일 하나하나 완벽해요
      </div>
    </div>
    <div class="point-item">
      <div class="point-icon">🎀</div>
      <div class="point-title">몽글몽글 촉감</div>
      <div class="point-desc">
        극세사 벨벳 소재로<br>
        만질 때마다 기분 좋은<br>
        포근포근한 촉감
      </div>
    </div>
    <div class="point-item">
      <div class="point-icon">💝</div>
      <div class="point-title">어디든 OK</div>
      <div class="point-desc">
        가방, 파우치, 차키 등<br>
        어디에 달아도 찰떡!<br>
        12cm 완벽 사이즈
      </div>
    </div>
  </div>
</div>

<!-- 사이즈 이미지 -->
<div class="full-image">
  <img src="https://images.pexels.com/photos/2023384/pexels-photo-2023384.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="사이즈 정보" crossorigin="anonymous">
</div>

<!-- 디테일 뷰 -->
<div class="detail-section">
  <h2 class="section-title" style="text-align: center; margin-bottom: 60px;">Detail Check</h2>
  
  <div class="detail-item">
    <div class="detail-content">
      <span class="detail-label">POINT 01</span>
      <h3 class="detail-title">요정처럼 사랑스러운 표정</h3>
      <p class="detail-text">
        크리스마스를 기다리는 설렘 가득한 표정!<br>
        깜찍한 고깔모자와 체크 하트 참까지, 보는 것만으로도 행복해져요
      </p>
    </div>
    <img src="https://images.pexels.com/photos/103523/pexels-photo-103523.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="디테일1" crossorigin="anonymous">
  </div>
  
  <div class="detail-item">
    <div class="detail-content">
      <span class="detail-label">POINT 02</span>
      <h3 class="detail-title">자꾸만 만지고 싶은 보들보들</h3>
      <p class="detail-text">
        극세사 벨벳의 부드러운 감촉과 탄탄한 PP코튼 충전재<br>
        스트레스 받을 때 꾹꾹 누르면 힐링돼요
      </p>
    </div>
    <img src="https://images.pexels.com/photos/994196/pexels-photo-994196.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="디테일2" crossorigin="anonymous">
  </div>
  
  <div class="detail-item">
    <div class="detail-content">
      <span class="detail-label">POINT 03</span>
      <h3 class="detail-title">튼튼한 로프 스트랩</h3>
      <p class="detail-text">
        꼬임이 탄탄한 로프로 어디든 쉽게 연결!<br>
        꼼꼼한 마감으로 오래오래 함께해요
      </p>
    </div>
    <img src="https://images.pexels.com/photos/220938/pexels-photo-220938.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="디테일3" crossorigin="anonymous">
  </div>
</div>

<!-- 활용 가이드 -->
<div class="usage-section">
  <h2 class="section-title">How to Style</h2>
  <p class="section-subtitle">뽀글이와 함께하는 일상</p>
  
  <div class="full-image" style="margin: 40px 0;">
    <img src="https://images.pexels.com/photos/1390403/pexels-photo-1390403.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="활용예시" crossorigin="anonymous">
  </div>
  
  <div class="usage-grid">
    <div class="usage-item">
      <div class="usage-emoji">👜</div>
      <div class="usage-title">Daily Bag</div>
      <div class="usage-desc">
        매일 메는 가방에 포인트로!<br>
        심플한 백도 특별해져요
      </div>
    </div>
    <div class="usage-item">
      <div class="usage-emoji">🎁</div>
      <div class="usage-title">Perfect Gift</div>
      <div class="usage-desc">
        소중한 사람에게 전하는<br>
        센스있는 크리스마스 선물
      </div>
    </div>
    <div class="usage-item">
      <div class="usage-emoji">🎄</div>
      <div class="usage-title">X-mas Deco</div>
      <div class="usage-desc">
        트리나 방에 걸어두면<br>
        분위기 UP! UP!
      </div>
    </div>
    <div class="usage-item">
      <div class="usage-emoji">👯‍♀️</div>
      <div class="usage-title">Friendship</div>
      <div class="usage-desc">
        베프와 하나씩 나눠 갖는<br>
        우정템으로 최고!
      </div>
    </div>
  </div>
</div>

<!-- 패키지 이미지 -->
<div class="full-image">
  <img src="https://images.pexels.com/photos/6608518/pexels-photo-6608518.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="패키지1" crossorigin="anonymous">
</div>

<div class="full-image">
  <img src="https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=1260" alt="패키지2" crossorigin="anonymous">
</div>

<!-- MD 추천 -->
<div class="recommend-section">
  <div class="recommend-badge">MD's PICK</div>
  <div class="recommend-text">
    키링 100개는 있는데도<br>
    또 사고 싶은 그 마음, 알아요!<br><br>
    
    뽀글이는 정말 다르거든요<br>
    매일 보고 싶은, 자꾸 만지고 싶은<br>
    
    <strong>진짜 내 친구가 되어줄 키링 💕</strong>
  </div>
</div>

<!-- 제품 정보 -->
<div class="info-section">
  <h2 class="section-title" style="text-align: center; margin-bottom: 40px;">Product Info</h2>
  
  <div class="info-card">
    <table class="info-table">
      <tr>
        <td>제품명</td>
        <td>뽀글이 댕댕이 키링 (2종)</td>
      </tr>
      <tr>
        <td>소재</td>
        <td>극세사 벨벳, PP코튼, 면 혼방</td>
      </tr>
      <tr>
        <td>사이즈</td>
        <td>산타: 약 12 x 11cm / 눈꽃: 약 12.5 x 8.5cm</td>
      </tr>
      <tr>
        <td>구성</td>
        <td>키링 본체 + 체크 하트 참 + 로프 스트랩</td>
      </tr>
      <tr>
        <td>패키지</td>
        <td>개별 OPP 포장 (선물하기 좋아요!)</td>
      </tr>
      <tr>
        <td>배송</td>
        <td>평일 기준 1-2일 이내 발송</td>
      </tr>
    </table>
  </div>
</div>

<!-- 주의사항 -->
<div class="notice-section">
  <h3 class="notice-title">💌 구매 전 체크해주세요</h3>
  <ul class="notice-list">
    <li>수제 봉제품 특성상 개체별로 미세한 차이가 있을 수 있어요</li>
    <li>오염 시 물티슈로 가볍게 닦아주세요</li>
    <li>사이즈는 1~2cm 오차가 있을 수 있어요</li>
    <li>모니터에 따라 색상이 조금 다를 수 있어요</li>
    <li>14세 이상 사용 권장 제품이에요</li>
  </ul>
</div>

<!-- 푸터 -->
<div class="footer-section">
  <div class="footer-logo">Fluffy Friends</div>
  <p class="footer-text">작은 친구와 함께하는 행복한 일상</p>
  <div class="footer-emoji">💕</div>
</div>

</div>

</body>
</html>
`;

export const INITIAL_JSON_INPUT = `{
  "project": "뽀글이 댕댕이 키링",
  "description": "Fluffy Puppy Collection",
  "blocks": [
    {
      "block_id": "hero",
      "type": "hero_section",
      "brandTag": "NEW ARRIVAL",
      "mainTitle": "Fluffy Puppy Keyring",
      "subTitle": "나만의 작은 친구, 뽀글이 댕댕이를 만나보세요",
      "emojiDeco": "🐶💕🎄"
    },
    {
      "block_id": "main-image-1",
      "type": "full_image",
      "src": "https://images.pexels.com/photos/4588035/pexels-photo-4588035.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "alt": "뽀글이 댕댕이 메인",
      "sticker": { "text": "HOT!", "position": "top-right" }
    },
    {
      "block_id": "catch",
      "type": "catch_phrase",
      "lines": [
        "<span class=\\"catch-highlight\\">매일매일</span> 보고 싶은",
        "<span class=\\"catch-highlight\\">세상에서 제일</span> 귀여운",
        "나만의 뽀글이 친구 🎀"
      ]
    },
    {
      "block_id": "product-image-1",
      "type": "full_image",
      "src": "https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "alt": "제품 전체"
    },
    {
      "block_id": "product-image-2",
      "type": "full_image",
      "src": "https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "alt": "제품 감성컷"
    },
    {
      "block_id": "story",
      "type": "story_card",
      "badge": { "icon": "🌟", "text": "BRAND STORY" },
      "mainText": "하루하루 바쁜 일상 속에서<br>문득 나를 보고 웃어주는 작은 친구가 있다면?<br><br><strong>뽀글이 댕댕이</strong>는 당신의 가방, 파우치, 열쇠고리에<br>매달려 언제나 당신과 함께해요",
      "pointText": "\\"오늘도 수고했어, 내일은 더 좋은 날이 될거야\\" 🌸<br>작은 위로가 되어줄 나만의 반려 키링"
    },
    {
      "block_id": "choice",
      "type": "choice_section",
      "title": "Choose Your Buddy",
      "subtitle": "어떤 친구가 마음에 드시나요?",
      "choices": [
        { "label": "Type A", "imgSrc": "https://images.pexels.com/photos/3361739/pexels-photo-3361739.jpeg?auto=compress&cs=tinysrgb&w=800", "imgAlt": "산타 댕댕이", "name": "🎅 산타 댕댕이" },
        { "label": "Type B", "imgSrc": "https://images.pexels.com/photos/3725403/pexels-photo-3725403.jpeg?auto=compress&cs=tinysrgb&w=800", "imgAlt": "눈꽃 댕댕이", "name": "❄️ 눈꽃 댕댕이" }
      ]
    },
    {
      "block_id": "points",
      "type": "points_section",
      "title": "Why So Special?",
      "subtitle": "뽀글이가 특별한 이유",
      "points": [
        { "icon": "✨", "title": "심쿵 비주얼", "description": "살포시 감은 눈과<br>발그레한 볼터치까지<br>디테일 하나하나 완벽해요" },
        { "icon": "🎀", "title": "몽글몽글 촉감", "description": "극세사 벨벳 소재로<br>만질 때마다 기분 좋은<br>포근포근한 촉감" },
        { "icon": "💝", "title": "어디든 OK", "description": "가방, 파우치, 차키 등<br>어디에 달아도 찰떡!<br>12cm 완벽 사이즈" }
      ]
    },
    {
      "block_id": "size-image",
      "type": "full_image",
      "src": "https://images.pexels.com/photos/2023384/pexels-photo-2023384.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "alt": "사이즈 정보"
    },
    {
      "block_id": "details",
      "type": "detail_section",
      "title": "Detail Check",
      "items": [
        { "label": "POINT 01", "title": "요정처럼 사랑스러운 표정", "text": "크리스마스를 기다리는 설렘 가득한 표정!<br>깜찍한 고깔모자와 체크 하트 참까지, 보는 것만으로도 행복해져요", "imgSrc": "https://images.pexels.com/photos/103523/pexels-photo-103523.jpeg?auto=compress&cs=tinysrgb&w=1260", "imgAlt": "디테일1" },
        { "label": "POINT 02", "title": "자꾸만 만지고 싶은 보들보들", "text": "극세사 벨벳의 부드러운 감촉과 탄탄한 PP코튼 충전재<br>스트레스 받을 때 꾹꾹 누르면 힐링돼요", "imgSrc": "https://images.pexels.com/photos/994196/pexels-photo-994196.jpeg?auto=compress&cs=tinysrgb&w=1260", "imgAlt": "디테일2" },
        { "label": "POINT 03", "title": "튼튼한 로프 스트랩", "text": "꼬임이 탄탄한 로프로 어디든 쉽게 연결!<br>꼼꼼한 마감으로 오래오래 함께해요", "imgSrc": "https://images.pexels.com/photos/220938/pexels-photo-220938.jpeg?auto=compress&cs=tinysrgb&w=1260", "imgAlt": "디테일3" }
      ]
    },
    {
      "block_id": "usage",
      "type": "usage_section",
      "title": "How to Style",
      "subtitle": "뽀글이와 함께하는 일상",
      "mainImage": { "src": "https://images.pexels.com/photos/1390403/pexels-photo-1390403.jpeg?auto=compress&cs=tinysrgb&w=1260", "alt": "활용예시" },
      "items": [
        { "emoji": "👜", "title": "Daily Bag", "description": "매일 메는 가방에 포인트로!<br>심플한 백도 특별해져요" },
        { "emoji": "🎁", "title": "Perfect Gift", "description": "소중한 사람에게 전하는<br>센스있는 크리스마스 선물" },
        { "emoji": "🎄", "title": "X-mas Deco", "description": "트리나 방에 걸어두면<br>분위기 UP! UP!" },
        { "emoji": "👯‍♀️", "title": "Friendship", "description": "베프와 하나씩 나눠 갖는<br>우정템으로 최고!" }
      ]
    },
    {
      "block_id": "package-image-1",
      "type": "full_image",
      "src": "https://images.pexels.com/photos/6608518/pexels-photo-6608518.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "alt": "패키지1"
    },
    {
      "block_id": "package-image-2",
      "type": "full_image",
      "src": "https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=1260",
      "alt": "패키지2"
    },
    {
      "block_id": "recommend",
      "type": "recommend_section",
      "badge": "MD's PICK",
      "text": "키링 100개는 있는데도<br>또 사고 싶은 그 마음, 알아요!<br><br>뽀글이는 정말 다르거든요<br>매일 보고 싶은, 자꾸 만지고 싶은<br><strong>진짜 내 친구가 되어줄 키링 💕</strong>"
    },
    {
      "block_id": "video-testimonial-1",
      "type": "video_testimonial",
      "title": "실제 사용 후기 💬",
      "videoUrl": "https://www.youtube.com/embed/IVcT-fey9Xo",
      "quote": "정말 너무 귀여워서 매일 가지고 다녀요! 친구들도 다들 어디서 샀냐고 물어봐요. 퀄리티도 정말 좋고, 만질 때마다 기분이 좋아져요. 강력 추천합니다!",
      "author": "김민지, 뽀글이 댕댕이 첫 구매자"
    },
    {
      "block_id": "info",
      "type": "info_section",
      "title": "Product Info",
      "rows": [
        { "key": "제품명", "value": "뽀글이 댕댕이 키링 (2종)" },
        { "key": "소재", "value": "극세사 벨벳, PP코튼, 면 혼방" },
        { "key": "사이즈", "value": "산타: 약 12 x 11cm / 눈꽃: 약 12.5 x 8.5cm" },
        { "key": "구성", "value": "키링 본체 + 체크 하트 참 + 로프 스트랩" },
        { "key": "패키지", "value": "개별 OPP 포장 (선물하기 좋아요!)" },
        { "key": "배송", "value": "평일 기준 1-2일 이내 발송" }
      ]
    },
    {
      "block_id": "notice",
      "type": "notice_section",
      "title": "💌 구매 전 체크해주세요",
      "items": [
        "수제 봉제품 특성상 개체별로 미세한 차이가 있을 수 있어요",
        "오염 시 물티슈로 가볍게 닦아주세요",
        "사이즈는 1~2cm 오차가 있을 수 있어요",
        "모니터에 따라 색상이 조금 다를 수 있어요",
        "14세 이상 사용 권장 제품이에요"
      ]
    },
    {
      "block_id": "footer",
      "type": "footer_section",
      "logo": "Fluffy Friends",
      "text": "작은 친구와 함께하는 행복한 일상",
      "emoji": "💕"
    }
  ]
}
`;