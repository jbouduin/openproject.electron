import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataRequestFactory, IpcService } from '@core';
import { DataVerb, DtoAbsenceReportSelection, DtoMonthlyReportSelection, DtoProjectReportSelection, DtoReportRequest } from '@ipc';
import { PdfCommonSelection } from '@shared';
import { noop, Observable, Subscription } from 'rxjs';
import { AbsenceReportSelection } from '../absence/absence-report.selection';
import { MonthlyReportSelection } from '../month/monthly-report.selection';
import { ProjectReportSelection } from '../project/project-report.selection';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  //#region Private properties ------------------------------------------------
  private ipcService: IpcService;
  private dataRequestFactory: DataRequestFactory;
  private subscriptions: Array<Subscription>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public currentSelection: string;
  public disableExport: boolean;
  public formGroup: FormGroup;
  public selectedTab: FormControl;
  //#endregion




  //#region Constructor & C°
  constructor(formBuilder: FormBuilder,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory) {
    this.ipcService = ipcService;
    this.dataRequestFactory = dataRequestFactory;
    this.selectedTab = new FormControl(0);
    this.selectedTab.valueChanges.subscribe(this.selectedTabChange.bind(this));
    this.formGroup = formBuilder.group({
      pdfCommon: new Array<undefined>(),
      monthlySelection: new Array<undefined>(),
      projectSelection: new Array<undefined>(),
      absenceSelection: new Array<undefined>()
    });
    this.subscriptions = new Array<Subscription>(
      this.formGroup.valueChanges.subscribe(this.someValueChanged.bind(this))
    );
  }

  ngOnDestroy(): void {
    this.selectedTab.valueChanges.forEach((s: Subscription) => s.unsubscribe());
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
  }

  ngOnInit(): void {
    this.resetMonthlySelection();
    this.resetProjectSelection();
    this.resetAbsenceSelection();
    this.resetPdfCommonSelection();
    this.setCurrentSelection();
    this.disableExport = true;
  }
  //#endregion

  //#region UI triggers
  public selectedTabChange(value: number): void  {
    this.setCurrentSelection();
    this.setDisableExport();
  }

  public reset(): void {
    this.resetPdfCommonSelection();
    switch (this.selectedTab.value) {
      case 0:
        this.resetMonthlySelection();
        break;
      case 1:
        this.resetProjectSelection();
        break;
      case 2:
        this.resetAbsenceSelection();
        break;
      default:
        noop();
    }
  }

  public async export(): Promise<void> {
    switch (this.selectedTab.value) {
      case 0:
        this.exportMonthlyReport();
        break;
      case 1:
        this.exportProjectReport();
        break;
      case 2:
        this.exportAbsenceReport();
        break;
      default:
        noop();
    }
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private someValueChanged(_value: any): void {
    this.setCurrentSelection();
    this.setDisableExport();
  }

  private setDisableExport(): void {
    let currentSelectionValid: boolean;
    switch (this.selectedTab.value) {
      case 0:
        currentSelectionValid = this.formGroup.controls['monthlySelection'].valid;
        break;
      case 1:
        // currentSelectionValid = this.formGroup.controls['projectSelection'].valid;
        currentSelectionValid = false;
        break;
      case 2:
        // currentSelectionValid = this.formGroup.controls['absenceSelection'].valid;
        currentSelectionValid = false;
        break;
      default:
        currentSelectionValid = false;
    }
    this.disableExport = !currentSelectionValid || !this.formGroup.controls['pdfCommon'].valid;
  }

  private setCurrentSelection(): void {
    const toStringify = {
      pdfCommonSelection: this.formGroup.controls['pdfCommon'].value
    }
    switch (this.selectedTab.value) {
      case 0:
        toStringify['monthlySelection'] = this.formGroup.controls['monthlySelection'].value
        break;
      case 1:
        toStringify['projectSelection'] = this.formGroup.controls['projectSelection'].value;
        break;
      case 2:
        toStringify['absenceSelection'] = this.formGroup.controls['absenceSelection'].value
        break;
      default:
        noop;
    }
    this.currentSelection = JSON.stringify(toStringify, null, 2);
  }

  private resetMonthlySelection(): void {
    this.formGroup.controls['monthlySelection']
      .patchValue(MonthlyReportSelection.ResetMonthlyReportSelection());
  }

  private resetAbsenceSelection(): void {
    this.formGroup.controls['absenceSelection']
      .patchValue(AbsenceReportSelection.ResetAbsenceReportSelection());

  }

  private resetProjectSelection(): void {
    this.formGroup.controls['projectSelection']
      .patchValue(ProjectReportSelection.ResetProjectReportSelection());
  }

  private resetPdfCommonSelection(): void {
    this.formGroup.controls['pdfCommon']
      .patchValue(PdfCommonSelection.ResetPdfCommonSelection());
  }

  private async exportMonthlyReport(): Promise<void> {
    const data: DtoReportRequest<DtoMonthlyReportSelection> = {
      pdfCommonSelection: this.formGroup.controls['pdfCommon'].value,
      selection: this.formGroup.controls['monthlySelection'].value,
    };
    const request = this.dataRequestFactory.createDataRequest<DtoReportRequest<DtoMonthlyReportSelection>>(DataVerb.POST, '/export/report/monthly', data);
    await this.ipcService.dataRequest<DtoReportRequest<DtoMonthlyReportSelection>, any>(request);
  }

  private async exportProjectReport(): Promise<void> {
    const data: DtoReportRequest<DtoProjectReportSelection> = {
      pdfCommonSelection: this.formGroup.controls['pdfCommon'].value,
      selection: this.formGroup.controls['projectSelection'].value,
    };
    const request = this.dataRequestFactory.createDataRequest<DtoReportRequest<DtoProjectReportSelection>>(DataVerb.POST, '/export/report/project', data);
    await this.ipcService.dataRequest<DtoReportRequest<DtoProjectReportSelection>, any>(request);
  }

  private async exportAbsenceReport(): Promise<void> {
    const data: DtoReportRequest<DtoAbsenceReportSelection> = {
      pdfCommonSelection: this.formGroup.controls['pdfCommon'].value,
      selection: this.formGroup.controls['absenceSelection'].value,
    };
    const request = this.dataRequestFactory.createDataRequest<DtoReportRequest<DtoAbsenceReportSelection>>(DataVerb.POST, '/export/report/absence', data);
    await this.ipcService.dataRequest<DtoReportRequest<DtoAbsenceReportSelection>, any>(request);
  }
  //#endregion
}
