import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { redis } from './redis.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients (ports 5173, 5174, etc.)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

console.log('=== Initializing Amigos API Services ===');

// --- 1. AUTH / LOGIN ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Auth request for: ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        permissions: [] // Will be populated dynamically on frontend or role-based
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 2. CATEGORIES ENDPOINTS ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 3. MENU ENDPOINTS ---
app.get('/api/menu', async (req, res) => {
  const { category, isVeg, search, storeId } = req.query;
  const activeStoreId = (storeId as string) || 'store_001';

  try {
    const whereClause: any = {};
    if (category) whereClause.category = category as string;
    if (isVeg !== undefined) whereClause.isVeg = isVeg === 'true';
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Fetch menu items matching clause
    const items = await prisma.menuItem.findMany({ where: whereClause });

    // Fetch store availability overrides
    const availabilities = await prisma.storeAvailability.findMany({
      where: { storeId: activeStoreId }
    });

    const availabilityMap = new Map(availabilities.map(a => [a.menuItemId, a.available]));
    const priceOverrideMap = new Map(availabilities.map(a => [a.menuItemId, a.priceOverride]));

    // Map the items with their store availability
    const mappedItems = items.map(item => {
      const isAvailable = availabilityMap.has(item.id) ? availabilityMap.get(item.id) : true;
      const overridePrice = priceOverrideMap.has(item.id) ? priceOverrideMap.get(item.id) : null;
      return {
        ...item,
        available: isAvailable,
        isAvailable: isAvailable,
        priceOverride: overridePrice,
        basePrice: overridePrice !== null && overridePrice !== undefined ? overridePrice : item.basePrice,
        isOverride: overridePrice !== null && overridePrice !== undefined
      };
    });

    res.json({ success: true, data: mappedItems });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save/Update entire Master Menu Catalog (Sync from Admin HQ)
app.post('/api/menu', async (req, res) => {
  const { menuItems } = req.body;
  if (!Array.isArray(menuItems)) {
    return res.status(400).json({ success: false, error: 'menuItems must be an array.' });
  }

  try {
    console.log(`Syncing ${menuItems.length} catalog items to PostgreSQL...`);
    for (const item of menuItems) {
      await prisma.menuItem.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          category: item.category,
          isVeg: item.isVeg,
          description: item.description,
          image: item.image,
          basePrice: item.basePrice,
          prices: item.prices || {},
          isBestseller: item.isBestseller || false,
          customizable: item.customizable || false
        },
        create: {
          id: item.id,
          name: item.name,
          category: item.category,
          isVeg: item.isVeg,
          description: item.description,
          image: item.image,
          basePrice: item.basePrice,
          prices: item.prices || {},
          isBestseller: item.isBestseller || false,
          customizable: item.customizable || false
        }
      });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error syncing menu:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a Master Menu Item
app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const item = req.body;
  try {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name: item.name,
        category: item.category,
        isVeg: item.isVeg,
        description: item.description,
        image: item.image,
        basePrice: parseFloat(item.basePrice),
        prices: item.prices || {},
        isBestseller: item.isBestseller || false,
        customizable: item.customizable || false
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new Master Menu Item
app.post('/api/menu/item', async (req, res) => {
  const item = req.body;
  const newId = item.id || item.name.toLowerCase().replace(/\s+/g, '-');
  try {
    const created = await prisma.menuItem.create({
      data: {
        id: newId,
        name: item.name,
        category: item.category,
        isVeg: item.isVeg,
        description: item.description,
        image: item.image || '',
        basePrice: parseFloat(item.basePrice),
        prices: item.prices || {},
        isBestseller: item.isBestseller || false,
        customizable: item.customizable || false
      }
    });
    res.json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle Store Availability
app.put('/api/menu/availability', async (req, res) => {
  const { id, menuItemId, storeId, available, isAvailable } = req.body;
  const activeItemId = id || menuItemId;
  const activeAvailable = available !== undefined ? available : isAvailable;

  try {
    await prisma.storeAvailability.upsert({
      where: {
        storeId_menuItemId: {
          storeId,
          menuItemId: activeItemId
        }
      },
      update: { available: activeAvailable },
      create: {
        storeId,
        menuItemId: activeItemId,
        available: activeAvailable
      }
    });

    res.json({ success: true, data: { id: activeItemId, storeId, available: activeAvailable } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Store Price Override
app.put('/api/menu/price-override', async (req, res) => {
  const { storeId, menuItemId, priceOverride } = req.body;
  try {
    const overrideVal = priceOverride !== null ? parseFloat(priceOverride) : null;
    await prisma.storeAvailability.upsert({
      where: {
        storeId_menuItemId: { storeId, menuItemId }
      },
      update: { priceOverride: overrideVal },
      create: { storeId, menuItemId, priceOverride: overrideVal, available: true }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset Store Price Override
app.post('/api/menu/price-override/reset', async (req, res) => {
  const { storeId, menuItemId } = req.body;
  try {
    await prisma.storeAvailability.upsert({
      where: {
        storeId_menuItemId: { storeId, menuItemId }
      },
      update: { priceOverride: null },
      create: { storeId, menuItemId, priceOverride: null, available: true }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 4. BANNERS ENDPOINTS ---
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/banners', async (req, res) => {
  const { banners } = req.body;
  if (!Array.isArray(banners)) {
    return res.status(400).json({ success: false, error: 'banners must be an array.' });
  }

  try {
    console.log('Replacing banner configurations on PostgreSQL...');
    await prisma.banner.deleteMany({});
    for (const b of banners) {
      await prisma.banner.create({
        data: {
          title: b.title,
          subtitle: b.subtitle,
          code: b.code || null,
          bg: b.bg,
          image: b.image
        }
      });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 5. PROMOTIONS / COUPONS ENDPOINTS ---
app.get('/api/promotions', async (req, res) => {
  try {
    const promos = await prisma.promotion.findMany();
    res.json({ success: true, data: promos });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/promotions', async (req, res) => {
  const promo = req.body;
  try {
    const upserted = await prisma.promotion.upsert({
      where: { code: promo.code },
      update: {
        title: promo.title,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderValue: promo.minOrderValue,
        maxDiscount: promo.maxDiscount,
        startDate: promo.startDate,
        endDate: promo.endDate,
        scopeType: promo.scopeType,
        scopeId: promo.scopeId,
        isActive: promo.isActive !== false
      },
      create: {
        code: promo.code,
        title: promo.title,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderValue: promo.minOrderValue,
        maxDiscount: promo.maxDiscount,
        startDate: promo.startDate,
        endDate: promo.endDate,
        scopeType: promo.scopeType,
        scopeId: promo.scopeId,
        isActive: promo.isActive !== false
      }
    });
    res.json({ success: true, data: upserted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 5.5. PROMOTIONS OVERRIDES ENDPOINTS ---
app.get('/api/promotions/overrides', async (req, res) => {
  try {
    const overrides = await prisma.promoOverride.findMany();
    const formatted: any = {};
    for (const o of overrides) {
      if (!formatted[o.storeId]) {
        formatted[o.storeId] = {};
      }
      formatted[o.storeId][o.promoCode] = o.enabled;
    }
    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/promotions/overrides', async (req, res) => {
  const { storeId, promoCode, enabled } = req.body;
  try {
    await prisma.promoOverride.upsert({
      where: {
        storeId_promoCode: { storeId, promoCode }
      },
      update: { enabled },
      create: { storeId, promoCode, enabled }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/promotions/overrides/bulk', async (req, res) => {
  const { storeIds, promoCode, enabled } = req.body;
  try {
    for (const storeId of storeIds) {
      await prisma.promoOverride.upsert({
        where: {
          storeId_promoCode: { storeId, promoCode }
        },
        update: { enabled },
        create: { storeId, promoCode, enabled }
      });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/promotions/:code/status', async (req, res) => {
  const { code } = req.params;
  const { isActive } = req.body;
  try {
    const updated = await prisma.promotion.update({
      where: { code },
      data: { isActive }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 6. ORDERS ENDPOINTS ---
app.get('/api/orders', async (req, res) => {
  const { storeId } = req.query;
  try {
    const whereClause: any = {};
    if (storeId) {
      const storeIds = (storeId as string).split(',');
      whereClause.storeId = { in: storeIds };
    }
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { id: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const payload = req.body;

  try {
    // Generate Order ID (A1001, A1002...)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { id: 'desc' }
    });
    
    let nextNum = 1001;
    if (lastOrder) {
      const match = lastOrder.id.match(/\d+/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }
    const newId = `A${nextNum}`;
    const timeString = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder = await prisma.order.create({
      data: {
        id: newId,
        storeId: payload.storeId || null,
        storeName: payload.storeName || null,
        driverName: payload.driverName || null,
        date: timeString,
        status: 'Placed',
        itemTotal: payload.itemTotal,
        deliveryFee: payload.deliveryFee,
        taxes: payload.taxes,
        discount: payload.discount,
        toPay: payload.toPay,
        paymentMethod: payload.paymentMethod || 'UPI',
        address: payload.address,
        customer: payload.customer || { name: 'Rahul Sharma', phone: '9876543210' },
        items: payload.items
      }
    });

    console.log(`Placed new order: ${newId}`);
    res.json({ success: true, data: newOrder });
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, driverName } = req.body;

  try {
    const updateData: any = { status };
    if (driverName !== undefined) {
      updateData.driverName = driverName;
    }
    const updated = await prisma.order.update({
      where: { id },
      data: updateData
    });
    console.log(`Updated Order ${id} status to: ${status}${driverName ? ` (Driver: ${driverName})` : ''}`);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 7. RIDER REAL-TIME TRACKING ENDPOINTS (REDIS) ---
app.post('/api/rider/location', async (req, res) => {
  const { orderId, latitude, longitude } = req.body;
  if (!orderId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'Missing coordinates or order ID.' });
  }

  try {
    // Store coordinates in Redis with 1 hour expiration
    const key = `rider_loc:${orderId}`;
    await redis.hset(key, { latitude: String(latitude), longitude: String(longitude) });
    await redis.expire(key, 3600); // 1 hour TTL

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/rider/location/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const key = `rider_loc:${orderId}`;
    const data = await redis.hgetall(key);
    
    if (!data || !data.latitude || !data.longitude) {
      return res.json({ success: true, data: null });
    }

    res.json({
      success: true,
      data: {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 8. FRANCHISE & STORE ENDPOINTS ---
app.get('/api/franchises', async (req, res) => {
  try {
    const franchises = await prisma.franchise.findMany({
      include: { stores: true }
    });
    res.json({ success: true, data: franchises });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/franchises', async (req, res) => {
  const payload = req.body;
  try {
    const lastFranchise = await prisma.franchise.findFirst({
      orderBy: { id: 'desc' }
    });
    let nextNum = 1;
    if (lastFranchise) {
      const match = lastFranchise.id.match(/\d+/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }
    const newId = `fr_${String(nextNum).padStart(3, '0')}`;
    const newFranchise = await prisma.franchise.create({
      data: {
        id: newId,
        name: payload.name,
        district: payload.district || '',
        ownerName: payload.ownerName || '',
        email: payload.email || '',
        phone: payload.phone || '',
        address: payload.address || ''
      }
    });
    res.json({ success: true, data: newFranchise });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/franchises/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const updated = await prisma.franchise.update({
      where: { id },
      data: {
        name: payload.name,
        district: payload.district,
        ownerName: payload.ownerName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/franchises/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.franchise.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stores', async (req, res) => {
  try {
    const stores = await prisma.store.findMany();
    res.json({ success: true, data: stores });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stores', async (req, res) => {
  const payload = req.body;
  try {
    const lastStore = await prisma.store.findFirst({
      orderBy: { id: 'desc' }
    });
    let nextNum = 1;
    if (lastStore) {
      const match = lastStore.id.match(/\d+/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }
    const newId = `store_${String(nextNum).padStart(3, '0')}`;
    const newStore = await prisma.store.create({
      data: {
        id: newId,
        franchiseId: payload.franchiseId,
        name: payload.name,
        city: payload.city || '',
        address: payload.address || '',
        lat: payload.lat !== undefined ? parseFloat(payload.lat) : 32.7266,
        lng: payload.lng !== undefined ? parseFloat(payload.lng) : 74.8570,
        status: payload.status || 'Open',
        managerName: payload.managerName || '',
        phone: payload.phone || ''
      }
    });
    res.json({ success: true, data: newStore });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/stores/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const updated = await prisma.store.update({
      where: { id },
      data: {
        franchiseId: payload.franchiseId,
        name: payload.name,
        city: payload.city,
        address: payload.address,
        lat: payload.lat !== undefined ? parseFloat(payload.lat) : undefined,
        lng: payload.lng !== undefined ? parseFloat(payload.lng) : undefined,
        status: payload.status,
        managerName: payload.managerName,
        phone: payload.phone
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/stores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.store.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✔ Express server running at: http://localhost:${PORT}`);
});
