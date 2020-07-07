import * as moment from 'moment';
import { DateRangeSelection } from './date-range-selection';

export class SelectionData {

  private options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    public range: DateRangeSelection,
    public start: moment.Moment,
    public end: moment.Moment,
    public projects: Array<number>) { }
  // </editor-fold>

  public static dateRangeSelectionToString(selection: DateRangeSelection): string {
    switch (selection) {
      case DateRangeSelection.custom : { return  'Custom'; }
      case DateRangeSelection.lastMonth : { return  'Last month'; }
      case DateRangeSelection.lastWeek : { return  'Last week'; }
      case DateRangeSelection.lastYear : { return  'Last year'; }
      case DateRangeSelection.thisMonth : { return  'This month'; }
      case DateRangeSelection.thisWeek : { return  'This week'; }
      case DateRangeSelection.thisYear : { return  'This year'; }
      case DateRangeSelection.today : { return  'Today'; }
      case DateRangeSelection.yesterday : { return  'Yesterday'; }
    }
  }

  public toQueryFilterString(): string {
    const filters = new Array<any>();
    filters.push(
      {
        'spent_on': {
          'operator': '<>d',
          'values': [
            new Intl.DateTimeFormat('de-DE').format(this.start.toDate()),
            new Intl.DateTimeFormat('de-DE').format(this.end.toDate())
          ]
       }
      }
    );
    if (this.projects && this.projects.length > 0)
    {
      filters.push({
        'project': {
          'operator': '=',
          'values': this.projects
        }
      });
    };
    return JSON.stringify(filters);
  }

  public toSortByString(): string {
    const sortBy = [['spent_on', 'asc']];
    return JSON.stringify(sortBy);
  }

  public toExportTitle(): Array<string> {
    let result: Array<string>;
    switch(this.range) {
      case DateRangeSelection.today:
      case DateRangeSelection.yesterday: {
        result = [ this.singleDayExportTitle(this.start) ];
        break;
      }
      case DateRangeSelection.thisMonth:
      case DateRangeSelection.lastMonth: {
        result = [ this.singleMonthExportTitle(this.start) ];
        break;
      }
      case DateRangeSelection.thisYear:
      case DateRangeSelection.lastYear: {
        result = [ this.singleYearExportTitle(this.start) ];
        break;
      }
      case DateRangeSelection.thisWeek:
      case DateRangeSelection.lastWeek:
      case DateRangeSelection.custom: {
        if (this.start.isSame(this.end, 'date')){
          result = [ this.singleDayExportTitle(this.start) ];
        } else if (this.start.isSame(this.end, 'year') && this.start.isSame(this.end, 'month') &&
          this.start.day() === 1 && this.end.date() === this.end.daysInMonth()) {
          result = [ this.singleMonthExportTitle(this.start) ];
        } else if (this.start.isSame(this.end, 'year') &&
          this.start.dayOfYear() === 1 && this.end.dayOfYear() >= 365) {
          result = [ this.singleYearExportTitle(this.start) ];
        } else {
          const startDate = new Intl.DateTimeFormat('de-DE', this.options).format(this.start.toDate());
          const endDate = new Intl.DateTimeFormat('de-DE', this.options).format(this.end.toDate());
          result = [
            'Stundennachweis für die Zeit von',
            `${startDate} bis`,
            `einschließlich ${endDate}`
          ];
        }
        break;
      }
    }
    return result;
  }

  private singleDayExportTitle(date: moment.Moment): string {
    return `Stundennachweis für ${new Intl.DateTimeFormat('de-DE', this.options).format(date.toDate())}`;
  }

  private singleMonthExportTitle(date: moment.Moment): string {
    const startParts = new Intl.DateTimeFormat('de-DE', this.options).formatToParts(date.toDate());
    return `Stundennachweis für ${startParts[4].value} ${startParts[6].value}`;
  }

  private singleYearExportTitle(date: moment.Moment): string {
    return `Stundennachweis für das Jahr ${date.year()}`;
  }
}
