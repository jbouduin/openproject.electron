import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import * as moment from 'moment';

import { DtoBaseFilter, DtoProject } from '@ipc';
import { ProjectTreeComponent } from '@shared';

import { SelectionData } from './selection-data';

interface DateRangeSelection {
  value: string;
  startDate?: () => moment.Moment;
  endDate?: () => moment.Moment;
}

@Component({
  selector: 'time-entry-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent implements OnInit {

  // <editor-fold desc='@Input/@Output/@ViewChild'>
  @Input() public projects!: Array<DtoProject>;
  @Output() public load: EventEmitter<SelectionData>;
  @ViewChild(ProjectTreeComponent)
  private projectTree: ProjectTreeComponent;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public dateRangeGroup: FormGroup;
  public dateRangeSelectionOptions: Array<DateRangeSelection>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private formBuilder: FormBuilder) {
    this.dateRangeGroup = this.formBuilder.group({
      rangeOption: new FormControl(null),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required])
    });
    this.dateRangeSelectionOptions = this.filldateRangeSelectionOptions();
    this.load = new EventEmitter<SelectionData>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void {
    this.dateRangeGroup.get('rangeOption').patchValue(this.dateRangeSelectionOptions[0]);
    this.applyDateRangeSelection(this.dateRangeSelectionOptions[0]);
  }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public getdateRangeGroupErrorMessage(name: string): string | undefined {
    const formControl = this.dateRangeGroup.get(name);
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

  public rangeChanged(matSelectChange: MatSelectChange): void {
    this.applyDateRangeSelection(matSelectChange.value);
  }

  public submit(): void {
    const startPicker = this.dateRangeGroup.get('startDate').value;
    const endPicker = this.dateRangeGroup.get('endDate').value;

    const start = new Date(startPicker.toString());
    const end = new Date(endPicker.toString());
    const filters = new Array<any>();
    filters.push(
      {
        'spent_on': {
          'operator': '<>d',
          'values': [
            new Intl.DateTimeFormat('de-DE').format(start),
            new Intl.DateTimeFormat('de-DE').format(end)
          ]
       }
      }
    );
    if (this.projectTree.selection.length > 0)
    {
      filters.push({
        'project': {
          'operator': '=',
          'values': this.projectTree.selection.map(id => `${id}`)
        }
      });
    };

    const sortBy = [['spent_on', 'asc']];
    const selectionData = new SelectionData(JSON.stringify(filters), JSON.stringify(sortBy));
    this.load.emit(selectionData);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private filldateRangeSelectionOptions(): Array<DateRangeSelection> {
    const result = new Array<DateRangeSelection>();
    result.push({
      value: 'Today',
      startDate: () => moment().startOf('date'),
      endDate: () => moment().startOf('date')
    });
    result.push({
      value: 'This week',
      startDate: () => moment().startOf('week'),
      endDate: () => moment().endOf('week')
    });
    result.push({
      value: 'This month',
      startDate: () => moment().startOf('month'),
      endDate: () => moment().endOf('month')
    });
    result.push({
      value: 'This year',
      startDate: () => moment().startOf('year'),
      endDate: () => moment().endOf('year')
    });
    result.push({
      value: 'Yesterday',
      startDate: () => moment().startOf('date').subtract(1, 'days'),
      endDate: () => moment().startOf('date').subtract(1, 'days')
    });
    result.push({
      value: 'Last week',
      startDate: () => moment().startOf('week').subtract(1, 'weeks'),
      endDate: () => moment().endOf('week').subtract(1, 'weeks')
    });
    result.push({
      value: 'Last month',
      startDate: () => moment().startOf('month').subtract(1, 'months'),
      endDate: () => moment().endOf('month').subtract(1, 'months')
    });
    result.push({
      value: 'Last year',
      startDate: () => moment().startOf('year').subtract(1, 'years'),
      endDate: () => moment().endOf('year').subtract(1, 'years')
    });
    result.push({
      value: 'Custom',
      startDate: undefined,
      endDate: undefined
    });
    return result;
  }

  private applyDateRangeSelection(dateRangeSelection: DateRangeSelection): void {
    const startPicker = this.dateRangeGroup.get('startDate');
    const endPicker = this.dateRangeGroup.get('endDate');

    if (dateRangeSelection.value === 'Custom') {
      startPicker.enable();
      endPicker.enable();
    } else {
      startPicker.disable();
      startPicker.patchValue(dateRangeSelection.startDate());
      endPicker.patchValue(dateRangeSelection.endDate());
      endPicker.disable();
    }
  }
  // </editor-fold>
}
