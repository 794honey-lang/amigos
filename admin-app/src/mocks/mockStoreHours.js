export const mockStoreHours = [
  {
    storeId: 'store_001',
    regularHours: {
      Monday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Tuesday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Wednesday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Thursday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Friday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Saturday: { open: '11:00 AM', close: '11:59 PM', closed: false },
      Sunday: { open: '11:00 AM', close: '11:59 PM', closed: false }
    },
    holidayClosures: [
      { date: '2026-08-15', reason: 'Independence Day', closedAllDay: true },
      { date: '2026-10-25', reason: 'Diwali Eve', closedAllDay: false, open: '11:00 AM', close: '06:00 PM' }
    ]
  },
  {
    storeId: 'store_002',
    regularHours: {
      Monday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Tuesday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Wednesday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Thursday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Friday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Saturday: { open: '11:00 AM', close: '11:00 PM', closed: false },
      Sunday: { open: '11:00 AM', close: '11:00 PM', closed: false }
    },
    holidayClosures: []
  }
];
