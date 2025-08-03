import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transactionService';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import Modal from '../components/common/Modal'; // Step 5: Import Modal
import TransactionForm from '../components/transactions/transactionForm'; // Step 5: Import TransactionForm

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Step 3: State untuk modal
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
    if(window.confirm("Are you sure you want to delete this ttransaction?")) {
      try{
        await TransactionService.deleteTransaction(token, id);
        setTransactions(transactions.filler(tx => tx.id !== id));
      } catch (err) {
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
    <div className="container p-4 mx-auto md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
            {/* Step 3: Tombol "Tambah Transaksi" */}
            <button
                onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Add Transaction
            </button>
            <button
                onClick={logout}
                className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Expense Breakdown</h2>
        <div className="w-full max-w-md p-4 mx-auto mt-4 bg-white rounded-lg shadow">
          <ExpensePieChart transactions={transactions} />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Recent Transactions</h2>
        <ul className="mt-4 space-y-3">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div>
                <p className="font-medium">{tx.description || tx.category}</p>
                <p className="text-sm text-gray-500">{tx.category} - {new Date(tx.date).toLocaleDateString()}</p>
              </div>
              <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
              </p>
              <button className="p-1 text-blue-600 hover:text-blue-800" onClick={() => handleEditClick(tx)}>Edit</button>
              <button className="p-1 text-red-600 hover:text-red-800" onClick={() => handleDeleteClick(tx.id)}>Delete</button>
            </li>
          ))}
          {transactions.length === 0 && (
            <p className="text-gray-500">No transactions yet. Add one to get started!</p>
          )}
        </ul>
      </div>

      {/* Step 5: Tampilkan Modal & Form */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTransaction ? "Edit Transaction" : "Add Transaction"}>
        <TransactionForm
          onSubmit={handleSaveTransaction}
          onCancel={closeModal}
          initialData={editingTransaction}
        />
      </Modal>
    </div>
  );
}