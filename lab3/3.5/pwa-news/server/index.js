const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const webPush = require('web-push');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webPush.setVapidDetails(
    `mailto:${process.env.CONTACT_EMAIL}`,
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

let subscriptions = [];

async function fetchNews(endpoint, params) {
    const url = `${process.env.NEWS_API_URL}${endpoint}`;
    const response = await axios.get(url, {
        params: {
            apiKey: process.env.NEWS_API_KEY,
            language: 'ru',
            pageSize: 20,
            ...params
        }
    });
    return response.data;
}

app.get('/api/news', async (req, res) => {
    try {
        const category = req.query.category || 'general';
        const data = await fetchNews('/top-headlines', { category });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/news/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        const data = await fetchNews('/everything', { q, sortBy: 'publishedAt' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categories', (req, res) => {
    res.json({ categories: ['general', 'business', 'technology', 'sports', 'health', 'science', 'entertainment'] });
});

app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/subscribe', (req, res) => {
    const subscription = req.body;
    const exists = subscriptions.some((item) => item.endpoint === subscription.endpoint);
    if (!exists) {
        subscriptions.push(subscription);
    }
    res.status(201).json({ message: 'Subscribed successfully' });
});

app.post('/api/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter((item) => item.endpoint !== endpoint);
    res.json({ message: 'Unsubscribed successfully' });
});

app.post('/api/send-notification', async (req, res) => {
    const { title, body, url } = req.body;
    const payload = JSON.stringify({ title, body, url });

    const sendResults = await Promise.allSettled(
        subscriptions.map((sub) => webPush.sendNotification(sub, payload))
    );

    const succeeded = sendResults.filter((result) => result.status === 'fulfilled').length;
    res.json({ message: `Notifications sent to ${succeeded} subscribers` });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`VAPID Public Key: ${vapidKeys.publicKey}`);
});
