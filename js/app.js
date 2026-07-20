// ==================== SIKKA - Self-Contained SaaS Platform ====================
// No Firebase, No Backend - Works everywhere!

// ==================== STATE ====================
let currentUser = null;
let businesses = [];
let reviews = {};
let users = [];
let searchType = 'name';
let currentReviewBizId = null;
let currentRating = 0;

// ==================== INIT DATA ====================
const DEFAULT_BUSINESSES = [
  { id:'b1', name:'ستاربكس', nameAr:'ستاربكس', nameEn:'Starbucks', categoryNameAr:'المقاهي', location:{ city:'الرياض', district:'حي العليا', address:'شارع التحلية 55' }, contact:{ phone:'0501234567', whatsapp:'966501234567', email:'info@starbucks.sa' }, description:'مقهى ستاربكس يقدم أفضل أنواع القهوة المختصة والمشروبات الباردة والساخنة في أجواء مريحة.', keywords:['قهوة','مقهى','كابتشينو','لاتيه'], brands:['Starbucks'], workingHours:{ saturday:'6:00 ص - 12:00 م', friday:'2:00 م - 12:00 م' }, rating:{ average:4.5, count:120 }, status:'approved', isVerified:true, createdAt:'2025-01-15' },
  { id:'b2', name:'بيتزا هت', nameAr:'بيتزا هت', nameEn:'Pizza Hut', categoryNameAr:'المطاعم', location:{ city:'جدة', district:'الروضة', address:'شارع الأمير سلطان 100' }, contact:{ phone:'0509876543', whatsapp:'966509876543' }, description:'مطعم بيتزا هت يقدم أشهى البيتزا والمعجنات الإيطالية بأسعار مناسبة للجميع.', keywords:['بيتزا','مطعم','وجبات سريعة'], brands:['Pizza Hut'], workingHours:{ saturday:'11:00 ص - 12:00 م', friday:'1:00 م - 12:00 م' }, rating:{ average:4.2, count:85 }, status:'approved', isVerified:true, createdAt:'2025-02-10' },
  { id:'b3', name:'مصرف الراجحي', nameAr:'مصرف الراجحي', nameEn:'Al Rajhi Bank', categoryNameAr:'البنوك', location:{ city:'الرياض', district:'حي العليا', address:'طريق الملك فهد 1000' }, contact:{ phone:'920001122' }, description:'مصرف الراجحي أكبر مصرف إسلامي في العالم يقدم خدمات مالية متنوعة.', keywords:['بنك','مصرف','خدمات مالية','قروض'], brands:['Al Rajhi'], workingHours:{ saturday:'9:30 ص - 4:30 م', friday:'مغلق' }, rating:{ average:4.0, count:200 }, status:'approved', isVerified:true, createdAt:'2025-01-20' },
  { id:'b4', name:'نمشي', nameAr:'نمشي', nameEn:'Namshi', categoryNameAr:'التجزئة', location:{ city:'الرياض', district:'حي النخيل', address:'مجمع الراشد' }, contact:{ phone:'0505551234', email:'support@namshi.com' }, description:'متجر نمشي للأزياء العصرية والماركات العالمية.', keywords:['تسوق','ملابس','أزياء'], brands:['Namshi'], rating:{ average:4.3, count:65 }, status:'approved', isVerified:true, createdAt:'2025-03-01' },
  { id:'b5', name:'مستشفى الملك فيصل', nameAr:'مستشفى الملك فيصل التخصصي', nameEn:'King Faisal Hospital', categoryNameAr:'الصحة', location:{ city:'الرياض', district:'حي العليا', address:'طريق الملك فهد 2000' }, contact:{ phone:'0114646464' }, description:'مستشفى الملك فيصل التخصصي من أفضل المستشفيات في المملكة.', keywords:['مستشفى','عيادة','طب','صحة'], rating:{ average:4.8, count:500 }, status:'approved', isVerified:true, createdAt:'2025-01-10' },
  { id:'b6', name:'جامعة الملك سعود', nameAr:'جامعة الملك سعود', nameEn:'King Saud University', categoryNameAr:'التعليم', location:{ city:'الرياض', district:'حي البطحاء', address:'طريق الأمير سلطان بن عبدالعزيز' }, contact:{ phone:'0114671111' }, description:'جامعة الملك سعود هي أقدم وأكبر جامعات المملكة العربية السعودية.', keywords:['جامعة','تعليم','دراسة'], rating:{ average:4.5, count:300 }, status:'approved', isVerified:true, createdAt:'2025-01-05' },
  { id:'b7', name:'أرامكو', nameAr:'أرامكو السعودية', nameEn:'Saudi Aramco', categoryNameAr:'الخدمات', location:{ city:'الظهران', district:'حي الظهران', address:'مقر أرامكو' }, contact:{ phone:'0138751000', email:'info@aramco.com' }, description:'أرامكو هي أكبر شركة نفط في العالم.', keywords:['نفط','طاقة','شركة'], brands:['Aramco'], rating:{ average:4.7, count:400 }, status:'approved', isVerified:true, createdAt:'2025-02-20' },
  { id:'b8', name:'المتحف الوطني', nameAr:'المتحف الوطني السعودي', nameEn:'National Museum', categoryNameAr:'السفر والسياحة', location:{ city:'الرياض', district:'حي البطحاء', address:'طريق الملك عبدالعزيز' }, contact:{ phone:'0112001000' }, description:'المتحف الوطني السعودي يعرض تاريخ المملكة وتراثها العريق.', keywords:['متحف','سياحة','تراث','ثقافة'], rating:{ average:4.6, count:150 }, status:'approved', isVerified:true, createdAt:'2025-03-10' },
];

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
const CITIES = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الظهران','الخبر','تبوك','أبها'];

// ==================== STORAGE ====================
function saveData() {
  localStorage.setItem('sikka_businesses', JSON.stringify(businesses));
  localStorage.setItem('sikka_reviews', JSON.stringify(reviews));
  localStorage.setItem('sikka_users', JSON.stringify(users));
}

function loadData() {
  try {
    const b = localStorage.getItem('sikka_businesses');
    const r = localStorage.getItem('sikka_reviews');
    const u = localStorage.getItem('sikka_users');
    businesses = b ? JSON.parse(b) : [...DEFAULT_BUSINESSES];
    reviews = r ? JSON.parse(r) : {};
    users = u ? JSON.parse(u) : [];
    if (!b) saveData(); // Save defaults first time
  } catch(e) {
    businesses = [...DEFAULT_BUSINESSES];
    reviews = {};
    users = [];
  }

  // Load current user
  const savedUser = localStorage.getItem('sikka_current_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Sikka starting...');
  loadData();
  loadHome();
  renderAlphaGrid();
  document.getElementById('search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
  updateAuthUI();
});

// ==================== TOAST ====================
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  const icon = type === 'success' ? 'ri-check-line' : type === 'error' ? 'ri-error-warning-line' : 'ri-information-line';
  t.innerHTML = `<i class="${icon}"></i> ${msg}`;
  t.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0f172a';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  console.log('📄 Navigate to:', page);
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

// ==================== AUTH ====================
function requireAuth(action) {
  if (currentUser) {
    navigateTo(action);
  } else {
    showAuthModal();
  }
}

function showAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('email-input').value = '';
  document.getElementById('password-input').value = '';
}
function hideAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }

function showSignupModal() {
  document.getElementById('signup-modal').style.display = 'flex';
  document.getElementById('signup-error').classList.add('hidden');
  document.getElementById('signup-name').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
}
function hideSignupModal() { document.getElementById('signup-modal').style.display = 'none'; }

function updateAuthUI() {
  const btns = document.getElementById('header-auth-btns');
  const name = document.getElementById('profile-name');
  const email = document.getElementById('profile-email');
  const authBtns = document.getElementById('auth-buttons');
  const menu = document.getElementById('profile-menu');
  const adminLink = document.getElementById('admin-nav-link');

  if (currentUser) {
    if (btns) btns.innerHTML = `<button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" onclick="navigateTo('profile')"><i class="ri-user-3-line"></i><span class="hidden sm:inline">${currentUser.name}</span></button>`;
    if (name) name.textContent = currentUser.name;
    if (email) email.textContent = currentUser.email;
    if (authBtns) authBtns.style.display = 'none';
    if (menu) menu.style.display = 'block';
    if (adminLink) adminLink.style.display = currentUser.isAdmin ? 'flex' : 'none';
  } else {
    if (btns) btns.innerHTML = `<button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" onclick="showAuthModal()"><i class="ri-login-box-line"></i> دخول</button>`;
    if (name) name.textContent = 'ضيف';
    if (email) email.textContent = 'سجّل الدخول للوصول لحسابك';
    if (authBtns) authBtns.style.display = 'block';
    if (menu) menu.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

function loginWithEmail() {
  const email = document.getElementById('email-input')?.value;
  const pass = document.getElementById('password-input')?.value;
  const errEl = document.getElementById('auth-error');

  if (!email || !pass) { errEl.textContent = 'أكمل جميع الحقول'; errEl.classList.remove('hidden'); return; }

  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) { errEl.textContent = 'البريد أو كلمة المرور غير صحيحة'; errEl.classList.remove('hidden'); return; }

  currentUser = user;
  localStorage.setItem('sikka_current_user', JSON.stringify(user));
  hideAuthModal();
  updateAuthUI();
  showToast('مرحباً بك ' + user.name + '!');
}

function signupWithEmail() {
  const name = document.getElementById('signup-name')?.value;
  const email = document.getElementById('signup-email')?.value;
  const pass = document.getElementById('signup-password')?.value;
  const errEl = document.getElementById('signup-error');

  if (!name || !email || !pass) { errEl.textContent = 'أكمل جميع الحقول'; errEl.classList.remove('hidden'); return; }
  if (pass.length < 4) { errEl.textContent = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'; errEl.classList.remove('hidden'); return; }
  if (users.find(u => u.email === email)) { errEl.textContent = 'البريد الإلكتروني مستخدم بالفعل'; errEl.classList.remove('hidden'); return; }

  const user = {
    id: 'user_' + Date.now(),
    name: name,
    email: email,
    password: pass,
    isAdmin: email === 'admin@sikka.com',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  currentUser = user;
  localStorage.setItem('sikka_current_user', JSON.stringify(user));
  saveData();
  hideSignupModal();
  updateAuthUI();
  showToast('تم إنشاء الحساب بنجاح!');
}

function loginWithGoogle() {
  // Simulate Google login
  const name = 'مستخدم Google';
  const email = 'google_' + Date.now() + '@gmail.com';

  let user = users.find(u => u.email === email);
  if (!user) {
    user = { id: 'user_' + Date.now(), name, email, password: '', isAdmin: false, createdAt: new Date().toISOString() };
    users.push(user);
    saveData();
  }

  currentUser = user;
  localStorage.setItem('sikka_current_user', JSON.stringify(user));
  hideAuthModal();
  hideSignupModal();
  updateAuthUI();
  showToast('مرحباً بك!');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('sikka_current_user');
  updateAuthUI();
  showToast('تم تسجيل الخروج');
  navigateTo('home');
}

// ==================== SEARCH ====================
function switchSearchTab(btn, type) {
  searchType = type;
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const placeholders = { name:'ابحث بالاسم...', keyword:'ابحث بالكلمة المفتاحية...', category:'اكتب اسم الفئة...', brand:'ابحث بالبراند...' };
  document.getElementById('search-input').placeholder = placeholders[type] || placeholders.name;
}

function performSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { loadHome(); return; }

  const approved = businesses.filter(b => b.status === 'approved');
  const filtered = approved.filter(b => {
    const searchIn = [b.name || '', b.nameAr || '', b.nameEn || '', b.categoryNameAr || '', b.location?.city || '', b.location?.district || '', ...(b.keywords || []), ...(b.brands || [])].join(' ').toLowerCase();
    return searchIn.includes(q.toLowerCase());
  });

  renderBusinesses(filtered);
}

function quickSearch(term) {
  document.getElementById('search-input').value = term;
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
  navigateTo('businesses');
  setTimeout(() => performSearch(), 100);
}

// ==================== HOME ====================
function loadHome() {
  const approved = businesses.filter(b => b.status === 'approved');
  renderBusinesses(approved.slice(0, 8));
  renderCategories(CATEGORIES);
  animateCounter('stat-biz', approved.length);
  animateCounter('stat-cities', CITIES.length);
}

function renderCategories(cats) {
  const g = document.getElementById('categories-grid');
  if (!g) return;
  g.innerHTML = cats.slice(0, 8).map((c, i) => `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="w-14 h-14 bg-gray-100 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300">
        <i class="${c.icon} text-xl text-gray-500 group-hover:text-white transition-colors"></i>
      </div>
      <div class="text-sm font-bold mb-1">${c.name}</div>
      <div class="text-xs text-gray-400">${approved.filter(b => b.categoryNameAr === c.name).length} نشاط</div>
    </div>
  `).join('');
}

function renderBusinesses(list) {
  const g = document.getElementById('businesses-grid');
  if (!g) return;
  if (!list.length) {
    g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>لا توجد أعمال بعد</h3><p>كن أول من يضيف نشاطه التجاري</p></div>';
    return;
  }
  g.innerHTML = list.map((b, i) => renderBusinessCard(b, i)).join('');
}

function renderBusinessCard(b, i = 0) {
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const reviewList = reviews[b.id] || [];
  const totalReviews = reviewCount + reviewList.length;

  return `
    <div class="biz-card group" onclick="openBusiness('${b.id}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="biz-card-img">
        <div class="biz-card-logo"><i class="ri-building-2-line"></i></div>
        ${b.isVerified ? '<span class="biz-badge verified">موثق</span>' : ''}
      </div>
      <div class="biz-card-body">
        <div class="biz-card-name">${b.nameAr || b.name}</div>
        <div class="biz-card-cat">${b.categoryNameAr || ''}</div>
        <div class="biz-card-info">
          ${b.location?.city ? `<span><i class="ri-map-pin-2-line"></i> ${b.location.city}</span>` : ''}
          ${b.contact?.phone ? `<span><i class="ri-phone-line"></i> ${b.contact.phone}</span>` : ''}
        </div>
      </div>
      <div class="biz-card-footer">
        <div class="biz-rating"><i class="ri-star-fill"></i> ${rating.toFixed(1)} <span>(${totalReviews})</span></div>
      </div>
    </div>
  `;
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el || target === 0) { if(el) el.textContent = target; return; }
  let current = 0;
  const step = Math.max(1, Math.floor(target / 20));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = current;
  }, 30);
}

// ==================== BUSINESSES PAGE ====================
function loadAllBusinesses() {
  const approved = businesses.filter(b => b.status === 'approved');
  populateFilters(approved);
  renderBusinessesTo(approved, document.getElementById('all-businesses-grid'));
}

function populateFilters(list) {
  const cats = [...new Set(list.map(b => b.categoryNameAr).filter(Boolean))];
  const cities = [...new Set(list.map(b => b.location?.city).filter(Boolean))];
  const areas = [...new Set(list.map(b => b.location?.district).filter(Boolean))];

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
  let filtered = businesses.filter(b => b.status === 'approved');

  if (cat) filtered = filtered.filter(b => b.categoryNameAr === cat);
  if (city) filtered = filtered.filter(b => b.location?.city === city);
  if (area) filtered = filtered.filter(b => b.location?.district === area);
  if (sort === 'rating') filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
  else if (sort === 'reviews') filtered.sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0));
  else if (sort === 'alpha') filtered.sort((a, b) => (a.nameAr || '').localeCompare(b.nameAr || '', 'ar'));

  renderBusinessesTo(filtered, document.getElementById('all-businesses-grid'));
}

function renderBusinessesTo(list, container) {
  if (!container) return;
  if (!list.length) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>لا توجد أعمال</h3></div>'; return; }
  container.innerHTML = list.map((b, i) => renderBusinessCard(b, i)).join('');
}

// ==================== BUSINESS DETAIL ====================
function openBusiness(id) {
  const b = businesses.find(biz => biz.id === id);
  if (!b) { showToast('النشاط غير موجود', 'error'); return; }
  renderBusinessDetail(b);
}

function renderBusinessDetail(b) {
  const c = document.getElementById('business-detail');
  if (!c) return;
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const bizReviews = reviews[b.id] || [];
  const totalReviews = reviewCount + bizReviews.length;

  const hours = b.workingHours || {};
  const hoursHtml = hours.saturday ? `
    <div class="detail-section">
      <h3><i class="ri-time-line text-amber-500"></i> ساعات العمل</h3>
      ${Object.entries(hours).filter(([_, v]) => v).map(([day, time]) => `<div class="hours-row"><span>${getDayName(day)}</span><span>${time}</span></div>`).join('')}
    </div>
  ` : '';

  const keywordsHtml = b.keywords?.length ? `<div class="detail-section"><h3><i class="ri-hashtag text-blue-500"></i> الكلمات المفتاحية</h3><div class="keywords-list">${b.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}</div></div>` : '';
  const brandsHtml = b.brands?.length ? `<div class="detail-section"><h3><i class="ri-bookmark-line text-purple-500"></i> البراندات</h3><div class="keywords-list">${b.brands.map(b => `<span class="keyword-tag">${b}</span>`).join('')}</div></div>` : '';

  // Build reviews HTML
  let reviewsHtml = '';
  if (bizReviews.length) {
    reviewsHtml = bizReviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${r.userName[0]}</div>
          <div><div class="review-name">${r.userName}</div><div class="review-date">${r.date}</div></div>
        </div>
        <div class="review-stars">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < r.rating ? 'fill' : 'line'}" style="color:${i < r.rating ? '#f59e0b' : '#cbd5e1'}"></i>`).join('')}</div>
        ${r.title ? `<div class="review-title">${r.title}</div>` : ''}
        ${r.comment ? `<div class="review-text">${r.comment}</div>` : ''}
      </div>
    `).join('');
  } else {
    reviewsHtml = '<p class="text-gray-500 text-sm text-center py-4">لا توجد تقييمات بعد. كن أول من يقيّم!</p>';
  }

  c.innerHTML = `
    <div class="detail-hero">
      ${b.location?.lat && b.location?.lng ? `<div id="detail-map" style="width:100%;height:100%"></div>` : `<div style="font-size:4rem"><i class="ri-building-2-line" style="color:#cbd5e1"></i></div>`}
      <button class="back-btn" onclick="closeDetail()"><i class="ri-arrow-right-line"></i></button>
    </div>
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-logo"><i class="ri-building-2-line"></i></div>
        <div>
          <h1 class="detail-name">${b.nameAr || b.name}</h1>
          <div class="detail-category">${b.categoryNameAr || ''}</div>
          <div class="detail-stats">
            <div class="detail-stat"><i class="ri-star-fill"></i> ${rating.toFixed(1)} (${totalReviews} تقييم)</div>
            ${b.location?.city ? `<div class="detail-stat"><i class="ri-map-pin-2-line"></i> ${b.location.city}${b.location.district ? ' - ' + b.location.district : ''}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="detail-actions">
        ${b.contact?.phone ? `<a href="tel:${b.contact.phone}" class="action-btn call"><i class="ri-phone-line"></i> اتصل</a>` : ''}
        ${b.contact?.whatsapp ? `<a href="https://wa.me/${b.contact.whatsapp}" target="_blank" class="action-btn whatsapp"><i class="ri-whatsapp-line"></i> واتساب</a>` : ''}
        ${b.contact?.email ? `<a href="mailto:${b.contact.email}" class="action-btn email"><i class="ri-mail-line"></i> إيميل</a>` : ''}
        ${b.location?.lat && b.location?.lng ? `<a href="https://www.google.com/maps?q=${b.location.lat},${b.location.lng}" target="_blank" class="action-btn map"><i class="ri-map-pin-line"></i> الخريطة</a>` : ''}
        <button class="action-btn review" onclick="openReviewModal('${b.id}')"><i class="ri-star-line"></i> تقييم</button>
      </div>
      ${b.description ? `<div class="detail-section"><h3><i class="ri-information-line text-gray-500"></i> عن النشاط</h3><p>${b.description}</p></div>` : ''}
      ${b.location?.address ? `<div class="detail-section"><h3><i class="ri-map-pin-line text-red-500"></i> العنوان</h3><p>${b.location.address}${b.location.district ? ', ' + b.location.district : ''}${b.location.city ? ', ' + b.location.city : ''}</p></div>` : ''}
      ${hoursHtml}${keywordsHtml}${brandsHtml}
      <div class="detail-section">
        <h3><i class="ri-star-line text-amber-500"></i> التقييمات (${totalReviews})</h3>
        <div id="reviews-list">${reviewsHtml}</div>
      </div>
    </div>
  `;

  document.getElementById('page-business').classList.add('active');
  document.querySelectorAll('.page:not(#page-business)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });

  if (b.location?.lat && b.location?.lng) {
    setTimeout(() => {
      try {
        const detailMap = L.map('detail-map').setView([b.location.lat, b.location.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(detailMap);
        L.marker([b.location.lat, b.location.lng]).addTo(detailMap);
      } catch(e) {}
    }, 200);
  }
}

function getDayName(day) {
  const days = { saturday:'السبت', sunday:'الأحد', monday:'الإثنين', tuesday:'الثلاثاء', wednesday:'الأربعاء', thursday:'الخميس', friday:'الجمعة' };
  return days[day] || day;
}

function closeDetail() {
  document.getElementById('page-business')?.classList.remove('active');
  document.getElementById('page-home')?.classList.add('active');
}

// ==================== REVIEWS ====================
function openReviewModal(bizId) {
  if (!currentUser) { showAuthModal(); showToast('يجب تسجيل الدخول', 'info'); return; }
  currentReviewBizId = bizId;
  currentRating = 0;
  document.querySelectorAll('#star-rating button i').forEach(s => s.className = 'ri-star-line');
  document.getElementById('review-title').value = '';
  document.getElementById('review-text').value = '';
  document.getElementById('review-modal').style.display = 'flex';
}

function closeReviewModal() { document.getElementById('review-modal').style.display = 'none'; }

function setRating(r) {
  currentRating = r;
  document.querySelectorAll('#star-rating button').forEach((btn, i) => {
    btn.querySelector('i').className = i < r ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300';
  });
}

function submitReview() {
  if (!currentUser) { showAuthModal(); return; }
  if (!currentRating) { showToast('اختر تقييم', 'error'); return; }
  const title = document.getElementById('review-title')?.value;
  const text = document.getElementById('review-text')?.value;

  if (!reviews[currentReviewBizId]) reviews[currentReviewBizId] = [];
  reviews[currentReviewBizId].push({
    userId: currentUser.id,
    userName: currentUser.name,
    rating: currentRating,
    title: title || '',
    comment: text || '',
    date: new Date().toLocaleDateString('ar-SA')
  });

  // Update average
  const b = businesses.find(biz => biz.id === currentReviewBizId);
  if (b) {
    const allRatings = reviews[currentReviewBizId].map(r => r.rating);
    const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    b.rating = { average: avg, count: allRatings.length };
  }

  saveData();
  showToast('تم إرسال التقييم!');
  closeReviewModal();
  openBusiness(currentReviewBizId);
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
        <button class="px-8 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all" onclick="showAuthModal()"><i class="ri-login-box-line ml-2"></i>تسجيل دخول</button>
      </div>
    `;
    return;
  }

  c.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="form-label">اسم النشاط *</label><input type="text" class="form-input" id="biz-name" placeholder="اسم النشاط بالعربي"></div>
        <div><label class="form-label">الفئة *</label><select class="form-input" id="biz-category"><option value="">اختر الفئة</option>${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}</select></div>
        <div><label class="form-label">المدينة *</label><input type="text" class="form-input" id="biz-city" placeholder="مثال: الرياض"></div>
        <div><label class="form-label">الحي</label><input type="text" class="form-input" id="biz-district" placeholder="مثال: حي العليا"></div>
        <div class="sm:col-span-2"><label class="form-label">العنوان التفصيلي</label><input type="text" class="form-input" id="biz-address" placeholder="العنوان بالتفصيل"></div>
        <div><label class="form-label">الجوال *</label><input type="tel" class="form-input" id="biz-phone" placeholder="05XXXXXXXX"></div>
        <div><label class="form-label">واتساب</label><input type="tel" class="form-input" id="biz-whatsapp" placeholder="966XXXXXXXXX"></div>
        <div><label class="form-label">البريد الإلكتروني</label><input type="email" class="form-input" id="biz-email" placeholder="email@example.com"></div>
        <div class="sm:col-span-2"><label class="form-label">الوصف</label><textarea class="form-input" id="biz-description" rows="3" placeholder="وصف النشاط التجاري"></textarea></div>
        <div class="sm:col-span-2"><label class="form-label">الكلمات المفتاحية (افصل بفاصلة)</label><input type="text" class="form-input" id="biz-keywords" placeholder="مقهوة، قهوة، حبوب"></div>
        <div class="sm:col-span-2"><label class="form-label">البراندات (افصل بفاصلة)</label><input type="text" class="form-input" id="biz-brands" placeholder="Starbucks, Costa"></div>
        <div><label class="form-label">ساعات العمل (السبت-الخميس)</label><input type="text" class="form-input" id="biz-hours-week" placeholder="8:00 ص - 11:00 م"></div>
        <div><label class="form-label">ساعات العمل (الجمعة)</label><input type="text" class="form-input" id="biz-hours-fri" placeholder="1:00 م - 11:00 م"></div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="flex-1 py-3 px-6 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2" onclick="submitBusiness()"><i class="ri-send-plane-line"></i> نشر النشاط</button>
        <button class="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all" onclick="navigateTo('home')">إلغاء</button>
      </div>
    </div>
  `;
}

function submitBusiness() {
  if (!currentUser) { showAuthModal(); return; }
  const name = document.getElementById('biz-name')?.value;
  if (!name) { showToast('أدخل اسم النشاط', 'error'); return; }

  const newBiz = {
    id: 'biz_' + Date.now(),
    name: name,
    nameAr: name,
    nameEn: '',
    categoryNameAr: document.getElementById('biz-category')?.value || '',
    location: {
      city: document.getElementById('biz-city')?.value || '',
      district: document.getElementById('biz-district')?.value || '',
      address: document.getElementById('biz-address')?.value || '',
    },
    contact: {
      phone: document.getElementById('biz-phone')?.value || '',
      whatsapp: document.getElementById('biz-whatsapp')?.value || '',
      email: document.getElementById('biz-email')?.value || '',
    },
    description: document.getElementById('biz-description')?.value || '',
    keywords: (document.getElementById('biz-keywords')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    brands: (document.getElementById('biz-brands')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
    workingHours: {
      saturday: document.getElementById('biz-hours-week')?.value || '',
      friday: document.getElementById('biz-hours-fri')?.value || '',
    },
    rating: { average: 0, count: 0 },
    status: 'approved',
    userId: currentUser.id,
    userName: currentUser.name,
    isVerified: false,
    createdAt: new Date().toISOString()
  };

  businesses.push(newBiz);
  saveData();
  showToast('تم إضافة نشاطك بنجاح!');
  navigateTo('home');
}

// ==================== CATEGORIES PAGE ====================
function loadCategoriesFull() {
  const g = document.getElementById('categories-full-grid');
  if (!g) return;
  g.innerHTML = CATEGORIES.map((c, i) => {
    const count = businesses.filter(b => b.categoryNameAr === c.name && b.status === 'approved').length;
    return `
      <div class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
        <div class="w-14 h-14 bg-gray-100 group-hover:bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"><i class="${c.icon} text-xl text-gray-500 group-hover:text-white transition-colors"></i></div>
        <div><h3 class="font-bold mb-1">${c.name}</h3><p class="text-gray-500 text-sm">${c.desc}</p><p class="text-xs text-gray-400 mt-1">${count} نشاط</p></div>
      </div>
    `;
  }).join('');
}

// ==================== BLOG ====================
function loadBlog() {
  const g = document.getElementById('blog-list');
  if (!g) return;
  g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>لا توجد مقالات بعد</h3><p>قريباً إن شاء الله</p></div>';
}

function openPost(id) {
  const c = document.getElementById('post-detail');
  if (!c) return;
  c.innerHTML = `<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8"><button onclick="closeDetail()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"><i class="ri-arrow-right-line"></i> العودة</button><div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8"><h1 class="text-2xl font-bold mb-4">${id}</h1><p class="text-gray-500">المحتوى غير متاح حالياً</p></div></div>`;
  document.getElementById('page-post-detail')?.classList.add('active');
  document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
}

// ==================== PROFILE ====================
function loadProfile() {
  updateAuthUI();
}

// ==================== ADMIN ====================
function loadAdmin() {
  const c = document.getElementById('admin-content');
  if (!c) return;

  const allBiz = businesses;
  const pending = allBiz.filter(b => b.status === 'pending');
  const approved = allBiz.filter(b => b.status === 'approved');
  const totalReviews = Object.values(reviews).flat().length;

  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">لوحة التحكم</h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">إجمالي الأعمال</div><div class="text-3xl font-bold">${allBiz.length}</div></div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">معتمدة</div><div class="text-3xl font-bold text-green-600">${approved.length}</div></div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">قيد المراجعة</div><div class="text-3xl font-bold text-amber-600">${pending.length}</div></div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5"><div class="text-sm text-gray-500 mb-2">التقييمات</div><div class="text-3xl font-bold">${totalReviews}</div></div>
    </div>
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-bold mb-4">جميع الأعمال</h3>
      ${allBiz.length ? `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead><tr class="border-b border-gray-200 text-right text-sm text-gray-500">
              <th class="py-3 font-semibold">الاسم</th><th class="py-3 font-semibold">الفئة</th><th class="py-3 font-semibold">المدينة</th><th class="py-3 font-semibold">الحالة</th><th class="py-3 font-semibold">إجراء</th>
            </tr></thead>
            <tbody>${allBiz.map(b => {
              const statusClass = b.status === 'approved' ? 'text-green-600 bg-green-50' : b.status === 'pending' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
              const statusText = b.status === 'approved' ? 'معتمد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض';
              return `<tr class="border-b border-gray-100">
                <td class="py-3 text-sm font-medium">${b.nameAr || b.name}</td>
                <td class="py-3 text-sm text-gray-500">${b.categoryNameAr || ''}</td>
                <td class="py-3 text-sm text-gray-500">${b.location?.city || ''}</td>
                <td class="py-3"><span class="px-2 py-1 rounded-lg text-xs font-semibold ${statusClass}">${statusText}</span></td>
                <td class="py-3 space-x-2">
                  ${b.status !== 'approved' ? `<button class="text-sm text-green-600 hover:underline" onclick="approveBusiness('${b.id}','approved')">اعتماد</button>` : ''}
                  ${b.status !== 'rejected' ? `<button class="text-sm text-red-600 hover:underline" onclick="approveBusiness('${b.id}','rejected')">رفض</button>` : ''}
                  <button class="text-sm text-gray-600 hover:underline" onclick="deleteBusiness('${b.id}')">حذف</button>
                </td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>
      ` : '<p class="text-gray-500 text-center py-8">لا توجد أعمال بعد</p>'}
    </div>
  `;
}

function approveBusiness(id, status) {
  const b = businesses.find(biz => biz.id === id);
  if (b) { b.status = status; saveData(); showToast('تم تحديث الحالة'); loadAdmin(); }
}

function deleteBusiness(id) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  businesses = businesses.filter(b => b.id !== id);
  delete reviews[id];
  saveData();
  showToast('تم الحذف');
  loadAdmin();
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
window.deleteBusiness = deleteBusiness;
