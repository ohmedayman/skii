const admin = require('firebase-admin');
const db = admin.firestore();

const register = async (req, res) => {
  try {
    const { uid, email, displayName, phoneNumber, photoURL } = req.user;

    const existingUser = await db.collection('users').doc(uid).get();
    if (existingUser.exists) {
      return res.json({ user: existingUser.data(), isNew: false });
    }

    const userData = {
      uid,
      email: email || null,
      displayName: displayName || 'User',
      phoneNumber: phoneNumber || null,
      photoURL: photoURL || null,
      role: 'user',
      isVerified: false,
      isPhoneVerified: !!phoneNumber,
      isEmailVerified: !!email,
      location: '',
      favoriteBusinesses: [],
      ownedBusinesses: [],
      language: 'ar',
      isNotificationEnabled: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(uid).set(userData);

    return res.status(201).json({ user: userData, isNew: true });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: userDoc.data() });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, location, language, isNotificationEnabled } = req.body;
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (displayName) updateData.displayName = displayName;
    if (location) updateData.location = location;
    if (language) updateData.language = language;
    if (typeof isNotificationEnabled === 'boolean') updateData.isNotificationEnabled = isNotificationEnabled;

    await db.collection('users').doc(req.user.uid).update(updateData);

    const updatedDoc = await db.collection('users').doc(req.user.uid).get();

    return res.json({ user: updatedDoc.data() });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.uid;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favorites = userDoc.data().favoriteBusinesses || [];
    const index = favorites.indexOf(businessId);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(businessId);
    }

    await userRef.update({
      favoriteBusinesses: favorites,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      isFavorited: index === -1,
      favorites,
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favoriteIds = userDoc.data().favoriteBusinesses || [];

    if (favoriteIds.length === 0) {
      return res.json({ favorites: [] });
    }

    const businesses = [];
    for (const id of favoriteIds) {
      const bizDoc = await db.collection('businesses').doc(id).get();
      if (bizDoc.exists) {
        businesses.push({ id: bizDoc.id, ...bizDoc.data() });
      }
    }

    return res.json({ favorites: businesses });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ error: 'Failed to get favorites' });
  }
};

module.exports = { register, getProfile, updateProfile, toggleFavorite, getFavorites };
