import { HalResource } from 'hal-rest-client';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoFormattableText, FormattableTextFormat } from '@ipc';

export interface IHalResourceHelper {
  getDateProperty(halResource: HalResource, propertyName: string, defaultValue?: Date): Date;
  getElements(halResource: HalResource): Array<HalResource>;
  getFormattableText(halResource: HalResource, propertyName: string): DtoFormattableText;
  getLinkHRef(halResource: HalResource, propertyName: string, defaultValue?: string): string;
  getLinkNumberProperty(halResource: HalResource, linkName: string, propertyName: string, defaultValue?: number): number;
  getLinkStringProperty(halResource: HalResource, linkName: string, propertyName: string, defaultValue?: string): string;
  getNumberProperty(halResource: HalResource, propertyName: string, defaultValue?: number): number;
  getStringProperty(halResource: HalResource, propertyName: string, defaultValue?: string): string;
}

@injectable()
export class HalResourceHelper implements IHalResourceHelper {

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='IHalResourceHelper interface methods'>
  public getDateProperty(halResource: HalResource, propertyName: string, defaultValue?: Date): Date {
    const result = halResource.prop(propertyName) as Date;
    return (!result && defaultValue) ? defaultValue : result;
  }

  public getElements(halResource: HalResource): Array<HalResource> {
    return halResource.prop('elements');
  }

  public getFormattableText(halResource: HalResource, propertyName: string): DtoFormattableText {
    return halResource.prop(propertyName) as DtoFormattableText;
  }

  public getLinkHRef(halResource: HalResource, propertyName: string, defaultValue?: string): string {
    const link = halResource.link(propertyName);
    if (link) {
      return link.prop('href');
    }
    return defaultValue;
  }

  public getLinkNumberProperty(halResource: HalResource, linkName: string, propertyName: string, defaultValue?: number): number {
    const link = halResource.link(linkName);
    if (link) {
      return this.getNumberProperty(link, propertyName, defaultValue);
    }
    return defaultValue;
  }

  public getLinkStringProperty(halResource: HalResource, linkName: string, propertyName: string, defaultValue?: string): string {
    const link = halResource.link(linkName);
    if (link) {
      return this.getStringProperty(link, propertyName, defaultValue);
    }
    return defaultValue;
  }

  public getNumberProperty(halResource: HalResource, propertyName: string, defaultValue?: number): number {
    const result = halResource.prop(propertyName) as number;
    return (!result && defaultValue) ? defaultValue : result;
  }

  public getStringProperty(halResource: HalResource, propertyName: string, defaultValue?: string): string {
    const result = halResource.prop(propertyName) as string;
    return (!result && defaultValue) ? defaultValue : result;
  }
  // </editor-fold>
}
