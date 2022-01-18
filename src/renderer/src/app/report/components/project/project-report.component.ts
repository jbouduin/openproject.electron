import { Component, forwardRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DtoProjectReportSelection } from '@ipc';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project',
  templateUrl: './project-report.component.html',
  styleUrls: ['./project-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProjectReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ProjectReportComponent),
      multi: true
    }
  ]
})
export class ProjectReportComponent implements OnDestroy {
  //#region Public properties -------------------------------------------------
  public projectFormGroup: FormGroup;
  //#endregion

  //#region public getters/setters --------------------------------------------
  public get value(): DtoProjectReportSelection {
    return this.projectFormGroup.value;
  }

  public set value(value: DtoProjectReportSelection) {
    this.projectFormGroup.setValue(value);
  }
  //#endregion

  //#region private properties ------------------------------------------------
  private subscriptions: Array<Subscription>;
  private onChange: any = () => { };
  private onTouched: any = () => { };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(formBuilder: FormBuilder) {
    this.projectFormGroup = formBuilder.group({

    });
    this.subscriptions = new Array<Subscription>(
      this.projectFormGroup.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  //#endregion

  //#region forms API related methods -----------------------------------------
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  public writeValue(value: DtoProjectReportSelection): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.projectFormGroup.reset();
    }
  }

  public registerOnTouched(fn: (_: any) => void): void {
    this.onTouched = fn;
  }

  public validate(_: FormControl): unknown {
    return this.projectFormGroup.valid ? null : { projectSelection: { valid: false } };
  }
  //#endregion
}
