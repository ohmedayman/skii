require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const categories = [
  { name: 'Coffee Shops', nameAr: 'مقاهي', slug: 'coffee-shops', icon: 'coffee', color: '#8B5CF6', order: 1 },
  { name: 'Restaurants', nameAr: 'مطاعم', slug: 'restaurants', icon: 'utensils', color: '#EF4444', order: 2 },
  { name: 'Shopping', nameAr: 'تسوق', slug: 'shopping', icon: 'shopping-bag', color: '#F59E0B', order: 3 },
  { name: 'Services', nameAr: 'خدمات', slug: 'services', icon: 'briefcase', color: '#3B82F6', order: 4 },
  { name: 'Health & Beauty', nameAr: 'صحة وجمال', slug: 'health-beauty', icon: 'heart', color: '#EC4899', order: 5 },
  { name: 'Automotive', nameAr: 'سيارات', slug: 'automotive', icon: 'car', color: '#10B981', order: 6 },
  { name: 'Education', nameAr: 'تعليم', slug: 'education', icon: 'book', color: '#6366F1', order: 7 },
  { name: 'Real Estate', nameAr: 'عقارات', slug: 'real-estate', icon: 'home', color: '#14B8A6', order: 8 },
];

const businesses = [
  {
    name: 'Sikka Coffee',
    nameAr: 'قهوة سِكّة',
    slug: 'sikka-coffee-1',
    description: 'Premium specialty coffee shop in the heart of Riyadh',
    descriptionAr: 'مقهى قهوة متخصص في قلب الرياض',
    categoryName: 'Coffee Shops',
    categoryNameAr: 'مقاهي',
    contact: { phone: '+966501234567', whatsapp: '+966501234567', email: 'info@sikkacoffee.com', website: '' },
    location: { address: '123 King Fahd Road', addressAr: 'شارع الملك فهد ١٢٣', city: 'Riyadh', cityAr: 'الرياض', district: 'Al Olaya', districtAr: 'العليا', country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', coordinates: { latitude: 24.7136, longitude: 46.6753 }, googleMapsUrl: '' },
    rating: { average: 4.7, count: 128, distribution: { 5: 85, 4: 30, 3: 8, 2: 3, 1: 2 } },
    tags: ['coffee', 'specialty', 'wifi', 'parking'],
    tagsAr: ['قهوة', 'متخصصة', 'واي فاي', 'موقف سيارات'],
    priceRange: 2,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Al Baik',
    nameAr: 'البيرق',
    slug: 'al-baik-1',
    description: 'Famous Saudi fast food chain known for its crispy chicken',
    descriptionAr: 'سلسلة وجبات سريعة سعودية شهيرة تشتهر بدجاجها المقرمش',
    categoryName: 'Restaurants',
    categoryNameAr: 'مطاعم',
    contact: { phone: '+966509876543', whatsapp: '+966509876543', email: '', website: '' },
    location: { address: '456 Olaya Street', addressAr: 'شارع العليا ٤٥٦', city: 'Riyadh', cityAr: 'الرياض', district: 'Al Malaz', districtAr: 'الملز', country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', coordinates: { latitude: 24.6877, longitude: 46.7219 }, googleMapsUrl: '' },
    rating: { average: 4.5, count: 256, distribution: { 5: 120, 4: 80, 3: 30, 2: 15, 1: 11 } },
    tags: ['fast-food', 'chicken', 'family'],
    tagsAr: ['وجبات سريعة', 'دجاج', 'عائلات'],
    priceRange: 1,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Jarir Bookstore',
    nameAr: 'مكتبة جرير',
    slug: 'jarir-bookstore-1',
    description: 'Leading retailer for books, electronics, and office supplies',
    descriptionAr: 'متجر رائد للكتب والإلكترونيات ولوازم المكتب',
    categoryName: 'Shopping',
    categoryNameAr: 'تسوق',
    contact: { phone: '+966501112233', whatsapp: '', email: '', website: 'https://jarir.com' },
    location: { address: '789 Tahlia Street', addressAr: 'شارع التحلية ٧٨٩', city: 'Riyadh', cityAr: 'الرياض', district: 'Al Sulimaniyah', districtAr: 'السليمانية', country: 'Saudi Arabia', countryAr: 'المملكة العربية السعودية', coordinates: { latitude: 24.6925, longitude: 46.6867 }, googleMapsUrl: '' },
    rating: { average: 4.3, count: 512, distribution: { 5: 200, 4: 180, 3: 80, 2: 32, 1: 20 } },
    tags: ['books', 'electronics', 'office'],
    tagsAr: ['كتب', 'إلكترونيات', 'مكتب'],
    priceRange: 2,
    isVerified: true,
    isActive: true,
  },
];

const posts = [
  {
    title: 'Top 10 Coffee Shops in Riyadh',
    titleAr: 'أفضل ١٠ مقاهي في الرياض',
    slug: 'top-10-coffee-shops-riyadh-1',
    excerpt: 'Discover the best coffee spots in the capital city',
    excerptAr: 'اكتشف أفضل أماكن القهوة في العاصمة',
    content: '<p>Riyadh has a thriving coffee scene with dozens of specialty shops...</p>',
    contentAr: '<p>تتميز الرياض بمشهد قهوة مزدهر مع عشرات المقاهي المتخصصة...</p>',
    category: 'guides',
    categoryAr: 'أدلة',
    tags: ['coffee', 'riyadh', 'guide'],
    tagsAr: ['قهوة', 'الرياض', 'دليل'],
    status: 'published',
    readTime: 5,
  },
  {
    title: 'How to Start a Business in Saudi Arabia',
    titleAr: 'كيف تبدأ نشاط تجاري في المملكة العربية السعودية',
    slug: 'how-to-start-business-ksa-1',
    excerpt: 'A complete guide for entrepreneurs',
    excerptAr: 'دليل شامل لرواد الأعمال',
    content: '<p>Starting a business in KSA has become easier than ever...</p>',
    contentAr: '<p>أصبح بدء نشاط تجاري في السعودية أسهل من أي وقت مضى...</p>',
    category: 'business',
    categoryAr: 'أعمال',
    tags: ['business', 'ksa', 'guide'],
    tagsAr: ['أعمال', 'السعودية', 'دليل'],
    status: 'published',
    readTime: 8,
  },
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await db.collection('categories').add({
      ...cat,
      iconUrl: '',
      description: '',
      descriptionAr: '',
      parentId: null,
      businessCount: 0,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seeding businesses...');
  for (const biz of businesses) {
    await db.collection('businesses').add({
      ...biz,
      ownerId: 'system',
      media: { logo: '', coverImage: '', photos: [] },
      workingHours: {
        saturday: { open: '08:00', close: '23:00', isOpen: true },
        sunday: { open: '08:00', close: '23:00', isOpen: true },
        monday: { open: '08:00', close: '23:00', isOpen: true },
        tuesday: { open: '08:00', close: '23:00', isOpen: true },
        wednesday: { open: '08:00', close: '23:00', isOpen: true },
        thursday: { open: '08:00', close: '00:00', isOpen: true },
        friday: { open: '13:00', close: '00:00', isOpen: true },
      },
      isFeatured: false,
      totalViews: 0,
      totalFavorites: 0,
      socialMedia: { instagram: '', twitter: '', snapchat: '' },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seeding posts...');
  for (const post of posts) {
    await db.collection('posts').add({
      ...post,
      authorId: 'system',
      authorName: 'Sikka Team',
      coverImage: '',
      featuredBusinessIds: [],
      seo: { metaTitle: post.title, metaTitleAr: post.titleAr, metaDescription: post.excerpt, metaDescriptionAr: post.excerptAr, keywords: [] },
      isFeatured: false,
      views: 0,
      likes: 0,
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
