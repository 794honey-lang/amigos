export const mockOrders = [
  {
    id: 'A1245',
    storeId: 'store_001',
    storeName: 'Civil Lines, Jammu',
    date: '2026-06-21T11:45:00Z',
    items: [
      { id: 'chicken-lovers', name: 'Chicken Lovers', size: 'Medium', crust: 'Cheese Burst', toppings: ['Extra Cheese'], price: 590, qty: 1 }
    ],
    itemTotal: 590,
    deliveryFee: 20,
    taxes: 30,
    discount: 50,
    toPay: 590,
    status: 'Placed', // Placed | Preparing | Ready | OutForDelivery | Delivered | Cancelled
    paymentMethod: 'UPI',
    address: { line: '123, Gandhi Nagar, Civil Lines', city: 'Jammu', pincode: '180001' },
    customer: { name: 'Rahul Sharma', phone: '9876543210' }
  },
  {
    id: 'A1246',
    storeId: 'store_001',
    storeName: 'Civil Lines, Jammu',
    date: '2026-06-21T12:05:00Z',
    items: [
      { id: 'schezwan-veg', name: 'Schezwan Veg', size: 'Medium', crust: 'Classic', toppings: [], price: 550, qty: 1 },
      { id: 'dessert-choco-lava', name: 'Choco Lava Cake', size: 'Regular', crust: 'Classic', toppings: [], price: 110, qty: 1 }
    ],
    itemTotal: 660,
    deliveryFee: 20,
    taxes: 33,
    discount: 0,
    toPay: 713,
    status: 'Preparing',
    paymentMethod: 'Cash on Delivery',
    address: { line: '45, Channi Himmat', city: 'Jammu', pincode: '180015' },
    customer: { name: 'Ankita Sen', phone: '9876512345' }
  },
  {
    id: 'A1247',
    storeId: 'store_002',
    storeName: 'Channi Himmat, Jammu',
    date: '2026-06-21T12:15:00Z',
    items: [
      { id: 'premium-veg', name: 'Premium Veg', size: 'Large', crust: 'Classic', toppings: [], price: 690, qty: 1 }
    ],
    itemTotal: 690,
    deliveryFee: 30,
    taxes: 35,
    discount: 100,
    toPay: 655,
    status: 'Placed',
    paymentMethod: 'UPI',
    address: { line: 'Sec-3, Channi Himmat', city: 'Jammu', pincode: '180015' },
    customer: { name: 'Manish Gupta', phone: '9123456789' }
  },
  {
    id: 'A1248',
    storeId: 'store_003',
    storeName: 'Connaught Place, Delhi',
    date: '2026-06-21T12:20:00Z',
    items: [
      { id: 'fiery-chicken', name: 'Fiery Chicken Pizza', size: 'Medium', crust: 'Cheese Burst', toppings: [], price: 610, qty: 2 }
    ],
    itemTotal: 1220,
    deliveryFee: 40,
    taxes: 61,
    discount: 150,
    toPay: 1171,
    status: 'Preparing',
    paymentMethod: 'Credit Card',
    address: { line: 'Connaught Place Outer Circle', city: 'Delhi', pincode: '110001' },
    customer: { name: 'Vikram Singh', phone: '9810098765' }
  },
  {
    id: 'A1249',
    storeId: 'store_005',
    storeName: 'Bandra West, Mumbai',
    date: '2026-06-21T12:30:00Z',
    items: [
      { id: 'sandwich-cheese-mushroom', name: 'Cheese Mushroom Sandwich', size: 'Regular', crust: 'Classic', toppings: [], price: 260, qty: 1 }
    ],
    itemTotal: 260,
    deliveryFee: 30,
    taxes: 13,
    discount: 0,
    toPay: 303,
    status: 'Placed',
    paymentMethod: 'UPI',
    address: { line: 'Carter Road, Bandra West', city: 'Mumbai', pincode: '400050' },
    customer: { name: 'Karan Johar', phone: '9920098765' }
  },
  {
    id: 'A1230',
    storeId: 'store_001',
    storeName: 'Civil Lines, Jammu',
    date: '2026-06-20T19:30:00Z',
    items: [
      { id: 'deluxe-margarita', name: 'Deluxe Margarita', size: 'Regular', crust: 'Classic', toppings: [], price: 330, qty: 1 }
    ],
    itemTotal: 330,
    deliveryFee: 20,
    taxes: 17,
    discount: 50,
    toPay: 317,
    status: 'Delivered',
    paymentMethod: 'UPI',
    address: { line: 'Sector-2, Gandhi Nagar', city: 'Jammu', pincode: '180004' },
    customer: { name: 'Kunal Kohli', phone: '9845012345' }
  },
  {
    id: 'A1231',
    storeId: 'store_006',
    storeName: 'Koregaon Park, Pune',
    date: '2026-06-20T20:15:00Z',
    items: [
      { id: 'farmhouse', name: 'Farmhouse', size: 'Medium', crust: 'Classic', toppings: [], price: 490, qty: 1 }
    ],
    itemTotal: 490,
    deliveryFee: 30,
    taxes: 25,
    discount: 0,
    toPay: 545,
    status: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    address: { line: 'Lane 5, Koregaon Park', city: 'Pune', pincode: '411001' },
    customer: { name: 'Neha Ranade', phone: '9921198765' }
  },
  {
    id: 'A1232',
    storeId: 'store_008',
    storeName: 'Indiranagar, Bengaluru',
    date: '2026-06-20T21:00:00Z',
    items: [
      { id: 'schezwan-veg', name: 'Schezwan Veg', size: 'Medium', crust: 'Classic', toppings: [], price: 550, qty: 1 }
    ],
    itemTotal: 550,
    deliveryFee: 40,
    taxes: 28,
    discount: 100,
    toPay: 518,
    status: 'Delivered',
    paymentMethod: 'UPI',
    address: { line: '12th Main Road, Indiranagar', city: 'Bengaluru', pincode: '560038' },
    customer: { name: 'Rajesh G.', phone: '9845098765' }
  },
  {
    id: 'A1233',
    storeId: 'store_001',
    storeName: 'Civil Lines, Jammu',
    date: '2026-06-20T14:10:00Z',
    items: [
      { id: 'veg-creamy', name: 'Veg Creamy', size: 'Medium', crust: 'Classic', toppings: [], price: 550, qty: 1 }
    ],
    itemTotal: 550,
    deliveryFee: 20,
    taxes: 28,
    discount: 0,
    toPay: 598,
    status: 'Cancelled',
    paymentMethod: 'UPI',
    address: { line: 'Trikuta Nagar, Jammu', city: 'Jammu', pincode: '180012' },
    customer: { name: 'Samir Verma', phone: '9419198765' }
  }
];
