// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
  apiKey: "AIzaSyDEYpUv2SQvIW17o9c5xQnsHWp2yRrw9B",
  authDomain: "sikka-e74f6.firebaseapp.com",
  projectId: "sikka-e74f6",
  storageBucket: "sikka-e74f6.firebasestorage.app",
  messagingSenderId: "666858367619",
  appId: "1:666858367619:web:c671bad75fa36b141049b6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==================== STATE ====================
let currentUser = null;
let currentUserData = null;
let searchType = 'name';
let currentReviewBizId = null;
let currentRating = 0;
let allBusinesses = [];

// ==================== CATEGORIES ====================
const CATEGORIES = [
  { slug:'coffee', name:'المقاهي', icon:'ri-cup-line', desc:'مقاهي وقهوة مختصة' },
  { slug:'restaurants', name:'المطاعم', icon:'ri-restaurant-line', desc:'مطاعم ووجبات سريعة' },
  { slug:'banking', name:'البنوك', icon:'ri-bank-line', desc:'بنوك وخدمات مالية' },
  { slug:'retail', name:'التجزئة', icon:'ri-shopping-cart-2-line', desc:'متاجر وتسوق' },
  { slug:'telecom', name:'الاتصالات', icon:'ri-smartphone-line', desc:'خدمات اتصالات' },
  { slug:'health', name:'الصحة', icon:'ri-heart-pulse-line', desc:'مستشفيات وعيادات' },
  { slug:'education', name:'التعليم', icon:'ri-book-open-line', desc:'مدارس وجامعات' },
  { slug:'services', name:'الخدمات', icon:'ri-tools-line', desc:'خدمات متنوعة' },
  { slug:'realestate', name:'العقارات', icon:'ri-home-4-line', desc:'بيع وشراء العقارات' },
  { slug:'automotive', name:'السيارات', icon:'ri-car-line', desc:'بيع وصيانة السيارات' },
  { slug:'travel', name:'السفر والسياحة', icon:'ri-plane-line', desc:'فنادق وسياحة' },
  { slug:'fashion', name:'الأزياء', icon:'ri-t-shirt-line', desc:'ملابس وأزياء' },
  { slug:'beauty', name:'الجمال', icon:'ri-palette-line', desc:'صالونات وعناية' },
  { slug:'sports', name:'الرياضة', icon:'ri-basketball-line', desc:'نوادي رياضية' },
  { slug:'technology', name:'التكنولوجيا', icon:'ri-computer-line', desc:'تقنية وبرمجيات' },
  { slug:'legal', name:'القانونية', icon:'ri-scales-3-line', desc:'محاماة واستشارات' },
];

const ARABIC_LETTERS = ['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    if (user) loadUserProfile();
  });

  loadHome();
  setupSearch();
  renderAlphaGrid();
  document.getElementById('search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
});

// ==================== TOAST ====================
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  const icon = type === 'success' ? 'ri-check-line' : type === 'error' ? 'ri-error-warning-line' : 'ri-information-line';
  t.innerHTML = `<i class="${icon}"></i> ${msg}`;
  t.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0f172a';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-menu-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');
  document.querySelector(`[data-nav="${page}"]`)?.classList.add('active');
  document.querySelector(`.mobile-nav-item[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('mobile-menu')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') loadHome();
  if (page === 'businesses') loadAllBusinesses();
  if (page === 'blog') loadBlog();
  if (page === 'admin') loadAdmin();
  if (page === 'profile') loadProfile();
  if (page === 'categories') loadCategoriesFull();
  if (page === 'add') renderAddForm();
}

function toggleMobileMenu() { document.getElementById('mobile-menu')?.classList.toggle('hidden'); }

// ==================== AUTH GATE ====================
function requireAuth(action) {
  if (currentUser) {
    navigateTo(action);
  } else {
    showAuthModal();
    showToast('يجب تسجيل الدخول أولاً', 'info');
  }
}

// ==================== AUTH UI ====================
function showAuthModal() {
  const m = document.getElementById('auth-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
  document.getElementById('auth-error')?.classList.add('hidden');
}
function hideAuthModal() {
  const m = document.getElementById('auth-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}
function showSignupModal() {
  const m = document.getElementById('signup-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
  document.getElementById('signup-error')?.classList.add('hidden');
}
function hideSignupModal() {
  const m = document.getElementById('signup-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function updateAuthUI() {
  const btns = document.getElementById('header-auth-btns');
  const name = document.getElementById('profile-name');
  const email = document.getElementById('profile-email');
  const authBtns = document.getElementById('auth-buttons');
  const menu = document.getElementById('profile-menu');

  if (currentUser) {
    if (btns) btns.innerHTML = `<button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" onclick="navigateTo('profile')"><i class="ri-user-3-line"></i><span class="hidden sm:inline">${currentUser.displayName || currentUser.email?.split('@')[0] || 'حسابي'}</span></button>`;
    if (name) name.textContent = currentUser.displayName || 'مستخدم';
    if (email) email.textContent = currentUser.email || '';
    if (authBtns) authBtns.style.display = 'none';
    if (menu) menu.style.display = 'block';
  } else {
    if (btns) btns.innerHTML = `<button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" onclick="showAuthModal()"><i class="ri-login-box-line"></i> دخول</button>`;
    if (name) name.textContent = 'ضيف';
    if (email) email.textContent = 'سجّل الدخول للوصول لحسابك';
    if (authBtns) authBtns.style.display = 'block';
    if (menu) menu.style.display = 'none';
  }
}

// ==================== AUTH FUNCTIONS ====================
async function loginWithEmail() {
  const email = document.getElementById('email-input')?.value;
  const pass = document.getElementById('password-input')?.value;
  const errEl = document.getElementById('auth-error');
  if (!email || !pass) { errEl.textContent = 'أكمل جميع الحقول'; errEl.classList.remove('hidden'); return; }

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    hideAuthModal();
    showToast('مرحباً بك!');
  } catch (e) {
    const msgs = {
      'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/invalid-email': 'البريد الإلكتروني غير صالح',
      'auth/too-many-requests': 'حاول مرة أخرى لاحقاً',
    };
    errEl.textContent = msgs[e.code] || 'فشل تسجيل الدخول - تحقق من البيانات';
    errEl.classList.remove('hidden');
  }
}

async function signupWithEmail() {
  const name = document.getElementById('signup-name')?.value;
  const email = document.getElementById('signup-email')?.value;
  const pass = document.getElementById('signup-password')?.value;
  const errEl = document.getElementById('signup-error');
  if (!name || !email || !pass) { errEl.textContent = 'أكمل جميع الحقول'; errEl.classList.remove('hidden'); return; }
  if (pass.length < 6) { errEl.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'; errEl.classList.remove('hidden'); return; }

  try {
    const res = await auth.createUserWithEmailAndPassword(email, pass);
    await res.user.updateProfile({ displayName: name });
    await db.collection('users').doc(res.user.uid).set({
      uid: res.user.uid,
      displayName: name,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    hideSignupModal();
    showToast('تم إنشاء الحساب بنجاح!');
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
      'auth/invalid-email': 'البريد الإلكتروني غير صالح',
      'auth/weak-password': 'كلمة المرور ضعيفة',
    };
    errEl.textContent = msgs[e.code] || 'فشل إنشاء الحساب';
    errEl.classList.remove('hidden');
  }
}

async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const res = await auth.signInWithPopup(provider);
    await db.collection('users').doc(res.user.uid).set({
      uid: res.user.uid,
      displayName: res.user.displayName,
      email: res.user.email,
      photoURL: res.user.photoURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    hideAuthModal();
    hideSignupModal();
    showToast('مرحباً بك!');
  } catch (e) {
    showToast('فشل تسجيل الدخول بـ Google', 'error');
  }
}

function logout() {
  auth.signOut();
  currentUser = null;
  currentUserData = null;
  showToast('تم تسجيل الخروج');
  navigateTo('home');
}

async function loadUserProfile() {
  if (!currentUser) return;
  try {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
  } catch {}
}

// ==================== SEARCH ====================
function switchSearchTab(btn, type) {
  searchType = type;
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const placeholders = { name:'ابحث بالاسم...', keyword:'ابحث بالكلمة المفتاحية...', category:'اكتب اسم الفئة...', brand:'ابحث بالبراند...' };
  document.getElementById('search-input').placeholder = placeholders[type] || placeholders.name;
}

async function performSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { loadHome(); return; }
  try {
    const snapshot = await db.collection('businesses').where('status', '==', 'approved').get();
    const all = [];
    snapshot.forEach(doc => all.push({ id: doc.id, ...doc.data() }));
    const lower = q.toLowerCase();
    const filtered = all.filter(b => {
      if (searchType === 'name') return (b.name || '').includes(q) || (b.nameAr || '').includes(q);
      if (searchType === 'category') return (b.categoryNameAr || b.categoryName || '').includes(q);
      if (searchType === 'brand') return (b.brands || []).some(br => br.includes(q));
      return (b.name || '').includes(q) || (b.nameAr || '').includes(q) || (b.keywords || []).some(k => k.includes(q)) || (b.keywordsAr || []).some(k => k.includes(q));
    });
    renderBusinesses(filtered);
  } catch (e) { renderBusinesses([]); }
}

function quickSearch(term) {
  document.getElementById('search-input').value = term;
  searchType = 'keyword';
  navigateTo('businesses');
  setTimeout(() => performSearch(), 100);
}

function renderAlphaGrid() {
  const g = document.getElementById('alpha-grid');
  if (!g) return;
  g.innerHTML = ARABIC_LETTERS.map(l => `<button class="alpha-btn" onclick="searchByLetter('${l}')">${l}</button>`).join('');
}

function searchByLetter(letter) {
  document.querySelectorAll('.alpha-btn').forEach(a => a.classList.remove('active'));
  event?.target?.classList.add('active');
  document.getElementById('search-input').value = letter;
  searchType = 'name';
  navigateTo('businesses');
  setTimeout(() => performSearch(), 100);
}

// ==================== HOME ====================
async function loadHome() {
  try {
    const [bizSnap, catsSnap] = await Promise.all([
      db.collection('businesses').where('status', '==', 'approved').orderBy('createdAt', 'desc').limit(8).get(),
      db.collection('categories').get(),
    ]);
    const businesses = [];
    bizSnap.forEach(doc => businesses.push({ id: doc.id, ...doc.data() }));
    renderBusinesses(businesses);

    const cats = [];
    catsSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));
    renderCategories(cats.length ? cats : CATEGORIES);

    animateCounter('stat-biz', businesses.length);
    animateCounter('stat-users', 0);
    animateCounter('stat-reviews', 0);
    animateCounter('stat-cities', 16);
  } catch (e) {
    renderCategories(CATEGORIES);
    renderBusinesses([]);
    updateStats(0);
  }
}

function renderCategories(cats) {
  const g = document.getElementById('categories-grid');
  if (!g) return;
  g.innerHTML = cats.slice(0, 8).map((c, i) => `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="w-14 h-14 bg-gray-100 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300">
        <i class="${c.icon || 'ri-building-line'} text-xl text-gray-500 group-hover:text-white transition-colors"></i>
      </div>
      <div class="text-sm font-bold mb-1">${c.name}</div>
      <div class="text-xs text-gray-400">${c.count || 0} نشاط</div>
    </div>
  `).join('');
}

function renderBusinesses(businesses) {
  const g = document.getElementById('businesses-grid');
  if (!g) return;
  if (!businesses.length) {
    g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>لا توجد أعمال بعد</h3><p>كن أول من يضيف نشاطه التجاري</p></div>';
    return;
  }
  g.innerHTML = businesses.map((b, i) => renderBusinessCard(b, i)).join('');
}

function renderBusinessCard(b, i = 0) {
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  return `
    <div class="biz-card group" onclick="openBusiness('${b.id}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="biz-card-img">
        <div class="biz-card-logo"><i class="ri-building-2-line"></i></div>
        ${b.isVerified ? '<span class="biz-badge verified">موثق</span>' : ''}
      </div>
      <div class="biz-card-body">
        <div class="biz-card-name">${b.nameAr || b.name}</div>
        <div class="biz-card-cat">${b.categoryNameAr || b.categoryName || ''}</div>
        <div class="biz-card-info">
          ${b.location?.city ? `<span><i class="ri-map-pin-2-line"></i> ${b.location.city}</span>` : ''}
          ${b.contact?.phone ? `<span><i class="ri-phone-line"></i> ${b.contact.phone}</span>` : ''}
        </div>
      </div>
      <div class="biz-card-footer">
        <div class="biz-rating"><i class="ri-star-fill"></i> ${rating.toFixed(1)} <span>(${reviewCount})</span></div>
      </div>
    </div>
  `;
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el || target === 0) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = current;
  }, 30);
}

function updateStats(n) {
  document.getElementById('stat-biz').textContent = n;
  document.getElementById('stat-users').textContent = '0';
  document.getElementById('stat-reviews').textContent = '0';
  document.getElementById('stat-cities').textContent = '16';
}

// ==================== BUSINESSES PAGE ====================
async function loadAllBusinesses() {
  try {
    const snapshot = await db.collection('businesses').where('status', '==', 'approved').get();
    allBusinesses = [];
    snapshot.forEach(doc => allBusinesses.push({ id: doc.id, ...doc.data() }));
    populateFilters(allBusinesses);
    renderBusinessesTo(allBusinesses, document.getElementById('all-businesses-grid'));
  } catch (e) {
    renderBusinessesTo([], document.getElementById('all-businesses-grid'));
  }
}

function populateFilters(businesses) {
  const cats = [...new Set(businesses.map(b => b.categoryNameAr || b.categoryName).filter(Boolean))];
  const cities = [...new Set(businesses.map(b => b.location?.city).filter(Boolean))];
  const areas = [...new Set(businesses.map(b => b.location?.district).filter(Boolean))];
  const catSelect = document.getElementById('filter-category');
  const citySelect = document.getElementById('filter-city');
  const areaSelect = document.getElementById('filter-area');
  if (catSelect) catSelect.innerHTML = '<option value="">كل الفئات</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  if (citySelect) citySelect.innerHTML = '<option value="">كل المدن</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
  if (areaSelect) areaSelect.innerHTML = '<option value="">كل المناطق</option>' + areas.map(a => `<option value="${a}">${a}</option>`).join('');
}

function applyFilters() {
  const cat = document.getElementById('filter-category')?.value || '';
  const city = document.getElementById('filter-city')?.value || '';
  const area = document.getElementById('filter-area')?.value || '';
  const sort = document.getElementById('filter-sort')?.value || 'relevance';
  let filtered = [...allBusinesses];
  if (cat) filtered = filtered.filter(b => (b.categoryNameAr || b.categoryName) === cat);
  if (city) filtered = filtered.filter(b => b.location?.city === city);
  if (area) filtered = filtered.filter(b => b.location?.district === area);
  if (sort === 'rating') filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
  else if (sort === 'reviews') filtered.sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0));
  else if (sort === 'alpha') filtered.sort((a, b) => (a.nameAr || a.name || '').localeCompare(b.nameAr || b.name || '', 'ar'));
  renderBusinessesTo(filtered, document.getElementById('all-businesses-grid'));
}

function renderBusinessesTo(list, container) {
  if (!list.length) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>لا توجد أعمال</h3><p>لم يتم تسجيل أي نشاط تجاري بعد</p></div>'; return; }
  container.innerHTML = list.map((b, i) => renderBusinessCard(b, i)).join('');
}

// ==================== BUSINESS DETAIL ====================
async function openBusiness(id) {
  try {
    const doc = await db.collection('businesses').doc(id).get();
    if (!doc.exists) { showToast('النشاط غير موجود', 'error'); return; }
    renderBusinessDetail({ id: doc.id, ...doc.data() });
  } catch (e) { showToast('خطأ في تحميل البيانات', 'error'); }
}

function renderBusinessDetail(b) {
  const c = document.getElementById('business-detail');
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const phone = b.contact?.phone || '';
  const whatsapp = b.contact?.whatsapp || '';
  const email = b.contact?.email || '';
  const city = b.location?.city || '';
  const district = b.location?.district || '';
  const address = b.location?.address || '';
  const desc = b.description || '';
  const keywords = b.keywords || [];
  const brands = b.brands || [];
  const hours = b.workingHours || {};
  const lat = b.location?.lat;
  const lng = b.location?.lng;

  const hoursHtml = hours.saturday ? `
    <div class="detail-section">
      <h3><i class="ri-time-line text-amber-500"></i> ساعات العمل</h3>
      ${Object.entries(hours).map(([day, time]) => `<div class="hours-row"><span>${getDayName(day)}</span><span>${time}</span></div>`).join('')}
    </div>
  ` : '';

  const keywordsHtml = keywords.length ? `<div class="detail-section"><h3><i class="ri-hashtag text-blue-500"></i> الكلمات المفتاحية</h3><div class="keywords-list">${keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}</div></div>` : '';
  const brandsHtml = brands.length ? `<div class="detail-section"><h3><i class="ri-bookmark-line text-purple-500"></i> البراندات</h3><div class="keywords-list">${brands.map(b => `<span class="keyword-tag">${b}</span>`).join('')}</div></div>` : '';

  c.innerHTML = `
    <div class="detail-hero">
      ${lat && lng ? `<div id="detail-map" style="width:100%;height:100%"></div>` : `<div style="font-size:4rem"><i class="ri-building-2-line" style="color:#cbd5e1"></i></div>`}
      <button class="back-btn" onclick="closeDetail()"><i class="ri-arrow-right-line"></i></button>
    </div>
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-logo"><i class="ri-building-2-line"></i></div>
        <div>
          <h1 class="detail-name">${b.nameAr || b.name}</h1>
          <div class="detail-category">${b.categoryNameAr || b.categoryName || ''}</div>
          <div class="detail-stats">
            <div class="detail-stat"><i class="ri-star-fill"></i> ${rating.toFixed(1)} (${reviewCount} تقييم)</div>
            ${city ? `<div class="detail-stat"><i class="ri-map-pin-2-line"></i> ${city}${district ? ' - ' + district : ''}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="detail-actions">
        ${phone ? `<a href="tel:${phone}" class="action-btn call"><i class="ri-phone-line"></i> اتصل</a>` : ''}
        ${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="action-btn whatsapp"><i class="ri-whatsapp-line"></i> واتساب</a>` : ''}
        ${email ? `<a href="mailto:${email}" class="action-btn email"><i class="ri-mail-line"></i> إيميل</a>` : ''}
        ${lat && lng ? `<a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="action-btn map"><i class="ri-map-pin-line"></i> الخريطة</a>` : ''}
        <button class="action-btn review" onclick="requireAuth('review')"><i class="ri-star-line"></i> تقييم</button>
      </div>
      ${desc ? `<div class="detail-section"><h3><i class="ri-information-line text-gray-500"></i> عن النشاط</h3><p>${desc}</p></div>` : ''}
      ${address ? `<div class="detail-section"><h3><i class="ri-map-pin-line text-red-500"></i> العنوان</h3><p>${address}${district ? ', ' + district : ''}${city ? ', ' + city : ''}</p></div>` : ''}
      ${hoursHtml}${keywordsHtml}${brandsHtml}
      <div class="detail-section">
        <h3><i class="ri-star-line text-amber-500"></i> التقييمات</h3>
        <div id="reviews-list"><div class="bg-gray-50 rounded-2xl p-6 text-center"><i class="ri-chat-smile-3-line text-3xl text-gray-300 mb-3 block"></i><p class="text-gray-500 text-sm">سجّل الدخول لرؤية وإضافة التقييمات</p></div></div>
      </div>
    </div>
  `;

  document.getElementById('page-business').classList.add('active');
  document.querySelectorAll('.page:not(#page-business)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });

  if (lat && lng) {
    setTimeout(() => {
      try {
        const detailMap = L.map('detail-map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(detailMap);
        L.marker([lat, lng]).addTo(detailMap);
      } catch(e) {}
    }, 200);
  }

  loadReviews(b.id);
}

function getDayName(day) {
  const days = { saturday:'السبت', sunday:'الأحد', monday:'الإثنين', tuesday:'الثلاثاء', wednesday:'الأربعاء', thursday:'الخميس', friday:'الجمعة' };
  return days[day] || day;
}

function closeDetail() {
  document.getElementById('page-business').classList.remove('active');
  document.getElementById('page-home').classList.add('active');
}

// ==================== REVIEWS ====================
async function loadReviews(bizId) {
  try {
    const snap = await db.collection('businesses').doc(bizId).collection('reviews').orderBy('createdAt', 'desc').get();
    const reviews = [];
    snap.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }));
    const list = document.getElementById('reviews-list');
    if (!list) return;
    if (!reviews.length) { list.innerHTML = '<div class="bg-gray-50 rounded-2xl p-6 text-center"><i class="ri-chat-smile-3-line text-3xl text-gray-300 mb-3 block"></i><p class="text-gray-500 text-sm">لا توجد تقييمات بعد. كن أول من يقيّم!</p></div>'; return; }
    list.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${(r.userName || 'م')[0]}</div>
          <div><div class="review-name">${r.userName || 'مجهول'}</div><div class="review-date">${r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString('ar-SA') : ''}</div></div>
        </div>
        <div class="review-stars">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < r.rating ? 'fill' : 'line'}" style="color:${i < r.rating ? '#f59e0b' : '#cbd5e1'}"></i>`).join('')}</div>
        ${r.title ? `<div class="review-title">${r.title}</div>` : ''}
        ${r.comment ? `<div class="review-text">${r.comment}</div>` : ''}
      </div>
    `).join('');
  } catch (e) {}
}

function openReviewModal(bizId) {
  if (!currentUser) { showAuthModal(); return; }
  currentReviewBizId = bizId;
  currentRating = 0;
  document.querySelectorAll('#star-rating i').forEach(s => s.className = 'ri-star-line');
  document.getElementById('review-title').value = '';
  document.getElementById('review-text').value = '';
  const m = document.getElementById('review-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
}

function closeReviewModal() {
  const m = document.getElementById('review-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function setRating(r) {
  currentRating = r;
  document.querySelectorAll('#star-rating button').forEach((btn, i) => {
    const icon = btn.querySelector('i');
    icon.className = i < r ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300';
  });
}

async function submitReview() {
  if (!currentUser) { showAuthModal(); return; }
  if (!currentRating) { showToast('اختر تقييم', 'error'); return; }
  const title = document.getElementById('review-title')?.value;
  const text = document.getElementById('review-text')?.value;
  try {
    await db.collection('businesses').doc(currentReviewBizId).collection('reviews').add({
      userId: currentUser.uid,
      userName: currentUser.displayName || 'مجهول',
      rating: currentRating,
      title: title || '',
      comment: text || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    const bizRef = db.collection('businesses').doc(currentReviewBizId);
    const bizDoc = await bizRef.get();
    const bizData = bizDoc.data();
    const newCount = (bizData.rating?.count || 0) + 1;
    const newAvg = ((bizData.rating?.average || 0) * (bizData.rating?.count || 0) + currentRating) / newCount;
    await bizRef.update({ 'rating.average': newAvg, 'rating.count': newCount });
    showToast('تم إرسال التقييم!');
    closeReviewModal();
    openBusiness(currentReviewBizId);
  } catch (e) { showToast('تم إرسال التقييم', 'success'); closeReviewModal(); }
}

// ==================== ADD BUSINESS ====================
function renderAddForm() {
  const c = document.getElementById('add-business-content');
  if (!c) return;

  if (!currentUser) {
    c.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><i class="ri-lock-line text-3xl text-gray-400"></i></div>
        <h3 class="text-xl font-bold mb-2">يجب تسجيل الدخول</h3>
        <p class="text-gray-500 mb-6">سجّل الدخول أو أنشئ حساب جديد لإضافة نشاطك التجاري</p>
        <button class="px-8 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all" onclick="showAuthModal()">
          <i class="ri-login-box-line ml-2"></i>تسجيل دخول
        </button>
      </div>
    `;
    return;
  }

  c.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="form-label">اسم النشاط *</label><input type="text" class="form-input" id="biz-name" placeholder="اسم النشاط بالعربي"></div>
        <div><label class="form-label">الاسم بالإنجليزي</label><input type="text" class="form-input" id="biz-name-en" placeholder="Business Name"></div>
        <div><label class="form-label">الفئة *</label><select class="form-input" id="biz-category"><option value="">اختر الفئة</option>${CATEGORIES.map(c => `<option value="${c.slug}">${c.name}</option>`).join('')}</select></div>
        <div><label class="form-label">المدينة *</label><input type="text" class="form-input" id="biz-city" placeholder="مثال: الرياض"></div>
        <div><label class="form-label">الحي</label><input type="text" class="form-input" id="biz-district" placeholder="مثال: حي العليا"></div>
        <div class="sm:col-span-2"><label class="form-label">العنوان التفصيلي *</label><input type="text" class="form-input" id="biz-address" placeholder="العنوان بالتفصيل"></div>
        <div><label class="form-label">الجوال *</label><input type="tel" class="form-input" id="biz-phone" placeholder="+966"></div>
        <div><label class="form-label">واتساب</label><input type="tel" class="form-input" id="biz-whatsapp" placeholder="+966"></div>
        <div><label class="form-label">البريد الإلكتروني</label><input type="email" class="form-input" id="biz-email" placeholder="email@example.com"></div>
        <div><label class="form-label">الموقع الإلكتروني</label><input type="url" class="form-input" id="biz-website" placeholder="https://"></div>
        <div class="sm:col-span-2"><label class="form-label">الوصف</label><textarea class="form-input" id="biz-description" rows="3" placeholder="وصف النشاط التجاري"></textarea></div>
        <div class="sm:col-span-2"><label class="form-label">الكلمات المفتاحية (افصل بفاصلة)</label><input type="text" class="form-input" id="biz-keywords" placeholder="مقهوة، قهوة، حبوب"></div>
        <div class="sm:col-span-2"><label class="form-label">البراندات (افصل بفاصلة)</label><input type="text" class="form-input" id="biz-brands" placeholder="Starbucks, Costa"></div>
        <div><label class="form-label">ساعات العمل (السبت-الخميس)</label><input type="text" class="form-input" id="biz-hours-week" placeholder="8:00 ص - 11:00 م"></div>
        <div><label class="form-label">ساعات العمل (الجمعة)</label><input type="text" class="form-input" id="biz-hours-fri" placeholder="1:00 م - 11:00 م"></div>
        <div><label class="form-label">Latitude</label><input type="number" step="any" class="form-input" id="biz-lat" placeholder="24.7136"></div>
        <div><label class="form-label">Longitude</label><input type="number" step="any" class="form-input" id="biz-lng" placeholder="46.6753"></div>
      </div>
      <div id="add-error" class="hidden mt-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm"></div>
      <div class="flex gap-3 mt-6">
        <button class="flex-1 py-3 px-6 bg-gradient-to-l from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2" onclick="submitBusiness()"><i class="ri-send-plane-line"></i> نشر النشاط</button>
        <button class="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all" onclick="navigateTo('home')">إلغاء</button>
      </div>
    </div>
  `;
}

async function submitBusiness() {
  if (!currentUser) { showAuthModal(); return; }
  const name = document.getElementById('biz-name')?.value;
  if (!name) { showToast('أدخل اسم النشاط', 'error'); return; }
  const errEl = document.getElementById('add-error');

  try {
    await db.collection('businesses').add({
      name: name,
      nameAr: name,
      nameEn: document.getElementById('biz-name-en')?.value || '',
      categorySlug: document.getElementById('biz-category')?.value || '',
      categoryNameAr: CATEGORIES.find(c => c.slug === document.getElementById('biz-category')?.value)?.name || '',
      categoryName: CATEGORIES.find(c => c.slug === document.getElementById('biz-category')?.value)?.name || '',
      location: {
        city: document.getElementById('biz-city')?.value || '',
        district: document.getElementById('biz-district')?.value || '',
        address: document.getElementById('biz-address')?.value || '',
        lat: parseFloat(document.getElementById('biz-lat')?.value) || null,
        lng: parseFloat(document.getElementById('biz-lng')?.value) || null,
      },
      contact: {
        phone: document.getElementById('biz-phone')?.value || '',
        whatsapp: document.getElementById('biz-whatsapp')?.value || '',
        email: document.getElementById('biz-email')?.value || '',
        website: document.getElementById('biz-website')?.value || '',
      },
      description: document.getElementById('biz-description')?.value || '',
      keywords: (document.getElementById('biz-keywords')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      brands: (document.getElementById('biz-brands')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      workingHours: {
        saturday: document.getElementById('biz-hours-week')?.value || '',
        sunday: document.getElementById('biz-hours-week')?.value || '',
        monday: document.getElementById('biz-hours-week')?.value || '',
        tuesday: document.getElementById('biz-hours-week')?.value || '',
        wednesday: document.getElementById('biz-hours-week')?.value || '',
        thursday: document.getElementById('biz-hours-week')?.value || '',
        friday: document.getElementById('biz-hours-fri')?.value || '',
      },
      rating: { average: 0, count: 0 },
      status: 'pending',
      userId: currentUser.uid,
      userName: currentUser.displayName || '',
      isVerified: false,
      isFeatured: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showToast('تم إضافة نشاطك! سيتم مراجعته من الإدارة');
    navigateTo('home');
  } catch (e) {
    errEl.textContent = 'حدث خطأ - حاول مرة أخرى';
    errEl.classList.remove('hidden');
  }
}

// ==================== CATEGORIES PAGE ====================
function loadCategoriesFull() {
  const g = document.getElementById('categories-full-grid');
  if (!g) return;
  g.innerHTML = CATEGORIES.map((c, i) => `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="w-14 h-14 bg-gray-100 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"><i class="${c.icon} text-xl text-gray-500 group-hover:text-white transition-colors"></i></div>
      <div><h3 class="font-bold mb-1">${c.name}</h3><p class="text-gray-500 text-sm">${c.desc}</p></div>
    </div>
  `).join('');
}

// ==================== BLOG ====================
async function loadBlog() {
  const g = document.getElementById('blog-list');
  if (!g) return;
  try {
    const snap = await db.collection('posts').orderBy('createdAt', 'desc').get();
    const posts = [];
    snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
    if (!posts.length) { g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>لا توجد مقالات بعد</h3></div>'; return; }
    g.innerHTML = posts.map((p, i) => `
      <div class="blog-card" onclick="openPost('${p.id}')" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="blog-card-img"><i class="ri-article-line"></i></div>
        <div class="blog-card-body">
          <span class="blog-card-cat">${p.category || ''}</span>
          <div class="blog-card-title">${p.title}</div>
          <div class="blog-card-excerpt">${p.excerpt || ''}</div>
        </div>
      </div>
    `).join('');
  } catch (e) { g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>لا توجد مقالات</h3></div>'; }
}

function openPost(id) {
  const c = document.getElementById('post-detail');
  c.innerHTML = `<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8"><button onclick="closeDetail()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"><i class="ri-arrow-right-line"></i> العودة</button><div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8"><h1 class="text-2xl font-bold mb-4">${id}</h1><p class="text-gray-500">المحتوى غير متاح حالياً</p></div></div>`;
  document.getElementById('page-post-detail').classList.add('active');
  document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });
}

// ==================== ADMIN ====================
function loadAdmin() {
  const c = document.getElementById('admin-content');
  if (!c) return;
  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">لوحة التحكم</h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">الأعمال</div><div class="text-3xl font-bold" id="admin-biz-count">...</div></div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">المستخدمين</div><div class="text-3xl font-bold" id="admin-users-count">...</div></div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">قيد المراجعة</div><div class="text-3xl font-bold" id="admin-pending-count">...</div></div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">المقالات</div><div class="text-3xl font-bold" id="admin-posts-count">...</div></div>
    </div>
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-bold mb-4">آخر الأعمال</h3>
      <div id="admin-businesses-list" class="text-center py-12"><div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><i class="ri-inbox-line text-2xl text-gray-300"></i></div><h4 class="font-bold mb-2">جاري التحميل...</h4></div>
    </div>
  `;
  loadAdminData();
}

async function loadAdminData() {
  try {
    const [bizSnap, usersSnap, pendingSnap, postsSnap] = await Promise.all([
      db.collection('businesses').get(),
      db.collection('users').get(),
      db.collection('businesses').where('status', '==', 'pending').get(),
      db.collection('posts').get(),
    ]);
    document.getElementById('admin-biz-count').textContent = bizSnap.size;
    document.getElementById('admin-users-count').textContent = usersSnap.size;
    document.getElementById('admin-pending-count').textContent = pendingSnap.size;
    document.getElementById('admin-posts-count').textContent = postsSnap.size;

    const list = document.getElementById('admin-businesses-list');
    if (bizSnap.empty) { list.innerHTML = '<p class="text-gray-500">لا توجد أعمال بعد</p>'; return; }
    const rows = [];
    bizSnap.forEach(doc => {
      const b = doc.data();
      const statusClass = b.status === 'approved' ? 'text-green-600 bg-green-50' : b.status === 'pending' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
      rows.push(`<tr class="border-b border-gray-100"><td class="py-3 text-sm font-medium">${b.nameAr || b.name}</td><td class="py-3 text-sm text-gray-500">${b.categoryNameAr || ''}</td><td class="py-3 text-sm text-gray-500">${b.location?.city || ''}</td><td class="py-3"><span class="px-2 py-1 rounded-lg text-xs font-semibold ${statusClass}">${b.status === 'approved' ? 'معتمد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}</span></td><td class="py-3"><button class="text-sm text-blue-600 hover:underline" onclick="approveBusiness('${doc.id}','approved')">اعتماد</button></td></tr>`;
    });
    list.innerHTML = `<table class="w-full"><thead><tr class="border-b border-gray-200 text-right text-sm text-gray-500"><th class="py-3 font-semibold">الاسم</th><th class="py-3 font-semibold">الفئة</th><th class="py-3 font-semibold">المدينة</th><th class="py-3 font-semibold">الحالة</th><th class="py-3 font-semibold">إجراء</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
  } catch (e) {}
}

async function approveBusiness(id, status) {
  try {
    await db.collection('businesses').doc(id).update({ status });
    showToast('تم تحديث الحالة');
    loadAdminData();
  } catch (e) { showToast('خطأ', 'error'); }
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  event?.target?.closest('.admin-nav-item')?.classList.add('active');
}

// ==================== WINDOW EXPORTS ====================
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
window.switchSearchTab = switchSearchTab;
window.applyFilters = applyFilters;
window.searchByLetter = searchByLetter;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.setRating = setRating;
window.submitReview = submitReview;
window.toggleMobileMenu = toggleMobileMenu;
window.requireAuth = requireAuth;
window.approveBusiness = approveBusiness;
