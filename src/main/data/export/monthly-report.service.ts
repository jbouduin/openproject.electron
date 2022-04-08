import { inject, injectable } from "inversify";
import moment from "moment";
import { Content, ContextPageSize, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { serializeError } from 'serialize-error';

import { ILogService, IOpenprojectService } from "@core";
import SERVICETYPES from "@core/service.types";
import { ITimeEntriesService, ITimeEntrySortService, RoutedRequest } from "@data";
import { IDataRouterService } from "@data";
import { IRoutedDataService } from "@data/routed-data-service";
import { DataStatus, DtoMonthlyReportSelection, DtoProject, DtoReportRequest, DtoTimeEntry, DtoTimeEntryActivity, DtoTimeEntryList, DtoUntypedDataResponse, DtoWorkPackage } from '@common';
import { BaseExportService } from "./base-export.service";
import { PdfStatics } from "./pdf-statics";
import { Subtotal } from "./sub-total";
import { LogSource } from "@common";

export type IMonthlyReportService = IRoutedDataService;

@injectable()
export class MonthlyReportService extends BaseExportService implements IMonthlyReportService {

  //#region private properties ------------------------------------------------
  private footerLeftText: string;
  private timeEntriesService: ITimeEntriesService;
  private timeEntrySortService: ITimeEntrySortService;
  //#endregion

  //#region abstract BaseExportService methods implementation -----------------
  protected buildPageFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): Content {
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

  protected buildPageHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): Content {
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

  //#region IDataService interface members ------------------------------------
  public setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.post('/export/report/monthly', this.exportReport.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.TimeEntriesService) timeEntriesService: ITimeEntriesService,
    @inject(SERVICETYPES.TimeEntrySortService) timeEntrySortService: ITimeEntrySortService) {
    super(logService, openprojectService);
    this.timeEntriesService = timeEntriesService;
    this.timeEntrySortService = timeEntrySortService;
  }
  //#endregion

  //#region route callback ----------------------------------------------------
  private exportReport(routedRequest: RoutedRequest<DtoReportRequest<DtoMonthlyReportSelection>>): Promise<DtoUntypedDataResponse> {
    void this.timeEntriesService.getTimeEntriesForMonth(routedRequest.data.selection.month, routedRequest.data.selection.year)
      .then((timeEntryList: DtoTimeEntryList) => {
        this.executeExport(
          routedRequest.data, // as DtoBaseExportRequest,
          //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          this.buildPdf.bind(this),
          timeEntryList);
      }
      )
      .catch((reason: any) => {
        this.logService.error(LogSource.Main, 'Error generating monthly report', serializeError(reason));
      });
    const result: DtoUntypedDataResponse = {
      status: DataStatus.Accepted
    };
    return Promise.resolve(result);
  }
  //#endregion

  //#region report callback ---------------------------------------------------
  private buildPdf(data: DtoReportRequest<DtoMonthlyReportSelection>, docDefinition: TDocumentDefinitions, ...args: Array<any>): void {
    moment.locale('de');
    const date = moment(new Date(data.selection.year, data.selection.month - 1, 1));
    this.footerLeftText = `Monatsbericht ${date.format('MMMM YYYY')}`;

    const dtoTimeEntryList = (args[0] as DtoTimeEntryList);
    const projectSubtotals = new Array<Subtotal<DtoProject>>();
    const wpSubtotals = new Array<Subtotal<DtoWorkPackage>>();
    const actSubtotals = new Array<Subtotal<DtoTimeEntryActivity>>();
    const grandTotal = this.calculateAndSortSubtotals(dtoTimeEntryList.items, projectSubtotals, wpSubtotals, actSubtotals);

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

    // export every project in detail
    projectSubtotals.forEach((projectSubtotal: Subtotal<DtoProject>) => {
      const projectId = projectSubtotal.subTotalFor.id;
      (docDefinition.content as Array<Content>).push(
        this.exportProjectDetail(
          projectSubtotal,
          wpSubtotals.filter((subTotal: Subtotal<DtoWorkPackage>) => subTotal.subTotalFor.project.id == projectId),
          this.timeEntrySortService.sortByProjectAndWorkPackageAndDate(dtoTimeEntryList.items.filter((entry: DtoTimeEntry) => entry.project.id == projectId))
        )
      );
    });

    const monthTotalRow = this.buildSubTotalLine(
      false,
      grandTotal.toExportable(`Summe für ${date.format('MMMM YYYY')}`),
      5,
      true
    )
    docDefinition.content.push(this.buildDetailTableFromRows([monthTotalRow]));

    // title for summary
    docDefinition.content.push({
      pageBreak: 'before',
      text: `Zusammenfassung für ${date.format('MMMM YYYY')}`,
      fontSize: 24,
      bold: true,
      decoration: 'underline',
      alignment: 'center',
      margin: [0, 5 / PdfStatics.pdfPointInMillimeters]
    });

    // export all project sub totals in a single table
    projectSubtotals.forEach((projectSubtotal: Subtotal<DtoProject>) => {
      const projectId = projectSubtotal.subTotalFor.id;
      (docDefinition.content as Array<Content>).push(
        this.exportProjectSummary(
          projectSubtotal,
          wpSubtotals.filter((subTotal: Subtotal<DtoWorkPackage>) => subTotal.subTotalFor.project.id == projectId)
        )
      );
    });

    // export the activities
    docDefinition.content.push(this.exportActivities(true, actSubtotals, grandTotal));

    // export the total of the summary
    const summaryTotalRow: Array<TableCell> = this.buildSubTotalLine(
      true,
      grandTotal.toExportable(`Summe für ${date.format('MMMM YYYY')}`),
      2,
      true
    );

    docDefinition.content.push(this.buildSummaryTableFromRows([summaryTotalRow]));
  }
  //#endregion

  //#region export helpers ----------------------------------------------------
  private exportProjectDetail(projectSubtotal: Subtotal<DtoProject>, wpSubtotals: Array<Subtotal<DtoWorkPackage>>, entries: Array<DtoTimeEntry>): Content {
    const rows = new Array<Array<TableCell>>();

    rows.push(this.buildTableHeaderLine(projectSubtotal.subTotalFor.name, 6, true, true, 16));

    wpSubtotals.forEach((wpSubtotal: Subtotal<DtoWorkPackage>) => {
      const wpId = wpSubtotal.subTotalFor.id;
      rows.push(...this.exportWorkPackageDetail(wpSubtotal, entries.filter((entry: DtoTimeEntry) => entry.workPackage.id == wpId)));
    });

    rows.push(this.buildSubTotalLine(
      false,
      projectSubtotal.toExportable(`Zwischensumme für ${projectSubtotal.subTotalFor.name}`),
      5,
      true
    ));
    return this.buildDetailTableFromRows(rows);

  }

  private exportProjectSummary(projectSubtotal: Subtotal<DtoProject>, wpSubtotals: Array<Subtotal<DtoWorkPackage>>): Content {
    const rows = new Array<Array<TableCell>>();

    rows.push(this.buildTableHeaderLine(projectSubtotal.subTotalFor.name, 5, true, true, 16));
    rows.push(...this.buildSummaryHeaderLines('Aufgabe'));
    rows.push(...wpSubtotals.map((wpSubtotal: Subtotal<DtoWorkPackage>) =>
      this.buildSummaryDetailLine(
        wpSubtotal.subTotalFor.id,
        wpSubtotal.subTotalFor.subject,
        wpSubtotal.nonBillableAsString,
        wpSubtotal.billableAsString,
        wpSubtotal.totalAsString)
    ));

    rows.push(this.buildSubTotalLine(
      true,
      projectSubtotal.toExportable(`Zwischensumme für ${projectSubtotal.subTotalFor.name}`),
      2,
      true)
    );
    return this.buildSummaryTableFromRows(rows);
  }

  private exportWorkPackageDetail(wpSubtotal: Subtotal<DtoWorkPackage>, entries: Array<DtoTimeEntry>): Array<Array<TableCell>> {
    const result = new Array<Array<TableCell>>()

    result.push(this.buildTableHeaderLine(
      `#${wpSubtotal.subTotalFor.id} ${wpSubtotal.subTotalFor.subject}`,
      6,
      false,
      undefined
    ));

    result.push(
      ...entries.map((entry: DtoTimeEntry, idx: number, fullArray: Array<DtoTimeEntry>) => {
        const firstCell = {}
        if (idx == 0) {
          firstCell['rowSpan'] = fullArray.length;
          firstCell['text'] = ' ';
        }
        const row: Array<TableCell> = new Array<TableCell>();
        row.push(firstCell);
        row.push({
          text: moment(entry.spentOn).format('DD.MM.YYYY'),
          alignment: 'center'
        });
        row.push({
          text: entry.activity.name
        });
        row.push({
          text: entry.start,
          alignment: 'center'
        });
        row.push({
          text: entry.end,
          alignment: 'center'
        });
        row.push({
          text: this.IsoDurationAsString(entry.hours),
          alignment: 'center'
        });
        return row;
      })
    );

    result.push(this.buildSubTotalLine(
      false,
      wpSubtotal.toExportable(`Zwischensumme für #${wpSubtotal.subTotalFor.id} ${wpSubtotal.subTotalFor.subject}`),
      5,
      false
    ));
    return result;
  }
  //#endregion

  //#region private helper methods --------------------------------------------
  private calculateAndSortSubtotals(
    timeEntries: Array<DtoTimeEntry>,
    projectSubtotals: Array<Subtotal<DtoProject>>,
    wpSubtotals: Array<Subtotal<DtoWorkPackage>>,
    actSubtotals: Array<Subtotal<DtoTimeEntryActivity>>): Subtotal<number> {

    const grandTotal = new Subtotal<number>(0, moment.duration(0), false);
    timeEntries.forEach((entry: DtoTimeEntry) => {
      const billable = entry.project.pricing == 'Fixed Price' || entry.workPackage.billable == true;
      grandTotal.addTime(entry.hours, billable);
      const projectSubtotal = projectSubtotals.find((subtotal: Subtotal<DtoProject>) => subtotal.subTotalFor.id == entry.project.id);
      if (projectSubtotal) {
        projectSubtotal.addTime(entry.hours, billable);
      } else {
        projectSubtotals.push(new Subtotal<DtoProject>(entry.project, entry.hours, billable));
      }
      const wpSubtotal = wpSubtotals.find((subtotal: Subtotal<DtoWorkPackage>) => subtotal.subTotalFor.id == entry.workPackage.id);
      if (wpSubtotal) {
        wpSubtotal.addTime(entry.hours, billable);
      } else {
        wpSubtotals.push(new Subtotal<DtoWorkPackage>(entry.workPackage, entry.hours, billable));
      }
      const actSubtotal = actSubtotals.find((subtotal: Subtotal<DtoTimeEntryActivity>) => subtotal.subTotalFor.id == entry.activity.id);
      if (actSubtotal) {
        actSubtotal.addTime(entry.hours, billable);
      } else {
        actSubtotals.push(new Subtotal<DtoTimeEntryActivity>(entry.activity, entry.hours, billable));
      }
    });

    // sort the subtotals
    projectSubtotals.sort((a: Subtotal<DtoProject>, b: Subtotal<DtoProject>) => a.subTotalFor.identifier.localeCompare(b.subTotalFor.identifier));
    wpSubtotals.sort((a: Subtotal<DtoWorkPackage>, b: Subtotal<DtoWorkPackage>) => a.subTotalFor.id - b.subTotalFor.id);
    actSubtotals.sort((a: Subtotal<DtoTimeEntryActivity>, b: Subtotal<DtoTimeEntryActivity>) => a.subTotalFor.name.localeCompare(b.subTotalFor.name));
    return grandTotal;
  }
  //#endregion

  //#region private table helper methods --------------------------------------
  private buildSummaryHeaderLines(text: string): Array<Array<TableCell>> {
    return [
      [
        {
          text: text,
          bold: true,
          colSpan: 2,
          rowSpan: 2
        },
        {},
        {
          text: 'Abrechenbar',
          bold: true,
          colSpan: 2,
          alignment: 'center'
        },
        {},
        {
          text: 'Summe',
          bold: true,
          alignment: 'center',
          rowSpan: 2
        },
      ],
      [
        {},
        {},
        {
          text: 'Nein',
          bold: true,
          alignment: 'center'
        },
        {
          text: 'Ja',
          bold: true,
          alignment: 'center'
        },
        {},
      ],
    ];
  }

  private buildSummaryDetailLine(id: number, label: string, nonBillable: string, billable: string, total: string): Array<TableCell> {
    return [
      {
        text: `# ${id}`
      },
      {
        text: label
      },
      {
        text: nonBillable,
        alignment: 'center',
      },
      {
        text: billable,
        alignment: 'center',
      },
      {
        text: total,
        alignment: 'center',
      },
    ]
  }

  private buildDetailTableFromRows(rows: Array<Array<TableCell>>): Content {
    const result: Content = {
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
        body: rows
      }
    };
    return result;
  }

  private buildSummaryTableFromRows(rows: Array<Array<TableCell>>): Content {
    const result: Content = {
      margin: [0, 5 / PdfStatics.pdfPointInMillimeters],
      table: {
        headerRows: 1,
        keepWithHeaderRows: 5,
        widths: [
          15 / PdfStatics.pdfPointInMillimeters,
          '*',
          15 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters
        ],
        body: rows
      }
    };
    return result;
  }
  //#endregion
}