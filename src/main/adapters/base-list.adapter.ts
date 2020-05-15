import { HalResource } from 'hal-rest-client';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseList } from '@ipc';
import { IBaseAdapter } from './base.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

export interface IBaseListAdapter<T, U>  {
  createDtoList(): T;
  adapt(modelAdapter: IBaseAdapter<U>, halresource: HalResource): T;
}

@injectable()
export abstract class BaseListAdapter<T extends DtoBaseList<U>, U extends DtoBase> implements IBaseListAdapter<T, U> {

  // <editor-fold desc='Constructor & C°'>
  constructor(protected halResourceHelper: IHalResourceHelper) { }
  // </editor-fold>

  // <editor-fold desc='Abstract methods'>
  public abstract createDtoList(): T;
  // </editor-fold>

  // <editor-fold desc='IBaseAdapter interface methods'>
  public adapt(baseAdapter: IBaseAdapter<U>, halresource: HalResource): T {
    const result = this.createDtoList();
    result.count = this.halResourceHelper.getNumberProperty(halresource, 'count');
    result.offset = this.halResourceHelper.getNumberProperty(halresource, 'offset');
    result.pageSize = this.halResourceHelper.getNumberProperty(halresource, 'pageSize');
    result.total = this.halResourceHelper.getNumberProperty(halresource, 'total');
    const items = this.halResourceHelper.getElements(halresource);
    if (items) {
      result.items = items.map((item) => baseAdapter.adapt(item));
    }
    return result;
  }
  // </editor-fold>
}
