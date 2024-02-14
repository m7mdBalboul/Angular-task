import { Room } from '@db/mocks';
import { PanelModule } from 'primeng/panel';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { RoomsService } from '@services/hotel.service';
import { addDays, differenceInDays, min, max } from 'date-fns';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    BlockUIModule,
    CalendarModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-blockUI
      [target]="target"
      [blocked]="
        hotelMutationResult().status === 'pending' ||
        hotelMutationResult().status === 'success'
      "
    />
    <p-panel
      [showHeader]="false"
      class="[&_.p-panel-content]:p-0 [&_.p-panel-content]:border-0"
      #target
    >
      <form class="flex flex-col gap-4" (submit)="onSubmit()">
        <div class="form-control">
          <label>
            <span class="label-text">Check-in</span>
          </label>
          <p-calendar
            appendTo="body"
            [minDate]="calendarProps().minDate"
            [maxDate]="calendarProps().maxDate"
            [showIcon]="true"
            [(ngModel)]="formData.dateRange"
            [inputStyle]="{ width: '100%' }"
            [numberOfMonths]="2"
            dateFormat="dd.mm.yy"
            [disabledDates]="calendarProps().disabledDates"
            selectionMode="range"
            [ngModelOptions]="{ standalone: true }"
          />
        </div>
        <p-inputGroup>
          <p-inputGroupAddon>
            <i class="pi pi-user"></i>
          </p-inputGroupAddon>
          <input
            class="w-full"
            pInputText
            name="guestName"
            placeholder="Guest Name"
            [(ngModel)]="formData.guestName"
            [ngModelOptions]="{ standalone: true }"
          />
        </p-inputGroup>
        <p-button
          label="Submit"
          class="w-full"
          type="submit"
          [disabled]="!formData.dateRange || !formData.guestName"
        />
      </form>
    </p-panel>
  `,
})
export class BookFormComponent {
  hotelMutation = inject(RoomsService).reserveRoom();
  hotelMutationResult = this.hotelMutation.result;
  availability = input.required<Room['availability']>();
  roomId = input.required<Room['id']>();

  formData = {
    dateRange: null,
    guestName: '',
  };

  onSubmit() {
    this.hotelMutation.mutate({
      startDate: formatDate(
        (this.formData.dateRange as any)[0],
        'yyyy-MM-dd',
        'en'
      ),
      endDate: formatDate(
        (this.formData.dateRange as any)[1],
        'yyyy-MM-dd',
        'en'
      ),
      guestName: this.formData.guestName,
      roomId: this.roomId(),
    });
  }

  calendarProps = computed(() => {
    let minDate = min(
      this.availability().map(date => new Date(date.startDate))
    );
    let maxDate = max(this.availability().map(date => new Date(date.endDate)));

    let disabledDates = this.availability().reduce((acc, date, index) => {
      if (index === 0) return acc;

      let startDate = new Date(date.startDate);
      let endDate = new Date(this.availability()[index - 1].endDate);
      let difference = differenceInDays(startDate, endDate);

      let system = new Array(difference - 1).fill(null).map((_, i) => {
        return addDays(endDate, i + 1);
      });

      return acc.concat(system);
    }, [] as Date[]);

    return { minDate, maxDate, disabledDates };
  });
}
