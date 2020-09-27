import { app } from 'electron';
import { injectable, inject } from "inversify";
import moment from 'moment';
import * as path from 'path';
import { PageSizes } from 'pdf-lib';

import { ILogService, IOpenprojectService } from "@core";
import { DtoUntypedDataResponse, DataStatus, DtoTimeEntry, LogSource, DtoTimeEntryExportRequest, TimeEntryLayoutLines, TimeEntryLayoutSubtotal } from "@ipc";
import { IDataService } from "../data-service";
import { IDataRouterService } from "../data-router.service";
import { RoutedRequest } from "../routed-request";
import { BaseDataService } from "../base-data-service";

import SERVICETYPES from "@core/service.types";
import { FlowDocument } from './pdf/flow-document';
import { WriteTextOptions } from './pdf/write-text.options';
import { FontStyle } from './pdf/font-style';
import { FourSides } from './pdf/four-sides';
import { IPdfTable, PdfTable } from './pdf/pdf-table';
import { TableOptions } from './pdf/table-options';
import { PdfHeaderFooter } from './pdf/pdf-header-footer';
import { IPdfHeaderFooterFields } from './pdf/pdf-header-footer-fields';
import { PdfUnit, IPdfUnit } from './pdf/pdf-unit';
import { PdfSize } from './pdf/pdf-size';

export interface IExportService extends IDataService { }

@injectable()
export class ExportService extends BaseDataService implements IExportService {

  // <editor-fold desc='Private properties'>
  private readonly columnNameDate = 'date';
  private readonly columnNameWorkpackage = 'wp';
  private readonly columnNameStart = 'start';
  private readonly columnNameEnd = 'end';
  private readonly columnNameDuration = 'duration';
  private readonly columnNameLeftEmpty = 'leftEmpty';
  private readonly columnNameMySignature = 'mySignature';
  private readonly columnNameCustomerSignature = 'customerSignature';
  private readonly columnNameCenterEmpty = 'centerEmpty';
  private readonly columnNameRightEmpty = 'rightEmpty';
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
    router.post('/export/time-entries', this.exportTimeSheets.bind(this));
    router.post('/export/test', this.exportTestPdf.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='Callback methods'>
  private async exportTimeSheets(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      const data: DtoTimeEntryExportRequest = routedRequest.data;
      const headerFooterOptions = new WriteTextOptions();
      headerFooterOptions.textHeight = 10;
      const footer = new PdfHeaderFooter(headerFooterOptions);
      footer.left = 'Stundennachweis {{author}}';
      footer.right = 'Seite {{pageNumber}} / {{totalPages}}';
      const doc = await FlowDocument.createDocument({
        headerImage: path.resolve(app.getAppPath(), 'dist/main/static/images/header.png'),
        footerImage: path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png'),
        footerBlock: footer,
        margin: new FourSides<IPdfUnit>(new PdfUnit('10 mm'), new PdfUnit('15 mm')),
        pageSize: new PdfSize(`${PageSizes.A4[0]} pt`, `${PageSizes.A4[1]} pt`),
        title: data.title.join(' ') || 'Timesheets'
      });
      let options = new WriteTextOptions();
      await doc.moveDown(5);
      options.style = FontStyle.bold | FontStyle.underline;
      options.textHeight = 20;
      options.align = 'center';

      for (let title of data.title.filter(line => line ? true : false)) {
        await doc.writeLine(title, options);
      }
      await doc.moveDown(2);

      const table = this.createTimesheetTable(data);
      await doc.writeTable(table);
      await doc.moveDown(5);
      const signatures = this.createSignatureTable(data);
      await doc.writeTable(signatures);

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

  private async exportTestPdf(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      const data: DtoTimeEntryExportRequest = routedRequest.data;
      const headerFooterOptions = new WriteTextOptions();
      headerFooterOptions.textHeight = 10;
      const header = new PdfHeaderFooter(headerFooterOptions);
      header.center = 'This is a centered header line';
      const footer = new PdfHeaderFooter(headerFooterOptions);
      footer.left = 'Stundennachweis {{author}}';
      footer.right = 'Seite {{pageNumber}} / {{totalPages}}';
      const doc = await FlowDocument.createDocument({
        headerImage: path.resolve(app.getAppPath(), 'dist/main/static/images/header.png'),
        headerBlock: header,
        footerImage: path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png'),
        footerBlock: footer,
        margin: new FourSides<IPdfUnit>(new PdfUnit('10 mm'), new PdfUnit('15 mm')),
        pageSize: new PdfSize(`${PageSizes.A4[0]} pt`, `${PageSizes.A4[1]} pt`),
        title: data.title.join(' ') || 'Timesheets'
      });
      const options = new WriteTextOptions();
      await doc.writeLine('first line of text', options);
      options.style = FontStyle.underline;
      await doc.writeLine('second line of text underlined', options);
      await doc.moveDown();
      options.style = FontStyle.normal;
      await doc.write('some normal text', options);
      await doc.write('followed by some more.', options);
      await doc.writeLine('now we get at the end.', options);
      await doc.writeLine('next line', options);
      options.x = new PdfUnit('10 mm');
      await doc.writeLine('+ indented line', options);
      options.x = undefined;
      options.align = 'right';
      await doc.writeLine('this is a right aligned text.', options);
      await doc.moveDown(5);
      options.style = FontStyle.bold | FontStyle.underline;
      options.textHeight = 20;
      options.align = 'center';

      for (let title of data.title.filter(line => line ? true : false)) {
        await doc.writeLine(title, options);
      }

      await doc.moveDown(1);

      const table = this.createTimesheetTable(data);
      await doc.writeTable(table);
      await doc.writeLine('first line after table', new WriteTextOptions());
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
  private addRowWithTotal(table: IPdfTable, label: string, value: number) {
    value /= 1000;
    const hours = Math.floor(value / 3600);
    value = value % 3600;
    const minutes = Math.floor(value / 60);
    const totalOptions = new TableOptions();
    totalOptions.style = FontStyle.bold;
    const totalRow = table.addDataRow(totalOptions);
    const totalTextOptions = new TableOptions();
    totalTextOptions.align = 'right';
    totalRow.addCell(this.columnNameDate, table.columnCount - 1, label, totalTextOptions);
    totalRow.addCell(this.columnNameDuration, 1, hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0'));
  }

  private createSignatureTable(data: DtoTimeEntryExportRequest): IPdfTable {
    const noBorder = new PdfUnit('0')
    const options = new TableOptions();
    options.borderThickness = new FourSides(noBorder)
    const result = new PdfTable(options);

    const outsideEmptyColumnOptions = new TableOptions();
    outsideEmptyColumnOptions.maxWidth = new PdfUnit('5 mm');
    const centerEmptyColumnOptions = new TableOptions();
    centerEmptyColumnOptions.maxWidth = new PdfUnit('10 mm');
    const signatureColumnOptions = new TableOptions();
    signatureColumnOptions.maxWidth = new PdfUnit('-1');
    const signatureCellOptions = new TableOptions();
    signatureCellOptions.borderThickness = new FourSides(
      new PdfUnit('1 pt'), noBorder, noBorder, noBorder);
    signatureCellOptions.textHeight = 8;
    const nameCellOptions = new TableOptions();
    nameCellOptions.textHeight = 10;
    nameCellOptions.borderThickness = new FourSides(noBorder);

    result.addColumn(this.columnNameLeftEmpty, outsideEmptyColumnOptions);
    result.addColumn(this.columnNameMySignature, signatureColumnOptions);
    result.addColumn(this.columnNameCenterEmpty, centerEmptyColumnOptions);
    result.addColumn(this.columnNameCustomerSignature, signatureColumnOptions);
    result.addColumn(this.columnNameRightEmpty, outsideEmptyColumnOptions);

    const nameRow = result.addDataRow();
    const today = this.spentOnAsString(new Date());
    nameRow.addCell(this.columnNameMySignature, 1, `Johan Bouduin, Aßling, ${today}`, nameCellOptions);
    if (data.approvalName || data.approvalLocation) {
      nameRow.addCell(this.columnNameCustomerSignature, 1, `${data.approvalName}, ${data.approvalLocation}, ${today}`, nameCellOptions);
    }
    const fixedText = 'Name, Ort, Datum';
    const newRow = result.addDataRow();
    newRow.addCell(this.columnNameMySignature, 1, fixedText, signatureCellOptions);
    newRow.addCell(this.columnNameCustomerSignature, 1, fixedText, signatureCellOptions);

    return result;
  }

  private createTimesheetTable(data: DtoTimeEntryExportRequest): IPdfTable {
    let grandTotal = 0;
    let subtotalByWp = 0;
    let subtotalByDate = 0;
    let prevWp: string;
    let prevDate: Date;

    const options = new TableOptions();
    const result = new PdfTable(options);
    const dateOptions = new TableOptions();
    dateOptions.maxWidth = new PdfUnit('25 mm');
    dateOptions.align = 'center';
    result.addColumn(this.columnNameDate, dateOptions);
    result.addColumn(this.columnNameWorkpackage);
    if (data.layoutLines === TimeEntryLayoutLines.perEntry) {
      const startOptions = new TableOptions();
      startOptions.maxWidth = new PdfUnit('20 mm');
      startOptions.align = 'center';
      result.addColumn(this.columnNameStart, startOptions);
      result.addColumn(this.columnNameEnd, startOptions);
    }
    const durationOptions = new TableOptions();
    durationOptions.maxWidth = new PdfUnit('25 mm');
    durationOptions.align = 'center';
    result.addColumn(this.columnNameDuration, durationOptions);
    const headerOptions = new TableOptions();
    headerOptions.style = FontStyle.bold;
    const headerRow = result.addHeaderRow(headerOptions);
    headerRow.addCell(this.columnNameDate, 1, 'Datum'); //
    headerRow.addCell(this.columnNameWorkpackage, 1, 'Aufgabe');
    if (data.layoutLines === TimeEntryLayoutLines.perEntry) {
      headerRow.addCell(this.columnNameStart, 1, 'Von');
      headerRow.addCell(this.columnNameEnd, 1, 'Bis');
    }
    headerRow.addCell(this.columnNameDuration, 1, 'Zeit');

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
              this.addRowWithTotal(result, `Zwischensumme für ${prevWp}`, subtotalByWp);
              subtotalByWp = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.workpackageAndDate: {
            if (prevWp !== entry.workPackage.subject) {
              this.addRowWithTotal(result, `Zwischensumme für ${prevWp}`, subtotalByWp);
              subtotalByWp = 0;
            }
            if (prevDate !== entry.spentOn) {
              this.addRowWithTotal(result, `Zwischensumme für ${this.spentOnAsString(prevDate)}`, subtotalByWp);
              subtotalByDate = 0;
              subtotalByWp = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.date: {
            if (prevDate !== entry.spentOn) {
              this.addRowWithTotal(result, `Zwischensumme für ${this.spentOnAsString(prevDate)}`, subtotalByDate);
              subtotalByDate = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
            if (prevDate !== entry.spentOn) {
              this.addRowWithTotal(result, `Zwischensumme für ${this.spentOnAsString(prevDate)}`, subtotalByDate);
              subtotalByDate = 0;
            }
            if (prevWp !== entry.workPackage.subject) {
              this.addRowWithTotal(result, `Zwischensumme für ${prevWp}`, subtotalByWp);
              subtotalByWp = 0;
              subtotalByDate = 0;
            }
            break;
          }
        }
      }

      const newRow = result.addDataRow();
      try {
        newRow.addCell(this.columnNameDate, 1, this.spentOnAsString(entry.spentOn));
        newRow.addCell(this.columnNameWorkpackage, 1, entry.workPackage.subject);
        if (data.layoutLines === TimeEntryLayoutLines.perEntry) {
          newRow.addCell(this.columnNameStart, 1, entry.customField2);
          newRow.addCell(this.columnNameEnd, 1, entry.customField3);
        }
        const durationInMilliseconds = moment.duration(entry.hours).asMilliseconds();
        newRow.addCell(this.columnNameDuration, 1, this.durationAsString(durationInMilliseconds));
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
        this.addRowWithTotal(result, `Zwischensumme für ${prevWp}`, subtotalByWp);
        break;
      }
      case TimeEntryLayoutSubtotal.workpackageAndDate: {
        this.addRowWithTotal(result, `Zwischensumme für ${prevWp}`, subtotalByWp);
        this.addRowWithTotal(result, `Zwischensumme für ${this.spentOnAsString(prevDate)}`, subtotalByDate);
        break;
      }
      case TimeEntryLayoutSubtotal.date: {
        this.addRowWithTotal(result, 'Subtotal', subtotalByDate);
        break;
      }
      case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
        this.addRowWithTotal(result, `Zwischensumme für ${this.spentOnAsString(prevDate)}`, subtotalByDate);
        this.addRowWithTotal(result, `Zwischensumme für ${prevWp}`, subtotalByWp);
        break;
      }
    }
    this.addRowWithTotal(result, 'Summe', grandTotal);
    return result;
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
        // sort by wp, date and start
        return entries.sort( (a: DtoTimeEntry, b: DtoTimeEntry) => {
          if (a.workPackage.subject < b.workPackage.subject) {
            return -1;
          } else if (a.workPackage.subject > b.workPackage.subject) {
            return 1;
          } else {
            if (a.spentOn < b.spentOn)
            {
              return -1;
            } else if (a.spentOn > b.spentOn) {
              return 1;
            } else if (a.customField2 < b.customField2) {
              return -1;
            } else if (a.customField2 > b.customField2) {
              return 1;
            } else {
              return 0;
            }
          }
        });
      }
      case TimeEntryLayoutSubtotal.date:
      case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
        // sort by date, wp and start
        return entries.sort( (a: DtoTimeEntry, b: DtoTimeEntry) => {
          if (a.spentOn < b.spentOn) {
            return -1;
          } else if (a.spentOn > b.spentOn) {
            return 1;
          } else {
            if (a.workPackage.subject < b.workPackage.subject)
            {
              return -1;
            } else if (a.workPackage.subject > b.workPackage.subject) {
              return 1;
            } else if (a.customField2 < b.customField2) {
              return -1;
            } else if (a.customField2 > b.customField2) {
              return 1;
            } else {
              return 0;
            }
          }
        });
      }
      default: {
        // no action required, as entries come correctly sorted from renderer
        return entries;
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
