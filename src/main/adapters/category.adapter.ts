import { HalResource } from 'hal-rest-client';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { DtoCategory } from '@ipc';

import { IBaseAdapter, BaseAdapter } from './base.adapter';
import { IHalResourceHelper } from './hal-resource-helper';

import ADAPTERTYPES from './adapter.types';

// <editor-fold desc='Helper class'>
class Category implements DtoCategory {
  public id: number;
  public createdAt?: Date;
  public name: string;
  public updatedAt?: Date;

  public constructor() {
    this.id = 0;
    this.createdAt = undefined,
    this.name = '';
    this.updatedAt = undefined
  }
}
// </editor-fold>

export interface ICategoryAdapter extends IBaseAdapter<DtoCategory> { }

@injectable()
export class CategoryAdapter extends BaseAdapter<DtoCategory> implements ICategoryAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.HalResourceHelper) halResourceHelper: IHalResourceHelper) {
    super(halResourceHelper);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoCategory {
    return new Category();
  }
  // </editor-fold>

  // <editor-fold desc='ICategoryAdapter interface methods'>
  public adapt(halResource: HalResource): DtoCategory {
    const result = super.adapt(halResource);
    result.name = this.halResourceHelper.getStringProperty(halResource, 'name');
    return result;
  }
  // </editor-fold>
}
