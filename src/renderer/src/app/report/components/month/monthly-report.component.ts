import { Component, forwardRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { DtoMonthlyReportSelection } from '@ipc';
import { Subscription } from 'rxjs';

interface Month {
  month: number;
  label: string;
}

@Component({
  selector: 'app-month',
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonthlyReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MonthlyReportComponent),
      multi: true
    }
  ]
})
export class MonthlyReportComponent implements OnDestroy {

  //#region Public properties -------------------------------------------------
  public monthFormGroup: FormGroup;
  public months: Array<Month>;
  public thisYear: number;
  //#endregion

  //#region public getters/setters --------------------------------------------
  public get value(): DtoMonthlyReportSelection {
    return this.monthFormGroup.value;
  }

  public set value(value: DtoMonthlyReportSelection) {
    this.monthFormGroup.setValue(value);
  }
  //#endregion

  //#region private properties ------------------------------------------------
  private subscriptions: Array<Subscription>;
  private onChange: any = () => { };
  private onTouched: any = () => { };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(formBuilder: FormBuilder) {
    this.monthFormGroup = formBuilder.group({
      month: new FormControl(),
      year: new FormControl('', [Validators.required])
    });

    this.thisYear = new Date().getFullYear();
    this.months = [
      { month: 1, label: 'january' },
      { month: 2, label: 'februari' },
      { month: 3, label: 'march' },
      { month: 4, label: 'april' },
      { month: 5, label: 'mai' },
      { month: 6, label: 'june' },
      { month: 7, label: 'juli' },
      { month: 8, label: 'august' },
      { month: 9, label: 'september' },
      { month: 10, label: 'october' },
      { month: 11, label: 'november' },
      { month: 12, label: 'december' }
    ];
    this.subscriptions = new Array<Subscription>(
      this.monthFormGroup.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  //#endregion

  //#region forms API releated methods ----------------------------------------
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  public writeValue(value: DtoMonthlyReportSelection): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.monthFormGroup.reset();
    }
  }

  public registerOnTouched(fn: (_: any) => void): void {
    this.onTouched = fn;
  }

  public validate(_: FormControl): unknown {
    return this.monthFormGroup.valid ? null : { monthSelection: { valid: false } };
  }
  //#endregion
}
