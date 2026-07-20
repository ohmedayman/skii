const API = '';
let currentUser = null;
let authToken = null;

// Categories with emojis
const CATEGORY_ICONS = {
  'coffee-shops': { emoji: '☕', color: '#8B5CF6', name: 'مقاهي', nameEn: 'Coffee Shops' },
  'restaurants': { emoji: '🍽️', color: '#EF4444', name: 'مطاعم', nameEn: 'Restaurants' },
  'shopping': { emoji: '🛍️', color: '#F59E0B', name: 'تسوق', nameEn: 'Shopping' },
  'services': { emoji: '🔧', color: '#3B82F6', name: 'خدمات', nameEn: 'Services' },
  'health': { emoji: '💊', color: '#EC4899', name: 'صحة وجمال', nameEn: 'Health' },
  'automotive': { emoji: '🚗', color: '#10B981', name: 'سيارات', nameEn: 'Automotive' },
  'education': { emoji: '📚', color: '#6366F1', name: 'تعليم', nameEn: 'Education' },
  'real-estate': { emoji: '🏠', color: '#14B8A6', name: 'عقارات', nameEn: 'Real Estate' },
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupSearch();
  setupMobileNav();
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
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');

  const navLink = document.querySelector(`[data-nav="${page}"]`);
  if (navLink) navLink.classList.add('active');

  const mobileItem = document.querySelector(`.mobile-nav-item[data-page="${page}"]`);
  if (mobileItem) mobileItem.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch(page) {
    case 'home': loadHomeData(); break;
    case 'blog': loadPosts(); break;
    case 'profile': loadProfile(); break;
  }
}

// Search
function setupSearch() {
  const input = document.getElementById('search-input');
  let timeout;
  input?.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => performSearch(), 500);
  });
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

async function performSearch() {
  const query = document.getElementById('search-input')?.value?.trim();
  if (!query) { loadHomeData(); return; }
  try {
    const data = await api(`/search/businesses?q=${encodeURIComponent(query)}&limit=12`);
    renderBusinesses(data.hits);
  } catch (error) {
    console.error('Search error:', error);
  }
}

function quickSearch(term) {
  document.getElementById('search-input').value = term;
  performSearch();
}

// Mobile Nav
function setupMobileNav() {
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

// Home Data
async function loadHomeData() {
  try {
    const [categoriesData, businessesData, postsData] = await Promise.all([
      api('/categories').catch(() => ({ categories: [] })),
      api('/businesses?limit=6').catch(() => ({ businesses: [] })),
      api('/posts?limit=3').catch(() => ({ posts: [] })),
    ]);

    renderCategories(categoriesData.categories || getDefaultCategories());
    renderBusinesses(businessesData.businesses || []);
    renderPosts(postsData.posts || []);
  } catch (error) {
    renderCategories(getDefaultCategories());
    renderBusinesses([]);
    renderPosts([]);
  }
}

function getDefaultCategories() {
  return Object.entries(CATEGORY_ICONS).map(([slug, cat]) => ({
    id: slug,
    slug,
    name: cat.nameEn,
    nameAr: cat.name,
    businessCount: Math.floor(Math.random() * 200) + 50,
  }));
}

// Render Categories
function renderCategories(categories) {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  grid.innerHTML = categories.map(cat => {
    const catInfo = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS['services'];
    return `
      <div class="category-card" onclick="quickSearch('${cat.nameAr || cat.name}')">
        <div class="category-icon" style="background: ${catInfo.color}20;">
          <span>${catInfo.emoji}</span>
        </div>
        <div class="category-name">${cat.nameAr || cat.name}</div>
        <div class="category-count">${cat.businessCount || 0} نشاط</div>
      </div>
    `;
  }).join('');
}

// Render Businesses
function renderBusinesses(businesses) {
  const grid = document.getElementById('businesses-grid');
  if (!grid) return;

  if (businesses.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/>
        </svg>
        <h3>لا توجد أعمال بعد</h3>
        <p>كن أول من يضيف نشاطه التجاري</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = businesses.map(biz => `
    <div class="business-card" onclick="openBusiness('${biz.slug || biz.id}')">
      <div class="business-card-img">
        ${biz.media?.coverImage ? `<img src="${biz.media.coverImage}" alt="${biz.nameAr || biz.name}" loading="lazy">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));display:flex;align-items:center;justify-content:center;font-size:3rem;">${CATEGORY_ICONS[biz.slug?.split('-')[0]]?.emoji || '🏪'}</div>`}
        <div class="business-badge">
          ${biz.isVerified ? '<span class="badge badge-verified">موثق</span>' : ''}
          ${biz.isFeatured ? '<span class="badge badge-featured">مميز</span>' : ''}
        </div>
        <button class="business-fav" onclick="event.stopPropagation(); toggleFavorite('${biz.id}', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="business-card-body">
        <div class="business-card-name">${biz.nameAr || biz.name}</div>
        <div class="business-card-cat">${biz.categoryNameAr || biz.categoryName}</div>
        <div class="business-card-info">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${biz.location?.cityAr || biz.location?.city || ''}
          </span>
        </div>
      </div>
      <div class="business-card-footer">
        <div class="business-rating">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${biz.rating?.average?.toFixed(1) || '0.0'}
        </div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${biz.rating?.count || 0} تقييم</span>
      </div>
    </div>
  `).join('');
}

// Render Posts
function renderPosts(posts) {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  if (posts.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        <h3>لا توجد مقالات بعد</h3>
      </div>
    `;
    return;
  }

  grid.innerHTML = posts.map(post => `
    <div class="blog-card" onclick="openPost('${post.slug}')">
      <div class="blog-card-img">
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.titleAr || post.title}" loading="lazy">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));display:flex;align-items:center;justify-content:center;font-size:2rem;">📝</div>`}
      </div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${post.categoryAr || post.category}</span>
        <div class="blog-card-title">${post.titleAr || post.title}</div>
        <div class="blog-card-excerpt">${post.excerptAr || post.excerpt || ''}</div>
        <div class="blog-card-meta">
          <span>${post.readTime || 5} دقائق قراءة</span>
          <span>•</span>
          <span>${formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Business Detail
async function openBusiness(slugOrId) {
  try {
    let data;
    if (String(slugOrId).includes('-') && slugOrId.length > 10) {
      data = await api(`/businesses/slug/${slugOrId}`);
    } else {
      data = await api(`/businesses/${slugOrId}`);
    }
    renderBusinessDetail(data);
    document.getElementById('page-business').classList.add('active');
    document.querySelectorAll('.page:not(#page-business)').forEach(p => p.classList.remove('active'));
    window.scrollTo({ top: 0 });
  } catch (error) {
    showToast('النشاط غير موجود', 'error');
  }
}

function renderBusinessDetail(biz) {
  const container = document.getElementById('business-detail');
  const hours = biz.workingHours || {};
  const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  container.innerHTML = `
    <div class="detail-hero">
      ${biz.media?.coverImage ? `<img src="${biz.media.coverImage}" alt="${biz.name}">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));"></div>`}
      <button class="back-btn" onclick="closeDetail()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
    <div class="detail-content">
      <h1 class="detail-name">${biz.nameAr || biz.name}</h1>
      <div class="detail-category">${biz.categoryNameAr || biz.categoryName}</div>

      <div class="detail-stats">
        <span class="detail-stat">
          <svg viewBox="0 0 24 24" fill="var(--warning)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${biz.rating?.average?.toFixed(1) || '0.0'} (${biz.rating?.count || 0} تقييم)
        </span>
        <span class="detail-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${biz.totalViews || 0} مشاهدة
        </span>
        <span class="detail-stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${biz.location?.cityAr || biz.location?.city || ''}
        </span>
      </div>

      ${biz.descriptionAr || biz.description ? `
        <div class="detail-section">
          <h3>عن النشاط</h3>
          <p>${biz.descriptionAr || biz.description}</p>
        </div>
      ` : ''}

      <div class="detail-actions">
        ${biz.contact?.phone ? `<a href="tel:${biz.contact.phone}" class="btn btn-call btn-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> اتصل</a>` : ''}
        ${biz.contact?.whatsapp ? `<a href="https://wa.me/${biz.contact.whatsapp.replace(/[^0-9]/g, '')}" class="btn btn-whatsapp btn-lg" target="_blank"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> واتساب</a>` : ''}
        ${biz.location?.googleMapsUrl ? `<a href="${biz.location.googleMapsUrl}" class="btn btn-map btn-lg" target="_blank"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> الموقع</a>` : ''}
      </div>

      ${Object.keys(hours).length > 0 ? `
        <div class="detail-section">
          <h3>ساعات العمل</h3>
          ${days.map((day, i) => `
            <div class="hours-row">
              <span style="color: var(--text-secondary);">${dayNames[i]}</span>
              ${hours[day]?.isOpen
                ? `<span>${hours[day].open} - ${hours[day].close}</span>`
                : `<span style="color: var(--danger);">مغلق</span>`
              }
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="detail-section">
        <h3>التقييمات</h3>
        <div id="reviews-container"><div class="loading"><div class="spinner"></div></div></div>
      </div>
    </div>
  `;

  loadReviews(biz.id);
}

function closeDetail() {
  document.getElementById('page-business').classList.remove('active');
  document.getElementById('page-home').classList.add('active');
}

async function loadReviews(businessId) {
  try {
    const data = await api(`/businesses/${businessId}/reviews`);
    const container = document.getElementById('reviews-container');
    if (!container) return;

    if (data.reviews.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted);">لا توجد تقييمات بعد</p>';
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
        <div class="review-stars">
          ${Array(5).fill(0).map((_, i) => `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${i < review.rating ? 'var(--warning)' : 'none'}" stroke="${i < review.rating ? 'var(--warning)' : 'var(--text-muted)'}" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          `).join('')}
        </div>
        <div class="review-text">${review.commentAr || review.comment}</div>
      </div>
    `).join('');
  } catch (error) {
    const container = document.getElementById('reviews-container');
    if (container) container.innerHTML = '<p style="color: var(--text-muted);">فشل تحميل التقييمات</p>';
  }
}

// Posts
async function loadPosts() {
  try {
    const data = await api('/posts');
    const grid = document.getElementById('blog-list');
    if (!grid) return;

    if (data.posts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
          <h3>لا توجد مقالات بعد</h3>
        </div>
      `;
      return;
    }

    grid.innerHTML = data.posts.map(post => `
      <div class="blog-card" onclick="openPost('${post.slug}')">
        <div class="blog-card-img">
          ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" loading="lazy">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--bg-elevated),var(--bg-card));display:flex;align-items:center;justify-content:center;font-size:2rem;">📝</div>`}
        </div>
        <div class="blog-card-body">
          <span class="blog-card-cat">${post.categoryAr || post.category}</span>
          <div class="blog-card-title">${post.titleAr || post.title}</div>
          <div class="blog-card-excerpt">${post.excerptAr || post.excerpt || ''}</div>
          <div class="blog-card-meta">
            <span>${post.readTime || 5} دقائق قراءة</span>
            <span>•</span>
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
    const container = document.getElementById('post-detail');
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 24px;">
        <button onclick="closeDetail()" style="display: flex; align-items: center; gap: 8px; color: var(--primary); margin-bottom: 24px; font-size: 0.9rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          العودة
        </button>
        ${data.coverImage ? `<img src="${data.coverImage}" alt="${data.title}" style="width: 100%; border-radius: var(--radius-xl); margin-bottom: 24px;">` : ''}
        <h1 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 12px;">${data.titleAr || data.title}</h1>
        <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 32px;">
          <span>${data.authorName}</span>
          <span>•</span>
          <span>${formatDate(data.publishedAt)}</span>
          <span>•</span>
          <span>${data.readTime} دقائق قراءة</span>
        </div>
        <div style="color: var(--text-secondary); line-height: 2; font-size: 1.05rem;">
          ${data.contentAr || data.content}
        </div>
      </div>
    `;
    document.getElementById('page-post-detail').classList.add('active');
    document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
    window.scrollTo({ top: 0 });
  } catch (error) {
    showToast('المقال غير موجود', 'error');
  }
}

// Favorites
async function toggleFavorite(businessId, btn) {
  if (!currentUser) { showAuthModal(); return; }
  try {
    const data = await api(`/auth/favorites/${businessId}`, { method: 'POST' });
    btn.classList.toggle('active');
    showToast(data.isFavorited ? 'تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة');
  } catch (error) {
    showToast('فشل تحديث المفضلة', 'error');
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
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const authBtns = document.getElementById('auth-buttons');
  const profileMenu = document.getElementById('profile-menu');

  if (currentUser) {
    if (nameEl) nameEl.textContent = currentUser.displayName || 'مستخدم';
    if (emailEl) emailEl.textContent = currentUser.email || currentUser.phoneNumber || '';
    if (authBtns) authBtns.style.display = 'none';
    if (profileMenu) profileMenu.style.display = 'block';
  } else {
    if (nameEl) nameEl.textContent = 'ضيف';
    if (emailEl) emailEl.textContent = 'سجّل الدخول للوصول لملفك الشخصي';
    if (authBtns) authBtns.style.display = 'block';
    if (profileMenu) profileMenu.style.display = 'none';
  }
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}

function hideAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

async function loginWithPhone() {
  const phone = document.getElementById('phone-input')?.value;
  if (!phone) return showToast('أدخل رقم جوالك', 'error');

  try {
    const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
    }

    const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    const code = prompt('أدخل رمز التحقق المرسل لجوالك:');
    if (code) {
      const result = await confirmation.confirm(code);
      const token = await result.user.getIdToken();
      authToken = token;
      localStorage.setItem('sikka_token', token);
      await api('/auth/register', { method: 'POST' });
      await loadUserProfile();
      hideAuthModal();
      showToast('مرحباً بك في سِكّة!');
    }
  } catch (error) {
    showToast('فشل تسجيل الدخول: ' + error.message, 'error');
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
    showToast('مرحباً بك في سِكّة!');
  } catch (error) {
    showToast('فشل تسجيل الدخول بـ Google', 'error');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('sikka_token');
  updateProfileUI();
  showToast('تم تسجيل الخروج');
  navigateTo('home');
}

// Submit Business
async function submitBusiness() {
  if (!currentUser) { showAuthModal(); return; }

  const name = document.getElementById('biz-name')?.value;
  const phone = document.getElementById('biz-phone')?.value;
  const city = document.getElementById('biz-city')?.value;

  if (!name || !phone || !city) return showToast('أكمل الحقول المطلوبة', 'error');

  try {
    await api('/businesses', {
      method: 'POST',
      body: JSON.stringify({
        name,
        nameAr: name,
        phone,
        whatsapp: document.getElementById('biz-whatsapp')?.value,
        city,
        cityAr: city,
        categoryId: document.getElementById('biz-category')?.value,
        categoryName: document.getElementById('biz-category')?.selectedOptions[0]?.text,
        categoryNameAr: document.getElementById('biz-category')?.selectedOptions[0]?.text,
        address: document.getElementById('biz-address')?.value,
        description: document.getElementById('biz-description')?.value,
        descriptionAr: document.getElementById('biz-description')?.value,
      }),
    });

    showToast('تم إضافة نشاطك بنجاح!');
    navigateTo('home');
  } catch (error) {
    showToast('فشل إضافة النشاط', 'error');
  }
}

// Helpers
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Make functions global
window.navigateTo = navigateTo;
window.openBusiness = openBusiness;
window.openPost = openPost;
window.closeDetail = closeDetail;
window.toggleFavorite = toggleFavorite;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.loginWithPhone = loginWithPhone;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.submitBusiness = submitBusiness;
window.performSearch = performSearch;
window.quickSearch = quickSearch;
