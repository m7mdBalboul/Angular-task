import { Router } from '@angular/router';
import { Room, Reservation } from '@db/mocks';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectQuery, injectMutation, injectQueryClient } from '@ngneat/query';
import { ReservationMutationArgs, ReservationsQueryData } from './hotes.types';

export const ROOMS_QUERY_KEY = 'rooms';
export const RESERVATIONS_QUERY_KEY = 'reservations';

@Injectable({ providedIn: 'root' })
export class RoomsService {
  #query = injectQuery();
  #mutation = injectMutation();
  #queryClient = injectQueryClient();
  #http = inject(HttpClient);
  #router = inject(Router);

  baseUrl = 'https://api.hotel.com';

  getRooms() {
    return this.#query({
      queryKey: [ROOMS_QUERY_KEY] as const,
      queryFn: () => {
        return this.#http.get<Room[]>(`${this.baseUrl}/rooms`);
      },
    });
  }

  getRoom(id: number) {
    return this.#query({
      queryKey: [ROOMS_QUERY_KEY, id] as const,
      queryFn: () => {
        return this.#http.get<Room>(`${this.baseUrl}/rooms/${id}`);
      },
    });
  }

  getReservations() {
    return this.#query({
      queryKey: [RESERVATIONS_QUERY_KEY] as const,
      queryFn: () => {
        return this.#http.get<Array<ReservationsQueryData>>(
          `${this.baseUrl}/reservations`
        );
      },
    });
  }
  reserveRoom() {
    return this.#mutation({
      mutationFn: (reservation: ReservationMutationArgs) => {
        return this.#http.post<Reservation>(
          `${this.baseUrl}/reservations`,
          reservation
        );
      },
      onSuccess: () => {
        this.#queryClient.invalidateQueries().then(() => {
          this.#router.navigate(['/reservations']);
        });
      },
    });
  }
  deleteReservation() {
    return this.#mutation({
      mutationFn: (id: number) => {
        return this.#http.delete<number>(`${this.baseUrl}/reservations/${id}`);
      },
      onSuccess: () => {
        this.#queryClient.invalidateQueries();
      },
    });
  }
}
