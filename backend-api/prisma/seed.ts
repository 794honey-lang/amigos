import { PrismaClient } from '@prisma/client';
import { mockCategories } from '../../shared/src/mocks/mockCategories.js';
import { mockMenuItems } from '../../shared/src/mocks/mockMenuItems.js';
import { mockPromotions } from '../../shared/src/mocks/mockPromotions.js';
import { mockBanners } from '../../shared/src/mocks/mockBanners.js';
import { mockUsers } from '../../admin-app/src/mocks/mockUsers.js';
import { mockOrders } from '../../admin-app/src/mocks/mockOrders.js';
import { mockFranchises } from '../../shared/src/mocks/mockFranchises.js';
import { mockStores } from '../../shared/src/mocks/mockStores.js';


const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting Seeding Database ===');

  // 1. Seed Categories
  console.log('Seeding Categories...');
  for (const cat of mockCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, icon: cat.icon },
      create: { id: cat.id, name: cat.name, icon: cat.icon }
    });
  }

  // 2. Seed Menu Items
  console.log('Seeding Menu Items...');
  for (const item of mockMenuItems) {
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
        rating: item.rating || 4.5,
        reviews: item.reviews || 1,
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
        rating: item.rating || 4.5,
        reviews: item.reviews || 1,
        isBestseller: item.isBestseller || false,
        customizable: item.customizable || false
      }
    });
  }

  // 3. Seed Banners
  console.log('Seeding Banners...');
  // Clear existing banners first to avoid duplication
  await prisma.banner.deleteMany({});
  for (const banner of mockBanners) {
    await prisma.banner.create({
      data: {
        title: banner.title,
        subtitle: banner.subtitle,
        code: banner.code,
        bg: banner.bg,
        image: banner.image
      }
    });
  }

  // 4. Seed Promotions
  console.log('Seeding Promotions...');
  for (const promo of mockPromotions) {
    await prisma.promotion.upsert({
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
  }

  // 5. Seed Users
  console.log('Seeding Users...');
  for (const u of mockUsers) {
    const isSuper = u.email === 'hq@amigos.in';
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: u.password,
        role: u.role,
        storeId: u.storeId,
        isSuperAdmin: isSuper
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        password: u.password,
        role: u.role,
        storeId: u.storeId,
        isSuperAdmin: isSuper
      }
    });
  }

  // 6. Seed Orders
  console.log('Seeding Orders...');
  for (const o of mockOrders) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        storeId: o.storeId,
        storeName: o.storeName,
        driverName: o.driverName || null,
        date: o.date,
        status: o.status,
        itemTotal: o.itemTotal,
        deliveryFee: o.deliveryFee,
        taxes: o.taxes,
        discount: o.discount,
        toPay: o.toPay,
        paymentMethod: o.paymentMethod || 'UPI',
        address: o.address as any,
        customer: o.customer as any,
        items: o.items as any
      },
      create: {
        id: o.id,
        storeId: o.storeId,
        storeName: o.storeName,
        driverName: o.driverName || null,
        date: o.date,
        status: o.status,
        itemTotal: o.itemTotal,
        deliveryFee: o.deliveryFee,
        taxes: o.taxes,
        discount: o.discount,
        toPay: o.toPay,
        paymentMethod: o.paymentMethod || 'UPI',
        address: o.address as any,
        customer: o.customer as any,
        items: o.items as any
      }
    });
  }

  // 6.5. Seed Franchises
  console.log('Seeding Franchises...');
  for (const f of mockFranchises) {
    await prisma.franchise.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        district: f.district,
        ownerName: f.ownerName,
        email: f.email,
        phone: f.phone,
        address: f.address
      },
      create: {
        id: f.id,
        name: f.name,
        district: f.district,
        ownerName: f.ownerName,
        email: f.email,
        phone: f.phone,
        address: f.address
      }
    });
  }

  // 6.6. Seed Stores
  console.log('Seeding Stores...');
  for (const s of mockStores) {
    await prisma.store.upsert({
      where: { id: s.id },
      update: {
        franchiseId: s.franchiseId,
        name: s.name,
        city: s.city,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        status: s.status,
        managerName: s.managerName,
        phone: s.phone
      },
      create: {
        id: s.id,
        franchiseId: s.franchiseId,
        name: s.name,
        city: s.city,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        status: s.status,
        managerName: s.managerName,
        phone: s.phone
      }
    });
  }

  console.log('=== Seeding Database Complete! ===');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
