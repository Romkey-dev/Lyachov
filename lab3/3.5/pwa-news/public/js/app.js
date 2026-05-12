const state = {
    currentCategory: 'general',
    isOffline: false,
    searchQuery: ''
};

const newsGrid = document.getElementById('newsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const offlineIndicator = document.getElementById('offlineIndicator');
const navButtons = document.querySelectorAll('.nav-btn');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchClose = document.getElementById('searchClose');
const installBtn = document.getElementById('installBtn');

let deferredPrompt = null;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('news-pwa-db', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('articles')) {
                db.createObjectStore('articles', { keyPath: 'url' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveArticlesToCache(articles) {
    const db = await openDatabase();
    const transaction = db.transaction('articles', 'readwrite');
    const store = transaction.objectStore('articles');
    articles.forEach((article) => store.put(article));
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

async function getCachedArticles() {
    const db = await openDatabase();
    const transaction = db.transaction('articles', 'readonly');
    const store = transaction.objectStore('articles');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function setLoading(isLoading) {
    loadingSpinner.classList.toggle('hidden', !isLoading);
}

function showError(show) {
    errorMessage.classList.toggle('hidden', !show);
}

function renderArticles(articles) {
    if (!articles.length) {
        newsGrid.innerHTML = '<p>Новостей не найдено.</p>';
        return;
    }

    newsGrid.innerHTML = articles.map((article) => {
        const image = article.urlToImage || 'https://via.placeholder.com/600x400?text=News';
        const publishedAt = new Date(article.publishedAt || Date.now()).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const url = article.url || '#';
        return `
            <article class="news-card">
                <a href="${url}" target="_blank" rel="noopener noreferrer">
                    <img src="${image}" alt="${article.title}" loading="lazy">
                    <div class="news-content">
                        <h2 class="news-title">${article.title}</h2>
                        <p class="news-description">${article.description || ''}</p>
                        <div class="news-meta">
                            <span class="news-source">${article.source?.name || 'Источник'}</span>
                            <span>${publishedAt}</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }).join('');
}

async function loadNews(category) {
    setLoading(true);
    showError(false);

    const url = category ? `/api/news?category=${encodeURIComponent(category)}` : '/api/news';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка сети');
        const data = await response.json();
        const articles = data.articles || [];
        renderArticles(articles);
        await saveArticlesToCache(articles.map(article => ({ ...article, cachedAt: Date.now() })));
    } catch (error) {
        const cached = await getCachedArticles();
        if (cached.length) {
            renderArticles(cached);
            offlineIndicator.classList.remove('hidden');
        } else {
            showError(true);
        }
    } finally {
        setLoading(false);
    }
}

function setActiveCategory(category) {
    state.currentCategory = category;
    navButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    loadNews(category);
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    searchBar.classList.add('hidden');
    setLoading(true);
    fetch(`/api/news/search?q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then(async (data) => {
            renderArticles(data.articles || []);
            await saveArticlesToCache(data.articles || []);
        })
        .catch(async () => {
            const cached = await getCachedArticles();
            renderArticles(cached);
        })
        .finally(() => setLoading(false));
}

function checkOnlineStatus() {
    state.isOffline = !navigator.onLine;
    offlineIndicator.classList.toggle('hidden', !state.isOffline);
}

function setupEventListeners() {
    navButtons.forEach((button) => {
        button.addEventListener('click', () => setActiveCategory(button.dataset.category));
    });

    searchToggle.addEventListener('click', () => searchBar.classList.toggle('hidden'));
    searchBtn.addEventListener('click', handleSearch);
    searchClose.addEventListener('click', () => searchBar.classList.add('hidden'));
    retryBtn.addEventListener('click', () => loadNews(state.currentCategory));

    window.addEventListener('offline', () => {
        checkOnlineStatus();
    });
    window.addEventListener('online', () => {
        checkOnlineStatus();
        loadNews(state.currentCategory);
    });

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        }
    });
}

async function initApp() {
    setupEventListeners();
    checkOnlineStatus();
    await loadNews(state.currentCategory);
}

initApp();
