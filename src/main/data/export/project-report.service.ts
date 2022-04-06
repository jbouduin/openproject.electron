import { inject } from "inversify";
import moment from "moment";
import { serializeError } from 'serialize-error';

import { ILogService, IOpenprojectService } from "@core";
import { IDataRouterService } from "@data/data-router.service";
import { IRoutedDataService } from "@data/routed-data-service";
import { IProjectsService, ITimeEntriesService, ITimeEntrySortService, IWorkPackagesService, RoutedRequest } from "@data";
import { IProjectQueriesService, IWorkPackagesByTypeAndStatus } from "@data/openproject/project-queries.service";
import { DataStatus, DtoReportRequest, DtoUntypedDataResponse, DtoWorkPackageList } from '@common';
import { DtoProject, DtoProjectReportSelection } from '@common';
import { DtoTimeEntry, DtoTimeEntryActivity, DtoTimeEntryList } from '@common';
import { DtoWorkPackage, DtoWorkPackageType } from '@common';
import { ContextPageSize, Content, TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import { BaseExportService } from "./base-export.service";
import { PdfStatics } from "./pdf-statics";
import { Subtotal } from "./sub-total";

import SERVICETYPES from "@core/service.types";
import { LogSource, WorkPackageTypeMap } from "@common";

export type IProjectReportService = IRoutedDataService;

type StatusColumnNames = 'newCnt' | 'inProgressCnt' | 'doneCnt' | 'totalCnt' | 'newPct' | 'inProgressPct' | 'donePct';

export class ProjectReportService extends BaseExportService implements IProjectReportService {

  //#region private properties ------------------------------------------------b
  private footerLeftText: string;
  private projectQueriesService: IProjectQueriesService;
  private projectService: IProjectsService;
  private timeEntriesService: ITimeEntriesService;
  private timeEntrySortService: ITimeEntrySortService;
  private workPackageService: IWorkPackagesService;
  //#endregion

  //#region IDataService interface members ------------------------------------
  setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.post('/export/report/project', this.exportReport.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.ProjectQueriesService) projectQueriesService: IProjectQueriesService,
    @inject(SERVICETYPES.ProjectsService) projectService: IProjectsService,
    @inject(SERVICETYPES.TimeEntriesService) timeEntriesService: ITimeEntriesService,
    @inject(SERVICETYPES.TimeEntrySortService) timeEntrySortService: ITimeEntrySortService,
    @inject(SERVICETYPES.WorkPackagesService) workPackageService: IWorkPackagesService) {
    super(logService, openprojectService);
    this.projectQueriesService = projectQueriesService;
    this.projectService = projectService;
    this.timeEntriesService = timeEntriesService;
    this.timeEntrySortService = timeEntrySortService;
    this.workPackageService = workPackageService;
  }
  //#endregion

  //#region abstract baseclass methods implementation -------------------------
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

  //#region route callback ----------------------------------------------------
  private exportReport(routedRequest: RoutedRequest<DtoReportRequest<DtoProjectReportSelection>>): Promise<DtoUntypedDataResponse> {
    void Promise
      .all([
        this.timeEntriesService.getTimeEntriesForProject(routedRequest.data.selection.projectId),
        this.projectService.getProjectDetails(routedRequest.data.selection.projectId, ['types'])
          .then(async (project: DtoProject) => {
            const counts = await this.projectQueriesService.countWorkpackagesByTypeAndStatus(
              project.id,
              project.workPackageTypes.items.filter((type: DtoWorkPackageType) => type.name != WorkPackageTypeMap.Invoice)
            );
            return { project: project, countWorkPackages: counts };
          }),
        this.workPackageService.getInvoicesForProject(routedRequest.data.selection.projectId)
      ])
      .then((value: [
        DtoTimeEntryList,
        { project: DtoProject, countWorkPackages: Array<IWorkPackagesByTypeAndStatus> },
        DtoWorkPackageList
      ]) =>
        this.executeExport(
          //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          routedRequest.data,
          //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          this.buildPdf.bind(this),
          value[0],
          value[1].project,
          value[1].countWorkPackages,
          value[2])
      )
      .catch((reason: any) => {
        this.logService.error(LogSource.Main, 'Error creating project report', serializeError(reason));
      });

    const result: DtoUntypedDataResponse = {
      status: DataStatus.Accepted
    }
    return Promise.resolve(result);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private buildPdf(data: DtoReportRequest<DtoProjectReportSelection>, docDefinition: TDocumentDefinitions, ...args: Array<any>): void {

    moment.locale('de');
    const dtoTimeEntryList = args[0] as DtoTimeEntryList;
    const project = args[1] as DtoProject;
    const accumulatedValues = args[2] as Array<IWorkPackagesByTypeAndStatus>;
    const invoices = args[3] as DtoWorkPackageList;
    this.footerLeftText = `${project.name}`;

    // TODO #1604 sort the subtotals instead of the whole list
    const dtoTimeEntries = this.timeEntrySortService.sortByDateAndProjectAndWorkPackage(dtoTimeEntryList.items);

    const dateSubtotals = new Array<Subtotal<[Date, DtoWorkPackage]>>();
    const monthSubtotals = new Array<Subtotal<[number, number]>>();
    const yearSubtotals = new Array<Subtotal<number>>();
    const actSubtotals = new Array<Subtotal<DtoTimeEntryActivity>>();
    const grandTotal = this.calculateSubtotals(dtoTimeEntries, dateSubtotals, monthSubtotals, yearSubtotals, actSubtotals);
    const showBillable = project.pricing !== 'None';

    docDefinition.info = {
      title: this.footerLeftText,
      author: this.authorName,
      subject: 'Bericht'
    };

    docDefinition.content = [
      {
        text: `Projektbericht für\n${project.name}`,
        fontSize: 24,
        bold: true,
        decoration: 'underline',
        alignment: 'center',
        margin: [0, 5 / PdfStatics.pdfPointInMillimeters]
      }
    ];
    // create header tables ( report date, pricing, start date, end date, total number of workpackages per type and their status)
    docDefinition.content.push(this.exportProjectDataTable(project));
    docDefinition.content.push(this.exportWorkpackagesTable(project, accumulatedValues));
    if (project.pricing !== 'None') {
      docDefinition.content.push(this.exportInvoices(invoices.items));
    }
    // create a table for every month with one line per day /WP and the months subtotal
    docDefinition.content.push({
      pageBreak: 'before',
      text: `Totale pro Monat`,
      fontSize: 16,
      bold: true,
      decoration: 'underline',
      alignment: 'center',
      margin: [0, 5 / PdfStatics.pdfPointInMillimeters]
    });
    monthSubtotals.forEach((month: Subtotal<[number, number]>) => {
      const dates = dateSubtotals.filter((date: Subtotal<[Date, DtoWorkPackage]>) => date.subTotalFor[0].getMonth() === month.subTotalFor[1]);
      (docDefinition.content as Array<Content>).push(this.exportSingleMonthTable(showBillable, month, dates));
    });

    docDefinition.content.push({
      pageBreak: 'before',
      text: `Zusammenfassung`,
      fontSize: 16,
      bold: true,
      decoration: 'underline',
      alignment: 'center',
      margin: [0, 5 / PdfStatics.pdfPointInMillimeters]
    });
    // create a table with all months, one line per month, subtotal / year + grand total
    docDefinition.content.push(this.exportMontlySummariesTable(project, grandTotal, yearSubtotals, monthSubtotals));

    // create a table with totals / activity and the grand total again
    docDefinition.content.push(this.exportActivities(showBillable, actSubtotals, grandTotal));

  }
  //#endregion

  //#region export methods ----------------------------------------------------
  /**
   * returns a single table witht the details of the month
   * @param monthSubtotal
   * @param daySubTotals
   * @returns a table (Content)
   */
  private exportSingleMonthTable(billable: boolean, monthSubtotal: Subtotal<[number, number]>, daySubTotals: Array<Subtotal<[Date, DtoWorkPackage]>>): Content {
    const rows = new Array<Array<TableCell>>();
    const monthLabel = moment(new Date(monthSubtotal.subTotalFor[0], monthSubtotal.subTotalFor[1], 1)).format('MMMM YYYY');
    // create the header lines
    rows.push(
      this.buildTableHeaderLine(
        monthLabel,
        billable ? 6 : 4,
        true,
        true,
        16)
    );
    const firstRow = new Array<TableCell>();
    firstRow.push({
      text: 'Datum',
      bold: true,
      alignment: 'center',
      rowSpan: 2
    });
    firstRow.push({
      text: 'Aufgabe',
      bold: true,
      colSpan: 2
    });
    firstRow.push({});

    const secondRow = new Array<TableCell>();
    secondRow.push({});
    secondRow.push({
      text: 'ID',
      bold: true,
    });
    secondRow.push({
      text: 'Beschreibung',
      bold: true
    });
    rows.push(
      ...this.appendDurationColumnsToDoubleHeaderLine(
        billable,
        [
          firstRow,
          secondRow
        ],
        true
      )
    );
    // for every day add a line
    rows.push(...daySubTotals.map((day: Subtotal<[Date, DtoWorkPackage]>) => this.exportSingleDayRow(billable, day)));

    // add the month total
    rows.push(
      this.buildSubTotalLine(
        billable,
        monthSubtotal.toExportable(`Summe für ${monthLabel}`),
        3,
        true)
    );
    return this.buildTableFromRows(
      rows,
      billable ?
        [
          20 / PdfStatics.pdfPointInMillimeters,
          12 / PdfStatics.pdfPointInMillimeters,
          '*',
          12 / PdfStatics.pdfPointInMillimeters,
          12 / PdfStatics.pdfPointInMillimeters,
          12 / PdfStatics.pdfPointInMillimeters
        ] :
        [
          20 / PdfStatics.pdfPointInMillimeters,
          12 / PdfStatics.pdfPointInMillimeters,
          '*',
          12 / PdfStatics.pdfPointInMillimeters
        ],
      3,
      1
    );
  }

  private exportSingleDayRow(billable: boolean, day: Subtotal<[Date, DtoWorkPackage]>): Array<TableCell> {
    const result = new Array<TableCell>();
    result.push({
      text: moment(day.subTotalFor[0]).format('DD.MM.YYYY'),
      alignment: 'center'
    });
    result.push({
      text: `#${day.subTotalFor[1].id}`,
    });
    result.push({
      text: `${day.subTotalFor[1].subject}`,
    });
    if (billable) {
      result.push({
        text: day.nonBillableAsString,
        alignment: 'center'
      });
      result.push({
        text: day.billableAsString,
        alignment: 'center'
      });
    }
    result.push({
      text: day.totalAsString,
      alignment: 'center'
    });
    return result;
  }

  /**
   * returns a table
   * @param yearSubtotals
   * @param monthSubtotals
   * @returns
   */
  private exportMontlySummariesTable(
    project: DtoProject,
    grandTotal: Subtotal<number>,
    yearSubtotals: Array<Subtotal<number>>,
    monthSubtotals: Array<Subtotal<[number, number]>>): Content {

    const rows = new Array<Array<TableCell>>();
    const billable = project.pricing !== 'None';
    // create the header line
    rows.push(
      this.buildTableHeaderLine(
        "Zusammenfassung pro Monat",
        billable ? 5 : 3,
        true,
        true,
        16)
    );
    const firstRow = new Array<TableCell>();
    firstRow.push({
      text: 'Jahr',
      bold: true,
      alignment: 'center'
    });
    firstRow.push({
      text: 'Monat',
      bold: true
    });

    rows.push(
      ...this.appendDurationColumnsToSingleHeaderLine(billable, firstRow, true)
    )

    // for each year
    yearSubtotals.forEach((year: Subtotal<number>) => {
      const months = monthSubtotals
        .filter((month: Subtotal<[number, number]>) => month.subTotalFor[0] === year.subTotalFor);
      rows.push(...this.exportSingleYearDetail(billable, year, months))
    });

    // add the grand total
    rows.push(this.buildSubTotalLine(
      billable,
      grandTotal.toExportable(`Summe für ${project.name}`),
      2,
      true
    ));

    return this.buildTableFromRows(
      rows,
      billable ?
        [
          15 / PdfStatics.pdfPointInMillimeters,
          '*',
          15 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters
        ] :
        [
          15 / PdfStatics.pdfPointInMillimeters,
          '*',
          15 / PdfStatics.pdfPointInMillimeters
        ],
      2,
      1
    );
  }

  /**
   * returns an array of table rows
   * @param year
   * @param months
   * @returns
   */
  private exportSingleYearDetail(billable: boolean, year: Subtotal<number>, months: Array<Subtotal<[number, number]>>): Array<Array<TableCell>> {
    const rows = new Array<Array<TableCell>>();
    // create a detail row for every month

    months.forEach((month: Subtotal<[number, number]>, idx: number, all: Array<Subtotal<[number, number]>>) => {
      const monthLabel = moment(new Date(month.subTotalFor[0], month.subTotalFor[1], 1)).format('MMMM');
      const row = new Array<TableCell>();
      if (idx === 0) {
        row.push({
          text: year.subTotalFor,
          alignment: 'center',
          rowSpan: all.length
        });
      } else {
        row.push({});
      }
      row.push({
        text: monthLabel
      });
      if (billable) {
        row.push({
          text: month.nonBillableAsString,
          alignment: 'center'
        });
        row.push({
          text: month.billableAsString,
          alignment: 'center'
        });
      }
      row.push({
        text: month.totalAsString,
        alignment: 'center'
      });
      rows.push(row);
    })
    // add the year subtotal
    rows.push(
      this.buildSubTotalLine(
        billable,
        year.toExportable(`Zwischensumme für ${year.subTotalFor}`),
        2,
        true
      )
    );

    return rows;
  }

  private exportProjectDataTable(project: DtoProject): Content {
    const rows = new Array<Array<TableCell>>();
    // Header line
    rows.push(this.buildTableHeaderLine(
      `#${project.id} : ${project.name}`,
      2,
      true,
      true,
      16
    ));
    // Report Date
    rows.push([
      { text: 'Datum Bericht', bold: true },
      { text: moment().format('dddd D MMMM YYYY') }
    ]);
    // Pricing Model
    rows.push([
      { text: 'Abrechnungsmodel', bold: true },
      { text: project.pricing === 'None' ? '' : project.pricing }
    ]);
    // start - end date
    rows.push([
      { text: 'Projekt Start', bold: true },
      { text: project.startDate ? moment(project.startDate).format('dddd D MMMM YYYY') : '' }
    ]);
    rows.push([
      { text: 'Projekt End', bold: true },
      { text: project.endDate ? moment(project.endDate).format('dddd D MMMM YYYY') : '' }
    ]);
    // Customer - Final Customer
    rows.push([{ text: 'Kunde', bold: true }, { text: project.customer || '' }]);
    rows.push([{ text: 'Endkunde', bold: true }, { text: project.endCustomer || '' }]);

    return this.buildTableFromRows(
      rows,
      ['auto', '*'],
      1,
      1
    );
  }

  private exportWorkpackagesTable(project: DtoProject, accumulatedValues: Array<IWorkPackagesByTypeAndStatus>): Content {
    const rows = new Array<Array<TableCell>>();
    // Workpackages Header Line
    rows.push(this.buildTableHeaderLine('Workpackages', 8, true, true, 16));
    // Workpackages Subheader lines
    const firstSubHeaderLine = [
      {
        text: 'Type',
        bold: true,
        rowSpan: 2
      },
      {
        text: 'Open',
        bold: true,
        colSpan: 2,
        alignment: 'center'
      },
      {},
      {
        text: 'WIP',
        bold: true,
        colSpan: 2,
        alignment: 'center'
      },
      {},
      {
        text: 'Done',
        bold: true,
        colSpan: 2,
        alignment: 'center'
      },
      {},
      {
        text: 'Total',
        bold: true,
        alignment: 'center'
      }
    ];
    rows.push(firstSubHeaderLine);
    const secondSubHeaderLine = new Array<TableCell>({});
    for (let i = 0; i <= 3; i++) {
      secondSubHeaderLine.push({ text: 'Anzahl', bold: true, alignment: 'center' });
      if (i < 3) {
        secondSubHeaderLine.push({ text: '%', bold: true, alignment: 'center' });
      }
    }
    rows.push(secondSubHeaderLine);
    // Workpackages Detail
    project.workPackageTypes.items
      .filter((workPackageType: DtoWorkPackageType) => workPackageType.name !== WorkPackageTypeMap.Invoice)
      .sort((a: DtoWorkPackageType, b: DtoWorkPackageType) => a.name.localeCompare(b.name))
      .forEach((wpType: DtoWorkPackageType) => {
        const filtered = accumulatedValues.filter((value: IWorkPackagesByTypeAndStatus) => value.workPackageType.id === wpType.id);
        if (filtered.length > 0) {
          rows.push(this.createWorkPackageAccumulationColumns(filtered));
        } else {
          const emptyRow = new Array<TableCell>();
          emptyRow.push({ text: wpType.name, bold: true });
          for (let i = 0; i <= 6; i++) {
            emptyRow.push({});
          }
          rows.push(emptyRow);
        }
      });
    // Workpackages Footer
    const firstCell: TableCell = { text: 'Total', alignment: 'right', bold: true };
    rows.push(this.createWorkPackageAccumulationColumns(accumulatedValues, firstCell));
    // rows.push(footerLine);
    // build the table
    const widths = new Array<string | number>('*');
    for (let i = 0; i <= 6; i++) {
      widths.push(15 / PdfStatics.pdfPointInMillimeters);
    }

    return this.buildTableFromRows(
      rows,
      widths,
      3,
      1
    );
  }

  private exportInvoices(invoices: Array<DtoWorkPackage>): Content {
    const rows = new Array<Array<TableCell>>();
    // Header line
    rows.push(this.buildTableHeaderLine(
      'Rechnungen',
      6,
      true,
      true,
      16
    ));

    rows.push([
      { text: '#', bold: true, alignment: 'center' },
      { text: 'Rechn. Nummer', bold: true },
      { text: 'Beschreibung', bold: true },
      { text: 'Datum', bold: true },
      { text: 'Bezahlt am', bold: true },
      { text: 'Betrag', bold: true }
    ]);
    let totalAmount = 0;
    rows.push(
      ...invoices
        .sort((a: DtoWorkPackage, b: DtoWorkPackage) => a.subject.localeCompare(b.subject))
        .map((invoice: DtoWorkPackage, idx: number) => {
          totalAmount += invoice.netAmount || 0;
          const amount = (invoice.netAmount || 0).toFixed(2);
          const startDate = invoice.startDate ? moment(invoice.startDate).format('DD.MM.YYYY') : '';
          const endDate = invoice.dueDate ? moment(invoice.dueDate).format('DD.MM.YYYY') : '';
          const result: Array<TableCell> = [
            { text: idx, alignment: 'center' },
            { text: invoice.subject },
            { text: invoice.description.raw },
            { text: startDate, alignment: 'center' },
            { text: endDate, alignment: 'center' },
            { text: amount, alignment: 'right' }
          ];
          return result;
        })
    );
    const totalLine = new Array<TableCell>();
    totalLine.push({ text: 'Total', bold: true, alignment: 'right', colSpan: 5 });
    for (let i = 0; i < 4; i++) {
      totalLine.push({});
    }
    totalLine.push({ text: totalAmount.toFixed(2), alignment: 'right' });
    rows.push(totalLine);
    return this.buildTableFromRows(
      rows,
      [
        5 / PdfStatics.pdfPointInMillimeters,
        25 / PdfStatics.pdfPointInMillimeters,
        '*',
        20 / PdfStatics.pdfPointInMillimeters,
        20 / PdfStatics.pdfPointInMillimeters,
        20 / PdfStatics.pdfPointInMillimeters,
      ],
      1,
      1
    );
  }
  //#endregion


  //#region private helper methods --------------------------------------------
  private calculateSubtotals(
    timeEntries: Array<DtoTimeEntry>,
    dateSubtotals: Array<Subtotal<[Date, DtoWorkPackage]>>,
    monthSubtotals: Array<Subtotal<[number, number]>>,
    yearSubtotals: Array<Subtotal<number>>,
    actSubtotals: Array<Subtotal<DtoTimeEntryActivity>>): Subtotal<number> {

    const grandTotal = new Subtotal<number>(0, moment.duration(0), false);
    timeEntries.forEach((entry: DtoTimeEntry) => {
      const billable = entry.project.pricing == 'Fixed Price' || entry.workPackage.billable == true;
      grandTotal.addTime(entry.hours, billable);
      const dateSubtotal = dateSubtotals
        .find((subtotal: Subtotal<[Date, DtoWorkPackage]>) => subtotal.subTotalFor[0].getTime() === entry.spentOn.getTime() && subtotal.subTotalFor[1].id === entry.workPackage.id);
      if (dateSubtotal) {
        dateSubtotal.addTime(entry.hours, billable);
      } else {
        dateSubtotals.push(new Subtotal<[Date, DtoWorkPackage]>([entry.spentOn, entry.workPackage], entry.hours, billable));
      }
      const month = entry.spentOn.getMonth();
      const year = entry.spentOn.getFullYear();
      const monthSubtotal = monthSubtotals
        .find((subtotal: Subtotal<[number, number]>) => subtotal.subTotalFor[0] === year && subtotal.subTotalFor[1] === month);
      if (monthSubtotal) {
        monthSubtotal.addTime(entry.hours, billable);
      } else {
        monthSubtotals.push(new Subtotal<[number, number]>([year, month], entry.hours, billable));
      }

      const yearSubtotal = yearSubtotals.find((subtotal: Subtotal<number>) => subtotal.subTotalFor == year);
      if (yearSubtotal) {
        yearSubtotal.addTime(entry.hours, billable);
      } else {
        yearSubtotals.push(new Subtotal<number>(year, entry.hours, billable));
      }

      const actSubtotal = actSubtotals.find((subtotal: Subtotal<DtoTimeEntryActivity>) => subtotal.subTotalFor.id == entry.activity.id);
      if (actSubtotal) {
        actSubtotal.addTime(entry.hours, billable);
      } else {
        actSubtotals.push(new Subtotal<DtoTimeEntryActivity>(entry.activity, entry.hours, billable));
      }
    });
    return grandTotal;
  }

  private createWorkPackageAccumulationColumns(accumulatedValues: Array<IWorkPackagesByTypeAndStatus>, firstCell?: TableCell): Array<TableCell> {
    const result = new Array<TableCell>();
    const accumulated = this.calculateStatusColumnValues(accumulatedValues);

    if (firstCell) {
      result.push(firstCell);
    } else {
      result.push({ text: accumulatedValues[0].workPackageType.name, bold: true });
    }
    result.push({ text: accumulated.newCnt > 0 ? accumulated.newCnt : '', alignment: 'right' });
    result.push({ text: accumulated.newPct > 0 ? accumulated.newPct : '', alignment: 'right' });

    result.push({ text: accumulated.inProgressCnt > 0 ? accumulated.inProgressCnt : '', alignment: 'right' });
    result.push({ text: accumulated.inProgressPct > 0 ? accumulated.inProgressPct : '', alignment: 'right' });

    result.push({ text: accumulated.doneCnt > 0 ? accumulated.doneCnt : '', alignment: 'right' });
    result.push({ text: accumulated.donePct > 0 ? accumulated.donePct : '', alignment: 'right' });

    result.push({ text: accumulated.totalCnt, alignment: 'right' });

    return result;
  }

  private calculateStatusColumnValues(accumulatedValues: Array<IWorkPackagesByTypeAndStatus>): Record<StatusColumnNames, number> {
    const result: Record<StatusColumnNames, number> = {
      newCnt: 0,
      inProgressCnt: 0,
      doneCnt: 0,
      totalCnt: 0,
      newPct: 0,
      inProgressPct: 0,
      donePct: 0
    };

    result.totalCnt = accumulatedValues
      .map((value: IWorkPackagesByTypeAndStatus) => value.count)
      .reduce((previous: number, current: number) => previous + current);

    result.newCnt = accumulatedValues
      .filter((value: IWorkPackagesByTypeAndStatus) => value.status.isDefault === true)
      .map((value: IWorkPackagesByTypeAndStatus) => value.count)
      .reduce((previous: number, current: number) => previous + current, 0);

    result.inProgressCnt = accumulatedValues
      .filter((value: IWorkPackagesByTypeAndStatus) => value.status.isClosed === false && value.status.isDefault === false)
      .map((value: IWorkPackagesByTypeAndStatus) => value.count)
      .reduce((previous: number, current: number) => previous + current, 0);

    result.doneCnt = accumulatedValues
      .filter((value: IWorkPackagesByTypeAndStatus) => value.status.isClosed === true)
      .map((value: IWorkPackagesByTypeAndStatus) => value.count)
      .reduce((previous: number, current: number) => previous + current, 0);

    result.newPct = Math.round((result.newCnt / result.totalCnt) * 100);
    result.inProgressPct = Math.round((result.inProgressCnt / result.totalCnt) * 100);
    result.donePct = 100 - result.newPct - result.inProgressPct;
    return result;
  }
  //#endregion
}