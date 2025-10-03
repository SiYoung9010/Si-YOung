// The new, simplified type system for the Feedback Studio

// Types for AI Feedback Feature
export interface AiSuggestion {
  category: string;
  suggestion: string;
}

export type AiFeedbackResponse = AiSuggestion[];

// Type for Knowledge Base Feature
export interface Insight {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

// Type for Reference Library Feature
export interface Reference {
  id: string;
  name: string;
  description: string;
  thumbnailDataUrl: string; // base64 data URL
  html: string;
  json: string;
}

// Types for HTML Generation from JSON (New Design System)

export interface BaseBlock {
  block_id: string;
  type: string;
}

export interface HeroSectionBlock extends BaseBlock {
  type: 'hero_section';
  brandTag: string;
  mainTitle: string;
  subTitle: string;
  emojiDeco: string;
}

export interface FullImageBlock extends BaseBlock {
  type: 'full_image';
  src: string;
  alt: string;
  sticker?: {
    text: string;
    position: 'top-right';
  };
}

export interface CatchPhraseBlock extends BaseBlock {
  type: 'catch_phrase';
  lines: string[];
}

export interface StoryCardBlock extends BaseBlock {
  type: 'story_card';
  badge: {
    icon: string;
    text: string;
  };
  mainText: string;
  pointText: string;
}

export interface Choice {
  label: string;
  imgSrc: string;
  imgAlt: string;
  name: string;
}
export interface ChoiceSectionBlock extends BaseBlock {
  type: 'choice_section';
  title: string;
  subtitle: string;
  choices: Choice[];
}

export interface Point {
  icon: string;
  title: string;
  description: string;
}
export interface PointsSectionBlock extends BaseBlock {
  type: 'points_section';
  title: string;
  subtitle: string;
  points: Point[];
}

export interface DetailItem {
  label: string;
  title: string;
  text: string;
  imgSrc: string;
  imgAlt: string;
}
export interface DetailSectionBlock extends BaseBlock {
  type: 'detail_section';
  title: string;
  items: DetailItem[];
}

export interface UsageItem {
  emoji: string;
  title: string;
  description: string;
}
export interface UsageSectionBlock extends BaseBlock {
  type: 'usage_section';
  title: string;
  subtitle: string;
  mainImage?: {
    src: string;
    alt: string;
  };
  items: UsageItem[];
}

export interface RecommendSectionBlock extends BaseBlock {
  type: 'recommend_section';
  badge: string;
  text: string;
}

export interface InfoRow {
  key: string;
  value: string;
}
export interface InfoSectionBlock extends BaseBlock {
  type: 'info_section';
  title: string;
  rows: InfoRow[];
}

export interface NoticeSectionBlock extends BaseBlock {
  type: 'notice_section';
  title: string;
  items: string[];
}

export interface FooterSectionBlock extends BaseBlock {
  type: 'footer_section';
  logo: string;
  text: string;
  emoji: string;
}

export interface VideoTestimonialBlock extends BaseBlock {
  type: 'video_testimonial';
  title: string;
  videoUrl: string; // Embed URL
  quote: string;
  author: string;
}

export type Block =
  | HeroSectionBlock
  | FullImageBlock
  | CatchPhraseBlock
  | StoryCardBlock
  | ChoiceSectionBlock
  | PointsSectionBlock
  | DetailSectionBlock
  | UsageSectionBlock
  | RecommendSectionBlock
  | InfoSectionBlock
  | NoticeSectionBlock
  | FooterSectionBlock
  | VideoTestimonialBlock;

export interface ProductPlan {
  project: string;
  description: string;
  blocks: Block[];
}