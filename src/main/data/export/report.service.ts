import { ILogService, IOpenprojectService } from "@core";
import SERVICETYPES from "@core/service.types";
import { RoutedRequest } from "@data";
import { BaseDataService } from "@data/base-data-service";
import { IDataRouterService } from "@data/data-router.service";
import { IDataService } from "@data/data-service";
import { DataStatus, DtoReportRequest, DtoUntypedDataResponse, LogSource } from "@ipc";
import { shell } from "electron";
import { inject, injectable } from "inversify";
import PdfPrinter from "pdfmake";
import { Content, ContextPageSize, TDocumentDefinitions } from "pdfmake/interfaces";
import { BaseExportService } from "./base-export.service";
import { PdfStatics } from "./pdf-statics";

export interface IReportService extends IDataService { }

@injectable()
export class ReportService extends BaseExportService implements IReportService {

  //#region abstract BaseExportService methods implementation
  protected buildFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): Content {
    return [];
    //   {
    //     columns: [
    //       {
    //         text: `Stundennachweis ${this.authorName}`,
    //         alignment: 'left',
    //         fontSize: 11
    //       },
    //       {
    //         text: `Seite ${currentPage} / ${pageCount}`,
    //         alignment: 'right',
    //         fontSize: 11
    //       }
    //     ],
    //     margin: [15 / PdfStatics.pdfPointInMillimeters, 11 / PdfStatics.pdfPointInMillimeters, 15 / PdfStatics.pdfPointInMillimeters, 1 / PdfStatics.pdfPointInMillimeters]
    //   },
    //   {
    //     image: this.footerImage,
    //     width: pageSize.width - (30 / PdfStatics.pdfPointInMillimeters),
    //     margin: [15 / PdfStatics.pdfPointInMillimeters, 0.25 / PdfStatics.pdfPointInMillimeters]
    //   }
    // ];
  }

  protected buildHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): Content {
    return [];
    //   {
    //     image: this.headerImage,
    //     width: pageSize.width - (30 / PdfStatics.pdfPointInMillimeters),
    //     absolutePosition: {
    //       "x": 15 / PdfStatics.pdfPointInMillimeters,
    //       "y": 10 / PdfStatics.pdfPointInMillimeters
    //     }
    //   }
    // ];
  }
  //#endregion

  // <editor-fold desc='IDataService interface members'>
  public setRoutes(router: IDataRouterService): void {
    router.post('/export/report', this.exportReport.bind(this));
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService) {
    super(logService, openprojectService);
  }
  // </editor-fold>

  private async exportReport(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    return this.executeExport(
      routedRequest.data,
      this.buildPdf.bind(this)
    );
  }

  private buildPdf(data: DtoReportRequest, docDefinition: TDocumentDefinitions): void {

  }
}