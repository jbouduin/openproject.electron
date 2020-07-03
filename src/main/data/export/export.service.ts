import { app, shell } from 'electron';
import * as fs from 'fs';
import { injectable, inject } from "inversify";
import * as path from 'path';
import { PageSizes, PDFDocument, StandardFonts, rgb, PDFImage, PDFPage } from 'pdf-lib';

import { ILogService, IOpenprojectService } from "@core";
import { DtoUntypedDataResponse, DataStatus, DtoExportRequest } from "@ipc";
import { IDataService } from "../data-service";
import { IDataRouterService } from "../data-router.service";
import { RoutedRequest } from "../routed-request";
import { BaseDataService } from "../base-data-service";

import SERVICETYPES from "@core/service.types";

export interface IExportService extends IDataService { }

@injectable()
export class ExportService extends BaseDataService implements IExportService {

  // Remark: sizes are in pdfPoints
  // 1 inch = 72 points
  // 1 inch = 25.4 mm
  // 1 point = 0.352777778 mm
  // 15 mm = 42.52 points (approx)
  // 10 mm = 28.35 points (approx)

  // <editor-fold desc='Private properties'>
  private readonly marginLeft = 28.35;
  private readonly marginRight = 28.35;
  private readonly marginTop = 28.35;
  private readonly marginBottom = 28.35;
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
      const doc = await this.createPdf(data.title || 'Timesheets');
      const timesRomanFont = await doc.embedFont(StandardFonts.TimesRoman)
      const headerImage = await this.loadImage(doc, 'header.png');
      const footerImage = await this.loadImage(doc, 'footer.png');
      const page = this.addPage(doc, headerImage, footerImage);

      // Draw a string of text toward the top of the page
      const fontSize = 30;
      page.drawText('Creating PDFs in JavaScript is awesome!', {
        x: 50,
        y: page.getHeight() - 4 * fontSize,
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
  private addPage(doc: PDFDocument, headerImage?: PDFImage, footerImage?: PDFImage): PDFPage {
    const result = doc.addPage(PageSizes.A4);
    if (headerImage) {
      this.drawCenteredImage(result, headerImage, 0, 'top');
    }

    if (footerImage) {
      this.drawCenteredImage(result, footerImage, 0, 'bottom');
    }

    return result;
  }

  private async createPdf(title: string): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    doc.setAuthor('Johan Bouduin');
    doc.setTitle(title);
    doc.setCreator('https://github.com/jbouduin/openproject.electron');
    doc.setProducer('https://github.com/jbouduin/openproject.electron');
    return doc;
  }

  private drawCenteredImage(page: PDFPage, image: PDFImage, y: number, from: 'top' | 'bottom' | 'absolute'): void {
    const pageSize = page.getSize();
    let calculatedWidth: number;
    let calculatedHeight: number;
    let calculatedX: number;
    let calculatedY: number;

    if (pageSize.width - image.width < this.marginLeft + this.marginRight) {
      const factor = (pageSize.width - this.marginLeft - this.marginRight) / image.width;
      const scaled = image.scale(factor);
      calculatedX = this.marginLeft;
      calculatedWidth = scaled.width;
      calculatedHeight = scaled.height;
    } else {
      calculatedX = this.marginLeft;
      calculatedWidth = image.width;
      calculatedHeight = image.height;
    }
    switch (from) {
      case 'top': {
        calculatedY = pageSize.height - this.marginTop - y - calculatedHeight;
        break;
      }
      case 'bottom': {
        calculatedY = this.marginBottom + y; // - calculatedHeight;
        break;
      }
      case 'absolute': {
        calculatedY = y;
        break;
      }
    }
    page.drawImage(image, {
      x: calculatedX,
      y: calculatedY,
      width: calculatedWidth,
      height: calculatedHeight
    });
  }

  private async loadImage(doc:PDFDocument, fileName: string): Promise<PDFImage> {
    const fullPath = path.resolve(app.getAppPath(), 'dist/main/static/images', fileName);
    const img = await fs.promises.readFile(fullPath);
    return doc.embedPng(img);
  }
  // </editor-fold>
}
