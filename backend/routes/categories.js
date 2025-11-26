const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// GET /api/categories - Get all categories for the current user
router.get('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const categories = await Category.find({ user: userId }).sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/categories - Create a new category
router.post('/', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { name, type, icon, color, subcategories } = req.body;

        if (!name || !type) {
            return res.status(400).json({ msg: 'Name and type are required' });
        }

        const category = new Category({
            user: userId,
            name,
            type,
            icon: icon || '📁',
            color: color || '#6366f1',
            subcategories: subcategories || []
        });

        await category.save();
        res.json(category);
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Category name already exists' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { name, icon, color, subcategories } = req.body;

        const category = await Category.findOne({
            _id: req.params.id,
            user: userId
        });

        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        if (category.isDefault) {
            return res.status(400).json({ msg: 'Cannot modify default categories' });
        }

        if (name) category.name = name;
        if (icon) category.icon = icon;
        if (color) category.color = color;
        if (subcategories !== undefined) category.subcategories = subcategories;

        await category.save();
        res.json(category);
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Category name already exists' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const category = await Category.findOne({
            _id: req.params.id,
            user: userId
        });

        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }

        if (category.isDefault) {
            return res.status(400).json({ msg: 'Cannot delete default categories' });
        }

        await Category.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Category deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/categories/init-defaults - Initialize default categories for user
router.post('/init-defaults', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Check if user already has categories
        const existingCount = await Category.countDocuments({ user: userId });
        if (existingCount > 0) {
            return res.json({ msg: 'Categories already initialized' });
        }

        const defaultCategories = [
            // Expense categories
            {
                name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', subcategories: [
                    { name: 'Groceries', icon: '🛒' },
                    { name: 'Restaurants', icon: '🍽️' },
                    { name: 'Fast Food', icon: '🍕' }
                ]
            },
            {
                name: 'Transportation', type: 'expense', icon: '🚗', color: '#3b82f6', subcategories: [
                    { name: 'Fuel', icon: '⛽' },
                    { name: 'Public Transport', icon: '🚌' },
                    { name: 'Taxi/Cab', icon: '🚕' }
                ]
            },
            {
                name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', subcategories: [
                    { name: 'Clothing', icon: '👕' },
                    { name: 'Electronics', icon: '📱' },
                    { name: 'Home & Garden', icon: '🏡' }
                ]
            },
            {
                name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8b5cf6', subcategories: [
                    { name: 'Movies', icon: '🎥' },
                    { name: 'Games', icon: '🎮' },
                    { name: 'Sports', icon: '⚽' }
                ]
            },
            {
                name: 'Bills & Utilities', type: 'expense', icon: '📄', color: '#f59e0b', subcategories: [
                    { name: 'Electricity', icon: '💡' },
                    { name: 'Water', icon: '💧' },
                    { name: 'Internet', icon: '🌐' }
                ]
            },
            {
                name: 'Healthcare', type: 'expense', icon: '🏥', color: '#10b981', subcategories: [
                    { name: 'Doctor', icon: '👨‍⚕️' },
                    { name: 'Pharmacy', icon: '💊' },
                    { name: 'Insurance', icon: '🩺' }
                ]
            },
            {
                name: 'Education', type: 'expense', icon: '📚', color: '#14b8a6', subcategories: [
                    { name: 'Books', icon: '📖' },
                    { name: 'Courses', icon: '🎓' },
                    { name: 'Tuition', icon: '🏫' }
                ]
            },
            { name: 'Other', type: 'expense', icon: '📦', color: '#6b7280', subcategories: [] },

            // Income categories
            { name: 'Salary', type: 'income', icon: '💰', color: '#10b981', subcategories: [] },
            { name: 'Freelance', type: 'income', icon: '💼', color: '#14b8a6', subcategories: [] },
            { name: 'Investment', type: 'income', icon: '📈', color: '#06b6d4', subcategories: [] },
            { name: 'Gift', type: 'income', icon: '🎁', color: '#ec4899', subcategories: [] },
            { name: 'Other Income', type: 'income', icon: '💵', color: '#6b7280', subcategories: [] }
        ];

        const categories = defaultCategories.map(cat => ({
            ...cat,
            user: userId,
            isDefault: true
        }));

        await Category.insertMany(categories);
        res.json({ msg: 'Default categories initialized', count: categories.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
