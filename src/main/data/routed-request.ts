import { DataVerb } from '@common';

export class RoutedRequest<T> {
  dataVerb: DataVerb;
  params: any;
  queryParams: any;
  path: string;
  route: string;
  data: T;
}
