import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoFormattableText, FormattableTextFormat, FormattableTextFormatKeyStrings } from '@ipc';
import { IHalResourceHelper } from './hal-resource-helper';
import { EntityModel, FormattableModel } from '@core/hal-models';

export interface IBaseEntityAdapter<Ent, Dto> {
  createDto(): Dto;
  resourceToDto(entityModel: Ent): Dto;
}

@injectable()
export abstract class BaseEntityAdapter<Ent extends EntityModel, Dto extends DtoBase> implements IBaseEntityAdapter<Ent, Dto> {

  // <editor-fold desc='Constructor & C°'>
  constructor(protected halResourceHelper: IHalResourceHelper) { }
  // </editor-fold>

  // <editor-fold desc='Protected methods'>
  protected resourceToFormattable(formattable: FormattableModel): DtoFormattableText {
    const result: DtoFormattableText = {
      format: FormattableTextFormat[<FormattableTextFormatKeyStrings>formattable.format],
      html: formattable.html,
      raw: formattable.raw
    };
    return result;
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods'>
  public abstract createDto(): Dto;
  // </editor-fold>

  // <editor-fold desc='IBaseAdapter interface methods'>
  public resourceToDto(entityModel: EntityModel): Dto {
    const result = this.createDto();
    result.id = entityModel.id;
    result.createdAt = entityModel.createdAt;
    result.updatedAt = entityModel.updatedAt;
    return result;
  }
  // </editor-fold>
}
