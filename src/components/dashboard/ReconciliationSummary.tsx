'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Account, MonthlyReconciliation } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

interface ReconciliationSummaryProps {
  reconciliation: MonthlyReconciliation;
  accounts: Account[];
}

export function ReconciliationSummary({ reconciliation, accounts }: ReconciliationSummaryProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateCategoryTotals = () => {
    const totals = {
      currentAssets: 0,
      fixedAssets: 0,
      otherAssets: 0,
      currentLiabilities: 0,
      longTermLiabilities: 0,
      equity: 0,
    };

    reconciliation.balances.forEach(balance => {
      const account = accounts.find(acc => acc.id === balance.accountId);
      if (!account) return;

      switch (account.category) {
        case 'Current Assets':
          totals.currentAssets += balance.balance;
          break;
        case 'Fixed Assets':
          totals.fixedAssets += balance.balance;
          break;
        case 'Other Assets':
          totals.otherAssets += balance.balance;
          break;
        case 'Current Liabilities':
          totals.currentLiabilities += balance.balance;
          break;
        case 'Long Term Liabilities':
          totals.longTermLiabilities += balance.balance;
          break;
        case 'Equity':
          totals.equity += balance.balance;
          break;
      }
    });

    return totals;
  };

  const getSignificantVariances = () => {
    return reconciliation.balances
      .filter(balance => Math.abs(balance.variancePercent || 0) > 10)
      .sort((a, b) => Math.abs(b.variancePercent || 0) - Math.abs(a.variancePercent || 0))
      .slice(0, 5);
  };

  const totals = calculateCategoryTotals();
  const totalAssets = totals.currentAssets + totals.fixedAssets + totals.otherAssets;
  const totalLiabilities = totals.currentLiabilities + totals.longTermLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  const significantVariances = getSignificantVariances();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Assets */}
      <Card>
        <CardBody className="flex flex-row items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAssets)}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Total Liabilities */}
      <Card>
        <CardBody className="flex flex-row items-center space-x-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalLiabilities)}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Net Worth */}
      <Card>
        <CardBody className="flex flex-row items-center space-x-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Net Worth</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(netWorth)}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Significant Variances */}
      <Card>
        <CardBody className="flex flex-row items-center space-x-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Large Variances</p>
            <p className="text-2xl font-bold text-gray-900">
              {significantVariances.length}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">Balance Sheet Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assets */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Assets</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Assets</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totals.currentAssets)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fixed Assets</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totals.fixedAssets)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Other Assets</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totals.otherAssets)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Assets</span>
                  <span className="font-mono">
                    {formatCurrency(totalAssets)}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Liabilities</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Liabilities</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totals.currentLiabilities)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Long Term Liabilities</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totals.longTermLiabilities)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Liabilities</span>
                  <span className="font-mono">
                    {formatCurrency(totalLiabilities)}
                  </span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Equity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Equity</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totals.equity)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Net Worth</span>
                  <span className={`font-mono ${
                    netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(netWorth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Significant Variances */}
          {significantVariances.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Significant Variances (&gt;10%)</h4>
              <div className="space-y-2">
                {significantVariances.map(balance => {
                  const account = accounts.find(acc => acc.id === balance.accountId);
                  return (
                    <div key={balance.id} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{account?.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({account?.accountNumber})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">
                          {formatCurrency(balance.variance || 0)}
                        </div>
                        <div className={`text-xs ${
                          (balance.variancePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(balance.variancePercent || 0).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}