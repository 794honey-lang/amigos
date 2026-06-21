export const mockOrders = [
  {
    id: 'A1245',
    date: 'Today, 11:45 AM',
    items: [
      {
        id: 'chicken-lovers',
        name: 'Chicken Lovers',
        size: 'Medium',
        crust: 'Cheese Burst',
        toppings: [
          { name: 'Extra Cheese', price: 50 },
          { name: 'Onion', price: 50 },
          { name: 'Capsicum', price: 60 }
        ],
        price: 590,
        crustPrice: 80,
        toppingsPrice: 160,
        itemTotal: 830,
        qty: 1,
        isVeg: false
      },
      {
        id: 'sandwich-cheese-mushroom',
        name: 'Cheese Mushroom Sandwich',
        size: 'Regular',
        crust: 'Classic',
        toppings: [],
        price: 260,
        crustPrice: 0,
        toppingsPrice: 0,
        itemTotal: 260,
        qty: 1,
        isVeg: true
      }
    ],
    itemTotal: 1090,
    deliveryFee: 20,
    taxes: 50,
    discount: 230, // Coupon AMIGOS20 etc
    toPay: 930,
    status: 'Preparing', // Preparing | Confirmed | Placed | Ready | OutForDelivery | Delivered | Cancelled
    paymentMethod: 'UPI',
    address: {
      line: '123, Gandhi Nagar, Civil Lines',
      city: 'Jammu',
      pincode: '180001',
      landmark: 'Near City Hospital'
    },
    customer: {
      name: 'Rahul Sharma',
      phone: '9876543210'
    }
  },
  {
    id: 'A1230',
    date: '12 May, 07:30 PM',
    items: [
      {
        id: 'premium-veg',
        name: 'Premium Veg',
        size: 'Medium',
        crust: 'Cheese Burst',
        toppings: [{ name: 'Extra Cheese', price: 50 }],
        price: 560,
        crustPrice: 80,
        toppingsPrice: 50,
        itemTotal: 690,
        qty: 1,
        isVeg: true
      },
      {
        id: 'dessert-choco-lava',
        name: 'Choco Lava Cake',
        size: 'Regular',
        crust: 'Classic',
        toppings: [],
        price: 110,
        crustPrice: 0,
        toppingsPrice: 0,
        itemTotal: 110,
        qty: 2,
        isVeg: true
      },
      {
        id: 'drink-pepsi-small',
        name: 'Pepsi Can (330ml)',
        size: 'Regular',
        crust: 'Classic',
        toppings: [],
        price: 60,
        crustPrice: 0,
        toppingsPrice: 0,
        itemTotal: 60,
        qty: 2,
        isVeg: true
      }
    ],
    itemTotal: 1030,
    deliveryFee: 40,
    taxes: 50,
    discount: 0,
    toPay: 1120,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    address: {
      line: '123, Gandhi Nagar, Civil Lines',
      city: 'Jammu',
      pincode: '180001'
    },
    customer: {
      name: 'Rahul Sharma',
      phone: '9876543210'
    }
  },
  {
    id: 'A1180',
    date: '10 May, 02:10 PM',
    items: [
      {
        id: 'schezwan-veg',
        name: 'Schezwan Veg',
        size: 'Medium',
        crust: 'Classic',
        toppings: [{ name: 'Jalapeno', price: 60 }],
        price: 550,
        crustPrice: 0,
        toppingsPrice: 60,
        itemTotal: 610,
        qty: 1,
        isVeg: true
      }
    ],
    itemTotal: 610,
    deliveryFee: 30,
    taxes: 50,
    discount: 100,
    toPay: 590,
    status: 'Cancelled',
    paymentMethod: 'Cash on Delivery',
    address: {
      line: '45-B, Sector 4, Channi Himmat',
      city: 'Jammu',
      pincode: '180015'
    },
    customer: {
      name: 'Rahul Sharma',
      phone: '9876543210'
    }
  },
  {
    id: 'A1150',
    date: '08 May, 06:45 PM',
    items: [
      {
        id: 'sandwich-amigos-delight',
        name: "Amigo's Delight Sandwich",
        size: 'Regular',
        crust: 'Classic',
        toppings: [],
        price: 260,
        crustPrice: 0,
        toppingsPrice: 0,
        itemTotal: 260,
        qty: 3,
        isVeg: true
      },
      {
        id: 'drink-pepsi-small',
        name: 'Pepsi Can (330ml)',
        size: 'Regular',
        crust: 'Classic',
        toppings: [],
        price: 60,
        crustPrice: 0,
        toppingsPrice: 0,
        itemTotal: 60,
        qty: 2,
        isVeg: true
      }
    ],
    itemTotal: 900,
    deliveryFee: 30,
    taxes: 40,
    discount: 100,
    toPay: 870,
    status: 'Delivered',
    paymentMethod: 'UPI',
    address: {
      line: '123, Gandhi Nagar, Civil Lines',
      city: 'Jammu',
      pincode: '180001'
    },
    customer: {
      name: 'Rahul Sharma',
      phone: '9876543210'
    }
  }
];
