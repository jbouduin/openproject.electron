import { app } from 'electron';
import { injectable, inject } from "inversify";
import moment from 'moment';
import * as path from 'path';
import { PageSizes } from 'pdf-lib';

import { ILogService, IOpenprojectService } from "@core";
import { DtoUntypedDataResponse, DataStatus, DtoTimeEntry, LogSource, DtoTimeEntryExportRequest } from "@ipc";
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
        margin: new FourSides<number>(10, 15),
        pageSize: PageSizes.A4,
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
      options.x = 10;
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

      const table = this.createTable(data.data);
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
        margin: new FourSides<number>(10, 15),
        pageSize: PageSizes.A4,
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
      options.x = 10;
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

      const table = this.createTable(data.data);
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
      response = this.processServiceError(error);
    }
    return response;
  }
  // </editor-fold>

  // <editor-fold desc='Private helper methods'>
  private createTable(data: Array<DtoTimeEntry>): IPdfTable {
    let grandTotal = 0;
    const options = new TableOptions();
    const result = new PdfTable(options);
    result.addColumn('date'); //
    result.addColumn('work package');
    result.addColumn('start');
    result.addColumn('end');
    result.addColumn('duration');
    const headerOptions = new TableOptions();
    headerOptions.style = FontStyle.bold;
    const headerRow = result.addHeaderRow(headerOptions);
    headerRow.addCell('date', 1, 'Datum'); //
    headerRow.addCell('work package', 1, 'Aufgabe');
    headerRow.addCell('start', 1, 'Von');
    headerRow.addCell('end', 1, 'Bis');
    headerRow.addCell('duration', 1, 'Zeit');
    data.forEach(entry => {
      const newRow = result.addDataRow();
      try {
        const spentOnAsDate = new Date(entry.spentOn);
        const dateString =
          spentOnAsDate.getDate().toString().padStart(2, '0') + '.' +
          (spentOnAsDate.getMonth() + 1).toString().padStart(2, '0') + '.' +
          spentOnAsDate.getFullYear().toString();
        newRow.addCell('date', 1, dateString);
        newRow.addCell('work package', 1, entry.workPackage.subject);
        newRow.addCell('start', 1, entry.customField2);
        newRow.addCell('end', 1, entry.customField3);
        const durationInMilliseconds = moment.duration(entry.hours).asMilliseconds()
        const asDate = new Date(durationInMilliseconds);
        grandTotal += durationInMilliseconds;
        const hours = asDate.getUTCHours();
        const minutes = asDate.getUTCMinutes();
        const duration = hours.toString().padStart(2, '0') + ':' +
          minutes.toString().padStart(2, '0');
        newRow.addCell('duration', 1, duration);
      } catch(error) {
        this.logService.error(LogSource.Main, 'error converting', entry, error);
      }
    });
    grandTotal /= 1000;
    const hours = Math.floor(grandTotal / 3600);
    grandTotal = grandTotal % 3600;
    const minutes = Math.floor(grandTotal / 60);
    const grandTotalOptions = new TableOptions();
    grandTotalOptions.style = FontStyle.bold;
    const grandTotalRow = result.addDataRow(grandTotalOptions);
    const totalTextOptions = new TableOptions();
    totalTextOptions.align = 'right';
    grandTotalRow.addCell('date', 4, 'Total', totalTextOptions);
    grandTotalRow.addCell('duration', 1, hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0'));
    return result;
  }
  // </editor-fold>
}
