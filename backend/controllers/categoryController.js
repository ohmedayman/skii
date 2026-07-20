const admin = require('firebase-admin');
const db = admin.firestore();

const getCategories = async (req, res) => {
  try {
    const snapshot = await db.collection('categories')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to get categories' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('categories').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ error: 'Failed to get category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const data = req.body;

    const categoryData = {
      name: data.name,
      nameAr: data.nameAr || data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      icon: data.icon || 'folder',
      iconUrl: data.iconUrl || '',
      color: data.color || '#6366F1',
      description: data.description || '',
      descriptionAr: data.descriptionAr || '',
      parentId: data.parentId || null,
      businessCount: 0,
      isActive: true,
      order: data.order || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('categories').add(categoryData);

    return res.status(201).json({ id: docRef.id, ...categoryData });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
};

module.exports = { getCategories, getCategoryById, createCategory };
