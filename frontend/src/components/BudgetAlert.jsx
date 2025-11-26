// frontend/src/components/BudgetAlert.jsx
import React from 'react';
export default function BudgetAlert({ alert }){
  if (!alert) return null;
  const tone = alert.level === 'critical' ? 'bg-red-50 border-red-300' : alert.level === 'high' ? 'bg-orange-50 border-orange-300' : alert.level === 'warning' ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300';
  return (
    <div className={`p-4 rounded-lg border-l-4 mb-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <div>
          <strong className="block">{alert.title}</strong>
          <div className="text-sm text-slate-600">{alert.message}</div>
        </div>
      </div>
    </div>
  );
}
