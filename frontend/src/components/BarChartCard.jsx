// frontend/src/components/BarChartCard.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function BarChartCard({ data }) {
  if (!data || !data.labels || !data.incomes || !data.expenses) {
    return <p className="small-muted">No trend data available</p>;
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Income',
        data: data.incomes,
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        label: 'Expense',
        data: data.expenses,
        backgroundColor: '#ef4444',
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9', borderDash: [4, 4] }, ticks: { font: { size: 11 } }, border: { display: false } }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
