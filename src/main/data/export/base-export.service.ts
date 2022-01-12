import { DataStatus, DtoBaseExportRequest, DtoUntypedDataResponse, LogSource } from "@ipc";
import PdfPrinter from "pdfmake";
import { Content, ContextPageSize, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";

import * as fs from 'fs';
import { app, shell } from "electron";
import { BaseDataService } from "@data/base-data-service";
import { injectable } from "inversify";
import SERVICETYPES from "@core/service.types";
import { ILogService, IOpenprojectService } from "@core";
import path from "path";
import { PdfStatics } from "./pdf-statics";

@injectable()
export abstract class BaseExportService extends BaseDataService{

  //#region Protected properties
  protected footerImage: string;
  protected headerImage: string;
  protected authorName: string;
  //#endregion

  //#region BaseDataService abstract properties implementation
  protected get entityRoot(): string {
    return '/export';
  }
  //#endregion

  //#endregion abstract methods
  protected abstract buildFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): Content;
  protected abstract buildHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): Content;
  //#endregion

  //#region Constructor & C°
  public constructor(
    logService: ILogService,
    openprojectService: IOpenprojectService) {
    super(logService, openprojectService);
    this.authorName = 'Johan Bouduin';
  }
  //#endregion

  //#region protected base class methods
  protected async executeExport(data: DtoBaseExportRequest, callBack: (request: DtoBaseExportRequest, docDefinition: TDocumentDefinitions) => TDocumentDefinitions): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      this.footerImage = path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png');
      this.headerImage = path.resolve(app.getAppPath(), 'dist/main/static/images/header.png');

      const portraitDefinition = fs.readFileSync(path.resolve(app.getAppPath(), 'dist/main/static/pdf/portrait.json'), 'utf-8');
      const docDefinition = JSON.parse(portraitDefinition) as TDocumentDefinitions;
      callBack(data, docDefinition);
      docDefinition.pageMargins = [
        15 / PdfStatics.pdfPointInMillimeters, // left
        36 / PdfStatics.pdfPointInMillimeters, // top
        15 / PdfStatics.pdfPointInMillimeters, // right
        33.5 / PdfStatics.pdfPointInMillimeters // bottom
      ];
      docDefinition.defaultStyle = {
        font: 'Times'
      };
      docDefinition.header = this.buildHeader.bind(this);
      docDefinition.footer = this.buildFooter.bind(this);

      const printer = new PdfPrinter(this.buildFontDictionary());
      const pdfDoc = printer.createPdfKitDocument(docDefinition); //, { tableLayouts: this.myTableLayouts.bind(this) });

      const stream = fs.createWriteStream(data.fileName);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      if (data.openFile) {
        shell.openPath(data.fileName);
      }
      response = {
        status: DataStatus.Accepted
      };
    } catch (error) {
      this.logService.error(LogSource.Main, error);
      response = this.processServiceError(error);
    }
    return response;
  }
  //#endregion

  //#region private methods
  private buildFontDictionary(): TFontDictionary {
    const result: TFontDictionary = {
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      }
    };
    return result;
  }

  //#endregion
}