let currentUser = null;
let authToken = null;
let isStaticMode = false;

// Real Saudi Businesses Data
const REAL_BUSINESSES = [
  { id:'1', slug:'almarai', name:'Almarai', nameAr:'المراعي', category:'food', categoryName:'الأغذية', categoryNameAr:'الأغذية', logo:'🥛', color:'#E11D48', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966112627000', rating:{ average:4.7, count:2340 }, isVerified:true, isFeatured:true, totalViews:45000, description:'المراعي هي أكبر شركة ألبان في الشرق الأوسط، تقدم منتجات طازجة عالية الجودة منذ عام 1977', website:'https://almarai.com' },
  { id:'2', slug:'stc', name:'STC', nameAr:'الاتصالات السعودية', category:'telecom', categoryName:'الاتصالات', categoryNameAr:'الاتصالات', logo:'📱', color:'#7C3AED', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966114555555', rating:{ average:4.5, count:3120 }, isVerified:true, isFeatured:true, totalViews:67000, description:'الشركة السعودية للاتصالات هي أكبر شركة اتصالات في المملكة والشرق الأوسط', website:'https://stc.com.sa' },
  { id:'3', slug:'jarir', name:'Jarir Bookstore', nameAr:'مكتبة جرير', category:'retail', categoryName:'التجزئة', categoryNameAr:'التجزئة', logo:'📚', color:'#059669', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966112658888', rating:{ average:4.6, count:4560 }, isVerified:true, isFeatured:true, totalViews:89000, description:'مكتبة جرير هي أكبر سلسلة متاجر تجزئة في المملكة العربية السعودية', website:'https://jarir.com' },
  { id:'4', slug:'alahli', name:'AlAhli Bank', nameAr:'البنك الأهلي السعودي', category:'banking', categoryName:'البنوك', categoryNameAr:'البنوك', logo:'🏦', color:'#0369A1', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966920001000', rating:{ average:4.4, count:1890 }, isVerified:true, isFeatured:false, totalViews:34000, description:'البنك الأهلي السعودي هو أحد أكبر البنوك الخاصة في المملكة', website:'https://alahli.com' },
  { id:'5', slug:'extra', name:'Extra Stores', nameAr:'متاجر إكسترا', category:'electronics', categoryName:'الإلكترونيات', categoryNameAr:'الإلكترونيات', logo:'🖥️', color:'#DC2626', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966920005000', rating:{ average:4.3, count:2670 }, isVerified:true, isFeatured:false, totalViews:56000, description:'إكسترا هي أكبر متاجر التجزئة للإلكترونيات والأجهزة المنزلية في المملكة', website:'https://extra.com' },
  { id:'6', slug:'panda', name:'Panda Retail', nameAr:'البنده', category:'retail', categoryName:'التجزئة', categoryNameAr:'التجزئة', logo:'🛒', color:'#EA580C', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966114789000', rating:{ average:4.2, count:1560 }, isVerified:true, isFeatured:false, totalViews:28000, description:'البنده هي إحدى أكبر سلاسل متاجر التجزئة في المملكة العربية السعودية', website:'https://panda.sa' },
  { id:'7', slug:'saudia-airlines', name:'Saudia Airlines', nameAr:'الخطوط الجوية السعودية', category:'travel', categoryName:'السفر', categoryNameAr:'السفر', logo:'✈️', color:'#0891B2', location:{ city:'Jeddah', cityAr:'جدة' }, phone:'+966800116000', rating:{ average:4.1, count:5670 }, isVerified:true, isFeatured:true, totalViews:120000, description:'الخطوط الجوية السعودية هي الناقل الجوي الرسمي للمملكة العربية السعودية', website:'https://saudia.com' },
  { id:'8', slug:'mobily', name:'Mobily', nameAr:'موبايلي', category:'telecom', categoryName:'الاتصالات', categoryNameAr:'الاتصالات', logo:'📶', color:'#16A34A', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966114520000', rating:{ average:4.0, count:1230 }, isVerified:true, isFeatured:false, totalViews:23000, description:'موبايلي هي ثاني أكبر شركة اتصالات في المملكة العربية السعودية', website:'https://mobily.com.sa' },
  { id:'9', slug:'fawri', name:'Fawri', nameAr:'فوري', category:'finance', categoryName:'الخدمات المالية', categoryNameAr:'الخدمات المالية', logo:'💳', color:'#7C3AED', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966920007000', rating:{ average:4.3, count:890 }, isVerified:true, isFeatured:false, totalViews:15000, description:'فوري هي شركة خدمات مالية إلكترونية رائدة في المملكة', website:'https://fawry.com.sa' },
  { id:'10', slug:'nahdi', name:'Nahdi Medical', nameAr:'صيدلية النهدي', category:'health', categoryName:'الصحة', categoryNameAr:'الصحة', logo:'💊', color:'#059669', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966920008000', rating:{ average:4.5, count:1450 }, isVerified:true, isFeatured:true, totalViews:31000, description:'النهدي هي أكبر سلسلة صيدليات في المملكة العربية السعودية', website:'https://nahdionline.com' },
  { id:'11', slug:'kfc', name:'KFC Saudi', nameAr:'ケンタッキー', category:'restaurants', categoryName:'المطاعم', categoryNameAr:'المطاعم', logo:'🍗', color:'#DC2626', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966114567890', rating:{ average:4.4, count:3200 }, isVerified:true, isFeatured:false, totalViews:45000, description:'ケンタッキー - أشهر مطعم دجاج مقلي في العالم', website:'https://kfc.com.sa' },
  { id:'12', slug:'starbucks-sa', name:'Starbucks Saudi', nameAr:'ستاربكس السعودية', category:'coffee', categoryName:'المقاهي', categoryNameAr:'المقاهي', logo:'☕', color:'#059669', location:{ city:'Riyadh', cityAr:'الرياض' }, phone:'+966112345678', rating:{ average:4.6, count:2800 }, isVerified:true, isFeatured:true, totalViews:52000, description:'ستاربكس - أشهر مقهى قهوة في العالم، يقدم أفضل أنواع القهوة', website:'https://starbucks.sa' },
];

const REAL_CATEGORIES = [
  { slug:'coffee', name:'المقاهي', nameEn:'Coffee', emoji:'☕', color:'#059669', count:245 },
  { slug:'restaurants', name:'المطاعم', nameEn:'Restaurants', emoji:'🍽️', color:'#DC2626', count:189 },
  { slug:'banking', name:'البنوك', nameEn:'Banks', emoji:'🏦', color:'#0369A1', count:312 },
  { slug:'retail', name:'التجزئة', nameEn:'Retail', emoji:'🛒', color:'#EA580C', count:156 },
  { slug:'telecom', name:'الاتصالات', nameEn:'Telecom', emoji:'📱', color:'#7C3AED', count:98 },
  { slug:'health', name:'الصحة', nameEn:'Health', emoji:'💊', color:'#059669', count:67 },
  { slug:'electronics', name:'الإلكترونيات', nameEn:'Electronics', emoji:'🖥️', color:'#DC2626', count:45 },
  { slug:'travel', name:'السفر', nameEn:'Travel', emoji:'✈️', color:'#0891B2', count:78 },
];

const REAL_POSTS = [
  { id:'1', slug:'best-coffee-riyadh', title:'Best Coffee Shops in Riyadh', titleAr:'أفضل مقاهي القهوة في الرياض', excerptAr:'دليلك الشامل لأفضل مقاهي القهوة في الرياض', category:'دليل', categoryAr:'دليل', readTime:5, publishedAt:{ seconds:1700000000 } },
  { id:'2', slug:'start-business-ksa', title:'How to Start Business in KSA', titleAr:'كيف تبدأ نشاطاً تجارياً في السعودية', excerptAr:'خطوات عملية لتسجيل نشاطك التجاري في المملكة', category:'أعمال', categoryAr:'أعمال', readTime:8, publishedAt:{ seconds:1699000000 } },
  { id:'3', slug:'digital-marketing', title:'Digital Marketing Tips', titleAr:'نصائح التسويق الرقمي', excerptAr:'كيف تسوّق لأعمالك على الإنترنت بفعالية', category:'نصائح', categoryAr:'نصائح', readTime:4, publishedAt:{ seconds:1698000000 } },
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupSearch();
  setupMobileNav();
});

async function initApp() {
  try { await fetch('/api/health', { signal: AbortSignal.timeout(2000) }); isStaticMode = false; } catch { isStaticMode = true; }
  const token = localStorage.getItem('sikka_token');
  if (token) { authToken = token; if (!isStaticMode) await loadUserProfile(); }
  loadHomeData();
}

async function api(endpoint, options = {}) {
  if (isStaticMode) return getMockData(endpoint);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  try {
    const r = await fetch(`/api${endpoint}`, { ...options, headers });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    return d;
  } catch (e) { throw e; }
}

function getMockData(endpoint) {
  if (endpoint.includes('/categories')) return { categories: REAL_CATEGORIES };
  if (endpoint.includes('/businesses')) return { businesses: REAL_BUSINESSES };
  if (endpoint.includes('/posts')) return { posts: REAL_POSTS };
  if (endpoint.includes('/search')) {
    const q = new URLSearchParams(endpoint.split('?')[1])?.get('q') || '';
    const filtered = REAL_BUSINESSES.filter(b => b.nameAr.includes(q) || b.name.includes(q) || b.categoryNameAr.includes(q));
    return { hits: filtered.length ? filtered : REAL_BUSINESSES };
  }
  return {};
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
  const nav = document.querySelector(`[data-nav="${page}"]`);
  if (nav) nav.classList.add('active');
  const mob = document.querySelector(`.mobile-nav-item[data-page="${page}"]`);
  if (mob) mob.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'home') loadHomeData();
  if (page === 'blog') loadPosts();
  if (page === 'businesses') renderAllBusinesses();
  if (page === 'admin') renderAdmin();
  if (page === 'profile') loadProfile();
}

function setupSearch() {
  const input = document.getElementById('search-input');
  input?.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
}

async function performSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { loadHomeData(); return; }
  try {
    const d = await api(`/search/businesses?q=${encodeURIComponent(q)}`);
    renderBusinesses(d.hits || d.businesses || []);
  } catch (e) { console.error(e); }
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

async function loadHomeData() {
  try {
    const [cats, biz, posts] = await Promise.all([
      api('/categories').catch(() => ({ categories: REAL_CATEGORIES })),
      api('/businesses?limit=8').catch(() => ({ businesses: REAL_BUSINESSES })),
      api('/posts?limit=3').catch(() => ({ posts: REAL_POSTS })),
    ]);
    renderCategories(cats.categories || REAL_CATEGORIES);
    renderBusinesses(biz.businesses || REAL_BUSINESSES);
    renderPosts(posts.posts || REAL_POSTS);
  } catch (e) {
    renderCategories(REAL_CATEGORIES);
    renderBusinesses(REAL_BUSINESSES);
    renderPosts(REAL_POSTS);
  }
}

function renderCategories(cats) {
  const g = document.getElementById('categories-grid');
  if (!g) return;
  g.innerHTML = cats.map(c => `
    <div class="category-card" onclick="quickSearch('${c.name}')">
      <div class="category-icon" style="background:${c.color}15;"><span>${c.emoji}</span></div>
      <div class="category-name">${c.name}</div>
      <div class="category-count">${c.count} نشاط</div>
    </div>
  `).join('');
}

function renderBusinesses(businesses) {
  const g = document.getElementById('businesses-grid');
  if (!g) return;
  g.innerHTML = businesses.map(b => `
    <div class="business-card" onclick="openBusiness('${b.slug}')">
      <div class="business-card-img">
        <div class="business-card-logo" style="background:${b.color || '#0891B2'}15;color:${b.color || '#0891B2'};">${b.logo || '🏪'}</div>
        <div class="business-badge">
          ${b.isVerified ? '<span class="badge badge-verified">موثق</span>' : ''}
          ${b.isFeatured ? '<span class="badge badge-featured">مميز</span>' : ''}
        </div>
        <button class="business-fav" onclick="event.stopPropagation();">
          <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="business-card-body">
        <div class="business-card-name">${b.nameAr}</div>
        <div class="business-card-cat">${b.categoryNameAr}</div>
        <div class="business-card-info">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${b.location?.cityAr}</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${b.phone}</span>
        </div>
      </div>
      <div class="business-card-footer">
        <div class="business-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${b.rating?.average?.toFixed(1)} (${b.rating?.count})</div>
      </div>
    </div>
  `).join('');
}

function renderPosts(posts) {
  const g = document.getElementById('posts-grid');
  if (!g) return;
  g.innerHTML = posts.map(p => `
    <div class="blog-card" onclick="openPost('${p.slug}')">
      <div class="blog-card-img">📝</div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${p.categoryAr}</span>
        <div class="blog-card-title">${p.titleAr}</div>
        <div class="blog-card-excerpt">${p.excerptAr}</div>
        <div class="blog-card-meta">${p.readTime} دقائق قراءة • ${formatDate(p.publishedAt)}</div>
      </div>
    </div>
  `).join('');
}

function renderAllBusinesses() {
  const g = document.getElementById('all-businesses-grid');
  if (!g) return;
  renderBusinessesTo(REAL_BUSINESSES, g);
}

function renderBusinessesTo(list, container) {
  container.innerHTML = list.map(b => `
    <div class="business-card" onclick="openBusiness('${b.slug}')">
      <div class="business-card-img">
        <div class="business-card-logo" style="background:${b.color || '#0891B2'}15;color:${b.color || '#0891B2'};">${b.logo || '🏪'}</div>
        <div class="business-badge">${b.isVerified ? '<span class="badge badge-verified">موثق</span>' : ''}</div>
      </div>
      <div class="business-card-body">
        <div class="business-card-name">${b.nameAr}</div>
        <div class="business-card-cat">${b.categoryNameAr}</div>
        <div class="business-card-info"><span>${b.location?.cityAr}</span></div>
      </div>
      <div class="business-card-footer">
        <div class="business-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${b.rating?.average?.toFixed(1)}</div>
      </div>
    </div>
  `).join('');
}

function openBusiness(slug) {
  const biz = REAL_BUSINESSES.find(b => b.slug === slug);
  if (!biz) { showToast('النشاط غير موجود', 'error'); return; }
  const c = document.getElementById('business-detail');
  c.innerHTML = `
    <div class="detail-hero">
      <div style="font-size:6rem;">${biz.logo}</div>
      <button class="back-btn" onclick="closeDetail()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
    </div>
    <div class="detail-content">
      <h1 class="detail-name">${biz.nameAr}</h1>
      <div class="detail-category">${biz.categoryNameAr}</div>
      <div class="detail-stats">
        <span class="detail-stat"><svg viewBox="0 0 24 24" fill="var(--warning)" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${biz.rating?.average} (${biz.rating?.count} تقييم)</span>
        <span class="detail-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>${biz.totalViews?.toLocaleString()} مشاهدة</span>
        <span class="detail-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${biz.location?.cityAr}</span>
      </div>
      <div class="detail-section"><h3>عن النشاط</h3><p>${biz.description}</p></div>
      <div class="detail-actions">
        <a href="tel:${biz.phone}" class="btn btn-call btn-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> اتصل الآن</a>
        <a href="https://wa.me/${biz.phone?.replace(/[^0-9]/g,'')}" class="btn btn-whatsapp btn-lg" target="_blank">واتساب</a>
        ${biz.website ? `<a href="${biz.website}" class="btn btn-map btn-lg" target="_blank">الموقع</a>` : ''}
      </div>
      <div class="detail-section"><h3>ساعات العمل</h3>
        <div class="hours-row"><span>السبت - الخميس</span><span>8:00 ص - 11:00 م</span></div>
        <div class="hours-row"><span>الجمعة</span><span>1:00 م - 11:00 م</span></div>
      </div>
      <div class="detail-section"><h3>التقييمات</h3>
        <div class="review-card"><div class="review-header"><div class="review-avatar">أ</div><div><div class="review-name">أحمد محمد</div><div class="review-date">منذ 3 أيام</div></div></div><div class="review-stars"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><div class="review-text">خدمة ممتازة ومنتجات عالية الجودة. أنصح بالتعامل معهم بشدة!</div></div>
        <div class="review-card"><div class="review-header"><div class="review-avatar">س</div><div><div class="review-name">سارة العلي</div><div class="review-date">منذ أسبوع</div></div></div><div class="review-stars"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><div class="review-text">تجربة رائعة، الموظفون ودودون والمنتجات ممتازة.</div></div>
      </div>
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

async function loadPosts() {
  const g = document.getElementById('blog-list');
  if (!g) return;
  renderPostsTo(REAL_POSTS, g);
}

function renderPostsTo(posts, container) {
  container.innerHTML = posts.map(p => `
    <div class="blog-card" onclick="openPost('${p.slug}')">
      <div class="blog-card-img">📝</div>
      <div class="blog-card-body">
        <span class="blog-card-cat">${p.categoryAr}</span>
        <div class="blog-card-title">${p.titleAr}</div>
        <div class="blog-card-excerpt">${p.excerptAr}</div>
        <div class="blog-card-meta">${p.readTime} دقائق • ${formatDate(p.publishedAt)}</div>
      </div>
    </div>
  `).join('');
}

function openPost(slug) {
  const post = REAL_POSTS.find(p => p.slug === slug);
  if (!post) return;
  const c = document.getElementById('post-detail');
  c.innerHTML = `
    <div style="max-width:700px;margin:0 auto;padding:40px 32px;">
      <button onclick="closeDetail()" style="display:flex;align-items:center;gap:6px;color:var(--primary);margin-bottom:24px;font-size:0.9rem;">← العودة</button>
      <h1 style="font-size:1.6rem;font-weight:700;margin-bottom:12px;">${post.titleAr}</h1>
      <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:28px;">${post.readTime} دقائق قراءة • ${formatDate(post.publishedAt)}</div>
      <div style="color:var(--text-secondary);line-height:2;font-size:1rem;">
        <p>${post.excerptAr}</p>
        <p style="margin-top:16px;">هذا المقال يحتوي على معلومات مفيدة حول ${post.titleAr}. ننصحك بقراءته للحصول على أفضل النتائج.</p>
      </div>
    </div>
  `;
  document.getElementById('page-post-detail').classList.add('active');
  document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
  window.scrollTo({ top: 0 });
}

// Admin
function renderAdmin() {
  const c = document.getElementById('admin-content');
  if (!c) return;
  c.innerHTML = `
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:24px;">لوحة التحكم</h2>
    <div class="admin-stats">
      <div class="admin-stat"><div class="admin-stat-label">إجمالي الأعمال</div><div class="admin-stat-value">${REAL_BUSINESSES.length}</div><div class="admin-stat-change">↑ 12% هذا الشهر</div></div>
      <div class="admin-stat"><div class="admin-stat-label">المستخدمين النشطين</div><div class="admin-stat-value">1,234</div><div class="admin-stat-change">↑ 8% هذا الشهر</div></div>
      <div class="admin-stat"><div class="admin-stat-label">الزيارات</div><div class="admin-stat-value">45K</div><div class="admin-stat-change">↑ 23% هذا الشهر</div></div>
      <div class="admin-stat"><div class="admin-stat-label">التقييمات</div><div class="admin-stat-value">892</div><div class="admin-stat-change">↑ 15% هذا الشهر</div></div>
    </div>
    <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:16px;">آخر الأعمال المسجلة</h3>
    <table class="admin-table">
      <thead><tr><th>النشاط</th><th>الفئة</th><th>المدينة</th><th>التقييم</th><th>الحالة</th><th>إجراءات</th></tr></thead>
      <tbody>
        ${REAL_BUSINESSES.map(b => `
          <tr>
            <td><strong>${b.nameAr}</strong></td>
            <td>${b.categoryNameAr}</td>
            <td>${b.location?.cityAr}</td>
            <td>⭐ ${b.rating?.average}</td>
            <td><span class="status-badge status-active">نشط</span></td>
            <td><button class="btn btn-sm btn-outline" onclick="openBusiness('${b.slug}')">عرض</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  event?.target?.closest('.admin-nav-item')?.classList.add('active');
}

// Auth
function showAuthModal() { document.getElementById('auth-modal').classList.add('active'); }
function hideAuthModal() { document.getElementById('auth-modal').classList.remove('active'); }

async function loginWithPhone() {
  if (isStaticMode) { showToast('وضع العرض', 'error'); return; }
  const phone = document.getElementById('phone-input')?.value;
  if (!phone) return showToast('أدخل رقم الجوال', 'error');
  try {
    const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();
    if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
    const conf = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    const code = prompt('أدخل رمز التحقق:');
    if (code) {
      const res = await conf.confirm(code);
      authToken = await res.user.getIdToken();
      localStorage.setItem('sikka_token', authToken);
      await api('/auth/register', { method: 'POST' });
      await loadUserProfile();
      hideAuthModal();
      showToast('مرحباً بك!');
    }
  } catch (e) { showToast('فشل تسجيل الدخول', 'error'); }
}

async function loginWithGoogle() {
  if (isStaticMode) { showToast('وضع العرض', 'error'); return; }
  try {
    const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const res = await signInWithPopup(getAuth(), new GoogleAuthProvider());
    authToken = await res.user.getIdToken();
    localStorage.setItem('sikka_token', authToken);
    await api('/auth/register', { method: 'POST' });
    await loadUserProfile();
    hideAuthModal();
    showToast('مرحباً بك!');
  } catch (e) { showToast('فشل تسجيل الدخول', 'error'); }
}

async function loadUserProfile() {
  try { const d = await api('/auth/profile'); currentUser = d.user; updateProfileUI(); } catch { currentUser = null; }
}

function updateProfileUI() {
  const n = document.getElementById('profile-name');
  const e = document.getElementById('profile-email');
  const a = document.getElementById('auth-buttons');
  const m = document.getElementById('profile-menu');
  if (currentUser) {
    if (n) n.textContent = currentUser.displayName || 'مستخدم';
    if (e) e.textContent = currentUser.email || currentUser.phoneNumber || '';
    if (a) a.style.display = 'none';
    if (m) m.style.display = 'block';
  } else {
    if (n) n.textContent = 'ضيف';
    if (e) e.textContent = 'سجّل الدخول للوصول لملفك الشخصي';
    if (a) a.style.display = 'block';
    if (m) m.style.display = 'none';
  }
}

function logout() { authToken = null; currentUser = null; localStorage.removeItem('sikka_token'); updateProfileUI(); showToast('تم تسجيل الخروج'); navigateTo('home'); }

function submitBusiness() {
  if (isStaticMode) { showToast('وضع العرض - الإضافة غير متاحة', 'error'); return; }
  if (!currentUser) { showAuthModal(); return; }
  const name = document.getElementById('biz-name')?.value;
  if (!name) return showToast('أدخل اسم النشاط', 'error');
  showToast('تم إضافة نشاطك بنجاح!');
  navigateTo('home');
}

function loadProfile() { if (isStaticMode) return; }

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' });
}

window.navigateTo = navigateTo;
window.openBusiness = openBusiness;
window.openPost = openPost;
window.closeDetail = closeDetail;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.loginWithPhone = loginWithPhone;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.submitBusiness = submitBusiness;
window.performSearch = performSearch;
window.quickSearch = quickSearch;
window.showAdminTab = showAdminTab;
