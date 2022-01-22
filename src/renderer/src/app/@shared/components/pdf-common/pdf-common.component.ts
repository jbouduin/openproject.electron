import { Component, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { DataRequestFactory, IpcService } from '@core';
import { DataVerb, DtoPdfCommonSelection } from '@ipc';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pdf-common',
  templateUrl: './pdf-common.component.html',
  styleUrls: ['./pdf-common.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PdfCommonComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PdfCommonComponent),
      multi: true
    }
  ]
})
export class PdfCommonComponent implements ControlValueAccessor, OnDestroy {

  //#region public properties  ------------------------------------------------
  public formGroup: FormGroup;
  //#endregion

  //#region public getters/setters --------------------------------------------
  public get value(): DtoPdfCommonSelection {
    return this.formGroup.value;
  }

  public set value(value: DtoPdfCommonSelection) {
    this.formGroup.setValue(value);
  }
  //#endregion

  //#region Private properties ------------------------------------------------
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;
  private subscriptions: Array<Subscription>;
  private onChange: any = () => { };
  private onTouched: any = () => { };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(
    formBuilder: FormBuilder,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory) {
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
    this.formGroup = formBuilder.group({
      fileName: new FormControl(null, [Validators.required]),
      openFile: new FormControl(true),
      dumpJson: new FormControl(false)
    });
    this.subscriptions = new Array<Subscription>(
      this.formGroup.valueChanges.subscribe(value => {
        this.onChange(value);
        this.onTouched();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  //#endregion

  //#region UI triggers -------------------------------------------------------
  public async saveAs(): Promise<void> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/save-as/export');
    const response = await this.ipcService.untypedDataRequest(request);
    this.formGroup.controls['fileName'].patchValue(response.data);
  }
  //#endregion

  //#region forms API related methods -----------------------------------------
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  public writeValue(value: DtoPdfCommonSelection): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.formGroup.reset();
    }
  }

  public registerOnTouched(fn: (_: any) => void) {
    this.onTouched = fn;
  }

  public validate(_: FormControl) {
    return this.formGroup.valid ? null : { pdfCommon: { valid: false } };
  }
  //#endregion
}
