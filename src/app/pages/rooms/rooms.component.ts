import { Room } from '@db/mocks';
import { RoomsService } from '@services/hotel.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    RouterModule,
    CommonModule,
    ButtonModule,
    DropdownModule,
  ],
  template: `
    <div class="flex w-full items-center justify-center flex-col gap-4">
      <h1>Rooms</h1>
      @if (roomsSignal().isLoading) {
        Loading...
      }
      @if (roomsSignal().data; as data) {
        <section
          aria-label="filters"
          class="flex gap-3 items-center justify-center"
        >
          <span class="p-float-label">
            <p-dropdown
              inputId="price"
              [options]="priceOptions"
              [(ngModel)]="filters().price"
              (onChange)="
                onFilterChange({
                  name: 'price',
                  value: $event.value
                })
              "
            />
            <label for="price">Price</label>
          </span>
          <span class="p-float-label">
            <p-dropdown
              inputId="type"
              [options]="roomTypes()"
              (onChange)="onFilterChange({ name: 'type', value: $event.value })"
              [(ngModel)]="filters().type"
            />
            <label for="type">Room Type</label>
          </span>
        </section>

        <section
          class="flex flex-wrap w-full justify-center items-stretch gap-4"
        >
          @for (room of filteredRooms(); track room.id) {
            <p-card
              [header]="room.type"
              [subheader]="room.roomNumber"
              class="w-80 "
            >
              <ng-template pTemplate="header">
                <img class="w-full" [src]="[room.photoUrl]" alt="Room" />
              </ng-template>
              <p>
                @if (room.availability[0].startDate) {
                  {{ room.type }} Room available from
                  {{ room.availability[0].startDate | date: 'longDate' }}
                } @else {
                  {{ room.type }} Room
                }
              </p>
              <ng-template pTemplate="footer">
                <p-button [routerLink]="[room.id]">
                  <span> Starting at {{ room.price | currency: 'USD' }} </span>
                </p-button>
              </ng-template>
            </p-card>
          }
        </section>
      }
      @if (roomsSignal().isError) {
        <p>Error</p>
      }
    </div>
  `,
})
export class RoomsComponent {
  rooms = inject(RoomsService).getRooms();
  roomsSignal = this.rooms.result;

  filters = signal<Filters>({ type: 'all', price: 'unset' });
  type = computed(() => this.filters().type);
  price = computed(() => this.filters().price);

  priceOptions = [
    { label: 'Unset', value: 'unset' },
    { label: 'Ascending', value: 'ascending' },
    { label: 'Descending', value: 'descending' },
  ];

  roomTypes = computed(() => [
    { label: 'All', value: 'all' },
    ...(this.roomsSignal().data
      ? new Set((this.roomsSignal() as any).data.map((room: Room) => room.type))
      : []),
  ]);

  filteredRooms = computed(() => {
    let filteredData = this.roomsSignal().data;
    let type = this.type();
    let price = this.price();

    if (!filteredData) {
      return [];
    }

    return (
      type === 'all'
        ? filteredData
        : filteredData.filter(room => room.type === type)
    ).toSorted((a, b) => {
      if (price === 'unset') {
        return 0;
      }
      return price === 'ascending' ? a.price - b.price : b.price - a.price;
    });
  });

  onFilterChange(event: { name: string; value: string }) {
    this.filters.update(old => ({
      ...old,
      [event.name]: event.value,
    }));
  }
}

type Filters = {
  price: 'unset' | 'ascending' | 'descending';
  type: Room['type'] | 'all';
};
