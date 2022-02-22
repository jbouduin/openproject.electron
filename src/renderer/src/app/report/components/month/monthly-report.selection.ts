import { DtoMonthlyReportSelection } from '@common';

export class MonthlyReportSelection implements DtoMonthlyReportSelection {
  public month: number;
  public year: number;

  public constructor(
    month: number,
    year: number) {
    this.month = month;
    this.year = year;
  }

  public static ResetMonthlyReportSelection(): DtoMonthlyReportSelection {
    const today = new Date();
    return new MonthlyReportSelection(
      today.getMonth() + 1,
      today.getFullYear()
    );
  }
}