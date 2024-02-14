import { singleton } from './singleton.server';
import { MockDataBase, Reservation, Room } from './mocks';
import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data';
import {
  format,
  addDays,
  isAfter,
  subDays,
  isBefore,
  isSameDay,
  differenceInDays,
} from 'date-fns';
import { HttpResponse } from 'msw';

const db = singleton('db', () => {
  const db = factory({
    rooms: {
      id: primaryKey(Number),
      amenities: Array,
      price: Number,
      roomNumber: String,
      type: String,
      availability: Array,
      photoUrl: String,
    },
    reservations: {
      id: primaryKey(Number),
      roomId: Number,
      owner: oneOf('users'),
      startDate: String,
      endDate: String,
      guestName: String,
    },
    users: {
      id: primaryKey(Number),
      username: String,
      email: String,
      password: String,
      reservations: manyOf('reservations'),
    },
  });
  const admin = db.users.create({
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@test.com',
  });

  for (const reservation of MockDataBase['reservations']) {
    db.reservations.create({
      ...reservation,
      owner: admin,
    });
  }

  for (const room of MockDataBase['rooms']) {
    db.rooms.create({
      ...room,
    });
  }
  return db;
});

export async function getRooms() {
  return db.rooms.getAll();
}

export async function getRoomId(id: number) {
  const room = db.rooms.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  });
  const reservations = db.reservations.findMany({
    where: {
      roomId: {
        equals: id,
      },
    },
  });
  return {
    ...room,
    reservations,
  };
}

export async function getReservations(auth: string) {
  const reservations = db.reservations.findMany({
    where: {
      owner: {
        id: {
          equals: +auth,
        },
      },
    },
  });
  return reservations.map(reservation => {
    const room = db.rooms.findFirst({
      where: {
        id: {
          equals: reservation.roomId,
        },
      },
    });
    return {
      ...reservation,
      roomNumber: room?.roomNumber,
      type: room?.type,
    };
  });
}

export async function reserveRoom(
  reservation: Omit<Reservation, 'id'>,
  auth: string
) {
  const newReservation = db.reservations.create({
    endDate: reservation.endDate,
    id: db.reservations.count() + 1,
    owner: db.users.findFirst({
      where: {
        id: {
          equals: +auth,
        },
      },
    }) as any,
    roomId: +reservation.roomId,
    guestName: reservation.guestName,
    startDate: reservation.startDate,
  });

  const room = db.rooms.findFirst({
    where: {
      id: {
        equals: +reservation.roomId,
      },
    },
  });

  const currentAvailabilityIndex = (
    room?.availability as Room['availability']
  ).findIndex(
    current =>
      (isAfter(new Date(reservation.startDate), new Date(current.startDate)) ||
        isSameDay(
          new Date(current.startDate),
          new Date(reservation.startDate)
        )) &&
      (isBefore(new Date(reservation.endDate), new Date(current.endDate)) ||
        isSameDay(new Date(current.endDate), new Date(reservation.endDate)))
  );
  const currentAvailability = (room?.availability as Room['availability'])[
    currentAvailabilityIndex
  ];

  let newAvailability;
  if (currentAvailability) {
    if (
      isSameDay(
        new Date(currentAvailability.startDate),
        new Date(reservation.startDate)
      ) &&
      isSameDay(
        new Date(currentAvailability.endDate),
        new Date(reservation.endDate)
      )
    ) {
      newAvailability = {};
    } else if (
      isAfter(
        new Date(reservation.startDate),
        new Date(currentAvailability.startDate)
      ) &&
      isSameDay(
        new Date(currentAvailability.endDate),
        new Date(reservation.endDate)
      )
    ) {
      newAvailability = {
        startDate: currentAvailability.startDate,
        endDate: format(
          subDays(new Date(reservation.startDate), 1),
          'yyyy-MM-dd'
        ),
      };
    } else if (
      isSameDay(
        new Date(currentAvailability.startDate),
        new Date(reservation.startDate)
      ) &&
      isBefore(
        new Date(reservation.endDate),
        new Date(currentAvailability.endDate)
      )
    ) {
      newAvailability = {
        startDate: format(
          addDays(new Date(reservation.endDate), 1),
          'yyyy-MM-dd'
        ),
        endDate: currentAvailability.endDate,
      };
    } else {
      newAvailability = [
        {
          startDate: currentAvailability.startDate,
          endDate: format(
            subDays(new Date(reservation.startDate), 1),
            'yyyy-MM-dd'
          ),
        },
        {
          startDate: format(
            addDays(new Date(reservation.endDate), 1),
            'yyyy-MM-dd'
          ),
          endDate: currentAvailability.endDate,
        },
      ];
    }
  }

  let availability;
  if (newAvailability) {
    availability = (room?.availability as Room['availability'])
      .with(currentAvailabilityIndex, newAvailability as any)
      .filter(el => Array.isArray(el) || Object.keys(el).length > 0)
      .flat();
  }

  if (currentAvailability) {
    db.rooms.update({
      where: {
        id: {
          equals: +reservation.roomId,
        },
      },
      data: {
        availability: availability,
      },
    });
  }
}

const getNewAvailability = (
  reservation: Room['availability'][number],
  availability: Room['availability']
) => {
  if (!availability.length) {
    return [reservation];
  }
  if (availability.length === 1) {
    let current = availability[0];
    let differenceBetweenEndOfReservationAndStartOfCurrent = differenceInDays(
      new Date(reservation.endDate),
      new Date(current.startDate)
    );
    let differenceBetweenStartOfReservationAndEndOfCurrent = differenceInDays(
      new Date(current.endDate),
      new Date(reservation.startDate)
    );

    if (differenceBetweenEndOfReservationAndStartOfCurrent === 1) {
      return [
        {
          startDate: reservation.startDate,
          endDate: current.endDate,
        },
      ];
    }
    if (differenceBetweenStartOfReservationAndEndOfCurrent === 1) {
      return [
        {
          startDate: current.startDate,
          endDate: reservation.endDate,
        },
      ];
    } else {
      if (
        isBefore(new Date(reservation.startDate), new Date(current.startDate))
      ) {
        return [reservation, current];
      } else {
        return [current, reservation];
      }
    }
  }

  let newAvailability = [reservation, ...availability].sort((a, b) => {
    return isBefore(new Date(a.startDate), new Date(b.startDate)) ? -1 : 1;
  });
  let reservationIndex = newAvailability.findIndex(
    current => current.startDate === reservation.startDate
  );
  let current = newAvailability[reservationIndex];
  let next = newAvailability[reservationIndex + 1];
  let previous = newAvailability[reservationIndex - 1];

  if (!next) {
    if (
      differenceInDays(
        new Date(current.startDate),
        new Date(previous.endDate)
      ) === 1
    ) {
      return [
        ...newAvailability.slice(0, reservationIndex - 1),
        { startDate: previous.startDate, endDate: current.endDate },
      ];
    } else return newAvailability;
  }

  if (!previous) {
    if (
      differenceInDays(new Date(next.startDate), new Date(current.endDate)) ===
      1
    ) {
      return newAvailability.slice(1).with(0, {
        startDate: current.startDate,
        endDate: next.endDate,
      });
    } else return newAvailability;
  }

  let differenceBetweenEndOfPreviousAndStartOfCurrent = differenceInDays(
    new Date(current.startDate),
    new Date(previous.endDate)
  );
  let differenceBetweenStartOfNextAndEndOfCurrent = differenceInDays(
    new Date(next.startDate),
    new Date(current.endDate)
  );
  if (
    differenceBetweenEndOfPreviousAndStartOfCurrent === 1 &&
    differenceBetweenStartOfNextAndEndOfCurrent === 1
  ) {
    // remove from previous to next and add new availability from previous.end to next.start
    return [
      ...newAvailability.slice(0, reservationIndex - 1),
      {
        startDate: previous.startDate,
        endDate: next.endDate,
      },
      ...newAvailability.slice(reservationIndex + 2),
    ];
  }
  if (differenceBetweenEndOfPreviousAndStartOfCurrent === 1) {
    return [
      ...newAvailability.slice(0, reservationIndex),
      {
        startDate: reservation.startDate,
        endDate: next.endDate,
      },
      ...newAvailability.slice(reservationIndex + 1),
    ];
  }
  if (differenceBetweenStartOfNextAndEndOfCurrent === 1) {
    return [
      ...newAvailability.slice(0, reservationIndex - 1),
      {
        startDate: previous.startDate,
        endDate: reservation.endDate,
      },
      ...newAvailability.slice(reservationIndex + 1),
    ];
  }

  return newAvailability;
};

export async function deleteReservation(id: Reservation['id'], userId: number) {
  const reservation = db.reservations.findFirst({
    where: {
      id: {
        equals: +id,
      },
    },
  });
  if (!reservation) {
    return;
  }
  const room = db.rooms.findFirst({
    where: {
      id: {
        equals: +reservation?.roomId as number,
      },
    },
  });

  if (!room) {
    return;
  }

  const newAvailability = getNewAvailability(
    { endDate: reservation.endDate, startDate: reservation.startDate },
    room.availability as any
  );

  db.rooms.update({
    where: {
      id: {
        equals: +reservation.roomId,
      },
    },
    data: {
      availability: newAvailability,
    },
  });
  db.reservations.delete({
    where: {
      id: {
        equals: +id,
      },
    },
  });
}

export async function registerUser(
  user: Omit<{ username: string; email: string; password: string }, 'id'>
) {
  if (db.users.findFirst({ where: { username: { equals: user.username } } })) {
    throw new Error('Username already taken');
  }

  const newUser = db.users.create({
    ...user,
    id: db.users.count() + 1,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
  };
}

export async function loginUser(user: { email: string; password: string }) {
  const foundUser = db.users.findFirst({
    where: {
      email: {
        equals: user.email,
      },
      password: {
        equals: user.password,
      },
    },
  });
  if (!foundUser) {
    throw new HttpResponse('User not found', { status: 404 });
  }
  return {
    id: foundUser.id,
    email: foundUser.email,
    username: foundUser.username,
  };
}
