import { app } from 'electron';
import { injectable, inject } from "inversify";
import moment from 'moment';
import * as path from 'path';

import { ILogService, IOpenprojectService } from "@core";
import { DtoUntypedDataResponse, DataStatus, DtoTimeEntry, LogSource, DtoTimeEntryExportRequest, TimeEntryLayoutLines, TimeEntryLayoutSubtotal } from "@ipc";
import { IDataService } from "../data-service";
import { IDataRouterService } from "../data-router.service";
import { RoutedRequest } from "../routed-request";
import { BaseDataService } from "../base-data-service";

import { IPdfHeaderFooterFields } from './pdf/content/pdf-header-footer-fields';
import { FontStyle } from './pdf/options/font-style';
import { DocumentOptions } from './pdf/options/document.options';

import { PdfUnit, IPdfUnit } from './pdf/size/pdf-unit';
import { IPdfTable } from './pdf/table/pdf-table';
import { FlowDocument } from './pdf/flow-document';

import SERVICETYPES from "@core/service.types";
import { FourSides } from './pdf/size/four-sides';
import { TimeEntrySort } from '@common';

export interface IExportService extends IDataService { }

@injectable()
export class ExportService extends BaseDataService implements IExportService {

  // <editor-fold desc='Private properties'>

  // </editor-fold>

  // <editor-fold desc='BaseDataService abstract properties implementation'>
  protected get entityRoot(): string {
    return '/export';
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService) {
    super(logService,  openprojectService);
  }
  // </editor-fold>

  // <editor-fold desc='IDataService interface members'>
  public setRoutes(router: IDataRouterService): void {
    router.post('/export/time-entries-old', this.exportTimeSheets.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='Callback methods'>
  private async exportTimeSheets(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      const data: DtoTimeEntryExportRequest = routedRequest.data;
      const documentOptions = new DocumentOptions();
      documentOptions.title = data.title.join(' ') || 'Timesheets'
      const doc = await FlowDocument.createDocument(documentOptions);

      const headerFooterOptions = doc.getTextOptions();
      headerFooterOptions.textHeight = 10;
      await doc.addFooterImage(path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png'));
      doc.addFooterText(headerFooterOptions, 'Stundennachweis {{author}}', undefined, 'Seite {{pageNumber}} / {{totalPages}}');
      await doc.addHeaderImage(path.resolve(app.getAppPath(), 'dist/main/static/images/header.png'));
      await doc.moveDown(5);

      let options = doc.getTextOptions();
      options.style = FontStyle.bold | FontStyle.underline;
      options.textHeight = 20;
      options.align = 'center';

      for (let title of data.title.filter(line => line ? true : false)) {
        await doc.writeLine(title, options);
      }
      await doc.moveDown(2);

      const tableOptions = doc.getTableOptions();
      tableOptions.textHeight = 10;
      await doc.writeTable(tableOptions, this.timesheetTable.bind(this), data);

      await doc.moveDown(5);
      const signatureOptions = doc.getTableOptions();
      signatureOptions.borderThickness = new FourSides<IPdfUnit>(new PdfUnit('0'));
      await doc.writeTable(signatureOptions, this.signatureTable.bind(this), data);

      const fields: IPdfHeaderFooterFields = {
        author: 'Johan Bouduin',
        title: '',
        date: new Date(),
        pageNumber: 0,
        totalPages: 0
      };
      await doc.writeHeadersAndFooters(fields);
      await doc.saveToFile(data.fileName, data.openFile);
      response = {
        status: DataStatus.Accepted
      };
    } catch (error) {
      console.log(error);
      response = this.processServiceError(error);
    }
    return response;
  }
  // </editor-fold>

  // <editor-fold desc='Private helper methods'>
  private addRowWithTotal(table: IPdfTable, label: string, value: number, columnNameDate: string, columnNameDuration: string) {
    value /= 1000;
    const hours = Math.floor(value / 3600);
    value = value % 3600;
    const minutes = Math.floor(value / 60);
    const totalOptions = table.getRowOptions();
    totalOptions.style = FontStyle.bold;
    const totalRow = table.addDataRow(totalOptions);
    const totalTextOptions = totalRow.getCellOptions(columnNameDate);
    totalTextOptions.align = 'right';
    totalRow.addCell(columnNameDate, table.columnCount - 1, label, totalTextOptions);
    totalRow.addCell(columnNameDuration, 1, hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0'));
  }

  private signatureTable(table: IPdfTable, data: DtoTimeEntryExportRequest): void {

    const columnNameLeftEmpty = 'leftEmpty';
    const columnNameMySignature = 'mySignature';
    const columnNameCustomerSignature = 'customerSignature';
    const columnNameCenterEmpty = 'centerEmpty';
    const columnNameRightEmpty = 'rightEmpty';
    const noBorder = new PdfUnit('0');

    const outsideEmptyColumnOptions = table.getColumnOptions();
    outsideEmptyColumnOptions.maxWidth = new PdfUnit('5 mm');
    const centerEmptyColumnOptions = table.getColumnOptions();
    centerEmptyColumnOptions.maxWidth = new PdfUnit('10 mm');
    const signatureColumnOptions = table.getColumnOptions();
    signatureColumnOptions.maxWidth = new PdfUnit('-1');

    table.addColumn(columnNameLeftEmpty, outsideEmptyColumnOptions);
    table.addColumn(columnNameMySignature, signatureColumnOptions);
    table.addColumn(columnNameCenterEmpty, centerEmptyColumnOptions);
    table.addColumn(columnNameCustomerSignature, signatureColumnOptions);
    table.addColumn(columnNameRightEmpty, outsideEmptyColumnOptions);

    // const spaceRowOptions = new RowOptions(options);
    // spaceRowOptions.textHeight = 50;
    // spaceRowOptions.borderThickness = new FourSides(PdfStatics.noBorder);
    // const spaceRow = result.addDataRow();
    // spaceRow.addCell(this.columnNameLeftEmpty, 1, ' ', spaceRowOptions);

    const nameRow = table.addDataRow();
    const mySignatureCellOptions = nameRow.getCellOptions(columnNameMySignature);
    mySignatureCellOptions.textHeight = 10;
    // nameCellOptions.borderThickness = new FourSides(PdfStatics.noBorder);
    const today = this.spentOnAsString(new Date());
    nameRow.addCell(columnNameMySignature, 1, `Johan Bouduin, Aßling, ${today}`, mySignatureCellOptions);
    if (data.approvalName || data.approvalLocation) {
      const approvalSignatureCellOptions = nameRow.getCellOptions(columnNameCustomerSignature);
      approvalSignatureCellOptions.textHeight = 10;
      const approvalSignatureCellValue = [data.approvalName, data.approvalLocation ].filter( f => f !== null).join(', ');
      nameRow.addCell(columnNameCustomerSignature, 1, approvalSignatureCellValue, approvalSignatureCellOptions);
    }

    const fixedText = 'Name, Ort, Datum';
    const fixedTextRow = table.addDataRow();
    const myFixedTextCellOptions = fixedTextRow.getCellOptions(columnNameMySignature);
    myFixedTextCellOptions.borderThickness = new FourSides(
      new PdfUnit('1 pt'), noBorder, noBorder, noBorder);
    myFixedTextCellOptions.textHeight = 8;
    const approvalFixedTextCellOptions = fixedTextRow.getCellOptions(columnNameCustomerSignature);
    approvalFixedTextCellOptions.borderThickness = new FourSides(
      new PdfUnit('1 pt'), noBorder, noBorder, noBorder);
    approvalFixedTextCellOptions.textHeight = 8;
    fixedTextRow.addCell(columnNameMySignature, 1, fixedText, myFixedTextCellOptions);
    fixedTextRow.addCell(columnNameCustomerSignature, 1, fixedText, approvalFixedTextCellOptions);
  }

  private timesheetTable(table: IPdfTable, data: DtoTimeEntryExportRequest): void {
    const columnNameDate = 'date';
    const columnNameWorkpackage = 'wp';
    const columnNameStart = 'start';
    const columnNameEnd = 'end';
    const columnNameDuration = 'duration';

    let grandTotal = 0;
    let subtotalByWp = 0;
    let subtotalByDate = 0;
    let prevWp: string;
    let prevDate: Date;

    // define columns
    const dateOptions = table.getColumnOptions();
    dateOptions.maxWidth = new PdfUnit('25 mm');
    dateOptions.align = 'center';
    table.addColumn(columnNameDate, dateOptions);
    table.addColumn(columnNameWorkpackage);
    if (data.layoutLines === TimeEntryLayoutLines.perEntry) {
      const startOptions = table.getColumnOptions();
      startOptions.maxWidth = new PdfUnit('20 mm');
      startOptions.align = 'center';
      table.addColumn(columnNameStart, startOptions);
      table.addColumn(columnNameEnd, startOptions);
    }
    const durationOptions = table.getColumnOptions();
    durationOptions.maxWidth = new PdfUnit('25 mm');
    durationOptions.align = 'center';
    table.addColumn(columnNameDuration, durationOptions);

    // define header row
    const headerOptions = table.getRowOptions();
    headerOptions.style = FontStyle.bold;
    const headerRow = table.addHeaderRow(headerOptions);
    headerRow.addCell(columnNameDate, 1, 'Datum'); //
    headerRow.addCell(columnNameWorkpackage, 1, 'Aufgabe');
    if (data.layoutLines === TimeEntryLayoutLines.perEntry) {
      headerRow.addCell(columnNameStart, 1, 'Von');
      headerRow.addCell(columnNameEnd, 1, 'Bis');
    }
    headerRow.addCell(columnNameDuration, 1, 'Zeit');

    let entries = this.sortEntries(data.data, data.subtotal);
    if (data.layoutLines === TimeEntryLayoutLines.perWorkPackageAndDate) {
      entries = this.reduceEntries(entries);
    }

    entries.forEach( (entry: DtoTimeEntry, index: number) => {
      if (index > 0 && data.subtotal != TimeEntryLayoutSubtotal.none &&
        (prevWp !== entry.workPackage.subject || prevDate !== entry.spentOn)) {
        switch(data.subtotal) {
          case TimeEntryLayoutSubtotal.workpackage: {
            if (prevWp !== entry.workPackage.subject) {
              this.addRowWithTotal(
                table,
                `Zwischensumme für ${prevWp}`,
                subtotalByWp,
                columnNameDate,
                columnNameDuration);
              subtotalByWp = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.workpackageAndDate: {
            if (prevWp !== entry.workPackage.subject) {
              this.addRowWithTotal(
                table,
                `Zwischensumme für ${prevWp}`,
                subtotalByWp,
                columnNameDate,
                columnNameDuration);
              subtotalByWp = 0;
            }
            if (prevDate !== entry.spentOn) {
              this.addRowWithTotal(
                table,
                `Zwischensumme für ${this.spentOnAsString(prevDate)}`,
                subtotalByWp,
                columnNameDate,
                columnNameDuration);
              subtotalByDate = 0;
              subtotalByWp = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.date: {
            if (prevDate !== entry.spentOn) {
              this.addRowWithTotal(
                table,
                `Zwischensumme für ${this.spentOnAsString(prevDate)}`,
                subtotalByDate,
                columnNameDate,
                columnNameDuration);
              subtotalByDate = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
            if (prevDate !== entry.spentOn) {
              this.addRowWithTotal(
                table,
                `Zwischensumme für ${this.spentOnAsString(prevDate)}`,
                subtotalByDate,
                columnNameDate,
                columnNameDuration);
              subtotalByDate = 0;
            }
            if (prevWp !== entry.workPackage.subject) {
              this.addRowWithTotal(
                table,
                `Zwischensumme für ${prevWp}`,
                subtotalByWp,
                columnNameDate,
                columnNameDuration);
              subtotalByWp = 0;
              subtotalByDate = 0;
            }
            break;
          }
        }
      }

      const newRow = table.addDataRow();
      try {
        newRow.addCell(columnNameDate, 1, this.spentOnAsString(entry.spentOn));
        newRow.addCell(columnNameWorkpackage, 1, entry.workPackage.subject);
        if (data.layoutLines === TimeEntryLayoutLines.perEntry) {
          newRow.addCell(columnNameStart, 1, entry.customField2);
          newRow.addCell(columnNameEnd, 1, entry.customField3);
        }
        const durationInMilliseconds = moment.duration(entry.hours).asMilliseconds();
        newRow.addCell(columnNameDuration, 1, this.durationAsString(durationInMilliseconds));
        grandTotal += durationInMilliseconds;
        subtotalByWp += durationInMilliseconds;
        subtotalByDate += durationInMilliseconds;
        prevWp = entry.workPackage.subject;
        prevDate = entry.spentOn;
      } catch(error) {
        this.logService.error(LogSource.Main, 'error converting', entry, error);
      }
    });
    // add the last subtotals if required
    switch(data.subtotal) {
      case TimeEntryLayoutSubtotal.workpackage: {
        this.addRowWithTotal(
          table,
          `Zwischensumme für ${prevWp}`,
          subtotalByWp,
          columnNameDate,
          columnNameDuration);
        break;
      }
      case TimeEntryLayoutSubtotal.workpackageAndDate: {
        this.addRowWithTotal(
          table,
          `Zwischensumme für ${prevWp}`,
          subtotalByWp,
          columnNameDate,
          columnNameDuration);
        this.addRowWithTotal(
          table,
          `Zwischensumme für ${this.spentOnAsString(prevDate)}`,
          subtotalByDate,
          columnNameDate,
          columnNameDuration);
        break;
      }
      case TimeEntryLayoutSubtotal.date: {
        this.addRowWithTotal(
          table,
          'Subtotal',
          subtotalByDate,
          columnNameDate,
          columnNameDuration);
        break;
      }
      case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
        this.addRowWithTotal(
          table,
          `Zwischensumme für ${this.spentOnAsString(prevDate)}`,
          subtotalByDate,
          columnNameDate,
          columnNameDuration);
        this.addRowWithTotal(
          table,
          `Zwischensumme für ${prevWp}`,
          subtotalByWp,
          columnNameDate,
          columnNameDuration);
        break;
      }
    }
    this.addRowWithTotal(
      table,
      'Summe',
      grandTotal,
      columnNameDate,
      columnNameDuration);
  }

  private durationAsString(durationInMilliseconds: number): string {
    const asDate = new Date(durationInMilliseconds);
    const hours = asDate.getUTCHours();
    const minutes = asDate.getUTCMinutes();
    return hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0');
  }

  private reduceEntries(entries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    const result = new Array<DtoTimeEntry>();
    if (entries.length === 0) {
      return result;
    }
    result.push(entries[0]);
    entries.reduce( (_previous: DtoTimeEntry, current: DtoTimeEntry) => {
      console.log('processing', current.spentOn, current.workPackage.id, current.workPackage.subject);
      const accumulated = result.find(entry => entry.spentOn === current.spentOn &&
      entry.workPackage.id === current.workPackage.id);
      if (!accumulated) {
        console.log('pushing', current.spentOn, current.workPackage.id, current.workPackage.subject);
        result.push(current);
      } else {
        console.log('accumulating', current.spentOn, current.workPackage.id, current.workPackage.subject);
        accumulated.hours = moment.duration(accumulated.hours)
          .add(moment.duration(current.hours))
          .toISOString();
      }

      return current;
    });
    return result;


  }

  private sortEntries(entries: Array<DtoTimeEntry>, subtotal: TimeEntryLayoutSubtotal): Array<DtoTimeEntry> {
    switch(subtotal) {
      case TimeEntryLayoutSubtotal.workpackage:
      case TimeEntryLayoutSubtotal.workpackageAndDate: {
        return TimeEntrySort.sortByProjectAndWorkPackageAndDate(entries);
      }
      case TimeEntryLayoutSubtotal.date:
      case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
        return TimeEntrySort.sortByDateAndProjectAndWorkPackage(entries);
      }
      default: {
        // no action required, as entries come correctly sorted from renderer
        return TimeEntrySort.sortByDateAndTime(entries);
      }
    }
  }

  private spentOnAsString(spentOn: Date): string {
    const spentOnAsDate = new Date(spentOn);
    return spentOnAsDate.getDate().toString().padStart(2, '0') + '.' +
      (spentOnAsDate.getMonth() + 1).toString().padStart(2, '0') + '.' +
      spentOnAsDate.getFullYear().toString();
  }
  // </editor-fold>
}
