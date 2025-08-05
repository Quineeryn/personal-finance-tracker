import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import Modal from '../components/common/Modal'; 
import TransactionForm from '../components/transactions/transactionForm'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const { token, logout } = useContext(AuthContext);
  const [editingTransaction, setEditingTransaction] = useState(null);

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

  const handleEditClick = (transactions) => {
    setEditingTransaction(transactions);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if(window.confirm("Are you sure you want to delete this transaction?")) {
      try{
        await TransactionService.deleteTransaction(token, id);
        setTransactions(transactions.filter(tx => tx.id !== id));
      } catch (err) {
        console.error("Delete Failed:", err.response || err);
        alert("Failed to delete transaction.");
      }
    }
  };

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
          <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
            Add Transaction
          </Button>
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container grid gap-8 px-4 pb-8 mx-auto md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>A list of your recent income and expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? transactions.map((tx) => (
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
                      <TableCell colSpan="5" className="text-center">No transactions yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensePieChart transactions={transactions} />
            </CardContent>
          </Card>
        </div>
      </main>

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