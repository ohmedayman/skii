const admin = require('firebase-admin');
const slugify = require('slugify');
const db = admin.firestore();
const { client: searchClient } = require('../config/meilisearch');

const createBusiness = async (req, res) => {
  try {
    const ownerId = req.user.uid;
    const data = req.body;

    const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const businessData = {
      ownerId,
      name: data.name,
      nameAr: data.nameAr || data.name,
      slug,
      description: data.description || '',
      descriptionAr: data.descriptionAr || data.description || '',
      categoryId: data.categoryId || '',
      categoryName: data.categoryName || '',
      categoryNameAr: data.categoryNameAr || '',
      contact: {
        phone: data.phone || '',
        whatsapp: data.whatsapp || data.phone || '',
        email: data.email || '',
        website: data.website || '',
      },
      location: {
        address: data.address || '',
        addressAr: data.addressAr || data.address || '',
        city: data.city || '',
        cityAr: data.cityAr || data.city || '',
        district: data.district || '',
        districtAr: data.districtAr || '',
        country: data.country || 'Saudi Arabia',
        countryAr: data.countryAr || 'المملكة العربية السعودية',
        coordinates: {
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        },
        googleMapsUrl: '',
      },
      media: {
        logo: data.logo || '',
        coverImage: data.coverImage || '',
        photos: data.photos || [],
      },
      workingHours: data.workingHours || getDefaultHours(),
      rating: {
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
      tags: data.tags || [],
      tagsAr: data.tagsAr || [],
      priceRange: data.priceRange || 2,
      isVerified: false,
      isActive: true,
      isFeatured: false,
      totalViews: 0,
      totalFavorites: 0,
      socialMedia: {
        instagram: data.instagram || '',
        twitter: data.twitter || '',
        snapchat: data.snapchat || '',
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('businesses').add(businessData);

    await db.collection('users').doc(ownerId).update({
      ownedBusinesses: admin.firestore.FieldValue.arrayUnion(docRef.id),
    });

    // Index in Meilisearch
    try {
      await searchClient.index('businesses').addDocuments([{
        id: docRef.id,
        ...businessData,
        createdAt: new Date().toISOString(),
      }]);
    } catch (e) {
      console.warn('Search indexing failed:', e.message);
    }

    return res.status(201).json({ id: docRef.id, ...businessData });
  } catch (error) {
    console.error('Create business error:', error);
    return res.status(500).json({ error: 'Failed to create business' });
  }
};

const getBusinesses = async (req, res) => {
  try {
    const { city, categoryId, sort = 'rating.average', limit = 20, startAfter } = req.query;

    let query = db.collection('businesses').where('isActive', '==', true);

    if (city) query = query.where('location.city', '==', city);
    if (categoryId) query = query.where('categoryId', '==', categoryId);

    query = query.orderBy(sort, 'desc').limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection('businesses').doc(startAfter).get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();
    const businesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ businesses, count: businesses.length });
  } catch (error) {
    console.error('Get businesses error:', error);
    return res.status(500).json({ error: 'Failed to get businesses' });
  }
};

const getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const snapshot = await db.collection('businesses')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const doc = snapshot.docs[0];

    await db.collection('businesses').doc(doc.id).update({
      totalViews: admin.firestore.FieldValue.increment(1),
    });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get business error:', error);
    return res.status(500).json({ error: 'Failed to get business' });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('businesses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get business error:', error);
    return res.status(500).json({ error: 'Failed to get business' });
  }
};

const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updates = req.body;

    const doc = await db.collection('businesses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (doc.data().ownerId !== userId && req.userProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    delete updates.ownerId;
    delete updates.createdAt;
    delete updates.rating;
    delete updates.totalViews;
    delete updates.totalFavorites;

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('businesses').doc(id).update(updates);

    // Update in Meilisearch
    try {
      await searchClient.index('businesses').updateDocuments([{ id, ...updates }]);
    } catch (e) {
      console.warn('Search update failed:', e.message);
    }

    const updatedDoc = await db.collection('businesses').doc(id).get();

    return res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update business error:', error);
    return res.status(500).json({ error: 'Failed to update business' });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const doc = await db.collection('businesses').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (doc.data().ownerId !== userId && req.userProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('businesses').doc(id).delete();

    await db.collection('users').doc(doc.data().ownerId).update({
      ownedBusinesses: admin.firestore.FieldValue.arrayRemove(id),
    });

    // Remove from Meilisearch
    try {
      await searchClient.index('businesses').deleteDocument(id);
    } catch (e) {
      console.warn('Search delete failed:', e.message);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    return res.status(500).json({ error: 'Failed to delete business' });
  }
};

const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { rating, comment, commentAr } = req.body;

    const businessDoc = await db.collection('businesses').doc(id).get();
    if (!businessDoc.exists) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const existingReview = await db.collection('businesses').doc(id)
      .collection('reviews')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return res.status(400).json({ error: 'Already reviewed this business' });
    }

    const reviewData = {
      userId,
      userName: req.userProfile?.displayName || 'Anonymous',
      userPhoto: req.userProfile?.photoURL || '',
      rating: parseInt(rating),
      comment: comment || '',
      commentAr: commentAr || comment || '',
      photos: [],
      ownerReply: null,
      isVerified: false,
      helpfulCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reviewRef = await db.collection('businesses').doc(id)
      .collection('reviews')
      .add(reviewData);

    // Update business rating
    const bizData = businessDoc.data();
    const newCount = bizData.rating.count + 1;
    const newAverage = ((bizData.rating.average * bizData.rating.count) + parseInt(rating)) / newCount;

    const distribution = bizData.rating.distribution;
    distribution[String(rating)] = (distribution[String(rating)] || 0) + 1;

    await db.collection('businesses').doc(id).update({
      'rating.average': Math.round(newAverage * 10) / 10,
      'rating.count': newCount,
      'rating.distribution': distribution,
    });

    return res.status(201).json({ id: reviewRef.id, ...reviewData });
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({ error: 'Failed to add review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db.collection('businesses').doc(id)
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ reviews, count: reviews.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ error: 'Failed to get reviews' });
  }
};

function getDefaultHours() {
  return {
    saturday: { open: '08:00', close: '23:00', isOpen: true },
    sunday: { open: '08:00', close: '23:00', isOpen: true },
    monday: { open: '08:00', close: '23:00', isOpen: true },
    tuesday: { open: '08:00', close: '23:00', isOpen: true },
    wednesday: { open: '08:00', close: '23:00', isOpen: true },
    thursday: { open: '08:00', close: '00:00', isOpen: true },
    friday: { open: '13:00', close: '00:00', isOpen: true },
  };
}

module.exports = {
  createBusiness,
  getBusinesses,
  getBusinessBySlug,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  addReview,
  getReviews,
};
