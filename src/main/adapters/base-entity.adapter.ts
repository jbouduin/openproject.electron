import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoFormattableText, FormattableTextFormat, FormattableTextFormatKeyStrings } from '@ipc';
import { EntityModel, FormattableModel } from '@core/hal-models';

export interface IBaseEntityAdapter<Ent, Dto> {
  createDto(): Dto;
  resourceToDto(entityModel: Ent): Promise<Dto>;
}

@injectable()
export abstract class BaseEntityAdapter<Ent extends EntityModel, Dto extends DtoBase> implements IBaseEntityAdapter<Ent, Dto> {

  // <editor-fold desc='Constructor & C°'>
  constructor() { }
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
  public resourceToDto(entityModel: EntityModel): Promise<Dto> {
    const result = this.createDto();
    result.id = entityModel.id;
    result.createdAt = entityModel.createdAt;
    result.updatedAt = entityModel.updatedAt;
    return Promise.resolve(result);
  }
  // </editor-fold>
}
