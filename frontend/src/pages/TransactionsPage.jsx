import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import Modal from '../components/common/Modal';
import TransactionForm from '../components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, transactionId: null });
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      TransactionService.getTransactions(token)
        .then(response => setTransactions(response.data))
        .catch(err => setError('Failed to fetch transactions.'));
    }
  }, [token]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        const response = await TransactionService.updateTransaction(token, editingTransaction.id, formData);
        setTransactions(transactions.map(tx => (tx.id === editingTransaction.id ? response.data : tx)));
      } else {
        const response = await TransactionService.createTransaction(token, formData);
        setTransactions(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (err) {
      alert("Failed to save transaction.");
      console.error(err);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteAlert({ isOpen: true, transactionId: id });
  };
  
  const confirmDelete = async () => {
    if (deleteAlert.transactionId) {
      try {
        await TransactionService.deleteTransaction(token, deleteAlert.transactionId);
        setTransactions(transactions.filter(tx => tx.id !== deleteAlert.transactionId));
      } catch (err) {
        alert("Failed to delete transaction.");
      } finally {
        setDeleteAlert({ isOpen: false, transactionId: null });
      }
    }
  };

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500">{error}</p>}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Manage all your income and expenses.</CardDescription>
          </div>
          <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
            Add Transaction
          </Button>
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
                  <TableCell colSpan="5" className="h-24 text-center">No transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}>
        <TransactionForm
          onSubmit={handleSaveTransaction}
          onCancel={closeModal}
          initialData={editingTransaction || {}}
        />
      </Modal>

      <AlertDialog open={deleteAlert.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your transaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlert({ isOpen: false, transactionId: null })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}