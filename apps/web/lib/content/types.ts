export interface ContentMetadata {
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  slug: string;
}

export interface BlogPost extends ContentMetadata {
  type: 'blog';
}

export interface MarketingPage extends ContentMetadata {
  type: 'marketing';
}

export type ContentItem = BlogPost | MarketingPage;
