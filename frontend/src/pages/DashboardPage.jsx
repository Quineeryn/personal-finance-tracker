import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import Modal from '../components/common/Modal'; 
import TransactionForm from '../components/transactions/transactionForm'; 
import { Button } from '@/components/ui/button';
import BudgetService from '../api/budgetService';
import BudgetStatus from '../components/budgets/budgetStatus';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useMemo } from 'react';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const { token, logout } = useContext(AuthContext);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteAlert, setDeleteALert] = useState({ isOpen: false, transactionId: null});
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await TransactionService.getTransactions(token);
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to fetch transactions.');
        console.error(err);
      }
    };
    
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  useEffect(() => {
    const today = new Date();

    today.setHours(0,0,0,0);

    const todayTransaction = transactions.filter(tx =>{
      const txDate = new Date(tx.date);
      txDate.setHours(0,0,0,0);
      return txDate.getTime() === today.getTime();
    });
    setFilteredTransactions(todayTransaction);
  }, [transactions]);

  const monthlyStats = useMemo(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const relevantTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const income = relevantTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const expense = relevantTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  return {
    income,
    expense,
    balance: income - expense,
    totalTransactions: relevantTransactions.length
  };
  }, [transactions]);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          // Ambil data transaksi dan anggaran secara bersamaan
          const [transactionRes, budgetRes] = await Promise.all([
            TransactionService.getTransactions(token),
            BudgetService.getBudgets(token)
          ]);
          setTransactions(transactionRes.data);
          setBudgets(budgetRes.data);
        } catch (err) {
          setError('Failed to fetch data.');
        }
      }
    };
    fetchData();
  }, [token]);

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
      .map(budget => ({
        ...budget,
        spent: monthlyExpenses[budget.category] || 0,
      }));
  }, [transactions, budgets]);

  const handleEditClick = (transactions) => {
    setEditingTransaction(transactions);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteALert({ isOpen: true, transactionId: id});
  }

  const confirmDelete = async () => {
    if (deleteAlert.transactionId) {
      try{
        await TransactionService.deleteTransaction(token, deleteAlert.transactionId);
        setTransactions(transactions.filter(tx => tx.id !== deleteAlert.transactionId));
      } catch (err) {
        alert("Failed to delete transaction.");
      }finally {
        setDeleteALert({ isOpen: false, transactionId: null});
      }
    }
  }

  const handleSaveTransaction = async (formData) => {
    try{
      if (editingTransaction) {
        const response = await TransactionService.updateTransaction(token, editingTransaction.id, formData);
        setTransactions(transactions.map(tx => tx.id === editingTransaction.id ? response.data : tx));
      } else{
        const response = await TransactionService.createTransaction(token, formData);
        setTransactions([...transactions, response.data]);
      }
      closeModal();
    } catch (err) {
      alert("Failed to save transaction.")
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="container flex items-center justify-between p-4 mx-auto">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

    <div className="container grid gap-4 px-4 py-6 mx-auto md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">This Month's Balance</CardTitle>
          {/* Anda bisa menambahkan ikon di sini nanti */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyStats.balance)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">This Month's Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyStats.income)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">This Month's Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyStats.expense)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Transactions (Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyStats.totalTransactions}
          </div>
        </CardContent>
      </Card>
    </div>

    

      <main className="container grid gap-8 px-4 pb-8 mx-auto md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Transactions</CardTitle>
                <CardDescription>Your income and expenses for today.</CardDescription>
              </div>
              <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
                Add Transaction
              </Button>
            </CardHeader>
            <div className="h-[500px] overflow-y-auto">
            <CardContent>
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{tx.description || '-'}</TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell className={`text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(tx)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(tx.id)}>Hapus</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan="5" className="text-center">No transactions for today.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            </div>
          </Card>
        </div>

        <div className="w-full max-w-s p-4 mx-auto mt-4 bg-white rounded-lg shadow">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensePieChart transactions={filteredTransactions} />
            </CardContent>
          </Card>

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
      </main>

      <AlertDialog open={deleteAlert.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              transaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteALert({ isOpen: false, transactionId: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}>
        <TransactionForm
          onSubmit={handleSaveTransaction}
          onCancel={closeModal}
          initialData={editingTransaction || {}}
        />
      </Modal>
    </div>
  );
}