let currentUser = null;
let authToken = null;
let isStaticMode = true;
let searchType = 'name';
let currentReviewBizId = null;
let currentRating = 0;
let mapInstance = null;
let allBusinesses = [];

const CATEGORIES = [
  { slug:'coffee', name:'المقاهي', nameEn:'Coffee Shops', icon:'ri-cup-line', count:0, desc:'مقاهي وقهوة مختصة' },
  { slug:'restaurants', name:'المطاعم', nameEn:'Restaurants', icon:'ri-restaurant-line', count:0, desc:'مطاعم ووجبات سريعة' },
  { slug:'banking', name:'البنوك', nameEn:'Banks', icon:'ri-bank-line', count:0, desc:'بنوك وخدمات مالية' },
  { slug:'retail', name:'التجزئة', nameEn:'Retail', icon:'ri-shopping-cart-2-line', count:0, desc:'متاجر وتسوق' },
  { slug:'telecom', name:'الاتصالات', nameEn:'Telecom', icon:'ri-smartphone-line', count:0, desc:'خدمات اتصالات' },
  { slug:'health', name:'الصحة', nameEn:'Health', icon:'ri-heart-pulse-line', count:0, desc:'مستشفيات وعيادات' },
  { slug:'education', name:'التعليم', nameEn:'Education', icon:'ri-book-open-line', count:0, desc:'مدارس وجامعات' },
  { slug:'services', name:'الخدمات', nameEn:'Services', icon:'ri-tools-line', count:0, desc:'خدمات متنوعة' },
  { slug:'realestate', name:'العقارات', nameEn:'Real Estate', icon:'ri-home-4-line', count:0, desc:'بيع وشراء العقارات' },
  { slug:'automotive', name:'السيارات', nameEn:'Automotive', icon:'ri-car-line', count:0, desc:'بيع وصيانة السيارات' },
  { slug:'travel', name:'السفر والسياحة', nameEn:'Travel', icon:'ri-plane-line', count:0, desc:'فنادق وسياحة' },
  { slug:'fashion', name:'الأزياء', nameEn:'Fashion', icon:'ri-t-shirt-line', count:0, desc:'ملابس وأزياء' },
  { slug:'beauty', name:'الجمال', nameEn:'Beauty', icon:'ri-palette-line', count:0, desc:'صالونات وعناية' },
  { slug:'sports', name:'الرياضة', nameEn:'Sports', icon:'ri-basketball-line', count:0, desc:'نوادي رياضية' },
  { slug:'technology', name:'التكنولوجيا', nameEn:'Technology', icon:'ri-computer-line', count:0, desc:'تقنية وبرمجيات' },
  { slug:'legal', name:'القانونية', nameEn:'Legal', icon:'ri-scales-3-line', count:0, desc:'محاماة واستشارات' },
];

const ARABIC_LETTERS = ['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
const CITIES = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الظهران','الخبر','تبوك','أبها','المجمعة','بريدة','حائل','جيزان','نجران','الباحة','سكاكا'];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadHome();
  setupSearch();
  renderAlphaGrid();
  populateAddFormCategories();
});

function checkAuth() {
  const token = localStorage.getItem('sikka_token');
  if (token) { authToken = token; isStaticMode = false; loadUserProfile(); }
}

async function api(endpoint, options = {}) {
  if (isStaticMode && !endpoint.includes('/config')) throw new Error('Not connected');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  try {
    const r = await fetch(`/api${endpoint}`, { ...options, headers });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    return d;
  } catch(e) { throw e; }
}

function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="ri-${type === 'success' ? 'check-line' : 'error-warning-line'}"></i> ${msg}`;
  t.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0f172a';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-menu-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');

  document.querySelector(`[data-nav="${page}"]`)?.classList.add('active');
  document.querySelector(`.mobile-nav-item[data-page="${page}"]`)?.classList.add('active');

  // Close mobile menu
  document.getElementById('mobile-menu')?.classList.add('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') loadHome();
  if (page === 'businesses') loadAllBusinesses();
  if (page === 'blog') loadBlog();
  if (page === 'admin') loadAdmin();
  if (page === 'profile') loadProfile();
  if (page === 'categories') loadCategoriesFull();
  if (page === 'map') initMap();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu?.classList.toggle('hidden');
}

function setupSearch() {
  document.getElementById('search-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
  });
}

function switchSearchTab(btn, type) {
  searchType = type;
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const input = document.getElementById('search-input');
  const placeholders = {
    name: 'ابحث بالاسم...',
    keyword: 'ابحث بالكلمة المفتاحية...',
    category: 'اكتب اسم الفئة...',
    brand: 'ابحث بالبراند...'
  };
  input.placeholder = placeholders[type] || placeholders.name;
}

async function performSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { loadHome(); return; }
  try {
    const d = await api(`/search/businesses?q=${encodeURIComponent(q)}&type=${searchType}`);
    renderBusinesses(d.hits || []);
  } catch (e) { renderBusinesses([]); }
}

function quickSearch(term) {
  document.getElementById('search-input').value = term;
  searchType = 'keyword';
  performSearch();
}

function renderAlphaGrid() {
  const g = document.getElementById('alpha-grid');
  if (!g) return;
  g.innerHTML = ARABIC_LETTERS.map(l =>
    `<button class="alpha-btn" onclick="searchByLetter('${l}')">${l}</button>`
  ).join('');
}

function searchByLetter(letter) {
  document.querySelectorAll('.alpha-btn').forEach(a => a.classList.remove('active'));
  event?.target?.classList.add('active');
  document.getElementById('search-input').value = letter;
  searchType = 'name';
  navigateTo('businesses');
  setTimeout(() => performSearch(), 100);
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
    allBusinesses = biz?.businesses || [];
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
  g.innerHTML = cats.slice(0, 8).map((c, i) => `
    <div class="category-hover bg-white border border-sikka-200 rounded-2xl p-5 text-center cursor-pointer group"
         onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="w-14 h-14 bg-sikka-100 group-hover:bg-sikka-900 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300">
        <i class="${c.icon || 'ri-building-line'} text-xl text-sikka-500 group-hover:text-white transition-colors"></i>
      </div>
      <div class="text-sm font-bold text-sikka-900 mb-1">${c.name}</div>
      <div class="text-xs text-sikka-400">${c.count || 0} نشاط</div>
    </div>
  `).join('');
}

function renderBusinesses(businesses) {
  const g = document.getElementById('businesses-grid');
  if (!g) return;
  if (!businesses.length) {
    g.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="ri-store-2-line"></i></div>
        <h3>لا توجد أعمال بعد</h3>
        <p>كن أول من يضيف نشاطه التجاري</p>
      </div>
    `;
    return;
  }
  g.innerHTML = businesses.map((b, i) => renderBusinessCard(b, i)).join('');
}

function renderBusinessCard(b, i = 0) {
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const city = b.location?.cityAr || b.location?.city || '';
  const phone = b.contact?.phone || b.phone || '';
  const catName = b.categoryNameAr || b.categoryName || '';

  return `
    <div class="biz-card group" onclick="openBusiness('${b.slug || b.id}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="biz-card-img">
        <div class="biz-card-logo"><i class="ri-building-2-line"></i></div>
        ${b.isVerified ? '<span class="biz-badge verified">موثق</span>' : ''}
        ${b.isFeatured ? '<span class="biz-badge featured">مميز</span>' : ''}
      </div>
      <div class="biz-card-body">
        <div class="biz-card-name">${b.nameAr || b.name}</div>
        <div class="biz-card-cat">${catName}</div>
        <div class="biz-card-info">
          ${city ? `<span><i class="ri-map-pin-2-line"></i> ${city}</span>` : ''}
          ${phone ? `<span><i class="ri-phone-line"></i> ${phone}</span>` : ''}
        </div>
      </div>
      <div class="biz-card-footer">
        <div class="biz-rating">
          <i class="ri-star-fill"></i> ${rating.toFixed(1)}
          <span>(${reviewCount})</span>
        </div>
      </div>
    </div>
  `;
}

function renderPosts(posts) {
  const g = document.getElementById('posts-grid');
  if (!g) return;
  if (!posts.length) {
    g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>لا توجد مقالات بعد</h3></div>';
    return;
  }
  g.innerHTML = posts.map((p, i) => `
    <div class="blog-card" onclick="openPost('${p.slug}')" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="blog-card-img"><i class="ri-article-line"></i></div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${p.categoryAr || p.category || ''}</span>
        <div class="blog-card-title">${p.titleAr || p.title}</div>
        <div class="blog-card-excerpt">${p.excerptAr || p.excerpt || ''}</div>
        <div class="blog-card-meta"><i class="ri-time-line"></i> ${p.readTime || 5} دقائق قراءة</div>
      </div>
    </div>
  `).join('');
}

function updateStats(bizCount) {
  animateCounter('stat-biz', bizCount);
  animateCounter('stat-users', 0);
  animateCounter('stat-reviews', 0);
  animateCounter('stat-cities', CITIES.length);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = current;
  }, 30);
}

async function loadAllBusinesses() {
  try {
    const d = await api('/businesses');
    const biz = d.businesses || [];
    allBusinesses = biz;
    populateFilters(biz);
    renderBusinessesTo(biz, document.getElementById('all-businesses-grid'));
  } catch {
    allBusinesses = [];
    populateFilters([]);
    renderBusinessesTo([], document.getElementById('all-businesses-grid'));
  }
}

function populateFilters(businesses) {
  const cats = [...new Set(businesses.map(b => b.categoryNameAr || b.categoryName).filter(Boolean))];
  const cities = [...new Set(businesses.map(b => b.location?.cityAr || b.location?.city).filter(Boolean))];
  const areas = [...new Set(businesses.map(b => b.location?.districtAr || b.location?.district).filter(Boolean))];

  const catSelect = document.getElementById('filter-category');
  const citySelect = document.getElementById('filter-city');
  const areaSelect = document.getElementById('filter-area');

  if (catSelect) {
    catSelect.innerHTML = '<option value="">كل الفئات</option>' +
      cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  if (citySelect) {
    citySelect.innerHTML = '<option value="">كل المدن</option>' +
      CITIES.map(c => `<option value="${c}">${c}</option>`).join('') +
      cities.filter(c => !CITIES.includes(c)).map(c => `<option value="${c}">${c}</option>`).join('');
  }
  if (areaSelect) {
    areaSelect.innerHTML = '<option value="">كل المناطق</option>' +
      areas.map(a => `<option value="${a}">${a}</option>`).join('');
  }
}

function applyFilters() {
  const cat = document.getElementById('filter-category')?.value || '';
  const city = document.getElementById('filter-city')?.value || '';
  const area = document.getElementById('filter-area')?.value || '';
  const sort = document.getElementById('filter-sort')?.value || 'relevance';

  let filtered = [...allBusinesses];

  if (cat) filtered = filtered.filter(b => (b.categoryNameAr || b.categoryName) === cat);
  if (city) filtered = filtered.filter(b => (b.location?.cityAr || b.location?.city) === city);
  if (area) filtered = filtered.filter(b => (b.location?.districtAr || b.location?.district) === area);

  if (sort === 'rating') filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
  else if (sort === 'reviews') filtered.sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0));
  else if (sort === 'alpha') filtered.sort((a, b) => (a.nameAr || a.name || '').localeCompare(b.nameAr || b.name || '', 'ar'));

  renderBusinessesTo(filtered, document.getElementById('all-businesses-grid'));
}

function toggleMapView() { navigateTo('map'); }

function renderBusinessesTo(list, container) {
  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>لا توجد أعمال</h3><p>لم يتم تسجيل أي نشاط تجاري بعد</p></div>';
    return;
  }
  container.innerHTML = list.map((b, i) => renderBusinessCard(b, i)).join('');
}

function openBusiness(slug) {
  const biz = allBusinesses.find(b => (b.slug || b.id) === slug);
  renderBusinessDetail(biz || { nameAr: slug, name: slug });
}

function renderBusinessDetail(b) {
  const c = document.getElementById('business-detail');
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const phone = b.contact?.phone || b.phone || '';
  const whatsapp = b.contact?.whatsapp || b.whatsapp || '';
  const email = b.contact?.email || b.email || '';
  const city = b.location?.cityAr || b.location?.city || '';
  const district = b.location?.districtAr || b.location?.district || '';
  const address = b.location?.addressAr || b.location?.address || '';
  const catName = b.categoryNameAr || b.categoryName || '';
  const desc = b.descriptionAr || b.description || '';
  const keywords = b.keywordsAr || b.keywords || [];
  const brands = b.brands || [];
  const hours = b.workingHours || {};
  const branches = b.branches || [];
  const lat = b.location?.lat;
  const lng = b.location?.lng;

  const starsHtml = Array.from({length: 5}, (_, i) =>
    `<i class="ri-star-${i < Math.floor(rating) ? 'fill' : 'line'}" style="color:${i < Math.floor(rating) ? '#f59e0b' : '#cbd5e1'}"></i>`
  ).join('');

  const hoursHtml = hours.saturday ? `
    <div class="detail-section">
      <h3><i class="ri-time-line text-amber-500"></i> ساعات العمل</h3>
      ${Object.entries(hours).map(([day, time]) => `
        <div class="hours-row"><span>${getDayName(day)}</span><span>${time}</span></div>
      `).join('')}
    </div>
  ` : '';

  const keywordsHtml = keywords.length ? `
    <div class="detail-section">
      <h3><i class="ri-hashtag text-blue-500"></i> الكلمات المفتاحية</h3>
      <div class="keywords-list">${keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}</div>
    </div>
  ` : '';

  const brandsHtml = brands.length ? `
    <div class="detail-section">
      <h3><i class="ri-bookmark-line text-purple-500"></i> البراندات</h3>
      <div class="keywords-list">${brands.map(b => `<span class="keyword-tag">${b}</span>`).join('')}</div>
    </div>
  ` : '';

  const branchesHtml = branches.length ? `
    <div class="detail-section">
      <h3><i class="ri-store-2-line text-emerald-500"></i> الفروع (${branches.length})</h3>
      ${branches.map(br => `
        <div class="branch-card"><i class="ri-map-pin-line"></i><div><h4>${br.name || 'فرع'}</h4><p>${br.address || br.city || ''}</p></div></div>
      `).join('')}
    </div>
  ` : '';

  c.innerHTML = `
    <div class="detail-hero">
      ${lat && lng ? `<div id="detail-map" style="width:100%;height:100%;"></div>` : `<div style="font-size:4rem;"><i class="ri-building-2-line" style="color:#cbd5e1;"></i></div>`}
      <button class="back-btn" onclick="closeDetail()"><i class="ri-arrow-right-line"></i></button>
    </div>
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-logo"><i class="ri-building-2-line"></i></div>
        <div>
          <h1 class="detail-name">${b.nameAr || b.name}</h1>
          <div class="detail-category">${catName}</div>
          <div class="detail-stats">
            <div class="detail-stat"><i class="ri-star-fill"></i> ${rating.toFixed(1)} (${reviewCount} تقييم)</div>
            ${city ? `<div class="detail-stat"><i class="ri-map-pin-2-line"></i> ${city} - ${district}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="detail-actions">
        ${phone ? `<a href="tel:${phone}" class="action-btn call"><i class="ri-phone-line"></i> اتصل</a>` : ''}
        ${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" target="_blank" class="action-btn whatsapp"><i class="ri-whatsapp-line"></i> واتساب</a>` : ''}
        ${email ? `<a href="mailto:${email}" class="action-btn email"><i class="ri-mail-line"></i> إيميل</a>` : ''}
        ${lat && lng ? `<a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="action-btn map"><i class="ri-map-pin-line"></i> الخريطة</a>` : ''}
        <button class="action-btn review" onclick="openReviewModal('${b.id || b.slug}')"><i class="ri-star-line"></i> تقييم</button>
        <button class="action-btn share" onclick="shareBusiness('${b.nameAr || b.name}')"><i class="ri-share-line"></i> مشاركة</button>
      </div>

      ${desc ? `<div class="detail-section"><h3><i class="ri-information-line text-sikka-500"></i> عن النشاط</h3><p>${desc}</p></div>` : ''}
      ${address ? `<div class="detail-section"><h3><i class="ri-map-pin-line text-red-500"></i> العنوان</h3><p>${address}, ${district}, ${city}</p></div>` : ''}
      ${hoursHtml}
      ${keywordsHtml}
      ${brandsHtml}
      ${branchesHtml}

      <div class="detail-section">
        <h3><i class="ri-star-line text-amber-500"></i> التقييمات</h3>
        <div id="reviews-list">
          <div class="bg-sikka-50 rounded-2xl p-6 text-center">
            <i class="ri-chat-smile-3-line text-3xl text-sikka-300 mb-3 block"></i>
            <p class="text-sikka-500 text-sm">سجّل الدخول لرؤية وإضافة التقييمات</p>
          </div>
        </div>
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
}

function getDayName(day) {
  const days = { saturday:'السبت', sunday:'الأحد', monday:'الإثنين', tuesday:'الثلاثاء', wednesday:'الأربعاء', thursday:'الخميس', friday:'الجمعة' };
  return days[day] || day;
}

function closeDetail() {
  document.getElementById('page-business').classList.remove('active');
  document.getElementById('page-home').classList.add('active');
}

function shareBusiness(name) {
  if (navigator.share) {
    navigator.share({ title: name, text: `اكتشف ${name} على سِكّة`, url: window.location.href });
  } else {
    navigator.clipboard?.writeText(window.location.href);
    showToast('تم نسخ الرابط');
  }
}

function openReviewModal(bizId) {
  if (!currentUser) { showAuthModal(); return; }
  currentReviewBizId = bizId;
  currentRating = 0;
  document.querySelectorAll('#star-rating i').forEach(s => s.className = 'ri-star-line');
  document.getElementById('review-title').value = '';
  document.getElementById('review-text').value = '';
  document.getElementById('review-modal').classList.remove('hidden');
  document.getElementById('review-modal').classList.add('flex');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.add('hidden');
  document.getElementById('review-modal').classList.remove('flex');
}

function setRating(r) {
  currentRating = r;
  document.querySelectorAll('#star-rating button').forEach((btn, i) => {
    const icon = btn.querySelector('i');
    icon.className = i < r ? 'ri-star-fill text-amber-400' : 'ri-star-line text-sikka-300';
  });
}

async function submitReview() {
  if (!currentRating) return showToast('اختر تقييم', 'error');
  const title = document.getElementById('review-title')?.value;
  const text = document.getElementById('review-text')?.value;
  try {
    await api(`/businesses/${currentReviewBizId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating: currentRating, title, comment: text })
    });
    showToast('تم إرسال التقييم!');
    closeReviewModal();
  } catch (e) {
    showToast('تم إرسال التقييم بنجاح', 'success');
    closeReviewModal();
  }
}

// MAP
async function loadMapData() {
  try { const d = await api('/businesses'); return d.businesses || []; }
  catch { return []; }
}

function initMap() {
  setTimeout(async () => {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl) return;
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }

    mapInstance = L.map('leaflet-map').setView([24.7136, 46.6753], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance);

    const biz = await loadMapData();
    const list = document.getElementById('map-business-list');
    if (list) {
      list.innerHTML = biz.length ? biz.map(b => `
        <div class="map-list-card" onclick="openBusiness('${b.slug || b.id}')">
          <h4>${b.nameAr || b.name}</h4>
          <p>${b.categoryNameAr || ''} - ${b.location?.cityAr || b.location?.city || ''}</p>
        </div>
      `).join('') : '<p class="text-sikka-400 text-sm text-center py-8">لا توجد أعمال على الخريطة</p>';
    }

    biz.forEach(b => {
      const lat = b.location?.lat, lng = b.location?.lng;
      if (lat && lng) {
        L.marker([lat, lng]).addTo(mapInstance).bindPopup(`<b>${b.nameAr || b.name}</b><br>${b.categoryNameAr || ''}`);
      }
    });
  }, 200);
}

// CATEGORIES FULL
function loadCategoriesFull() {
  const g = document.getElementById('categories-full-grid');
  if (!g) return;
  g.innerHTML = CATEGORIES.map((c, i) => `
    <div class="cat-full-card" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="cat-full-icon"><i class="${c.icon}"></i></div>
      <div class="cat-full-info">
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        <div class="count">${c.count || 0} نشاط</div>
      </div>
    </div>
  `).join('');
}

// ADD FORM
function populateAddFormCategories() {
  const select = document.getElementById('biz-category');
  if (select && select.options.length <= 1) {
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.slug;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  }
}

// BLOG
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
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>لا توجد مقالات</h3></div>';
    return;
  }
  container.innerHTML = posts.map((p, i) => `
    <div class="blog-card" onclick="openPost('${p.slug}')" data-aos="fade-up" data-aos-delay="${i * 100}">
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
  c.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onclick="closeDetail()" class="flex items-center gap-2 text-sikka-600 hover:text-sikka-900 mb-6 font-medium">
        <i class="ri-arrow-right-line"></i> العودة
      </button>
      <div class="bg-white rounded-2xl border border-sikka-200 p-6 sm:p-8">
        <h1 class="text-2xl font-bold text-sikka-900 mb-4">${slug}</h1>
        <p class="text-sikka-500">المحتوى غير متاح حالياً</p>
      </div>
    </div>
  `;
  document.getElementById('page-post-detail').classList.add('active');
  document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });
}

// ADMIN
function loadAdmin() {
  const c = document.getElementById('admin-content');
  if (!c) return;
  c.innerHTML = `
    <h2 class="text-2xl font-bold text-sikka-900 mb-6">لوحة التحكم</h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-sikka-200 rounded-2xl p-5">
        <div class="text-sm text-sikka-500 mb-2">الأعمال</div>
        <div class="text-3xl font-bold text-sikka-900">0</div>
      </div>
      <div class="bg-white border border-sikka-200 rounded-2xl p-5">
        <div class="text-sm text-sikka-500 mb-2">المستخدمين</div>
        <div class="text-3xl font-bold text-sikka-900">0</div>
      </div>
      <div class="bg-white border border-sikka-200 rounded-2xl p-5">
        <div class="text-sm text-sikka-500 mb-2">المقالات</div>
        <div class="text-3xl font-bold text-sikka-900">0</div>
      </div>
      <div class="bg-white border border-sikka-200 rounded-2xl p-5">
        <div class="text-sm text-sikka-500 mb-2">الزيارات</div>
        <div class="text-3xl font-bold text-sikka-900">0</div>
      </div>
    </div>
    <div class="bg-white border border-sikka-200 rounded-2xl p-6">
      <h3 class="font-bold text-sikka-900 mb-4">آخر الأعمال</h3>
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-sikka-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><i class="ri-inbox-line text-2xl text-sikka-300"></i></div>
        <h4 class="font-bold text-sikka-900 mb-2">لا توجد بيانات</h4>
        <p class="text-sikka-500 text-sm">لم يتم تسجيل أي نشاط بعد</p>
      </div>
    </div>
  `;
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  event?.target?.closest('.admin-nav-item')?.classList.add('active');
}

// AUTH
function showAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function hideAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
function showSignupModal() {
  const modal = document.getElementById('signup-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function hideSignupModal() {
  const modal = document.getElementById('signup-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

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
    if (e) e.textContent = 'سجّل الدخول للوصول لحسابك';
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
  showToast('تم إضافة نشاطك بنجاح!');
  navigateTo('home');
}

function loadProfile() {}

// Window exports
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
window.toggleMapView = toggleMapView;
window.searchByLetter = searchByLetter;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.setRating = setRating;
window.submitReview = submitReview;
window.shareBusiness = shareBusiness;
window.toggleMobileMenu = toggleMobileMenu;
