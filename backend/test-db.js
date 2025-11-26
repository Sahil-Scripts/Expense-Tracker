require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri ? uri.split('@')[1] : 'undefined'); // Log only the host part for safety

if (!uri) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('ERROR: Failed to connect.');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        if (err.reason) console.error('Reason:', err.reason);
        process.exit(1);
    });
