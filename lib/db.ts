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
      type TEXT NOT NULL CHECK (type IN ('pharmacy', 'liquor')),
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
      store_name TEXT DEFAULT 'Forever',
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
    ).run(generateId(), 'admin@forever.lk', hash, 'Admin');
  }

  // Ensure settings exist
  const settingsCount = database.prepare('SELECT COUNT(*) as c FROM app_settings').get() as { c: number };
  if (settingsCount.c === 0) {
    database.prepare(`INSERT INTO app_settings (store_name, delivery_fee, min_order_amount) VALUES ('Forever', 200.00, 0)`).run();
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
    { id: generateId(), name: 'Pain Relief', slug: 'pain-relief', description: 'Painkillers and anti-inflammatory medications', type: 'pharmacy', sort_order: 1 },
    { id: generateId(), name: 'Cold & Flu', slug: 'cold-flu', description: 'Cold, flu, and allergy medications', type: 'pharmacy', sort_order: 2 },
    { id: generateId(), name: 'Vitamins & Supplements', slug: 'vitamins-supplements', description: 'Daily vitamins and health supplements', type: 'pharmacy', sort_order: 3 },
    { id: generateId(), name: 'First Aid', slug: 'first-aid', description: 'Bandages, antiseptics, and first aid supplies', type: 'pharmacy', sort_order: 4 },
    { id: generateId(), name: 'Personal Care', slug: 'personal-care', description: 'Hygiene and personal care products', type: 'pharmacy', sort_order: 5 },
    { id: generateId(), name: 'Whiskey', slug: 'whiskey', description: 'Premium whiskey and bourbon selections', type: 'liquor', sort_order: 10 },
    { id: generateId(), name: 'Beer', slug: 'beer', description: 'Local and imported beers', type: 'liquor', sort_order: 11 },
    { id: generateId(), name: 'Wine', slug: 'wine', description: 'Red, white, and sparkling wines', type: 'liquor', sort_order: 12 },
    { id: generateId(), name: 'Arrack', slug: 'arrack', description: 'Traditional Sri Lankan arrack', type: 'liquor', sort_order: 13 },
    { id: generateId(), name: 'Spirits', slug: 'spirits', description: 'Vodka, rum, gin, and other spirits', type: 'liquor', sort_order: 14 },
  ];

  const insertCat = database.prepare(
    `INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const c of cats) {
    insertCat.run(c.id, c.name, c.slug, c.description, c.type, c.sort_order);
  }

  const catMap = new Map(cats.map(c => [c.slug, c.id]));

  const products = [
    { cat: 'pain-relief', name: 'Panadol Extra 500mg (10 tablets)', desc: 'Fast-acting pain relief tablets', price: 120, stock: 100, unit: 'strip', rx: 0, age: 0 },
    { cat: 'pain-relief', name: 'Ibuprofen 400mg (10 tablets)', desc: 'Anti-inflammatory pain relief', price: 85, stock: 80, unit: 'strip', rx: 0, age: 0 },
    { cat: 'pain-relief', name: 'Diclofenac Gel 30g', desc: 'Topical pain relief gel', price: 350, stock: 50, unit: 'tube', rx: 0, age: 0 },
    { cat: 'cold-flu', name: 'Actifed Syrup 100ml', desc: 'Cold and allergy syrup', price: 280, stock: 60, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'cold-flu', name: 'Strepsils Lozenges (8 pack)', desc: 'Sore throat lozenges', price: 180, stock: 120, unit: 'pack', rx: 0, age: 0 },
    { cat: 'vitamins-supplements', name: 'Vitamin C 1000mg (30 tablets)', desc: 'Daily immune support', price: 450, stock: 75, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'vitamins-supplements', name: 'Centrum Multivitamin (30 tablets)', desc: 'Complete daily multivitamin', price: 1200, stock: 40, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'first-aid', name: 'Band-Aid Assorted (20 pack)', desc: 'Adhesive bandages', price: 250, stock: 90, unit: 'pack', rx: 0, age: 0 },
    { cat: 'first-aid', name: 'Dettol Antiseptic 100ml', desc: 'Antiseptic liquid', price: 320, stock: 70, unit: 'bottle', rx: 0, age: 0 },
    { cat: 'personal-care', name: 'Signal Toothpaste 120g', desc: 'Cavity protection toothpaste', price: 195, stock: 100, unit: 'tube', rx: 0, age: 0 },
    { cat: 'whiskey', name: 'Johnnie Walker Red Label 750ml', desc: 'Blended Scotch whisky', price: 5500, stock: 30, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'whiskey', name: 'Jack Daniels 750ml', desc: 'Tennessee whiskey', price: 7200, stock: 25, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'beer', name: 'Lion Lager 625ml', desc: 'Sri Lankas favorite lager', price: 350, stock: 200, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'beer', name: 'Carlsberg 330ml (6 pack)', desc: 'Premium Danish beer', price: 1800, stock: 80, unit: 'pack', rx: 0, age: 1 },
    { cat: 'wine', name: 'Carlo Rossi Red 750ml', desc: 'California red wine', price: 2800, stock: 35, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'arrack', name: 'DCSL VS Arrack 750ml', desc: 'Premium coconut arrack', price: 2200, stock: 50, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'arrack', name: 'Old Reserve Arrack 375ml', desc: 'Classic Sri Lankan arrack', price: 850, stock: 100, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'spirits', name: 'Smirnoff Vodka 750ml', desc: 'Triple-distilled vodka', price: 3800, stock: 40, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'spirits', name: 'Bacardi White Rum 750ml', desc: 'Premium white rum', price: 4200, stock: 35, unit: 'bottle', rx: 0, age: 1 },
    { cat: 'spirits', name: 'Gordons Gin 750ml', desc: 'London dry gin', price: 4500, stock: 30, unit: 'bottle', rx: 0, age: 1 },
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
    `SELECT order_number FROM orders WHERE order_number LIKE 'FRV-%' ORDER BY CAST(SUBSTR(order_number, 5) AS INTEGER) DESC LIMIT 1`
  ).get() as { order_number: string } | undefined;

  const nextNum = result ? parseInt(result.order_number.substring(4)) + 1 : 1;
  return `FRV-${String(nextNum).padStart(4, '0')}`;
}

export { getDb, generateId };
