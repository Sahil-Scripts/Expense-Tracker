// backend/checkUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
  const u = await User.findOne({ email: process.argv[2] || 'demo@local' }).lean();
  console.log('found user ->', u ? {
    id: u._id,
    email: u.email,
    name: u.name,
    passwordHashPresent: !!u.passwordHash
  } : 'NOT FOUND');
  process.exit(0);
}
run().catch(e=>{ console.error(e); process.exit(1); });
