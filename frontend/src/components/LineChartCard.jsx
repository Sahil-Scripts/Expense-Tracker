// frontend/src/components/LineChartCard.jsx
import React from 'react';

export default function LineChartCard({ data }) {
    // Check if data exists and has the required properties
    if (!data || !data.labels || !data.incomes || !data.expenses) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <div>No data available</div>
                </div>
            </div>
        );
    }

    const { labels, incomes, expenses } = data;

    // Find max value for scaling
    const maxExpense = Math.max(...expenses);
    const maxIncome = Math.max(...incomes);
    const maxValue = Math.max(maxExpense, maxIncome);
    const scale = maxValue > 0 ? 100 / maxValue : 0;

    // Calculate points for the lines
    const chartWidth = 100; // percentage
    const pointSpacing = chartWidth / (labels.length - 1 || 1);

    const expensePoints = expenses.map((expense, i) => ({
        x: i * pointSpacing,
        y: 100 - (expense || 0) * scale
    }));

    const incomePoints = incomes.map((income, i) => ({
        x: i * pointSpacing,
        y: 100 - (income || 0) * scale
    }));

    // Create SVG path strings
    const expensePath = expensePoints.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const incomePath = incomePoints.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
        <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Expenses</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Income</span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 pr-2 text-right">
                    <div>₹{Math.round(maxValue).toLocaleString()}</div>
                    <div>₹{Math.round(maxValue * 0.75).toLocaleString()}</div>
                    <div>₹{Math.round(maxValue * 0.5).toLocaleString()}</div>
                    <div>₹{Math.round(maxValue * 0.25).toLocaleString()}</div>
                    <div>₹0</div>
                </div>

                {/* Chart area */}
                <div className="absolute left-12 right-0 top-0 bottom-6 border-l border-b border-slate-200 dark:border-slate-700">
                    {/* Grid lines */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                            <line
                                key={y}
                                x1="0%"
                                y1={`${y}%`}
                                x2="100%"
                                y2={`${y}%`}
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-slate-200 dark:text-slate-700"
                                strokeDasharray="4 4"
                            />
                        ))}

                        {/* Expense area */}
                        <path
                            d={`${expensePath} L ${chartWidth} 100 L 0 100 Z`}
                            fill="url(#expenseGradient)"
                        />

                        {/* Income area */}
                        <path
                            d={`${incomePath} L ${chartWidth} 100 L 0 100 Z`}
                            fill="url(#incomeGradient)"
                        />

                        {/* Expense line */}
                        <path
                            d={expensePath}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Income line */}
                        <path
                            d={incomePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points - Expenses */}
                        {expensePoints.map((point, i) => (
                            <g key={`expense-${i}`}>
                                <circle
                                    cx={`${point.x}%`}
                                    cy={`${point.y}%`}
                                    r="4"
                                    fill="#ef4444"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="hover:r-6 transition-all cursor-pointer"
                                >
                                    <title>₹{expenses[i]?.toLocaleString() || 0}</title>
                                </circle>
                            </g>
                        ))}

                        {/* Data points - Income */}
                        {incomePoints.map((point, i) => (
                            <g key={`income-${i}`}>
                                <circle
                                    cx={`${point.x}%`}
                                    cy={`${point.y}%`}
                                    r="4"
                                    fill="#10b981"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="hover:r-6 transition-all cursor-pointer"
                                >
                                    <title>₹{incomes[i]?.toLocaleString() || 0}</title>
                                </circle>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    {labels.map((label, i) => (
                        <div key={i} className="text-center" style={{ width: `${100 / labels.length}%` }}>
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Expenses</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        ₹{expenses.reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Income</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{incomes.reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
