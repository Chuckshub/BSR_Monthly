import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Account, ChartOfAccounts } from '@/types';
import { defaultAccounts } from '@/data/defaultAccounts';

export class AccountsService {
  static async initializeDefaultAccounts(userId: string): Promise<void> {
    if (!db) {
      console.warn('Firebase not initialized, using default accounts');
      return;
    }
    
    const chartRef = doc(db, 'charts', userId);
    const chartDoc = await getDoc(chartRef);
    
    if (!chartDoc.exists()) {
      const accounts: Account[] = defaultAccounts.map((account, index) => ({
        ...account,
        id: `account_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const chartOfAccounts: ChartOfAccounts = {
        userId,
        accounts,
        lastUpdated: new Date(),
      };

      await setDoc(chartRef, {
        ...chartOfAccounts,
        lastUpdated: Timestamp.fromDate(chartOfAccounts.lastUpdated),
        accounts: accounts.map(account => ({
          ...account,
          createdAt: Timestamp.fromDate(account.createdAt),
          updatedAt: Timestamp.fromDate(account.updatedAt),
        })),
      });
    }
  }

  static async getChartOfAccounts(userId: string): Promise<ChartOfAccounts | null> {
    if (!db) {
      // Return default accounts when Firebase is not available
      const accounts: Account[] = defaultAccounts.map((account, index) => ({
        ...account,
        id: `account_${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      return {
        userId,
        accounts,
        lastUpdated: new Date(),
      };
    }
    
    const chartRef = doc(db, 'charts', userId);
    const chartDoc = await getDoc(chartRef);
    
    if (chartDoc.exists()) {
      const data = chartDoc.data();
      return {
        userId: data.userId,
        lastUpdated: data.lastUpdated.toDate(),
        accounts: data.accounts.map((account: Record<string, unknown>) => ({
          ...account,
          createdAt: (account.createdAt as { toDate: () => Date }).toDate(),
          updatedAt: (account.updatedAt as { toDate: () => Date }).toDate(),
        })),
      };
    }
    
    return null;
  }

  static async addAccount(userId: string, account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) {
      console.warn('Firebase not initialized, cannot add account');
      return 'mock-id';
    }
    
    const chartRef = doc(db, 'charts', userId);
    const chartDoc = await getDoc(chartRef);
    
    if (chartDoc.exists()) {
      const data = chartDoc.data();
      const accounts = data.accounts || [];
      
      const newAccount: Account = {
        ...account,
        id: `account_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      accounts.push({
        ...newAccount,
        createdAt: Timestamp.fromDate(newAccount.createdAt),
        updatedAt: Timestamp.fromDate(newAccount.updatedAt),
      });
      
      await updateDoc(chartRef, {
        accounts,
        lastUpdated: Timestamp.fromDate(new Date()),
      });
      
      return newAccount.id;
    }
    
    throw new Error('Chart of accounts not found');
  }

  static async updateAccount(userId: string, accountId: string, updates: Partial<Account>): Promise<void> {
    if (!db) {
      console.warn('Firebase not initialized, cannot update account');
      return;
    }
    
    const chartRef = doc(db, 'charts', userId);
    const chartDoc = await getDoc(chartRef);
    
    if (chartDoc.exists()) {
      const data = chartDoc.data();
      const accounts = data.accounts || [];
      
      const accountIndex = accounts.findIndex((acc: Record<string, unknown>) => acc.id === accountId);
      if (accountIndex !== -1) {
        accounts[accountIndex] = {
          ...accounts[accountIndex],
          ...updates,
          updatedAt: Timestamp.fromDate(new Date()),
        };
        
        await updateDoc(chartRef, {
          accounts,
          lastUpdated: Timestamp.fromDate(new Date()),
        });
      } else {
        throw new Error('Account not found');
      }
    } else {
      throw new Error('Chart of accounts not found');
    }
  }

  static async deactivateAccount(userId: string, accountId: string): Promise<void> {
    await this.updateAccount(userId, accountId, { isActive: false });
  }

  static async getActiveAccounts(userId: string): Promise<Account[]> {
    const chart = await this.getChartOfAccounts(userId);
    return chart?.accounts.filter(account => account.isActive) || [];
  }

  static async getAccountsByCategory(userId: string, category: string): Promise<Account[]> {
    const chart = await this.getChartOfAccounts(userId);
    return chart?.accounts.filter(account => account.category === category && account.isActive) || [];
  }
}