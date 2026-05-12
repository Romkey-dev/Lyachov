const serviceWorkerPath = '/sw.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register(serviceWorkerPath);
            console.log('Service Worker registered', registration);
            initPush(registration);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    });
}

async function initPush(registration) {
    if (!('PushManager' in window)) return;

    const response = await fetch('/api/vapid-public-key');
    const data = await response.json();
    const publicKey = data.publicKey;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        try {
            const newSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubscription)
            });
            console.log('Subscribed to push notifications');
        } catch (error) {
            console.warn('Push subscription failed', error);
        }
    } else {
        console.log('Already subscribed to push notifications');
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
