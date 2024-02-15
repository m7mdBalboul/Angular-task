export type Room = {
  id: number;
  roomNumber: string;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse';
  price: number;
  amenities: string[];
  availability: { startDate: string; endDate: string }[];
  photoUrl: string;
};

export type Reservation = {
  id: number;
  roomId: number;
  startDate: string;
  endDate: string;
  guestName: string;
};

export type DataBase = {
  rooms: Room[];
  reservations: Reservation[];
};

export const MockDataBase: DataBase = {
  rooms: [
    {
      id: 1,
      photoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSpsVZgV0lB65Qq7a8n4mBe6RhxPSXtAXBY5s2PTfrQ&s',
      roomNumber: '101',
      type: 'Standard',
      price: 100,
      amenities: ['Free Wi-Fi', 'TV', 'Air Conditioning'],
      availability: [
        { startDate: '2024-02-21', endDate: '2024-02-27' },
        { startDate: '2024-03-01', endDate: '2024-03-07' },
      ],
    },
    {
      id: 2,
      photoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSpsVZgV0lB65Qq7a8n4mBe6RhxPSXtAXBY5s2PTfrQ&s',
      roomNumber: '201',
      type: 'Deluxe',
      price: 500,
      amenities: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar'],
      availability: [
        { startDate: '2024-03-05', endDate: '2024-03-12' },
        { startDate: '2024-03-18', endDate: '2024-03-25' },
      ],
    },
    {
      id: 3,
      photoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSpsVZgV0lB65Qq7a8n4mBe6RhxPSXtAXBY5s2PTfrQ&s',
      roomNumber: '301',
      type: 'Suite',
      price: 200,
      amenities: [
        'Free Wi-Fi',
        'TV',
        'Air Conditioning',
        'Mini Bar',
        'Jacuzzi',
      ],
      availability: [
        { startDate: '2024-03-01', endDate: '2024-03-7' },
        { startDate: '2024-03-15', endDate: '2024-03-20' },
      ],
    },
    {
      id: 4,
      photoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSpsVZgV0lB65Qq7a8n4mBe6RhxPSXtAXBY5s2PTfrQ&s',
      roomNumber: '401',
      type: 'Penthouse',
      price: 300,
      amenities: [
        'Free Wi-Fi',
        'TV',
        'Air Conditioning',
        'Mini Bar',
        'Jacuzzi',
        'Infinity Pool',
      ],
      availability: [
        { startDate: '2024-03-05', endDate: '2024-03-12' },
        { startDate: '2024-03-18', endDate: '2024-03-25' },
      ],
    },
    {
      id: 5,
      photoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSpsVZgV0lB65Qq7a8n4mBe6RhxPSXtAXBY5s2PTfrQ&s',
      roomNumber: '501',
      type: 'Standard',
      price: 100,
      amenities: ['Free Wi-Fi', 'TV', 'Air Conditioning'],
      availability: [
        { startDate: '2024-03-01', endDate: '2024-03-7' },
        { startDate: '2024-03-15', endDate: '2024-03-20' },
      ],
    },
    {
      id: 6,
      photoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSpsVZgV0lB65Qq7a8n4mBe6RhxPSXtAXBY5s2PTfrQ&s',
      roomNumber: '601',
      type: 'Deluxe',
      price: 500,
      amenities: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar'],
      availability: [
        { startDate: '2024-03-05', endDate: '2024-03-12' },
        { startDate: '2024-03-18', endDate: '2024-03-25' },
      ],
    },
  ],
  reservations: [],
};
