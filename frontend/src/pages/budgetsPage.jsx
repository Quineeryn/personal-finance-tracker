import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BudgetService from '../api/budgetService';
import Modal from '../components/common/Modal';
import BudgetForm from '../components/budgets/budgetForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, budgetId: null });
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      BudgetService.getBudgets(token)
        .then(response => setBudgets(response.data))
        .catch(err => setError('Failed to fetch budgets.'));
    }
  }, [token]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleSaveBudget = async (formData) => {
    try {
      if (editingBudget) {
        const response = await BudgetService.updateBudget(token, editingBudget.id, formData);
        setBudgets(budgets.map(b => (b.id === editingBudget.id ? response.data : b)));
      } else {
        const response = await BudgetService.createBudget(token, formData);
        setBudgets(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (err) {
      alert("Failed to save budget.");
    }
  };

  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteAlert({ isOpen: true, budgetId: id });
  };
  
  const confirmDelete = async () => {
    if (deleteAlert.budgetId) {
      try {
        await BudgetService.deleteBudget(token, deleteAlert.budgetId);
        setBudgets(budgets.filter(b => b.id !== deleteAlert.budgetId));
      } catch (err) {
        alert("Failed to delete budget.");
      } finally {
        setDeleteAlert({ isOpen: false, budgetId: null });
      }
    }
  };

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500">{error}</p>}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Manage your monthly budgets for each category.</CardDescription>
          </div>
          <Button onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}>
            Add Budget
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.length > 0 ? budgets.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.month}</TableCell>
                  <TableCell className="font-medium">{b.category}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(b.amount)}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(b)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(b.id)}>Hapus</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan="4" className="h-24 text-center">No budgets found. Add one to get started!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBudget ? "Edit Budget" : "Add New Budget"}>
        <BudgetForm
          onSubmit={handleSaveBudget}
          onCancel={closeModal}
          initialData={editingBudget || {}}
        />
      </Modal>

      <AlertDialog open={deleteAlert.isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete your budget record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlert({ isOpen: false, budgetId: null })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
