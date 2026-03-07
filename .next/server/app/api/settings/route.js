"use strict";(()=>{var e={};e.id=668,e.ids=[668],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8893:e=>{e.exports=require("buffer")},4770:e=>{e.exports=require("crypto")},5315:e=>{e.exports=require("path")},6162:e=>{e.exports=require("stream")},1764:e=>{e.exports=require("util")},4620:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>L,requestAsyncStorage:()=>T,routeModule:()=>E,serverHooks:()=>m,staticGenerationAsyncStorage:()=>l});var i={};t.r(i),t.d(i,{GET:()=>p,PUT:()=>u});var s=t(9303),a=t(8716),n=t(670),o=t(7070),c=t(4603),d=t(9178);async function p(){try{let e=(0,c.zA)().prepare("SELECT * FROM app_settings WHERE id = 1").get();if(!e)return o.NextResponse.json({error:"Settings not found"},{status:404});return o.NextResponse.json({settings:e})}catch(e){return console.error("Get settings error:",e),o.NextResponse.json({error:"Internal server error"},{status:500})}}async function u(e){try{let r=await (0,d.xn)();if(!r)return o.NextResponse.json({error:"Not authenticated"},{status:401});if(!r.isAdmin)return o.NextResponse.json({error:"Admin access required"},{status:403});let{store_name:t,delivery_fee:i,min_order_amount:s,store_phone:a,store_address:n,is_store_open:p}=await e.json(),u=(0,c.zA)(),E=[],T=[];if(void 0!==t&&(E.push("store_name = ?"),T.push(t.trim())),void 0!==i){if("number"!=typeof i||i<0)return o.NextResponse.json({error:"Delivery fee must be a non-negative number"},{status:400});E.push("delivery_fee = ?"),T.push(i)}if(void 0!==s){if("number"!=typeof s||s<0)return o.NextResponse.json({error:"Minimum order amount must be a non-negative number"},{status:400});E.push("min_order_amount = ?"),T.push(s)}if(void 0!==a&&(E.push("store_phone = ?"),T.push(a.trim())),void 0!==n&&(E.push("store_address = ?"),T.push(n.trim())),void 0!==p&&(E.push("is_store_open = ?"),T.push(p?1:0)),0===E.length)return o.NextResponse.json({error:"No fields to update"},{status:400});T.push(1),u.prepare(`UPDATE app_settings SET ${E.join(", ")} WHERE id = ?`).run(...T);let l=u.prepare("SELECT * FROM app_settings WHERE id = 1").get();return o.NextResponse.json({settings:l})}catch(e){return console.error("Update settings error:",e),o.NextResponse.json({error:"Internal server error"},{status:500})}}let E=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/settings/route",pathname:"/api/settings",filename:"route",bundlePath:"app/api/settings/route"},resolvedPagePath:"/var/lib/freelancer/projects/40282459/forever-app/app/api/settings/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:T,staticGenerationAsyncStorage:l,serverHooks:m}=E,g="/api/settings/route";function L(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:l})}},9178:(e,r,t)=>{t.d(r,{fT:()=>o,xn:()=>c});var i=t(1482),s=t.n(i),a=t(1615);let n=process.env.JWT_SECRET||"forever-delivery-secret-key-2026";function o(e){return s().sign(e,n,{expiresIn:"7d"})}async function c(){let e=await (0,a.cookies)(),r=e.get("token")?.value;return r?function(e){try{return s().verify(e,n)}catch{return null}}(r):null}},4603:(e,r,t)=>{let i;t.d(r,{Ox:()=>u,m1:()=>E,zA:()=>p});let s=require("better-sqlite3");var a=t.n(s),n=t(5315),o=t.n(n),c=t(8691);let d=o().join(process.cwd(),"data","forever.db");function p(){return i||((i=new(a())(d)).pragma("journal_mode = WAL"),i.pragma("foreign_keys = ON"),function(e){if(e.exec(`
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
  `),0===e.prepare("SELECT COUNT(*) as c FROM categories").get().c&&function(e){let r=[{id:u(),name:"Pain Relief",slug:"pain-relief",description:"Painkillers and anti-inflammatory medications",type:"pharmacy",sort_order:1},{id:u(),name:"Cold & Flu",slug:"cold-flu",description:"Cold, flu, and allergy medications",type:"pharmacy",sort_order:2},{id:u(),name:"Vitamins",slug:"vitamins",description:"Daily vitamins and health supplements",type:"pharmacy",sort_order:3},{id:u(),name:"First Aid",slug:"first-aid",description:"Bandages, antiseptics, and first aid supplies",type:"pharmacy",sort_order:4},{id:u(),name:"Whiskey & Spirits",slug:"whiskey-spirits",description:"Whiskey, vodka, rum, gin and more",type:"liquor",sort_order:10},{id:u(),name:"Beer",slug:"beer",description:"Local and imported beers",type:"liquor",sort_order:11},{id:u(),name:"Wine",slug:"wine",description:"Red, white, and sparkling wines",type:"liquor",sort_order:12},{id:u(),name:"Arrack",slug:"arrack",description:"Traditional Sri Lankan arrack",type:"liquor",sort_order:13},{id:u(),name:"Skincare",slug:"skincare",description:"Face wash, moisturizers, and sunscreen",type:"cosmetics",sort_order:20},{id:u(),name:"Hair Care",slug:"hair-care",description:"Shampoo, conditioner, and hair treatments",type:"cosmetics",sort_order:21},{id:u(),name:"Makeup",slug:"makeup",description:"Lipstick, foundation, and beauty products",type:"cosmetics",sort_order:22},{id:u(),name:"Rice & Grains",slug:"rice-grains",description:"Rice, flour, and pulses",type:"rations",sort_order:30},{id:u(),name:"Cooking Essentials",slug:"cooking-essentials",description:"Oil, spices, and condiments",type:"rations",sort_order:31},{id:u(),name:"Canned & Packed",slug:"canned-packed",description:"Canned fish, baked beans, and packed goods",type:"rations",sort_order:32},{id:u(),name:"Chips & Crisps",slug:"chips-crisps",description:"Potato chips, nachos, and crispy snacks",type:"snacks",sort_order:40},{id:u(),name:"Biscuits & Cookies",slug:"biscuits-cookies",description:"Sweet and savory biscuits",type:"snacks",sort_order:41},{id:u(),name:"Chocolates & Sweets",slug:"chocolates-sweets",description:"Chocolates, candy, and toffees",type:"snacks",sort_order:42},{id:u(),name:"Soft Drinks",slug:"soft-drinks",description:"Carbonated drinks and sodas",type:"beverages",sort_order:50},{id:u(),name:"Juices",slug:"juices",description:"Fresh and packaged fruit juices",type:"beverages",sort_order:51},{id:u(),name:"Water & Energy",slug:"water-energy",description:"Bottled water and energy drinks",type:"beverages",sort_order:52}],t=e.prepare("INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)");for(let e of r)t.run(e.id,e.name,e.slug,e.description,e.type,e.sort_order);let i=new Map(r.map(e=>[e.slug,e.id])),s=e.prepare("INSERT INTO products (id, category_id, name, description, price, stock_quantity, unit, requires_prescription, is_age_restricted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(let e of[{cat:"pain-relief",name:"Panadol Extra 500mg (10 tablets)",desc:"Fast-acting pain relief tablets",price:120,stock:100,unit:"strip",rx:0,age:0},{cat:"pain-relief",name:"Ibuprofen 400mg (10 tablets)",desc:"Anti-inflammatory pain relief",price:85,stock:80,unit:"strip",rx:0,age:0},{cat:"cold-flu",name:"Actifed Syrup 100ml",desc:"Cold and allergy syrup",price:280,stock:60,unit:"bottle",rx:0,age:0},{cat:"cold-flu",name:"Strepsils Lozenges (8 pack)",desc:"Sore throat lozenges",price:180,stock:120,unit:"pack",rx:0,age:0},{cat:"vitamins",name:"Vitamin C 1000mg (30 tablets)",desc:"Daily immune support",price:450,stock:75,unit:"bottle",rx:0,age:0},{cat:"first-aid",name:"Dettol Antiseptic 100ml",desc:"Antiseptic liquid",price:320,stock:70,unit:"bottle",rx:0,age:0},{cat:"whiskey-spirits",name:"Johnnie Walker Red Label 750ml",desc:"Blended Scotch whisky",price:5500,stock:30,unit:"bottle",rx:0,age:1},{cat:"whiskey-spirits",name:"Smirnoff Vodka 750ml",desc:"Triple-distilled vodka",price:3800,stock:40,unit:"bottle",rx:0,age:1},{cat:"beer",name:"Lion Lager 625ml",desc:"Sri Lankas favorite lager",price:350,stock:200,unit:"bottle",rx:0,age:1},{cat:"beer",name:"Carlsberg 330ml (6 pack)",desc:"Premium Danish beer",price:1800,stock:80,unit:"pack",rx:0,age:1},{cat:"wine",name:"Carlo Rossi Red 750ml",desc:"California red wine",price:2800,stock:35,unit:"bottle",rx:0,age:1},{cat:"arrack",name:"DCSL VS Arrack 750ml",desc:"Premium coconut arrack",price:2200,stock:50,unit:"bottle",rx:0,age:1},{cat:"skincare",name:"Nivea Soft Moisturizer 200ml",desc:"Refreshingly soft moisturizing cream",price:650,stock:60,unit:"jar",rx:0,age:0},{cat:"skincare",name:"Lakme Sun Expert SPF 50",desc:"UV protection sunscreen",price:890,stock:40,unit:"tube",rx:0,age:0},{cat:"hair-care",name:"Sunsilk Shampoo 180ml",desc:"Smooth and manageable hair",price:380,stock:80,unit:"bottle",rx:0,age:0},{cat:"makeup",name:"Maybelline Lipstick",desc:"Long-lasting color lipstick",price:1200,stock:30,unit:"piece",rx:0,age:0},{cat:"rice-grains",name:"Nipuna White Rice 5kg",desc:"Premium quality white rice",price:1250,stock:50,unit:"bag",rx:0,age:0},{cat:"rice-grains",name:"Red Lentils (Dhal) 500g",desc:"Essential cooking lentils",price:320,stock:80,unit:"pack",rx:0,age:0},{cat:"cooking-essentials",name:"Coconut Oil 750ml",desc:"Pure coconut cooking oil",price:580,stock:60,unit:"bottle",rx:0,age:0},{cat:"cooking-essentials",name:"Curry Powder 100g",desc:"Authentic Sri Lankan curry powder",price:180,stock:100,unit:"pack",rx:0,age:0},{cat:"canned-packed",name:"Canned Tuna 185g",desc:"Tuna chunks in brine",price:450,stock:90,unit:"can",rx:0,age:0},{cat:"chips-crisps",name:"Lays Classic Salted 100g",desc:"Crispy potato chips",price:250,stock:100,unit:"pack",rx:0,age:0},{cat:"chips-crisps",name:"Pringles Original 110g",desc:"Stackable potato crisps",price:650,stock:60,unit:"can",rx:0,age:0},{cat:"biscuits-cookies",name:"Munchee Lemon Puff",desc:"Classic lemon cream biscuits",price:120,stock:120,unit:"pack",rx:0,age:0},{cat:"chocolates-sweets",name:"Cadbury Dairy Milk 110g",desc:"Smooth milk chocolate",price:480,stock:50,unit:"bar",rx:0,age:0},{cat:"soft-drinks",name:"Coca-Cola 1.5L",desc:"Classic cola drink",price:350,stock:100,unit:"bottle",rx:0,age:0},{cat:"soft-drinks",name:"Sprite 1.5L",desc:"Lemon-lime sparkling drink",price:350,stock:80,unit:"bottle",rx:0,age:0},{cat:"juices",name:"Elephant House Orange Juice 1L",desc:"Refreshing orange juice",price:280,stock:70,unit:"carton",rx:0,age:0},{cat:"water-energy",name:"Red Bull 250ml",desc:"Energy drink",price:450,stock:80,unit:"can",rx:0,age:0},{cat:"water-energy",name:"Aquafina Water 1.5L",desc:"Pure drinking water",price:120,stock:200,unit:"bottle",rx:0,age:0}])s.run(u(),i.get(e.cat),e.name,e.desc,e.price,e.stock,e.unit,e.rx,e.age)}(e),0===e.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin = 1").get().c){let r=c.ZP.hashSync("admin123",10);e.prepare("INSERT INTO users (id, email, password_hash, full_name, is_admin) VALUES (?, ?, ?, ?, 1)").run(u(),"admin@24seven.lk",r,"Admin")}0===e.prepare("SELECT COUNT(*) as c FROM app_settings").get().c&&e.prepare("INSERT INTO app_settings (store_name, delivery_fee, min_order_amount) VALUES ('24seven', 200.00, 0)").run()}(i)),i}function u(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{let r=16*Math.random()|0;return("x"===e?r:3&r|8).toString(16)})}function E(e){let r=e.prepare("SELECT order_number FROM orders WHERE order_number LIKE '24S-%' ORDER BY CAST(SUBSTR(order_number, 5) AS INTEGER) DESC LIMIT 1").get(),t=r?parseInt(r.order_number.substring(4))+1:1;return`24S-${String(t).padStart(4,"0")}`}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),i=r.X(0,[276,428],()=>t(4620));module.exports=i})();