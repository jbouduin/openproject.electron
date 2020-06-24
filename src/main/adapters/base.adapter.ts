import { HalResource } from 'hal-rest-client';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase } from '@ipc';
import { IHalResourceHelper } from './hal-resource-helper';

export interface IBaseAdapter<T> {
  createDto(): T;
  resourceToDto(halResource: HalResource): T;
}

@injectable()
export abstract class BaseAdapter<T extends DtoBase> implements IBaseAdapter<T> {

  // <editor-fold desc='Constructor & C°'>
  constructor(protected halResourceHelper: IHalResourceHelper) { }
  // </editor-fold>

  // <editor-fold desc='Abstract methods'>
  public abstract createDto(): T;
  // </editor-fold>

  // <editor-fold desc='IBaseAdapter interface methods'>
  public resourceToDto(halResource: HalResource): T {
    const result = this.createDto();
    result.id = this.halResourceHelper.getNumberProperty(halResource, 'id');
    result.createdAt = this.halResourceHelper.getDateProperty(halResource, 'createdAt');
    result.updatedAt = this.halResourceHelper.getDateProperty(halResource, 'updatedAt');
    return result;
  }
  // </editor-fold>
}
