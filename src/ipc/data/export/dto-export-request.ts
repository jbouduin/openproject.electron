export interface DtoPdfCommonSelection {
  fileName: string;
  openFile: boolean;
}

export interface DtoBaseExportRequest {
  pdfCommonSelection: DtoPdfCommonSelection;
}

export interface DtoExportRequest<T> extends DtoBaseExportRequest {
  data: T
}
