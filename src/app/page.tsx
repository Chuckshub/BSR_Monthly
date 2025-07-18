'use client';

import { Dashboard } from '@/components/dashboard/Dashboard';
import { Button } from '@heroui/react';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-text-primary dark:text-text-primary">
                BalanceSheet Reconciler - Demo
              </h1>
              <p className="text-sm text-text-secondary dark:text-text-secondary">Monthly financial reconciliation dashboard</p>
            </div>
            <Button
              color="primary"
              variant="flat"
              startContent={<RefreshCw size={16} />}
              onPress={handleRefresh}
            >
              Reset Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Dashboard />
      </main>
    </div>
  );
}
