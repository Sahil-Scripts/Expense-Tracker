const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, default: '📌' }
}, { _id: true });

const CategorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String, default: '📁' },
    color: { type: String, default: '#6366f1' },
    isDefault: { type: Boolean, default: false },
    subcategories: [SubcategorySchema]
}, { timestamps: true });

// Compound index to ensure unique category names per user
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
