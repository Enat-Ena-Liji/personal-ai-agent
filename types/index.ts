// types/index.ts
export interface User {
  _id: string;
  tokenIdentifier: string;
  email: string;
  name: string;
  imageUrl?: string;
  credits: number;
  createdAt: number;
  updatedAt: number;
}

export interface Platform {
  _id: string;
  userId: string;
  platform: string;
  accountId: string;
  accountEmail?: string;
  accountName?: string;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  lastSync?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: User | null;
  platforms?: Platform[];
  clerkId?: string;
  tokenReceived?: boolean;
  debug?: {
    userId: string;
    tokenLength: number;
  };
}