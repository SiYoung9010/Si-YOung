import type { 
    ProductPlan, 
    Block,
    HeroSectionBlock,
    FullImageBlock,
    CatchPhraseBlock,
    StoryCardBlock,
    ChoiceSectionBlock,
    PointsSectionBlock,
    DetailSectionBlock,
    UsageSectionBlock,
    RecommendSectionBlock,
    InfoSectionBlock,
    NoticeSectionBlock,
    FooterSectionBlock,
    VideoTestimonialBlock
} from '../types';

const FONT_MAP: { [key: string]: { family: string; weights: string; name: string } } = {
  'Noto Sans KR': { family: 'Noto+Sans+KR', weights: '400,700,900', name: "'Noto Sans KR'" },
  'Gothic A1': { family: 'Gothic+A1', weights: '400,700,900', name: "'Gothic A1'" },
  'Nanum Gothic': { family: 'Nanum+Gothic', weights: '400,700,800', name: "'Nanum Gothic'" },
  'Nanum Myeongjo': { family: 'Nanum+Myeongjo', weights: '400,700,800', name: "'Nanum Myeongjo'" },
  'IBM Plex Sans KR': { family: 'IBM+Plex+Sans+KR', weights: '400,500,700', name: "'IBM Plex Sans KR'" },
};


const generateHead = (plan: ProductPlan, fontName: string): string => {
  const selectedFont = FONT_MAP[fontName] || FONT_MAP['Noto Sans KR'];
  const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.family}:wght@${selectedFont.weights}&family=Quicksand:wght@400;600;700&display=swap`;
  
  return `
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${plan.project} - ${plan.description}</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontUrl}" rel="stylesheet" crossorigin="anonymous">

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${selectedFont.name}, sans-serif;
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

/* Carousel Section */
.carousel-container {
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.carousel-track-container {
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  position: relative;
}

.carousel-slide img {
  width: 100%;
  height: auto;
  display: block;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #FF69B4;
  opacity: 0;
  transition: opacity 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.carousel-container:hover .carousel-button {
  opacity: 1;
}

.carousel-button.prev {
  left: 15px;
}

.carousel-button.next {
  right: 15px;
}

.carousel-nav {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  border: 2px solid #FFB3D9;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0;
}

.carousel-dot.active {
  background-color: #FF69B4;
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

/* Video Testimonial Section */
.video-testimonial-section {
  padding: 100px 20px;
  background: white;
  text-align: center;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  max-width: 800px;
  margin: 40px auto;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.testimonial-quote {
  font-size: 20px;
  line-height: 1.8;
  color: #666;
  max-width: 700px;
  margin: 40px auto 20px;
  font-style: italic;
  position: relative;
  padding: 0 40px;
}

.testimonial-quote::before,
.testimonial-quote::after {
  content: '"';
  font-family: 'Quicksand', sans-serif;
  font-size: 48px;
  color: #FFB3D9;
  position: absolute;
  line-height: 1;
}

.testimonial-quote::before {
  top: -10px;
  left: 0;
}

.testimonial-quote::after {
  bottom: -20px;
  right: 0;
}

.testimonial-author {
  font-size: 16px;
  font-weight: 700;
  color: #FF69B4;
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

  .carousel-container:hover .carousel-button {
    opacity: 0.6;
  }
}
</style>
</head>
  `;
};

const renderCarouselBlock = (blocks: FullImageBlock[], carouselId: string): string => {
    const slidesHtml = blocks.map(img => {
        const stickerHtml = img.sticker ? `<div class="sticker ${img.sticker.position}">${img.sticker.text}</div>` : '';
        const containerClass = img.sticker ? 'image-with-sticker' : '';
        return `
            <div class="carousel-slide ${containerClass}">
                ${stickerHtml}
                <img src="${img.src}" alt="${img.alt}" crossorigin="anonymous">
            </div>
        `;
    }).join('');

    const dotsHtml = blocks.map((_, index) => `<button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`).join('');

    return `
        <div id="${carouselId}" class="carousel-container" role="region" aria-label="Image Carousel">
            <div class="carousel-track-container">
                <div class="carousel-track">${slidesHtml}</div>
            </div>
            <button class="carousel-button prev" aria-label="Previous Slide">‹</button>
            <button class="carousel-button next" aria-label="Next Slide">›</button>
            <div class="carousel-nav">${dotsHtml}</div>
        </div>
    `;
};

const renderBlock = (block: Block): string => {
    switch (block.type) {
        case 'hero_section':
            const hero = block as HeroSectionBlock;
            return `
                <div class="hero-section">
                  <div class="brand-tag">${hero.brandTag}</div>
                  <h1 class="main-title">${hero.mainTitle}</h1>
                  <p class="sub-title">${hero.subTitle}</p>
                  <div class="emoji-deco">${hero.emojiDeco}</div>
                </div>`;
        
        case 'full_image':
            const img = block as FullImageBlock;
            const stickerHtml = img.sticker ? `<div class="sticker ${img.sticker.position}">${img.sticker.text}</div>` : '';
            const containerClass = img.sticker ? 'image-with-sticker' : '';
            return `
                <div class="full-image ${containerClass}">
                  ${stickerHtml}
                  <img src="${img.src}" alt="${img.alt}" crossorigin="anonymous">
                </div>`;
        
        case 'catch_phrase':
            const cp = block as CatchPhraseBlock;
            return `
                <div class="catch-section">
                  <div class="catch-bubble">
                    <div class="catch-text">
                      ${cp.lines.join('<br>')}
                    </div>
                  </div>
                </div>`;

        case 'story_card':
            const story = block as StoryCardBlock;
            return `
                <div class="story-card">
                  <div class="story-badge">
                    <span>${story.badge.icon}</span>
                    <span>${story.badge.text}</span>
                  </div>
                  <div class="story-main">
                    ${story.mainText}
                  </div>
                  <div class="story-point">
                    ${story.pointText}
                  </div>
                </div>`;
        
        case 'choice_section':
            const choice = block as ChoiceSectionBlock;
            return `
                <div class="choice-section">
                  <h2 class="section-title">${choice.title}</h2>
                  <p class="section-subtitle">${choice.subtitle}</p>
                  <div class="choice-grid">
                    ${choice.choices.map(c => `
                        <div class="choice-card">
                          <div class="choice-label">${c.label}</div>
                          <img src="${c.imgSrc}" alt="${c.imgAlt}" crossorigin="anonymous">
                          <div class="choice-name">${c.name}</div>
                        </div>
                    `).join('')}
                  </div>
                </div>`;
        
        case 'points_section':
            const points = block as PointsSectionBlock;
            return `
                <div class="points-section">
                  <div class="points-header">
                    <h2 class="section-title">${points.title}</h2>
                    <p class="section-subtitle">${points.subtitle}</p>
                  </div>
                  <div class="points-grid">
                    ${points.points.map(p => `
                        <div class="point-item">
                          <div class="point-icon">${p.icon}</div>
                          <div class="point-title">${p.title}</div>
                          <div class="point-desc">${p.description}</div>
                        </div>
                    `).join('')}
                  </div>
                </div>`;

        case 'detail_section':
            const detail = block as DetailSectionBlock;
            return `
                <div class="detail-section">
                  <h2 class="section-title" style="text-align: center; margin-bottom: 60px;">${detail.title}</h2>
                  ${detail.items.map(item => `
                    <div class="detail-item">
                      <div class="detail-content">
                        <span class="detail-label">${item.label}</span>
                        <h3 class="detail-title">${item.title}</h3>
                        <p class="detail-text">${item.text}</p>
                      </div>
                      <img src="${item.imgSrc}" alt="${item.imgAlt}" crossorigin="anonymous">
                    </div>
                  `).join('')}
                </div>`;

        case 'usage_section':
            const usage = block as UsageSectionBlock;
            const mainImageHtml = usage.mainImage ? `<div class="full-image" style="margin: 40px 0;"><img src="${usage.mainImage.src}" alt="${usage.mainImage.alt}" crossorigin="anonymous"></div>` : '';
            return `
                <div class="usage-section">
                    <h2 class="section-title">${usage.title}</h2>
                    <p class="section-subtitle">${usage.subtitle}</p>
                    ${mainImageHtml}
                    <div class="usage-grid">
                        ${usage.items.map(item => `
                            <div class="usage-item">
                                <div class="usage-emoji">${item.emoji}</div>
                                <div class="usage-title">${item.title}</div>
                                <div class="usage-desc">${item.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        
        case 'recommend_section':
            const rec = block as RecommendSectionBlock;
            return `
                <div class="recommend-section">
                    <div class="recommend-badge">${rec.badge}</div>
                    <div class="recommend-text">${rec.text}</div>
                </div>`;

        case 'video_testimonial':
            const video = block as VideoTestimonialBlock;
            return `
                <div class="video-testimonial-section">
                    <h2 class="section-title">${video.title}</h2>
                    <div class="video-wrapper">
                        <iframe
                            src="${video.videoUrl}"
                            title="Video Testimonial"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    </div>
                    <p class="testimonial-quote">${video.quote}</p>
                    <p class="testimonial-author">- ${video.author}</p>
                </div>`;

        case 'info_section':
            const info = block as InfoSectionBlock;
            return `
                <div class="info-section">
                  <h2 class="section-title" style="text-align: center; margin-bottom: 40px;">${info.title}</h2>
                  <div class="info-card">
                    <table class="info-table">
                        ${info.rows.map(row => `
                            <tr>
                                <td>${row.key}</td>
                                <td>${row.value}</td>
                            </tr>
                        `).join('')}
                    </table>
                  </div>
                </div>`;
        
        case 'notice_section':
            const notice = block as NoticeSectionBlock;
            return `
                <div class="notice-section">
                    <h3 class="notice-title">${notice.title}</h3>
                    <ul class="notice-list">
                        ${notice.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>`;
        
        case 'footer_section':
            const footer = block as FooterSectionBlock;
            return `
                <div class="footer-section">
                    <div class="footer-logo">${footer.logo}</div>
                    <p class="footer-text">${footer.text}</p>
                    <div class="footer-emoji">${footer.emoji}</div>
                </div>`;

        default:
            return `<!-- Unknown block type -->`;
    }
};

const generateBody = (blocks: Block[]): string => {
    let bodyContent = '';
    let i = 0;
    let carouselCount = 0;

    while (i < blocks.length) {
        const block = blocks[i];
        
        if (block.type === 'full_image') {
            const imageGroup: FullImageBlock[] = [];
            // Collect all consecutive full_image blocks
            while (i < blocks.length && blocks[i].type === 'full_image') {
                imageGroup.push(blocks[i] as FullImageBlock);
                i++;
            }

            if (imageGroup.length > 1) {
                // Render as a carousel
                const carouselId = `carousel-${carouselCount++}`;
                bodyContent += renderCarouselBlock(imageGroup, carouselId);
            } else {
                // Render as a single image
                try {
                    bodyContent += renderBlock(imageGroup[0]);
                } catch (e) {
                     const blockIdentifier = `ID: ${imageGroup[0].block_id}` || 'Unknown Block';
                     console.error(`Error rendering block '${blockIdentifier}':`, e);
                     bodyContent += `<div style="border: 2px dashed red; padding: 20px; margin: 10px 0; background-color: #fff5f5; color: #c53030; font-family: sans-serif;">
                                        <p style="margin:0; font-weight: bold;">⚠️ ERROR: '${blockIdentifier}' 모듈을 렌더링하는 중 오류가 발생했습니다.</p>
                                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #a02c2c;">Check the developer console for more details.</p>
                                    </div>`;
                }
            }
        } else {
            // Render other block types
            try {
                bodyContent += renderBlock(block);
            } catch (e) {
                const blockIdentifier = `ID: ${block.block_id}` || 'Unknown Block';
                console.error(`Error rendering block '${blockIdentifier}':`, e);
                bodyContent += `<div style="border: 2px dashed red; padding: 20px; margin: 10px 0; background-color: #fff5f5; color: #c53030; font-family: sans-serif;">
                                    <p style="margin:0; font-weight: bold;">⚠️ ERROR: '${blockIdentifier}' 모듈을 렌더링하는 중 오류가 발생했습니다.</p>
                                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #a02c2c;">Check the developer console for more details.</p>
                                </div>`;
            }
            i++;
        }
    }

    const carouselScript = `
    <script>
        function initCarousels() {
            const carousels = document.querySelectorAll('.carousel-container');
            carousels.forEach(carousel => {
                const track = carousel.querySelector('.carousel-track');
                if (!track) return;
                const slides = Array.from(track.children);
                if (slides.length === 0) return;
                const nextButton = carousel.querySelector('.carousel-button.next');
                const prevButton = carousel.querySelector('.carousel-button.prev');
                const dotsNav = carousel.querySelector('.carousel-nav');
                const dots = dotsNav ? Array.from(dotsNav.children) : [];
                let slideWidth = slides[0].getBoundingClientRect().width;
                let currentIndex = 0;

                const updateSlidePosition = (index, withAnimation = true) => {
                    if (withAnimation) {
                        track.style.transition = 'transform 0.5s ease-in-out';
                    } else {
                        track.style.transition = 'none';
                    }
                    track.style.transform = 'translateX(-' + slideWidth * index + 'px)';
                };

                const moveToSlide = (targetIndex) => {
                    updateSlidePosition(targetIndex);
                    if (dots.length > 0) {
                        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');
                        if (dots[targetIndex]) dots[targetIndex].classList.add('active');
                    }
                    currentIndex = targetIndex;
                };

                if (nextButton) {
                    nextButton.addEventListener('click', () => {
                        const newIndex = (currentIndex + 1) % slides.length;
                        moveToSlide(newIndex);
                    });
                }

                if (prevButton) {
                    prevButton.addEventListener('click', () => {
                        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                        moveToSlide(newIndex);
                    });
                }

                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        moveToSlide(index);
                    });
                });
                
                const handleResize = () => {
                    const newSlideWidth = slides[0].getBoundingClientRect().width;
                    if (newSlideWidth > 0) {
                       slideWidth = newSlideWidth;
                       updateSlidePosition(currentIndex, false);
                    }
                };
                
                // Use a timeout to ensure images have loaded and dimensions are correct
                setTimeout(handleResize, 100);
                window.addEventListener('resize', handleResize);
            });
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCarousels);
        } else {
            initCarousels();
        }
    </script>
    `;

    // FIX: Removed backslash that was escaping the template literal backtick.
    return `<body><div class="container">${bodyContent}</div>${carouselScript}</body>`;
};

export const generateHtml = (jsonString: string, fontName: string): string => {
  try {
    const plan: ProductPlan = JSON.parse(jsonString);

    if (!plan.project || !plan.description || !plan.blocks) {
      throw new Error("Invalid JSON structure. Missing 'project', 'description' or 'blocks'.");
    }

    const head = generateHead(plan, fontName);
    const body = generateBody(plan.blocks);

    return `<!DOCTYPE html>\n<html lang="ko">\n${head}\n${body}\n</html>`;
  } catch(e) {
      if (e instanceof SyntaxError) {
          throw new Error(`Invalid JSON format: ${e.message}`);
      }
      throw e;
  }
};