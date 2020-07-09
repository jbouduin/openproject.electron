import { app } from 'electron';
import { injectable, inject } from "inversify";
import moment from 'moment';
import * as path from 'path';
import { PageSizes } from 'pdf-lib';

import { ILogService, IOpenprojectService } from "@core";
import { DtoUntypedDataResponse, DataStatus, DtoExportRequest, DtoTimeEntry } from "@ipc";
import { IDataService } from "../data-service";
import { IDataRouterService } from "../data-router.service";
import { RoutedRequest } from "../routed-request";
import { BaseDataService } from "../base-data-service";

import SERVICETYPES from "@core/service.types";
import { FlowDocument } from './pdf/flow-document';
import { WriteTextOptions } from './pdf/write-text-options';
import { FontStyle } from './pdf/font-style';
import { FourSides } from './pdf/four-sides';
import { IPdfTable, PdfTable } from './pdf/pdf-table';
import { TableOptions } from './pdf/table-options';

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
  }
  // </editor-fold>

  // <editor-fold desc='Callback methods'>
  private async exportTimeSheets(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      const data: DtoExportRequest = routedRequest.data;
      const doc = await FlowDocument.createDocument({
        headerImage: path.resolve(app.getAppPath(), 'dist/main/static/images/header.png'),
        footerImage: path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png'),
        margin: new FourSides<number>(15),
        pageSize: PageSizes.A4,
        title: data.title.join(' ') || 'Timesheets'
      });
      const options = new WriteTextOptions();
      await doc.writeLine('first line of text', options);
      options.style = FontStyle.underline;
      await doc.writeLine('second line of text underlined', options);
      await doc.moveDown(5);
      options.style = FontStyle.bold | FontStyle.underline;
      options.size = 20;
      options.align = 'center';
      // This does not work as expected, it prints all lines at the same y
      // data.title
      //   .filter(line => line ? true : false)
      //   .forEach( async (line: string) => { await doc.writeLine(line, options); });
      await doc.writeLine(data.title[0], options);
      if (data.title[1]) {
        await doc.writeLine(data.title[1], options);
      }
      if (data.title[2]) {
        await doc.writeLine(data.title[2], options);
      }
      await doc.moveDown(2);
      await doc.writeLine(data.title.join(', '), options);
      // const table =
      this.createTable(data.data);
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
        newRow.addCell('date', 1, entry.spentOn.toLocaleString('de-DE').substring(0,10)); // XXX
        newRow.addCell('work package', 1, entry.workPackage.subject);
        newRow.addCell('start', 1, entry.customField2);
        newRow.addCell('end', 1, entry.customField3);

        const asDate = new Date(moment.duration(entry.hours).asMilliseconds());
        const hours = asDate.getUTCHours();
        const minutes = asDate.getUTCMinutes();
        const duration = hours.toString().padStart(2, '0') + ':' +
          minutes.toString().padStart(2, '0');
        newRow.addCell('duration', 1, duration);
      } catch(error) {
        console.log('error converting', entry, error);
      }
    });
    // console.log(result);
    // result.dataRows.values().forEach(r => r.cells.forEach(c =>console.log(c.value)));
    return result;
  }
  // </editor-fold>
}
