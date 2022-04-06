import { DataVerb } from '@common';

export class RoutedRequest {
  dataVerb: DataVerb;
  params: any;
  queryParams: any;
  path: string;
  route: string;
  data: any;
}
