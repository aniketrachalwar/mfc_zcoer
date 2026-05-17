export interface Project {
  id: string;
  title: string;
  desc: string;
  details: string;
  tech: string[];
  img: string;
  demoUrl?: string;
  githubUrl?: string;
  status: 'active' | 'draft';
  createdAt: number;
  updatedAt?: number;
  createdBy?: string;
}
