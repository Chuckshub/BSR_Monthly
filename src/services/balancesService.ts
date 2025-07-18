import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccountBalance, MonthlyReconciliation } from '@/types';

export class BalancesService {
  static async getMonthlyReconciliation(userId: string, year: number, month: number): Promise<MonthlyReconciliation | null> {
    const reconciliationRef = doc(db, 'reconciliations', `${userId}_${year}_${month}`);
    const reconciliationDoc = await getDoc(reconciliationRef);
    
    if (reconciliationDoc.exists()) {
      const data = reconciliationDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        finalizedAt: data.finalizedAt?.toDate(),
        balances: data.balances.map((balance: Record<string, unknown>) => ({
          ...balance,
          createdAt: (balance.createdAt as { toDate: () => Date }).toDate(),
          updatedAt: (balance.updatedAt as { toDate: () => Date }).toDate(),
        })),
      } as MonthlyReconciliation;
    }
    
    return null;
  }

  static async getPreviousMonthReconciliation(userId: string, year: number, month: number): Promise<MonthlyReconciliation | null> {
    let prevYear = year;
    let prevMonth = month - 1;
    
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    return this.getMonthlyReconciliation(userId, prevYear, prevMonth);
  }

  static async saveMonthlyReconciliation(reconciliation: MonthlyReconciliation): Promise<void> {
    const reconciliationRef = doc(db, 'reconciliations', `${reconciliation.userId}_${reconciliation.year}_${reconciliation.month}`);
    
    const dataToSave = {
      ...reconciliation,
      createdAt: Timestamp.fromDate(reconciliation.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
      finalizedAt: reconciliation.finalizedAt ? Timestamp.fromDate(reconciliation.finalizedAt) : null,
      balances: reconciliation.balances.map(balance => ({
        ...balance,
        createdAt: Timestamp.fromDate(balance.createdAt),
        updatedAt: Timestamp.fromDate(new Date()),
      })),
    };
    
    await setDoc(reconciliationRef, dataToSave);
  }

  static async updateAccountBalance(
    userId: string,
    year: number,
    month: number,
    accountId: string,
    balance: number,
    notes?: string
  ): Promise<void> {
    const reconciliation = await this.getMonthlyReconciliation(userId, year, month);
    
    if (reconciliation) {
      const balanceIndex = reconciliation.balances.findIndex(b => b.accountId === accountId);
      
      if (balanceIndex !== -1) {
        reconciliation.balances[balanceIndex].balance = balance;
        reconciliation.balances[balanceIndex].notes = notes;
        reconciliation.balances[balanceIndex].updatedAt = new Date();
      } else {
        // Add new balance entry
        const newBalance: AccountBalance = {
          id: `balance_${Date.now()}`,
          accountId,
          userId,
          year,
          month,
          balance,
          notes,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        reconciliation.balances.push(newBalance);
      }
      
      // Calculate variances
      await this.calculateVariances(reconciliation);
      
      // Update totals
      this.calculateTotals(reconciliation);
      
      await this.saveMonthlyReconciliation(reconciliation);
    }
  }

  static async createNewReconciliation(
    userId: string,
    year: number,
    month: number,
    accountIds: string[]
  ): Promise<MonthlyReconciliation> {
    const previousReconciliation = await this.getPreviousMonthReconciliation(userId, year, month);
    
    const balances: AccountBalance[] = accountIds.map(accountId => {
      const previousBalance = previousReconciliation?.balances.find(b => b.accountId === accountId);
      
      return {
        id: `balance_${accountId}_${Date.now()}`,
        accountId,
        userId,
        year,
        month,
        balance: 0,
        previousBalance: previousBalance?.balance || 0,
        variance: 0,
        variancePercent: 0,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    
    const reconciliation: MonthlyReconciliation = {
      id: `${userId}_${year}_${month}`,
      userId,
      year,
      month,
      status: 'draft',
      balances,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      isFinalized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.saveMonthlyReconciliation(reconciliation);
    return reconciliation;
  }

  static async finalizeReconciliation(userId: string, year: number, month: number): Promise<void> {
    const reconciliation = await this.getMonthlyReconciliation(userId, year, month);
    
    if (reconciliation) {
      reconciliation.isFinalized = true;
      reconciliation.finalizedAt = new Date();
      reconciliation.status = 'finalized';
      
      // Lock all balances
      reconciliation.balances.forEach(balance => {
        balance.isLocked = true;
      });
      
      await this.saveMonthlyReconciliation(reconciliation);
    }
  }

  private static async calculateVariances(reconciliation: MonthlyReconciliation): Promise<void> {
    const previousReconciliation = await this.getPreviousMonthReconciliation(
      reconciliation.userId,
      reconciliation.year,
      reconciliation.month
    );
    
    reconciliation.balances.forEach(balance => {
      const previousBalance = previousReconciliation?.balances.find(b => b.accountId === balance.accountId);
      
      if (previousBalance) {
        balance.previousBalance = previousBalance.balance;
        balance.variance = balance.balance - previousBalance.balance;
        balance.variancePercent = previousBalance.balance !== 0 
          ? (balance.variance / Math.abs(previousBalance.balance)) * 100 
          : 0;
      } else {
        balance.previousBalance = 0;
        balance.variance = balance.balance;
        balance.variancePercent = 0;
      }
    });
  }

  private static calculateTotals(reconciliation: MonthlyReconciliation): void {
    // This would need to be implemented based on your chart of accounts structure
    // For now, we'll set them to 0
    reconciliation.totalAssets = 0;
    reconciliation.totalLiabilities = 0;
    reconciliation.totalEquity = 0;
  }

  static async getReconciliationHistory(userId: string, limit: number = 12): Promise<MonthlyReconciliation[]> {
    const reconciliationsRef = collection(db, 'reconciliations');
    const q = query(
      reconciliationsRef,
      where('userId', '==', userId),
      orderBy('year', 'desc'),
      orderBy('month', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reconciliations: MonthlyReconciliation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reconciliations.push({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        finalizedAt: data.finalizedAt?.toDate(),
        balances: data.balances.map((balance: Record<string, unknown>) => ({
          ...balance,
          createdAt: (balance.createdAt as { toDate: () => Date }).toDate(),
          updatedAt: (balance.updatedAt as { toDate: () => Date }).toDate(),
        })),
      } as MonthlyReconciliation);
    });
    
    return reconciliations.slice(0, limit);
  }
}