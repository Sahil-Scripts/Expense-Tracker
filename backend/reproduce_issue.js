const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:5000/api' }));

async function run() {
    try {
        console.log('1. Logging in...');
        await client.post('/auth/login', { email: 'demo@local', password: 'password123' });
        console.log('Login success');

        console.log('2. Adding transaction...');
        const tx = {
            type: 'expense',
            amount: 50,
            category: 'Food',
            date: new Date(),
            note: 'Test transaction'
        };
        const res = await client.post('/transactions', tx);
        console.log('Add success:', res.data);

        console.log('3. Fetching transactions...');
        const list = await client.get('/transactions');
        console.log('List count:', list.data.length);
        console.log('Latest:', list.data[0]);

        console.log('4. Fetching trends...');
        const trends = await client.get('/dashboard/trends');
        console.log('Trends:', trends.data);

    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}

run();
