const API = '';
let currentUser = null;
let authToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

async function initApp() {
  const token = localStorage.getItem('sikka_token');
  if (token) {
    authToken = token;
    await loadUserProfile();
  }
  loadHomeData();
}

// API Helper
async function api(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const response = await fetch(`${API}/api${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Navigation
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  window.scrollTo(0, 0);

  switch(page) {
    case 'home': loadHomeData(); break;
    case 'blog': loadPosts(); break;
    case 'profile': loadProfile(); break;
  }
}

// Auth
async function loadUserProfile() {
  try {
    const data = await api('/auth/profile');
    currentUser = data.user;
    updateProfileUI();
  } catch (error) {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('sikka_token');
  }
}

function updateProfileUI() {
  if (currentUser) {
    document.getElementById('profile-name').textContent = currentUser.displayName || 'User';
    document.getElementById('profile-email').textContent = currentUser.email || currentUser.phoneNumber || '';
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('profile-menu').style.display = 'block';
  } else {
    document.getElementById('auth-buttons').style.display = 'block';
    document.getElementById('profile-menu').style.display = 'none';
  }
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function hideAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

async function loginWithPhone() {
  const phone = document.getElementById('phone-input').value;
  if (!phone) return showToast('Enter your phone number', 'error');

  try {
    const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      }, getAuth());
    }

    const confirmation = await signInWithPhoneNumber(getAuth(), phone, window.recaptchaVerifier);
    const code = prompt('Enter the verification code:');
    if (code) {
      const result = await confirmation.confirm(code);
      const token = await result.user.getIdToken();
      authToken = token;
      localStorage.setItem('sikka_token', token);
      await api('/auth/register', { method: 'POST' });
      await loadUserProfile();
      hideAuthModal();
      showToast('Welcome to Sikka!');
    }
  } catch (error) {
    showToast('Login failed: ' + error.message, 'error');
  }
}

async function loginWithGoogle() {
  try {
    const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(getAuth(), provider);
    const token = await result.user.getIdToken();
    authToken = token;
    localStorage.setItem('sikka_token', token);
    await api('/auth/register', { method: 'POST' });
    await loadUserProfile();
    hideAuthModal();
    showToast('Welcome to Sikka!');
  } catch (error) {
    showToast('Google login failed', 'error');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('sikka_token');
  updateProfileUI();
  showToast('Logged out');
  navigateTo('home');
}

// Home
async function loadHomeData() {
  try {
    const [categoriesData, businessesData, postsData] = await Promise.all([
      api('/categories'),
      api('/businesses?limit=10'),
      api('/posts?limit=5'),
    ]);

    renderCategories(categoriesData.categories);
    renderBusinesses(businessesData.businesses);
    renderPosts(postsData.posts);
  } catch (error) {
    console.error('Load home error:', error);
  }
}

function renderCategories(categories) {
  const container = document.getElementById('categories-list');
  container.innerHTML = categories.map(cat => `
    <button class="category-chip" onclick="filterByCategory('${cat.id}')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
      ${cat.nameAr || cat.name}
    </button>
  `).join('');
}

function renderBusinesses(businesses) {
  const container = document.getElementById('businesses-list');
  if (businesses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/>
        </svg>
        <h3>No businesses yet</h3>
        <p>Be the first to add your business!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = businesses.map(biz => `
    <div class="business-card" onclick="openBusiness('${biz.slug || biz.id}')">
      <div class="business-card-image">
        ${biz.media?.coverImage ? `<img src="${biz.media.coverImage}" alt="${biz.name}" loading="lazy">` : ''}
        ${biz.isVerified ? '<span class="business-card-badge">Verified</span>' : ''}
        <button class="business-card-fav" onclick="event.stopPropagation(); toggleFavorite('${biz.id}', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="business-card-body">
        <div class="business-card-name">${biz.nameAr || biz.name}</div>
        <div class="business-card-category">${biz.categoryNameAr || biz.categoryName}</div>
        <div class="business-card-meta">
          <span class="business-card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ${biz.rating?.average?.toFixed(1) || '0.0'}
          </span>
          <span class="business-card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${biz.location?.cityAr || biz.location?.city || ''}
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPosts(posts) {
  const container = document.getElementById('posts-list');
  if (posts.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No posts yet</p>';
    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="post-card" onclick="openPost('${post.slug}')">
      <div class="post-card-image">
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" loading="lazy">` : ''}
      </div>
      <div class="post-card-content">
        <div class="post-card-title">${post.titleAr || post.title}</div>
        <div class="post-card-meta">
          <span>${post.readTime || 5} min read</span>
          <span>${formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Search
let searchTimeout;
async function handleSearch(query) {
  clearTimeout(searchTimeout);
  if (!query || query.length < 2) {
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-results').style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const data = await api(`/search/businesses?q=${encodeURIComponent(query)}&limit=5`);
      renderSearchResults(data.hits);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);
}

function renderSearchResults(results) {
  const container = document.getElementById('search-results');
  if (results.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No results found</div>';
  } else {
    container.innerHTML = results.map(hit => `
      <div class="post-card" onclick="openBusiness('${hit.slug || hit.id}')" style="margin-bottom: 8px; cursor: pointer;">
        <div class="post-card-content">
          <div class="post-card-title">${hit.nameAr || hit.name}</div>
          <div class="post-card-meta">
            <span>${hit.categoryNameAr || hit.categoryName}</span>
            <span>${hit.location?.cityAr || hit.location?.city}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  container.style.display = 'block';
}

// Business Detail
async function openBusiness(slugOrId) {
  try {
    let data;
    if (slugOrId.includes('-')) {
      data = await api(`/businesses/slug/${slugOrId}`);
    } else {
      data = await api(`/businesses/${slugOrId}`);
    }
    renderBusinessDetail(data);
    document.getElementById('page-business').classList.add('active');
    document.querySelectorAll('.page:not(#page-business)').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  } catch (error) {
    showToast('Business not found', 'error');
  }
}

function renderBusinessDetail(biz) {
  const container = document.getElementById('business-detail');
  const hours = biz.workingHours || {};
  const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  container.innerHTML = `
    <div class="business-detail-header">
      ${biz.media?.coverImage ? `<img src="${biz.media.coverImage}" alt="${biz.name}">` : ''}
      <button class="back-btn" onclick="closeBusiness()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </div>
    <div class="business-detail-info">
      <div class="business-detail-name">${biz.nameAr || biz.name}</div>
      <div class="business-detail-category">${biz.categoryNameAr || biz.categoryName}</div>
      <div class="business-detail-stats">
        <span class="stat-item">
          <svg viewBox="0 0 24 24" fill="currentColor" style="color: var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${biz.rating?.average?.toFixed(1) || '0.0'} (${biz.rating?.count || 0})
        </span>
        <span class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${biz.totalViews || 0} views
        </span>
      </div>

      ${biz.descriptionAr || biz.description ? `
        <div class="detail-section">
          <div class="detail-section-title">About</div>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
            ${biz.descriptionAr || biz.description}
          </p>
        </div>
      ` : ''}

      <div class="action-buttons">
        ${biz.contact?.phone ? `
          <a href="tel:${biz.contact.phone}" class="action-btn call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </a>
        ` : ''}
        ${biz.contact?.whatsapp ? `
          <a href="https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}" class="action-btn whatsapp" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        ` : ''}
        ${biz.location?.googleMapsUrl ? `
          <a href="${biz.location.googleMapsUrl}" class="action-btn map" target="_blank">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Map
          </a>
        ` : ''}
      </div>

      ${Object.keys(hours).length > 0 ? `
        <div class="detail-section">
          <div class="detail-section-title">Working Hours</div>
          ${days.map((day, i) => `
            <div class="hours-row">
              <span class="hours-day">${dayNames[i]}</span>
              ${hours[day]?.isOpen
                ? `<span class="hours-time">${hours[day].open} - ${hours[day].close}</span>`
                : `<span class="hours-closed">Closed</span>`
              }
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="detail-section">
        <div class="detail-section-title">Reviews</div>
        <div id="reviews-container">
          <div class="loading-spinner"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;

  loadReviews(biz.id);
}

function closeBusiness() {
  document.getElementById('page-business').classList.remove('active');
  document.getElementById('page-home').classList.add('active');
  document.querySelector('[data-page="home"]').classList.add('active');
}

async function loadReviews(businessId) {
  try {
    const data = await api(`/businesses/${businessId}/reviews`);
    const container = document.getElementById('reviews-container');

    if (data.reviews.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No reviews yet</p>';
      return;
    }

    container.innerHTML = data.reviews.map(review => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${review.userName?.charAt(0) || '?'}</div>
          <div>
            <div class="review-name">${review.userName}</div>
            <div class="review-date">${formatDate(review.createdAt)}</div>
          </div>
        </div>
        <div class="review-rating">
          ${Array(5).fill(0).map((_, i) => `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${i < review.rating ? 'var(--warning)' : 'none'}" stroke="${i < review.rating ? 'var(--warning)' : 'var(--text-muted)'}" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          `).join('')}
        </div>
        <div class="review-text">${review.commentAr || review.comment}</div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('reviews-container').innerHTML = '<p style="color: var(--text-muted);">Failed to load reviews</p>';
  }
}

// Posts
async function loadPosts() {
  try {
    const data = await api('/posts');
    const container = document.getElementById('blog-list');

    if (data.posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
          <h3>No articles yet</h3>
          <p>Check back later for tips and guides</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.posts.map(post => `
      <div class="post-card" onclick="openPost('${post.slug}')">
        <div class="post-card-image">
          ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" loading="lazy">` : ''}
        </div>
        <div class="post-card-content">
          <div class="post-card-title">${post.titleAr || post.title}</div>
          <div class="post-card-meta">
            <span>${post.readTime || 5} min read</span>
            <span>${formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Load posts error:', error);
  }
}

async function openPost(slug) {
  try {
    const data = await api(`/posts/slug/${slug}`);
    renderPostDetail(data);
    document.getElementById('page-post-detail').classList.add('active');
    document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
  } catch (error) {
    showToast('Post not found', 'error');
  }
}

function renderPostDetail(post) {
  const container = document.getElementById('post-detail');
  container.innerHTML = `
    <div style="padding: 20px;">
      <button onclick="closePost()" style="display: flex; align-items: center; gap: 8px; color: var(--primary); margin-bottom: 16px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>
      ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" style="width: 100%; border-radius: 16px; margin-bottom: 20px;">` : ''}
      <h1 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 8px;">${post.titleAr || post.title}</h1>
      <div style="display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">
        <span>${post.authorName}</span>
        <span>${formatDate(post.publishedAt)}</span>
        <span>${post.readTime} min read</span>
      </div>
      <div style="color: var(--text-secondary); line-height: 1.8; font-size: 0.95rem;">
        ${post.contentAr || post.content}
      </div>
    </div>
  `;
}

function closePost() {
  document.getElementById('page-post-detail').classList.remove('active');
  document.getElementById('page-blog').classList.add('active');
}

// Favorites
async function toggleFavorite(businessId, btn) {
  if (!currentUser) {
    showAuthModal();
    return;
  }

  try {
    const data = await api(`/auth/favorites/${businessId}`, { method: 'POST' });
    btn.classList.toggle('active');
    showToast(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
  } catch (error) {
    showToast('Failed to update favorite', 'error');
  }
}

// Profile
async function loadProfile() {
  if (!currentUser) return;
  try {
    const data = await api('/auth/profile');
    currentUser = data.user;
    updateProfileUI();
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });

  document.getElementById('search-input')?.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  document.addEventListener('click', (e) => {
    const searchResults = document.getElementById('search-results');
    const searchBox = document.querySelector('.search-box');
    if (searchResults && !searchBox?.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

// Make functions globally available
window.navigateTo = navigateTo;
window.openBusiness = openBusiness;
window.openPost = openPost;
window.closeBusiness = closeBusiness;
window.closePost = closePost;
window.toggleFavorite = toggleFavorite;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.loginWithPhone = loginWithPhone;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.filterByCategory = (catId) => { console.log('Filter:', catId); };
