'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { AccountsService } from '@/services/accountsService';
import { BalancesService } from '@/services/balancesService';
import { AccountsManager } from '@/components/accounts/AccountsManager';
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
  const [mainTab, setMainTab] = useState('reconciliation');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Initialize default accounts if needed
      await AccountsService.initializeDefaultAccounts('demo-user');
      
      // Load chart of accounts
      const chart = await AccountsService.getChartOfAccounts('demo-user');
      if (chart) {
        setAccounts(chart.accounts.filter(acc => acc.isActive));
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReconciliation = useCallback(async () => {
    try {
      let reconciliation = await BalancesService.getMonthlyReconciliation(
        'demo-user',
        parseInt(selectedYear),
        selectedMonth
      );
      
      if (!reconciliation) {
        // Create new reconciliation
        reconciliation = await BalancesService.createNewReconciliation(
          'demo-user',
          parseInt(selectedYear),
          selectedMonth,
          accounts.map(acc => acc.id)
        );
      }
      
      setReconciliation(reconciliation);
    } catch (error) {
      console.error('Error loading reconciliation:', error);
    }
  }, [selectedYear, selectedMonth, accounts]);

  useEffect(() => {
    if (accounts.length > 0) {
      loadReconciliation();
    }
  }, [accounts, loadReconciliation]);

  const handleBalanceUpdate = async (accountId: string, balance: number, notes?: string) => {
    try {
      setSaving(true);
      await BalancesService.updateAccountBalance(
        'demo-user',
        parseInt(selectedYear),
        selectedMonth,
        accountId,
        balance,
        notes
      );
      
      // Reload reconciliation to get updated data
      await loadReconciliation();
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setSaving(true);
      await BalancesService.finalizeReconciliation(
        'demo-user',
        parseInt(selectedYear),
        selectedMonth
      );
      await loadReconciliation();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Balance Sheet Reconciliation</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-1">Monthly financial reconciliation dashboard</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Chip color={getStatusColor(reconciliation.status)} variant="flat">
                    {reconciliation.status.replace('_', ' ').toUpperCase()}
                  </Chip>
                </div>
                
                {reconciliation.finalizedAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Finalized</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
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

      {/* Main Content Tabs */}
      <Tabs
        selectedKey={mainTab}
        onSelectionChange={(key) => setMainTab(key as string)}
        variant="underlined"
        className="w-full"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
        }}
      >
        <Tab key="reconciliation" title="Monthly Reconciliation">
          {/* Balance Entry Tabs */}
          <Card className="mt-4">
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
        </Tab>
        
        <Tab key="accounts" title="Chart of Accounts">
          <div className="mt-4">
            <AccountsManager />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}