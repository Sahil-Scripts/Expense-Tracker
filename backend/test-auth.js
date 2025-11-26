const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:5000/api' }));

async function run() {
    try {
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        console.log('1. Registering...', email);
        const reg = await client.post('/auth/register', { name: 'Test User', email, password });
        console.log('Register success:', reg.data);

        console.log('2. Logging in...');
        const login = await client.post('/auth/login', { email, password });
        console.log('Login success:', login.data);

        console.log('3. Checking /me...');
        const me = await client.get('/auth/me');
        console.log('Me success:', me.data);

    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}

run();
