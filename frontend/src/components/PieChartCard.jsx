// frontend/src/components/PieChartCard.jsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

export default function PieChartCard({ transactions = [] }) {
  const data = useMemo(() => {
    const m = {};
    transactions.forEach(t => { if (t.type === 'expense') m[t.category] = (m[t.category] || 0) + t.amount; });
    return {
      labels: Object.keys(m),
      datasets: [{
        data: Object.values(m),
        backgroundColor: ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  }, [transactions]);

  const options = {
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } }
    }
  };

  return data.labels.length > 0 ? (
    <div className="relative" style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</div>
          <div className="text-xl font-bold text-slate-700">
            ₹{data.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  ) : <p className="small-muted text-center py-8">No expense data for this month.</p>;
}
