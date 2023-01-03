import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DtoInvoice, DtoProject, FormattableTextFormat } from '@common';
import { ProjectService } from '@core';
import { InvoiceService } from '@core/invoice.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { EditDialogComponent } from 'src/app/time-entry/components/edit-dialog/edit-dialog.component';
import { InvoiceDialogAction, InvoiceDialogParams } from './invoice-dialog.params';

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.scss']
})
export class InvoiceDialogComponent implements OnInit {

  //#region Private properties ------------------------------------------------
  private dialogRef: MatDialogRef<EditDialogComponent>;
  private projectService: ProjectService;
  private invoiceService: InvoiceService;
  private existingInvoice?: DtoInvoice;
  //#endregion ----------------------------------------------------------------

  //#region public properties -------------------------------------------------
  public formData: FormGroup;
  public filteredProjects: Observable<Array<DtoProject>>;
  public projects: Array<DtoProject>;
  public action: InvoiceDialogAction;
  //#endregion

  //#region public getters ----------------------------------------------------
  public get isCreate(): boolean {
    return this.action === 'new';
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    formBuilder: FormBuilder,
    projectService: ProjectService,
    invoiceService: InvoiceService,
    dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) params: InvoiceDialogParams) {
    this.dialogRef = dialogRef;
    this.projectService = projectService;
    this.invoiceService = invoiceService;
    this.action = params.action;
    this.existingInvoice = params.invoice;
    this.formData = formBuilder.group({
      project: new FormControl(
        { value: params.invoice?.project, disabled: !this.isCreate },
        [Validators.required]
      ),
      invoiceNumber: new FormControl(
        { value: params.invoice?.subject, disabled: !this.isCreate },
        [Validators.required, Validators.pattern('[0-9]{7}')]
      ),
      periodStart: new FormControl(
        undefined,
        this.isCreate ? Validators.required : undefined
      ),
      periodEnd: new FormControl(
        undefined,
        this.isCreate ? Validators.required : undefined
      ),
      invoiceDate: new FormControl(
        { value: params.invoice?.invoiceDate, disabled: !this.isCreate },
        [Validators.required]
      ),
      paymentDate: new FormControl(
        undefined,
        this.isCreate ? undefined : Validators.required
      ),
      amount: new FormControl(
        { value: params.invoice?.netAmount, disabled: !this.isCreate },
        [Validators.required, Validators.min(0.01), Validators.pattern('[0-9]*.[0-9]{2}')]
      )
    });
    this.projects = new Array<DtoProject>();
  }

  ngOnInit(): void {
    this.projectService.getProjects().then((result: Map<number, DtoProject>) => {
      this.projects = Array.from(result.values())
        .filter((p: DtoProject) => {
          return p.customer && (p.endDate ? p.endDate.getTime() >= new Date().getTime() : true);
        })
        .sort((a: DtoProject, b: DtoProject) => a.name.localeCompare(b.name));
    });

  }
  //#endregion

  //#region UI Triggered methods ----------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }

  public displayProject(project: DtoProject): string {
    return project && project.name ? project.name : '';
  }

  public save(): void {
    const data: DtoInvoice = {
      subject: `RG-${this.formData.controls['invoiceNumber'].value}`,
      description: {
        raw: this.formData.controls['periodStart'].value.format('DD.MM.YYYY') + ' - ' + moment(this.formData.controls['periodEnd'].value).format('DD.MM.YYYY'),
        format: FormattableTextFormat.plain,
        html: undefined
      },
      invoiceDate: this.formData.controls['invoiceDate'].value.toDate(),
      project: this.formData.controls['project'].value,
      netAmount: this.formData.controls['amount'].value,
      id: 0
    };
    console.log(data);
    this.invoiceService.saveNewInvoice(data).then((saved: DtoInvoice) => this.dialogRef.close(saved));
  }

  public pay(): void {
    this.existingInvoice.paymentDate = this.formData.controls['paymentDate'].value.toDate();
    this.invoiceService.payInvoice(this.existingInvoice).then((saved: DtoInvoice) => this.dialogRef.close(saved));
  }
  //#endregion
}
