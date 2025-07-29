import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TransactionService from '../api/transaction.service';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import Modal from '../components/common/Modal'; // Step 5: Import Modal
import TransactionForm from '../components/transactions/transactionForm'; // Step 5: Import TransactionForm

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Step 3: State untuk modal
  const { token, logout } = useContext(AuthContext);

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

  // Step 4: Logika untuk menangani submit form
  const handleCreateTransaction = async (formData) => {
    try {
      const response = await TransactionService.createTransaction(token, formData);
      // Tambahkan transaksi baru ke daftar state agar UI langsung ter-update
      setTransactions(prevTransactions => [...prevTransactions, response.data]);
      setIsModalOpen(false); // Tutup modal setelah berhasil
    } catch (err) {
      console.error("Failed to create transaction", err);
      // Di sini kamu bisa menambahkan state untuk menampilkan error form
      alert("Failed to create transaction.");
    }
  };

  return (
    <div className="container p-4 mx-auto md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
            {/* Step 3: Tombol "Tambah Transaksi" */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
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
            </li>
          ))}
          {transactions.length === 0 && (
            <p className="text-gray-500">No transactions yet. Add one to get started!</p>
          )}
        </ul>
      </div>

      {/* Step 5: Tampilkan Modal & Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Transaction">
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}