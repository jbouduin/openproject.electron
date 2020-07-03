// import { execFile } from 'child_process';
import { shell } from 'electron';
import { injectable, inject } from "inversify";
import * as fs from 'fs';

import { PageSizes, PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { IDataService } from "../data-service";
import { IDataRouterService } from "../data-router.service";
import { RoutedRequest } from "../routed-request";
import { DtoUntypedDataResponse, DataStatus, DtoExportRequest } from "@ipc";
import { BaseDataService } from "@data/base-data-service";
import { ILogService, IOpenprojectService } from "@core";

import SERVICETYPES from "@core/service.types";

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
      const doc = await this.createPdf();
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
      fs.writeFile(
        data.fileName,
        pdfBytes,
        () => {
          if (data.openFile) {
            shell.openItem(data.fileName);
          }
        });

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
  private async createPdf(): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    doc.setAuthor('Johan Bouduin');
    doc.setTitle('Timesheets');

    return doc;
  }
  // </editor-fold>
}
