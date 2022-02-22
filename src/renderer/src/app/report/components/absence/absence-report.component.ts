import { Component, forwardRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DtoAbsenceReportSelection } from '@common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-absence',
  templateUrl: './absence-report.component.html',
  styleUrls: ['./absence-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AbsenceReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AbsenceReportComponent),
      multi: true
    }
  ]
})
export class AbsenceReportComponent implements OnDestroy {

  //#region public properties -------------------------------------------------
  public absenceFormGroup: FormGroup;
  public thisYear: number;
  //#endregion

  //#region public getters/setters --------------------------------------------
  public get value(): DtoAbsenceReportSelection {
    return this.absenceFormGroup.value;
  }

  public set value(value: DtoAbsenceReportSelection) {
    this.absenceFormGroup.setValue(value);
  }
  //#endregion

  //#region private properties ------------------------------------------------
  private subscriptions: Array<Subscription>;
  private onChange: any = () => { };
  private onTouched: any = () => { };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(formBuilder: FormBuilder) {
    this.absenceFormGroup = formBuilder.group({
      // pdfCommon: [],
      year: new FormControl(null, [Validators.required])
    });
    this.thisYear = new Date().getFullYear();
    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.absenceFormGroup.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  //#endregion

  //#region forms API related -------------------------------------------------
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  public writeValue(value: DtoAbsenceReportSelection): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.absenceFormGroup.reset();
    }
  }

  public registerOnTouched(fn: (_: any) => void): void {
    this.onTouched = fn;
  }


  public validate(_: FormControl): unknown {
    return this.absenceFormGroup.valid ? null : { absenceSelection: { valid: false } };
  }
  //#endregion
}
