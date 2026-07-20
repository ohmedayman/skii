let currentUser = null;
let authToken = null;
let isStaticMode = true;

const CATEGORIES = [
  { slug:'coffee', name:'المقاهي', icon:'ri-cup-line', count:0 },
  { slug:'restaurants', name:'المطاعم', icon:'ri-restaurant-line', count:0 },
  { slug:'banking', name:'البنوك', icon:'ri-bank-line', count:0 },
  { slug:'retail', name:'التجزئة', icon:'ri-shopping-cart-2-line', count:0 },
  { slug:'telecom', name:'الاتصالات', icon:'ri-smartphone-line', count:0 },
  { slug:'health', name:'الصحة', icon:'ri-heart-pulse-line', count:0 },
  { slug:'education', name:'التعليم', icon:'ri-book-open-line', count:0 },
  { slug:'services', name:'الخدمات', icon:'ri-tools-line', count:0 },
];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadHome();
  setupSearch();
  setupMobileNav();
});

function checkAuth() {
  const token = localStorage.getItem('sikka_token');
  if (token) { authToken = token; isStaticMode = false; loadUserProfile(); }
}

async function api(endpoint, options = {}) {
  if (isStaticMode && !endpoint.includes('/config')) throw new Error('Not connected');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const r = await fetch(`/api${endpoint}`, { ...options, headers });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error);
  return d;
}

function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');
  document.querySelector(`[data-nav="${page}"]`)?.classList.add('active');
  document.querySelector(`.mobile-nav-item[data-page="${page}"]`)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'home') loadHome();
  if (page === 'businesses') loadAllBusinesses();
  if (page === 'blog') loadBlog();
  if (page === 'admin') loadAdmin();
  if (page === 'profile') loadProfile();
}

function setupSearch() {
  document.getElementById('search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
}

async function performSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { loadHome(); return; }
  try {
    const d = await api(`/search/businesses?q=${encodeURIComponent(q)}`);
    renderBusinesses(d.hits || []);
  } catch (e) { renderBusinesses([]); }
}

function quickSearch(term) {
  document.getElementById('search-input').value = term;
  performSearch();
}

function setupMobileNav() {
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => { const p = item.dataset.page; if (p) navigateTo(p); });
  });
}

async function loadHome() {
  try {
    const [cats, biz, posts] = await Promise.all([
      api('/categories').catch(() => null),
      api('/businesses?limit=8').catch(() => null),
      api('/posts?limit=3').catch(() => null),
    ]);
    renderCategories(cats?.categories || CATEGORIES);
    renderBusinesses(biz?.businesses || []);
    renderPosts(posts?.posts || []);
    updateStats(biz?.businesses?.length || 0);
  } catch {
    renderCategories(CATEGORIES);
    renderBusinesses([]);
    renderPosts([]);
    updateStats(0);
  }
}

function renderCategories(cats) {
  const g = document.getElementById('categories-grid');
  if (!g) return;
  g.innerHTML = cats.map(c => `
    <div class="category-card" onclick="quickSearch('${c.name}')">
      <div class="category-icon"><i class="${c.icon || 'ri-building-line'}"></i></div>
      <div class="category-name">${c.name}</div>
      <div class="category-count">${c.count || 0} نشاط</div>
    </div>
  `).join('');
}

function renderBusinesses(businesses) {
  const g = document.getElementById('businesses-grid');
  if (!g) return;
  if (!businesses.length) {
    g.innerHTML = `
      <div class="empty-state">
        <i class="ri-store-2-line"></i>
        <h3>لا توجد أعمال بعد</h3>
        <p>كن أول من يضيف نشاطه التجاري</p>
      </div>
    `;
    return;
  }
  g.innerHTML = businesses.map(b => `
    <div class="business-card" onclick="openBusiness('${b.slug || b.id}')">
      <div class="business-card-img">
        <div class="business-card-logo"><i class="ri-building-2-line"></i></div>
        ${b.isVerified ? '<span class="badge">موثق</span>' : ''}
      </div>
      <div class="business-card-body">
        <div class="business-card-name">${b.nameAr || b.name}</div>
        <div class="business-card-cat">${b.categoryNameAr || b.categoryName || ''}</div>
        <div class="business-card-info">
          <span><i class="ri-map-pin-2-line"></i> ${b.location?.cityAr || b.location?.city || ''}</span>
          <span><i class="ri-phone-line"></i> ${b.contact?.phone || b.phone || ''}</span>
        </div>
      </div>
      <div class="business-card-footer">
        <div class="business-rating"><i class="ri-star-fill"></i> ${b.rating?.average?.toFixed(1) || '0.0'} (${b.rating?.count || 0})</div>
      </div>
    </div>
  `).join('');
}

function renderPosts(posts) {
  const g = document.getElementById('posts-grid');
  if (!g) return;
  if (!posts.length) {
    g.innerHTML = '<div class="empty-state"><i class="ri-article-line"></i><h3>لا توجد مقالات بعد</h3></div>';
    return;
  }
  g.innerHTML = posts.map(p => `
    <div class="blog-card" onclick="openPost('${p.slug}')">
      <div class="blog-card-img"><i class="ri-article-line"></i></div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${p.categoryAr || p.category || ''}</span>
        <div class="blog-card-title">${p.titleAr || p.title}</div>
        <div class="blog-card-excerpt">${p.excerptAr || p.excerpt || ''}</div>
        <div class="blog-card-meta">${p.readTime || 5} دقائق</div>
      </div>
    </div>
  `).join('');
}

function updateStats(bizCount) {
  document.getElementById('stat-biz').textContent = bizCount;
  document.getElementById('stat-users').textContent = '0';
  document.getElementById('stat-reviews').textContent = '0';
  document.getElementById('stat-cities').textContent = '0';
}

async function loadAllBusinesses() {
  try {
    const d = await api('/businesses');
    const g = document.getElementById('all-businesses-grid');
    if (g) renderBusinessesTo(d.businesses || [], g);
  } catch {
    const g = document.getElementById('all-businesses-grid');
    if (g) renderBusinessesTo([], g);
  }
}

function renderBusinessesTo(list, container) {
  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><i class="ri-store-2-line"></i><h3>لا توجد أعمال</h3><p>لم يتم تسجيل أي نشاط تجاري بعد</p></div>';
    return;
  }
  container.innerHTML = list.map(b => `
    <div class="business-card" onclick="openBusiness('${b.slug || b.id}')">
      <div class="business-card-img"><div class="business-card-logo"><i class="ri-building-2-line"></i></div></div>
      <div class="business-card-body">
        <div class="business-card-name">${b.nameAr || b.name}</div>
        <div class="business-card-cat">${b.categoryNameAr || ''}</div>
        <div class="business-card-info"><span><i class="ri-map-pin-2-line"></i> ${b.location?.cityAr || ''}</span></div>
      </div>
      <div class="business-card-footer"><div class="business-rating"><i class="ri-star-fill"></i> ${b.rating?.average?.toFixed(1) || '0.0'}</div></div>
    </div>
  `).join('');
}

function openBusiness(slug) {
  const c = document.getElementById('business-detail');
  c.innerHTML = `
    <div class="detail-hero"><div style="font-size:4rem;"><i class="ri-building-2-line" style="color:var(--text-muted);"></i></div>
      <button class="back-btn" onclick="closeDetail()"><i class="ri-arrow-right-line"></i></button>
    </div>
    <div class="detail-content">
      <h1 class="detail-name">${slug}</h1>
      <div class="detail-category">نشاط تجاري</div>
      <div class="detail-actions">
        <a href="#" class="btn btn-call btn-lg"><i class="ri-phone-line"></i> اتصل</a>
        <a href="#" class="btn btn-whatsapp btn-lg">واتساب</a>
      </div>
      <div class="detail-section"><h3>ساعات العمل</h3><div class="hours-row"><span>السبت - الخميس</span><span>8:00 - 23:00</span></div><div class="hours-row"><span>الجمعة</span><span>13:00 - 23:00</span></div></div>
      <div class="detail-section"><h3>التقييمات</h3><p style="color:var(--text-muted);">سجّل الدخول لرؤية التقييمات</p></div>
    </div>
  `;
  document.getElementById('page-business').classList.add('active');
  document.querySelectorAll('.page:not(#page-business)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });
}

function closeDetail() {
  document.getElementById('page-business').classList.remove('active');
  document.getElementById('page-home').classList.add('active');
}

async function loadBlog() {
  try {
    const d = await api('/posts');
    const g = document.getElementById('blog-list');
    if (g) renderPostsTo(d.posts || [], g);
  } catch {
    const g = document.getElementById('blog-list');
    if (g) renderPostsTo([], g);
  }
}

function renderPostsTo(posts, container) {
  if (!posts.length) {
    container.innerHTML = '<div class="empty-state"><i class="ri-article-line"></i><h3>لا توجد مقالات</h3></div>';
    return;
  }
  container.innerHTML = posts.map(p => `
    <div class="blog-card" onclick="openPost('${p.slug}')">
      <div class="blog-card-img"><i class="ri-article-line"></i></div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${p.categoryAr || ''}</span>
        <div class="blog-card-title">${p.titleAr || p.title}</div>
        <div class="blog-card-excerpt">${p.excerptAr || ''}</div>
      </div>
    </div>
  `).join('');
}

function openPost(slug) {
  const c = document.getElementById('post-detail');
  c.innerHTML = `<div style="max-width:600px;margin:0 auto;padding:36px 24px;"><button onclick="closeDetail()" style="display:flex;align-items:center;gap:6px;color:var(--text);margin-bottom:20px;font-size:0.85rem;"><i class="ri-arrow-right-line"></i> العودة</button><h1 style="font-size:1.4rem;font-weight:700;margin-bottom:10px;">${slug}</h1><p style="color:var(--text-secondary);">المحتوى غير متاح حالياً</p></div>`;
  document.getElementById('page-post-detail').classList.add('active');
  document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });
}

function loadAdmin() {
  const c = document.getElementById('admin-content');
  if (!c) return;
  c.innerHTML = `
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:20px;">لوحة التحكم</h2>
    <div class="admin-stats">
      <div class="admin-stat"><div class="admin-stat-label">الأعمال</div><div class="admin-stat-value">0</div></div>
      <div class="admin-stat"><div class="admin-stat-label">المستخدمين</div><div class="admin-stat-value">0</div></div>
      <div class="admin-stat"><div class="admin-stat-label">المقالات</div><div class="admin-stat-value">0</div></div>
      <div class="admin-stat"><div class="admin-stat-label">الزيارات</div><div class="admin-stat-value">0</div></div>
    </div>
    <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px;">آخر الأعمال</h3>
    <div class="empty-state" style="padding:40px;"><i class="ri-inbox-line"></i><h3>لا توجد بيانات</h3><p>لم يتم تسجيل أي نشاط بعد</p></div>
  `;
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  event?.target?.closest('.admin-nav-item')?.classList.add('active');
}

// AUTH
function showAuthModal() { document.getElementById('auth-modal').classList.add('active'); }
function hideAuthModal() { document.getElementById('auth-modal').classList.remove('active'); }
function showSignupModal() { document.getElementById('signup-modal').classList.add('active'); }
function hideSignupModal() { document.getElementById('signup-modal').classList.remove('active'); }

async function loginWithEmail() {
  const email = document.getElementById('email-input')?.value;
  const pass = document.getElementById('password-input')?.value;
  if (!email || !pass) return showToast('أكمل جميع الحقول', 'error');

  try {
    const { getAuth, signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const token = await res.user.getIdToken();
    authToken = token;
    isStaticMode = false;
    localStorage.setItem('sikka_token', token);
    await api('/auth/register', { method: 'POST' }).catch(() => {});
    await loadUserProfile();
    hideAuthModal();
    showToast('مرحباً بك!');
  } catch (e) {
    showToast('فشل تسجيل الدخول - تحقق من البيانات', 'error');
  }
}

async function signupWithEmail() {
  const name = document.getElementById('signup-name')?.value;
  const email = document.getElementById('signup-email')?.value;
  const pass = document.getElementById('signup-password')?.value;
  if (!name || !email || !pass) return showToast('أكمل جميع الحقول', 'error');

  try {
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    const token = await res.user.getIdToken();
    authToken = token;
    isStaticMode = false;
    localStorage.setItem('sikka_token', token);
    await api('/auth/register', { method: 'POST' }).catch(() => {});
    await loadUserProfile();
    hideSignupModal();
    showToast('تم إنشاء الحساب بنجاح!');
  } catch (e) {
    showToast('فشل إنشاء الحساب', 'error');
  }
}

async function loginWithGoogle() {
  try {
    const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();
    const res = await signInWithPopup(auth, new GoogleAuthProvider());
    const token = await res.user.getIdToken();
    authToken = token;
    isStaticMode = false;
    localStorage.setItem('sikka_token', token);
    await api('/auth/register', { method: 'POST' }).catch(() => {});
    await loadUserProfile();
    hideAuthModal();
    hideSignupModal();
    showToast('مرحباً بك!');
  } catch (e) {
    showToast('فشل تسجيل الدخول بـ Google', 'error');
  }
}

async function loadUserProfile() {
  if (isStaticMode) return;
  try {
    const d = await api('/auth/profile');
    currentUser = d.user;
    updateProfileUI();
  } catch { currentUser = null; }
}

function updateProfileUI() {
  const n = document.getElementById('profile-name');
  const e = document.getElementById('profile-email');
  const a = document.getElementById('auth-buttons');
  const m = document.getElementById('profile-menu');
  if (currentUser) {
    if (n) n.textContent = currentUser.displayName || 'مستخدم';
    if (e) e.textContent = currentUser.email || '';
    if (a) a.style.display = 'none';
    if (m) m.style.display = 'block';
  } else {
    if (n) n.textContent = 'ضيف';
    if (e) e.textContent = 'سجّل الدخول';
    if (a) a.style.display = 'block';
    if (m) m.style.display = 'none';
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  isStaticMode = true;
  localStorage.removeItem('sikka_token');
  updateProfileUI();
  showToast('تم تسجيل الخروج');
  navigateTo('home');
}

function submitBusiness() {
  if (isStaticMode) { showAuthModal(); return; }
  const name = document.getElementById('biz-name')?.value;
  if (!name) return showToast('أدخل اسم النشاط', 'error');
  showToast('تم إضافة نشاطك!');
  navigateTo('home');
}

function loadProfile() {}

window.navigateTo = navigateTo;
window.openBusiness = openBusiness;
window.openPost = openPost;
window.closeDetail = closeDetail;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.showSignupModal = showSignupModal;
window.hideSignupModal = hideSignupModal;
window.loginWithEmail = loginWithEmail;
window.signupWithEmail = signupWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.submitBusiness = submitBusiness;
window.performSearch = performSearch;
window.quickSearch = quickSearch;
window.showAdminTab = showAdminTab;
