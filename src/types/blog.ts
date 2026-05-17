export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string; // The rich text or long text content
  tags: string[];
  authorId: string;
  authorName: string;
  date: string;
  readTime: string;
  img: string; // cover image URL
  status: 'pending' | 'approved';
  createdAt: number;
  republishCount?: number;
}
