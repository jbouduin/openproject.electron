export interface DtoBaseFilter {
  offset: number;
  pageSize: number;
  sortBy?: string;
  filters?: string;
  groupby?: string;
}
