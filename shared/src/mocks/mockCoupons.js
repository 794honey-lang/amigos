export const mockCoupons = [
  {
    code: 'AMIGOS20',
    discountType: 'percentage',
    value: 20,
    maxDiscount: 100,
    minCartTotal: 400,
    description: 'Get 20% off up to Rs. 100 on orders above Rs. 400.'
  },
  {
    code: 'FREEBY',
    discountType: 'flat',
    value: 50,
    maxDiscount: 50,
    minCartTotal: 250,
    description: 'Flat Rs. 50 off on orders above Rs. 250.'
  },
  {
    code: 'FIESTA150',
    discountType: 'flat',
    value: 150,
    maxDiscount: 150,
    minCartTotal: 800,
    description: 'Flat Rs. 150 off on orders above Rs. 800.'
  }
];
