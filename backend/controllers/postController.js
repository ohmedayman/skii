const admin = require('firebase-admin');
const slugify = require('slugify');
const db = admin.firestore();
const { client: searchClient } = require('../config/meilisearch');

const createPost = async (req, res) => {
  try {
    const data = req.body;

    const slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const postData = {
      authorId: req.user.uid,
      authorName: req.userProfile?.displayName || 'Sikka Team',
      title: data.title,
      titleAr: data.titleAr || data.title,
      slug,
      excerpt: data.excerpt || '',
      excerptAr: data.excerptAr || data.excerpt || '',
      content: data.content || '',
      contentAr: data.contentAr || '',
      coverImage: data.coverImage || '',
      category: data.category || 'general',
      categoryAr: data.categoryAr || 'عام',
      tags: data.tags || [],
      tagsAr: data.tagsAr || [],
      featuredBusinessIds: data.featuredBusinessIds || [],
      seo: {
        metaTitle: data.metaTitle || data.title,
        metaTitleAr: data.metaTitleAr || data.titleAr || data.title,
        metaDescription: data.metaDescription || data.excerpt || '',
        metaDescriptionAr: data.metaDescriptionAr || data.excerptAr || '',
        keywords: data.keywords || [],
      },
      status: data.status || 'draft',
      isFeatured: false,
      views: 0,
      likes: 0,
      readTime: Math.ceil((data.content?.split(' ').length || 0) / 200),
      publishedAt: data.status === 'published' ? admin.firestore.FieldValue.serverTimestamp() : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('posts').add(postData);

    // Index in Meilisearch
    try {
      await searchClient.index('posts').addDocuments([{
        id: docRef.id,
        ...postData,
        createdAt: new Date().toISOString(),
        publishedAt: postData.status === 'published' ? new Date().toISOString() : null,
      }]);
    } catch (e) {
      console.warn('Search indexing failed:', e.message);
    }

    return res.status(201).json({ id: docRef.id, ...postData });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const { category, status = 'published', limit = 20, startAfter } = req.query;

    let query = db.collection('posts');

    if (status) query = query.where('status', '==', status);
    if (category) query = query.where('category', '==', category);

    query = query.orderBy('publishedAt', 'desc').limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection('posts').doc(startAfter).get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Failed to get posts' });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const snapshot = await db.collection('posts')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const doc = snapshot.docs[0];

    await db.collection('posts').doc(doc.id).update({
      views: admin.firestore.FieldValue.increment(1),
    });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Failed to get post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await db.collection('posts').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (doc.data().authorId !== req.user.uid && req.userProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    delete updates.authorId;
    delete updates.createdAt;
    delete updates.views;
    delete updates.likes;

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    if (updates.status === 'published' && !doc.data().publishedAt) {
      updates.publishedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await db.collection('posts').doc(id).update(updates);

    const updatedDoc = await db.collection('posts').doc(id).get();

    return res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('posts').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (doc.data().authorId !== req.user.uid && req.userProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('posts').doc(id).delete();

    try {
      await searchClient.index('posts').deleteDocument(id);
    } catch (e) {
      console.warn('Search delete failed:', e.message);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};

module.exports = { createPost, getPosts, getPostBySlug, updatePost, deletePost };
