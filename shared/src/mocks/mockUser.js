export const mockCustomerUser = {
  id: 'user-1',
  name: 'Rahul Sharma',
  phone: '9876543210',
  email: 'rahul.sharma@example.com',
  walletBalance: 120, // Offers & Wallet (show mock ₹ balance badge)
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      line: '123, Gandhi Nagar, Civil Lines',
      city: 'Jammu',
      pincode: '180001',
      landmark: 'Near City Hospital'
    },
    {
      id: 'addr-2',
      label: 'Office',
      line: '45-B, Sector 4, Channi Himmat',
      city: 'Jammu',
      pincode: '180015',
      landmark: 'Opposite State Bank'
    }
  ],
  favourites: [
    'schezwan-veg',
    'chicken-lovers',
    'dessert-choco-lava'
  ]
};

export const mockStaffUser = {
  id: 'staff-1',
  name: 'Amigos Head Chef',
  phone: '9999988888',
  role: 'chef'
};
