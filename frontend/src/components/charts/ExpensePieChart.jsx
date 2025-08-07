import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart({ transactions = [] }) {
  const chartData = useMemo(() => {
    // Logika untuk memproses data tetap sama
    const expenseByCategory = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount);
        return acc;
      }, {});

    const labels = Object.keys(expenseByCategory);
    const data = Object.values(expenseByCategory);

    return {
      labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };
  }, [transactions]);
  
  const options = {
     maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  // --- TAMBAHAN LOGIKA DI SINI ---
  // Cek jika tidak ada data pengeluaran sama sekali
  if (chartData.datasets[0].data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center text-gray-500">
        <p>Anda belum memiliki transaksi pengeluaran hari ini. 😊</p>
      </div>
    );
  }
  // --- AKHIR TAMBAHAN ---

  return(
     <div className="h-full w-full">
     <Pie data={chartData} options={options} />
     </div>
  );
}