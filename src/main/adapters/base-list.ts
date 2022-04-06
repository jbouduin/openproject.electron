import { DtoBase, DtoBaseList } from '@common';

export class BaseList<T extends DtoBase> implements DtoBaseList<T> {
  public total: number;
  public count: number;
  public pageSize!: number;
  public offset!: number;
  public items!: Array<T>;

  public constructor() {
    this.total = 0;
    this.count = 0;
  }
}
