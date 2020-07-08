import { app } from 'electron';
import { injectable, inject } from "inversify";
import * as path from 'path';
import { PageSizes } from 'pdf-lib';

import { ILogService, IOpenprojectService } from "@core";
import { DtoUntypedDataResponse, DataStatus, DtoExportRequest } from "@ipc";
import { IDataService } from "../data-service";
import { IDataRouterService } from "../data-router.service";
import { RoutedRequest } from "../routed-request";
import { BaseDataService } from "../base-data-service";

import SERVICETYPES from "@core/service.types";
import { FlowDocument } from './pdf/flow-document';
import { WriteTextOptions } from './pdf/write-text-options';
import { FontStyle } from './pdf/font-style';
import { FourSides } from './pdf/four-sides';

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
      await doc.write('first line of text', options);
      options.style = FontStyle.underline;
      await doc.write('second line of text underlined', options);
      doc.moveDown(5);
      options.style = FontStyle.bold | FontStyle.underline;
      options.size = 20;
      options.align = 'center';
      data.title.filter(line => line ? true : false).forEach( async line => await doc.write(line, options));
      // await doc.write(data.title[0], options);
      // if (data.title.length > 1) {
      //   await doc.write(data.title[1], options);
      // }
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
  // </editor-fold>
}
