// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // adjust path if needed

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to mongo for seeding');

    const demoEmail = 'demo@local';
    const existing = await User.findOne({ email: demoEmail });
    if (existing) {
      console.log('Demo user already exists:', existing.email);
      process.exit(0);
    }

    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const demoUser = new User({
      name: 'Demo User',
      email: demoEmail,
      passwordHash: hash
    });

    await demoUser.save();
    console.log('Demo user created:', demoUser.email, 'password:', password);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

seed();
