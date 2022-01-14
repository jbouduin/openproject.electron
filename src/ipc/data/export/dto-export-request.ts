export interface DtoBaseExportRequest {
  fileName: string;
  openFile: boolean;
}

export interface DtoExportRequest<T> extends DtoBaseExportRequest {
  data: T
}
