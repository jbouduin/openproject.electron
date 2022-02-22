import { DtoAbsenceReportSelection } from '@common';

export class AbsenceReportSelection implements DtoAbsenceReportSelection {
  public readonly year: number;

  public constructor(year: number) {
    this.year = year;
  }

  public static ResetAbsenceReportSelection(): DtoAbsenceReportSelection {
    return new AbsenceReportSelection(new Date().getFullYear());
  }
}