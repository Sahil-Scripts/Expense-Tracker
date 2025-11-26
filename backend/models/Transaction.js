const mongoose = require('mongoose');
const transSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String }, // Optional subcategory
  date: { type: Date, default: Date.now },
  note: { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Transaction', transSchema);
