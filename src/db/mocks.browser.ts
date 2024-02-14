import { http, delay } from 'msw';
import { setupWorker } from 'msw/browser';
import {
  getRoomId,
  getRooms,
  reserveRoom,
  getReservations,
  deleteReservation,
  registerUser,
  loginUser,
} from './db.server';
import { HttpParams } from '@angular/common/http';

export const mocks = [
  http.get('https://api.hotel.com/rooms', async () => {
    await delay(1000);
    const rooms = await getRooms();
    return new Response(JSON.stringify(rooms), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  http.get('https://api.hotel.com/rooms/:id', async req => {
    await delay(1000);
    const id = Number(req.params['id']) as number;
    const room = await getRoomId(id);
    return new Response(JSON.stringify(room), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  http.get('https://api.hotel.com/reservations', async req => {
    await delay(1000);
    const auth = new HttpParams({
      fromString: req.request.url.split('?')[1],
    }).get('auth');
    return new Response(JSON.stringify(await getReservations(auth ?? '')), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  http.post('https://api.hotel.com/reservations', async req => {
    await delay(1000);
    const auth = new HttpParams({
      fromString: req.request.url.split('?')[1],
    }).get('auth');

    const reservation = await req.request.json();
    await reserveRoom(reservation as any, auth ?? '');

    return new Response(JSON.stringify(reservation), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  http.delete('https://api.hotel.com/reservations/:id', async req => {
    await delay(1000);
    const reservationId = await (req.params as any).id;
    const auth = new HttpParams({
      fromString: req.request.url.split('?')[1],
    }).get('auth');
    await deleteReservation(reservationId, +auth!);
    return new Response(JSON.stringify(reservationId), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  http.post('https://api.hotel.com/users/register', async req => {
    await delay(1000);
    const user = await req.request.json();
    const newUser = await registerUser(user as any);
    return new Response(JSON.stringify(newUser), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  http.post('https://api.hotel.com/users/login', async req => {
    await delay(1000);
    const user = await req.request.json();
    const loggedInUser = await loginUser(user as any);
    return new Response(JSON.stringify(loggedInUser), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
];

const worker = setupWorker(...mocks);

export { worker };
