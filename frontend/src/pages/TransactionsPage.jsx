import { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import Modal from '../components/common/Modal';
import TransactionForm from '../components/transactions/transactionForm';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { ArrowUpDown } from 'lucide-react';

export default function TransactionsPage() {
  // State utama
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  
  // State untuk filter, sort, dan pagination
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // State untuk modal & dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, transactionId: null });
  
  const { token } = useContext(AuthContext);

  // Mengambil data dari API
  useEffect(() => {
    if (token) {
      TransactionService.getTransactions(token)
        .then(response => setTransactions(response.data))
        .catch(err => setError('Failed to fetch transactions.'));
    }
  }, [token]);

  // Kalkulasi untuk mengisi pilihan filter kategori secara dinamis
  const availableCategories = useMemo(() => {
    const categories = new Set(transactions.map(tx => tx.category));
    return Array.from(categories);
  }, [transactions]);

  // Memproses data (filter & sort)
  const processedData = useMemo(() => {
    let filtered = [...transactions].filter(tx => {
      const transactionDate = new Date(tx.date);
      transactionDate.setHours(0, 0, 0, 0);

      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      if (dateRange?.from && transactionDate < new Date(dateRange.from).setHours(0,0,0,0)) return false;
      if (dateRange?.to && transactionDate > new Date(dateRange.to).setHours(0,0,0,0)) return false;
      
      return true;
    });

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [transactions, typeFilter, categoryFilter, dateRange, sortConfig]);

  // Memotong data untuk pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, currentPage]);

  // Menghitung ringkasan total
  const summary = useMemo(() => {
    const totalIncome = processedData.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalExpense = processedData.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    return { totalIncome, totalExpense };
  }, [processedData]);

  // Fungsi untuk mengubah sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Fungsi-fungsi handler
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
    <div className="h-full grid grid-rows-[auto_auto_1fr_auto] gap-0">
      {/* Error Message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold">All Transactions</h1>
          <p className="text-muted-foreground">Filter, manage, and review all your transactions.</p>
        </div>
        <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
          Add Transaction
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 px-6 pb-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table Area with Custom Grid */}
      <div className="mx-6 border rounded-lg overflow-hidden bg-white min-h-0">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-medium">
          <div className="col-span-2">
            <Button variant="ghost" size="sm" onClick={() => requestSort('date')} className="h-auto p-0 hover:bg-transparent">
              Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-3 text-right">
            <Button variant="ghost" size="sm" onClick={() => requestSort('amount')} className="h-auto p-0 hover:bg-transparent">
              Amount <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 380px)' }}>
          {paginatedTransactions.length > 0 ? paginatedTransactions.map((tx) => (
            <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 items-center">
              <div className="col-span-2 text-sm">
                {new Date(tx.date).toLocaleDateString()}
              </div>
              <div className="col-span-3 text-sm font-medium">
                {tx.description || '-'}
              </div>
              <div className="col-span-2 text-sm">
                {tx.category}
              </div>
              <div className={`col-span-3 text-right text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
              </div>
              <div className="col-span-2 flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(tx)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(tx.id)}>Delete</Button>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-muted-foreground">
              No transactions found with the current filters.
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="border-t bg-gray-50">
          <div className="grid grid-cols-12 gap-4 p-4 border-b">
            <div className="col-span-7 font-bold">Total Income (Filtered)</div>
            <div className="col-span-3 text-right font-bold text-green-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.totalIncome)}
            </div>
            <div className="col-span-2"></div>
          </div>
          <div className="grid grid-cols-12 gap-4 p-4">
            <div className="col-span-7 font-bold">Total Expense (Filtered)</div>
            <div className="col-span-3 text-right font-bold text-red-600">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.totalExpense)}
            </div>
            <div className="col-span-2"></div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end p-6 space-x-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {Math.ceil(processedData.length / ITEMS_PER_PAGE)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage * ITEMS_PER_PAGE >= processedData.length}
        >
          Next
        </Button>
      </div>

      {/* Modal dan Dialog */}
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