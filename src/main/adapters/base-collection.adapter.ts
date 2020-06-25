import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseList } from '@ipc';
import { CollectionModel, EntityModel } from '@core/hal-models';
import { IBaseEntityAdapter } from './base-entity.adapter';

export interface IBaseCollectionAdapter<Ent extends EntityModel, DtoList, DtoEntity>  {
  createDtoList(): DtoList;
  resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, collection: CollectionModel<Ent>): DtoList;
}

@injectable()
export abstract class BaseCollectionAdapter<Ent extends EntityModel, DtoList extends DtoBaseList<DtoEntity>, DtoEntity extends DtoBase>
  implements IBaseCollectionAdapter<Ent, DtoList, DtoEntity> {

  // <editor-fold desc='Constructor & C°'>
  constructor() { }
  // </editor-fold>

  // <editor-fold desc='Abstract methods'>
  public abstract createDtoList(): DtoList;
  // </editor-fold>

  // <editor-fold desc='IBaseAdapter interface methods'>
  public resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, collection: CollectionModel<Ent>): DtoList {
    const result = this.createDtoList();
    result.count = collection.count;
    result.offset = collection.offset;
    result.pageSize = collection.pageSize;
    result.total = collection.total;
    if (collection.elements) {
      result.items = collection.elements.map((item) => entityAdapter.resourceToDto(item));
    }
    return result;
  }
  // </editor-fold>
}
