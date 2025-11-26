// frontend/src/components/CategoryManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function CategoryManager({ onClose }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('expense');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: '📁',
        color: '#6366f1',
        type: 'expense',
        subcategories: []
    });
    const [newSubcategory, setNewSubcategory] = useState({ name: '', icon: '📌' });

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            await fetchCategories();
            resetForm();
        } catch (err) {
            console.error('Failed to save category', err);
            alert(err.response?.data?.msg || 'Failed to save category');
        }
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            await fetchCategories();
        } catch (err) {
            console.error('Failed to delete category', err);
            alert(err.response?.data?.msg || 'Failed to delete category');
        }
    }

    function resetForm() {
        setFormData({
            name: '',
            icon: '📁',
            color: '#6366f1',
            type: activeTab,
            subcategories: []
        });
        setEditingId(null);
    }

    function startEdit(category) {
        setFormData({
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type,
            subcategories: category.subcategories || []
        });
        setEditingId(category._id);
        setActiveTab(category.type);
    }

    function addSubcategory() {
        if (!newSubcategory.name.trim()) return;
        setFormData({
            ...formData,
            subcategories: [...formData.subcategories, { ...newSubcategory }]
        });
        setNewSubcategory({ name: '', icon: '📌' });
    }

    function removeSubcategory(index) {
        setFormData({
            ...formData,
            subcategories: formData.subcategories.filter((_, i) => i !== index)
        });
    }

    const filteredCategories = categories.filter(c => c.type === activeTab);

    const commonIcons = ['📁', '🍔', '🚗', '🛍️', '🎬', '📄', '🏥', '📚', '💰', '💼', '📈', '🎁', '💵', '⚡', '🏠'];
    const commonColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Categories</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your expense and income categories</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 px-6">
                    <button
                        onClick={() => { setActiveTab('expense'); resetForm(); }}
                        className={`px-4 py-3 font-medium transition-colors ${activeTab === 'expense'
                                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        💸 Expenses
                    </button>
                    <button
                        onClick={() => { setActiveTab('income'); resetForm(); }}
                        className={`px-4 py-3 font-medium transition-colors ${activeTab === 'income'
                                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        💰 Income
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Category Form */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                {editingId ? 'Edit Category' : 'New Category'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g., Groceries"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Icon
                                    </label>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter emoji"
                                        />
                                        <div className="text-3xl">{formData.icon}</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {commonIcons.map(icon => (
                                            <button
                                                key={icon}
                                                onClick={() => setFormData({ ...formData, icon })}
                                                className={`text-2xl p-2 rounded-lg transition-all ${formData.icon === icon
                                                        ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500'
                                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Color
                                    </label>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {commonColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Subcategories
                                    </label>

                                    {formData.subcategories.length > 0 && (
                                        <div className="mb-3 space-y-2">
                                            {formData.subcategories.map((sub, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg">
                                                    <span className="text-xl">{sub.icon}</span>
                                                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{sub.name}</span>
                                                    <button
                                                        onClick={() => removeSubcategory(idx)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSubcategory.icon}
                                            onChange={(e) => setNewSubcategory({ ...newSubcategory, icon: e.target.value })}
                                            className="w-16 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                                            placeholder="🏷️"
                                        />
                                        <input
                                            type="text"
                                            value={newSubcategory.name}
                                            onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && addSubcategory()}
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Subcategory name"
                                        />
                                        <button
                                            onClick={addSubcategory}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                                    >
                                        {editingId ? 'Update' : 'Create'} Category
                                    </button>
                                    {editingId && (
                                        <button
                                            onClick={resetForm}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Category List */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                Existing Categories
                            </h3>

                            {loading ? (
                                <div className="text-center py-8 text-slate-500">Loading...</div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No categories yet. Create your first one!</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredCategories.map(category => (
                                        <div
                                            key={category._id}
                                            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="text-2xl w-12 h-12 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                                    >
                                                        {category.icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white">{category.name}</div>
                                                        {category.subcategories && category.subcategories.length > 0 && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {category.subcategories.length} subcategories
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {!category.isDefault && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEdit(category)}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category._id)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                                {category.isDefault && (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>

                                            {category.subcategories && category.subcategories.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    {category.subcategories.map((sub, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full flex items-center gap-1"
                                                        >
                                                            <span>{sub.icon}</span>
                                                            <span>{sub.name}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
