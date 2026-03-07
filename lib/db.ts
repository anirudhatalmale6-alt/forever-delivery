import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'forever.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      type TEXT NOT NULL CHECK (type IN ('pharmacy', 'liquor', 'cosmetics', 'rations', 'snacks', 'beverages')),
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      image_url TEXT DEFAULT '',
      sku TEXT DEFAULT '',
      stock_quantity INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      requires_prescription INTEGER DEFAULT 0,
      is_age_restricted INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'piece',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
      subtotal REAL NOT NULL DEFAULT 0,
      delivery_fee REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT DEFAULT 'cod',
      delivery_address TEXT NOT NULL,
      delivery_city TEXT DEFAULT '',
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      line_total REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      store_name TEXT DEFAULT '24seven',
      delivery_fee REAL DEFAULT 200.00,
      min_order_amount REAL DEFAULT 500.00,
      store_phone TEXT DEFAULT '',
      store_address TEXT DEFAULT '',
      is_store_open INTEGER DEFAULT 1
    );
  `);

  // Seed data if empty
  const catCount = database.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (catCount.c === 0) {
    seedData(database);
  }

  // Ensure admin user exists
  const adminCount = database.prepare('SELECT COUNT(*) as c FROM users WHERE is_admin = 1').get() as { c: number };
  if (adminCount.c === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    database.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?, 1)`
    ).run(generateId(), 'admin@24seven.lk', hash, 'Admin');
  }

  // Ensure settings exist
  const settingsCount = database.prepare('SELECT COUNT(*) as c FROM app_settings').get() as { c: number };
  if (settingsCount.c === 0) {
    database.prepare(`INSERT INTO app_settings (store_name, delivery_fee, min_order_amount) VALUES ('24seven', 200.00, 0)`).run();
  }
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function seedData(database: Database.Database) {
  const cats = [
    // Pharmacy
    { id: generateId(), name: 'Pain Relief', slug: 'pain-relief', description: 'Painkillers and anti-inflammatory medications', type: 'pharmacy', sort_order: 1 },
    { id: generateId(), name: 'Cold & Flu', slug: 'cold-flu', description: 'Cold, flu, and allergy medications', type: 'pharmacy', sort_order: 2 },
    { id: generateId(), name: 'Vitamins', slug: 'vitamins', description: 'Daily vitamins and health supplements', type: 'pharmacy', sort_order: 3 },
    { id: generateId(), name: 'First Aid', slug: 'first-aid', description: 'Bandages, antiseptics, and first aid supplies', type: 'pharmacy', sort_order: 4 },
    // Liquor
    { id: generateId(), name: 'Whiskey & Spirits', slug: 'whiskey-spirits', description: 'Whiskey, vodka, rum, gin and more', type: 'liquor', sort_order: 10 },
    { id: generateId(), name: 'Beer', slug: 'beer', description: 'Local and imported beers', type: 'liquor', sort_order: 11 },
    { id: generateId(), name: 'Wine', slug: 'wine', description: 'Red, white, and sparkling wines', type: 'liquor', sort_order: 12 },
    { id: generateId(), name: 'Arrack', slug: 'arrack', description: 'Traditional Sri Lankan arrack', type: 'liquor', sort_order: 13 },
    // Cosmetics
    { id: generateId(), name: 'Skincare', slug: 'skincare', description: 'Face wash, moisturizers, and sunscreen', type: 'cosmetics', sort_order: 20 },
    { id: generateId(), name: 'Hair Care', slug: 'hair-care', description: 'Shampoo, conditioner, and hair treatments', type: 'cosmetics', sort_order: 21 },
    { id: generateId(), name: 'Makeup', slug: 'makeup', description: 'Lipstick, foundation, and beauty products', type: 'cosmetics', sort_order: 22 },
    // Rations
    { id: generateId(), name: 'Rice & Grains', slug: 'rice-grains', description: 'Rice, flour, and pulses', type: 'rations', sort_order: 30 },
    { id: generateId(), name: 'Cooking Essentials', slug: 'cooking-essentials', description: 'Oil, spices, and condiments', type: 'rations', sort_order: 31 },
    { id: generateId(), name: 'Canned & Packed', slug: 'canned-packed', description: 'Canned fish, baked beans, and packed goods', type: 'rations', sort_order: 32 },
    // Snacks
    { id: generateId(), name: 'Chips & Crisps', slug: 'chips-crisps', description: 'Potato chips, nachos, and crispy snacks', type: 'snacks', sort_order: 40 },
    { id: generateId(), name: 'Biscuits & Cookies', slug: 'biscuits-cookies', description: 'Sweet and savory biscuits', type: 'snacks', sort_order: 41 },
    { id: generateId(), name: 'Chocolates & Sweets', slug: 'chocolates-sweets', description: 'Chocolates, candy, and toffees', type: 'snacks', sort_order: 42 },
    // Beverages
    { id: generateId(), name: 'Soft Drinks', slug: 'soft-drinks', description: 'Carbonated drinks and sodas', type: 'beverages', sort_order: 50 },
    { id: generateId(), name: 'Juices', slug: 'juices', description: 'Fresh and packaged fruit juices', type: 'beverages', sort_order: 51 },
    { id: generateId(), name: 'Water & Energy', slug: 'water-energy', description: 'Bottled water and energy drinks', type: 'beverages', sort_order: 52 },
  ];

  const insertCat = database.prepare(
    `INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const c of cats) {
    insertCat.run(c.id, c.name, c.slug, c.description, c.type, c.sort_order);
  }

  const catMap = new Map(cats.map(c => [c.slug, c.id]));

  const products = [
    // Pharmacy
    { cat: 'pain-relief', name: 'Panadol Extra 500mg (10 tablets)', desc: 'Fast-acting pain relief tablets', price: 120, stock: 100, unit: 'strip', rx: 0, age: 0 },
    { cat: 'pain-relief', name: 'Ibuprofen 400mg (10 tablets)', desc: 'Anti-inflammatory pain relief', price: 85, stock: 80, unit: 'strip', rx: 0, age: 0 },
    { cat: 'cold-flu', name: 'Actifed Syrup 100ml', desc: 'Cold and allergy syrup', price: 280, stock: 60, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'cold-flu', name: 'Strepsils Lozenges (8 pack)', desc: 'Sore throat lozenges', price: 180, stock: 120, unit: 'pack', rx: 0, age: 0 },
    { cat: 'vitamins', name: 'Vitamin C 1000mg (30 tablets)', desc: 'Daily immune support', price: 450, stock: 75, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'first-aid', name: 'Dettol Antiseptic 100ml', desc: 'Antiseptic liquid', price: 320, stock: 70, unit: 'bottle', rx: 0, age: 0 },
    // Liquor
    { cat: 'whiskey-spirits', name: 'Johnnie Walker Red Label 750ml', desc: 'Blended Scotch whisky', price: 5500, stock: 30, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'whiskey-spirits', name: 'Smirnoff Vodka 750ml', desc: 'Triple-distilled vodka', price: 3800, stock: 40, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'beer', name: 'Lion Lager 625ml', desc: 'Sri Lankas favorite lager', price: 350, stock: 200, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'beer', name: 'Carlsberg 330ml (6 pack)', desc: 'Premium Danish beer', price: 1800, stock: 80, unit: 'pack', rx: 0, age: 1 },
    { cat: 'wine', name: 'Carlo Rossi Red 750ml', desc: 'California red wine', price: 2800, stock: 35, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'arrack', name: 'DCSL VS Arrack 750ml', desc: 'Premium coconut arrack', price: 2200, stock: 50, unit: 'bottle', rx: 0, age: 1 },
    // Cosmetics
    { cat: 'skincare', name: 'Nivea Soft Moisturizer 200ml', desc: 'Refreshingly soft moisturizing cream', price: 650, stock: 60, unit: 'jar', rx: 0, age: 0 },
    { cat: 'skincare', name: 'Lakme Sun Expert SPF 50', desc: 'UV protection sunscreen', price: 890, stock: 40, unit: 'tube', rx: 0, age: 0 },
    { cat: 'hair-care', name: 'Sunsilk Shampoo 180ml', desc: 'Smooth and manageable hair', price: 380, stock: 80, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'makeup', name: 'Maybelline Lipstick', desc: 'Long-lasting color lipstick', price: 1200, stock: 30, unit: 'piece', rx: 0, age: 0 },
    // Rations
    { cat: 'rice-grains', name: 'Nipuna White Rice 5kg', desc: 'Premium quality white rice', price: 1250, stock: 50, unit: 'bag', rx: 0, age: 0 },
    { cat: 'rice-grains', name: 'Red Lentils (Dhal) 500g', desc: 'Essential cooking lentils', price: 320, stock: 80, unit: 'pack', rx: 0, age: 0 },
    { cat: 'cooking-essentials', name: 'Coconut Oil 750ml', desc: 'Pure coconut cooking oil', price: 580, stock: 60, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'cooking-essentials', name: 'Curry Powder 100g', desc: 'Authentic Sri Lankan curry powder', price: 180, stock: 100, unit: 'pack', rx: 0, age: 0 },
    { cat: 'canned-packed', name: 'Canned Tuna 185g', desc: 'Tuna chunks in brine', price: 450, stock: 90, unit: 'can', rx: 0, age: 0 },
    // Snacks
    { cat: 'chips-crisps', name: 'Lays Classic Salted 100g', desc: 'Crispy potato chips', price: 250, stock: 100, unit: 'pack', rx: 0, age: 0 },
    { cat: 'chips-crisps', name: 'Pringles Original 110g', desc: 'Stackable potato crisps', price: 650, stock: 60, unit: 'can', rx: 0, age: 0 },
    { cat: 'biscuits-cookies', name: 'Munchee Lemon Puff', desc: 'Classic lemon cream biscuits', price: 120, stock: 120, unit: 'pack', rx: 0, age: 0 },
    { cat: 'chocolates-sweets', name: 'Cadbury Dairy Milk 110g', desc: 'Smooth milk chocolate', price: 480, stock: 50, unit: 'bar', rx: 0, age: 0 },
    // Beverages
    { cat: 'soft-drinks', name: 'Coca-Cola 1.5L', desc: 'Classic cola drink', price: 350, stock: 100, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'soft-drinks', name: 'Sprite 1.5L', desc: 'Lemon-lime sparkling drink', price: 350, stock: 80, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'juices', name: 'Elephant House Orange Juice 1L', desc: 'Refreshing orange juice', price: 280, stock: 70, unit: 'carton', rx: 0, age: 0 },
    { cat: 'water-energy', name: 'Red Bull 250ml', desc: 'Energy drink', price: 450, stock: 80, unit: 'can', rx: 0, age: 0 },
    { cat: 'water-energy', name: 'Aquafina Water 1.5L', desc: 'Pure drinking water', price: 120, stock: 200, unit: 'bottle', rx: 0, age: 0 },
  ];

  const insertProd = database.prepare(
    `INSERT INTO products (id, category_id, name, description, price, stock_quantity, unit, requires_prescription, is_age_restricted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const p of products) {
    insertProd.run(generateId(), catMap.get(p.cat), p.name, p.desc, p.price, p.stock, p.unit, p.rx, p.age);
  }
}

export function generateOrderNumber(database: Database.Database): string {
  const result = database.prepare(
    `SELECT order_number FROM orders WHERE order_number LIKE '24S-%' ORDER BY CAST(SUBSTR(order_number, 5) AS INTEGER) DESC LIMIT 1`
  ).get() as { order_number: string } | undefined;

  const nextNum = result ? parseInt(result.order_number.substring(4)) + 1 : 1;
  return `24S-${String(nextNum).padStart(4, '0')}`;
}

export { getDb, generateId };
