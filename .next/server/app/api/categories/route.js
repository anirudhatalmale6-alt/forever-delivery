"use strict";(()=>{var e={};e.id=961,e.ids=[961],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},5315:e=>{e.exports=require("path")},6162:e=>{e.exports=require("stream")},1764:e=>{e.exports=require("util")},7619:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>L,patchFetch:()=>g,requestAsyncStorage:()=>u,routeModule:()=>E,serverHooks:()=>m,staticGenerationAsyncStorage:()=>l});var i={};t.r(i),t.d(i,{GET:()=>p,POST:()=>T});var a=t(9303),s=t(8716),n=t(670),o=t(7070),c=t(4603),d=t(9178);async function p(e){try{let r=(0,c.zA)(),{searchParams:t}=new URL(e.url),i=t.get("type"),a=`
      SELECT c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
      FROM categories c
      WHERE c.is_active = 1
    `,s=[];i&&(a+=" AND c.type = ?",s.push(i)),a+=" ORDER BY c.sort_order ASC, c.name ASC";let n=r.prepare(a).all(...s);return o.NextResponse.json({categories:n})}catch(e){return console.error("Get categories error:",e),o.NextResponse.json({error:"Internal server error"},{status:500})}}async function T(e){try{let r=await (0,d.xn)();if(!r)return o.NextResponse.json({error:"Not authenticated"},{status:401});if(!r.isAdmin)return o.NextResponse.json({error:"Admin access required"},{status:403});let{name:t,slug:i,description:a,type:s,sort_order:n}=await e.json();if(!t||!i||!s)return o.NextResponse.json({error:"Name, slug, and type are required"},{status:400});if(!["pharmacy","liquor"].includes(s))return o.NextResponse.json({error:'Type must be "pharmacy" or "liquor"'},{status:400});let p=(0,c.zA)();if(p.prepare("SELECT id FROM categories WHERE slug = ?").get(i))return o.NextResponse.json({error:"A category with this slug already exists"},{status:400});let T=(0,c.Ox)();p.prepare("INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)").run(T,t.trim(),i.trim(),a?.trim()||"",s,n||0);let E=p.prepare("SELECT * FROM categories WHERE id = ?").get(T);return o.NextResponse.json({category:E},{status:201})}catch(e){return console.error("Create category error:",e),o.NextResponse.json({error:"Internal server error"},{status:500})}}let E=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/categories/route",pathname:"/api/categories",filename:"route",bundlePath:"app/api/categories/route"},resolvedPagePath:"/var/lib/freelancer/projects/40282459/forever-app/app/api/categories/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:u,staticGenerationAsyncStorage:l,serverHooks:m}=E,L="/api/categories/route";function g(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:l})}},9178:(e,r,t)=>{t.d(r,{fT:()=>o,xn:()=>c});var i=t(1482),a=t.n(i),s=t(1615);let n=process.env.JWT_SECRET||"forever-delivery-secret-key-2026";function o(e){return a().sign(e,n,{expiresIn:"7d"})}async function c(){let e=await (0,s.cookies)(),r=e.get("token")?.value;return r?function(e){try{return a().verify(e,n)}catch{return null}}(r):null}},4603:(e,r,t)=>{let i;t.d(r,{Ox:()=>T,m1:()=>E,zA:()=>p});let a=require("better-sqlite3");var s=t.n(a),n=t(5315),o=t.n(n),c=t(8691);let d=o().join(process.cwd(),"data","forever.db");function p(){return i||((i=new(s())(d)).pragma("journal_mode = WAL"),i.pragma("foreign_keys = ON"),function(e){if(e.exec(`
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
  `),0===e.prepare("SELECT COUNT(*) as c FROM categories").get().c&&function(e){let r=[{id:T(),name:"Pain Relief",slug:"pain-relief",description:"Painkillers and anti-inflammatory medications",type:"pharmacy",sort_order:1},{id:T(),name:"Cold & Flu",slug:"cold-flu",description:"Cold, flu, and allergy medications",type:"pharmacy",sort_order:2},{id:T(),name:"Vitamins & Supplements",slug:"vitamins-supplements",description:"Daily vitamins and health supplements",type:"pharmacy",sort_order:3},{id:T(),name:"First Aid",slug:"first-aid",description:"Bandages, antiseptics, and first aid supplies",type:"pharmacy",sort_order:4},{id:T(),name:"Personal Care",slug:"personal-care",description:"Hygiene and personal care products",type:"pharmacy",sort_order:5},{id:T(),name:"Whiskey",slug:"whiskey",description:"Premium whiskey and bourbon selections",type:"liquor",sort_order:10},{id:T(),name:"Beer",slug:"beer",description:"Local and imported beers",type:"liquor",sort_order:11},{id:T(),name:"Wine",slug:"wine",description:"Red, white, and sparkling wines",type:"liquor",sort_order:12},{id:T(),name:"Arrack",slug:"arrack",description:"Traditional Sri Lankan arrack",type:"liquor",sort_order:13},{id:T(),name:"Spirits",slug:"spirits",description:"Vodka, rum, gin, and other spirits",type:"liquor",sort_order:14}],t=e.prepare("INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)");for(let e of r)t.run(e.id,e.name,e.slug,e.description,e.type,e.sort_order);let i=new Map(r.map(e=>[e.slug,e.id])),a=e.prepare("INSERT INTO products (id, category_id, name, description, price, stock_quantity, unit, requires_prescription, is_age_restricted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(let e of[{cat:"pain-relief",name:"Panadol Extra 500mg (10 tablets)",desc:"Fast-acting pain relief tablets",price:120,stock:100,unit:"strip",rx:0,age:0},{cat:"pain-relief",name:"Ibuprofen 400mg (10 tablets)",desc:"Anti-inflammatory pain relief",price:85,stock:80,unit:"strip",rx:0,age:0},{cat:"pain-relief",name:"Diclofenac Gel 30g",desc:"Topical pain relief gel",price:350,stock:50,unit:"tube",rx:0,age:0},{cat:"cold-flu",name:"Actifed Syrup 100ml",desc:"Cold and allergy syrup",price:280,stock:60,unit:"bottle",rx:0,age:0},{cat:"cold-flu",name:"Strepsils Lozenges (8 pack)",desc:"Sore throat lozenges",price:180,stock:120,unit:"pack",rx:0,age:0},{cat:"vitamins-supplements",name:"Vitamin C 1000mg (30 tablets)",desc:"Daily immune support",price:450,stock:75,unit:"bottle",rx:0,age:0},{cat:"vitamins-supplements",name:"Centrum Multivitamin (30 tablets)",desc:"Complete daily multivitamin",price:1200,stock:40,unit:"bottle",rx:0,age:0},{cat:"first-aid",name:"Band-Aid Assorted (20 pack)",desc:"Adhesive bandages",price:250,stock:90,unit:"pack",rx:0,age:0},{cat:"first-aid",name:"Dettol Antiseptic 100ml",desc:"Antiseptic liquid",price:320,stock:70,unit:"bottle",rx:0,age:0},{cat:"personal-care",name:"Signal Toothpaste 120g",desc:"Cavity protection toothpaste",price:195,stock:100,unit:"tube",rx:0,age:0},{cat:"whiskey",name:"Johnnie Walker Red Label 750ml",desc:"Blended Scotch whisky",price:5500,stock:30,unit:"bottle",rx:0,age:1},{cat:"whiskey",name:"Jack Daniels 750ml",desc:"Tennessee whiskey",price:7200,stock:25,unit:"bottle",rx:0,age:1},{cat:"beer",name:"Lion Lager 625ml",desc:"Sri Lankas favorite lager",price:350,stock:200,unit:"bottle",rx:0,age:1},{cat:"beer",name:"Carlsberg 330ml (6 pack)",desc:"Premium Danish beer",price:1800,stock:80,unit:"pack",rx:0,age:1},{cat:"wine",name:"Carlo Rossi Red 750ml",desc:"California red wine",price:2800,stock:35,unit:"bottle",rx:0,age:1},{cat:"arrack",name:"DCSL VS Arrack 750ml",desc:"Premium coconut arrack",price:2200,stock:50,unit:"bottle",rx:0,age:1},{cat:"arrack",name:"Old Reserve Arrack 375ml",desc:"Classic Sri Lankan arrack",price:850,stock:100,unit:"bottle",rx:0,age:1},{cat:"spirits",name:"Smirnoff Vodka 750ml",desc:"Triple-distilled vodka",price:3800,stock:40,unit:"bottle",rx:0,age:1},{cat:"spirits",name:"Bacardi White Rum 750ml",desc:"Premium white rum",price:4200,stock:35,unit:"bottle",rx:0,age:1},{cat:"spirits",name:"Gordons Gin 750ml",desc:"London dry gin",price:4500,stock:30,unit:"bottle",rx:0,age:1}])a.run(T(),i.get(e.cat),e.name,e.desc,e.price,e.stock,e.unit,e.rx,e.age)}(e),0===e.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin = 1").get().c){let r=c.ZP.hashSync("admin123",10);e.prepare("INSERT INTO users (id, email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?, 1)").run(T(),"admin@forever.lk",r,"Admin")}0===e.prepare("SELECT COUNT(*) as c FROM app_settings").get().c&&e.prepare("INSERT INTO app_settings (store_name, delivery_fee, min_order_amount) VALUES ('Forever', 200.00, 500.00)").run()}(i)),i}function T(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{let r=16*Math.random()|0;return("x"===e?r:3&r|8).toString(16)})}function E(e){let r=e.prepare("SELECT order_number FROM orders WHERE order_number LIKE 'FRV-%' ORDER BY CAST(SUBSTR(order_number, 5) AS INTEGER) DESC LIMIT 1").get(),t=r?parseInt(r.order_number.substring(4))+1:1;return`FRV-${String(t).padStart(4,"0")}`}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),i=r.X(0,[276,428],()=>t(7619));module.exports=i})();