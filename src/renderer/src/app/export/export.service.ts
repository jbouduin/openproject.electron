import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DtoSchema, DtoTimeEntry } from '@ipc';
import { SetupDialogParams } from './components/setup-dialog/setup-dialog.params';
import { SetupDialogComponent } from './components/setup-dialog/setup-dialog.component';
import { PageSizes, PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private matDialog: MatDialog;
  constructor(matDialog: MatDialog) {
    this.matDialog = matDialog;
  }

  public exportTimeSheets(schema: DtoSchema, entries: Array<DtoTimeEntry>): void {
    const params = new SetupDialogParams(
      'Export timesheets',
      schema,
      entries,
      this.exportTimeSheetsCallBack);
    this.matDialog.open(SetupDialogComponent, {
      height: 'auto',
      width: '400px',
      data: params
    });
  }

  public async exportTimeSheetsCallBack(data: any): Promise<void> {
    console.log(data);
    const doc = await PDFDocument.create();
    doc.setAuthor('Johan Bouduin');
    doc.setTitle('Timesheets');
    const timesRomanFont = await doc.embedFont(StandardFonts.TimesRoman)
    const page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize()

    // Draw a string of text toward the top of the page
    const fontSize = 30;
    page.drawText('Creating PDFs in JavaScript is awesome!', {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await doc.save();
    // download(pdfBytes, "pdf-lib_creation_example.pdf", "application/pdf");
  }
}
