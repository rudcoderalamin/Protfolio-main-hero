export interface PortfolioMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  createdAt: string;
  read: boolean;
}
