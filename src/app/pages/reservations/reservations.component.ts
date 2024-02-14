import { TableModule } from 'primeng/table';
import { differenceInDays } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { Component, inject } from '@angular/core';
import { RoomsService } from '@services/hotel.service';
import { ReservationsQueryData } from '@services/hotes.types';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [TableModule, RouterModule, ButtonModule],
  template: `
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-5xl">Reservations</h1>
      @if (reservationsSignal().status === 'pending') {
        <p>Loading...</p>
      }
      @if (reservationsSignal().status === 'error') {
        <p>No reservations found</p>
      }
      @if (reservationsSignal().status === 'success') {
        <p-table
          class="w-full"
          [value]="reservationsSignal().data || []"
          styleClass="p-datatable-striped"
          [breakpoint]="'720px'"
          [loading]="deleteReservationSignal().status === 'pending'"
          responsiveLayout="stack"
        >
          <ng-template pTemplate="header" let-columns>
            <tr>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Cancel</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-reservation let-columns="columns">
            <tr>
              <td>
                <a class="p-button" [routerLink]="['/', reservation.roomId]">{{
                  reservation.roomNumber
                }}</a>
              </td>
              <td>{{ reservation.type }}</td>
              <td>{{ reservation.startDate }}</td>
              <td>{{ reservation.endDate }}</td>
              <td>{{ reservation.guestName }}</td>
              <td>
                @if (getIsDeletable(reservation)) {
                  <p-button
                    label="Cancel"
                    class="p-button-danger"
                    (click)="deleteReservationMutation.mutate(reservation.id)"
                  />
                } @else {
                  <p-button label="Cancel" [disabled]="true" />
                }
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `,
})
export class ReservationsComponent {
  reservationsService = inject(RoomsService);
  reservationsQuery = this.reservationsService.getReservations();
  deleteReservationMutation = this.reservationsService.deleteReservation();
  reservationsSignal = this.reservationsQuery.result;
  deleteReservationSignal = this.deleteReservationMutation.result;

  getIsDeletable(reservation: ReservationsQueryData) {
    const diff = differenceInDays(new Date(reservation.startDate), new Date());
    return diff > 1;
  }
}
