# BalanceSheet Reconciler

A modern Next.js 14 application for monthly balance sheet reconciliation, built with HeroUI and TypeScript. **No authentication required** - data is stored locally in your browser.

## 🚀 Features

### ✅ Completed Features
- **Preloaded Chart of Accounts**: Based on the provided balance sheet structure with 50+ accounts
- **No Authentication Required**: Instant access - no signup or login needed
- **Monthly Balance Entry**: Intuitive form interface for entering monthly balances
- **Real-time Variance Calculations**: Automatic calculation of dollar and percentage changes
- **Reconciliation Dashboard**: Tabbed view by major account categories (Assets, Liabilities, Equity)
- **Visual Variance Highlighting**: Color-coded indicators for significant changes
- **Month Locking**: Finalize months to prevent further edits
- **Local Data Storage**: All data stored in browser localStorage - no external database required
- **Responsive Design**: Modern UI with HeroUI components
- **Balance Sheet Summary**: Real-time totals and financial position overview

### 🔄 Pending Features
- Account Management Interface (Add/Edit/Archive accounts)
- Advanced Admin Tools
- Export to PDF/Excel functionality

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, HeroUI
- **Data Storage**: Browser localStorage (no external database)
- **State Management**: React useState/useEffect
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser with localStorage support

## 🚀 Quick Start

### 1. Clone and Install
```bash
cd balance-sheet-reconciler
npm install
```

### 2. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Chart of Accounts Structure

The application comes preloaded with a comprehensive chart of accounts including:

### Assets
- **Current Assets**: Cash, Accounts Receivable, Prepaid Expenses
- **Fixed Assets**: Furniture, Equipment, Accumulated Depreciation
- **Other Assets**: Software Rights, Leasehold Improvements, Notes Receivable

### Liabilities
- **Current Liabilities**: Accounts Payable, Credit Cards, Accrued Expenses
- **Long Term Liabilities**: Operating Lease Liabilities

### Equity
- **Equity**: Preferred Stock (Seed, Series A, B, B-2), Common Stock, Additional Paid-in Capital

## 🔄 User Workflow

1. **Open Application**: No login required - instant access to the dashboard
2. **Select Period**: Choose year and month for reconciliation
3. **Enter Balances**: Input current balances for each account category
4. **Review Variances**: Analyze changes from previous month with color-coded indicators
5. **Add Notes**: Document reconciliation explanations for significant variances
6. **Finalize**: Lock the month to prevent further changes
7. **Historical View**: Access previous reconciliations stored in your browser

## 🎨 UI Features

- **Tabbed Interface**: Organized by account categories for easy navigation
- **Inline Editing**: Click-to-edit balance fields with save/cancel actions
- **Variance Indicators**: 
  - 🟢 Green: No change or minimal variance
  - 🔵 Blue: Moderate variance (< 10%)
  - 🟡 Yellow: Significant variance (10-20%)
  - 🔴 Red: Large variance (> 20%)
- **Summary Cards**: Real-time totals for Assets, Liabilities, and Net Worth
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🔒 Data & Privacy Features

- **Complete Privacy**: All data stored locally in your browser - never sent to external servers
- **No Account Required**: No personal information collected
- **Month Locking**: Prevent accidental changes to finalized periods
- **Input Validation**: Client-side validation and sanitization
- **Data Persistence**: Your data persists between browser sessions

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 📝 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Main dashboard components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (Auth)
├── data/               # Static data (default accounts)
├── lib/                # Utilities (Firebase config)
├── services/           # Business logic (Firebase operations)
└── types/              # TypeScript type definitions
```

### Key Components
- `Dashboard.tsx`: Main reconciliation interface
- `BalanceEntryForm.tsx`: Account balance input form
- `ReconciliationSummary.tsx`: Financial summary cards
- `AuthForm.tsx`: Login/signup interface

### Local Storage Keys
- `bsr_accounts`: Chart of accounts data
- `bsr_reconciliation_{year}_{month}`: Monthly reconciliation data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check browser console for client-side errors
2. Ensure localStorage is enabled in your browser
3. Try the "Reset Demo" button to clear all data and start fresh
4. Use browser developer tools to inspect localStorage data

---

**Built with ❤️ using Next.js 14, Firebase, and HeroUI**