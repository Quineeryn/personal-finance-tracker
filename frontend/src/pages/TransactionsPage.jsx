import { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import Modal from '../components/common/Modal';
import TransactionForm from '../components/transactions/transactionForm';
import { CardFooter } from '@/components/ui/card';
import { CSVLink } from 'react-csv';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
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
  const ITEMS_PER_PAGE = 5;

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
    <div className="h-full flex flex-col">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <Card className="flex flex-col h-full">
        {/* Header - Fixed height */}
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Filter, manage, and review all your transactions.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
          <Button asChild>
            <CSVLink
              data={processedData}
              headers={[
                { label: "Date", key: "date" },
                { label: "Type", key: "type" },
                { label: "Category", key: "category" },
                { label: "Description", key: "description" },
                { label: "Amount", key: "amount" },
              ]}
              filename={`transactions-report-${new Date().toISOString().slice(0,10)}.csv`}
            >
              Export to CSV
            </CSVLink>
          </Button>
      <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}>
      Add Transaction
    </Button>
  </div>
        </CardHeader>

        {/* Filter Bar - Fixed height */}
        <div className="flex-shrink-0 flex flex-wrap items-center gap-4 px-6 pb-4">
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

        {/* Table Container - Flexible height with internal scroll */}
        <CardContent className="flex-1 flex flex-col px-6 pb-0 min-h-0">
          <div className="flex-1 border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('date')}>
                      Date <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => requestSort('amount')}>
                      Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 420px)' }}>
              <Table>
                <TableBody>
                  {paginatedTransactions.length > 0 ? paginatedTransactions.map((tx) => (
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
                      <TableCell colSpan="5" className="h-24 text-center">No transactions found with the current filters.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Fixed Footer */}
            <div className="border-t bg-gray-50">
              <Table>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan="3" className="font-bold">Total Income (Filtered)</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.totalIncome)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan="3" className="font-bold">Total Expense (Filtered)</TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(summary.totalExpense)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </CardContent>
          
        {/* Pagination Footer - Fixed height */}
        <CardFooter className="flex-shrink-0 flex items-center justify-end p-4 space-x-2 border-t">
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
        </CardFooter>
      </Card>

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