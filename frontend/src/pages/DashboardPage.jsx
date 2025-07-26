import { useContext, useEffect, useState} from "react";
import { AuthContext } from '../context/AuthContext';
import transactionService from "../api/transactionService";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const {token, logout} = useContext(AuthContext);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactionService.getTransactions(token);
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to fetch transactions.');
        console.error(err);
      }
    };

    if (token) {
      fetchTransactions();
    }
  }, [token]); // <-- Dijalankan setiap kali token berubah

  return (
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <ul className="mt-4 space-y-2">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between p-3 bg-white rounded-lg shadow">
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-sm text-gray-500">{tx.category}</p>
              </div>
              <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}