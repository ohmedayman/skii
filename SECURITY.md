# دليل الأمان - منصة سِكّة
## Security Setup Guide

---

## ⚡ خطوات يجب تنفيذها فوراً

### 1. تغيير Firebase Private Key (حرجة جداً)
الـ Private Key الموجودة في `.env` يجب **تغييرها فوراً** لأنها مكشوفة.

**الخطوات:**
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. افتح مشروع `sikka-e74f6`
3. اذهب إلى **Project Settings** → **Service accounts**
4. اضغط على **Generate new private key**
5. حفظ الملف الجديد في مكان آمن (مش في Git!)
6. حدّث ملف `.env` بالمفتاح الجديد

---

### 2. رفع Firestore Security Rules

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# اختيار المشروع
firebase use sikka-e74f6

# رفع الـ Rules
firebase deploy --only firestore:rules
```

---

### 3. تعيين Admin من Firebase Console

بدلاً من الإيميل `admin@sikka.com`، اتبع الخطوات دي:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/) → Firestore Database
2. ابحث عن document المستخدم في collection `users`
3. أضف field: `isAdmin: true` (boolean)

**أو من خلال Firebase Admin SDK (أكثر أماناً):**
```javascript
// في كود Node.js server-side فقط
await admin.firestore().collection('users').doc('USER_UID').update({
  isAdmin: true
});
```

---

## 🛡️ ما تم إصلاحه في الكود

### ✅ Admin Check من Firestore
```javascript
// قبل الإصلاح (خطير!)
isAdmin: email === 'admin@sikka.com'

// بعد الإصلاح (آمن)
const isAdmin = await checkAdminFromFirestore(uid);
// يتحقق من قاعدة البيانات مش من الإيميل
```

### ✅ XSS Protection
```javascript
// قبل الإصلاح (خطير!)
div.innerHTML = `${userName}`; // ممكن يحتوي على JavaScript

// بعد الإصلاح (آمن)
div.innerHTML = `${sanitize(userName)}`; // يحول > و < لـ entities
```

### ✅ Authorization في تعديل الأعمال
```javascript
// قبل الإصلاح (خطير!)
function saveDashEdit(id) {
  const b = businesses.find(biz => biz.id === id);
  // ❌ أي مستخدم يقدر يعدل أي شغل

// بعد الإصلاح (آمن)
function saveDashEdit(id) {
  if (!currentUser || (b.ownerId !== currentUser.id && !currentUser.isAdmin)) {
    showToast('مش مسموح لك بتعديل ده', 'error');
    return; // ✅ فقط الصاحب أو الأدمن يقدر يعدل
  }
```

### ✅ Rate Limiting للتقييمات
```javascript
// منع التقييم المكرر من نفس المستخدم
const alreadyReviewed = reviews[currentReviewBizId].find(r => r.userId === currentUser.id);
if (alreadyReviewed) {
  showToast('قيّمت الشغل ده قبل كده', 'error');
  return;
}
// منع صاحب الشغل من تقييم شغله
if (biz && biz.ownerId === currentUser.id) {
  showToast('مش ممكن تقيّم شغلك نفسك', 'error');
  return;
}
```

### ✅ منع التسجيل بإيميل الأدمن
```javascript
if (email.toLowerCase() === 'admin@sikka.com') {
  errEl.textContent = 'الإيميل ده محجوز - استخدم إيميل تاني';
  return;
}
```

### ✅ إزالة console.log الحساسة
تم إزالة جميع `console.log` التي تكشف معلومات عن Firestore errors.

---

## 📋 Firestore Security Rules

تم إنشاء ملف `firestore.rules` يتضمن:
- **Businesses**: القراءة العامة للأعمال المعتمدة فقط، الكتابة للمالك فقط
- **Reviews**: القراءة للجميع، الكتابة للمستخدمين المسجلين فقط  
- **Users**: كل مستخدم يشوف بياناته بس، ومحدش يقدر يحط `isAdmin: true` على نفسه
- **Default**: رفض كل حاجة تانية

---

## ⚠️ ما لم يتم إصلاحه (يحتاج عمل يدوي)

| المشكلة | السبب | الحل |
|---------|-------|------|
| Private Key مكشوفة | موجودة في `.env` | تغيير المفتاح من Firebase Console |
| Firebase API Key في JS | طبيعي في Firebase، الحماية بالـ Rules | رفع Firestore Rules ✓ |
| HTML Sanitization شامل | بعض أماكن innerHTML لم تُعالج | استخدام DOMPurify library للكامل |
