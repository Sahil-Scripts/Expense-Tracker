const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Helper: Linear Regression
function predictNext(values) {
    const n = values.length;
    if (n < 2) return values[0] || 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
}

// GET /api/ml/forecast
router.get('/forecast', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 5, 1); // last 6 months

        const agg = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: start, $lte: end }, type: 'expense' } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const values = agg.map(a => a.total);
        const forecast = predictNext(values);

        res.json({ forecast: Math.max(0, Math.round(forecast)), history: values });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/ml/savings
router.get('/savings', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const start = new Date();
        start.setMonth(start.getMonth() - 1); // last month

        const agg = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: start }, type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $count: {} } } },
            { $sort: { total: -1 } }
        ]);

        if (agg.length === 0) return res.json({ tip: 'No expenses yet. Good start!' });

        const totalExpense = agg.reduce((sum, cat) => sum + cat.total, 0);
        const topCat = agg[0];
        const topCatPercentage = ((topCat.total / totalExpense) * 100).toFixed(1);

        // Find categories with unusually high spending
        const avgExpense = totalExpense / agg.length;
        const wastefulCategories = agg.filter(cat => cat.total > avgExpense * 1.5);

        let tip = '';
        if (wastefulCategories.length > 0) {
            const wastefulCat = wastefulCategories[0];
            const savingsPotential = Math.round(wastefulCat.total * 0.15); // 15% reduction target
            tip = `💡 You spent ₹${wastefulCat.total.toLocaleString()} on ${wastefulCat._id} (${topCatPercentage}% of total). Try reducing by 15% to save ₹${savingsPotential.toLocaleString()}!`;
        } else {
            const savingsPotential = Math.round(topCat.total * 0.1);
            tip = `👍 Your spending is well-distributed! Consider reducing ${topCat._id} by 10% to save ₹${savingsPotential.toLocaleString()}.`;
        }

        res.json({
            tip,
            breakdown: agg.slice(0, 5).map(cat => ({
                category: cat._id,
                amount: cat.total,
                percentage: ((cat.total / totalExpense) * 100).toFixed(1)
            })),
            totalExpense
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;

