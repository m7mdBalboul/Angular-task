import { Room } from '@db/mocks';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RoomsService } from '@services/hotel.service';
import { DividerModule } from 'primeng/divider';
import { inject, computed, Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookFormComponent } from './book-form/book-form.component';

@Component({
  standalone: true,
  selector: 'app-room',
  imports: [
    RouterModule,
    DialogModule,
    ButtonModule,
    DividerModule,
    BookFormComponent,
  ],
  template: `
    <div class="flex flex-col items-center justify-center w-full h-full">
      @if (roomSignal().status === 'pending') {
        <p>Loading...</p>
      }
      @if (roomSignal().status === 'success' && roomSignal().data; as data) {
        <h1 class="text-5xl mb-6">Room {{ data.roomNumber }}</h1>

        <section class="flex gap-4 flex-col md:flex-row items-center">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h2 class="card-title">{{ data.type }} Room</h2>
            </div>

            @for (roomInfo of roomInfos(); track roomInfo.label) {
              <div
                class="flex items-center border border-white border-solid gap-2 px-2"
              >
                <div class="font-bold w-[12ch] shrink-0">
                  {{ roomInfo.label }}
                </div>
                <p-divider type="solid" layout="vertical" class="" />
                <p class="text-sm">{{ roomInfo.value }}</p>
              </div>
            }

            <div class="flex items-center gap-2">
              <p-button (click)="show()" class="mx-auto">Book Now</p-button>
            </div>
          </div>
          <figure
            class="outline outline-1 outline-white outline-offset-2 max-w-fit"
          >
            <img
              alt="Shoes"
              class="w-96 h-full object-cover"
              [src]="[data.photoUrl]"
            />
          </figure>
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
