export interface Account {
  id: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountBalance {
  id: string;
  accountId: string;
  userId: string;
  year: number;
  month: number;
  balance: number;
  previousBalance?: number;
  variance?: number;
  variancePercent?: number;
  notes?: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyReconciliation {
  id: string;
  userId: string;
  year: number;
  month: number;
  status: ReconciliationStatus;
  balances: AccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isFinalized: boolean;
  finalizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 
  | 'Bank'
  | 'Accounts Receivable'
  | 'Other Current Asset'
  | 'Fixed Assets'
  | 'Other Assets'
  | 'Accounts Payable'
  | 'Credit Card'
  | 'Other Current Liability'
  | 'Long Term Liabilities'
  | 'Equity'
  | 'Retained Earnings'
  | 'Net Income';

export type AccountCategory = 
  | 'Current Assets'
  | 'Fixed Assets'
  | 'Other Assets'
  | 'Current Liabilities'
  | 'Long Term Liabilities'
  | 'Equity';

export type ReconciliationStatus = 
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'finalized';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ChartOfAccounts {
  userId: string;
  accounts: Account[];
  lastUpdated: Date;
}