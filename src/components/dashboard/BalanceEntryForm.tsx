'use client';

import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Textarea,
  Chip,
  Button,
} from '@heroui/react';
import { Account, MonthlyReconciliation, AccountBalance } from '@/types';
import { Edit3, Save, X } from 'lucide-react';

interface BalanceEntryFormProps {
  accounts: Account[];
  reconciliation: MonthlyReconciliation | null;
  onBalanceUpdate: (accountId: string, balance: number, notes?: string) => Promise<void>;
  isLocked: boolean;
}

interface EditingState {
  accountId: string;
  balance: string;
  notes: string;
}

export function BalanceEntryForm({
  accounts,
  reconciliation,
  onBalanceUpdate,
  isLocked,
}: BalanceEntryFormProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const getAccountBalance = (accountId: string): AccountBalance | undefined => {
    return reconciliation?.balances.find(b => b.accountId === accountId);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percent: number): string => {
    return `${percent.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number, variancePercent: number) => {
    if (Math.abs(variancePercent) > 20) return 'danger';
    if (Math.abs(variancePercent) > 10) return 'warning';
    if (variance !== 0) return 'primary';
    return 'success';
  };

  const handleEdit = (accountId: string) => {
    const balance = getAccountBalance(accountId);
    setEditing({
      accountId,
      balance: balance?.balance.toString() || '0',
      notes: balance?.notes || '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    
    try {
      setSaving(editing.accountId);
      const balance = parseFloat(editing.balance) || 0;
      await onBalanceUpdate(editing.accountId, balance, editing.notes);
      setEditing(null);
    } catch (error) {
      console.error('Error saving balance:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const renderBalanceCell = (account: Account) => {
    const balance = getAccountBalance(account.id);
    const isEditing = editing?.accountId === account.id;
    const isSaving = saving === account.id;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            value={editing.balance}
            onChange={(e) => setEditing({ ...editing, balance: e.target.value })}
            className="w-32"
            size="sm"
          />
          <Button
            size="sm"
            color="success"
            variant="flat"
            isIconOnly
            onPress={handleSave}
            isLoading={isSaving}
          >
            <Save size={16} />
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isIconOnly
            onPress={handleCancel}
          >
            <X size={16} />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-mono">
          {formatCurrency(balance?.balance || 0)}
        </span>
        {!isLocked && (
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onPress={() => handleEdit(account.id)}
          >
            <Edit3 size={16} />
          </Button>
        )}
      </div>
    );
  };

  const renderNotesCell = (account: Account) => {
    const balance = getAccountBalance(account.id);
    const isEditing = editing?.accountId === account.id;

    if (isEditing) {
      return (
        <Textarea
          value={editing.notes}
          onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
          placeholder="Add reconciliation notes..."
          size="sm"
          minRows={1}
          maxRows={3}
        />
      );
    }

    return (
      <span className="text-sm text-gray-600">
        {balance?.notes || '-'}
      </span>
    );
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No accounts found in this category.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table aria-label="Balance entry table">
        <TableHeader>
          <TableColumn>ACCOUNT</TableColumn>
          <TableColumn>ACCOUNT #</TableColumn>
          <TableColumn>CURRENT BALANCE</TableColumn>
          <TableColumn>PREVIOUS BALANCE</TableColumn>
          <TableColumn>VARIANCE ($)</TableColumn>
          <TableColumn>VARIANCE (%)</TableColumn>
          <TableColumn>NOTES</TableColumn>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => {
            const balance = getAccountBalance(account.id);
            const variance = balance?.variance || 0;
            const variancePercent = balance?.variancePercent || 0;
            
            return (
              <TableRow key={account.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{account.accountNumber}</span>
                </TableCell>
                <TableCell>
                  {renderBalanceCell(account)}
                </TableCell>
                <TableCell>
                  <span className="font-mono">
                    {formatCurrency(balance?.previousBalance || 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={getVarianceColor(variance, variancePercent)}
                    variant="flat"
                    size="sm"
                  >
                    {formatCurrency(variance)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    color={getVarianceColor(variance, variancePercent)}
                    variant="flat"
                    size="sm"
                  >
                    {formatPercentage(variancePercent)}
                  </Chip>
                </TableCell>
                <TableCell className="max-w-xs">
                  {renderNotesCell(account)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}