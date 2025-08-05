import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, plugins } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart({ transactions = [] }) {
  const chartData = useMemo(() => {
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
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
        },
      ],
    };
  }, [transactions]);

  const options = {
      plugins: {
        legend: {
          position: 'right',
        },
      },
    };

  return <Pie data={chartData} options={options} />;
}