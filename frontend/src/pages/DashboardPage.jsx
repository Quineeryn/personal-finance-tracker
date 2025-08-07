import { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import BudgetService from '../api/budgetService';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import BudgetStatus from '../components/budgets/budgetStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const [transactionRes, budgetRes] = await Promise.all([
            TransactionService.getTransactions(token),
            BudgetService.getBudgets(token)
          ]);
          setTransactions(transactionRes.data);
          setBudgets(budgetRes.data);
        } catch (err) {
          setError('Failed to fetch dashboard data.');
        }
      }
    };
    fetchData();
  }, [token]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const relevantTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const income = relevantTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const expense = relevantTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    return { income, expense, balance: income - expense, totalTransactions: relevantTransactions.length };
  }, [transactions]);

  const todaysTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
      .filter(tx => {
        const txDate = new Date(tx.date);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === today.getTime();
      });
  }, [transactions]);

  const budgetProgress = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthlyExpenses = transactions
      .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount);
        return acc;
      }, {});
    
    return budgets
      .filter(b => b.month === currentMonthStr)
      .map(budget => ({ ...budget, spent: monthlyExpenses[budget.category] || 0 }));
  }, [transactions, budgets]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">This Month's Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyStats.balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">This Month's Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyStats.income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">This Month's Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyStats.expense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Transactions (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5 flex-1 min-h-0">
        {/* Today's Transactions */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex flex-col h-full max-h-[calc(100vh-200px)]">
            <CardHeader className="flex flex-row items-center flex-shrink-0">
              <div className="grid gap-2">
                <CardTitle>Today's Transactions</CardTitle>
                <CardDescription>Your latest transactions for today.</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link to="/transactions">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysTransactions.length > 0 ? todaysTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.description || '-'}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan="3" className="h-24 text-center">
                          No transactions for today.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Budget Status */}
          <Card className="flex flex-col h-[50%]">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Budget Status (This Month)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto scrollbar-thin">
              <div
                className="space-y-4"
                style={{ maxHeight: 'calc(100% - 40px)' }}
              >
                {budgetProgress.length > 0 ? (
                  budgetProgress.slice(0, 4).map((budget) => (
                    <div
                      key={budget.id}
                      className="flex-shrink-0"
                    >
                      <BudgetStatus
                        category={budget.category}
                        spent={budget.spent}
                        total={parseFloat(budget.amount)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-center text-gray-500">
                      No budgets set for this month.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="flex flex-col h-[50%]">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Expense Breakdown (Today)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="w-[300px] h-[300px] relative flex items-center justify-center">
                <ExpensePieChart transactions={todaysTransactions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}