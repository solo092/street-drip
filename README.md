# Street Drip

موقع متجر أحذية وملابس (Street Drip) — سيرفر Node.js حقيقي + داشبورد لإضافة المنتجات بالصور. لما تضيف منتج من الداشبورد، بيظهر فوراً لكل الزوار على أي جهاز، لأنو التخزين على السيرفر مش على المتصفح.

## المحتوى
- `server.js` — سيرفر Express فيه الـ API.
- `public/` — الموقع نفسه (index.html + dashboard.html + الأصول assets).
- `data/products.json` — بيتكون تلقائي أول ما تشغل السيرفر، وفيه كل المنتجات.
- `uploads/` — الصور اللي بترفعها من الداشبورد بتتخزن هنا.

## التشغيل محلياً

1. تأكد عندك Node.js نسخة 18 أو أحدث.
2. افتح تيرمنال في مجلد المشروع ونفذ:
   ```
   npm install
   ```
3. انسخ ملف الإعدادات:
   ```
   cp .env.example .env
   ```
   وعدّل فيه `ADMIN_PASSCODE` للباسكود اللي عايزو للداشبورد (البارامتر الافتراضي `DRIP2026`).
4. شغّل السيرفر:
   ```
   npm start
   ```
5. افتح المتصفح على `http://localhost:3000` للموقع، و `http://localhost:3000/dashboard.html` للداشبورد.

## رفعو يبقى موقع حقيقي (Deployment)

هذا تطبيق Node.js حقيقي (مو مجرد ملفات HTML)، فلازم استضافة بتشغل Node — مو استضافة "static" عادية زي GitHub Pages. أسهل خيارات:

### الخيار الأول — Render.com (سهل ومجاني للبداية)
1. اعمل حساب على render.com وارفع هذا المشروع على GitHub repo.
2. من Render: New → Web Service → اختار الـ repo.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. أضف Environment Variable: `ADMIN_PASSCODE` بالقيمة اللي عايزها.
6. **مهم:** أضف Persistent Disk (من إعدادات الخدمة) واربطه بمسار `/uploads` — عشان الصور ما تنمسح كل ما السيرفر يعيد التشغيل.

### الخيار الثاني — Railway.app
نفس الفكرة: ارفع الكود، حدد Start Command `npm start`، وأضف Volume للـ `/uploads`.

### الخيار الثالث — VPS خاص بيك (Hostinger VPS, DigitalOcean, إلخ)
1. ارفع المشروع للسيرفر (عبر git أو scp).
2. `npm install --production`
3. شغّله بشكل دائم باستخدام PM2:
   ```
   npm install -g pm2
   pm2 start server.js --name street-drip
   pm2 save
   ```
4. حط Nginx كـ reverse proxy على البورت 3000 وفعّل SSL بواسطة Certbot عشان يبقى `https://`.

## ملاحظات مهمة
- الباسكود بتاع الداشبورد (`ADMIN_PASSCODE`) هو الحماية الوحيدة — خليه سري ومختلف عن `DRIP2026` الافتراضي قبل ما تنشر الموقع للناس.
- إذا استخدمت استضافة بـ "ephemeral filesystem" (زي بعض خطط Render المجانية بدون Disk)، أي صورة ترفعها ممكن تنمسح لما السيرفر يعيد التشغيل — لازم Persistent Disk/Volume زي ما ذكرنا فوق.
- لاحقاً إذا احتجت تخزين أكبر وأكثر أماناً (قاعدة بيانات حقيقية، تسجيل دخول متعدد المستخدمين، إلخ) نقدر نطورها.
