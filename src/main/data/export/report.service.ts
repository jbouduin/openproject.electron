import { inject, injectable } from "inversify";
import moment from "moment";
import { Content, ContextPageSize, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

import { TimeEntrySort } from "@common";
import { ILogService, IOpenprojectService } from "@core";
import SERVICETYPES from "@core/service.types";
import { ITimeEntriesService, RoutedRequest } from "@data";
import { IDataRouterService } from "@data";
import { IDataService } from "@data/data-service";
import { DtoProject, DtoReportRequest, DtoTimeEntry, DtoTimeEntryActivity, DtoTimeEntryList, DtoUntypedDataResponse, DtoWorkPackage } from "@ipc";
import { BaseExportService } from "./base-export.service";
import { PdfStatics } from "./pdf-statics";
import { Subtotal } from "./sub-total";

export interface IReportService extends IDataService { }

@injectable()
export class ReportService extends BaseExportService implements IReportService {

  //#region private properties
  private footerLeftText: string;
  private timeEntriesService: ITimeEntriesService;
  //#endregion

  //#region abstract BaseExportService methods implementation
  protected buildFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): Content {
    return [
      {
        columns: [
          {
            text: this.footerLeftText,
            alignment: 'left',
            fontSize: 11
          },
          {
            text: `Seite ${currentPage} / ${pageCount}`,
            alignment: 'right',
            fontSize: 11
          }
        ],
        margin: [
          15 / PdfStatics.pdfPointInMillimeters,
          11 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters,
          1 / PdfStatics.pdfPointInMillimeters
        ]
      },
      {
        image: this.footerImage,
        width: pageSize.width - (30 / PdfStatics.pdfPointInMillimeters),
        margin: [
          15 / PdfStatics.pdfPointInMillimeters,
          0.25 / PdfStatics.pdfPointInMillimeters
        ]
      }
    ];
  }

  protected buildHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): Content {
    return [
      {
        image: this.headerImage,
        width: pageSize.width - (30 / PdfStatics.pdfPointInMillimeters),
        absolutePosition: {
          "x": 15 / PdfStatics.pdfPointInMillimeters,
          "y": 10 / PdfStatics.pdfPointInMillimeters
        }
      }
    ];
  }
  //#endregion

  //#region IDataService interface members
  public setRoutes(router: IDataRouterService): void {
    router.post('/export/report', this.exportReport.bind(this));
  }
  //#endregion

  //#region Constructor & C°
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.TimeEntriesService) timeEntriesService: ITimeEntriesService) {
    super(logService, openprojectService);
    this.timeEntriesService = timeEntriesService;
  }
  //#endregion

  //#region route callback
  private async exportReport(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    const data = routedRequest.data as DtoReportRequest;
    return this.timeEntriesService.getTimeEntriesForMonth(data.month, data.year)
      .then((timeEntryList: DtoTimeEntryList) =>
        this.executeExport(
          routedRequest.data,
          this.buildPdf.bind(this),
          timeEntryList)
      );
  }
  //#endregion

  //#region private helper methods
  private buildPdf(data: DtoReportRequest, docDefinition: TDocumentDefinitions, ...args: Array<any>): void {
    moment.locale('de');
    const date = moment(new Date(data.year, data.month - 1, 1));
    this.footerLeftText = `Monatsbericht ${date.format('MMMM YYYY')}`;

    docDefinition.info = {
      title: this.footerLeftText,
      author: this.authorName,
      subject: 'Bericht'
    };

    docDefinition.content = [
      {
        text: this.footerLeftText,
        fontSize: 24,
        bold: true,
        decoration: 'underline',
        alignment: 'center',
        margin: [0, 5 / PdfStatics.pdfPointInMillimeters]
      }
    ];

    const dtoTimeEntryList = (args[0] as DtoTimeEntryList)
    const dtoTimeEntries = TimeEntrySort.sortByProjectAndWorkPackageAndDate(dtoTimeEntryList.items);

    const projectSubtotals = new Array<Subtotal<DtoProject>>();
    const wpSubtotals = new Array<Subtotal<DtoWorkPackage>>();
    const actSubtotals = new Array<Subtotal<DtoTimeEntryActivity>>();
    this.calculateSubtotals(dtoTimeEntries, projectSubtotals, wpSubtotals, actSubtotals);

    const grandTotal = new Subtotal<number>(data.month, moment.duration(0));
    projectSubtotals.forEach((projectSubtotal: Subtotal<DtoProject>) => {
      grandTotal.addTime(projectSubtotal.duration);
      const projectId = projectSubtotal.subTotalFor.id;
      (docDefinition.content as Array<Content>).push(
        this.exportProject(
          projectSubtotal,
          wpSubtotals.filter((subTotal: Subtotal<DtoWorkPackage>) => subTotal.subTotalFor.project.id == projectId),
          dtoTimeEntries.filter((entry: DtoTimeEntry) => entry.project.id == projectId)
        )
      );
    });

    docDefinition.content.push({
      margin: [0, 5 / PdfStatics.pdfPointInMillimeters],
      table: {
        headerRows: 1,
        keepWithHeaderRows: 5,
        widths: [
          10 / PdfStatics.pdfPointInMillimeters,
          25 / PdfStatics.pdfPointInMillimeters,
          '*',
          15 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters
        ],
        body: [
          [
            {
              text: `Summe für ${date.format('MMMM YYYY')}`,
              fontSize: 14,
              bold: true,
              alignment: 'right',
              colSpan: 5,
            },
            {},
            {},
            {},
            {},
            {
              text: grandTotal.asString,
              fontSize: 14,
              bold: true,
              alignment: 'center',
            }
          ]
        ]
      }
    });
}

  private exportProject(projectSubtotal: Subtotal < DtoProject >, wpSubtotals: Array < Subtotal < DtoWorkPackage >>, entries: Array<DtoTimeEntry>): Content {
  const rows = new Array<Array<TableCell>>();

  rows.push([
    {
      text: projectSubtotal.subTotalFor.name,
      fontSize: 16,
      bold: true,
      alignment: 'center',
      colSpan: 6
    },
    {},
    {},
    {},
    {},
    {},
  ])

  wpSubtotals.forEach((wpSubtotal: Subtotal<DtoWorkPackage>) => {
    const wpId = wpSubtotal.subTotalFor.id;
    rows.push(...this.exportWorkPackage(wpSubtotal, entries.filter((entry: DtoTimeEntry) => entry.workPackage.id == wpId)));
  });

  rows.push([
    {
      text: `Zwischensumme für ${projectSubtotal.subTotalFor.name}`,
      // fontSize: 14,
      alignment: 'right',
      bold: true,
      colSpan: 5
    },
    {},
    {},
    {},
    {},
    {
      text: projectSubtotal.asString,
      alignment: 'center',
      bold: true
    }
  ]);

  return {
    margin: [0, 5 / PdfStatics.pdfPointInMillimeters],
    table: {
      headerRows: 1,
      keepWithHeaderRows: 5,
      widths: [
        10 / PdfStatics.pdfPointInMillimeters,
        25 / PdfStatics.pdfPointInMillimeters,
        '*',
        15 / PdfStatics.pdfPointInMillimeters,
        15 / PdfStatics.pdfPointInMillimeters,
        15 / PdfStatics.pdfPointInMillimeters
      ],
      body: rows,
    }
  };
}

  private exportWorkPackage(wpSubtotal: Subtotal < DtoWorkPackage >, entries: Array<DtoTimeEntry>): Array < Array < TableCell >> {
  const result = new Array<Array<TableCell>>()

    result.push([
    {
      text: `#${wpSubtotal.subTotalFor.id} - ${wpSubtotal.subTotalFor.subject}`,
      bold: true,
      colSpan: 6
    },
    {},
    {},
    {},
    {},
    {}
  ]);
  result.push(
    ...entries.map((entry: DtoTimeEntry, idx: number, fullArray: Array<DtoTimeEntry>) => {
      let firstCell = {}
      if (idx == 0) {
        firstCell['rowSpan'] = fullArray.length;
        firstCell['text'] = ' ';
      }
      const row: Array<TableCell> = [
        firstCell,
        {
          text: moment(entry.spentOn).format('DD.MM.YYYY'),
          alignment: 'center'
        },
        {
          text: entry.activity.name
        },
        {
          text: entry.customField2,
          alignment: 'center'
        },
        {
          text: entry.customField3,
          alignment: 'center'
        },
        {
          text: this.IsoDurationAsString(entry.hours),
          alignment: 'center'
        }
      ];
      return row;
    })
  );

  result.push([
    {
      text: `Zwischensumme für #${wpSubtotal.subTotalFor.id} - ${wpSubtotal.subTotalFor.subject}`,
      alignment: 'right',
      colSpan: 5
    },
    {},
    {},
    {},
    {},
    {
      text: wpSubtotal.asString,
      alignment: 'center'
    }
  ]);

  return result;
}

  private calculateSubtotals(
    timeEntries: Array < DtoTimeEntry >,
    projectSubtotals: Array < Subtotal < DtoProject >>,
    wpSubtotals: Array < Subtotal < DtoWorkPackage >>,
    actSubtotals: Array<Subtotal<DtoTimeEntryActivity>>): void {

    timeEntries.forEach((entry: DtoTimeEntry) => {
      const projectSubtotal = projectSubtotals.find((subtotal: Subtotal<DtoProject>) => subtotal.subTotalFor.id == entry.project.id);
      if (projectSubtotal) {
        projectSubtotal.addTime(entry.hours);
      } else {
        projectSubtotals.push(new Subtotal<DtoProject>(entry.project, entry.hours));
      }
      const wpSubtotal = wpSubtotals.find((subtotal: Subtotal<DtoWorkPackage>) => subtotal.subTotalFor.id == entry.workPackage.id);
      if (wpSubtotal) {
        wpSubtotal.addTime(entry.hours);
      } else {
        wpSubtotals.push(new Subtotal<DtoWorkPackage>(entry.workPackage, entry.hours));
      }
      const actSubtotal = actSubtotals.find((subtotal: Subtotal<DtoTimeEntryActivity>) => subtotal.subTotalFor.id == entry.activity.id);
      if (actSubtotal) {
        actSubtotal.addTime(entry.hours);
      } else {
        actSubtotals.push(new Subtotal<DtoTimeEntryActivity>(entry.activity, entry.hours));
      }
    });
  }
  //#endregion
}