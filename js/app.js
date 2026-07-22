// ==================== SIKKA - Smart Business Directory ====================

// ==================== SECURITY HELPERS ====================
// HTML Sanitization to prevent XSS attacks
function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// Sanitize object fields recursively (for business data)
function sanitizeObj(obj, fields) {
  if (!obj) return obj;
  const result = { ...obj };
  fields.forEach(f => { if (result[f]) result[f] = sanitize(result[f]); });
  return result;
}

// ==================== FIREBASE INIT ====================
const firebaseConfig = {
  apiKey: "AIzaSyDEYpUv2SQvwiY17o9cSxQnsHWVp2yRrW0",
  authDomain: "sikka-e74f6.firebaseapp.com",
  projectId: "sikka-e74f6",
  storageBucket: "sikka-e74f6.firebasestorage.app",
  messagingSenderId: "666858367619",
  appId: "1:666858367619:web:c671bad75fa36b141049b6",
  measurementId: "G-RR31B4BCH2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

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

  // ==================== فييوم — أماكن حقيقية ====================
  { id:'fy1', name:'كافيه لافيندا', nameAr:'كافيه لافيندا', nameEn:'Lavinda Cafe', categoryNameAr:'المقاهي', location:{ city:'الفيوم', district:'الفيوم الجديدة', address:'شارع الحرفيين — الفيوم الجديدة' }, contact:{ phone:'0842315500', whatsapp:'20842315500' }, description:'كافيه لافيندا من أكتر الأماكن المفضلة في الفيوم الجديدة — بيقدم قهوة مختصة وحلويات وآيس كريم في أجواء هادية ومليانة ناس.', keywords:['قهوة','كافيه','آيس كريم','حلويات','مقهى'], workingHours:{ saturday:'9:00 ص - 1:00 م', sunday:'9:00 ص - 1:00 م', monday:'9:00 ص - 1:00 م', tuesday:'9:00 ص - 1:00 م', wednesday:'9:00 ص - 1:00 م', thursday:'9:00 ص - 1:00 م', friday:'2:00 م - 1:00 م' }, rating:{ average:4.6, count:180 }, status:'approved', isVerified:true, ownerId:'demo', views:420, photos:[], offers:[], products:[
    { id:'fp1', name:'إسبريسو', desc:'إسبريسو مزدوج', price:'25', image:'', category:'قهوة' },
    { id:'fp2', name:'كابتشينو', desc:'كابتشينو كلاسيكي بالفانيلا', price:'35', image:'', category:'قهوة' },
    { id:'fp3', name:'موكا شوكولاتة', desc:'موكا بالشوكولاتة البلجيكية', price:'40', image:'', category:'قهوة' },
    { id:'fp4', name:'آيس لاتيه', desc:'لاتيه بارد بالثلج والحليب', price:'38', image:'', category:'مشروبات باردة' },
    { id:'fp5', name:'فاهيتا دجاج', desc:'فاهيتا دجاج مع خضار مشوية وصوص', price:'85', image:'', category:'أكل' },
    { id:'fp6', name:'ساندويتش تشيكن رانش', desc:'دجاج مشوي مع صلصة رانش', price:'55', image:'', category:'ساندويتشات' },
  ], createdAt:'2025-01-05' },

  { id:'fy2', name:'مطعم الكشك', nameAr:'مطعم الكشك', nameEn:'El Koshk Restaurant', categoryNameAr:'المطاعم', location:{ city:'الفيوم', district:'الفيوم', address:'شارع سعد زغلول — وسط الفيوم' }, contact:{ phone:'0842234567', whatsapp:'20842234567' }, description:'مطعم الكشك من أقدم المطاعم في الفيوم — بيقدم أكل مصري أصيل: كشري فيومي وmolokhia ولحمة وفراخ مشوية بأسعار شعبية.', keywords:['مطعم','أكل مصري','كشري','لحمة','فراخ'], workingHours:{ saturday:'11:00 ص - 12:00 م', sunday:'11:00 ص - 12:00 م', monday:'11:00 ص - 12:00 م', tuesday:'11:00 ص - 12:00 م', wednesday:'11:00 ص - 12:00 م', thursday:'11:00 ص - 12:00 م', friday:'1:00 م - 12:00 م' }, rating:{ average:4.4, count:250 }, status:'approved', isVerified:true, ownerId:'demo', views:550, photos:[], offers:[], products:[
    { id:'fp7', name:'كشري فيومي', desc:'كشري فيومي أصيل مع عدس وصلصة', price:'30', image:'', category:'أكل' },
    { id:'fp8', name:'ملوخية بلدي', desc:'ملوخية بلدي بالثوم والليمون', price:'35', image:'', category:'أكل' },
    { id:'fp9', name:'فراخ مشوية', desc:'فرخة كاملة مشوية على الفحم', price:'90', image:'', category:'لحوم' },
    { id:'fp10', name:'لحمة بلدي', desc:'لحمة بلدي مشوية مع أرز وبصل مكرمل', price:'110', image:'', category:'لحوم' },
    { id:'fp11', name:'رمضان كتافه', desc:'ساندويتش كتافه بلدي', price:'45', image:'', category:'ساندويتشات' },
  ], createdAt:'2025-01-10' },

  { id:'fy3', name:'صيدلية العزبي', nameAr:'صيدلية العزبي', nameEn:'El Azbey Pharmacy', categoryNameAr:'الصحة', location:{ city:'الفيوم', district:'الفيوم', address:'شارع الحلو — وسط البلد' }, contact:{ phone:'0842231234' }, description:'صيدلية العزبي من أقدم الصيدليات في الفيوم — بتوفر كل الأدوية والمستلزمات الطبية بأسعار مناسبة ونصح طبي متخصص.', keywords:['صيدلية','أدوية','صحة','مستلزمات طبية'], workingHours:{ saturday:'9:00 ص - 12:00 م', sunday:'9:00 ص - 12:00 م', monday:'9:00 ص - 12:00 م', tuesday:'9:00 ص - 12:00 م', wednesday:'9:00 ص - 12:00 م', thursday:'9:00 ص - 12:00 م', friday:'4:00 م - 12:00 م' }, rating:{ average:4.3, count:90 }, status:'approved', isVerified:false, ownerId:'demo', views:180, photos:[], offers:[], products:[
    { id:'fp12', name:'مسكن ألم', desc:'مسكن ألم سريع المفعول', price:'15', image:'', category:'أدوية' },
    { id:'fp13', name:'فيتامين سي', desc:'فيتامين سي 1000 مجم', price:'45', image:'', category:'مكملات' },
    { id:'fp14', name:'واقي شمس', desc:'واقي شمس SPF 50', price:'80', image:'', category:'عناية' },
  ], createdAt:'2025-02-01' },

  { id:'fy4', name:'محل أبو تالة للمواد الغذائية', nameAr:'محل أبو تالة', nameEn:'Abu Talaa Grocery', categoryNameAr:'التجزئة', location:{ city:'الفيوم', district:'الفيوم', address:'شارع الجيش — الفيوم' }, contact:{ phone:'0842235678' }, description:'محل أبو تالة من أكبر محلات البقالة في الفيوم — فيه كل أنواع المواد الغذائية والمشروبات والمستلزمات اليومية.', keywords:['بقالة','مواد غذائية','تسوق','مشروبات'], workingHours:{ saturday:'8:00 ص - 11:00 م', sunday:'8:00 ص - 11:00 م', monday:'8:00 ص - 11:00 م', tuesday:'8:00 ص - 11:00 م', wednesday:'8:00 ص - 11:00 م', thursday:'8:00 ص - 11:00 م', friday:'8:00 ص - 11:00 م' }, rating:{ average:4.1, count:60 }, status:'approved', isVerified:false, ownerId:'demo', views:120, photos:[], offers:[], products:[
    { id:'fp15', name:'زيت زيتون', desc:'زيت زيتون بكر ممتاز', price:'120', image:'', category:'مواد غذائية' },
    { id:'fp16', name:'أرز مصري', desc:'أرز مصري طويل الحبة 5 كيلو', price:'65', image:'', category:'مواد غذائية' },
    { id:'fp17', name:'سكر أبيض', desc:'سكر أبيض ناعم 2 كيلو', price:'30', image:'', category:'مواد غذائية' },
  ], createdAt:'2025-02-15' },

  { id:'fy5', name:'بنك مصر — الفيوم', nameAr:'بنك مصر الفيوم', nameEn:'Banque Misr Faiyum', categoryNameAr:'البنوك', location:{ city:'الفيوم', district:'الفيوم', address:'شارع سعد زغلول — وسط البلد' }, contact:{ phone:'0842234000' }, description:'فرع بنك مصر في الفيوم — بيقدم كل الخدمات البنكية: حسابات توفير ودولي وقروض شخصية وكرت ائتمان.', keywords:['بنك','حساب','قروض','خدمات مالية','بنك مصر'], brands:['Banque Misr'], workingHours:{ saturday:'8:30 ص - 2:30 م', sunday:'8:30 ص - 2:30 م', monday:'8:30 ص - 2:30 م', tuesday:'8:30 ص - 2:30 م', wednesday:'8:30 ص - 2:30 م', thursday:'8:30 ص - 2:30 م', friday:'مغلق' }, rating:{ average:3.8, count:150 }, status:'approved', isVerified:true, ownerId:'demo', views:300, photos:[], offers:[], products:[
    { id:'fp18', name:'حساب توفير', desc:'حساب توفير بشروط ميسرة', price:'', image:'', category:'حسابات' },
    { id:'fp19', name:'قروض شخصية', desc:'قروض بفوائد تنافسية', price:'', image:'', category:'قروض' },
  ], createdAt:'2025-01-01' },

  { id:'fy6', name:'محل الشعبي للأقمشة', nameAr:'الشعبي للأقمشة', nameEn:'El Shaaby Fabrics', categoryNameAr:'الأزياء', location:{ city:'الفيوم', district:'الفيوم', address:'سوق شارع الجيش — الفيوم' }, contact:{ phone:'0842237890' }, description:'محل الشعبي من أكبر محلات الأقمشة في الفيوم — فيه أقمشة مصري وturkish وصيني لكل الأذواق والمقاسات.', keywords:['أقمشة','خياطة','ملابس','سوق'], workingHours:{ saturday:'10:00 ص - 9:00 م', sunday:'10:00 ص - 9:00 م', monday:'10:00 ص - 9:00 م', tuesday:'10:00 ص - 9:00 م', wednesday:'10:00 ص - 9:00 م', thursday:'10:00 ص - 9:00 م', friday:'4:00 م - 9:00 م' }, rating:{ average:4.0, count:45 }, status:'approved', isVerified:false, ownerId:'demo', views:90, photos:[], offers:[], products:[
    { id:'fp20', name:'قماش قطن مصري', desc:'متر قماش قطن مصري 100%', price:'45', image:'', category:'أقمشة' },
    { id:'fp21', name:'قماش كريب تركي', desc:'متر قماش كريب تركي فاخر', price:'80', image:'', category:'أقمشة' },
    { id:'fp22', name:'قماش حرير صيني', desc:'متر قماش حرير صيني ملون', price:'120', image:'', category:'أقمشة' },
  ], createdAt:'2025-03-05' },

  { id:'fy7', name:'عيادة د. أحمد فتحي', nameAr:'عيادة د. أحمد فتحي', nameEn:'Dr. Ahmed Fathy Clinic', categoryNameAr:'الصحة', location:{ city:'الفيوم', district:'الفيوم الجديدة', address:'شارع الجيش — الفيوم الجديدة' }, contact:{ phone:'0842316789', whatsapp:'20842316789' }, description:'عيادة د. أحمد فتحي للتخصصات الداخلية — كشف عام وأمراض القلب والضغط والسكري بخبرة أكتر من 15 سنة.', keywords:['عيادة','طبيب','قلب','ضغط','سكري','باطنة'], workingHours:{ saturday:'5:00 م - 9:00 م', sunday:'5:00 م - 9:00 م', monday:'5:00 م - 9:00 م', tuesday:'5:00 م - 9:00 م', wednesday:'5:00 م - 9:00 م', thursday:'5:00 م - 9:00 م', friday:'مغلق' }, rating:{ average:4.7, count:200 }, status:'approved', isVerified:true, ownerId:'demo', views:350, photos:[], offers:[], products:[
    { id:'fp23', name:'كشف عام', desc:'كشف شامل مع تحاليل', price:'300', image:'', category:'خدمات' },
    { id:'fp24', name:'استشارة قلب', desc:'استشارة أخصائي قلب', price:'400', image:'', category:'استشارات' },
    { id:'fp25', name:'ضغط وسكري', desc:'متابعة أمراض ضغط وسكري', price:'250', image:'', category:'خدمات' },
  ], createdAt:'2025-01-20' },

  { id:'fy8', name:'محل الحلواني للموبيليات', nameAr:'الحلواني للموبيليات', nameEn:'El Halwany Furniture', categoryNameAr:'التجزئة', location:{ city:'الفيوم', district:'الفيوم', address:'شارع المحطة — الفيوم' }, contact:{ phone:'0842239012' }, description:'محل الحلواني من أكبر محلات الموبيليات في الفيوم — أنتريهات وسرير ودولاب ومطبخ بجودة عالية وأسعار مناسبة.', keywords:['موبيليات','أنتريه','سرير','دولاب','مطبخ'], workingHours:{ saturday:'10:00 ص - 9:00 م', sunday:'10:00 ص - 9:00 م', monday:'10:00 ص - 9:00 م', tuesday:'10:00 ص - 9:00 م', wednesday:'10:00 ص - 9:00 م', thursday:'10:00 ص - 9:00 م', friday:'مغلق' }, rating:{ average:4.2, count:75 }, status:'approved', isVerified:false, ownerId:'demo', views:200, photos:[], offers:[], products:[
    { id:'fp26', name:'أنتريه 7 قطع', desc:'أنتريه 7 قطع قماش تركي', price:'8500', image:'', category:'أنتريهات' },
    { id:'fp27', name:'سرير خشبي', desc:'سرير خشبي مزدوج مع طاولات', price:'4500', image:'', category:'أسرة' },
    { id:'fp28', name:'دولاب ملابس', desc:'دولاب ملابس 4 باب', price:'6000', image:'', category:'دولايب' },
  ], createdAt:'2025-02-10' },

  { id:'fy9', name:'سنترال فييوم', nameAr:'سنترال فييوم', nameEn:'Central Faiyum', categoryNameAr:'الاتصالات', location:{ city:'الفيوم', district:'الفيوم', address:'شارع الحلو — وسط البلد' }, contact:{ phone:'0842233456' }, description:'سنترال فييوم — بيوفر كل خدمات المحمول والإنترنت: شحن رصيد وتفعيل باقات وتصليح موبايلات.', keywords:['موبايل','شحن','إنترنت','اتصالات','تصليح'], workingHours:{ saturday:'10:00 ص - 10:00 م', sunday:'10:00 ص - 10:00 م', monday:'10:00 ص - 10:00 م', tuesday:'10:00 ص - 10:00 م', wednesday:'10:00 ص - 10:00 م', thursday:'10:00 ص - 10:00 م', friday:'2:00 م - 10:00 م' }, rating:{ average:3.9, count:110 }, status:'approved', isVerified:false, ownerId:'demo', views:250, photos:[], offers:[], products:[
    { id:'fp29', name:'شحن رصيد', desc:'شحن رصيد فودافون/أورانج/WE', price:'', image:'', category:'خدمات' },
    { id:'fp30', name:'تفعيل باقة إنترنت', desc:'تفعيل باقة إنترنت شهرية', price:'', image:'', category:'خدمات' },
  ], createdAt:'2025-03-01' },

  { id:'fy10', name:'مطعم أبو شادى للمشويات', nameAr:'أبو شادى للمشويات', nameEn:'Abu Shady Grill', categoryNameAr:'المطاعم', location:{ city:'الفيوم', district:'الفيوم', address:'شارع الحرفيين — الفيوم' }, contact:{ phone:'0842238765', whatsapp:'20842238765' }, description:'مطعم أبو شادى من أشهر المطاعم في الفيوم — مشويات على الفحم و كفتة بلدي و كباب و لحمة محمرة بأسعار شعبية.', keywords:['مشويات','مطعم','كباب','كفتة','لحمة','فحم'], workingHours:{ saturday:'12:00 م - 1:00 م', sunday:'12:00 م - 1:00 م', monday:'12:00 م - 1:00 م', tuesday:'12:00 م - 1:00 م', wednesday:'12:00 م - 1:00 م', thursday:'12:00 م - 1:00 م', friday:'1:00 م - 1:00 م' }, rating:{ average:4.5, count:320 }, status:'approved', isVerified:true, ownerId:'demo', views:680, photos:[], offers:[], products:[
    { id:'fp31', name:'طبق مشويات مشكل', desc:'كباب وكفتة وريش ولفحة', price:'130', image:'', category:'مشويات' },
    { id:'fp32', name:'كفتة بلدي', desc:'كفتة بلدي مشوية على الفحم مع أرز', price:'60', image:'', category:'مشويات' },
    { id:'fp33', name:'كباب', desc:'كباب لحم بلدي مع أرز وبصل', price:'70', image:'', category:'مشويات' },
    { id:'fp34', name:'فراخ مشوية', desc:'فرخة كاملة مشوية على الفحم', price:'95', image:'', category:'مشويات' },
    { id:'fp35', name:'رقاق باللحمة', desc:'رقاق محشي لحمة بلدي', price:'50', image:'', category:'مقبلات' },
  ], createdAt:'2025-01-15' },
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
  'القاهرة': ['مدينة نصر','المعادي','التجمع الخامس','مصر الجديدة','وسط البلد','شبرا','حلوان','عين شمس','المرج','الزيتون','السلام','دار السلام','البساتين','التبين','النزهة','الدرب الأحمر','السيدة زينب','الخليفة','عابدين','قصر النيل','بولاق','الأزبكية','الجمالية','باب الشعرية','روض الفرج','الساحل','حدائق القبة','الزاوية الحمراء','شبرا الخيمة'],
  'الجيزة': ['الهرم','الفيصل','الدقي','المهندسين','العجوزة','الزمالك','السادس من أكتوبر','الواحة','كرداسة','أبو النمرس','البدرشين','الحوامدية','الصف','العياط','أطفيح','أوسيم','إمبابة'],
  'الإسكندرية': ['سيدي جابر','ميامي','سموحة','المنشية','الرمل','باكوس','العصافرة','برج العرب','الدخيلة','محرم بك','الجمرك','العامرية','الساحل الشمالي'],
  'القليوبية': ['بنها','شبرا الخيمة','طوخ','قليوب','العبور','الخصوص','شبين القناطر','الخانكة','القناطر الخيرية','كفر شكر','قها'],
  'المنوفية': ['شبين الكوم','منوف','سرس الليان','الباجور','أشمون','تلا','بركة السبع','الشهداء','قويسنا','السادات'],
  'الغربية': ['طنطا','المحلة الكبرى','كفر الزيات','زفتى','سمنود','قطور','بسيون','السنطة'],
  'البحيرة': ['دمنهور','كفر الدوار','رشيد','إدكو','النوبارية','الرحمانية','شبراخيت','ابوالمطامير','ابوحمص','الدلنجات','المحمودية','إيتاى البارود','حوش عيسى','كوم حمادة','وادي النطرون','بدر'],
  'الشرقية': ['الزقازيق','العاشر من رمضان','بلبيس','منيا القمح','أبو كبير','القنايات','أبو حماد','فاقوس','الحسينية','ديرب نجم','كفر صقر','ههيا','مشتول السوق','الأبراهيمية','أولاد صقر','الصالحية الجديدة','القرين'],
  'الدقهلية': ['المنصورة','طلخا','ميت غمر','دكرنس','السنبلاوين','أجا','منية النصر','شربين','كفر سعد','المطرية','المنزلة','بلقاس','الجمالية','تمى الأمديد','محلة دمنة','نبروة','بني عبيد'],
  'الفيوم': ['الفيوم','إطسا','سنورس','طامية','الفيوم الجديدة','يوسف الصديق','أبشواي'],
  'بني سويف': ['بني سويف','الواسطى','ناصر','إهناسيا','ببا','سمسطرا','الفشن'],
  'المنيا': ['المنيا','ملوي','أبوقرقاص','سمالوط','العدوة','مغاغة','بني مزار','مطاي','دير مواس'],
  'أسيوط': ['أسيوط','البداري','الغنايم','ديروط','منفلوط','أبو تيج','صدفا','أبنوب','ساحل سليم','القوصية','الفتح'],
  'سوهاج': ['سوهاج','طهطا','البلينا','العريش','المراغة','الساحل','طما','أخميم','المنشاة','دار السلام','جرجا','ساقلته','جهينة الغربية','العسيرات'],
  'قنا': ['قنا','قوص','نجع حمادي','الوقف','دشنا','فرشوط','أبو تشت','نقادة','إسنا','أرمنت','قفط','أبو طشت'],
  'الأقصر': ['الأقصر','البياضية','القرناصنة','إسنا','طيبة الجديدة'],
  'أسوان': ['أسوان','دراو','كوم أمبو','نصر النوبة','إدفو','أبو سنبل'],
  'البحر الأحمر': ['الغردقة','مرسى علم','الجونة','السخنة','الدهب','شرم الشيخ','رأس سدر','القصير','سفاجا','رأس غارب','شلاتين','حلايب'],
  'الإسماعيلية': ['الإسماعيلية','التل الكبير','فايد','القنطرة شرق','القنطرة غرب'],
  'السويس': ['السويس','الجناين','عتاقة','فيصل','الأربعين'],
  'بورسعيد': ['بورسعيد','الضواحي','الزهور','بور فؤاد'],
  'دمياط': ['دمياط','دمياط الجديدة','الروضة','الزرقا','فارسكور','كفر سعد','رأس البر'],
  'كفر الشيخ': ['كفر الشيخ','دسوق','بيلا','الحامول','سيدي سالم','قلين','البرلس','فوه','مطوبس','الرياض'],
  'شمال سيناء': ['العريش','رفح','بئر العبد','الشيخ زويد','نخل','الحسنة','رمانة','القسيمة'],
  'جنوب سيناء': ['طور سيناء','شرم الشيخ','دهب','أبو زنيمة','أبو رديس','رأس سدر','سانت كاترين','نويبع','طابا'],
  'مطروح': ['مرسى مطروح','الحمام','العلمين','سيدي براني','سيوة','السلوم','الضبعة'],
  'الوادي الجديد': ['الخارجة','الداخلة','الفرافرة','باريس'],
};

const CITIES = Object.keys(GOVERNORATES);

// ==================== STORAGE ====================
// ==================== FIRESTORE SYNC ====================
function saveLocal() {
  localStorage.setItem('sikka_businesses', JSON.stringify(businesses));
  localStorage.setItem('sikka_reviews', JSON.stringify(reviews));
  localStorage.setItem('sikka_users', JSON.stringify(users));
}

async function saveBizToFirestore(biz) {
  try { await db.collection('businesses').doc(biz.id).set(biz); } catch(e) { /* Firestore write error */ }
}

async function deleteBizFromFirestore(id) {
  try { await db.collection('businesses').doc(id).delete(); } catch(e) { /* Firestore delete error */ }
}

async function saveReviewToFirestore(bizId, items) {
  try { await db.collection('reviews').doc(bizId).set({ items }); } catch(e) { /* Firestore reviews error */ }
}

async function saveUserToFirestore(user) {
  try { await db.collection('users').doc(user.id).set(user); } catch(e) { /* Firestore user error */ }
}

// ==================== ADMIN CHECK FROM FIRESTORE ====================
// Security: check admin status from Firestore, not just from email
async function checkAdminFromFirestore(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data().isAdmin === true;
    }
    return false;
  } catch(e) {
    return false;
  }
}

function startRealtimeSync() {
  db.collection('businesses').onSnapshot(snap => {
    const remote = [];
    snap.forEach(doc => remote.push(doc.data()));
    if (remote.length > 0) {
      businesses = remote;
      saveLocal();
      const h = location.hash || '#/home';
      if (h === '#/home') loadHome();
      else if (h === '#/businesses') loadAllBusinesses();
    }
  }, err => { /* Firestore businesses listen error */ });

  db.collection('reviews').onSnapshot(snap => {
    const remote = {};
    snap.forEach(doc => { remote[doc.id] = doc.data().items || []; });
    reviews = remote;
    saveLocal();
  }, err => { /* Firestore reviews listen error */ });
}

async function saveData() {
  saveLocal();
  for (const biz of businesses) { await saveBizToFirestore(biz); }
}

async function loadData() {
  try {
    const b = localStorage.getItem('sikka_businesses');
    const r = localStorage.getItem('sikka_reviews');
    const u = localStorage.getItem('sikka_users');
    businesses = b ? JSON.parse(b) : [...DEFAULT_BUSINESSES];
    reviews = r ? JSON.parse(r) : {};
    users = u ? JSON.parse(u) : [];

    db.collection('businesses').get().then(snap => {
      const remote = [];
      snap.forEach(doc => remote.push(doc.data()));
      if (remote.length === 0) {
        DEFAULT_BUSINESSES.forEach(async biz => { await saveBizToFirestore(biz); });
        businesses = [...DEFAULT_BUSINESSES];
      } else {
        const remoteIds = new Set(remote.map(b => b.id));
        const missing = DEFAULT_BUSINESSES.filter(b => !remoteIds.has(b.id));
        if (missing.length > 0) {
          missing.forEach(async biz => { await saveBizToFirestore(biz); });
        }
        businesses = [...remote, ...missing];
      }
      saveLocal();
      startRealtimeSync();
      const h = location.hash || '#/home';
      if (h === '#/home') loadHome();
      else if (h === '#/businesses') loadAllBusinesses();
    });
  } catch(e) {
    businesses = [...DEFAULT_BUSINESSES];
    reviews = {};
    users = [];
  }

  const savedUser = localStorage.getItem('sikka_current_user');
  if (savedUser) currentUser = JSON.parse(savedUser);
}

// ==================== INIT ====================
let isNavigating = false;
let currentPage = 1;
const ITEMS_PER_PAGE = 12;
let leafletMap = null;
let compareList = JSON.parse(localStorage.getItem('sikka_compare') || '[]');
let reports = JSON.parse(localStorage.getItem('sikka_reports') || '[]');

// ==================== DARK MODE ====================
(function() {
  const saved = localStorage.getItem('sikka_dark_mode');
  if (saved === 'true') document.body.classList.add('dark-mode');
})();

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('sikka_dark_mode', document.body.classList.contains('dark-mode'));
  updateDarkModeIcons();
}

function updateDarkModeIcons() {
  const isDark = document.body.classList.contains('dark-mode');
  document.querySelectorAll('.dark-mode-toggle').forEach(b => {
    b.innerHTML = isDark ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
  });
}

function handleSearchInput(value) {
  const container = document.getElementById('search-autocomplete');
  const clearBtn = document.getElementById('search-clear-btn');
  if (!container) return;
  if (clearBtn) clearBtn.classList.toggle('hidden', !value);
  if (value.length >= 1) {
    renderSearchAutocomplete(value);
  } else {
    renderSearchSuggestions();
  }
}

const BASE_URL = 'https://ohmedayman.github.io/skii/';

function generateSEO(title, description, image, url) {
  document.title = title;
  const ogTitle = document.getElementById('og-title');
  const ogDesc = document.getElementById('og-desc');
  const ogUrl = document.getElementById('og-url');
  const ogType = document.getElementById('og-type');
  const ogImage = document.getElementById('og-image');
  const twTitle = document.getElementById('tw-title');
  const twDesc = document.getElementById('tw-desc');
  const twImage = document.getElementById('tw-image');
  const canonical = document.getElementById('canonical-url');

  if (ogTitle) ogTitle.content = title;
  if (ogDesc) ogDesc.content = description;
  if (ogUrl) ogUrl.content = url || BASE_URL;
  if (ogType) ogType.content = url && url !== BASE_URL ? 'business.business' : 'website';
  if (ogImage) ogImage.content = image || BASE_URL + 'assets/icons/logo.png';
  if (twTitle) twTitle.content = title;
  if (twDesc) twDesc.content = description;
  if (twImage) twImage.content = image || BASE_URL + 'assets/icons/logo.png';
  if (canonical) canonical.href = url || BASE_URL;
}

function generateBusinessSchema(b) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": b.nameAr || b.name,
    "description": b.description || '',
    "url": BASE_URL + '#/business/' + b.id,
    "telephone": b.contact?.phone || '',
    "address": {
      "@type": "PostalAddress",
      "streetAddress": b.location?.address || '',
      "addressLocality": b.location?.city || '',
      "addressRegion": b.location?.district || '',
      "addressCountry": "EG"
    },
    "geo": b.location?.lat && b.location?.lng ? {
      "@type": "GeoCoordinates",
      "latitude": b.location.lat,
      "longitude": b.location.lng
    } : undefined,
    "image": b.images?.[0] || '',
    "priceRange": b.priceRange || '',
    "aggregateRating": b.rating?.average ? {
      "@type": "AggregateRating",
      "ratingValue": b.rating.average,
      "reviewCount": b.rating.count || 0
    } : undefined,
    "openingHours": b.workingHours?.saturday ? [b.workingHours.saturday] : undefined
  };
}

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
  if (!authReady) return;
  const hash = location.hash || '#/home';
  const BASE = 'https://ohmedayman.github.io/skii/';

  if (hash.startsWith('#/business/')) {
    const id = hash.replace('#/business/', '');
    const b = businesses.find(biz => biz.id === id);
    if (b) {
      showPage('business');
      renderBusinessDetail(b);
      const bizUrl = BASE + '#/business/' + b.id;
      generateSEO(
        (b.nameAr || b.name) + ' | سِكّة',
        b.description || (b.nameAr || b.name) + ' - ' + (b.categoryNameAr || '') + ' في ' + (b.location?.city || 'مصر'),
        b.images?.[0] || BASE + 'assets/icons/logo.png',
        bizUrl
      );
      // Add JSON-LD
      const existingSchema = document.getElementById('biz-schema');
      if (existingSchema) existingSchema.remove();
      const schemaEl = document.createElement('script');
      schemaEl.type = 'application/ld+json';
      schemaEl.id = 'biz-schema';
      schemaEl.textContent = JSON.stringify(generateBusinessSchema(b));
      document.head.appendChild(schemaEl);
    } else {
      show404();
    }
    return;
  }

  if (hash.startsWith('#/blog/') && hash !== '#/blog') {
    const postId = hash.replace('#/blog/', '');
    const post = BLOG_POSTS.find(p => p.id === postId);
    if (post) {
      showPage('post-detail');
      renderBlogPost(post);
      generateSEO(
        post.title + ' | مدونة سِكّة',
        post.excerpt || post.title,
        BASE + 'assets/icons/logo.png',
        BASE + '#/blog/' + post.id
      );
    } else show404();
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
    '#/map': 'mapview',
    '#/compare': 'compare', '#/plans': 'plans',
  };

  const page = pageMap[hash];
  if (!page) { show404(); return; }

  showPage(page);
  updateNavActive(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // SEO per page
  const seoTitles = {
    home: 'سِكّة | دليل الأعمال الذكي في مصر',
    businesses: 'كل الأعمال | سِكّة',
    categories: 'الفئات | سِكّة',
    blog: 'المدونة | سِكّة',
    add: 'سجّل شغلك | سِكّة',
    profile: 'الملف الشخصي | سِكّة',
    dashboard: 'لوحة التحكم | سِكّة',
    favorites: 'المفضلة | سِكّة',
    admin: 'لوحة الإدارة | سِكّة',
    about: 'عن سِكّة | دليل الأعمال الذكي',
    contact: 'تواصل معنا | سِكّة',
    terms: 'الشروط والأحكام | سِكّة',
    mapview: 'الخريطة | سِكّة',
    compare: 'مقارنة الأعمال | سِكّة', plans: 'باقات سِكّة',
  };
  generateSEO(
    seoTitles[page] || 'سِكّة',
    'اكتشف أفضل المحلات والخدمات في مصر',
    BASE + 'assets/icons/favicon.svg',
    BASE + hash
  );

  if (page === 'home') loadHome();
  if (page === 'businesses') loadAllBusinesses();
  if (page === 'blog') loadBlog();
  if (page === 'admin') loadAdmin();
  if (page === 'profile') loadProfile();
  if (page === 'categories') loadCategoriesFull();
  if (page === 'add') renderAddForm();
  if (page === 'dashboard') loadDashboard();
  if (page === 'favorites') loadFavorites();
  if (page === 'mapview') setTimeout(() => initMapPage(), 100);
  if (page === 'compare') renderCompare();
  if (page === 'plans' && typeof renderPlansPage === 'function') renderPlansPage(document.getElementById('plans-content'));
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
  const icon = type === 'success' ? 'ri-check-double-line' : type === 'error' ? 'ri-error-warning-line' : type === 'warning' ? 'ri-alarm-warning-line' : 'ri-information-line';
  const colors = { success: '#059669', error: '#dc2626', info: '#2563eb', warning: '#d97706' };
  const bg = colors[type] || colors.info;
  t.className = 'toast-item toast-' + type;
  t.style.cssText = '';
  t.innerHTML = '<div class="toast-icon"><i class="' + icon + '"></i></div><span>' + msg + '</span>';
  t.style.opacity = '0';
  t.style.transform = 'translateX(100%) scale(0.8)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(0) scale(1)';
    });
  });
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    t.classList.add('toast-fade-out');
    setTimeout(() => { t.classList.remove('toast-fade-out'); }, 300);
  }, 3500);
}

function addNotification(userId, title, body, type = 'info') {
  const key = 'sikka_notifications_' + userId;
  const notifs = JSON.parse(localStorage.getItem(key) || '[]');
  notifs.unshift({ id: Date.now(), title, body, type, read: false, date: new Date().toLocaleDateString('ar-EG') });
  if (notifs.length > 50) notifs.splice(50);
  localStorage.setItem(key, JSON.stringify(notifs));
  updateNotifBadge(userId);
}

function updateNotifBadge(userId) {
  if (!userId) return;
  const notifs = JSON.parse(localStorage.getItem('sikka_notifications_' + userId) || '[]');
  const unread = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('notif-count');
  const btnWrap = document.getElementById('notif-btn-wrap');
  if (btnWrap) btnWrap.style.display = currentUser ? '' : 'none';
  if (badge) {
    if (unread > 0) { badge.textContent = unread; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }
  }
}

function toggleNotifications() {
  const panel = document.getElementById('notif-panel');
  const overlay = document.getElementById('notif-panel-overlay');
  if (!panel || !overlay) return;
  const isOpen = !panel.classList.contains('hidden');
  if (isOpen) {
    panel.classList.add('hidden');
    overlay.classList.add('hidden');
  } else {
    renderNotifPanel();
    panel.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }
}

function renderNotifPanel() {
  if (!currentUser) return;
  const key = 'sikka_notifications_' + currentUser.id;
  const notifs = JSON.parse(localStorage.getItem(key) || '[]');
  const list = document.getElementById('notif-panel-list');
  if (!list) return;
  if (!notifs.length) {
    list.innerHTML = '<div class="notif-empty"><i class="ri-notification-off-line"></i><p>مفيش إشعارات</p></div>';
    return;
  }
  list.innerHTML = notifs.map(n => {
    const icons = { success: 'ri-check-double-line', error: 'ri-error-warning-line', info: 'ri-information-line', booking: 'ri-calendar-check-line', review: 'ri-star-line', promo: 'ri-megaphone-line' };
    const colors = { success: '#059669', error: '#dc2626', info: '#2563eb', booking: '#7c3aed', review: '#f59e0b', promo: '#d32323' };
    return `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
      <div class="notif-item-icon" style="background:${colors[n.type] || '#2563eb'}20;color:${colors[n.type] || '#2563eb'}"><i class="${icons[n.type] || 'ri-information-line'}"></i></div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-text">${n.body}</div>
        <div class="notif-item-date">${n.date}</div>
      </div>
      ${!n.read ? '<div class="notif-item-dot"></div>' : ''}
    </div>`;
  }).join('');
  // Mark all as read after showing
  setTimeout(() => {
    notifs.forEach(n => n.read = true);
    localStorage.setItem(key, JSON.stringify(notifs));
    updateNotifBadge(currentUser.id);
  }, 1000);
}

function markNotifRead(id) {
  if (!currentUser) return;
  const key = 'sikka_notifications_' + currentUser.id;
  const notifs = JSON.parse(localStorage.getItem(key) || '[]');
  const n = notifs.find(x => x.id === id);
  if (n) { n.read = true; localStorage.setItem(key, JSON.stringify(notifs)); }
  renderNotifPanel();
  updateNotifBadge(currentUser.id);
}

function clearAllNotifications() {
  if (!currentUser) return;
  localStorage.removeItem('sikka_notifications_' + currentUser.id);
  renderNotifPanel();
  updateNotifBadge(currentUser.id);
  showToast('تم مسح الإشعارات', 'success');
}

// ==================== AD BANNERS ====================
function handleAdClick(slot) {
  if (slot === 1) navigateTo('add');
  else if (slot === 2) navigateTo('plans');
  else if (slot === 3) navigateTo('businesses');
}

function loadAdBanners() {
  // Ad banners are static HTML — just show/hide based on user state
  const banner1 = document.getElementById('ad-banner-1');
  if (banner1 && currentUser) {
    // Don't show "register" ad to logged-in users
    const biz = businesses.find(b => b.ownerId === currentUser.id);
    if (biz) banner1.style.display = 'none';
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
  if (!authReady) { showAuthModal(); return; }
  console.log('📄 Navigate to:', page);
  const hashMap = { home:'#/home', businesses:'#/businesses', categories:'#/categories', blog:'#/blog', add:'#/add', profile:'#/profile', dashboard:'#/dashboard', favorites:'#/favorites', admin:'#/admin', about:'#/about', contact:'#/contact', terms:'#/terms', map:'#/map', compare:'#/compare', plans:'#/plans' };
  let newHash;
  if (page.startsWith('blog/')) {
    newHash = '#/' + page;
  } else {
    newHash = hashMap[page] || '#/home';
  }
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


function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('sikka_theme', isDark ? 'light' : 'dark');
  
  const icon = document.getElementById('dark-mode-icon');
  if (icon) {
    icon.className = isDark ? 'ri-moon-line text-lg' : 'ri-sun-line text-lg';
  }
}

function toggleNotifications() {
  if (currentUser) {
    const notifs = JSON.parse(localStorage.getItem('sikka_notifications_' + currentUser.id) || '[]');
    notifs.forEach(n => n.read = true);
    localStorage.setItem('sikka_notifications_' + currentUser.id, JSON.stringify(notifs));
    const count = document.getElementById('notif-count');
    if (count) count.style.display = 'none';
    showToast('تم قراءة الإشعارات', 'info');
  }
}

// ==================== AUTH ====================
function requireAuth(action) {
  if (currentUser) {
    navigateTo(action);
  } else {
    showAuthModal();
  }
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('auth-error').classList.add('hidden');
  document.getElementById('email-input').value = '';
  document.getElementById('password-input').value = '';
}
function hideAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }

function showSignupModal() {
  document.getElementById('signup-modal').classList.remove('hidden');
  document.getElementById('signup-error').classList.add('hidden');
  document.getElementById('signup-name').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
  populateGovSelect('signup-gov', 'signup-center');
}
function hideSignupModal() { document.getElementById('signup-modal').classList.add('hidden'); }

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

  const email = emailEl ? emailEl.value.trim() : '';
  const pass = passEl ? passEl.value : '';

  if (!email || !pass) {
    if (errEl) { errEl.textContent = 'ابدأ كل الخانات'; errEl.classList.remove('hidden'); }
    return;
  }

  auth.signInWithEmailAndPassword(email, pass).then(async cred => {
    const uid = cred.user.uid;
    const name = sanitize(cred.user.displayName || email.split('@')[0]);
    // Security: Check admin status from Firestore, not from email string
    const isAdmin = await checkAdminFromFirestore(uid);
    const userObj = { id: uid, name, email, isAdmin };
    currentUser = userObj;
    localStorage.setItem('sikka_current_user', JSON.stringify(userObj));
    db.collection('users').doc(uid).set(userObj, { merge: true });
    hideAuthModal();
    updateAuthUI();
    showToast('أهلاً بيك ' + name + '!');
  }).catch(err => {
    if (errEl) {
      errEl.textContent = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
        ? 'الإيميل أو كلمة السر غلط' : 'في مشكلة حاول تاني';
      errEl.classList.remove('hidden');
    }
  });
}

function signupWithEmail() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const pass = document.getElementById('signup-password')?.value;
  const errEl = document.getElementById('signup-error');

  if (!name || !email || !pass) { errEl.textContent = 'ابدأ كل الخانات'; errEl.classList.remove('hidden'); return; }
  if (pass.length < 6) { errEl.textContent = 'كلمة السر لازم تكون 6 حروف على الأقل'; errEl.classList.remove('hidden'); return; }
  // Security: Reject registration with admin email
  if (email.toLowerCase() === 'admin@sikka.com') {
    errEl.textContent = 'الإيميل ده محجوز - استخدم إيميل تاني';
    errEl.classList.remove('hidden');
    return;
  }

  auth.createUserWithEmailAndPassword(email, pass).then(cred => {
    const safeName = sanitize(name);
    const userObj = {
      id: cred.user.uid, name: safeName, email, isAdmin: false, // Never grant admin via signup
      governorate: document.getElementById('signup-gov')?.value || '',
      center: document.getElementById('signup-center')?.value || '',
      createdAt: new Date().toISOString()
    };
    cred.user.updateProfile({ displayName: safeName });
    db.collection('users').doc(cred.user.uid).set(userObj);
    currentUser = userObj;
    localStorage.setItem('sikka_current_user', JSON.stringify(userObj));
    hideSignupModal();
    updateAuthUI();
    showToast('تم عمل الحساب بنجاح!');
  }).catch(err => {
    if (errEl) {
      errEl.textContent = err.code === 'auth/email-already-in-use' ? 'الإيميل ده متسجل قبل كده' : 'في مشكلة حاول تاني';
      errEl.classList.remove('hidden');
    }
  });
}

function loginWithGoogle() {
  auth.signInWithPopup(provider).then(async result => {
    const u = result.user;
    // Security: Check admin from Firestore, not email
    const isAdmin = await checkAdminFromFirestore(u.uid);
    const safeName = sanitize(u.displayName || u.email.split('@')[0]);
    const userObj = { id: u.uid, name: safeName, email: u.email, isAdmin, createdAt: new Date().toISOString() };
    db.collection('users').doc(u.uid).set(userObj, { merge: true });
    currentUser = userObj;
    localStorage.setItem('sikka_current_user', JSON.stringify(userObj));
    hideAuthModal();
    hideSignupModal();
    updateAuthUI();
    showToast('أهلاً بيك ' + safeName + '!');
  }).catch(err => {
    showToast('في مشكلة في تسجيل الدخول - حاول تاني');
  });
}

function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    localStorage.removeItem('sikka_current_user');
    updateAuthUI();
    showToast('اتعمل خروج');
    navigateTo('home');
  });
}

// ==================== AUTH STATE LISTENER ====================
let authReady = false;

function showLoginGate() {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('scroll-top-btn')?.classList.add('hidden');
  document.getElementById('mobile-bottom-nav')?.classList.add('hidden');
  const header = document.querySelector('header');
  if (header) header.classList.add('hidden');
  showAuthModal();
}

function hideLoginGate() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('hidden'));
  document.getElementById('scroll-top-btn')?.classList.remove('hidden');
  document.getElementById('mobile-bottom-nav')?.classList.remove('hidden');
  const header = document.querySelector('header');
  if (header) header.classList.remove('hidden');
  hideAuthModal();
}

auth.onAuthStateChanged(async user => {
  if (user) {
    // Security: Check admin from Firestore, not email
    const isAdmin = await checkAdminFromFirestore(user.uid);
    const safeName = sanitize(user.displayName || user.email.split('@')[0]);
    const userObj = { id: user.uid, name: safeName, email: user.email, isAdmin };
    currentUser = userObj;
    localStorage.setItem('sikka_current_user', JSON.stringify(userObj));
    authReady = true;
    hideLoginGate();
    updateAuthUI();
    handleHash();
  } else {
    currentUser = null;
    localStorage.removeItem('sikka_current_user');
    authReady = false;
    showLoginGate();
    updateAuthUI();
  }
});

// ==================== SEARCH ENGINE ====================
let searchHistory = JSON.parse(localStorage.getItem('sikka_search_history') || '[]');
const POPULAR_SEARCHES = ['مقاهي','مطاعم','بنوك','صيدلية','كافيه','فندق','صالون','جيم','سوبر ماركت','مستشفى'];
let searchLocation = '';

function highlightText(text, query) {
  if (!query || !text) return text || '';
  const q = query.toLowerCase();
  const t = text;
  const idx = t.toLowerCase().indexOf(q);
  if (idx === -1) return t;
  return t.substring(0, idx) + '<span class="highlight-match">' + t.substring(idx, idx + q.length) + '</span>' + t.substring(idx + q.length);
}

function toggleSearchLocation() {
  const dd = document.getElementById('search-loc-dropdown');
  if (!dd) return;
  dd.classList.toggle('hidden');
  if (!dd.classList.contains('hidden')) {
    renderSearchLocations();
    setTimeout(() => document.getElementById('search-loc-filter')?.focus(), 100);
  }
}

function filterSearchLocations(val) {
  renderSearchLocations(val);
}

function renderSearchLocations(filter) {
  const list = document.getElementById('search-loc-list');
  if (!list) return;
  const approved = businesses.filter(b => b.status === 'approved');
  const f = (filter || '').toLowerCase();
  const cities = Object.keys(GOVERNORATES).filter(c => !f || c.toLowerCase().includes(f));
  let html = '<div class="search-loc-item' + (!searchLocation ? ' active' : '') + '" onclick="selectSearchLocation(\'\')"><i class="ri-earth-line text-gray-400"></i><span>كل المحافظات</span></div>';
  cities.forEach(c => {
    const count = approved.filter(b => b.location?.city === c).length;
    html += '<div class="search-loc-item' + (searchLocation === c ? ' active' : '') + '" onclick="selectSearchLocation(\'' + c + '\')"><i class="ri-map-pin-2-fill text-blue-500"></i><span>' + c + '</span><span class="loc-count">' + count + '</span></div>';
  });
  if (!cities.length) html = '<div class="search-empty-state"><i class="ri-search-line"></i><p>مفيش محافظة باسم ده</p></div>';
  list.innerHTML = html;
}

function selectSearchLocation(city) {
  searchLocation = city;
  const textEl = document.getElementById('search-loc-text');
  if (textEl) textEl.textContent = city || 'كل المحافظات';
  document.getElementById('search-loc-dropdown')?.classList.add('hidden');
  handleSearchInput(document.getElementById('search-input')?.value || '');
}

function clearSearch() {
  const input = document.getElementById('search-input');
  if (input) { input.value = ''; input.focus(); }
  hideAutocomplete();
  document.getElementById('search-clear-btn')?.classList.add('hidden');
}

document.addEventListener('click', (e) => {
  const locBtn = document.getElementById('search-loc-btn');
  const locDd = document.getElementById('search-loc-dropdown');
  if (locBtn && locDd && !locBtn.contains(e.target) && !locDd.contains(e.target)) {
    locDd.classList.add('hidden');
  }
});

function switchSearchTab(btn, type) {
  searchType = type;
  document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const placeholders = { name:'دور بالاسم...', keyword:'دور بالكلمة...', category:'اكتب اسم الفئة...', brand:'دور بالبراند...' };
  document.getElementById('search-input').placeholder = placeholders[type] || placeholders.name;
}

function fuzzyMatch(text, query) {
  text = text.toLowerCase();
  query = query.toLowerCase();
  if (text.includes(query)) return true;
  let qi = 0;
  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) qi++;
  }
  return qi === query.length;
}

function searchScore(b, q) {
  const qLow = q.toLowerCase();
  const words = qLow.split(/\s+/).filter(Boolean);
  let score = 0;
  const nameAr = (b.nameAr || '').toLowerCase();
  const nameEn = (b.nameEn || '').toLowerCase();
  const cat = (b.categoryNameAr || '').toLowerCase();
  const city = (b.location?.city || '').toLowerCase();
  const district = (b.location?.district || '').toLowerCase();
  const addr = (b.location?.address || '').toLowerCase();
  const desc = (b.description || '').toLowerCase();
  const kw = (b.keywords || []).join(' ').toLowerCase();
  const br = (b.brands || []).join(' ').toLowerCase();

  if (nameAr === qLow || nameEn === qLow) score += 1000;
  if (nameAr.startsWith(qLow) || nameEn.startsWith(qLow)) score += 500;
  if (nameAr.includes(qLow)) score += 300;
  if (nameEn.includes(qLow)) score += 250;
  if (cat.includes(qLow)) score += 200;
  if (city.includes(qLow)) score += 150;
  if (district.includes(qLow)) score += 120;
  if (addr.includes(qLow)) score += 100;
  if (kw.includes(qLow)) score += 80;
  if (br.includes(qLow)) score += 80;
  if (desc.includes(qLow)) score += 40;

  const allText = [nameAr, nameEn, cat, city, district, addr, desc, kw, br].join(' ');
  const allWordsMatch = words.every(w => allText.includes(w));
  if (allWordsMatch) score += 100;

  // Fuzzy only for name/category (not allText)
  if (score === 0) {
    if (fuzzyMatch(nameAr, qLow) || fuzzyMatch(nameEn, qLow)) score += 50;
    else if (fuzzyMatch(cat, qLow)) score += 30;
  }

  score += (b.rating?.average || 0) * 2;
  score += Math.min((b.views || 0) / 100, 10);

  return score;
}

function performSearch() {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { loadHome(); return; }

  saveSearchHistory(q);
  hideAutocomplete();
  currentPage = 1;
  let approved = businesses.filter(b => b.status === 'approved');
  if (searchLocation) approved = approved.filter(b => b.location?.city === searchLocation);

  let filtered;
  if (searchType === 'category') {
    filtered = approved.filter(b => {
      const cat = (b.categoryNameAr || '').toLowerCase();
      return cat.includes(q.toLowerCase()) || fuzzyMatch(cat, q);
    });
  } else if (searchType === 'brand') {
    filtered = approved.filter(b => {
      const br = (b.brands || []).join(' ').toLowerCase();
      return br.includes(q.toLowerCase()) || fuzzyMatch(br, q);
    });
  } else if (searchType === 'keyword') {
    filtered = approved.filter(b => {
      const kw = (b.keywords || []).join(' ').toLowerCase();
      const desc = (b.description || '').toLowerCase();
      return kw.includes(q.toLowerCase()) || desc.includes(q.toLowerCase()) || fuzzyMatch(kw, q);
    });
  } else {
    filtered = approved.map(b => ({ biz: b, score: searchScore(b, q) })).filter(r => r.score > 0).sort((a, b) => b.score - a.score).map(r => r.biz);
  }

  showPage('businesses');
  updateNavActive('businesses');
  if (filtered.length) {
    renderBusinessesTo(filtered, document.getElementById('all-businesses-grid'));
  } else {
    document.getElementById('all-businesses-grid').innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-search-line"></i></div><h3>مفيش نتائج لـ "' + q + '"' + (searchLocation ? ' في ' + searchLocation : '') + '</h3><p>جرّب كلمات تانية أو شوف الفئات</p><button onclick="navigateTo(\'categories\')" class="mt-4 px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"><i class="ri-apps-line ml-1"></i> شوف الفئات</button></div>';
  }
  document.title = 'نتائج بحث: ' + q + (searchLocation ? ' في ' + searchLocation : '') + ' | سِكّة';
}

function quickSearch(term) {
  document.getElementById('search-input').value = term;
  navigateTo('businesses');
  setTimeout(() => performSearch(), 100);
}

function renderSearchAutocomplete(query) {
  const container = document.getElementById('search-autocomplete');
  if (!container) return;
  if (!query || query.length < 1) { renderSearchSuggestions(); return; }

  let approved = businesses.filter(b => b.status === 'approved');
  if (searchLocation) approved = approved.filter(b => b.location?.city === searchLocation);
  const q = query.toLowerCase();

  const bizResults = approved.map(b => ({ biz: b, score: searchScore(b, q) })).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(r => r.biz);
  const catResults = CATEGORIES.filter(c => c.name.toLowerCase().includes(q) || fuzzyMatch(c.name, q)).slice(0, 3);
  const cityResults = CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 3);

  let html = '';

  if (bizResults.length) {
    html += '<div class="search-section-label">الأعمال</div>';
    html += bizResults.map(b => {
      const style = getCategoryStyle(b.categoryNameAr);
      const isOpen = checkIfOpen(b.workingHours);
      return '<div class="autocomplete-item" onclick="openBusiness(\'' + b.id + '\');hideAutocomplete()">' +
        '<div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:' + style.bg + '"><span style="font-size:1.15rem">' + style.emoji + '</span></div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="font-bold text-sm truncate">' + highlightText(b.nameAr || b.name, query) + '</div>' +
          '<div class="text-xs text-gray-500 flex items-center gap-1">' + highlightText(b.categoryNameAr || '', query) + ' <span class="text-gray-300">·</span> ' + (b.location?.city || '') +
          (isOpen !== null ? ' <span class="' + (isOpen ? 'text-emerald-500' : 'text-red-400') + '">' + (isOpen ? '● مفتوح' : '● مقفل') + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="text-xs text-amber-500 flex items-center gap-0.5 flex-shrink-0"><i class="ri-star-fill"></i> ' + (b.rating?.average || 0).toFixed(1) + '</div>' +
      '</div>';
    }).join('');
  }

  if (catResults.length) {
    html += '<div class="search-section-label">الفئات</div>';
    html += catResults.map(c => {
      const style = getCategoryStyle(c.name);
      return '<div class="autocomplete-item" onclick="quickSearch(\'' + c.name + '\');hideAutocomplete()">' +
        '<div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background:' + style.bg + '"><span style="font-size:1.15rem">' + style.emoji + '</span></div>' +
        '<div class="flex-1 min-w-0"><div class="font-bold text-sm">' + highlightText(c.name, query) + '</div><div class="text-xs text-gray-500">' + c.desc + '</div></div>' +
      '</div>';
    }).join('');
  }

  if (cityResults.length) {
    html += '<div class="search-section-label">المحافظات</div>';
    html += cityResults.map(c => {
      const count = approved.filter(b => b.location?.city === c).length;
      return '<div class="autocomplete-item" onclick="quickSearch(\'' + c + '\');hideAutocomplete()">' +
        '<div class="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 flex-shrink-0"><i class="ri-map-pin-2-fill text-blue-500"></i></div>' +
        '<div class="flex-1 min-w-0"><div class="font-bold text-sm">' + highlightText(c, query) + '</div><div class="text-xs text-gray-500">' + count + ' عمل متاح</div></div>' +
      '</div>';
    }).join('');
  }

  if (!bizResults.length && !catResults.length && !cityResults.length) {
    html = '<div class="search-empty-state"><i class="ri-emotion-sad-line"></i><p class="text-sm">مفيش نتائج لـ "' + query + '"</p><p class="text-xs mt-1">جرّب كلمات تانية</p></div>';
  }

  const recent = searchHistory.slice(0, 3);
  if (recent.length && bizResults.length) {
    html += '<div class="search-section-label" style="border-top:1px solid #f1f5f9;padding-top:8px;margin-top:4px">آخر عمليات البحث</div>';
    html += recent.map(s => '<div class="autocomplete-item" onclick="document.getElementById(\'search-input\').value=\'' + s + '\';performSearch();hideAutocomplete()"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0"><i class="ri-history-line text-gray-400 text-sm"></i></div><span class="text-gray-500 text-sm">' + s + '</span></div>').join('');
  }

  container.innerHTML = html;
  container.classList.remove('hidden');
}

function renderSearchSuggestions() {
  const container = document.getElementById('search-autocomplete');
  if (!container) return;

  let html = '';

  if (searchLocation) {
    html += '<div class="search-section-label" style="display:flex;align-items:center;gap:6px"><i class="ri-map-pin-2-fill text-blue-500"></i> بحث في: ' + searchLocation + ' <button class="text-xs text-red-400 hover:text-red-600 mr-auto" onclick="selectSearchLocation(\'\')">إلغاء</button></div>';
  }

  const recent = searchHistory.slice(0, 5);
  if (recent.length) {
    html += '<div class="search-section-label"><i class="ri-history-line"></i> آخر عمليات البحث</div>';
    html += recent.map(s => '<div class="autocomplete-item" onclick="document.getElementById(\'search-input\').value=\'' + s + '\';performSearch();hideAutocomplete()"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0"><i class="ri-history-line text-gray-400 text-sm"></i></div><span class="text-gray-600 text-sm">' + s + '</span></div>').join('');
  }

  html += '<div class="search-section-label"><i class="ri-fire-line"></i> الأكثر بحثاً</div>';
  html += '<div class="p-3 flex flex-wrap gap-2">';
  html += POPULAR_SEARCHES.map(s => '<span class="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-xs font-medium text-gray-600 cursor-pointer transition-all" onclick="document.getElementById(\'search-input\').value=\'' + s + '\';performSearch();hideAutocomplete()">' + s + '</span>').join('');
  html += '</div>';

  container.innerHTML = html;
  container.classList.remove('hidden');
}

function hideAutocomplete() {
  document.getElementById('search-autocomplete')?.classList.add('hidden');
}

function saveSearchHistory(query) {
  if (!query) return;
  searchHistory = searchHistory.filter(r => r !== query);
  searchHistory.unshift(query);
  searchHistory = searchHistory.slice(0, 10);
  localStorage.setItem('sikka_search_history', JSON.stringify(searchHistory));
}

function clearSearchHistory() {
  searchHistory = [];
  localStorage.removeItem('sikka_search_history');
  hideAutocomplete();
}

let voiceRecognition = null;

function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    showToast('البحث الصوتي مش متاح في المتصفح ده', 'error');
    return;
  }
  const modal = document.getElementById('voice-modal');
  const micCircle = document.getElementById('voice-mic-circle');
  const waves = document.getElementById('voice-waves');
  const status = document.getElementById('voice-status');
  const hint = document.getElementById('voice-hint');
  const result = document.getElementById('voice-result');
  const resultText = document.getElementById('voice-result-text');
  if (!modal) return;

  modal.classList.remove('hidden');
  micCircle.classList.add('listening');
  waves.querySelectorAll('.voice-wave').forEach(w => w.classList.add('active'));
  status.textContent = 'اسمع.. اتكلّم دلوقتي';
  hint.textContent = 'قول اسم الشغل أو الفئة اللي بتدور عليها';
  result.classList.add('hidden');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.lang = 'ar-EG';
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = true;

  voiceRecognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const isFinal = event.results[0].isFinal;
    result.classList.remove('hidden');
    resultText.textContent = text;
    if (isFinal) {
      status.textContent = 'تم التعرف!';
      hint.textContent = 'جاري البحث...';
      document.getElementById('search-input').value = text;
      setTimeout(() => { stopVoiceSearch(); performSearch(); }, 600);
    } else {
      status.textContent = 'اسمعك...';
      hint.textContent = '';
    }
  };

  voiceRecognition.onerror = (e) => {
    if (e.error === 'no-speech') {
      status.textContent = 'مسمعتش حاجة';
      hint.textContent = 'جرّب تاني وقول بصوت واضح';
    } else {
      status.textContent = 'حصل مشكلة';
      hint.textContent = 'جرّب تاني';
    }
    micCircle.classList.remove('listening');
    waves.querySelectorAll('.voice-wave').forEach(w => w.classList.remove('active'));
    setTimeout(() => stopVoiceSearch(), 1500);
  };

  voiceRecognition.onend = () => {
    micCircle.classList.remove('listening');
    waves.querySelectorAll('.voice-wave').forEach(w => w.classList.remove('active'));
  };

  voiceRecognition.start();
}

function stopVoiceSearch() {
  const modal = document.getElementById('voice-modal');
  if (voiceRecognition) { try { voiceRecognition.stop(); } catch(e){} voiceRecognition = null; }
  if (modal) modal.classList.add('hidden');
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
  renderLastVisited(approved);
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
  const isOpen = checkIfOpen(b.workingHours);

  return `
    <div class="biz-card" onclick="openBusiness('${b.id}')" data-aos="fade-up" data-aos-delay="${i * 40}">
      <div class="biz-card-img" style="background:${style.bg}">
        <div style="font-size:2.8rem;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15))">${style.emoji}</div>
        <span class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${isOpen ? 'bg-emerald-50/90 text-emerald-600' : 'bg-red-50/90 text-red-500'}" style="border:1px solid ${isOpen ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}">
          <span class="w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse"></span>
          ${isOpen ? 'مفتوح' : 'مقفول'}
        </span>
        ${b.isVerified ? '<span class="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-50/90 text-amber-600 rounded-full text-xs font-semibold backdrop-blur-sm" style="border:1px solid rgba(245,158,11,0.2)"><i class="ri-verified-badge-fill"></i> موثق</span>' : ''}
      </div>
      <div class="biz-card-body">
        <div class="biz-card-name">${b.nameAr || b.name}</div>
        <div class="biz-card-cat" style="display:flex;align-items:center;gap:4px">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${style.bg};flex-shrink:0"></span>
          ${b.categoryNameAr || ''}
        </div>
        <div class="biz-card-info">
          ${b.location?.city ? `<span><i class="ri-map-pin-2-line"></i> ${b.location.city}${b.location.district ? ' — ' + b.location.district : ''}</span>` : ''}
        </div>
      </div>
      <div class="biz-card-footer">
        <div class="biz-rating"><i class="ri-star-fill"></i> ${rating > 0 ? rating.toFixed(1) : '—'} <span>(${totalReviews})</span></div>
        ${b.products?.length ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;color:#64748b;background:#f8fafc;padding:4px 10px;border-radius:20px"><i class="ri-shopping-bag-3-line"></i>${b.products.length} منتج</span>` : ''}
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

function renderLastVisited(approved) {
  const section = document.getElementById('last-visited-section');
  const grid = document.getElementById('last-visited-grid');
  if (!section || !grid) return;
  const lastVisited = getLastVisited();
  if (!lastVisited.length) { section.style.display = 'none'; return; }
  const lastBiz = lastVisited.map(id => approved.find(b => b.id === id)).filter(Boolean).slice(0, 5);
  if (!lastBiz.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  grid.innerHTML = lastBiz.map((b, i) => {
    const style = getCategoryStyle(b.categoryNameAr);
    return `
      <div class="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onclick="openBusiness('${b.id}')" data-aos="fade-up" data-aos-delay="${i * 50}">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${style.bg}">
            <span style="font-size:1.2rem">${style.emoji}</span>
          </div>
          <div class="min-w-0">
            <div class="font-bold text-sm truncate">${b.nameAr || b.name}</div>
            <div class="text-xs text-gray-400">${b.categoryNameAr || ''}</div>
            <div class="flex items-center gap-1 mt-0.5"><i class="ri-star-fill text-amber-400 text-xs"></i><span class="text-xs text-gray-500">${(b.rating?.average || 0).toFixed(1)}</span></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== BUSINESSES PAGE ====================
let yelpFilters = { prices: [], tags: [], category: '' };
let yelpSearchMap = null;

function loadAllBusinesses() {
  const approved = businesses.filter(b => b.status === 'approved');
  renderYelpCategoryFilters(approved);
  applyYelpFilters();
  initYelpSearchMap(approved);
}

function renderYelpCategoryFilters(list) {
  const cats = [...new Set(list.map(b => b.categoryNameAr).filter(Boolean))].sort();
  const container = document.getElementById('yelp-category-filters');
  const moreBtn = document.getElementById('yelp-cat-more');
  if (!container) return;
  const show = cats.slice(0, 6);
  const rest = cats.slice(6);
  container.innerHTML = show.map(c => `<button class="yelp-tag-btn" onclick="toggleCategoryFilter(this, '${c}')">${c}</button>`).join('') + (rest.length ? `<span class="yelp-tag-more" data-rest='${JSON.stringify(rest)}' style="display:none"></span>` : '');
  if (moreBtn) moreBtn.style.display = rest.length ? '' : 'none';
}

function toggleAllCategories() {
  const more = document.querySelector('.yelp-tag-more');
  const container = document.getElementById('yelp-category-filters');
  if (!more || !container) return;
  const rest = JSON.parse(more.dataset.rest || '[]');
  rest.forEach(c => { container.innerHTML += `<button class="yelp-tag-btn" onclick="toggleCategoryFilter(this, '${c}')">${c}</button>`; });
  document.getElementById('yelp-cat-more').style.display = 'none';
}

function togglePriceFilter(btn) {
  const p = btn.dataset.price;
  btn.classList.toggle('active');
  if (yelpFilters.prices.includes(p)) yelpFilters.prices = yelpFilters.prices.filter(x => x !== p);
  else yelpFilters.prices.push(p);
  applyYelpFilters();
}

function toggleTagFilter(btn, tag) {
  btn.classList.toggle('active');
  if (yelpFilters.tags.includes(tag)) yelpFilters.tags = yelpFilters.tags.filter(x => x !== tag);
  else yelpFilters.tags.push(tag);
  applyYelpFilters();
}

function toggleCategoryFilter(btn, cat) {
  document.querySelectorAll('#yelp-category-filters .yelp-tag-btn').forEach(b => b.classList.remove('active'));
  if (yelpFilters.category === cat) { yelpFilters.category = ''; }
  else { btn.classList.add('active'); yelpFilters.category = cat; }
  applyYelpFilters();
}

function setYelpSort(btn, val) {
  document.querySelectorAll('.yelp-sort-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('yelp-sort-select').value = val;
  applyYelpFilters();
}

function clearYelpFilters() {
  yelpFilters = { prices: [], tags: [], category: '' };
  document.querySelectorAll('.yelp-price-btn, .yelp-tag-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#yelp-filters input[type=checkbox]').forEach(c => c.checked = false);
  document.getElementById('yelp-sort-select').value = 'relevance';
  applyYelpFilters();
}

function applyYelpFilters() {
  let filtered = businesses.filter(b => b.status === 'approved');

  // Price filter
  if (yelpFilters.prices.length) filtered = filtered.filter(b => yelpFilters.prices.includes(b.priceLevel));

  // Category filter
  if (yelpFilters.category) filtered = filtered.filter(b => b.categoryNameAr === yelpFilters.category);

  // Checkbox filters
  document.querySelectorAll('#yelp-filters input[type=checkbox]:checked').forEach(cb => {
    const f = cb.dataset.filter;
    if (f === 'openNow') filtered = filtered.filter(b => checkIfOpen(b.workingHours) === true);
    if (f === 'hasBooking') filtered = filtered.filter(b => b.hasBooking || b.products?.length);
    if (f === 'hasDelivery') filtered = filtered.filter(b => b.hasDelivery);
    if (f === 'hasTakeaway') filtered = filtered.filter(b => b.hasTakeaway);
    if (f === 'isVerified') filtered = filtered.filter(b => b.isVerified);
    if (f === 'hasOutdoor') filtered = filtered.filter(b => b.features?.includes('outdoor'));
    if (f === 'goodForFamilies') filtered = filtered.filter(b => b.features?.includes('family'));
    if (f === 'hasWifi') filtered = filtered.filter(b => b.features?.includes('wifi'));
    if (f === 'hasParking') filtered = filtered.filter(b => b.features?.includes('parking'));
  });

  // Tag filters (dietary)
  if (yelpFilters.tags.length) filtered = filtered.filter(b => yelpFilters.tags.some(t => (b.keywords || []).includes(t) || (b.tags || []).includes(t)));

  // Sort
  const sort = document.getElementById('yelp-sort-select')?.value || 'relevance';
  if (sort === 'rating') filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
  else if (sort === 'reviews') filtered.sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0));
  else if (sort === 'alpha') filtered.sort((a, b) => (a.nameAr || '').localeCompare(b.nameAr || '', 'ar'));
  else if (sort === 'views') filtered.sort((a, b) => (b.views || 0) - (a.views || 0));

  const container = document.getElementById('all-businesses-grid');
  const countEl = document.getElementById('businesses-count');
  const titleEl = document.getElementById('yelp-results-title');
  if (countEl) countEl.textContent = filtered.length + ' نتيجة';
  if (titleEl && yelpFilters.category) titleEl.textContent = yelpFilters.category;
  else if (titleEl) titleEl.textContent = 'كل الأعمال';

  renderYelpResults(filtered, container);
  updateYelpMapMarkers(filtered);
}

function renderYelpResults(list, container) {
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<div class="yelp-empty-state"><div class="yelp-empty-icon"><i class="ri-search-line"></i></div><h3>مفيش نتائج</h3><p>جرّب تغيير الفلتر أو كلمات البحث</p></div>`;
    return;
  }
  container.innerHTML = list.map((b, i) => renderYelpResultCard(b, i)).join('');
}

function renderYelpResultCard(b, i) {
  const rating = b.rating?.average || 0;
  const reviewCount = b.rating?.count || 0;
  const bizReviews = reviews[b.id] || [];
  const totalReviews = reviewCount + bizReviews.length;
  const style = getCategoryStyle(b.categoryNameAr);
  const isOpen = checkIfOpen(b.workingHours);
  const photos = b.photos || [];
  const firstReview = bizReviews[0];
  const topProducts = (b.products || []).slice(0, 2);

  let reviewSnippet = '';
  if (firstReview && firstReview.comment) {
    const text = firstReview.comment.length > 120 ? firstReview.comment.substring(0, 120) + '...' : firstReview.comment;
    reviewSnippet = `<div class="yelp-card-review"><i class="ri-double-quotes-l"></i> "${text}"</div>`;
  }

  const tagsHtml = (b.keywords || []).slice(0, 3).map(k => `<span class="yelp-card-tag">${k}</span>`).join('');

  return `
    <div class="yelp-result-card" onclick="openBusiness('${b.id}')" data-aos="fade-up" data-aos-delay="${Math.min(i * 30, 150)}">
      <div class="yelp-card-photos">
        ${photos.length ? photos.slice(0, 3).map(p => `<img src="${p}" onerror="this.style.display='none'" alt="">`).join('') : `<div class="yelp-card-photo-placeholder" style="background:${style.bg}"><span>${style.emoji}</span></div>`}
        ${photos.length > 3 ? `<div class="yelp-card-more-photos">+${photos.length - 3}</div>` : ''}
      </div>
      <div class="yelp-card-body">
        <div class="yelp-card-head">
          <h3 class="yelp-card-name">${b.nameAr || b.name}</h3>
          <div class="yelp-card-rating">
            <div class="yelp-stars-sm">${Array.from({length:5}, (_, j) => `<i class="ri-star-${j < Math.round(rating) ? 'fill' : 'line'}"></i>`).join('')}</div>
            <span class="yelp-card-rating-num">${rating > 0 ? rating.toFixed(1) : ''}</span>
            <span class="yelp-card-review-count">(${totalReviews})</span>
          </div>
        </div>
        <div class="yelp-card-meta">
          ${b.priceLevel ? `<span class="yelp-card-price">${b.priceLevel}</span><span class="yelp-card-dot">·</span>` : ''}
          ${b.location?.city ? `<span class="yelp-card-location"><i class="ri-map-pin-2-line"></i> ${b.location.city}${b.location.district ? ' — ' + b.location.district : ''}</span><span class="yelp-card-dot">·</span>` : ''}
          <span class="yelp-card-status ${isOpen ? 'open' : 'closed'}"><span class="yelp-status-dot"></span>${isOpen ? 'مفتوح' : 'مقفول'}</span>
        </div>
        ${b.categoryNameAr ? `<div class="yelp-card-category"><i class="${style.emoji === '🛒' ? 'ri-shopping-bag-line' : style.emoji === '🍽️' ? 'ri-restaurant-line' : style.emoji === '☕' ? 'ri-cup-line' : 'ri-store-2-line'}"></i> ${b.categoryNameAr}</div>` : ''}
        ${reviewSnippet}
        <div class="yelp-card-tags">${tagsHtml}</div>
        ${topProducts.length ? `<div class="yelp-card-products">${topProducts.map(p => `<span class="yelp-card-product"><span class="yelp-card-product-emoji">📦</span>${p.name}${p.price ? ' · ' + p.price + ' ج' : ''}</span>`).join('')}</div>` : ''}
      </div>
    </div>
  `;
}

// ==================== YELP SEARCH MAP ====================
function initYelpSearchMap(list) {
  setTimeout(() => {
    const mapEl = document.getElementById('yelp-search-map');
    if (!mapEl || yelpSearchMap) return;
    try {
      yelpSearchMap = L.map('yelp-search-map', { zoomControl: false }).setView([30.0444, 31.2357], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(yelpSearchMap);
      L.control.zoom({ position: 'bottomleft' }).addTo(yelpSearchMap);
      updateYelpMapMarkers(list);
    } catch(e) {}
  }, 300);
}

function updateYelpMapMarkers(list) {
  if (!yelpSearchMap) return;
  yelpSearchMap.eachLayer(l => { if (l instanceof L.Marker) yelpSearchMap.removeLayer(l); });
  const located = list.filter(b => b.location?.lat && b.location?.lng);
  if (!located.length) return;
  located.forEach(b => {
    const style = getCategoryStyle(b.categoryNameAr);
    const icon = L.divIcon({
      className: 'yelp-map-marker',
      html: `<div class="yelp-marker-pin" style="background:#d32323">${style.emoji}</div>`,
      iconSize: [32, 36],
      iconAnchor: [16, 36]
    });
    L.marker([b.location.lat, b.location.lng], { icon }).addTo(yelpSearchMap)
      .bindPopup(`<div style="font-weight:700;font-size:0.85rem">${b.nameAr || b.name}</div><div style="font-size:0.75rem;color:#666">${b.categoryNameAr || ''}</div>`);
  });
  if (located.length === 1) yelpSearchMap.setView([located[0].location.lat, located[0].location.lng], 14);
  else {
    const bounds = L.latLngBounds(located.map(b => [b.location.lat, b.location.lng]));
    yelpSearchMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }
}

function expandYelpMap() {
  const panel = document.getElementById('yelp-map-panel');
  if (panel) panel.classList.toggle('expanded');
  setTimeout(() => { if (yelpSearchMap) yelpSearchMap.invalidateSize(); }, 300);
}

// Backward compat
function applyFilters() { applyYelpFilters(); }
function renderBusinessesTo(list, container) { renderYelpResults(list, container); }
function populateFilters() {}

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
  const style = getCategoryStyle(b.categoryNameAr);
  const price = b.priceLevel || '$';
  const logoUrl = 'assets/icons/logo.png';

  const photos = b.photos || [];
  let heroHtml = '';
  if (photos.length >= 4) {
    heroHtml = `<div class="yelp-hero"><div class="yelp-hero-main"><img src="${photos[0]}" onerror="this.parentElement.innerHTML='<div class=\\'yelp-hero-placeholder\\' style=\\'background:${style.bg}\\'"><span class="yelp-hero-emoji">${style.emoji}</span><div class="yelp-hero-pattern"></div></div>'"></div><div class="yelp-hero-side">${photos.slice(1,5).map(p => `<img src="${p}" onerror="this.style.display='none'">`).join('')}</div></div>`;
  } else if (photos.length > 0) {
    heroHtml = `<div class="yelp-hero"><div class="yelp-hero-main"><img src="${photos[0]}" onerror="this.parentElement.innerHTML='<div class=\\'yelp-hero-placeholder\\' style=\\'background:${style.bg}\\'"><span class="yelp-hero-emoji">${style.emoji}</span><div class="yelp-hero-pattern"></div></div>'"></div></div>`;
  } else {
    heroHtml = `<div class="yelp-hero"><div class="yelp-hero-placeholder" style="background:${style.bg}"><span class="yelp-hero-emoji">${style.emoji}</span><div class="yelp-hero-pattern"></div></div></div>`;
  }

  heroHtml += `
    <div class="yelp-hero-overlay">
      <div class="yelp-hero-logo"><span class="yelp-hero-logo-emoji">${style.emoji}</span></div>
      <div class="yelp-hero-info">
        <h1 class="yelp-hero-name">${b.nameAr || b.name}</h1>
        <div class="yelp-hero-meta">
          <div class="yelp-hero-stars">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < Math.round(rating) ? 'fill' : 'line'}"></i>`).join('')}</div>
          <span class="yelp-hero-rating">${rating > 0 ? rating.toFixed(1) : '—'}</span>
          <span class="yelp-hero-reviews">(${totalReviews} تقييم)</span>
          ${b.isVerified ? `<span class="yelp-hero-dot"></span><span class="yelp-hero-claimed"><i class="ri-verified-badge-fill"></i> موثق</span>` : ''}
          <span class="yelp-hero-dot"></span>
          <span class="yelp-hero-cat">${price} · ${b.categoryNameAr || ''}</span>
        </div>
        ${isOpen !== null ? `<div class="yelp-hero-status ${isOpen ? 'open' : 'closed'}"><span class="yelp-hero-status-dot"></span>${isOpen ? 'مفتوح' : 'مقفول'} ${hoursText(b.workingHours)}<span class="yelp-hero-hours-link">عرض المواعيد</span></div>` : ''}
      </div>
    </div>
    ${photos.length > 4 ? `<button class="yelp-hero-photos-btn"><i class="ri-camera-line"></i> شوف كل الصور (${photos.length})</button>` : ''}
    <button class="yelp-hero-nav prev" onclick="event.stopPropagation()"><i class="ri-arrow-right-s-line"></i></button>
    <button class="yelp-hero-nav next" onclick="event.stopPropagation()"><i class="ri-arrow-left-s-line"></i></button>
  `;

  const hours = b.workingHours || {};
  const daysOrder = ['saturday','sunday','monday','tuesday','wednesday','thursday','friday'];
  const hoursRows = daysOrder.filter(d => hours[d]).map(d => {
    const isToday = getTodayKey() === d;
    const hourText = hours[d];
    const isOpenNow = hourText.includes('مغلق') ? false : null;
    return `<tr><td>${getDayName(d)}</td><td>${hourText} ${isToday && isOpen !== null ? `<span class="yelp-hours-open-now">(النهارده)</span>` : ''}</td></tr>`;
  }).join('');

  const products = b.products || [];
  let productsHtml = '';
  if (products.length) {
    const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const popularProducts = products.slice(0, 8);
    productsHtml = `
      <div class="yelp-section">
        <div class="yelp-section-header">
          <div class="yelp-section-title">الأكل المفضل <span class="yelp-count">${products.length} منتج</span></div>
          ${products.length > 8 ? `<a class="yelp-section-link" onclick="event.stopPropagation()">شوف كل القائمة ›</a>` : ''}
        </div>
        <div class="yelp-dishes-scroll">
          ${popularProducts.map(p => `
            <div class="yelp-dish-card" onclick="event.stopPropagation()">
              <div class="yelp-dish-img">
                ${p.image ? `<img src="${p.image}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="yelp-dish-fallback" style="display:none">${style.emoji}</div>` : `<div class="yelp-dish-fallback">${getProductEmoji(p.category)}</div>`}
                ${p.price ? `<span class="yelp-dish-price">${p.price} ج.م</span>` : ''}
              </div>
              <div class="yelp-dish-name">${p.name}</div>
              ${p.desc ? `<div class="yelp-dish-meta">${p.desc.substring(0,40)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    if (productCategories.length > 0) {
      productsHtml += `
        <div class="yelp-section">
          <div class="yelp-section-title">المنتجات والخدمات</div>
          <div class="yelp-products">
            ${products.map(p => `
              <div class="yelp-product">
                <div class="yelp-product-img">${p.image ? `<img src="${p.image}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="yelp-product-fallback" style="display:none">📦</div>` : `<div class="yelp-product-fallback">${getProductEmoji(p.category)}</div>`}</div>
                <div class="yelp-product-info">
                  <div class="yelp-product-name">${p.name}</div>
                  ${p.desc ? `<div class="yelp-product-desc">${p.desc}</div>` : ''}
                </div>
                <div class="yelp-product-price">${p.price ? p.price + ' ج.م' : ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  const offers = b.offers || [];
  const offersHtml = offers.length ? `
    <div class="yelp-section">
      <div class="yelp-section-title">العروض <span class="yelp-count">${offers.length}</span></div>
      ${offers.map(o => `
        <div class="yelp-offer">
          <div class="yelp-offer-head"><span class="yelp-offer-title">${o.title}</span>${o.code ? `<span class="yelp-offer-code">${o.code}</span>` : ''}</div>
          ${o.description ? `<div class="yelp-offer-desc">${o.description}</div>` : ''}
          ${o.endDate ? `<div class="yelp-offer-date"><i class="ri-calendar-line"></i> بينتهي: ${o.endDate}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  const keywordsHtml = b.keywords?.length ? `
    <div class="yelp-section">
      <div class="yelp-section-title">الكلمات المفتاحية</div>
      <div class="yelp-also-tags">
        ${b.keywords.map(k => `<a class="yelp-also-tag" onclick="event.stopPropagation();quickSearch('${k}')"><i class="ri-search-line"></i> ${k}</a>`).join('')}
      </div>
    </div>
  ` : '';
  const brandsHtml = b.brands?.length ? `<div class="yelp-section"><div class="yelp-section-title">البراندات</div><div class="yelp-tags">${b.brands.map(br => `<span class="yelp-tag">${br}</span>`).join('')}</div></div>` : '';

  const featureTags = [
    b.hasBooking ? '<span class="yelp-feature-tag"><i class="ri-calendar-check-line"></i> حجز</span>' : '',
    b.hasDelivery ? '<span class="yelp-feature-tag"><i class="ri-road-map-line"></i> توصيل</span>' : '',
    b.hasTakeaway ? '<span class="yelp-feature-tag"><i class="ri-takeaway-line"></i> تيك أواي</span>' : '',
    (b.features || []).includes('wifi') ? '<span class="yelp-feature-tag"><i class="ri-wifi-line"></i> واي فاي</span>' : '',
    (b.features || []).includes('parking') ? '<span class="yelp-feature-tag"><i class="ri-parking-box-line"></i> جراج</span>' : '',
    (b.features || []).includes('outdoor') ? '<span class="yelp-feature-tag"><i class="ri-plant-line"></i> تراس</span>' : '',
    (b.features || []).includes('family') ? '<span class="yelp-feature-tag"><i class="ri-parent-line"></i> مناسب للعائلات</span>' : '',
  ].filter(Boolean).join('');

  const vibeCategories = [
    { label: 'الجو العام', emoji: style.emoji, count: photos.length || 0 },
    { label: 'المنتجات', emoji: '🍽️', count: products.length },
    { label: 'كل الصور', emoji: '📷', count: photos.length || 0 },
  ];

  const vibeHtml = `
    <div class="yelp-section">
      <div class="yelp-section-title">إيه الفيب بتاعه؟</div>
      <div class="yelp-vibe-grid">
        ${vibeCategories.map(v => `
          <div class="yelp-vibe-card">
            <div class="yelp-vibe-img"><span class="yelp-vibe-emoji">${v.emoji}</span></div>
            <div class="yelp-vibe-label">${v.label}</div>
            <div class="yelp-vibe-count">${v.count} صوره</div>
          </div>
        `).join('')}
      </div>
      ${featureTags ? `<div class="yelp-feature-tags">${featureTags}</div>` : ''}
    </div>
  `;

  const alsoSearchedHtml = b.keywords?.length ? `
    <div class="yelp-section">
      <div class="yelp-section-title">الناس كمان بتدور على</div>
      <div class="yelp-also-tags">
        ${b.keywords.slice(0, 5).map(k => `<a class="yelp-also-tag" onclick="event.stopPropagation();quickSearch('${k}')"><i class="ri-search-line"></i> ${k}</a>`).join('')}
      </div>
    </div>
  ` : '';

  const locationHoursHtml = (b.location?.address || b.location?.city) ? `
    <div class="yelp-section">
      <div class="yelp-section-header">
        <div class="yelp-section-title">المكان والمواعيد</div>
        <a class="yelp-section-link" onclick="event.stopPropagation()"><i class="ri-edit-line" style="margin-left:4px"></i> اقترح تعديل</a>
      </div>
      <div class="yelp-loc-grid">
        <div>
          ${b.location?.lat && b.location?.lng ? `<div id="detail-map" class="yelp-loc-map"></div>` : ''}
          ${b.location?.address ? `<div class="yelp-loc-address">${b.location.address}${b.location.district ? '، ' + b.location.district : ''}</div>` : ''}
          ${b.location?.city ? `<div style="font-size:0.78rem;color:#666;margin-top:2px">${b.location.city}</div>` : ''}
          ${b.location?.lat && b.location?.lng ? `<a href="https://www.google.com/maps?q=${b.location.lat},${b.location.lng}" target="_blank" class="yelp-loc-directions"><i class="ri-directions-line"></i> التعديل</a>` : ''}
        </div>
        <div>
          ${hoursRows ? `<table class="yelp-hours-table"><tbody>${hoursRows}</tbody></table>` : ''}
        </div>
      </div>
      ${isOpen !== null ? `<div class="yelp-status ${isOpen ? 'open' : 'closed'}" style="margin-top:10px"><span class="yelp-status-dot"></span>${isOpen ? 'مفتوح دلوقتي' : 'مقفول'}</div>` : ''}
    </div>
  ` : '';

  const descHtml = b.description ? `
    <div class="yelp-section">
      <div class="yelp-section-title">عن الشغل</div>
      <p class="yelp-biz-desc">${b.description.length > 200 ? b.description.substring(0, 200) + '...' : b.description}</p>
      ${b.description.length > 200 ? `<button class="yelp-read-more" onclick="this.previousElementSibling.textContent='${b.description.replace(/'/g, "\\'")}';this.remove()">شوف كمان</button>` : ''}
    </div>
  ` : '';

  let ratingBreakdownHtml = '';
  if (bizReviews.length >= 3) {
    const dist = [5,4,3,2,1].map(s => ({ stars: s, count: bizReviews.filter(r => Math.round(r.rating) === s).length }));
    const maxCount = Math.max(...dist.map(d => d.count), 1);
    ratingBreakdownHtml = `
      <div class="yelp-rating-breakdown">
        <div class="yelp-rating-overall">
          <div>
            <div class="yelp-rating-big">${rating > 0 ? rating.toFixed(1) : '—'}</div>
            <div class="yelp-rating-big-stars">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < Math.round(rating) ? 'fill' : 'line'}"></i>`).join('')}</div>
            <div class="yelp-rating-big-count">${totalReviews} تقييم</div>
          </div>
          <div style="flex:1">
            ${dist.map(d => `
              <div class="yelp-rating-bar-row">
                <span class="yelp-rating-bar-label">${d.stars} نجوم</span>
                <div class="yelp-rating-bar-track"><div class="yelp-rating-bar-fill" style="width:${(d.count / maxCount * 100)}%"></div></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  const trustHtml = `
    <div class="yelp-review-trust">
      <i class="ri-information-line"></i>
      <div class="yelp-review-trust-text">
        أمانك عندنا أولوية، Поэтому الشركات مش قادرة تعدل أو تمسح التقييمات.
        <a>اعرف أكتر عن التقييمات.</a>
      </div>
    </div>
  `;

  const reviewFormHtml = `
    <div class="yelp-review-form">
      <div class="yelp-review-form-avatar"><i class="ri-user-3-line"></i></div>
      <div class="yelp-review-form-info">
        <div class="yelp-review-form-name">${currentUser ? currentUser.name || currentUser.email : 'ضيف'}</div>
        <div class="yelp-review-form-stars">
          ${Array.from({length:5}, (_, i) => `<i class="ri-star-line" onclick="openReviewModal('${b.id}')"></i>`).join('')}
        </div>
      </div>
      <a class="yelp-review-form-link" onclick="openReviewModal('${b.id}')">ابدأ تقييمك لـ ${b.nameAr || b.name}</a>
    </div>
  `;

  let reviewsHtml = bizReviews.length ? bizReviews.map(r => `
    <div class="yelp-review">
      <div class="yelp-review-header">
        <div class="yelp-review-avatar">${r.userName[0]}</div>
        <div class="yelp-review-meta">
          <div class="yelp-review-name">${r.userName}</div>
          <div class="yelp-review-date">${r.date}</div>
        </div>
        <div class="yelp-review-stars">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < r.rating ? 'fill' : 'line'}"></i>`).join('')}</div>
      </div>
      ${r.title ? `<div class="yelp-review-title">${r.title}</div>` : ''}
      ${r.comment ? `<div class="yelp-review-text">${r.comment}</div>` : ''}
    </div>
  `).join('') : '<div class="yelp-empty"><i class="ri-chat-smile-3-line"></i><p>مفيش تقييمات لسه</p><span>كون أول واحد يقيّم!</span></div>';

  const sidebarHtml = `
    <div class="yelp-sidebar">
      ${b.contact?.phone ? `<a href="tel:${b.contact.phone}" class="yelp-sidebar-order"><i class="ri-phone-line"></i> اتصل</a>` : ''}
      ${b.contact?.whatsapp ? `<a href="https://wa.me/${b.contact.whatsapp}" target="_blank" class="yelp-sidebar-order" style="background:#25d366;margin-top:8px"><i class="ri-whatsapp-line"></i> واتساب</a>` : ''}

      <div class="yelp-sidebar-promo">
        <div class="yelp-sidebar-promo-icon">🔥</div>
        <div class="yelp-sidebar-promo-text">سجّل شغلك على سِكّة واوصل لآلاف الناس</div>
        <button class="yelp-sidebar-promo-btn" onclick="navigate('add')">سجّل دلوقتي</button>
      </div>

      <div class="yelp-sidebar-links">
        ${b.contact?.website ? `<a href="${b.contact.website}" target="_blank" class="yelp-sidebar-link"><span class="yelp-sidebar-link-text">${b.contact.website.replace(/^https?:\/\//, '')}</span><i class="ri-external-link-line"></i></a>` : ''}
        ${b.contact?.phone ? `<a href="tel:${b.contact.phone}" class="yelp-sidebar-link"><span class="yelp-sidebar-link-text">${b.contact.phone}</span><i class="ri-phone-line"></i></a>` : ''}
        ${b.location?.address || b.location?.city ? `
          <a class="yelp-sidebar-link" ${b.location?.lat && b.location?.lng ? `href="https://www.google.com/maps?q=${b.location.lat},${b.location.lng}" target="_blank"` : ''}>
            <div>
              <div style="font-weight:600;color:#0073bb">الاتجاهات</div>
              <div style="font-size:0.75rem;color:#666;margin-top:2px">${b.location.address || ''}${b.location.city ? ' ' + b.location.city : ''}</div>
            </div>
            <i class="ri-directions-line"></i>
          </a>
        ` : ''}
      </div>

      <button class="yelp-sidebar-edit"><i class="ri-edit-line"></i> اقترح تعديل</button>

      ${bizReviews.length ? `
      <div style="margin-top:16px;border-top:1px solid #eee;padding-top:16px">
        <div style="font-size:0.82rem;font-weight:700;color:#1a1a1a;margin-bottom:10px">ناس كمان شافوا ${b.nameAr || b.name}</div>
        ${bizReviews.slice(0, 2).map(r => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="yelp-review-avatar" style="width:32px;height:32px;font-size:0.7rem">${r.userName[0]}</div>
            <div style="flex:1">
              <div style="font-weight:600;font-size:0.78rem">${r.userName}</div>
              <div style="display:flex;gap:1px;color:#ef4444;font-size:0.7rem">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < r.rating ? 'fill' : 'line'}"></i>`).join('')}</div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  `;

  c.innerHTML = `
    <div class="yelp-page">
      <div class="yelp-topbar" style="position:absolute;top:0;left:0;right:0;z-index:10">
        <button class="yelp-back" onclick="closeDetail()"><i class="ri-arrow-right-line"></i></button>
        <div class="yelp-topbar-actions">
          <button class="yelp-topbar-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${b.id}',this)"><i class="ri-heart-${isFav ? 'fill' : 'line'}"></i></button>
          <button class="yelp-topbar-btn" onclick="openQRModal('${b.id}')"><i class="ri-qr-code-line"></i></button>
          <button class="yelp-topbar-btn" onclick="openReportModal('${b.id}')"><i class="ri-flag-line"></i></button>
        </div>
      </div>

      ${heroHtml}

      <div class="yelp-action-bar">
        <button class="yelp-action-btn primary" onclick="openReviewModal('${b.id}')"><i class="ri-star-line"></i> اكتب تقييم</button>
        <button class="yelp-action-btn" onclick="shareWhatsApp('${b.id}')"><i class="ri-whatsapp-line"></i> شير</button>
        <button class="yelp-action-btn" onclick="openQRModal('${b.id}')"><i class="ri-qr-code-line"></i> QR</button>
        <button class="yelp-action-btn" onclick="shareBusiness('${b.id}')"><i class="ri-share-line"></i> مشاركة</button>
        <button class="yelp-action-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${b.id}',this)" style="${isFav ? 'color:#ef4444;border-color:#ef4444' : ''}"><i class="ri-heart-${isFav ? 'fill' : 'line'}"></i> حفظ</button>
      </div>
      <div class="yelp-action-bar" style="border-bottom:none;padding-top:0">
        <span class="yelp-recommend-row">هل أنصح بالشغل ده؟</span>
        <button class="yelp-recommend-btn" onclick="this.classList.toggle('active')">أيوه</button>
        <button class="yelp-recommend-btn" onclick="this.classList.toggle('active')">لأ</button>
        <button class="yelp-recommend-btn" onclick="this.classList.toggle('active')">ممكن</button>
      </div>

      <div class="yelp-container">
        <div class="yelp-main">
          ${productsHtml}
          ${vibeHtml}
          ${alsoSearchedHtml}
          ${locationHoursHtml}
          ${descHtml}
          ${offersHtml}
          ${keywordsHtml}
          ${brandsHtml}

          <div class="yelp-section">
            <div class="yelp-section-header">
              <div class="yelp-section-title">التقييمات <span class="yelp-count">${totalReviews}</span></div>
            </div>
            ${ratingBreakdownHtml}
            ${trustHtml}
            ${reviewFormHtml}
            <div id="reviews-list">${reviewsHtml}</div>
          </div>
        </div>

        <div class="yelp-aside">
          ${sidebarHtml}
        </div>
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

function getTodayKey() {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  return days[new Date().getDay()];
}

function hoursText(hours) {
  if (!hours) return '';
  const today = getTodayKey();
  const h = hours[today];
  if (!h) return '';
  return h.includes('مغلق') ? '' : h;
}

function getProductEmoji(cat) {
  if (!cat) return '📦';
  const map = {
    'قهوة': '☕', 'مشروبات': '🥤', 'حلويات': '🍰', 'آيس كريم': '🍦',
    'وجبات': '🍽️', 'لحمة': '🥩', 'فراخ': '🍗', 'مأكولات بحرية': '🐟',
    'مشويات': '🔥', 'سناكات': '🍿', 'فواكه': '🍎', 'خضروات': '🥬',
    'أدوية': '💊', 'مستلزمات طبية': '🩺', 'صحة': '❤️',
    'ملابس': '👕', 'أقمشة': '🧵', 'أحذية': '👟',
    'موبيليات': '🛋️', 'أنتريه': '🛋️', 'سرير': '🛏️', 'دولاب': '🗄️', 'مطبخ': '🍳',
    'إلكترونيات': '📱', 'موبايل': '📱', 'تواصل': '📶',
    'بنك': '🏦', 'حساب': '💳', 'قروض': '💰',
    'بقالة': '🛒', 'مواد غذائية': '🛒', 'مشروبات': '🥤',
  };
  return map[cat] || '📦';
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
  if (!hours) return null;
  const now = new Date();
  const dayIndex = now.getDay();
  const dayMap = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const todayKey = dayMap[dayIndex];
  const todayHours = hours[todayKey] || '';
  if (!todayHours || todayHours === 'مغلق') return false;
  const match = todayHours.match(/(\d{1,2}):(\d{2})\s*(ص|م)\s*-\s*(\d{1,2}):(\d{2})\s*(ص|م)/);
  if (!match) return null;
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
  const navList = document.getElementById('dash-nav-list');
  if (!myBiz) {
    if (navList) navList.style.display = 'none';
    document.getElementById('dashboard-content').innerHTML = `
      <div class="max-w-md mx-auto text-center py-20">
        <div class="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <i class="ri-store-2-line text-4xl text-gray-300"></i>
        </div>
        <h2 class="text-xl font-bold mb-2">م عندك شغل متسجل</h2>
        <p class="text-gray-500 mb-6 text-sm">سجّل شغلك عشان يظهر في الدليل ويظهر لك لوحة التحكم</p>
        <button onclick="navigateTo('add')" class="px-6 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all">
          <i class="ri-add-line ml-1"></i> سجّل شغلك دلوقتي
        </button>
      </div>`;
    return;
  }
  if (navList) navList.style.display = '';
  showDashTab('overview');
}

function showDashTab(tab) {
  dashTab = tab;
  const myBiz = businesses.find(b => b.ownerId === currentUser?.id);
  if (!myBiz) { loadDashboard(); return; }

  // Update sidebar active state
  document.querySelectorAll('#page-dashboard .dash-nav-item').forEach(n => {
    n.classList.toggle('active', n.getAttribute('data-tab') === tab);
  });

  // Update status in sidebar
  const statusEl = document.getElementById('dash-biz-status');
  if (statusEl) {
    const statusMap = { approved: '✅ شغلك معتمد', pending: '⏳ في انتظار الموافقة', rejected: '❌ مرفوض' };
    statusEl.textContent = statusMap[myBiz.status] || '';
  }

  // Notification badge
  const notifBadge = document.getElementById('dash-nav-notif-badge');
  const notifs = JSON.parse(localStorage.getItem('sikka_notifications_' + currentUser.id) || '[]');
  const unread = notifs.filter(n => !n.read).length;
  if (notifBadge) {
    notifBadge.innerHTML = unread ? `<span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> ${unread} إشعار جديد` : '';
  }

  const c = document.getElementById('dashboard-content');
  if (!c) return;

  if (tab === 'overview') renderDashOverview(c, myBiz);
  else if (tab === 'edit') renderDashEdit(c, myBiz);
  else if (tab === 'products') renderDashProducts(c, myBiz);
  else if (tab === 'photos') renderDashPhotos(c, myBiz);
  else if (tab === 'reviews') renderDashReviews(c, myBiz);
  else if (tab === 'offers') renderDashOffers(c, myBiz);
  else if (tab === 'bookings') { c.innerHTML = '<div id="dash-bookings-container"></div>'; if (typeof renderBusinessBookings === 'function') renderBusinessBookings(myBiz.id, document.getElementById('dash-bookings-container')); }
  else if (tab === 'settings') renderDashSettings(c, myBiz);
  else renderDashOverview(c, myBiz);
}

function renderDashOverview(c, b) {
  const style = getCategoryStyle(b.categoryNameAr);
  const bizReviews = reviews[b.id] || [];
  const rating = b.rating?.average || 0;
  const totalReviews = (b.rating?.count || 0) + bizReviews.length;
  const views = b.views || 0;
  const offers = b.offers || [];
  const products = b.products || [];
  const photos = b.photos || [];
  const favorites = JSON.parse(localStorage.getItem('sikka_favorites') || '[]');
  const bizFavs = favorites.filter(f => f === b.id).length;

  const statusColor = b.status === 'approved' ? 'emerald' : b.status === 'pending' ? 'amber' : 'red';
  const statusText = b.status === 'approved' ? 'معتمد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض';
  const statusIcon = b.status === 'approved' ? 'check-double-line' : b.status === 'pending' ? 'time-line' : 'close-circle-line';

  // Last review date
  const lastReview = bizReviews.length ? bizReviews[bizReviews.length - 1] : null;

  c.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">مرحباً بيك في لوحة التحكم</h2>
      <p class="text-gray-500 text-sm">تتابع من هنا كل حاجة عن شغلك</p>
    </div>

    <!-- Status Banner -->
    <div class="dash-status-banner ${statusColor} rounded-2xl p-5 mb-6 flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:${style.bg}">
        <span style="font-size:1.8rem">${style.emoji}</span>
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-lg">${b.nameAr || b.name}</h3>
        <div class="flex items-center gap-2 mt-1">
          <span class="dash-status-badge ${statusColor}"><i class="ri-${statusIcon}"></i> ${statusText}</span>
          <span class="text-sm text-gray-500">${b.categoryNameAr || ''} · ${b.location?.city || ''}</span>
        </div>
      </div>
      <a href="#/business/${b.id}" class="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all backdrop-blur-sm">
        <i class="ri-eye-line"></i> شوف الصفحة
      </a>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="dash-stat-card dash-stat-blue">
        <div class="dash-stat-icon bg-blue-100 text-blue-600"><i class="ri-star-smile-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-blue-700">${rating.toFixed(1)}</div>
          <div class="text-xs text-blue-500/80">${totalReviews} تقييم</div>
        </div>
      </div>
      <div class="dash-stat-card dash-stat-purple">
        <div class="dash-stat-icon bg-purple-100 text-purple-600"><i class="ri-eye-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-purple-700">${views}</div>
          <div class="text-xs text-purple-500/80">مشاهدة</div>
        </div>
      </div>
      <div class="dash-stat-card dash-stat-amber">
        <div class="dash-stat-icon bg-amber-100 text-amber-600"><i class="ri-heart-3-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-amber-700">${bizFavs}</div>
          <div class="text-xs text-amber-500/80">مفضلة</div>
        </div>
      </div>
      <div class="dash-stat-card dash-stat-green">
        <div class="dash-stat-icon bg-green-100 text-green-600"><i class="ri-megaphone-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-green-700">${offers.length}</div>
          <div class="text-xs text-green-500/80">عرض نشط</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <button onclick="showDashTab('edit')" class="dash-quick-action">
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-2"><i class="ri-edit-2-line"></i></div>
        <span class="text-xs font-medium text-gray-700">تعديل الشغل</span>
      </button>
      <button onclick="showDashTab('products')" class="dash-quick-action">
        <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-2"><i class="ri-add-circle-line"></i></div>
        <span class="text-xs font-medium text-gray-700">إضافة منتج</span>
      </button>
      <button onclick="showDashTab('photos')" class="dash-quick-action">
        <div class="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 mb-2"><i class="ri-image-add-line"></i></div>
        <span class="text-xs font-medium text-gray-700">إضافة صور</span>
      </button>
      <button onclick="showDashTab('offers')" class="dash-quick-action">
        <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 mb-2"><i class="ri-megaphone-line"></i></div>
        <span class="text-xs font-medium text-gray-700">نشر عرض</span>
      </button>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Business Info Card -->
      <div class="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
        <h3 class="font-bold text-sm mb-4 flex items-center gap-2">
          <i class="ri-information-line text-gray-400"></i> معلومات الشغل
        </h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><i class="ri-map-pin-line text-sm"></i></div>
            <div>
              <div class="text-xs text-gray-400">الموقع</div>
              <div class="text-sm font-medium">${b.location?.city || ''} ${b.location?.district ? '· ' + b.location.district : ''}</div>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><i class="ri-phone-line text-sm"></i></div>
            <div>
              <div class="text-xs text-gray-400">التليفون</div>
              <div class="text-sm font-medium">${b.contact?.phone || 'م اتضاف'}</div>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><i class="ri-time-line text-sm"></i></div>
            <div>
              <div class="text-xs text-gray-400">المواعيد</div>
              <div class="text-sm font-medium">${b.workingHours?.saturday || 'م اتضافت المواعيد'}</div>
            </div>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl">
            <div class="text-xs text-gray-400 mb-1">الوصف</div>
            <p class="text-sm text-gray-600 leading-relaxed">${b.description || 'م اتضاف وصف لسه'}</p>
          </div>
        </div>
      </div>

      <!-- Activity Card -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 class="font-bold text-sm mb-4 flex items-center gap-2">
          <i class="ri-line-chart-line text-gray-400"></i> النشاط
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">المنتجات</span>
            <span class="font-bold text-sm">${products.length}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">الصور</span>
            <span class="font-bold text-sm">${photos.length}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">العروض</span>
            <span class="font-bold text-sm">${offers.length}</span>
          </div>
          <div class="h-px bg-gray-100"></div>
          ${lastReview ? `
          <div>
            <div class="text-xs text-gray-400 mb-2">آخر تقييم</div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">${lastReview.userName[0]}</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">${lastReview.userName}</div>
                <div class="flex gap-0.5">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < lastReview.rating ? 'fill text-amber-400' : 'line text-gray-200'} text-xs"></i>`).join('')}</div>
              </div>
            </div>
          </div>
          ` : '<div class="text-center text-gray-400 text-xs py-2">مفيش تقييمات لسه</div>'}
        </div>
      </div>
    </div>

    <!-- Notifications -->
    ${renderDashNotifications(b.ownerId)}
  `;
}

function renderDashNotifications(ownerId) {
  const notifKey = 'sikka_notifications_' + ownerId;
  const notifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
  const unread = notifs.filter(n => !n.read);
  if (!notifs.length) return '';
  return `
    <div class="bg-white border border-gray-100 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold flex items-center gap-2">
          <i class="ri-notification-3-line text-blue-500"></i> الإشعارات
          ${unread.length ? `<span class="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">${unread.length}</span>` : ''}
        </h3>
        <button onclick="clearNotifications('${ownerId}')" class="text-xs text-gray-400 hover:text-red-500 transition-colors">مسح الكل</button>
      </div>
      <div class="space-y-2">
        ${notifs.slice(0, 5).map(n => `
          <div class="flex items-start gap-3 p-3 rounded-xl ${n.read ? 'bg-gray-50' : 'bg-blue-50/50 border border-blue-100'}">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}">
              <i class="ri-${n.type === 'success' ? 'check-line' : 'close-line'} text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm font-bold">${n.title}</div>
              <div class="text-xs text-gray-500 mt-0.5">${n.message}</div>
              <div class="text-xs text-gray-400 mt-1">${new Date(n.date).toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function clearNotifications(ownerId) {
  localStorage.removeItem('sikka_notifications_' + ownerId);
  loadDashboard();
}

function renderDashEdit(c, b) {
  c.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">تعديل الشغل</h2>
      <p class="text-gray-500 text-sm">عدّل معلومات شغلك وابقى محدّث للزباين</p>
    </div>
    <div class="space-y-6">
      <!-- Basic Info -->
      <div class="dash-section">
        <div class="dash-section-header">
          <div class="dash-section-icon bg-blue-50 text-blue-500"><i class="ri-store-2-line"></i></div>
          <div>
            <h3 class="font-bold text-sm">المعلومات الأساسية</h3>
            <p class="text-xs text-gray-400">اسم الشغل والوصف</p>
          </div>
        </div>
        <div class="dash-section-body">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">اسم الشغل بالعربي</label><input class="form-input" id="de-nameAr" value="${b.nameAr || ''}"></div>
            <div><label class="form-label">اسم الشغل بالإنجليزي</label><input class="form-input" id="de-nameEn" value="${b.nameEn || ''}"></div>
          </div>
          <div><label class="form-label">الوصف</label><textarea class="form-input" id="de-desc" rows="3" placeholder="اكتب وصف مختصر عن شغلك...">${b.description || ''}</textarea></div>
        </div>
      </div>

      <!-- Location -->
      <div class="dash-section">
        <div class="dash-section-header">
          <div class="dash-section-icon bg-green-50 text-green-500"><i class="ri-map-pin-line"></i></div>
          <div>
            <h3 class="font-bold text-sm">الموقع</h3>
            <p class="text-xs text-gray-400">المدينة والعنوان بالتفصيل</p>
          </div>
        </div>
        <div class="dash-section-body">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">المدينة</label><input class="form-input" id="de-city" value="${b.location?.city || ''}"></div>
            <div><label class="form-label">الحي</label><input class="form-input" id="de-district" value="${b.location?.district || ''}"></div>
          </div>
          <div><label class="form-label">العنوان بالتفصيل</label><input class="form-input" id="de-address" value="${b.location?.address || ''}"></div>
        </div>
      </div>

      <!-- Contact -->
      <div class="dash-section">
        <div class="dash-section-header">
          <div class="dash-section-icon bg-purple-50 text-purple-500"><i class="ri-phone-line"></i></div>
          <div>
            <h3 class="font-bold text-sm">التواصل</h3>
            <p class="text-xs text-gray-400">رقم التليفون والواتساب</p>
          </div>
        </div>
        <div class="dash-section-body">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">رقم التليفون</label><input class="form-input" id="de-phone" value="${b.contact?.phone || ''}"></div>
            <div><label class="form-label">واتساب</label><input class="form-input" id="de-whatsapp" value="${b.contact?.whatsapp || ''}"></div>
          </div>
          <div><label class="form-label">الإيميل</label><input class="form-input" id="de-email" value="${b.contact?.email || ''}"></div>
        </div>
      </div>

      <!-- SEO & Keywords -->
      <div class="dash-section">
        <div class="dash-section-header">
          <div class="dash-section-icon bg-amber-50 text-amber-500"><i class="ri-search-eye-line"></i></div>
          <div>
            <h3 class="font-bold text-sm">الكلمات المفتاحية والبراندات</h3>
            <p class="text-xs text-gray-400">يساعدك تظهر في نتائج البحث</p>
          </div>
        </div>
        <div class="dash-section-body">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">الكلمات المفتاحية (افصل بفاصلة)</label><input class="form-input" id="de-keywords" value="${(b.keywords || []).join(', ')}" placeholder="قهوة, اسبريسو, كابتشينو"></div>
            <div><label class="form-label">البراندات (افصل بفاصلة)</label><input class="form-input" id="de-brands" value="${(b.brands || []).join(', ')}" placeholder="Lavazza, Illy"></div>
          </div>
        </div>
      </div>

      <!-- Working Hours -->
      <div class="dash-section">
        <div class="dash-section-header">
          <div class="dash-section-icon bg-orange-50 text-orange-500"><i class="ri-calendar-schedule-line"></i></div>
          <div>
            <h3 class="font-bold text-sm">مواعيد الشغل</h3>
            <p class="text-xs text-gray-400">متى شغلك مفتوح</p>
          </div>
        </div>
        <div class="dash-section-body">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div><label class="form-label">السبت</label><input class="form-input" id="de-sat" value="${b.workingHours?.saturday || ''}" placeholder="9 ص - 10 م"></div>
            <div><label class="form-label">الأحد</label><input class="form-input" id="de-sun" value="${b.workingHours?.sunday || ''}" placeholder="9 ص - 10 م"></div>
            <div><label class="form-label">الاثنين</label><input class="form-input" id="de-mon" value="${b.workingHours?.monday || ''}" placeholder="9 ص - 10 م"></div>
            <div><label class="form-label">الثلاثاء</label><input class="form-input" id="de-tue" value="${b.workingHours?.tuesday || ''}" placeholder="9 ص - 10 م"></div>
            <div><label class="form-label">الأربعاء</label><input class="form-input" id="de-wed" value="${b.workingHours?.wednesday || ''}" placeholder="9 ص - 10 م"></div>
            <div><label class="form-label">الخميس</label><input class="form-input" id="de-thu" value="${b.workingHours?.thursday || ''}" placeholder="9 ص - 10 م"></div>
            <div><label class="form-label">الجمعة</label><input class="form-input" id="de-fri" value="${b.workingHours?.friday || ''}" placeholder="مغلق"></div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button onclick="saveDashEdit('${b.id}')" class="px-8 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all">
          <i class="ri-save-line ml-1"></i> حفظ التعديلات
        </button>
      </div>
    </div>
  `;
}

function saveDashEdit(id) {
  const b = businesses.find(biz => biz.id === id);
  if (!b) return;
  // Security: Only the owner can edit their business
  if (!currentUser || (b.ownerId !== currentUser.id && !currentUser.isAdmin)) {
    showToast('مش مسموح لك بتعديل ده', 'error');
    return;
  }
  b.nameAr = sanitize(document.getElementById('de-nameAr').value);
  b.nameEn = sanitize(document.getElementById('de-nameEn').value);
  b.description = sanitize(document.getElementById('de-desc').value);
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
  saveBizToFirestore(b);
  saveData();
  showToast('تم حفظ التعديلات بنجاح', 'success');
}

// ==================== PRODUCTS ====================
function renderDashProducts(c, b) {
  const products = b.products || [];
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  c.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">المنتجات والخدمات</h2>
      <p class="text-gray-500 text-sm">أضف وعّد منتجاتك وخدماتك للزباين</p>
    </div>

    <!-- Add Product Form -->
    <div class="dash-section mb-6">
      <div class="dash-section-header">
        <div class="dash-section-icon bg-green-50 text-green-500"><i class="ri-add-circle-line"></i></div>
        <div>
          <h3 class="font-bold text-sm">إضافة منتج جديد</h3>
          <p class="text-xs text-gray-400">${products.length} منتج مضاف</p>
        </div>
      </div>
      <div class="dash-section-body">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="form-label">اسم المنتج *</label><input class="form-input" id="prod-name" placeholder="مثال: لاتيه، كابتشينو..."></div>
          <div><label class="form-label">السعر (جنيه)</label><input class="form-input" id="prod-price" type="number" placeholder="45"></div>
          <div><label class="form-label">التصنيف</label><input class="form-input" id="prod-category" placeholder="مثال: قهوة، وجبات، خدمات"></div>
          <div><label class="form-label">رابط الصورة</label><input class="form-input" id="prod-image" placeholder="https://..."></div>
          <div class="sm:col-span-2"><label class="form-label">الوصف</label><input class="form-input" id="prod-desc" placeholder="وصف المنتج"></div>
        </div>
        <div class="mt-4">
          <button onclick="addBizProduct('${b.id}')" class="px-6 py-2.5 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
            <i class="ri-add-line ml-1"></i> إضافة المنتج
          </button>
        </div>
      </div>
    </div>

    <!-- Category Filters -->
    ${cats.length ? `
    <div class="flex flex-wrap gap-2 mb-4">
      <button class="dash-filter-btn active" onclick="filterDashProducts('${b.id}','')">الكل (${products.length})</button>
      ${cats.map(cat => `<button class="dash-filter-btn" onclick="filterDashProducts('${b.id}','${cat}')">${cat} (${products.filter(p => p.category === cat).length})</button>`).join('')}
    </div>
    ` : ''}

    <!-- Products Grid -->
    <div id="dash-products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${products.length ? products.map((p, i) => renderProductCard(p, i, b.id, true)).join('') : `
        <div class="col-span-full text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="ri-shopping-bag-3-line text-3xl text-gray-300"></i>
          </div>
          <h3 class="font-bold text-gray-700 mb-2">مفيش منتجات لسه</h3>
          <p class="text-gray-400 text-sm">أضف منتجاتك أو خدماتك عشان الزباين يعرفوا يشوفوا الأسعار والتفاصيل</p>
        </div>
      `}
    </div>
  `;
}

function renderProductCard(p, i, bizId, editable = false) {
  const categoryColors = {
    'قهوة': '#92400e', 'مشروبات': '#0369a1', 'أكل': '#c2410c', 'ملابس': '#7c3aed',
    ' ELECTRONICS': '#0891b2', ' default': '#475569'
  };
  const catColor = categoryColors[p.category] || categoryColors[' default'];
  return `
    <div class="store-product-card" data-aos="fade-up" data-aos-delay="${Math.min(i * 40, 200)}">
      <div class="store-product-img">
        ${p.image ? `<img src="${p.image}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" alt="${p.name}"><div class="store-product-fallback" style="display:none"><i class="ri-shopping-bag-3-line"></i></div>` : '<div class="store-product-fallback"><i class="ri-shopping-bag-3-line"></i></div>'}
        ${p.category ? `<span class="store-product-cat" style="background:${catColor}">${p.category}</span>` : ''}
        ${editable ? `<button class="store-product-del" onclick="event.stopPropagation();removeBizProduct('${bizId}','${p.id}')" title="حذف"><i class="ri-delete-bin-line"></i></button>` : ''}
      </div>
      <div class="store-product-body">
        <h4 class="store-product-name">${p.name}</h4>
        ${p.desc ? `<p class="store-product-desc">${p.desc}</p>` : ''}
        <div class="store-product-foot">
          ${p.price ? `<span class="store-product-price">${p.price} <small>ج</small></span>` : '<span class="store-product-noprice">السعر عند الاتصال</span>'}
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
  saveBizToFirestore(b);
  saveData();
  showToast('اتضاف المنتج بنجاح', 'success');
  renderDashProducts(document.getElementById('dashboard-content'), b);
}

function removeBizProduct(bizId, prodId) {
  const b = businesses.find(biz => biz.id === bizId);
  if (!b || !b.products) return;
  b.products = b.products.filter(p => p.id !== prodId);
  saveBizToFirestore(b);
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
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">إدارة الصور</h2>
      <p class="text-gray-500 text-sm">أضف صور شغلك عشان يظهر للزباين</p>
    </div>

    <!-- Add Photo Form -->
    <div class="dash-section mb-6">
      <div class="dash-section-header">
        <div class="dash-section-icon bg-pink-50 text-pink-500"><i class="ri-image-add-line"></i></div>
        <div>
          <h3 class="font-bold text-sm">إضافة صورة جديدة</h3>
          <p class="text-xs text-gray-400">${photos.length} صورة مضاف</p>
        </div>
      </div>
      <div class="dash-section-body">
        <label class="form-label">رابط الصورة</label>
        <div class="flex gap-2">
          <input class="form-input flex-1" id="photo-url-input" placeholder="https://example.com/photo.jpg">
          <button onclick="addBizPhoto('${b.id}')" class="px-5 py-2.5 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap text-sm">
            <i class="ri-add-line ml-1"></i> إضافة
          </button>
        </div>
      </div>
    </div>

    <!-- Photos Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" id="photos-grid">
      ${photos.length ? photos.map((p, i) => `
        <div class="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square group">
          <img src="${p}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-gray-400\\'><i class=\\'ri-image-line text-3xl\\'></i></div>'">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button onclick="removeBizPhoto('${b.id}',${i})" class="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      `).join('') : `
        <div class="col-span-full text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="ri-gallery-line text-3xl text-gray-300"></i>
          </div>
          <h3 class="font-bold text-gray-700 mb-2">مفيش صور لسه</h3>
          <p class="text-gray-400 text-sm">أضف صور شغلك عشان يظهر للزباين</p>
        </div>
      `}
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
  saveBizToFirestore(b);
  saveData();
  showToast('اتضافت الصورة', 'success');
  renderDashPhotos(document.getElementById('dashboard-content'), b);
}

function removeBizPhoto(id, idx) {
  const b = businesses.find(biz => biz.id === id);
  if (!b || !b.photos) return;
  b.photos.splice(idx, 1);
  saveBizToFirestore(b);
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
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">التقييمات والمراجعات</h2>
      <p class="text-gray-500 text-sm">شوف الزباين بيقولوا إيه عن شغلك</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="dash-section text-center p-6">
        <div class="text-5xl font-bold text-gray-800 mb-2">${avg.toFixed(1)}</div>
        <div class="flex justify-center gap-1 mb-2">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < Math.round(avg) ? 'fill text-amber-400 text-lg' : 'line text-gray-200 text-lg'}"></i>`).join('')}</div>
        <div class="text-xs text-gray-400">${count} تقييم</div>
      </div>
      <div class="dash-section p-6">
        <div class="text-sm font-bold mb-3">توزيع التقييمات</div>
        ${[5,4,3,2,1].map(s => `<div class="flex items-center gap-2 mb-1.5"><span class="text-xs w-4 text-gray-400">${s}</span><i class="ri-star-fill text-amber-400 text-xs"></i><div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-amber-400 rounded-full transition-all" style="width:${count ? (stars[s-1]/count*100) : 0}%"></div></div><span class="text-xs text-gray-400 w-6">${stars[s-1]}</span></div>`).join('')}
      </div>
      <div class="dash-section text-center p-6 flex flex-col items-center justify-center">
        <div class="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-3"><i class="ri-chat-smile-2-line text-2xl text-orange-500"></i></div>
        <div class="text-3xl font-bold">${bizReviews.length}</div>
        <div class="text-xs text-gray-400">مراجعة مكتوبة</div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-3">
      ${bizReviews.length ? bizReviews.reverse().map(r => `
        <div class="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">${r.userName[0]}</div>
            <div class="flex-1">
              <div class="font-bold text-sm">${r.userName}</div>
              <div class="text-xs text-gray-400">${r.date}</div>
            </div>
            <div class="flex gap-0.5">${Array.from({length:5}, (_, i) => `<i class="ri-star-${i < r.rating ? 'fill text-amber-400' : 'line text-gray-200'}"></i>`).join('')}</div>
          </div>
          ${r.title ? `<div class="font-bold text-sm mb-1">${r.title}</div>` : ''}
          ${r.comment ? `<div class="text-gray-500 text-sm leading-relaxed">${r.comment}</div>` : ''}
        </div>
      `).join('') : `
        <div class="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="ri-star-smile-line text-3xl text-gray-300"></i>
          </div>
          <h3 class="font-bold text-gray-700 mb-2">مفيش تقييمات لسه</h3>
          <p class="text-gray-400 text-sm">التقييمات هتظهر هنا لما الزباين يكتبوا رأيهم</p>
        </div>
      `}
    </div>
  `;
}

function renderDashOffers(c, b) {
  const offers = b.offers || [];
  c.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">العروض والتسويق</h2>
      <p class="text-gray-500 text-sm">اعمل عروض تجذب الزباين وتزود المبيعات</p>
    </div>

    <!-- Add Offer Form -->
    <div class="dash-section mb-6">
      <div class="dash-section-header">
        <div class="dash-section-icon bg-green-50 text-green-500"><i class="ri-megaphone-line"></i></div>
        <div>
          <h3 class="font-bold text-sm">نشر عرض جديد</h3>
          <p class="text-xs text-gray-400">${offers.length} عرض نشط</p>
        </div>
      </div>
      <div class="dash-section-body">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="form-label">عنوان العرض *</label><input class="form-input" id="offer-title" placeholder="خصم 20% على كل القهوة"></div>
          <div><label class="form-label">تاريخ الانتهاء</label><input type="date" class="form-input" id="offer-date"></div>
        </div>
        <div><label class="form-label">وصف العرض</label><textarea class="form-input" id="offer-desc" rows="2" placeholder="تفاصيل العرض..."></textarea></div>
        <div><label class="form-label">كود الخصم (اختياري)</label><input class="form-input" id="offer-code" placeholder="SIKKA20" style="max-width:200px"></div>
        <div class="mt-2">
          <button onclick="addBizOffer('${b.id}')" class="px-6 py-2.5 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
            <i class="ri-megaphone-line ml-1"></i> نشر العرض
          </button>
        </div>
      </div>
    </div>

    <!-- Offers List -->
    <div class="space-y-3">
      ${offers.length ? offers.map((o, i) => `
        <div class="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <i class="ri-megaphone-line text-white text-xl"></i>
            </div>
            <div class="flex-1">
              <h4 class="font-bold">${o.title}</h4>
              ${o.description ? `<p class="text-gray-500 text-sm mt-1 leading-relaxed">${o.description}</p>` : ''}
              <div class="flex flex-wrap items-center gap-3 mt-2">
                ${o.endDate ? `<span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium"><i class="ri-calendar-line ml-1"></i> ينتهي: ${o.endDate}</span>` : ''}
                ${o.code ? `<span class="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg font-mono font-medium">${o.code}</span>` : ''}
              </div>
            </div>
            <button onclick="removeBizOffer('${b.id}',${i})" class="w-9 h-9 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all flex-shrink-0">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      `).join('') : `
        <div class="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="ri-megaphone-line text-3xl text-gray-300"></i>
          </div>
          <h3 class="font-bold text-gray-700 mb-2">مفيش عروض لسه</h3>
          <p class="text-gray-400 text-sm">اعمل عروض تجذب الزباين وتزود المبيعات</p>
        </div>
      `}
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
  saveBizToFirestore(b);
  saveData();
  showToast('اتنشر العرض', 'success');
  renderDashOffers(document.getElementById('dashboard-content'), b);
}

function removeBizOffer(id, idx) {
  const b = businesses.find(biz => biz.id === id);
  if (!b || !b.offers) return;
  b.offers.splice(idx, 1);
  saveBizToFirestore(b);
  saveData();
  showToast('اتحذف العرض', 'success');
  renderDashOffers(document.getElementById('dashboard-content'), b);
}

function renderDashSettings(c, b) {
  c.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">إعدادات الحساب</h2>
      <p class="text-gray-500 text-sm">عدّل معلومات حسابك الشخصي</p>
    </div>

    <!-- Account Info -->
    <div class="dash-section mb-6">
      <div class="dash-section-header">
        <div class="dash-section-icon bg-blue-50 text-blue-500"><i class="ri-user-settings-line"></i></div>
        <div>
          <h3 class="font-bold text-sm">معلومات الحساب</h3>
          <p class="text-xs text-gray-400">بياناتك الشخصية</p>
        </div>
      </div>
      <div class="dash-section-body">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="form-label">الاسم</label><input class="form-input" id="set-name" value="${currentUser.name}"></div>
          <div><label class="form-label">البريد الإلكتروني</label><input class="form-input" id="set-email" value="${currentUser.email}" disabled></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="form-label">المحافظة</label><select class="form-input" id="set-gov"><option value="">اختار المحافظة</option></select></div>
          <div><label class="form-label">المركز/الحي</label><select class="form-input" id="set-center"><option value="">اختار المركز</option></select></div>
        </div>
        <div class="mt-2">
          <button onclick="saveDashSettings()" class="px-6 py-2.5 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm">
            <i class="ri-save-line ml-1"></i> حفظ التعديلات
          </button>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="dash-section border-red-200 bg-red-50/50">
      <div class="dash-section-header">
        <div class="dash-section-icon bg-red-100 text-red-500"><i class="ri-error-warning-line"></i></div>
        <div>
          <h3 class="font-bold text-sm text-red-700">منطقة الخطر</h3>
          <p class="text-xs text-red-400">الإجراءات دي لا رجعة فيها</p>
        </div>
      </div>
      <div class="dash-section-body">
        <p class="text-sm text-red-600 mb-4">حذف الحساب يعني حذف جميع بياناتك نهائياً من الموقع. مفيش رجوع من الإجراء ده.</p>
        <button onclick="deleteDashAccount('${b.id}')" class="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all text-sm">
          <i class="ri-delete-bin-line ml-1"></i> حذف الحساب والشغل
        </button>
      </div>
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
  saveUserToFirestore(currentUser);
  saveData();
  updateAuthUI();
  showToast('اتحفظت المعلومات', 'success');
}

function deleteDashAccount(bizId) {
  if (!confirm('متأكد إنك عايز تمسح حسابك وشغلك؟')) return;
  if (!confirm('تأكيد أخير: الحذف لا رجعة فيه!')) return;
  businesses = businesses.filter(b => b.id !== bizId);
  users = users.filter(u => u.id !== currentUser.id);
  delete reviews[bizId];
  reports = reports.filter(r => r.bizId !== bizId);
  deleteBizFromFirestore(bizId);
  let favs = JSON.parse(localStorage.getItem('sikka_favorites') || '[]');
  favs = favs.filter(f => f !== bizId);
  localStorage.setItem('sikka_favorites', JSON.stringify(favs));
  let lastVis = JSON.parse(localStorage.getItem('sikka_last_visited') || '[]');
  lastVis = lastVis.filter(f => f !== bizId);
  localStorage.setItem('sikka_last_visited', JSON.stringify(lastVis));
  compareList = compareList.filter(c => c !== bizId);
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
  document.getElementById('review-modal').classList.remove('hidden');
}

function closeReviewModal() { document.getElementById('review-modal').classList.add('hidden'); }

function setRating(r) {
  currentRating = r;
  document.querySelectorAll('#star-rating button').forEach((btn, i) => {
    btn.querySelector('i').className = i < r ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300';
  });
}

function submitReview() {
  if (!currentUser) { showAuthModal(); return; }
  if (!currentRating) { showToast('اختار تقييم', 'error'); return; }

  // Security: Rate limiting - prevent duplicate reviews from same user
  if (!reviews[currentReviewBizId]) reviews[currentReviewBizId] = [];
  const alreadyReviewed = reviews[currentReviewBizId].find(r => r.userId === currentUser.id);
  if (alreadyReviewed) {
    showToast('قيّمت الشغل ده قبل كده', 'error');
    closeReviewModal();
    return;
  }

  // Security: Check user is not reviewing their own business
  const biz = businesses.find(b => b.id === currentReviewBizId);
  if (biz && biz.ownerId === currentUser.id) {
    showToast('مش ممكن تقيّم شغلك نفسك', 'error');
    closeReviewModal();
    return;
  }

  const title = sanitize(document.getElementById('review-title')?.value || '');
  const text = sanitize(document.getElementById('review-text')?.value || '');

  reviews[currentReviewBizId].push({
    userId: currentUser.id,
    userName: sanitize(currentUser.name),
    rating: currentRating,
    title,
    comment: text,
    date: new Date().toLocaleDateString('ar-EG')
  });

  // Update average
  const b = businesses.find(biz => biz.id === currentReviewBizId);
  if (b) {
    const allRatings = reviews[currentReviewBizId].map(r => r.rating);
    const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    b.rating = { average: avg, count: allRatings.length };
  }

  saveReviewToFirestore(currentReviewBizId, reviews[currentReviewBizId]);
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
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="p-6 sm:p-8 border-b border-gray-100 text-center">
        <div class="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <i class="ri-store-2-line text-2xl text-white"></i>
        </div>
        <h2 class="text-xl font-bold mb-1">سجّل شغلك</h2>
        <p class="text-gray-500 text-sm">اعمل حساب وابدأ انشر شغلك للزباين</p>
      </div>

      <div class="p-6 sm:p-8 space-y-6">
        <!-- Basic Info Section -->
        <div class="dash-section border-0 bg-gray-50">
          <div class="dash-section-body">
            <h3 class="font-bold text-sm mb-4 flex items-center gap-2"><i class="ri-store-2-line text-gray-400"></i> المعلومات الأساسية</h3>
            <div class="space-y-4">
              <div><label class="form-label">اسم الشغل بالعربي *</label><input type="text" class="form-input" id="biz-name" placeholder="اسم شغلك"></div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label class="form-label">الفئة *</label><select class="form-input" id="biz-category"><option value="">اختار الفئة</option>${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}</select></div>
                <div><label class="form-label">الوصف</label><input type="text" class="form-input" id="biz-description" placeholder="وصف مختصر لشغلك"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location Section -->
        <div class="dash-section border-0 bg-gray-50">
          <div class="dash-section-body">
            <h3 class="font-bold text-sm mb-4 flex items-center gap-2"><i class="ri-map-pin-line text-gray-400"></i> الموقع</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="form-label">المحافظة *</label><select class="form-input" id="biz-city"><option value="">اختار المحافظة</option>${Object.keys(GOVERNORATES).map(g => `<option value="${g}">${g}</option>`).join('')}</select></div>
              <div><label class="form-label">المركز/الحي</label><select class="form-input" id="biz-district" disabled><option value="">اختار المحافظة الأول</option></select></div>
              <div class="sm:col-span-2"><label class="form-label">العنوان بالتفصيل</label><input type="text" class="form-input" id="biz-address" placeholder="شارع، رقم المبنى..."></div>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="dash-section border-0 bg-gray-50">
          <div class="dash-section-body">
            <h3 class="font-bold text-sm mb-4 flex items-center gap-2"><i class="ri-phone-line text-gray-400"></i> بيانات التواصل</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label class="form-label">التليفون *</label><input type="tel" class="form-input" id="biz-phone" placeholder="01XXXXXXXXX"></div>
              <div><label class="form-label">واتساب</label><input type="tel" class="form-input" id="biz-whatsapp" placeholder="201XXXXXXXXX"></div>
              <div><label class="form-label">الإيميل</label><input type="email" class="form-input" id="biz-email" placeholder="email@example.com"></div>
            </div>
          </div>
        </div>

        <!-- SEO & Hours Section -->
        <div class="dash-section border-0 bg-gray-50">
          <div class="dash-section-body">
            <h3 class="font-bold text-sm mb-4 flex items-center gap-2"><i class="ri-search-eye-line text-gray-400"></i> معلومات إضافية</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="form-label">الكلمات المفتاحية (فاصلة)</label><input type="text" class="form-input" id="biz-keywords" placeholder="مقهوة، قهوة، حبوب"></div>
              <div><label class="form-label">البراندات (فاصلة)</label><input type="text" class="form-input" id="biz-brands" placeholder="Starbucks, Costa"></div>
              <div><label class="form-label">مواعيد الشغل (سبت-خميس)</label><input type="text" class="form-input" id="biz-hours-week" placeholder="8:00 ص - 11:00 م"></div>
              <div><label class="form-label">مواعيد الشغل (الجمعة)</label><input type="text" class="form-input" id="biz-hours-fri" placeholder="1:00 م - 11:00 م"></div>
            </div>
          </div>
        </div>

        <!-- Notice -->
        <div class="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"><i class="ri-information-line text-blue-600"></i></div>
            <div>
              <h4 class="font-bold text-blue-800 text-sm">ملاحظة مهمة</h4>
              <p class="text-blue-600 text-xs mt-1 leading-relaxed">طلبك هيتراجع من الإدارة قبل ما يظهر في الدليل. هتتلقى إشعار لما شغلك يتعمله اعتماد. العملية عادة بتاخد 24 ساعة.</p>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex gap-3">
          <button class="flex-1 py-3.5 px-6 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2" onclick="submitBusiness()">
            <i class="ri-send-plane-line"></i> إرسال طلب التسجيل
          </button>
          <button class="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all" onclick="navigateTo('home')">إلغاء</button>
        </div>
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
  const name = document.getElementById('biz-name')?.value?.trim();
  const category = document.getElementById('biz-category')?.value;
  const city = document.getElementById('biz-city')?.value;
  const phone = document.getElementById('biz-phone')?.value?.trim();

  const errors = [];
  if (!name) errors.push('اسم الشغل');
  if (!category) errors.push('الفئة');
  if (!city) errors.push('المحافظة');
  if (!phone) errors.push('رقم التليفون');

  if (errors.length) {
    showToast('اكتب: ' + errors.join('، '), 'error');
    return;
  }

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
    status: 'pending',
    ownerId: currentUser.id,
    userId: currentUser.id,
    userName: currentUser.name,
    isVerified: false,
    photos: [],
    offers: [],
    products: [],
    views: 0,
    createdAt: new Date().toISOString()
  };

  businesses.push(newBiz);
  saveBizToFirestore(newBiz);
  saveData();
  showToast('تم إرسال طلبك! هنراجعه ونبلغك', 'success');
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
  if (!BLOG_POSTS.length) { g.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-article-line"></i></div><h3>مفيش مقالات لسه</h3><p>قريب إن شاء الله</p></div>'; return; }
  const colors = ['from-blue-500 to-cyan-500','from-purple-500 to-pink-500','from-amber-500 to-orange-500','from-emerald-500 to-teal-500','from-rose-500 to-red-500','from-indigo-500 to-blue-500'];
  g.innerHTML = BLOG_POSTS.map((post, i) => `
    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group" onclick="navigateTo('blog/${post.id}')" data-aos="fade-up" data-aos-delay="${i * 50}">
      <div class="h-36 bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center relative overflow-hidden">
        <i class="ri-article-line text-5xl text-white/20 group-hover:scale-110 transition-transform duration-300"></i>
        <span class="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-600 text-xs rounded-lg font-medium">${post.category}</span>
      </div>
      <div class="p-5">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-gray-400"><i class="ri-time-line ml-1"></i>${post.readTime}</span>
          <span class="text-xs text-gray-300">|</span>
          <span class="text-xs text-gray-400">${post.date}</span>
        </div>
        <h3 class="font-bold text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">${post.title}</h3>
        <p class="text-gray-500 text-xs line-clamp-2 mb-3">${post.excerpt}</p>
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <i class="ri-user-3-line"></i> ${post.author}
        </div>
      </div>
    </div>
  `).join('');
  const emptyState = document.getElementById('blog-empty-state');
  if (emptyState) emptyState.style.display = 'none';
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
  if (!currentUser?.isAdmin) { navigateTo('home'); return; }

  const allBiz = businesses;
  const pending = allBiz.filter(b => b.status === 'pending');
  const approved = allBiz.filter(b => b.status === 'approved');
  const rejected = allBiz.filter(b => b.status === 'rejected');
  const totalReviews = Object.values(reviews).flat().length;
  const totalReports = reports.length;

  c.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1">لوحة الإدارة</h2>
      <p class="text-gray-500 text-sm">إدارة جميع الأعمال والمستخدمين</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="dash-stat-card dash-stat-blue">
        <div class="dash-stat-icon bg-blue-100 text-blue-600"><i class="ri-store-2-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-blue-700">${allBiz.length}</div>
          <div class="text-xs text-blue-500/80">إجمالي الأعمال</div>
        </div>
      </div>
      <div class="dash-stat-card dash-stat-green">
        <div class="dash-stat-icon bg-green-100 text-green-600"><i class="ri-check-double-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-green-700">${approved.length}</div>
          <div class="text-xs text-green-500/80">معتمدة</div>
        </div>
      </div>
      <div class="dash-stat-card dash-stat-amber">
        <div class="dash-stat-icon bg-amber-100 text-amber-600"><i class="ri-time-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-amber-700">${pending.length}</div>
          <div class="text-xs text-amber-500/80">قيد المراجعة</div>
        </div>
      </div>
      <div class="dash-stat-card dash-stat-purple">
        <div class="dash-stat-icon bg-purple-100 text-purple-600"><i class="ri-chat-3-line"></i></div>
        <div>
          <div class="text-2xl font-bold text-purple-700">${totalReviews}</div>
          <div class="text-xs text-purple-500/80">تقييم</div>
        </div>
      </div>
      <div class="dash-stat-card" style="border-color:${totalReports ? '#fecaca' : '#f3f4f6'}">
        <div class="dash-stat-icon ${totalReports ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}"><i class="ri-flag-line"></i></div>
        <div>
          <div class="text-2xl font-bold ${totalReports ? 'text-red-700' : 'text-gray-700'}">${totalReports}</div>
          <div class="text-xs ${totalReports ? 'text-red-500/80' : 'text-gray-500/80'}">بلاغات</div>
        </div>
      </div>
    </div>

    <!-- Pending Requests -->
    ${pending.length ? `
    <div class="dash-section mb-6">
      <div class="dash-section-header" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-bottom-color:#fde68a">
        <div class="dash-section-icon bg-amber-500 text-white"><i class="ri-notification-3-line"></i></div>
        <div>
          <h3 class="font-bold text-amber-800">طلبات تسجيل جديدة (${pending.length})</h3>
          <p class="text-xs text-amber-600">في ناس مستنية одобрتك عشان شغلهم يظهر</p>
        </div>
      </div>
      <div class="p-4 space-y-3">
        ${pending.map(b => {
          const style = getCategoryStyle(b.categoryNameAr);
          return `
          <div class="bg-white border border-amber-200 rounded-2xl p-5 hover:shadow-sm transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style="background:${style.bg}">
                <span style="font-size:1.5rem">${style.emoji}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold">${b.nameAr || b.name}</div>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium">${b.categoryNameAr || ''}</span>
                  <span class="px-2 py-0.5 bg-gray-100 rounded-lg text-xs font-medium"><i class="ri-map-pin-line ml-1"></i>${b.location?.city || ''}</span>
                  <span class="text-xs text-gray-400">${b.userName || 'غير معروف'}</span>
                </div>
                ${b.description ? `<div class="text-sm text-gray-500 mt-2 line-clamp-2">${b.description.substring(0, 150)}...</div>` : ''}
                ${b.contact?.phone ? `<div class="text-xs text-blue-500 mt-2"><i class="ri-phone-line ml-1"></i>${b.contact.phone}</div>` : ''}
                <div class="text-xs text-gray-400 mt-1">${new Date(b.createdAt).toLocaleDateString('ar-EG')}</div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="approveBusiness('${b.id}','approved')" class="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all flex items-center gap-1 shadow-sm">
                  <i class="ri-check-line"></i> اعتماد
                </button>
                <button onclick="approveBusiness('${b.id}','rejected')" class="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1">
                  <i class="ri-close-line"></i> رفض
                </button>
                <button onclick="deleteBusiness('${b.id}')" class="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <!-- All Businesses Table -->
    <div class="dash-section">
      <div class="dash-section-header">
        <div class="dash-section-icon bg-gray-100 text-gray-500"><i class="ri-list-check"></i></div>
        <div>
          <h3 class="font-bold text-sm">جميع الأعمال</h3>
          <p class="text-xs text-gray-400">${allBiz.length} عمل</p>
        </div>
      </div>
      ${allBiz.length ? `
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead><tr class="border-b border-gray-100 text-right text-xs text-gray-500 uppercase tracking-wider">
              <th class="p-4 font-semibold">العمل</th><th class="p-4 font-semibold">الفئة</th><th class="p-4 font-semibold">المدينة</th><th class="p-4 font-semibold">الصاحب</th><th class="p-4 font-semibold">الحالة</th><th class="p-4 font-semibold">إجراء</th>
            </tr></thead>
            <tbody>${allBiz.map(b => {
              const style = getCategoryStyle(b.categoryNameAr);
              const statusClass = b.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : b.status === 'pending' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
              const statusText = b.status === 'approved' ? 'معتمد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض';
              return `<tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${style.bg}"><span style="font-size:0.9rem">${style.emoji}</span></div>
                    <span class="font-medium text-sm">${b.nameAr || b.name}</span>
                  </div>
                </td>
                <td class="p-4 text-sm text-gray-500">${b.categoryNameAr || ''}</td>
                <td class="p-4 text-sm text-gray-500">${b.location?.city || ''}</td>
                <td class="p-4 text-sm text-gray-500">${b.userName || '-'}</td>
                <td class="p-4"><span class="px-2.5 py-1 rounded-lg text-xs font-semibold ${statusClass}">${statusText}</span></td>
                <td class="p-4">
                  <div class="flex items-center gap-1">
                    ${b.status !== 'approved' ? `<button class="w-8 h-8 bg-green-50 text-green-500 rounded-lg flex items-center justify-center hover:bg-green-100 transition-all" onclick="approveBusiness('${b.id}','approved')" title="اعتماد"><i class="ri-check-line text-sm"></i></button>` : ''}
                    ${b.status !== 'rejected' ? `<button class="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all" onclick="approveBusiness('${b.id}','rejected')" title="رفض"><i class="ri-close-line text-sm"></i></button>` : ''}
                    <button class="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all" onclick="deleteBusiness('${b.id}')" title="حذف"><i class="ri-delete-bin-line text-sm"></i></button>
                  </div>
                </td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>
      ` : '<div class="text-center py-12 text-gray-400"><i class="ri-store-2-line text-3xl"></i><p class="mt-2 text-sm">مفيش أعمال</p></div>'}
    </div>
  `;
}

function approveBusiness(id, status) {
  // Security: Only admins can approve/reject businesses
  if (!currentUser?.isAdmin) { showToast('مش مسموح', 'error'); return; }
  const b = businesses.find(biz => biz.id === id);
  if (!b) return;
  b.status = status;
  const notifKey = 'sikka_notifications_' + b.ownerId;
  let notifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
  notifs.push({
    type: status === 'approved' ? 'success' : 'error',
    title: status === 'approved' ? 'شغلك اتعمله اعتماد ✓' : 'تم رفض طلب تسجيل شغلك',
    message: status === 'approved' ? 'شغلك "' + (b.nameAr || b.name) + '" اعتمد وظهر في الدليل.' : 'شغلك "' + (b.nameAr || b.name) + '" ما اتعملاش اعتماد. تواصل معنا للمزيد من التفاصيل.',
    bizId: b.id,
    date: new Date().toISOString(),
    read: false
  });
  localStorage.setItem(notifKey, JSON.stringify(notifs));
  saveBizToFirestore(b);
  saveData();
  showToast(status === 'approved' ? 'اتعمل اعتماد لـ ' + (b.nameAr||b.name) : 'اترفض ' + (b.nameAr||b.name));
  loadAdmin();
}

function deleteBusiness(id) {
  // Security: Only admins can delete any business
  if (!currentUser?.isAdmin) { showToast('مش مسموح', 'error'); return; }
  if (!confirm('متأكد من الحذف؟')) return;
  businesses = businesses.filter(b => b.id !== id);
  delete reviews[id];
  deleteBizFromFirestore(id);
  saveData();
  showToast('اتحذف');
  loadAdmin();
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  event?.target?.closest('.admin-nav-item')?.classList.add('active');
  const c = document.getElementById('admin-content');
  if (!c) return;
  if (tab === 'dashboard') { loadAdmin(); return; }
  if (tab === 'businesses') { renderAdminBusinesses(c); return; }
  if (tab === 'users') { renderAdminUsers(c); return; }
  if (tab === 'posts') { renderAdminPosts(c); return; }
  if (tab === 'categories') { renderAdminCategories(c); return; }
  if (tab === 'settings') { renderAdminSettings(c); return; }
}

function renderAdminBusinesses(c) {
  const allBiz = businesses;
  c.innerHTML = `
    <div class="mb-6"><h2 class="text-xl font-bold">جميع الأعمال</h2><p class="text-gray-500 text-sm">${allBiz.length} عمل</p></div>
    <div class="overflow-x-auto bg-white rounded-2xl border border-gray-100">
      <table class="w-full"><thead><tr class="border-b border-gray-100 text-right text-xs text-gray-500">
        <th class="p-4 font-semibold">العمل</th><th class="p-4 font-semibold">الفئة</th><th class="p-4 font-semibold">المدينة</th><th class="p-4 font-semibold">الحالة</th><th class="p-4 font-semibold">إجراء</th>
      </tr></thead><tbody>${allBiz.map(b => {
        const style = getCategoryStyle(b.categoryNameAr);
        const sc = b.status === 'approved' ? 'text-emerald-600 bg-emerald-50' : b.status === 'pending' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
        const st = b.status === 'approved' ? 'معتمد' : b.status === 'pending' ? 'قيد المراجعة' : 'مرفوض';
        return '<tr class="border-b border-gray-50 hover:bg-gray-50"><td class="p-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:'+style.bg+'"><span style="font-size:.9rem">'+style.emoji+'</span></div><span class="font-medium text-sm">'+(b.nameAr||b.name)+'</span></div></td><td class="p-4 text-sm text-gray-500">'+(b.categoryNameAr||'')+'</td><td class="p-4 text-sm text-gray-500">'+(b.location?.city||'')+'</td><td class="p-4"><span class="px-2.5 py-1 rounded-lg text-xs font-semibold '+sc+'">'+st+'</span></td><td class="p-4"><div class="flex items-center gap-1">'+(b.status!=='approved'?'<button class="w-8 h-8 bg-green-50 text-green-500 rounded-lg flex items-center justify-center hover:bg-green-100" onclick="approveBusiness(\''+b.id+'\',\'approved\')" title="اعتماد"><i class="ri-check-line text-sm"></i></button>':'')+(b.status!=='rejected'?'<button class="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100" onclick="approveBusiness(\''+b.id+'\',\'rejected\')" title="رفض"><i class="ri-close-line text-sm"></i></button>':'')+'<button class="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500" onclick="deleteBusiness(\''+b.id+'\')" title="حذف"><i class="ri-delete-bin-line text-sm"></i></button></div></td></tr>';
      }).join('')}</tbody></table>
    </div>`;
}

function renderAdminUsers(c) {
  const uniqueUsers = {};
  businesses.forEach(b => { if (b.ownerId) uniqueUsers[b.ownerId] = { id: b.ownerId, name: b.userName || 'غير معروف', biz: b.nameAr || b.name, status: b.status }; });
  const userList = Object.values(uniqueUsers);
  c.innerHTML = `
    <div class="mb-6"><h2 class="text-xl font-bold">المستخدمين</h2><p class="text-gray-500 text-sm">${userList.length} مستخدم مسجّل</p></div>
    <div class="space-y-3">${userList.length ? userList.map(u => {
      const sc = u.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : u.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600';
      const st = u.status === 'approved' ? 'معتمد' : u.status === 'pending' ? 'قيد المراجعة' : 'مرفوض';
      return '<div class="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3"><div class="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">'+(u.name||'?')[0]+'</div><div class="flex-1"><div class="font-bold text-sm">'+u.name+'</div><div class="text-xs text-gray-500">'+u.biz+'</div></div><span class="px-2.5 py-1 rounded-lg text-xs font-semibold '+sc+'">'+st+'</span></div>';
    }).join('') : '<div class="empty-state"><div class="empty-state-icon"><i class="ri-user-3-line"></i></div><h3>مفيش مستخدمين</h3></div>'}</div>`;
}

function renderAdminPosts(c) {
  c.innerHTML = `
    <div class="mb-6"><h2 class="text-xl font-bold">المقالات</h2><p class="text-gray-500 text-sm">${BLOG_POSTS.length} مقال</p></div>
    <div class="space-y-3">${BLOG_POSTS.map(p => '<div class="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4"><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"><i class="ri-article-line text-white text-lg"></i></div><div class="flex-1 min-w-0"><div class="font-bold text-sm truncate">'+p.title+'</div><div class="text-xs text-gray-500">'+p.category+' · '+p.date+'</div></div><span class="text-xs text-gray-400"><i class="ri-time-line ml-1"></i>'+p.readTime+'</span></div>').join('')}</div>`;
}

function renderAdminCategories(c) {
  c.innerHTML = `
    <div class="mb-6"><h2 class="text-xl font-bold">الفئات</h2><p class="text-gray-500 text-sm">${CATEGORIES.length} فئة</p></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${CATEGORIES.map(cat => {
      const style = getCategoryStyle(cat.name);
      const count = businesses.filter(b => b.categoryNameAr === cat.name && b.status === 'approved').length;
      return '<div class="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3"><div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:'+style.bg+'"><span style="font-size:1.3rem">'+style.emoji+'</span></div><div class="flex-1"><div class="font-bold text-sm">'+cat.name+'</div><div class="text-xs text-gray-500">'+count+' عمل</div></div></div>';
    }).join('')}</div>`;
}

function renderAdminSettings(c) {
  c.innerHTML = `
    <div class="mb-6"><h2 class="text-xl font-bold">إعدادات الإدارة</h2><p class="text-gray-500 text-sm">إدارة الموقع</p></div>
    <div class="space-y-4">
      <div class="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 class="font-bold text-sm mb-3"><i class="ri-information-line text-blue-500 ml-1"></i> معلومات الموقع</h3>
        <div class="grid grid-cols-2 gap-4 text-sm"><div><span class="text-gray-500">اسم الموقع:</span> <span class="font-medium">سِكّة</span></div><div><span class="text-gray-500">الإصدار:</span> <span class="font-medium">2.0</span></div><div><span class="text-gray-500">إجمالي الأعمال:</span> <span class="font-medium">${businesses.length}</span></div><div><span class="text-gray-500">إجمالي التقييمات:</span> <span class="font-medium">${Object.values(reviews).flat().length}</span></div></div>
      </div>
      <div class="bg-white border border-red-200 rounded-2xl p-5">
        <h3 class="font-bold text-sm mb-3 text-red-600"><i class="ri-delete-bin-line ml-1"></i> منطقة الخطر</h3>
        <p class="text-sm text-gray-500 mb-4">مسح جميع البيانات النهائياً</p>
        <button onclick="if(confirm('متأكد متأكد؟ هيتمسح كل حاجة!')){localStorage.clear();location.reload();}" class="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"><i class="ri-delete-bin-line ml-1"></i> مسح كل البيانات</button>
      </div>
    </div>`;
}

// ==================== BLOG DATA ====================
const BLOG_POSTS = [
  { id:'blog1', title:'أفضل 10 مقاهي في الفيوم', excerpt:'اكتشف أحسن المقاهي في الفيوم اللي لازم تزورها. قهوة مختصة وأجواء حلوة.', category:'دليل أكل', date:'2025-03-15', readTime:'5 دقائق', author:'سِكّة', content:'الفيوم فيها مقاهي كتير أوي، بس فيهم ناس متميزين بجد. كافيه لافندر من أحسن المقاهي في شارع الحرفيين. قهوة مختصة وأجواء هادية مع حديقة صغيرة. ستار بيكسر فرع الفيوم في سيتي سنتر أحسن أنواع القهوة المختصة. كافيه أروما في سنورس من أحدث المقاهي مع ويش بار حلو.' },
  { id:'blog2', title:'دليل المطاعم الشعبية في الفيوم', excerpt:'أشهر المطاعم الشعبية في الفيوم. أكل مصري أصلي بأسعار مناسبة.', category:'دليل أكل', date:'2025-03-10', readTime:'7 دقائق', author:'سِكّة', content:'الفيوم مشهورة بأكلها المصري الأصلي. مطعم الكرنك أشهر مطعم مشويات في الفيوم. مطعم المحطة في إطسا مطعم ريفي مشهور بأكله المصري التقليدي.' },
  { id:'blog3', title:'كيف تسوّق لشغلك على سِكّة', excerpt:'نصائح عملية تساعدك تسوّق لشغلك وتوصل لأكبر عدد من الزباين.', category:'نصائح أعمال', date:'2025-03-05', readTime:'6 دقائق', author:'سِكّة', content:'لو عندك شغل أو محل وعايز تسوّق له، سِكّة أحسن مكان تبدأ منه. سجّل شغلك بشكل كامل، أضف صور حلوة، رد على التقييمات، وحدث العروض بانتظام.' },
  { id:'blog4', title:'أفضل الأماكن السياحية في الفيوم', excerpt:'الفيوم فيها أماكن سياحية كتير. اكتشف أحلى أماكن تزورها.', category:'سياحة', date:'2025-02-28', readTime:'8 دقائق', author:'سِكّة', content:'الفيوم من أحلى المحافظات في مصر من ناحية السياحة. بحر الفيوم بحيرة طبيعية جميلة، الهضبة فيها إطلالة رائعة، متحف الفيوم فيه تحف أثرية مهمة.' },
  { id:'blog5', title:'نصائح لكتابة تقييم مفيد', excerpt:'إزاي تكتب تقييم يساعد الناس وتكون مفيد.', category:'نصائح', date:'2025-02-20', readTime:'4 دقائق', author:'سِكّة', content:'التقييمات بتفرق كتير في اختيار الناس للمكان. اكتب عن التجربة كلها، كن صادق، أضف صور، واكتب عن التفاصيل الصغيرة.' },
  { id:'blog6', title:'كيف تبدأ مشروع صغير في مصر', excerpt:'خطوات عملية تبدأ بيها مشروع صغير في مصر بـ capital قليل.', category:'نصائح أعمال', date:'2025-02-15', readTime:'10 دقائق', author:'سِكّة', content:'البدء بمشروع صغير في مصر مش صعب. اختار المجال، ابحث عن السوق، ابدأ صغير، سجّل على سِكّة، واسمع للزباين.' },
];

// ==================== DISTANCE ====================
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

function getUserLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null), { timeout: 5000 }
    );
  });
}

// ==================== LAST VISITED ====================
function getLastVisited() { return JSON.parse(localStorage.getItem('sikka_last_visited') || '[]'); }
function addLastVisited(id) {
  let last = getLastVisited().filter(v => v !== id);
  last.unshift(id);
  localStorage.setItem('sikka_last_visited', JSON.stringify(last.slice(0, 5)));
}

// ==================== COMPARE ====================
function addToCompare(id) {
  if (compareList.includes(id)) { showToast('الشغل موجود أصلاً في المقارنة', 'info'); return; }
  if (compareList.length >= 3) { showToast('ممكن تقارن 3 أعمال بس', 'error'); return; }
  compareList.push(id);
  localStorage.setItem('sikka_compare', JSON.stringify(compareList));
  updateCompareBadge();
  showToast('اتضاف للمقارنة');
}
function removeFromCompare(id) {
  compareList = compareList.filter(c => c !== id);
  localStorage.setItem('sikka_compare', JSON.stringify(compareList));
  updateCompareBadge();
  renderCompare();
}
function updateCompareBadge() {
  const badge = document.getElementById('compare-badge');
  if (badge) {
    if (compareList.length > 0) { badge.textContent = compareList.length; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  }
}
function renderCompare() {
  const c = document.getElementById('compare-content');
  if (!c) return;
  if (!compareList.length) {
    c.innerHTML = `
      <div class="text-center py-20">
        <div class="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <i class="ri-scales-line text-4xl text-gray-300"></i>
        </div>
        <h2 class="text-xl font-bold mb-2">مفيش أعمال للمقارنة</h2>
        <p class="text-gray-500 mb-6 text-sm">اضغط على زر المقارنة في أي صفحة نشاط</p>
        <button onclick="navigateTo('businesses')" class="px-6 py-3 bg-gradient-to-l from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:shadow-lg transition-all">
          <i class="ri-store-2-line ml-1"></i> شوف الأعمال
        </button>
      </div>`;
    return;
  }
  const bizList = compareList.map(id => businesses.find(b => b.id === id)).filter(Boolean);
  const rows = [
    { label:'الفئة', fn: b => b.categoryNameAr||'-' },
    { label:'المدينة', fn: b => (b.location?.city||'-') + (b.location?.district?' - '+b.location.district:'') },
    { label:'التقييم', fn: b => '<div class="flex items-center justify-center gap-1"><span class="text-amber-500 font-bold">'+(b.rating?.average||0).toFixed(1)+'</span><i class="ri-star-fill text-amber-400 text-sm"></i><span class="text-gray-400 text-xs">('+(b.rating?.count||0)+')</span></div>' },
    { label:'المشاهدات', fn: b => '<span class="font-bold text-blue-600">'+(b.views||0)+'</span>' },
    { label:'المنتجات', fn: b => '<span class="font-bold text-purple-600">'+(b.products||[]).length+'</span>' },
    { label:'العروض', fn: b => '<span class="font-bold text-green-600">'+(b.offers||[]).length+'</span>' },
    { label:'التليفون', fn: b => b.contact?.phone ? '<a href="tel:'+b.contact.phone+'" class="text-blue-600 hover:underline font-medium">'+b.contact.phone+'</a>' : '<span class="text-gray-300">-</span>' },
    { label:'الحالة', fn: b => checkIfOpen(b.workingHours) ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>مفتوح</span>' : '<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>مقفول</span>' },
  ];

  c.innerHTML = `
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
          <i class="ri-scales-line text-purple-500 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold">مقارنة الأعمال</h2>
          <p class="text-gray-500 text-sm">${bizList.length} أعمال قيد المقارنة</p>
        </div>
      </div>
      <button onclick="compareList=[];localStorage.setItem('sikka_compare','[]');updateCompareBadge();renderCompare();" class="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1">
        <i class="ri-delete-bin-line"></i> مسح الكل
      </button>
    </div>

    <div class="bg-white border border-gray-100 rounded-2xl overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="p-5 text-right text-sm font-bold text-gray-500 w-32"></th>
            ${bizList.map(b => {
              const style = getCategoryStyle(b.categoryNameAr);
              return `<th class="p-5 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-2xl flex items-center justify-center" style="background:${style.bg}">
                    <span style="font-size:1.5rem">${style.emoji}</span>
                  </div>
                  <div>
                    <div class="font-bold text-sm">${b.nameAr||b.name}</div>
                    <div class="text-xs text-gray-400 mt-0.5">${b.categoryNameAr||''}</div>
                  </div>
                  <button onclick="removeFromCompare('${b.id}')" class="text-xs text-red-500 hover:text-red-600 hover:underline font-medium">إزالة</button>
                </div>
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, ri) => `
            <tr class="${ri%2===0?'bg-gray-50/50':''} hover:bg-gray-50 transition-colors">
              <td class="p-4 text-sm font-bold text-gray-600">${row.label}</td>
              ${bizList.map(b => '<td class="p-4 text-center text-sm">'+row.fn(b)+'</td>').join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==================== QR CODE ====================
function openQRModal(bizId) {
  const b = businesses.find(biz => biz.id === bizId);
  if (!b) return;
  const url = location.origin + location.pathname + '#/business/' + bizId;
  const modal = document.getElementById('qr-modal');
  const content = document.getElementById('qr-modal-content');
  if (modal && content) {
    content.innerHTML = '<div class="text-center"><h2 class="text-xl font-bold mb-1">QR Code</h2><p class="text-gray-500 text-sm mb-6">' + (b.nameAr||b.name) + '</p><div id="qr-canvas-box" class="relative inline-block mb-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm"></div><p class="text-xs text-gray-400 mb-5 break-all max-w-xs mx-auto">' + url + '</p><div class="flex gap-3 justify-center"><button onclick="downloadQR(\'' + bizId + '\')" class="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center gap-1"><i class="ri-download-line"></i> تحميل</button><button onclick="closeQRModal()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all">إغلاق</button></div></div>';
    modal.classList.remove('hidden');
    setTimeout(() => {
      const box = document.getElementById('qr-canvas-box');
      if (box && typeof QRCode !== 'undefined') {
        box.innerHTML = '';
        const qrDiv = document.createElement('div');
        box.appendChild(qrDiv);
        new QRCode(qrDiv, { text: url, width: 240, height: 240, colorDark: '#0f172a', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
        // Add logo center
        setTimeout(() => {
          const canvas = qrDiv.querySelector('canvas');
          if (canvas) {
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            logo.src = 'assets/icons/logo.png';
            logo.onload = () => {
              const ctx = canvas.getContext('2d');
              const size = 44;
              const x = (canvas.width - size) / 2;
              const y = (canvas.height - size) / 2;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(x - 4, y - 4, size + 8, size + 8, 8);
              ctx.fill();
              ctx.drawImage(logo, x, y, size, size);
            };
          }
        }, 200);
      }
    }, 100);
  }
}

function downloadQR(bizId) {
  const box = document.getElementById('qr-canvas-box');
  if (!box) return;
  const canvas = box.querySelector('canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'sikka-qr-' + bizId + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
function closeQRModal() { document.getElementById('qr-modal')?.classList.add('hidden'); }

// ==================== REPORT ====================
function openReportModal(bizId) {
  if (!currentUser) { showAuthModal(); return; }
  const modal = document.getElementById('report-modal');
  const content = document.getElementById('report-modal-content');
  if (modal && content) {
    content.innerHTML = '<h2 class="text-xl font-bold text-center mb-2">إبلاغ عن شغل</h2><p class="text-gray-500 text-sm text-center mb-6">اختار سبب الإبلاغ</p><div class="space-y-2"><label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"><input type="radio" name="report-reason" value="wrong-info" class="accent-red-500"> <span class="text-sm">معلومات غلط</span></label><label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"><input type="radio" name="report-reason" value="closed" class="accent-red-500"> <span class="text-sm">مقفول دائماً</span></label><label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"><input type="radio" name="report-reason" value="inappropriate" class="accent-red-500"> <span class="text-sm">محتوى مسيء</span></label><label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"><input type="radio" name="report-reason" value="spam" class="accent-red-500"> <span class="text-sm">سبام أو إعلان</span></label></div><div class="flex gap-3 mt-6"><button onclick="submitReport(\'' + bizId + '\')" class="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-all"><i class="ri-send-plane-line ml-1"></i> إرسال</button><button onclick="closeReportModal()" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all">إلغاء</button></div>';
    modal.classList.remove('hidden');
  }
}
function closeReportModal() { document.getElementById('report-modal')?.classList.add('hidden'); }
function submitReport(bizId) {
  const selected = document.querySelector('input[name="report-reason"]:checked');
  if (!selected) { showToast('اختار سبب الإبلاغ', 'error'); return; }
  reports.push({ bizId, userId: currentUser.id, reason: selected.value, date: new Date().toISOString() });
  localStorage.setItem('sikka_reports', JSON.stringify(reports));
  closeReportModal();
  showToast('اتبعت الإبلاغ. شكراً!', 'success');
}

// ==================== MAP PAGE ====================
function initMapPage() {
  const container = document.getElementById('leaflet-map');
  if (!container) return;
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
  const approved = businesses.filter(b => b.status === 'approved' && b.location?.lat);
  leafletMap = L.map('leaflet-map', { zoomControl: false }).setView([29.30, 30.84], 12);
  L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(leafletMap);
  window._mapCurrentCategory = '';
  window._mapCurrentSearch = '';
  renderMapMarkers(approved);
  renderMapSidebar(approved);
  setTimeout(() => leafletMap.invalidateSize(), 200);
}

function renderMapMarkers(list) {
  if (!leafletMap) return;
  leafletMap.eachLayer(layer => { if (layer instanceof L.Marker) leafletMap.removeLayer(layer); });
  const catColors = { 'المقاهي':'#92400e','المطاعم':'#dc2626','البنوك':'#1e40af','التجزئة':'#7c3aed','الصحة':'#dc2626','التعليم':'#2563eb','الخدمات':'#475569','السفر والسياحة':'#0284c7','الجمال':'#db2777','الرياضة':'#16a34a' };
  list.forEach(b => {
    const style = getCategoryStyle(b.categoryNameAr);
    const color = catColors[b.categoryNameAr] || '#64748b';
    const marker = L.marker([b.location.lat, b.location.lng], {
      icon: L.divIcon({ className:'custom-marker', html:'<div style="background:'+color+';width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:3px solid white;cursor:pointer;transition:transform 0.2s" onmouseenter="this.style.transform=\'scale(1.15)\'" onmouseleave="this.style.transform=\'scale(1)\'">'+style.emoji+'</div>', iconSize:[38,38], iconAnchor:[19,19] })
    }).addTo(leafletMap);
    marker.bindPopup('<div style="text-align:center;min-width:160px;font-family:IBM Plex Sans Arabic,sans-serif"><div style="font-size:28px;margin-bottom:6px">'+style.emoji+'</div><div style="font-weight:700;font-size:15px;color:#0f172a">'+(b.nameAr||b.name)+'</div><div style="color:#64748b;font-size:12px;margin:2px 0">'+(b.categoryNameAr||'')+'</div><div style="color:#f59e0b;font-size:13px;margin:4px 0">⭐ '+(b.rating?.average||0).toFixed(1)+'</div><button onclick="openBusiness(\''+b.id+'\')" style="margin-top:6px;padding:6px 16px;background:#0f172a;color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">عرض التفاصيل</button></div>');
  });
}

function renderMapSidebar(list) {
  const sidebar = document.getElementById('map-sidebar-list');
  const countEl = document.getElementById('map-count');
  if (countEl) countEl.textContent = list.length + ' عمل على الخريطة';
  if (!sidebar) return;
  if (!list.length) {
    sidebar.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="ri-map-pin-line text-3xl mb-2 block"></i><p class="text-sm">مفيش أعمال في المنطقة دي</p></div>';
    return;
  }
  sidebar.innerHTML = list.map(b => {
    const style = getCategoryStyle(b.categoryNameAr);
    return '<div class="map-sidebar-item" onclick="flyToBusiness(\''+b.id+'\','+b.location.lat+','+b.location.lng+')"><div class="item-emoji" style="background:'+style.bg+'">'+style.emoji+'</div><div class="flex-1 min-w-0"><div class="font-bold text-sm truncate" style="color:#0f172a">'+(b.nameAr||b.name)+'</div><div class="text-xs text-gray-500 mt-0.5">'+(b.categoryNameAr||'')+' · '+(b.location?.city||'')+'</div><div class="flex items-center gap-1 mt-1"><span class="text-amber-500 text-xs">⭐ '+(b.rating?.average||0).toFixed(1)+'</span><span class="text-gray-300 text-xs">·</span><span class="text-gray-400 text-xs">'+(b.views||0)+' مشاهدة</span></div></div></div>';
  }).join('');
}

function flyToBusiness(id, lat, lng) {
  if (leafletMap && lat && lng) {
    leafletMap.flyTo([lat, lng], 16, { duration: 1 });
    openBusiness(id);
  }
}

function filterMapByCategory(btn, cat) {
  document.querySelectorAll('.map-cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window._mapCurrentCategory = cat;
  applyMapFilters();
}

function filterMapBySearch(val) {
  window._mapCurrentSearch = (val || '').toLowerCase();
  applyMapFilters();
}

function applyMapFilters() {
  let approved = businesses.filter(b => b.status === 'approved' && b.location?.lat);
  const cat = window._mapCurrentCategory || '';
  const search = window._mapCurrentSearch || '';
  if (cat) approved = approved.filter(b => b.categoryNameAr === cat);
  if (search) approved = approved.filter(b => {
    const name = (b.nameAr || b.name || '').toLowerCase();
    const city = (b.location?.city || '').toLowerCase();
    const cat2 = (b.categoryNameAr || '').toLowerCase();
    return name.includes(search) || city.includes(search) || cat2.includes(search);
  });
  renderMapMarkers(approved);
  renderMapSidebar(approved);
}

// ==================== SHARE TO WHATSAPP ====================
function shareWhatsApp(id) {
  const biz = businesses.find(b => b.id === id);
  const url = location.origin + location.pathname + '#/business/' + id;
  window.open('https://wa.me/?text=' + encodeURIComponent('شوف ' + (biz?.nameAr || '') + ' على سِكّة: ' + url), '_blank');
}

function copyPhone(phone) {
  if (navigator.clipboard) navigator.clipboard.writeText(phone).then(() => showToast('اتنسخ النمره', 'success'));
}

// ==================== BLOG RENDERING ====================
function renderBlogPost(post) {
  const c = document.getElementById('post-detail');
  if (!c) return;
  c.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onclick="navigateTo('blog')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm">
        <i class="ri-arrow-right-line"></i> ارجع للمدونة
      </button>
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <i class="ri-article-line text-6xl text-white/30"></i>
        </div>
        <div class="p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">${post.category}</span>
            <span class="text-xs text-gray-400"><i class="ri-time-line ml-1"></i>${post.readTime}</span>
            <span class="text-xs text-gray-400">${post.date}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold mb-4">${post.title}</h1>
          <p class="text-gray-400 text-sm mb-6 flex items-center gap-2">
            <i class="ri-user-3-line"></i>بقلم: ${post.author}
          </p>
          <div class="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm">${post.content}</div>
          <div class="mt-8 pt-6 border-t border-gray-100">
            <h4 class="font-bold text-sm mb-3">شارك المقال</h4>
            <div class="flex gap-2">
              <button onclick="navigator.clipboard.writeText(window.location.href);showToast('اتنسخ الرابط','success')" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                <i class="ri-link"></i> نسخ الرابط
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==================== PAGINATION ====================
function renderBusinessesPaginated(list, container) {
  if (!container) return;
  if (!list.length) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="ri-store-2-line"></i></div><h3>مفيش نتائج</h3><p>جرّب تغيير الفلتر أو كلمات البحث</p></div>'; return; }
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = list.slice(start, start + ITEMS_PER_PAGE);
  container.innerHTML = '<div class="col-span-full mb-2 text-sm text-gray-500">' + list.length + ' نتيجة</div>' + pageItems.map((b, i) => renderBusinessCard(b, start + i)).join('');
  if (totalPages > 1) {
    container.innerHTML += '<div class="col-span-full flex items-center justify-center gap-2 mt-8"><button onclick="changePage(' + (currentPage - 1) + ')" class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all ' + (currentPage === 1 ? 'opacity-50 pointer-events-none' : '') + '"><i class="ri-arrow-right-line"></i> السابق</button><span class="text-sm text-gray-500">صفحة ' + currentPage + ' من ' + totalPages + '</span><button onclick="changePage(' + (currentPage + 1) + ')" class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all ' + (currentPage === totalPages ? 'opacity-50 pointer-events-none' : '') + '">التالي <i class="ri-arrow-left-line"></i></button></div>';
  }
  window._currentFilteredList = list;
}
function changePage(page) {
  const list = window._currentFilteredList || businesses.filter(b => b.status === 'approved');
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderBusinessesPaginated(list, document.getElementById('all-businesses-grid'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
window.toggleDarkMode = toggleDarkMode;
window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare;
window.openQRModal = openQRModal;
window.closeQRModal = closeQRModal;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;
window.submitReport = submitReport;
window.initMapPage = initMapPage;
window.filterMapByCategory = filterMapByCategory;
window.flyToBusiness = flyToBusiness;
window.shareWhatsApp = shareWhatsApp;
window.copyPhone = copyPhone;
window.handleSearchInput = handleSearchInput;
window.hideAutocomplete = hideAutocomplete;
window.startVoiceSearch = startVoiceSearch;
window.stopVoiceSearch = stopVoiceSearch;
window.clearSearchHistory = clearSearchHistory;
window.clearSearch = clearSearch;
window.toggleSearchLocation = toggleSearchLocation;
window.filterSearchLocations = filterSearchLocations;
window.selectSearchLocation = selectSearchLocation;
window.changePage = changePage;
window.clearNotifications = clearNotifications;
