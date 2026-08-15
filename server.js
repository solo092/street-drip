require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'DRIP2026';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const SEED_PRODUCTS = [
  { id: 's1', img: 'assets/polo-set.jpg',   name: 'Two-Tone Polo Set',              cat: 'clothing', price: '30K', wa: '250795234442' },
  { id: 's2', img: 'assets/af1-tnf.jpg',    name: 'Air Force 1 × The North Face',   cat: 'shoes',    price: '32K', wa: '250795201759' },
  { id: 's3', img: 'assets/jordan1.jpg',    name: 'Air Jordan 1 Low Navy Gold',     cat: 'shoes',    price: '30K', wa: '250795201759' },
  { id: 's4', img: 'assets/af1-olive.jpg',  name: 'Air Force 1 Olive Gold',         cat: 'shoes',    price: '32K', wa: '250795201759' },
  { id: 's5', img: 'assets/af1-hand.jpg',   name: 'Air Force 1 Cream Corduroy',     cat: 'shoes',    price: '32K', wa: '250795201759' },
  { id: 's6', img: 'assets/af1-grey.jpg',   name: 'Air Force 1 Stone Grey',         cat: 'shoes',    price: '32K', wa: '250795201759' },
  { id: 's7', img: 'assets/af1-lunar.jpg',  name: 'Air Force 1 Lunar Brown',        cat: 'shoes',    price: '32K', wa: '250795201759' },
  { id: 's8', img: 'assets/af1-green.jpg',  name: 'Air Force 1 Sage Green',         cat: 'shoes',    price: '32K', wa: '250795201759' },
  { id: 's9', img: 'assets/sweatpants.jpg', name: 'Wide-Leg Sweatpants (3 Colors)', cat: 'clothing', price: '19K', wa: '250795201759' },
];

function loadProducts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_PRODUCTS, null, 2));
    return SEED_PRODUCTS.slice();
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return Array.isArray(parsed) ? parsed : SEED_PRODUCTS.slice();
  } catch (e) {
    return SEED_PRODUCTS.slice();
  }
}

function saveProducts(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `p${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

function checkPasscode(req, res, next) {
  const provided = req.headers['x-admin-passcode'];
  if (!provided || provided !== ADMIN_PASSCODE) {
    return res.status(401).json({ error: 'Wrong or missing passcode' });
  }
  next();
}

// ---- API ----
app.get('/api/products', (req, res) => {
  res.json(loadProducts());
});

app.post('/api/login', (req, res) => {
  const { passcode } = req.body || {};
  if (passcode && passcode === ADMIN_PASSCODE) return res.json({ ok: true });
  res.status(401).json({ ok: false, error: 'Wrong passcode' });
});

app.post('/api/products', checkPasscode, (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { name, cat, price, wa } = req.body;
    if (!name || !cat || !price || !wa || !req.file) {
      return res.status(400).json({ error: 'Missing fields — name, category, price, WhatsApp number, and photo are all required.' });
    }

    const products = loadProducts();
    const product = {
      id: 'p' + Date.now(),
      name: String(name).trim(),
      cat: cat === 'clothing' ? 'clothing' : 'shoes',
      price: String(price).trim(),
      wa: String(wa).replace(/[^0-9]/g, ''),
      img: '/uploads/' + req.file.filename,
    };
    products.unshift(product);
    saveProducts(products);
    res.status(201).json(product);
  });
});

app.delete('/api/products/:id', checkPasscode, (req, res) => {
  const products = loadProducts();
  const target = products.find(p => p.id === req.params.id);
  const remaining = products.filter(p => p.id !== req.params.id);
  saveProducts(remaining);
  if (target && target.img && target.img.startsWith('/uploads/')) {
    fs.unlink(path.join(UPLOADS_DIR, path.basename(target.img)), () => {});
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Street Drip is running at http://localhost:${PORT}`);
});
