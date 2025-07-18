'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Button,
  Select,
  SelectItem,
  Spinner,
  Chip,
} from '@heroui/react';
import { defaultAccounts } from '@/data/defaultAccounts';
import { Account, MonthlyReconciliation } from '@/types';
import { BalanceEntryForm } from './BalanceEntryForm';
import { ReconciliationSummary } from './ReconciliationSummary';
import { format } from 'date-fns';

const MONTHS = [
  { key: '1', label: 'January' },
  { key: '2', label: 'February' },
  { key: '3', label: 'March' },
  { key: '4', label: 'April' },
  { key: '5', label: 'May' },
  { key: '6', label: 'June' },
  { key: '7', label: 'July' },
  { key: '8', label: 'August' },
  { key: '9', label: 'September' },
  { key: '10', label: 'October' },
  { key: '11', label: 'November' },
  { key: '12', label: 'December' },
];

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return { key: year.toString(), label: year.toString() };
});

export function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [reconciliation, setReconciliation] = useState<MonthlyReconciliation | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('current-assets');

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      loadReconciliation();
    }
  }, [selectedYear, selectedMonth, accounts]);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Load accounts from localStorage or use defaults
      const storedAccounts = localStorage.getItem('bsr_accounts');
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        // Initialize with default accounts
        const accounts: Account[] = defaultAccounts.map((account, index) => ({
          ...account,
          id: `account_${index + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        setAccounts(accounts);
        localStorage.setItem('bsr_accounts', JSON.stringify(accounts));
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReconciliation = async () => {
    try {
      const reconciliationKey = `bsr_reconciliation_${selectedYear}_${selectedMonth}`;
      const storedReconciliation = localStorage.getItem(reconciliationKey);
      
      if (storedReconciliation) {
        const reconciliation = JSON.parse(storedReconciliation);
        // Convert date strings back to Date objects
        reconciliation.createdAt = new Date(reconciliation.createdAt);
        reconciliation.updatedAt = new Date(reconciliation.updatedAt);
        if (reconciliation.finalizedAt) {
          reconciliation.finalizedAt = new Date(reconciliation.finalizedAt);
        }
        reconciliation.balances.forEach((balance: Record<string, unknown>) => {
          balance.createdAt = new Date(balance.createdAt as string);
          balance.updatedAt = new Date(balance.updatedAt as string);
        });
        setReconciliation(reconciliation);
      } else {
        // Create new reconciliation
        const newReconciliation = createNewReconciliation(
          parseInt(selectedYear),
          selectedMonth,
          accounts.map(acc => acc.id)
        );
        setReconciliation(newReconciliation);
        localStorage.setItem(reconciliationKey, JSON.stringify(newReconciliation));
      }
    } catch (error) {
      console.error('Error loading reconciliation:', error);
    }
  };

  const createNewReconciliation = (
    year: number,
    month: number,
    accountIds: string[]
  ): MonthlyReconciliation => {
    const previousReconciliationKey = getPreviousMonthKey(year, month);
    const previousReconciliation = localStorage.getItem(previousReconciliationKey);
    let previousBalances: Record<string, unknown>[] = [];
    
    if (previousReconciliation) {
      const prevData = JSON.parse(previousReconciliation);
      previousBalances = prevData.balances || [];
    }
    
    const balances = accountIds.map(accountId => {
      const previousBalance = previousBalances.find((b: Record<string, unknown>) => b.accountId === accountId);
      
      return {
        id: `balance_${accountId}_${Date.now()}`,
        accountId,
        userId: 'demo-user',
        year,
        month,
        balance: 0,
        previousBalance: (previousBalance?.balance as number) || 0,
        variance: 0,
        variancePercent: 0,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    
    return {
      id: `demo-user_${year}_${month}`,
      userId: 'demo-user',
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
  };

  const getPreviousMonthKey = (year: number, month: number): string => {
    let prevYear = year;
    let prevMonth = month - 1;
    
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    return `bsr_reconciliation_${prevYear}_${prevMonth}`;
  };

  const handleBalanceUpdate = async (accountId: string, balance: number, notes?: string) => {
    if (!reconciliation) return;
    
    try {
      setSaving(true);
      
      const updatedReconciliation = { ...reconciliation };
      const balanceIndex = updatedReconciliation.balances.findIndex(b => b.accountId === accountId);
      
      if (balanceIndex !== -1) {
        updatedReconciliation.balances[balanceIndex] = {
          ...updatedReconciliation.balances[balanceIndex],
          balance,
          notes,
          updatedAt: new Date(),
        };
      }
      
      // Calculate variances
      updatedReconciliation.balances.forEach(bal => {
        if (bal.accountId === accountId) {
          bal.variance = bal.balance - (bal.previousBalance || 0);
          bal.variancePercent = (bal.previousBalance || 0) !== 0 
            ? (bal.variance / Math.abs(bal.previousBalance || 0)) * 100 
            : 0;
        }
      });
      
      setReconciliation(updatedReconciliation);
      
      // Save to localStorage
      const reconciliationKey = `bsr_reconciliation_${selectedYear}_${selectedMonth}`;
      localStorage.setItem(reconciliationKey, JSON.stringify(updatedReconciliation));
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!reconciliation) return;
    
    try {
      setSaving(true);
      
      const finalizedReconciliation = {
        ...reconciliation,
        isFinalized: true,
        finalizedAt: new Date(),
        status: 'finalized' as const,
        balances: reconciliation.balances.map(balance => ({
          ...balance,
          isLocked: true,
        })),
      };
      
      setReconciliation(finalizedReconciliation);
      
      // Save to localStorage
      const reconciliationKey = `bsr_reconciliation_${selectedYear}_${selectedMonth}`;
      localStorage.setItem(reconciliationKey, JSON.stringify(finalizedReconciliation));
    } catch (error) {
      console.error('Error finalizing reconciliation:', error);
    } finally {
      setSaving(false);
    }
  };

  const getAccountsByCategory = (category: string) => {
    return accounts.filter(acc => acc.category === category);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'in_progress': return 'primary';
      case 'review': return 'warning';
      case 'finalized': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet Reconciliation</h1>
          <p className="text-gray-600 mt-1">Monthly financial reconciliation dashboard</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <Select
            label="Year"
            selectedKeys={[selectedYear]}
            onSelectionChange={(keys) => setSelectedYear(Array.from(keys)[0] as string)}
            className="w-32"
          >
            {YEARS.map((year) => (
              <SelectItem key={year.key}>
                {year.label}
              </SelectItem>
            ))}
          </Select>
          
          <Select
            label="Month"
            selectedKeys={[selectedMonth.toString()]}
            onSelectionChange={(keys) => setSelectedMonth(parseInt(Array.from(keys)[0] as string))}
            className="w-40"
          >
            {MONTHS.map((month) => (
              <SelectItem key={month.key}>
                {month.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Status and Actions */}
      {reconciliation && (
        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Chip color={getStatusColor(reconciliation.status)} variant="flat">
                    {reconciliation.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </div>
                
                {reconciliation.finalizedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Finalized</p>
                    <p className="font-medium">
                      {format(reconciliation.finalizedAt, 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="flat"
                  isLoading={saving}
                  onPress={() => loadReconciliation()}
                >
                  Refresh
                </Button>
                
                {!reconciliation.isFinalized && (
                  <Button
                    color="success"
                    isLoading={saving}
                    onPress={handleFinalize}
                  >
                    Finalize Month
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Summary */}
      {reconciliation && (
        <ReconciliationSummary reconciliation={reconciliation} accounts={accounts} />
      )}

      {/* Balance Entry Tabs */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Account Balances</h2>
        </CardHeader>
        <CardBody>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
            }}
          >
            <Tab key="current-assets" title="Current Assets">
              <BalanceEntryForm
                accounts={getAccountsByCategory('Current Assets')}
                reconciliation={reconciliation}
                onBalanceUpdate={handleBalanceUpdate}
                isLocked={reconciliation?.isFinalized || false}
              />
            </Tab>
            
            <Tab key="fixed-assets" title="Fixed Assets">
              <BalanceEntryForm
                accounts={getAccountsByCategory('Fixed Assets')}
                reconciliation={reconciliation}
                onBalanceUpdate={handleBalanceUpdate}
                isLocked={reconciliation?.isFinalized || false}
              />
            </Tab>
            
            <Tab key="other-assets" title="Other Assets">
              <BalanceEntryForm
                accounts={getAccountsByCategory('Other Assets')}
                reconciliation={reconciliation}
                onBalanceUpdate={handleBalanceUpdate}
                isLocked={reconciliation?.isFinalized || false}
              />
            </Tab>
            
            <Tab key="current-liabilities" title="Current Liabilities">
              <BalanceEntryForm
                accounts={getAccountsByCategory('Current Liabilities')}
                reconciliation={reconciliation}
                onBalanceUpdate={handleBalanceUpdate}
                isLocked={reconciliation?.isFinalized || false}
              />
            </Tab>
            
            <Tab key="long-term-liabilities" title="Long Term Liabilities">
              <BalanceEntryForm
                accounts={getAccountsByCategory('Long Term Liabilities')}
                reconciliation={reconciliation}
                onBalanceUpdate={handleBalanceUpdate}
                isLocked={reconciliation?.isFinalized || false}
              />
            </Tab>
            
            <Tab key="equity" title="Equity">
              <BalanceEntryForm
                accounts={getAccountsByCategory('Equity')}
                reconciliation={reconciliation}
                onBalanceUpdate={handleBalanceUpdate}
                isLocked={reconciliation?.isFinalized || false}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}