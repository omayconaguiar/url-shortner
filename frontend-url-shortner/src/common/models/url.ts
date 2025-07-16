export interface User {
    id: string;
    email: string;
    name: string;
  }
  
  export interface Url {
    id: string;
    originalUrl: string;
    slug: string;
    userId?: string;
    user?: User;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    _count: {
      visits: number;
    };
  }
  
  export interface Visit {
    id: string;
    urlId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    createdAt: string;
  }
  
  export interface UrlStats {
    slug: string;
    originalUrl: string;
    totalVisits: number;
    createdAt: string;
    lastVisit: string | null;
  }
  
  export interface DashboardStats {
    totalUrls: number;
    totalVisits: number;
    topUrls: {
      slug: string;
      originalUrl: string;
      visits: number;
      createdAt: string;
    }[];
  }