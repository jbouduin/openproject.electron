import { Pipe, PipeTransform } from '@angular/core';
import * as moment  from 'moment';

@Pipe({
  name: 'iso8601Timespan'
})
export class Iso8601TimespanPipe implements PipeTransform {

  transform(value: string): string {
    const asDate = new Date(moment.duration(value).asMilliseconds());
    const hours = asDate.getUTCHours();
    const minutes = asDate.getUTCMinutes();

    return hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0');
  }

}
