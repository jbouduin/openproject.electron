import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import * as moment from 'moment';

import { DtoProject } from '@ipc';
import { SelectionData } from './selection-data';
import { DateRangeSelection } from './date-range-selection';

interface DateRangeSelectionOption {
  value: DateRangeSelection;
  label: string;
  startDate?: () => moment.Moment;
  endDate?: () => moment.Moment;
}

@Component({
  selector: 'time-entry-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent implements OnInit {

  // <editor-fold desc='Private properties'>
  // </editor-fold>

  // <editor-fold desc='@Input/@Output/@ViewChild'>
  @Input() public projects!: Array<DtoProject>;
  @Output() public load: EventEmitter<SelectionData>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public dateRangeGroup: FormGroup;
  public treeFormControl: FormControl;
  public dateRangeSelectionOptions: Array<DateRangeSelectionOption>;
  // </editor-fold>


  // <editor-fold desc='Constructor & C°'>
  public constructor(private formBuilder: FormBuilder) {
    this.treeFormControl = new FormControl();
    this.dateRangeGroup = this.formBuilder.group({
      rangeOption: new FormControl(null),
      endDate: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      treeFormControl: this.treeFormControl
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

    // #1189: Form validation (see https://angular.io/guide/form-validation#adding-cross-validation-to-template-driven-forms)
    // if (name === 'startDate' || name === 'endDate') {
    //   const startPicker = this.formGroup.get('startDate');
    //   const endPicker = this.formGroup.get('endDate');
    //   if (startPicker.value && endPicker.value && endPicker.value.isBefore(startPicker.value, 'day')) {
    //
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
    const selectionData = new SelectionData(
      this.dateRangeGroup.controls['rangeOption'].value.value,
      this.dateRangeGroup.get('startDate').value,
      this.dateRangeGroup.get('endDate').value,
      this.treeFormControl.value);
    this.load.emit(selectionData);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private filldateRangeSelectionOptions(): Array<DateRangeSelectionOption> {
    const result = new Array<DateRangeSelectionOption>();
    result.push({
      value: DateRangeSelection.today,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.today),
      startDate: () => moment().startOf('date'),
      endDate: () => moment().startOf('date')
    });
    result.push({
      value: DateRangeSelection.thisWeek,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.thisWeek),
      startDate: () => moment().startOf('week'),
      endDate: () => moment().endOf('week')
    });
    result.push({
      value: DateRangeSelection.thisMonth,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.thisMonth),
      startDate: () => moment().startOf('month'),
      endDate: () => moment().endOf('month')
    });
    result.push({
      value: DateRangeSelection.thisYear,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.thisYear),
      startDate: () => moment().startOf('year'),
      endDate: () => moment().endOf('year')
    });
    result.push({
      value: DateRangeSelection.yesterday,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.yesterday),
      startDate: () => moment().startOf('date').subtract(1, 'days'),
      endDate: () => moment().startOf('date').subtract(1, 'days')
    });
    result.push({
      value: DateRangeSelection.lastWeek,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.lastWeek),
      startDate: () => moment().startOf('week').subtract(1, 'weeks'),
      endDate: () => moment().endOf('week').subtract(1, 'weeks')
    });
    result.push({
      value: DateRangeSelection.lastMonth,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.lastMonth),
      startDate: () => moment().startOf('month').subtract(1, 'months'),
      endDate: () => moment().endOf('month').subtract(1, 'months')
    });
    result.push({
      value: DateRangeSelection.lastYear,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.lastYear),
      startDate: () => moment().startOf('year').subtract(1, 'years'),
      endDate: () => moment().endOf('year').subtract(1, 'years')
    });
    result.push({
      value: DateRangeSelection.custom,
      label: SelectionData.dateRangeSelectionToString(DateRangeSelection.custom),
      startDate: undefined,
      endDate: undefined
    });
    return result;
  }

  private applyDateRangeSelection(dateRangeSelection: DateRangeSelectionOption): void {
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

  // private dateSelectionToTextual(range: string, start: moment.Moment, end: moment.Moment): string {
  //
  // }
  // </editor-fold>
}
