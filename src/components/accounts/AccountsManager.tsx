'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Switch,
  Chip,
  Tabs,
  Tab,
} from '@heroui/react';
import { Plus, Edit3, Archive } from 'lucide-react';
import { Account, AccountType, AccountCategory } from '@/types';
import { AccountsService } from '@/services/accountsService';

const ACCOUNT_TYPES: AccountType[] = [
  'Bank',
  'Accounts Receivable',
  'Other Current Asset',
  'Fixed Assets',
  'Other Assets',
  'Accounts Payable',
  'Credit Card',
  'Other Current Liability',
  'Long Term Liabilities',
  'Equity',
  'Retained Earnings',
  'Net Income',
];

const ACCOUNT_CATEGORIES: AccountCategory[] = [
  'Current Assets',
  'Fixed Assets',
  'Other Assets',
  'Current Liabilities',
  'Long Term Liabilities',
  'Equity',
];

interface AccountFormData {
  accountNumber: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  isActive: boolean;
}

export function AccountsManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<AccountFormData>({
    accountNumber: '',
    name: '',
    type: 'Bank',
    category: 'Current Assets',
    isActive: true,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, showInactive, selectedCategory, searchTerm]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      // Initialize default accounts if needed
      await AccountsService.initializeDefaultAccounts('demo-user');
      
      // Load chart of accounts
      const chart = await AccountsService.getChartOfAccounts('demo-user');
      if (chart) {
        setAccounts(chart.accounts);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(account => account.isActive);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(account => account.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber.includes(searchTerm)
      );
    }

    setFilteredAccounts(filtered);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setFormData({
      accountNumber: '',
      name: '',
      type: 'Bank',
      category: 'Current Assets',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountNumber: account.accountNumber,
      name: account.name,
      type: account.type,
      category: account.category,
      parentId: account.parentId,
      isActive: account.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = async () => {
    try {
      if (editingAccount) {
        // Update existing account
        await AccountsService.updateAccount('demo-user', editingAccount.id, formData);
      } else {
        // Add new account
        await AccountsService.addAccount('demo-user', formData);
      }
      
      await loadAccounts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleArchiveAccount = async (accountId: string) => {
    try {
      await AccountsService.deactivateAccount('demo-user', accountId);
      await loadAccounts();
    } catch (error) {
      console.error('Error archiving account:', error);
    }
  };

  const getAccountsByCategory = (category: AccountCategory) => {
    return filteredAccounts.filter(account => account.category === category);
  };

  const renderAccountsTable = (categoryAccounts: Account[]) => {
    if (categoryAccounts.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No accounts found in this category.
        </div>
      );
    }

    return (
      <Table aria-label="Accounts table">
        <TableHeader>
          <TableColumn>ACCOUNT #</TableColumn>
          <TableColumn>ACCOUNT NAME</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {categoryAccounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <span className="font-mono text-sm">{account.accountNumber}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{account.name}</p>
                  {account.parentId && (
                    <p className="text-xs text-gray-500">
                      Parent: {accounts.find(a => a.id === account.parentId)?.name}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{account.type}</span>
              </TableCell>
              <TableCell>
                <Chip
                  color={account.isActive ? 'success' : 'default'}
                  variant="flat"
                  size="sm"
                >
                  {account.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => handleEditAccount(account)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  {account.isActive && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isIconOnly
                      onPress={() => handleArchiveAccount(account.id)}
                    >
                      <Archive size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chart of Accounts</h2>
          <p className="text-gray-600 mt-1">Manage your account structure</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={handleAddAccount}
        >
          Add Account
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            
            <Select
              label="Category"
              selectedKeys={[selectedCategory]}
              onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
              className="max-w-xs"
            >
              <SelectItem key="all">All Categories</SelectItem>
              <SelectItem key="Current Assets">Current Assets</SelectItem>
              <SelectItem key="Fixed Assets">Fixed Assets</SelectItem>
              <SelectItem key="Other Assets">Other Assets</SelectItem>
              <SelectItem key="Current Liabilities">Current Liabilities</SelectItem>
              <SelectItem key="Long Term Liabilities">Long Term Liabilities</SelectItem>
              <SelectItem key="Equity">Equity</SelectItem>
            </Select>
            
            <div className="flex items-center gap-2">
              <Switch
                isSelected={showInactive}
                onValueChange={setShowInactive}
                size="sm"
              />
              <span className="text-sm">Show Inactive</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Total: {filteredAccounts.length} accounts</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Accounts by Category */}
      {selectedCategory === 'all' ? (
        <Tabs variant="underlined" className="w-full">
          {ACCOUNT_CATEGORIES.map((category) => {
            const categoryAccounts = getAccountsByCategory(category);
            return (
              <Tab
                key={category}
                title={
                  <div className="flex items-center gap-2">
                    <span>{category}</span>
                    <Chip size="sm" variant="flat">
                      {categoryAccounts.length}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-4">
                  {renderAccountsTable(categoryAccounts)}
                </div>
              </Tab>
            );
          })}
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {selectedCategory} ({filteredAccounts.length} accounts)
            </h3>
          </CardHeader>
          <CardBody>
            {renderAccountsTable(filteredAccounts)}
          </CardBody>
        </Card>
      )}

      {/* Add/Edit Account Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Account Number"
                  placeholder="e.g., 11000"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  isRequired
                />
                <Select
                  label="Category"
                  selectedKeys={[formData.category]}
                  onSelectionChange={(keys) => 
                    setFormData({ ...formData, category: Array.from(keys)[0] as AccountCategory })
                  }
                  isRequired
                >
                  <SelectItem key="Current Assets">Current Assets</SelectItem>
                  <SelectItem key="Fixed Assets">Fixed Assets</SelectItem>
                  <SelectItem key="Other Assets">Other Assets</SelectItem>
                  <SelectItem key="Current Liabilities">Current Liabilities</SelectItem>
                  <SelectItem key="Long Term Liabilities">Long Term Liabilities</SelectItem>
                  <SelectItem key="Equity">Equity</SelectItem>
                </Select>
              </div>
              
              <Input
                label="Account Name"
                placeholder="e.g., Cash and cash equivalents"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isRequired
              />
              
              <Select
                label="Account Type"
                selectedKeys={[formData.type]}
                onSelectionChange={(keys) => 
                  setFormData({ ...formData, type: Array.from(keys)[0] as AccountType })
                }
                isRequired
              >
                <SelectItem key="Bank">Bank</SelectItem>
                <SelectItem key="Accounts Receivable">Accounts Receivable</SelectItem>
                <SelectItem key="Other Current Asset">Other Current Asset</SelectItem>
                <SelectItem key="Fixed Assets">Fixed Assets</SelectItem>
                <SelectItem key="Other Assets">Other Assets</SelectItem>
                <SelectItem key="Accounts Payable">Accounts Payable</SelectItem>
                <SelectItem key="Credit Card">Credit Card</SelectItem>
                <SelectItem key="Other Current Liability">Other Current Liability</SelectItem>
                <SelectItem key="Long Term Liabilities">Long Term Liabilities</SelectItem>
                <SelectItem key="Equity">Equity</SelectItem>
                <SelectItem key="Retained Earnings">Retained Earnings</SelectItem>
                <SelectItem key="Net Income">Net Income</SelectItem>
              </Select>
              
              <Select
                label="Parent Account (Optional)"
                placeholder="Select parent account"
                selectedKeys={formData.parentId ? [formData.parentId] : []}
                onSelectionChange={(keys) => 
                  setFormData({ ...formData, parentId: Array.from(keys)[0] as string || undefined })
                }
              >
                {accounts
                  .filter(account => account.category === formData.category && account.id !== editingAccount?.id)
                  .map((account) => (
                    <SelectItem key={account.id}>
                      {account.accountNumber} - {account.name}
                    </SelectItem>
                  ))}
              </Select>
              
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <span className="text-sm">Active Account</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveAccount}
              isDisabled={!formData.accountNumber || !formData.name}
            >
              {editingAccount ? 'Update Account' : 'Add Account'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}