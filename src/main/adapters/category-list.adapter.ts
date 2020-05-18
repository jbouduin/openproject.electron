import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoCategoryList, DtoCategory } from '@ipc';

import { BaseList } from './classes/base-list';
import { IBaseListAdapter, BaseListAdapter } from './base-list.adapter';
import { IHalResourceHelper } from './hal-resource-helper';
import { ICategoryAdapter } from './category.adapter';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class CategoryList extends BaseList<DtoCategory> implements DtoCategoryList { }
// </editor-fold>

export interface ICategoryListAdapter extends IBaseListAdapter<DtoCategoryList, DtoCategory>{ }

@injectable()
export class CategoryListAdapter
  extends BaseListAdapter<DtoCategoryList, DtoCategory>
  implements ICategoryListAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.HalResourceHelper) halResourceHelper: IHalResourceHelper) {
    super(halResourceHelper);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoCategoryList {
    return new CategoryList();
  }
  // </editor-fold>

  // <editor-fold desc='ICategoryAdapter interface methods'>
  public adapt(baseAdapter: ICategoryAdapter, halresource: HalResource): DtoCategoryList {
    return super.adapt(baseAdapter, halresource);
  }
  // </editor-fold>
}
