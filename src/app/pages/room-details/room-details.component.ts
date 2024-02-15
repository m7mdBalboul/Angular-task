import { Room } from '@db/mocks';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { RoomsService } from '@services/hotel.service';
import { inject, computed, Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BookFormComponent } from './book-form/book-form.component';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';

@Component({
  standalone: true,
  selector: 'app-room',
  imports: [
    RouterModule,
    DialogModule,
    ButtonModule,
    DividerModule,
    CalendarModule,
    BookFormComponent,
    ProgressSpinnerModule,
    ImageModule,
    CardModule,
  ],
  template: `
    <div class="flex flex-col items-center justify-center w-full h-full">
      @if (roomSignal().status === 'pending') {
        <p-progressSpinner />
      }
      @if (roomSignal().status === 'success' && roomSignal().data; as data) {
        <h1 class="text-5xl mb-6">Room {{ data.roomNumber }}</h1>

        <section class="flex gap-4 flex-col md:flex-row items-center w-full">
          <p-card class="flex-1">
            <ng-template pTemplate="title">
              <h2 class="my-2 text-center">{{ data.type }} Room</h2>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="flex flex-col justify-around md:flex-row gap-2">
                <div>
                  <h3 class="font-bold  shrink-0">Amenities</h3>
                  <p class="text-sm">{{ formatAmenities(data.amenities) }}</p>
                  <p-divider type="solid" />
                  <h3 class="font-bold  shrink-0">Price</h3>
                  <p class="text-sm">{{ formatPrice(data.price) }}</p>
                  <p-divider type="solid" />
                  <div class="shrink-0">
                    <h3>Availability</h3>
                    <ul class="p-0 list-none [&>li+li]:mt-2 tabular-nums">
                      @for (item of data.availability; track item.startDate) {
                        <li>{{ item.startDate }} - {{ item.endDate }}</li>
                      }
                    </ul>
                  </div>
                </div>
                <div>
                  <p-image
                    alt="Shoes"
                    width="400"
                    [src]="[data.photoUrl]"
                    [preview]="true"
                  />
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="footer">
              <div class="flex w-full items-center justify-center">
                <p-button class="mx-auto" (click)="show()">Book Now</p-button>
              </div>
            </ng-template>
          </p-card>
        </section>
        <p-dialog [header]="'Book Room ' + roomId" [(visible)]="dialogVisible">
          <app-book-form [availability]="data.availability" [roomId]="roomId" />
        </p-dialog>
      }
      @if (roomSignal().error) {
        <p>No room found</p>
      }
    </div>
  `,
})
export class RoomComponent {
  roomId = inject(ActivatedRoute).snapshot.params['id'];
  roomsService = inject(RoomsService);
  roomQueryResult = this.roomsService.getRoom(+this.roomId);
  roomSignal = this.roomQueryResult.result;
  roomInfos = computed(() => [
    {
      label: 'Amenities',
      value: this.formatAmenities(this.roomSignal().data?.amenities ?? []),
    },
    {
      label: 'Price',
      value: this.formatPrice(this.roomSignal().data?.price ?? 0),
    },
    {
      label: 'Availability',
      value: this.formatAvailability(
        this.roomSignal().data?.availability ?? []
      ),
    },
  ]);

  dialogVisible = false;
  show() {
    this.dialogVisible = true;
  }

  formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
  formatAvailability(availability: Room['availability']) {
    return availability
      .map(availability => {
        return `${availability.startDate} - ${availability.endDate}`;
      })
      .join(' | ');
  }
  formatAmenities(amenities: string[]) {
    return new Intl.ListFormat('en-US', {
      type: 'conjunction',
    }).format(amenities);
  }
}
