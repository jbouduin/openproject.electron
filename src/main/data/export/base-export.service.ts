import { app, shell } from "electron";
import * as fs from 'fs';
import { injectable } from "inversify";
import moment from "moment";
import path from "path";
import PdfPrinter from "pdfmake";
import { Content, ContextPageSize, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";

import { ILogService, IOpenprojectService } from "@core";
import { BaseDataService } from "@data/base-data-service";
import { DataStatus, DtoBaseExportRequest, DtoUntypedDataResponse, LogSource } from "@ipc";
import { PdfStatics } from "./pdf-statics";

export type ExecuteExportCallBack = (request: DtoBaseExportRequest, docDefinition: TDocumentDefinitions, ...args: Array<any>) => void;

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
  protected async executeExport(data: DtoBaseExportRequest, callBack: ExecuteExportCallBack, ...args: Array<any>): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      this.footerImage = path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png');
      this.headerImage = path.resolve(app.getAppPath(), 'dist/main/static/images/header.png');

      const portraitDefinition = fs.readFileSync(path.resolve(app.getAppPath(), 'dist/main/static/pdf/portrait.json'), 'utf-8');
      const docDefinition = JSON.parse(portraitDefinition) as TDocumentDefinitions;

      callBack(data, docDefinition, ...args);

      docDefinition.pageMargins = [
        15 / PdfStatics.pdfPointInMillimeters, // left
        36 / PdfStatics.pdfPointInMillimeters, // top
        15 / PdfStatics.pdfPointInMillimeters, // right
        33.5 / PdfStatics.pdfPointInMillimeters // bottom
      ];
      docDefinition.defaultStyle = {
        font: 'Times'
      };
      docDefinition.footer = this.buildFooter.bind(this);
      docDefinition.header = this.buildHeader.bind(this);

      // fs.writeFile(
      //   `${data.fileName}.json`,
      //   JSON.stringify(docDefinition, null, 2),
      //   () => console.log(`DocumentInformation dumped to ${data.fileName}.json`)
      // );
      const printer = new PdfPrinter(this.buildFontDictionary());
      const pdfDoc = printer.createPdfKitDocument(docDefinition);

      const stream = fs.createWriteStream(data.pdfCommonSelection.fileName);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      if (data.pdfCommonSelection.openFile) {
        shell.openPath(data.pdfCommonSelection.fileName);
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

  protected IsoDurationAsString(duration: string): string {
    const asMoment = moment.duration(duration);
    return this.millisecondsAsString(asMoment.asMilliseconds());
  }

  protected millisecondsAsString(milliseconds: number): string {
    let value = milliseconds / 1000;
    const hours = Math.floor(value / 3600);
    value = value % 3600;
    const minutes = Math.floor(value / 60);
    return hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0');
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