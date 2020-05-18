import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { DtoBaseFilter } from '@ipc';

@Component({
  selector: 'time-entry-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent implements OnInit {

  // <editor-fold desc='@Output'>
  @Output() public load: EventEmitter<DtoBaseFilter>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formGroup: FormGroup;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private formBuilder: FormBuilder) {
    this.load = new EventEmitter<DtoBaseFilter>();
    this.formGroup = this.formBuilder.group({
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required])
    });
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formGroup.get(name);
    if (formControl?.hasError('required')) {
      return 'Mandatory field';
    }

    // TODO: Form validation (see https://angular.io/guide/form-validation#adding-cross-validation-to-template-driven-forms)
    // if (name === 'startDate' || name === 'endDate') {
    //   const startPicker = this.formGroup.get('startDate');
    //   const endPicker = this.formGroup.get('endDate');
    //   if (startPicker.value && endPicker.value && endPicker.value.isBefore(startPicker.value, 'day')) {
    //     console.log('in error');
    //     return 'End date < Start date';
    //
    //   }
    // }
    return undefined;
  }

  public submit(): void {
    const startPicker = this.formGroup.get('startDate').value;
    const endPicker = this.formGroup.get('endDate').value;

    const start = new Date(startPicker.toString());
    const end = new Date(endPicker.toString());
    const filters = [
      {
        'spent_on': {
          'operator': '<>d',
          'values': [
            new Intl.DateTimeFormat('de-DE').format(start),
            new Intl.DateTimeFormat('de-DE').format(end)
          ]
       }
      }
    ];
    const sortBy = [['spent_on', 'asc']];
    const filter: DtoBaseFilter = {
      offset: 1,
      pageSize: 100,
      sortBy: JSON.stringify(sortBy),
      filters: JSON.stringify(filters)
    }
    this.load.emit(filter);
  }
  // </editor-fold>
}
