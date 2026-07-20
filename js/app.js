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
  { id:'b1', name:'ستاربكس مصر', nameAr:'ستاربكس مصر', nameEn:'Starbucks Egypt', categoryNameAr:'المقاهي', location:{ city:'القاهرة', district:'مدينة نصر', address:'شارع مصطفى النحاس' }, contact:{ phone:'0222738476', whatsapp:'201065000001', email:'info@starbucks.eg' }, description:'مقهى ستاربكس بيقدم أحسن أنواع القهوة المختصة والمشروبات الباردة والساخنة في أجواء مريحة.', keywords:['قهوة','مقهى','كابتشينو','لاتيه'], brands:['Starbucks'], workingHours:{ saturday:'7:00 ص - 1:00 م', friday:'2:00 م - 1:00 م' }, rating:{ average:4.5, count:120 }, status:'approved', isVerified:true, ownerId:'demo', views:350, photos:[], offers:[], products:[
    { id:'p1', name:'لاتيه', desc:'لاتيه بالحليب والمحلبات', price:'45', image:'', category:'قهوة' },
    { id:'p2', name:'كابتشينو', desc:'كابتشينو كلاسيكي', price:'42', image:'', category:'قهوة' },
    { id:'p3', name:'موكا شوكولاتة', desc:'موكا بالشوكولاتة السوداء', price:'50', image:'', category:'مشروبات' },
    { id:'p4', name:'آيس كوفي', desc:'قهوة باردة بالثلج', price:'40', image:'', category:'مشروبات' },
  ], createdAt:'2025-01-15' },
  { id:'b2', name:'كنتاكي', nameAr:'كنتاكي', nameEn:'KFC Egypt', categoryNameAr:'المطاعم', location:{ city:'القاهرة', district:'التجمع الخامس', address:'مول العرب' }, contact:{ phone:'0226140050', whatsapp:'201065000002' }, description:'مطعم كنتاكي بيقدم أشهى الدجاج المقلي والوجبات السريعة بأسعار مناسبة.', keywords:['دجاج','مطعم','وجبات سريعة','فرايز'], brands:['KFC'], workingHours:{ saturday:'11:00 ص - 2:00 م', friday:'1:00 م - 2:00 م' }, rating:{ average:4.2, count:85 }, status:'approved', isVerified:true, ownerId:'demo', views:220, photos:[], offers:[], products:[
    { id:'p5', name:'وجبة دجاج مقلي', desc:'4 قطع دجاج مع فرايز', price:'120', image:'', category:'وجبات' },
    { id:'p6', name:'ساندويتش زنجر', desc:'ساندويتش دجاج مقلي مع صلصة', price:'65', image:'', category:'ساندويتشات' },
    { id:'p7', name:'ساندويتش توستيكر', desc:'دجاج مشوي في توست', price:'70', image:'', category:'ساندويتشات' },
  ], createdAt:'2025-02-10' },
  { id:'b3', name:'البنك الأهلي المصري', nameAr:'البنك الأهلي المصري', nameEn:'National Bank of Egypt', categoryNameAr:'البنوك', location:{ city:'القاهرة', district:'وسط البلد', address:'شارع محمد محمود' }, contact:{ phone:'19623' }, description:'البنك الأهلي المصري أكبر بنك في مصر بيفتحلك حسابات وقروض وخدمات مالية متنوعة.', keywords:['بنك','حساب','قروض','خدمات مالية'], brands:['NBE'], workingHours:{ saturday:'8:30 ص - 2:30 م', friday:'مغلق' }, rating:{ average:4.0, count:200 }, status:'approved', isVerified:true, ownerId:'demo', views:500, photos:[], offers:[], products:[
    { id:'p8', name:'حساب توفير', desc:'حساب توفير بشروط مميزة', price:'', image:'', category:'حسابات' },
    { id:'p9', name:'قروض شخصية', desc:'قروض بفوائد تنافسية', price:'', image:'', category:'قروض' },
    { id:'p10', name:'كرت ائتمان', desc:'كرت ائتمان بمزايا كتير', price:'', image:'', category:'بطاقات' },
  ], createdAt:'2025-01-20' },
  { id:'b4', name:'بلازا مصر', nameAr:'بلازا مصر', nameEn:'Plaza Egypt', categoryNameAr:'التجزئة', location:{ city:'الإسكندرية', district:'سيدي جابر', address:'شارع فوزي معاذ' }, contact:{ phone:'0334456789', email:'info@plaza.eg' }, description:'متجر بلازا للأزياء العصرية والماركات العالمية.', keywords:['تسوق','ملابس','أزياء','ماركات'], brands:['Plaza'], rating:{ average:4.3, count:65 }, status:'approved', isVerified:true, ownerId:'demo', views:180, photos:[], offers:[], products:[
    { id:'p11', name:'تيشيرت قطن', desc:'تيشيرت قطن 100% ألوان متعددة', price:'299', image:'', category:'رجالي' },
    { id:'p12', name:'جينز كلاسيك', desc:'جينز ساقي مستقيم', price:'450', image:'', category:'رجالي' },
    { id:'p13', name:'فستان صيفي', desc:'فستان خفيف للصيف', price:'399', image:'', category:'حريمي' },
  ], createdAt:'2025-03-01' },
  { id:'b5', name:'مستشفى دار الفؤاد', nameAr:'مستشفى دار الفؤاد', nameEn:'Dar Al Fouad Hospital', categoryNameAr:'الصحة', location:{ city:'القاهرة', district:'السادس من أكتوبر', address:'شارع المحور' }, contact:{ phone:'0228100010' }, description:'مستشفى دار الفؤاد من أحسن المستشفيات في مصر في التخصصات المختلفة.', keywords:['مستشفى','عيادة','طب','صحة'], rating:{ average:4.8, count:500 }, status:'approved', isVerified:true, ownerId:'demo', views:800, photos:[], offers:[], products:[
    { id:'p14', name:'فحص شامل', desc:'كشف كامل مع تحاليل', price:'1500', image:'', category:'خدمات' },
    { id:'p15', name:'استشارة قلب', desc:'استشارة أخصائي قلب', price:'500', image:'', category:'استشارات' },
  ], createdAt:'2025-01-10' },
  { id:'b6', name:'جامعة القاهرة', nameAr:'جامعة القاهرة', nameEn:'Cairo University', categoryNameAr:'التعليم', location:{ city:'القاهرة', district:'الجيزة', address:'شارع صلاح سالم' }, contact:{ phone:'0227954000' }, description:'جامعة القاهرة هي أكبر وأقدم جامعات مصر والشرق الأوسط.', keywords:['جامعة','تعليم','دراسة','طلبة'], rating:{ average:4.5, count:300 }, status:'approved', isVerified:true, ownerId:'demo', views:600, photos:[], offers:[], products:[], createdAt:'2025-01-05' },
  { id:'b7', name:'فاليو للخدمات', nameAr:'فاليو', nameEn:'Fawry', categoryNameAr:'الخدمات', location:{ city:'القاهرة', district:'المعادي', address:'شارع 9' }, contact:{ phone:'19666', email:'info@fawry.com' }, description:'فاليو أكبر منصة خدمات مالية إلكترونية في مصر.', keywords:['دفع','فواتير','خدمات','مالية'], brands:['Fawry'], rating:{ average:4.7, count:400 }, status:'approved', isVerified:true, ownerId:'demo', views:900, photos:[], offers:[], products:[
    { id:'p16', name:'دفع فواتير', desc:'دفع فواتير الكهرباء والميه والغاز', price:'', image:'', category:'خدمات' },
    { id:'p17', name:'شحن رصيد', desc:'شحن رصيد أي موبايل', price:'', image:'', category:'خدمات' },
  ], createdAt:'2025-02-20' },
  { id:'b8', name:'المتحف المصري', nameAr:'المتحف المصري', nameEn:'Egyptian Museum', categoryNameAr:'السفر والسياحة', location:{ city:'القاهرة', district:'التحرير', address:'ميدان التحرير' }, contact:{ phone:'0225782452' }, description:'المتحف المصري أكبر متحف في الشرق الأوسط فيه آلاف القطع الأثرية.', keywords:['متحف','سياحة','تراث','ثقافة','أثر'], rating:{ average:4.6, count:150 }, status:'approved', isVerified:true, ownerId:'demo', views:400, photos:[], offers:[], products:[
    { id:'p18', name:'تذكرة دخول', desc:'تذكرة دخول للمتحف', price:'200', image:'', category:'تذاكر' },
    { id:'p19', name:'جولة مع مرشد', desc:'جولة مع مرشد سياحي', price:'500', image:'', category:'جولات' },
  ], createdAt:'2025-03-10' },
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

const CATEGORY_STYLES = {
  'المقاهي':     { bg: 'linear-gradient(135deg,#78350f,#92400e)', icon: 'ri-cup-line', emoji: '☕' },
  'المطاعم':     { bg: 'linear-gradient(135deg,#dc2626,#b91c1c)', icon: 'ri-restaurant-line', emoji: '🍕' },
  'البنوك':      { bg: 'linear-gradient(135deg,#1e40af,#1d4ed8)', icon: 'ri-bank-line', emoji: '🏦' },
  'التجزئة':     { bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', icon: 'ri-shopping-cart-2-line', emoji: '🛒' },
  'الاتصالات':   { bg: 'linear-gradient(135deg,#0891b2,#0e7490)', icon: 'ri-smartphone-line', emoji: '📱' },
  'الصحة':       { bg: 'linear-gradient(135deg,#dc2626,#e11d48)', icon: 'ri-heart-pulse-line', emoji: '🏥' },
  'التعليم':     { bg: 'linear-gradient(135deg,#2563eb,#1d4ed8)', icon: 'ri-book-open-line', emoji: '🎓' },
  'الخدمات':     { bg: 'linear-gradient(135deg,#475569,#334155)', icon: 'ri-tools-line', emoji: '🔧' },
  'العقارات':    { bg: 'linear-gradient(135deg,#059669,#047857)', icon: 'ri-home-4-line', emoji: '🏠' },
  'السيارات':    { bg: 'linear-gradient(135deg,#475569,#1e293b)', icon: 'ri-car-line', emoji: '🚗' },
  'السفر والسياحة': { bg: 'linear-gradient(135deg,#0284c7,#0369a1)', icon: 'ri-plane-line', emoji: '✈️' },
  'الأزياء':     { bg: 'linear-gradient(135deg,#c026d3,#a21caf)', icon: 'ri-t-shirt-line', emoji: '👗' },
  'الجمال':      { bg: 'linear-gradient(135deg,#db2777,#be185d)', icon: 'ri-palette-line', emoji: '💄' },
  'الرياضة':     { bg: 'linear-gradient(135deg,#16a34a,#15803d)', icon: 'ri-basketball-line', emoji: '⚽' },
  'التكنولوجيا': { bg: 'linear-gradient(135deg,#4f46e5,#4338ca)', icon: 'ri-computer-line', emoji: '💻' },
  'القانونية':   { bg: 'linear-gradient(135deg,#92400e,#78350f)', icon: 'ri-scales-3-line', emoji: '⚖️' },
};
const DEFAULT_STYLE = { bg: 'linear-gradient(135deg,#64748b,#475569)', icon: 'ri-building-2-line', emoji: '🏢' };

function getCategoryStyle(cat) { return CATEGORY_STYLES[cat] || DEFAULT_STYLE; }

const ARABIC_LETTERS = ['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];

const GOVERNORATES = {
  'القاهرة': ['مدينة نصر','المعادي','التجمع الخامس','مصر الجديدة','وسط البلد','شبرا','حلوان','عين شمس','المرج','الزيتون','السلام','دار السلام','ال Sayeda Zeinab','البساتين','التبين'],
  'الجيزة': ['الهرم','الفيصل','الدقي','المهندسين','العجوزة','الزمالك','أكتوبر','السادس من أكتوبر','الواحة','كرداسة','أبو النمرس','ال观音','العℛين','البدرشين'],
  'الإسكندرية': ['سيدي جابر','ميامي','سموحة','المنشية','الرمل','كركدان','باكوس','كفر عبده','العصافرة','برج العرب','الدخيلة','محرم بك'],
  'القليوبية': ['بنها','القليوبية','شبرا الخيمة','طوخ','قليوب','العبور','الشرق'],
  'المنوفية': ['شبين الكوم','منوف','سرس الليان','الباجور','أشمون','تلا','بركة السبع'],
  'الغربية': ['طنطا','المحلة الكبرى','كفر الزيات','زفتى','سمنود','قطور','بسيون'],
  'الدقهلية': ['المنصورة','طلخا','ميت غمر','دكرنس','السنبلاوين','أجا','منية النصر','شربين'],
  'الفيوم': ['الفيوم','سانت مريم','إطسا','سنورس','طامية','الفيوم الجديدة'],
  'بني سويف': ['بني سويف','الواسطى','ناصر','إهناسيا','ببا','سمسطرا'],
  'المنيا': ['المنيا','ملوي','أبوقرقاص','سمالوط','العدوة','مغاغة'],
  'أسيوط': ['أسيوط','البداري','الغنايم','ديروط','منفلوط','أبو تيج','صدفا'],
  'سوهاج': ['سوهاج','طهطا','جراجة','البلينا','العريش','المراغة','الساحل'],
  'قنا': ['قنا','قوص','نجع حمادي','الأقصر','الوقف','دشنا','ال colour'],
  'الأقصر': ['الأقصر','الزينية','البع淋','ال colour','الفرنا','إسنا','طيبة الجديدة'],
  'أسوان': ['أسوان','دراو','كوم أمبو','نصر النوبة','إدفو','البللدي'],
  'البحر الأحمر': ['الغردقة','مرسى علم','الجونة','السخنة','الدهب','شرم الشيخ'],
  'الإسماعيلية': ['الإسماعيلية','التل الكبير','الewis','أبو صوير','القنطرة شرق','القنطرة غرب'],
  'السويس': ['السويس','عتاقا','الجناين'],
  'بورسعيد': ['بورسعيد','العرب'],
  'دمياط': ['دمياط','دمياط الجديدة','الروضة','الزرقا','فارسكور','كفر سعد'],
  'كفر الشيخ': ['كفر الشيخ','دسوق','بيلا','الحامول','سيدي سالم','قلين','الرياض'],
  'شمال سيناء': ['العريش','رفح','بئر العبد','الشيخ زويد','ن��ل'],
  'جنوب سيناء': ['طور سيناء','شرم الشيخ','دهب','كينج','أبو رديس',' saint katrin'],
  'مطروح': ['مرسى مطروح','الحمام','العلمين','سيدي براني','النجيلة','سيوة'],
  'الوادي الجديد': ['الخارجة','الداخلة','الفرافرة','بلاط'],
};

const CITIES = Object.keys(GOVERNORATES);

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
    if (!b) saveData();

    // Migrate old businesses
    let migrated = false;
    businesses.forEach(biz => {
      if (biz.views === undefined) { biz.views = 0; migrated = true; }
      if (!biz.photos) { biz.photos = []; migrated = true; }
      if (!biz.offers) { biz.offers = []; migrated = true; }
      if (!biz.products) { biz.products = []; migrated = true; }
      if (!biz.ownerId && biz.userId) { biz.ownerId = biz.userId; migrated = true; }
    });

    // Force reset if data has Saudi cities (old data)
    if (businesses.length && businesses[0].location?.city === 'الرياض') {
      businesses = [...DEFAULT_BUSINESSES];
      migrated = true;
    }

    // Ensure admin account exists
    if (!users.find(u => u.email === 'admin@sikka.com')) {
      users.push({
        id: 'admin_001',
        name: 'مدير سِكّة',
        email: 'admin@sikka.com',
        password: 'admin123',
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
      migrated = true;
    }
    if (migrated) saveData();
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
let isNavigating = false;

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Sikka starting...');
  loadData();
  loadHome();
  renderAlphaGrid();
  document.getElementById('search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
  updateAuthUI();
  handleHash();
});

window.addEventListener('popstate', () => {
  if (!isNavigating) handleHash();
});

// Scroll to top
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scroll-top-btn');
  if (btn) {
    if (window.scrollY > 400) { btn.classList.add('visible'); } else { btn.classList.remove('visible'); }
  }
});

// Prevent ALL href="#" from changing hash
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href="#"]');
  if (a) e.preventDefault();
});

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) el.classList.add('active');
  document.getElementById('mobile-menu')?.classList.add('hidden');
}

function updateNavActive(page) {
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-menu-item').forEach(n => n.classList.remove('active'));
  const navLink = document.querySelector(`[data-nav="${page}"]`);
  if (navLink) navLink.classList.add('active');
  const mobileNav = document.querySelector(`.mobile-nav-item[data-page="${page}"]`);
  if (mobileNav) mobileNav.classList.add('active');
}

function handleHash() {
  const hash = location.hash || '#/home';

  if (hash.startsWith('#/business/')) {
    const id = hash.replace('#/business/', '');
    const b = businesses.find(biz => biz.id === id);
    if (b) {
      showPage('business');
      renderBusinessDetail(b);
    } else {
      show404();
    }
    return;
  }

  const pageMap = {
    '#/home': 'home', '#/': 'home',
    '#/businesses': 'businesses',
    '#/categories': 'categories',
    '#/blog': 'blog',
    '#/add': 'add',
    '#/profile': 'profile',
    '#/dashboard': 'dashboard',
    '#/favorites': 'favorites',
    '#/admin': 'admin',
    '#/about': 'about',
    '#/contact': 'contact',
    '#/terms': 'terms',
  };

  const page = pageMap[hash];
  if (!page) { show404(); return; }

  showPage(page);
  updateNavActive(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') loadHome();
  if (page === 'businesses') loadAllBusinesses();
  if (page === 'blog') loadBlog();
  if (page === 'admin') loadAdmin();
  if (page === 'profile') loadProfile();
  if (page === 'categories') loadCategoriesFull();
  if (page === 'add') renderAddForm();
  if (page === 'dashboard') loadDashboard();
  if (page === 'favorites') loadFavorites();
}

function show404() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  let el = document.getElementById('page-404');
  if (!el) {
    el = document.createElement('div');
    el.id = 'page-404';
    el.className = 'page active';
    el.innerHTML = `
      <div class="max-w-md mx-auto px-4 py-20 text-center">
        <div style="font-size:6rem;margin-bottom:1rem">🔍</div>
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-xl font-bold text-gray-700 mb-2">الصفحة مش موجودة</h2>
        <p class="text-gray-500 mb-8">يبدو إن الرابط ده غلط أو اتنقل</p>
        <a href="#" onclick="navigateTo('home')" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all">
          <i class="ri-home-5-line"></i> ارجع للرئيسية
        </a>
      </div>
    `;
    document.body.appendChild(el);
  } else {
    el.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
  const hashMap = { home:'#/home', businesses:'#/businesses', categories:'#/categories', blog:'#/blog', add:'#/add', profile:'#/profile', dashboard:'#/dashboard', favorites:'#/favorites', admin:'#/admin', about:'#/about', contact:'#/contact', terms:'#/terms' };
  const newHash = hashMap[page] || '#/home';
  if (location.hash === newHash) {
    handleHash();
    return;
  }
  isNavigating = true;
  history.pushState({ page }, '', newHash);
  handleHash();
  setTimeout(() => { isNavigating = false; }, 50);
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
  populateGovSelect('signup-gov', 'signup-center');
}
function hideSignupModal() { document.getElementById('signup-modal').style.display = 'none'; }

function populateGovSelect(govId, centerId) {
  const govSelect = document.getElementById(govId);
  const centerSelect = document.getElementById(centerId);
  if (!govSelect) return;
  govSelect.innerHTML = '<option value="">اختار المحافظة</option>' + Object.keys(GOVERNORATES).map(g => `<option value="${g}">${g}</option>`).join('');
  if (centerSelect) {
    centerSelect.innerHTML = '<option value="">اختار المركز</option>';
    centerSelect.disabled = true;
    govSelect.addEventListener('change', () => {
      const gov = govSelect.value;
      if (gov && GOVERNORATES[gov]) {
        centerSelect.innerHTML = '<option value="">اختار المركز</option>' + GOVERNORATES[gov].map(c => `<option value="${c}">${c}</option>`).join('');
        centerSelect.disabled = false;
      } else {
        centerSelect.innerHTML = '<option value="">اختار المركز</option>';
        centerSelect.disabled = true;
      }
    });
  }
}

function updateAuthUI() {
  const btns = document.getElementById('header-auth-btns');
  const name = document.getElementById('profile-name');
  const email = document.getElementById('profile-email');
  const authBtns = document.getElementById('auth-buttons');
  const menu = document.getElementById('profile-menu');
  const adminLink = document.getElementById('admin-nav-link');

  if (currentUser) {
    const myBiz = businesses.find(b => b.ownerId === currentUser.id);
    if (btns) btns.innerHTML = `
      <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" onclick="navigateTo('profile')"><i class="ri-user-3-line"></i><span class="hidden sm:inline">${currentUser.name}</span></button>
      ${myBiz ? `<button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all" onclick="navigateTo('dashboard')"><i class="ri-dashboard-line"></i><span class="hidden sm:inline">لوحتي</span></button>` : ''}
    `;
    if (name) name.textContent = currentUser.name;
    if (email) email.textContent = currentUser.email;
    const locEl = document.getElementById('profile-location');
    const locText = document.getElementById('profile-location-text');
    if (locEl && locText) {
      if (currentUser.governorate) {
        locText.textContent = currentUser.governorate + (currentUser.center ? ' - ' + currentUser.center : '');
        locEl.classList.remove('hidden');
      } else {
        locEl.classList.add('hidden');
      }
    }
    if (authBtns) authBtns.style.display = 'none';
    if (menu) menu.style.display = 'block';
    if (adminLink) adminLink.style.display = currentUser.isAdmin ? 'flex' : 'none';
  } else {
    if (btns) btns.innerHTML = `<button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" onclick="showAuthModal()"><i class="ri-login-box-line"></i> دخول</button>`;
    if (name) name.textContent = 'ضيف';
    if (email) email.textContent = 'ادخل عشان توصل حسابك';
    if (authBtns) authBtns.style.display = 'block';
    if (menu) menu.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

function loginWithEmail() {
  const emailEl = document.getElementById('email-input');
  const passEl = document.getElementById('password-input');
  const errEl = document.getElementById('auth-error');

  console.log('📧 Email element:', emailEl);
  console.log('🔑 Pass element:', passEl);

  const email = emailEl ? emailEl.value.trim() : '';
  const pass = passEl ? passEl.value : '';

  console.log('📧 Email value:', email);
  console.log('🔑 Pass value:', pass ? '***' : 'EMPTY');

  if (!email || !pass) {
    console.log('❌ Missing fields');
    if (errEl) {
      errEl.textContent = 'ابدأ كل الخانات';
      errEl.classList.remove('hidden');
    }
    return;
  }

  const user = users.find(u => u.email === email && u.password === pass);
  if (!user) {
    console.log('❌ User not found');
    if (errEl) {
      errEl.textContent = 'الإيميل أو كلمة السر غلط - سجّل حساب جديد الأول';
      errEl.classList.remove('hidden');
    }
    return;
  }

  console.log('✅ Login success:', user.name);
  currentUser = user;
  localStorage.setItem('sikka_current_user', JSON.stringify(user));
  hideAuthModal();
  updateAuthUI();
  showToast('أهلاً بيك ' + user.name + '!');
}

function signupWithEmail() {
  const name = document.getElementById('signup-name')?.value;
  const email = document.getElementById('signup-email')?.value;
  const pass = document.getElementById('signup-password')?.value;
  const errEl = document.getElementById('signup-error');

  if (!name || !email || !pass) { errEl.textContent = 'ابدأ كل الخانات'; errEl.classList.remove('hidden'); return; }
  if (pass.length < 4) { errEl.textContent = 'كلمة السر لازم تكون 4 حروف على الأقل'; errEl.classList.remove('hidden'); return; }
  if (users.find(u => u.email === email)) { errEl.textContent = 'الإيميل ده متسجل قبل كده'; errEl.classList.remove('hidden'); return; }

  const user = {
    id: 'user_' + Date.now(),
    name: name,
    email: email,
    password: pass,
    isAdmin: email === 'admin@sikka.com',
    governorate: document.getElementById('signup-gov')?.value || '',
    center: document.getElementById('signup-center')?.value || '',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  currentUser = user;
  localStorage.setItem('sikka_current_user', JSON.stringify(user));
  saveData();
  hideSignupModal();
  updateAuthUI();
  showToast('تم عمل الحساب بنجاح!');
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
  showToast('أهلاً بيك!');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('sikka_current_user');
  updateAuthUI();
  showToast('اتعمل خروج');
  navigateTo('home');
}

// ==================== SEARCH ====================
function switchSearchTab(btn, type) {
  searchType = type;
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const placeholders = { name:'دور بالاسم...', keyword:'دور بالكلمة...', category:'اكتب اسم الفئة...', brand:'دور بالبراند...' };
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
  animateCounter('stat-users', users.length);
  const totalReviews = Object.values(reviews).flat().length + approved.reduce((s, b) => s + (b.rating?.count || 0), 0);
  animateCounter('stat-reviews', totalReviews);
  const cities = [...new Set(approved.map(b => b.location?.city).filter(Boolean))];
  animateCounter('stat-cities', cities.length || CITIES.length);
  renderNearby(approved);
}

function renderCategories(cats) {
  const g = document.getElementById('categories-grid');
  if (!g) return;
  const approved = businesses.filter(b => b.status === 'approved');
  g.innerHTML = cats.slice(0, 8).map((c, i) => {
    const style = getCategoryStyle(c.name);
    const count = approved.filter(b => b.categoryNameAr === c.name).length;
    return `
    <div class="bg-white border border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300" style="background:${style.bg}">
        <span style="font-size:1.5rem;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2))">${style.emoji}</span>
      </div>
      <div class="text-sm font-bold mb-1">${c.name}</div>
      <div class="text-xs text-gray-400">${count} شغل</div>
    </div>
  `}).join('');
}

function renderBusinesses(list) {
  const g = document.getElementById('businesses-grid');
  if (!g) return;
  if (!list.length) {
    g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>مفيش أعمال لسه</h3><p>كون أول واحد يسجّل شغله</p></div>';
    return;
  }
  g.innerHTML = list.map((b, i) => renderBusinessCard(b, i)).join('');
}

function renderBusinessCard(b, i = 0) {
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const reviewList = reviews[b.id] || [];
  const totalReviews = reviewCount + reviewList.length;
  const style = getCategoryStyle(b.categoryNameAr);
  const initial = (b.nameAr || b.name || '')[0] || '🏢';

  return `
    <div class="biz-card group" onclick="openBusiness('${b.id}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="biz-card-img" style="background:${style.bg}">
        <div style="font-size:2.5rem;opacity:0.9;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2))">${style.emoji}</div>
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

function renderNearby(approved) {
  const section = document.getElementById('nearby-section');
  const grid = document.getElementById('nearby-grid');
  if (!section || !grid) return;

  const userGov = currentUser?.governorate;
  const userCenter = currentUser?.center;

  let nearby = [];
  if (userGov) {
    nearby = approved.filter(b => b.location?.city === userGov);
    if (userCenter && nearby.length < 4) {
      const more = approved.filter(b => b.location?.district === userCenter && !nearby.find(n => n.id === b.id));
      nearby = [...nearby, ...more];
    }
    nearby.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    nearby = nearby.slice(0, 8);
  }

  if (nearby.length) {
    section.style.display = 'block';
    grid.innerHTML = nearby.map((b, i) => renderBusinessCard(b, i)).join('');
  } else if (userGov) {
    section.style.display = 'block';
    grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-400"><i class="ri-map-pin-line text-3xl mb-2 block"></i><p>مفيش أعمال مسجلة في ' + userGov + ' لسه</p></div>';
  } else {
    section.style.display = 'none';
  }
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
  if (citySelect) citySelect.innerHTML = '<option value="">كل المحافظات</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
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
  if (!list.length) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>مفيش نتائج</h3><p>جرّب تغيير الفلتر أو كلمات البحث</p></div>'; return; }
  const countHtml = `<div class="col-span-full mb-2 text-sm text-gray-500">${list.length} نتيجة</div>`;
  container.innerHTML = countHtml + list.map((b, i) => renderBusinessCard(b, i)).join('');
}

// ==================== BUSINESS DETAIL ====================
function openBusiness(id) {
  const b = businesses.find(biz => biz.id === id);
  if (!b) { showToast('الشغل مش موجود', 'error'); return; }
  b.views = (b.views || 0) + 1;
  saveData();
  isNavigating = true;
  history.pushState({ page: 'business', id }, '', '#/business/' + id);
  showPage('business');
  renderBusinessDetail(b);
  updateNavActive('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => { isNavigating = false; }, 50);
}

function renderBusinessDetail(b) {
  const c = document.getElementById('business-detail');
  if (!c) return;
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const bizReviews = reviews[b.id] || [];
  const totalReviews = reviewCount + bizReviews.length;
  const isFav = currentUser && (JSON.parse(localStorage.getItem('sikka_favorites') || '[]')).includes(b.id);
  const isOpen = checkIfOpen(b.workingHours);

  const hours = b.workingHours || {};
  const hoursHtml = hours.saturday ? `
    <div class="detail-section">
      <h3><i class="ri-time-line text-amber-500"></i> مواعيد الشغل</h3>
      ${Object.entries(hours).filter(([_, v]) => v).map(([day, time]) => `<div class="hours-row"><span>${getDayName(day)}</span><span>${time}</span></div>`).join('')}
    </div>
  ` : '';

  const keywordsHtml = b.keywords?.length ? `<div class="detail-section"><h3><i class="ri-hashtag text-blue-500"></i> الكلمات المفتاحية</h3><div class="keywords-list">${b.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}</div></div>` : '';
  const brandsHtml = b.brands?.length ? `<div class="detail-section"><h3><i class="ri-bookmark-line text-purple-500"></i> البراندات</h3><div class="keywords-list">${b.brands.map(b => `<span class="keyword-tag">${b}</span>`).join('')}</div></div>` : '';

  const products = b.products || [];
  const productsHtml = products.length ? `
    <div class="detail-section">
      <h3><i class="ri-shopping-bag-line text-emerald-500"></i> المنتجات والخدمات (${products.length})</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${products.map(p => `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
            <div class="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='📦'">` : '<span class="text-xl">📦</span>'}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm truncate">${p.name}</div>
              ${p.desc ? `<div class="text-xs text-gray-500 truncate">${p.desc}</div>` : ''}
              ${p.category ? `<div class="text-xs text-blue-500">${p.category}</div>` : ''}
            </div>
            <div class="flex-shrink-0">
              ${p.price ? `<span class="font-bold text-green-600 text-sm">${p.price} ج</span>` : '<span class="text-xs text-gray-400">اتصال</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const offers = b.offers || [];
  const offersHtml = offers.length ? `
    <div class="detail-section">
      <h3><i class="ri-megaphone-line text-orange-500"></i> العروض (${offers.length})</h3>
      <div class="space-y-3">${offers.map(o => `
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-orange-600 font-bold text-sm">${o.title}</span>
            ${o.code ? `<span class="bg-white border border-orange-300 px-2 py-0.5 rounded text-xs font-mono text-orange-700">${o.code}</span>` : ''}
          </div>
          ${o.description ? `<p class="text-gray-600 text-xs">${o.description}</p>` : ''}
          ${o.endDate ? `<p class="text-gray-400 text-xs mt-1"><i class="ri-calendar-line"></i> بينتهي: ${o.endDate}</p>` : ''}
        </div>
      `).join('')}</div>
    </div>
  ` : '';

  const photos = b.photos || [];
  const photosHtml = photos.length ? `
    <div class="detail-section">
      <h3><i class="ri-image-line text-green-500"></i> الصور (${photos.length})</h3>
      <div class="grid grid-cols-3 gap-2">${photos.map(p => `
        <div class="rounded-xl overflow-hidden bg-gray-100 aspect-square">
          <img src="${p}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-gray-400\\'><i class=\\'ri-image-line text-2xl\\'></i></div>'">
        </div>
      `).join('')}</div>
    </div>
  ` : '';

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
    reviewsHtml = '<p class="text-gray-500 text-sm text-center py-4">مفيش تقييمات لسه. كون أول واحد يقيّم!</p>';
  }

  const style = getCategoryStyle(b.categoryNameAr);

  c.innerHTML = `
    <div class="detail-hero" style="background:${style.bg}">
      ${b.location?.lat && b.location?.lng ? `<div id="detail-map" style="width:100%;height:100%"></div>` : `<div style="font-size:4rem;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.2))">${style.emoji}</div>`}
      <button class="back-btn" onclick="closeDetail()"><i class="ri-arrow-right-line"></i></button>
      <button class="back-btn" style="right:auto;left:16px;background:${isFav ? '#ef4444' : 'white'};color:${isFav ? 'white' : '#64748b'}" onclick="toggleFavorite('${b.id}',this)"><i class="ri-heart-${isFav ? 'fill' : 'line'}"></i></button>
    </div>
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-logo" style="background:${style.bg};border-color:transparent">
          <span style="font-size:1.8rem">${style.emoji}</span>
        </div>
        <div class="flex-1">
          <h1 class="detail-name">${b.nameAr || b.name}</h1>
          <div class="detail-category">${b.categoryNameAr || ''}</div>
          <div class="detail-stats">
            <div class="detail-stat"><i class="ri-star-fill"></i> ${rating.toFixed(1)} (${totalReviews} تقييم)</div>
            ${b.location?.city ? `<div class="detail-stat"><i class="ri-map-pin-2-line"></i> ${b.location.city}${b.location.district ? ' - ' + b.location.district : ''}</div>` : ''}
            ${b.views ? `<div class="detail-stat"><i class="ri-eye-line"></i> ${b.views} مشاهدة</div>` : ''}
            <div class="detail-stat"><span class="inline-block w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}"></span> ${isOpen ? 'مفتوح دلوقتي' : 'مقفول'}</div>
          </div>
        </div>
      </div>
      <div class="detail-actions">
        ${b.contact?.phone ? `<a href="tel:${b.contact.phone}" class="action-btn call"><i class="ri-phone-line"></i> اتصل</a>` : ''}
        ${b.contact?.whatsapp ? `<a href="https://wa.me/${b.contact.whatsapp}" target="_blank" class="action-btn whatsapp"><i class="ri-whatsapp-line"></i> واتساب</a>` : ''}
        ${b.contact?.email ? `<a href="mailto:${b.contact.email}" class="action-btn email"><i class="ri-mail-line"></i> إيميل</a>` : ''}
        ${b.location?.lat && b.location?.lng ? `<a href="https://www.google.com/maps?q=${b.location.lat},${b.location.lng}" target="_blank" class="action-btn map"><i class="ri-map-pin-line"></i> الخريطة</a>` : ''}
        <button class="action-btn share" onclick="shareBusiness('${b.id}')"><i class="ri-share-line"></i> مشاركة</button>
        <button class="action-btn review" onclick="openReviewModal('${b.id}')"><i class="ri-star-line"></i> تقييم</button>
      </div>
      ${b.description ? `<div class="detail-section"><h3><i class="ri-information-line text-gray-500"></i> عن الشغل</h3><p>${b.description}</p></div>` : ''}
      ${b.location?.address ? `<div class="detail-section"><h3><i class="ri-map-pin-line text-red-500"></i> العنوان</h3><p>${b.location.address}${b.location.district ? ', ' + b.location.district : ''}${b.location.city ? ', ' + b.location.city : ''}</p></div>` : ''}
      ${productsHtml}${offersHtml}${photosHtml}${hoursHtml}${keywordsHtml}${brandsHtml}
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
  navigateTo('home');
}

function shareBusiness(id) {
  const url = location.origin + location.pathname + '#/business/' + id;
  if (navigator.share) {
    navigator.share({ url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('اتنسخ الرابط', 'success'));
  }
}

function checkIfOpen(hours) {
  if (!hours || !hours.saturday) return false;
  const now = new Date();
  const dayIndex = now.getDay();
  const dayMap = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const todayKey = dayMap[dayIndex];
  const todayHours = hours[todayKey] || hours.saturday || '';
  if (!todayHours || todayHours === 'مغلق') return false;
  const match = todayHours.match(/(\d{1,2}):(\d{2})\s*(ص|م)\s*-\s*(\d{1,2}):(\d{2})\s*(ص|م)/);
  if (!match) return true;
  let [_, sh, sm, sap, eh, em, eap] = match;
  sh = parseInt(sh); sm = parseInt(sm); eh = parseInt(eh); em = parseInt(em);
  if (sap === 'م' && sh !== 12) sh += 12;
  if (sap === 'ص' && sh === 12) sh = 0;
  if (eap === 'م' && eh !== 12) eh += 12;
  if (eap === 'ص' && eh === 12) eh = 0;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em;
}

function toggleFavorite(id, btn) {
  if (!currentUser) { showAuthModal(); return; }
  let favs = JSON.parse(localStorage.getItem('sikka_favorites') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    showToast('اتحذف من المفضلة');
  } else {
    favs.push(id);
    showToast('اتضاف للمفضلة');
  }
  localStorage.setItem('sikka_favorites', JSON.stringify(favs));
  if (btn) {
    const isFav = favs.includes(id);
    btn.style.background = isFav ? '#ef4444' : 'white';
    btn.style.color = isFav ? 'white' : '#64748b';
    btn.innerHTML = `<i class="ri-heart-${isFav ? 'fill' : 'line'}"></i>`;
  }
}

// ==================== CUSTOMER DASHBOARD ====================
let dashTab = 'overview';

function loadDashboard() {
  if (!currentUser) { navigateTo('home'); showAuthModal(); return; }
  const myBiz = businesses.find(b => b.ownerId === currentUser.id);
  if (!myBiz) {
    document.getElementById('dashboard-content').innerHTML = `
      <div class="max-w-md mx-auto text-center py-20">
        <div style="font-size:4rem;margin-bottom:1rem">🏪</div>
        <h2 class="text-xl font-bold mb-2">م عندك شغل متسجل</h2>
        <p class="text-gray-500 mb-6">سجّل شغلك عشان يظهر في الدليل ويظهر لك لوحة التحكم</p>
        <button onclick="navigateTo('add')" class="px-6 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all">
          <i class="ri-add-line ml-1"></i> سجّل شغلك دلوقتي
        </button>
      </div>`;
    return;
  }
  showDashTab('overview');
}

function showDashTab(tab) {
  dashTab = tab;
  const myBiz = businesses.find(b => b.ownerId === currentUser?.id);
  if (!myBiz) { loadDashboard(); return; }

  document.querySelectorAll('#page-dashboard .admin-nav-item').forEach(n => n.classList.remove('active'));
  event?.target?.closest?.('.admin-nav-item')?.classList.add('active');
  if (!event?.target?.closest?.('.admin-nav-item')) {
    document.querySelectorAll('#page-dashboard .admin-nav-item').forEach(n => {
      if (n.textContent.includes(tab === 'overview' ? 'نظرة' : tab === 'edit' ? 'تعديل' : tab === 'products' ? 'المنتجات' : tab === 'photos' ? 'صور' : tab === 'reviews' ? 'تقييمات' : tab === 'offers' ? 'عروض' : 'إعدادات')) n.classList.add('active');
    });
  }

  const c = document.getElementById('dashboard-content');
  if (!c) return;

  if (tab === 'overview') renderDashOverview(c, myBiz);
  else if (tab === 'edit') renderDashEdit(c, myBiz);
  else if (tab === 'products') renderDashProducts(c, myBiz);
  else if (tab === 'photos') renderDashPhotos(c, myBiz);
  else if (tab === 'reviews') renderDashReviews(c, myBiz);
  else if (tab === 'offers') renderDashOffers(c, myBiz);
  else if (tab === 'settings') renderDashSettings(c, myBiz);
}

function renderDashOverview(c, b) {
  const style = getCategoryStyle(b.categoryNameAr);
  const bizReviews = reviews[b.id] || [];
  const rating = b.rating?.average || 0;
  const totalReviews = (b.rating?.count || 0) + bizReviews.length;
  const views = b.views || 0;
  const offers = b.offers || [];

  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">نظرة عامة على شغلك</h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <div class="text-sm text-gray-500 mb-1">التقييم</div>
        <div class="text-3xl font-bold flex items-center gap-1"><i class="ri-star-fill text-amber-400"></i> ${rating.toFixed(1)}</div>
        <div class="text-xs text-gray-400">${totalReviews} تقييم</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <div class="text-sm text-gray-500 mb-1">المشاهدات</div>
        <div class="text-3xl font-bold">${views}</div>
        <div class="text-xs text-gray-400">مرة</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <div class="text-sm text-gray-500 mb-1">الحالة</div>
        <div class="text-lg font-bold ${b.status === 'approved' ? 'text-green-600' : b.status === 'pending' ? 'text-amber-600' : 'text-red-600'}">${b.status === 'approved' ? 'معتمد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <div class="text-sm text-gray-500 mb-1">العروض النشطة</div>
        <div class="text-3xl font-bold">${offers.length}</div>
      </div>
    </div>
    <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center" style="background:${style.bg}">
          <span style="font-size:2rem">${style.emoji}</span>
        </div>
        <div>
          <h3 class="font-bold text-lg">${b.nameAr || b.name}</h3>
          <div class="text-sm text-blue-600 font-medium">${b.categoryNameAr || ''}</div>
          <div class="text-xs text-gray-400">${b.location?.city || ''} ${b.location?.district ? '- ' + b.location.district : ''}</div>
        </div>
      </div>
      <p class="text-gray-500 text-sm">${b.description || 'م اتضاف وصف لسه'}</p>
    </div>
    <div class="flex gap-3">
      <button onclick="showDashTab('edit')" class="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"><i class="ri-edit-line ml-1"></i> تعديل الشغل</button>
      <a href="#/business/${b.id}" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all text-sm"><i class="ri-eye-line ml-1"></i> شوف الصفحة</a>
    </div>
  `;
}

function renderDashEdit(c, b) {
  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">تعديل الشغل</h2>
    <div class="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label class="form-label">اسم الشغل بالعربي</label><input class="form-input" id="de-nameAr" value="${b.nameAr || ''}"></div>
        <div><label class="form-label">اسم الشغل بالإنجليزي</label><input class="form-input" id="de-nameEn" value="${b.nameEn || ''}"></div>
      </div>
      <div><label class="form-label">الوصف</label><textarea class="form-input" id="de-desc" rows="3">${b.description || ''}</textarea></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label class="form-label">المدينة</label><input class="form-input" id="de-city" value="${b.location?.city || ''}"></div>
        <div><label class="form-label">الحي</label><input class="form-input" id="de-district" value="${b.location?.district || ''}"></div>
      </div>
      <div><label class="form-label">العنوان بالتفصيل</label><input class="form-input" id="de-address" value="${b.location?.address || ''}"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label class="form-label">رقم التليفون</label><input class="form-input" id="de-phone" value="${b.contact?.phone || ''}"></div>
        <div><label class="form-label">واتساب</label><input class="form-input" id="de-whatsapp" value="${b.contact?.whatsapp || ''}"></div>
      </div>
      <div><label class="form-label">الإيميل</label><input class="form-input" id="de-email" value="${b.contact?.email || ''}"></div>
      <div><label class="form-label">الكلمات المفتاحية (افصل بفاصلة)</label><input class="form-input" id="de-keywords" value="${(b.keywords || []).join(', ')}"></div>
      <div><label class="form-label">البراندات (افصل بفاصلة)</label><input class="form-input" id="de-brands" value="${(b.brands || []).join(', ')}"></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="form-label">مواعيد الشغل (السبت)</label><input class="form-input" id="de-sat" value="${b.workingHours?.saturday || ''}"></div>
        <div><label class="form-label">مواعيد الشغل (الأحد)</label><input class="form-input" id="de-sun" value="${b.workingHours?.sunday || ''}"></div>
        <div><label class="form-label">مواعيد الشغل (الاثنين)</label><input class="form-input" id="de-mon" value="${b.workingHours?.monday || ''}"></div>
        <div><label class="form-label">مواعيد الشغل (الثلاثاء)</label><input class="form-input" id="de-tue" value="${b.workingHours?.tuesday || ''}"></div>
        <div><label class="form-label">مواعيد الشغل (الأربعاء)</label><input class="form-input" id="de-wed" value="${b.workingHours?.wednesday || ''}"></div>
        <div><label class="form-label">مواعيد الشغل (الخميس)</label><input class="form-input" id="de-thu" value="${b.workingHours?.thursday || ''}"></div>
        <div><label class="form-label">مواعيد الشغل (الجمعة)</label><input class="form-input" id="de-fri" value="${b.workingHours?.friday || ''}"></div>
      </div>
      <button onclick="saveDashEdit('${b.id}')" class="px-6 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all"><i class="ri-save-line ml-1"></i> حفظ التعديلات</button>
    </div>
  `;
}

function saveDashEdit(id) {
  const b = businesses.find(biz => biz.id === id);
  if (!b) return;
  b.nameAr = document.getElementById('de-nameAr').value;
  b.nameEn = document.getElementById('de-nameEn').value;
  b.description = document.getElementById('de-desc').value;
  b.location = b.location || {};
  b.location.city = document.getElementById('de-city').value;
  b.location.district = document.getElementById('de-district').value;
  b.location.address = document.getElementById('de-address').value;
  b.contact = b.contact || {};
  b.contact.phone = document.getElementById('de-phone').value;
  b.contact.whatsapp = document.getElementById('de-whatsapp').value;
  b.contact.email = document.getElementById('de-email').value;
  b.keywords = document.getElementById('de-keywords').value.split(',').map(s => s.trim()).filter(Boolean);
  b.brands = document.getElementById('de-brands').value.split(',').map(s => s.trim()).filter(Boolean);
  b.workingHours = {
    saturday: document.getElementById('de-sat').value,
    sunday: document.getElementById('de-sun').value,
    monday: document.getElementById('de-mon').value,
    tuesday: document.getElementById('de-tue').value,
    wednesday: document.getElementById('de-wed').value,
    thursday: document.getElementById('de-thu').value,
    friday: document.getElementById('de-fri').value,
  };
  saveData();
  showToast('تم حفظ التعديلات بنجاح', 'success');
}

// ==================== PRODUCTS ====================
function renderDashProducts(c, b) {
  const products = b.products || [];
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  c.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">المنتجات والخدمات</h2>
      <span class="text-sm text-gray-500">${products.length} منتج</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <h3 class="font-bold mb-4"><i class="ri-add-circle-line text-green-500 ml-1"></i> إضافة منتج جديد</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label class="form-label">اسم المنتج *</label><input class="form-input" id="prod-name" placeholder="مثال: لاتيه"></div>
        <div><label class="form-label">السعر (جنيه)</label><input class="form-input" id="prod-price" placeholder="45"></div>
        <div><label class="form-label">التصنيف</label><input class="form-input" id="prod-category" placeholder="مثال: قهوة، وجبات، خدمات"></div>
        <div><label class="form-label">رابط الصورة</label><input class="form-input" id="prod-image" placeholder="https://..."></div>
        <div class="sm:col-span-2"><label class="form-label">الوصف</label><input class="form-input" id="prod-desc" placeholder="وصف المنتج"></div>
      </div>
      <button onclick="addBizProduct('${b.id}')" class="mt-4 px-6 py-2.5 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"><i class="ri-add-line ml-1"></i> إضافة المنتج</button>
    </div>
    ${cats.length ? `
    <div class="flex flex-wrap gap-2 mb-4">
      <button class="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg" onclick="filterDashProducts('${b.id}','')">الكل (${products.length})</button>
      ${cats.map(cat => `<button class="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" onclick="filterDashProducts('${b.id}','${cat}')">${cat} (${products.filter(p => p.category === cat).length})</button>`).join('')}
    </div>
    ` : ''}
    <div id="dash-products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${products.length ? products.map((p, i) => renderProductCard(p, i, b.id, true)).join('') : `
        <div class="col-span-full text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <div class="text-5xl mb-4">📦</div>
          <h3 class="font-bold text-gray-700 mb-2">مفيش منتجات لسه</h3>
          <p class="text-gray-500 text-sm">أضف منتجاتك أو خدماتك عشان الزباين يعرفوا يشوفوا الأسعار والتفاصيل</p>
        </div>
      `}
    </div>
  `;
}

function renderProductCard(p, i, bizId, editable = false) {
  return `
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group" data-aos="fade-up" data-aos-delay="${i * 30}">
      <div class="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="w-full h-full items-center justify-center text-4xl" style="display:none">📦</div>` : '<span class="text-4xl">📦</span>'}
        ${p.category ? `<span class="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">${p.category}</span>` : ''}
      </div>
      <div class="p-4">
        <h4 class="font-bold text-sm mb-1">${p.name}</h4>
        ${p.desc ? `<p class="text-gray-500 text-xs mb-2 line-clamp-2">${p.desc}</p>` : ''}
        <div class="flex items-center justify-between">
          ${p.price ? `<span class="text-lg font-bold text-green-600">${p.price} <span class="text-xs font-normal">جنيه</span></span>` : '<span class="text-sm text-gray-400">السعر عند الاتصال</span>'}
          ${editable ? `<button onclick="removeBizProduct('${bizId}','${p.id}')" class="w-8 h-8 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"><i class="ri-delete-bin-line text-sm"></i></button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function addBizProduct(id) {
  const name = document.getElementById('prod-name')?.value?.trim();
  if (!name) { showToast('اكتب اسم المنتج', 'error'); return; }
  const b = businesses.find(biz => biz.id === id);
  if (!b) return;
  if (!b.products) b.products = [];
  b.products.push({
    id: 'prod_' + Date.now(),
    name: name,
    desc: document.getElementById('prod-desc')?.value?.trim() || '',
    price: document.getElementById('prod-price')?.value?.trim() || '',
    image: document.getElementById('prod-image')?.value?.trim() || '',
    category: document.getElementById('prod-category')?.value?.trim() || '',
  });
  saveData();
  showToast('اتضاف المنتج بنجاح', 'success');
  renderDashProducts(document.getElementById('dashboard-content'), b);
}

function removeBizProduct(bizId, prodId) {
  const b = businesses.find(biz => biz.id === bizId);
  if (!b || !b.products) return;
  b.products = b.products.filter(p => p.id !== prodId);
  saveData();
  showToast('اتحذف المنتج', 'success');
  renderDashProducts(document.getElementById('dashboard-content'), b);
}

function filterDashProducts(bizId, cat) {
  const b = businesses.find(biz => biz.id === bizId);
  if (!b) return;
  const products = cat ? (b.products || []).filter(p => p.category === cat) : (b.products || []);
  const grid = document.getElementById('dash-products-grid');
  if (grid) {
    grid.innerHTML = products.length ? products.map((p, i) => renderProductCard(p, i, bizId, true)).join('') : '<div class="col-span-full text-center py-8 text-gray-400">مفيش منتجات في التصنيف ده</div>';
  }
}

function renderDashPhotos(c, b) {
  const photos = b.photos || [];
  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">إدارة الصور</h2>
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <p class="text-gray-500 text-sm mb-4">أضف صور لشغلك عشان يظهر للزباين</p>
      <div class="mb-4">
        <label class="form-label">رابط الصورة</label>
        <div class="flex gap-2">
          <input class="form-input flex-1" id="photo-url-input" placeholder="https://example.com/photo.jpg">
          <button onclick="addBizPhoto('${b.id}')" class="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap"><i class="ri-add-line"></i> إضافة</button>
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="photos-grid">
        ${photos.length ? photos.map((p, i) => `
          <div class="relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
            <img src="${p}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-gray-400\\'><i class=\\'ri-image-line text-3xl\\'></i></div>'">
            <button onclick="removeBizPhoto('${b.id}',${i})" class="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center text-xs hover:bg-red-600"><i class="ri-close-line"></i></button>
          </div>
        `).join('') : '<div class="col-span-full text-center py-8 text-gray-400"><i class="ri-image-line text-3xl"></i><p class="mt-2 text-sm">مفيش صور لسه</p></div>'}
      </div>
    </div>
  `;
}

function addBizPhoto(id) {
  const url = document.getElementById('photo-url-input')?.value?.trim();
  if (!url) { showToast('اكتب رابط الصورة', 'error'); return; }
  const b = businesses.find(biz => biz.id === id);
  if (!b) return;
  if (!b.photos) b.photos = [];
  b.photos.push(url);
  saveData();
  showToast('اتضافت الصورة', 'success');
  renderDashPhotos(document.getElementById('dashboard-content'), b);
}

function removeBizPhoto(id, idx) {
  const b = businesses.find(biz => biz.id === id);
  if (!b || !b.photos) return;
  b.photos.splice(idx, 1);
  saveData();
  showToast('اتحذفت الصورة', 'success');
  renderDashPhotos(document.getElementById('dashboard-content'), b);
}

function renderDashReviews(c, b) {
  const bizReviews = reviews[b.id] || [];
  const avg = b.rating?.average || 0;
  const count = (b.rating?.count || 0) + bizReviews.length;
  const stars = [0,0,0,0,0];
  bizReviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) stars[r.rating - 1]++; });

  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">التقييمات والمراجعات</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white border border-gray-200 rounded-2xl p-5 text-center">
        <div class="text-4xl font-bold mb-1">${avg.toFixed(1)}</div>
        <div class="flex justify-center gap-1 mb-1">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < Math.round(avg) ? 'fill text-amber-400' : 'line text-gray-300'}"></i>`).join('')}</div>
        <div class="text-xs text-gray-400">${count} تقييم</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5">
        <div class="text-sm font-bold mb-3">توزيع التقييمات</div>
        ${[5,4,3,2,1].map(s => `<div class="flex items-center gap-2 mb-1"><span class="text-xs w-4">${s}</span><i class="ri-star-fill text-amber-400 text-xs"></i><div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-amber-400 rounded-full" style="width:${count ? (stars[s-1]/count*100) : 0}%"></div></div><span class="text-xs text-gray-400 w-6">${stars[s-1]}</span></div>`).join('')}
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-5 text-center">
        <div class="text-4xl font-bold mb-1">${bizReviews.length}</div>
        <div class="text-sm text-gray-500">مراجعة مكتوبة</div>
      </div>
    </div>
    <div class="space-y-1">
      ${bizReviews.length ? bizReviews.map(r => `
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">${r.userName[0]}</div>
            <div><div class="font-bold text-sm">${r.userName}</div><div class="text-xs text-gray-400">${r.date}</div></div>
            <div class="mr-auto flex gap-0.5">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < r.rating ? 'fill text-amber-400' : 'line text-gray-300'}"></i>`).join('')}</div>
          </div>
          ${r.title ? `<div class="font-bold text-sm mb-1">${r.title}</div>` : ''}
          ${r.comment ? `<div class="text-gray-500 text-sm">${r.comment}</div>` : ''}
        </div>
      `).join('') : '<div class="text-center py-10 text-gray-400"><i class="ri-star-line text-3xl"></i><p class="mt-2">مفيش تقييمات لسه</p></div>'}
    </div>
  `;
}

function renderDashOffers(c, b) {
  const offers = b.offers || [];
  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">العروض والتسويق</h2>
    <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <h3 class="font-bold mb-3">أضف عرض جديد</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="form-label">عنوان العرض</label><input class="form-input" id="offer-title" placeholder="خصم 20% على كل القهوة"></div>
          <div><label class="form-label">تاريخ الانتهاء</label><input type="date" class="form-input" id="offer-date"></div>
        </div>
        <div><label class="form-label">وصف العرض</label><textarea class="form-input" id="offer-desc" rows="2" placeholder="تفاصيل العرض..."></textarea></div>
        <div><label class="form-label">كود الخصم (اختياري)</label><input class="form-input" id="offer-code" placeholder="SIKKA20"></div>
        <button onclick="addBizOffer('${b.id}')" class="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"><i class="ri-add-line ml-1"></i> نشر العرض</button>
      </div>
    </div>
    <div class="space-y-3">
      ${offers.length ? offers.map((o, i) => `
        <div class="bg-white border border-gray-200 rounded-2xl p-5">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0"><i class="ri-megaphone-line text-amber-500 text-xl"></i></div>
            <div class="flex-1">
              <h4 class="font-bold">${o.title}</h4>
              <p class="text-gray-500 text-sm mt-1">${o.description || ''}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                ${o.endDate ? `<span><i class="ri-calendar-line"></i> ينتهي: ${o.endDate}</span>` : ''}
                ${o.code ? `<span class="bg-gray-100 px-2 py-0.5 rounded font-mono">${o.code}</span>` : ''}
              </div>
            </div>
            <button onclick="removeBizOffer('${b.id}',${i})" class="text-red-400 hover:text-red-600 text-sm"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
      `).join('') : '<div class="text-center py-10 text-gray-400"><i class="ri-megaphone-line text-3xl"></i><p class="mt-2">مفيش عروض لسه</p></div>'}
    </div>
  `;
}

function addBizOffer(id) {
  const title = document.getElementById('offer-title')?.value?.trim();
  const desc = document.getElementById('offer-desc')?.value?.trim();
  const date = document.getElementById('offer-date')?.value;
  const code = document.getElementById('offer-code')?.value?.trim();
  if (!title) { showToast('اكتب عنوان العرض', 'error'); return; }
  const b = businesses.find(biz => biz.id === id);
  if (!b) return;
  if (!b.offers) b.offers = [];
  b.offers.push({ title, description: desc, endDate: date, code, createdAt: new Date().toISOString() });
  saveData();
  showToast('اتنشر العرض', 'success');
  renderDashOffers(document.getElementById('dashboard-content'), b);
}

function removeBizOffer(id, idx) {
  const b = businesses.find(biz => biz.id === id);
  if (!b || !b.offers) return;
  b.offers.splice(idx, 1);
  saveData();
  showToast('اتحذف العرض', 'success');
  renderDashOffers(document.getElementById('dashboard-content'), b);
}

function renderDashSettings(c, b) {
  c.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">إعدادات الحساب</h2>
    <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <h3 class="font-bold mb-3">معلومات الحساب</h3>
      <div class="space-y-3">
        <div><label class="form-label">الاسم</label><input class="form-input" id="set-name" value="${currentUser.name}"></div>
        <div><label class="form-label">البريد الإلكتروني</label><input class="form-input" id="set-email" value="${currentUser.email}" disabled></div>
        <div><label class="form-label">المحافظة</label><select class="form-input" id="set-gov"><option value="">اختار المحافظة</option></select></div>
        <div><label class="form-label">المركز/الحي</label><select class="form-input" id="set-center"><option value="">اختار المركز</option></select></div>
        <button onclick="saveDashSettings()" class="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"><i class="ri-save-line ml-1"></i> حفظ</button>
      </div>
    </div>
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 class="font-bold mb-3">حذف الحساب</h3>
      <p class="text-gray-500 text-sm mb-4">حذف الحساب يعني حذف جميع بياناتك نهائياً</p>
      <button onclick="deleteDashAccount('${b.id}')" class="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-all text-sm"><i class="ri-delete-bin-line ml-1"></i> حذف الحساب والشغل</button>
    </div>
  `;
  populateGovSelect('set-gov', 'set-center');
  const govSelect = document.getElementById('set-gov');
  if (govSelect && currentUser.governorate) {
    govSelect.value = currentUser.governorate;
    govSelect.dispatchEvent(new Event('change'));
    setTimeout(() => {
      const centerSelect = document.getElementById('set-center');
      if (centerSelect && currentUser.center) centerSelect.value = currentUser.center;
    }, 50);
  }
}

function saveDashSettings() {
  const name = document.getElementById('set-name')?.value?.trim();
  if (!name) { showToast('اكتب الاسم', 'error'); return; }
  currentUser.name = name;
  currentUser.governorate = document.getElementById('set-gov')?.value || '';
  currentUser.center = document.getElementById('set-center')?.value || '';
  localStorage.setItem('sikka_current_user', JSON.stringify(currentUser));
  const u = users.find(u => u.id === currentUser.id);
  if (u) { u.name = name; u.governorate = currentUser.governorate; u.center = currentUser.center; }
  saveData();
  updateAuthUI();
  showToast('اتحفظت المعلومات', 'success');
}

function deleteDashAccount(bizId) {
  if (!confirm('متأكد إنك عايز تمسح حسابك وشغلك؟')) return;
  businesses = businesses.filter(b => b.id !== bizId);
  users = users.filter(u => u.id !== currentUser.id);
  reviews[bizId] = undefined;
  delete reviews[bizId];
  saveData();
  logout();
  showToast('اتمسح بنجاح', 'success');
}

// ==================== REVIEWS ====================
function openReviewModal(bizId) {
  if (!currentUser) { showAuthModal(); showToast('لازم تسجل دخول', 'info'); return; }
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
  if (!currentRating) { showToast('اختار تقييم', 'error'); return; }
  const title = document.getElementById('review-title')?.value;
  const text = document.getElementById('review-text')?.value;

  if (!reviews[currentReviewBizId]) reviews[currentReviewBizId] = [];
  reviews[currentReviewBizId].push({
    userId: currentUser.id,
    userName: currentUser.name,
    rating: currentRating,
    title: title || '',
    comment: text || '',
    date: new Date().toLocaleDateString('ar-EG')
  });

  // Update average
  const b = businesses.find(biz => biz.id === currentReviewBizId);
  if (b) {
    const allRatings = reviews[currentReviewBizId].map(r => r.rating);
    const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    b.rating = { average: avg, count: allRatings.length };
  }

  saveData();
  showToast('اتبعت التقييم!');
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
        <h3 class="text-xl font-bold mb-2">لازم تسجل دخول</h3>
        <p class="text-gray-500 mb-6">سجّل دخول أو اعمل حساب جديد عشان تضيف شغلك</p>
        <button class="px-8 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all" onclick="showAuthModal()"><i class="ri-login-box-line ml-2"></i>ادخل</button>
      </div>
    `;
    return;
  }

  c.innerHTML = `
    <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="form-label">اسم الشغل *</label><input type="text" class="form-input" id="biz-name" placeholder="اسم الشغل بالعربي"></div>
        <div><label class="form-label">الفئة *</label><select class="form-input" id="biz-category"><option value="">اختار الفئة</option>${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}</select></div>
        <div><label class="form-label">المحافظة *</label><select class="form-input" id="biz-city"><option value="">اختار المحافظة</option>${Object.keys(GOVERNORATES).map(g => `<option value="${g}">${g}</option>`).join('')}</select></div>
        <div><label class="form-label">المركز/الحي</label><select class="form-input" id="biz-district" disabled><option value="">اختار المحافظة الأول</option></select></div>
        <div class="sm:col-span-2"><label class="form-label">العنوان بالتفصيل</label><input type="text" class="form-input" id="biz-address" placeholder="العنوان بالتفصيل"></div>
        <div><label class="form-label">التليفون *</label><input type="tel" class="form-input" id="biz-phone" placeholder="01XXXXXXXXX"></div>
        <div><label class="form-label">واتساب</label><input type="tel" class="form-input" id="biz-whatsapp" placeholder="201XXXXXXXXX"></div>
        <div><label class="form-label">الإيميل</label><input type="email" class="form-input" id="biz-email" placeholder="email@example.com"></div>
        <div class="sm:col-span-2"><label class="form-label">الوصف</label><textarea class="form-input" id="biz-description" rows="3" placeholder="وصف شغلك"></textarea></div>
        <div class="sm:col-span-2"><label class="form-label">الكلمات المفتاحية (افصل بفاصلة)</label><input type="text" class="form-input" id="biz-keywords" placeholder="مقهوة، قهوة، حبوب"></div>
        <div class="sm:col-span-2"><label class="form-label">البراندات (افصل بفاصلة)</label><input type="text" class="form-input" id="biz-brands" placeholder="Starbucks, Costa"></div>
        <div><label class="form-label">مواعيد الشغل (السبت-الخميس)</label><input type="text" class="form-input" id="biz-hours-week" placeholder="8:00 ص - 11:00 م"></div>
        <div><label class="form-label">مواعيد الشغل (الجمعة)</label><input type="text" class="form-input" id="biz-hours-fri" placeholder="1:00 م - 11:00 م"></div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="flex-1 py-3 px-6 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2" onclick="submitBusiness()"><i class="ri-send-plane-line"></i> نشر الشغل</button>
        <button class="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all" onclick="navigateTo('home')">إلغاء</button>
      </div>
    </div>
  `;
  const bizGov = document.getElementById('biz-city');
  const bizCenter = document.getElementById('biz-district');
  if (bizGov && bizCenter) {
    bizGov.addEventListener('change', () => {
      const gov = bizGov.value;
      if (gov && GOVERNORATES[gov]) {
        bizCenter.innerHTML = '<option value="">اختار المركز</option>' + GOVERNORATES[gov].map(c => `<option value="${c}">${c}</option>`).join('');
        bizCenter.disabled = false;
      } else {
        bizCenter.innerHTML = '<option value="">اختار المحافظة الأول</option>';
        bizCenter.disabled = true;
      }
    });
  }
}

function submitBusiness() {
  if (!currentUser) { showAuthModal(); return; }
  const name = document.getElementById('biz-name')?.value;
  if (!name) { showToast('اكتب اسم الشغل', 'error'); return; }

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
    ownerId: currentUser.id,
    userId: currentUser.id,
    userName: currentUser.name,
    isVerified: false,
    photos: [],
    offers: [],
    views: 0,
    createdAt: new Date().toISOString()
  };

  businesses.push(newBiz);
  saveData();
  showToast('اتضاف شغلك بنجاح!');
  navigateTo('home');
}

// ==================== CATEGORIES PAGE ====================
function loadCategoriesFull() {
  const g = document.getElementById('categories-full-grid');
  if (!g) return;
  g.innerHTML = CATEGORIES.map((c, i) => {
    const count = businesses.filter(b => b.categoryNameAr === c.name && b.status === 'approved').length;
    const style = getCategoryStyle(c.name);
    return `
      <div class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group" onclick="quickSearch('${c.name}')" data-aos="fade-up" data-aos-delay="${i * 50}">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all" style="background:${style.bg}"><span style="font-size:1.5rem">${style.emoji}</span></div>
        <div><h3 class="font-bold mb-1">${c.name}</h3><p class="text-gray-500 text-sm">${c.desc}</p><p class="text-xs text-gray-400 mt-1">${count} شغل</p></div>
      </div>
    `;
  }).join('');
}

// ==================== BLOG ====================
function loadBlog() {
  const g = document.getElementById('blog-list');
  if (!g) return;
  g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>مفيش مقالات لسه</h3><p>قريب إن شاء الله</p></div>';
}

function openPost(id) {
  const c = document.getElementById('post-detail');
  if (!c) return;
  c.innerHTML = `<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8"><button onclick="closeDetail()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"><i class="ri-arrow-right-line"></i> ارجع</button><div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8"><h1 class="text-2xl font-bold mb-4">${id}</h1><p class="text-gray-500">المحتوى مش متاح دلوقتي</p></div></div>`;
  document.getElementById('page-post-detail')?.classList.add('active');
  document.querySelectorAll('.page:not(#page-post-detail)').forEach(p => p.classList.remove('active'));
}

// ==================== PROFILE ====================
function loadProfile() {
  updateAuthUI();
}

// ==================== FAVORITES ====================
function loadFavorites() {
  const g = document.getElementById('favorites-grid');
  if (!g) return;
  if (!currentUser) {
    g.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon"><i class="ri-heart-line"></i></div><h3>سجّل دخول عشان تشوف المفضلة</h3></div>';
    return;
  }
  const favs = JSON.parse(localStorage.getItem('sikka_favorites') || '[]');
  const favBusinesses = businesses.filter(b => favs.includes(b.id));
  if (!favBusinesses.length) {
    g.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon"><i class="ri-heart-line"></i></div><h3>مفيش مفضلة لسه</h3><p>اضغط على القلب في أي صفحة نشاط عشان تحفظه هنا</p></div>';
    return;
  }
  g.innerHTML = favBusinesses.map((b, i) => renderBusinessCard(b, i)).join('');
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
      ` : '<p class="text-gray-500 text-center py-8">مفيش أعمال لسه</p>'}
    </div>
  `;
}

function approveBusiness(id, status) {
  const b = businesses.find(biz => biz.id === id);
  if (b) { b.status = status; saveData(); showToast('اتحديث الحالة'); loadAdmin(); }
}

function deleteBusiness(id) {
  if (!confirm('متأكد من الحذف؟')) return;
  businesses = businesses.filter(b => b.id !== id);
  delete reviews[id];
  saveData();
  showToast('اتحذف');
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
window.showDashTab = showDashTab;
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
window.shareBusiness = shareBusiness;
window.toggleFavorite = toggleFavorite;
window.addBizPhoto = addBizPhoto;
window.removeBizPhoto = removeBizPhoto;
window.addBizOffer = addBizOffer;
window.removeBizOffer = removeBizOffer;
window.saveDashEdit = saveDashEdit;
window.saveDashSettings = saveDashSettings;
window.deleteDashAccount = deleteDashAccount;
window.addBizProduct = addBizProduct;
window.removeBizProduct = removeBizProduct;
window.filterDashProducts = filterDashProducts;
