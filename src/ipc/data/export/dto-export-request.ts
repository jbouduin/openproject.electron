export interface DtoExportRequest<T> {
  fileName: string;
  openFile: boolean;
  data: T
}
