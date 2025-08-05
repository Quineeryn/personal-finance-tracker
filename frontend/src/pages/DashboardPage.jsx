import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transaction.service';
import BudgetService from '../api/budget.service';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import BudgetStatus from '../components/budgets/BudgetStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
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

      <div className="grid gap-8 md:grid-cols-3">
        {/* Kolom kiri untuk ringkasan transaksi terbaru (opsional) */}
        <div className="space-y-8 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Budget Status (This Month)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetProgress.length > 0 ? budgetProgress.map(budget => (
                <BudgetStatus
                  key={budget.id}
                  category={budget.category}
                  spent={budget.spent}
                  total={parseFloat(budget.amount)}
                />
              )) : (
                <p className="text-sm text-center text-gray-500">No budgets set for this month.</p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Kolom kanan untuk pie chart */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-md p-4 mx-auto">
                <ExpensePieChart transactions={transactions.filter(tx => tx.type === 'expense')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}