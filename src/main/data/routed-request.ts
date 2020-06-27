import { DataVerb } from "@ipc";

export class RoutedRequest {
  dataVerb: DataVerb;
  params: any;
  queryParams: any;
  path: string;
  route: string;
  data: any;
}
