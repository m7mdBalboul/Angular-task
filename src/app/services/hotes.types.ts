import { Reservation, Room } from '@db/mocks';

export type ReservationMutationArgs = Omit<Reservation, 'id'>;
export type ReservationsQueryData = Reservation &
  Pick<Room, 'roomNumber' | 'type'>;
