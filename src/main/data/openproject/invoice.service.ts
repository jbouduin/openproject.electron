

import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';
import { IRoutedDataService } from '@data/routed-data-service';
import { BaseDataService } from '@data/base-data-service';
import { inject, injectable } from 'inversify';
import { IDataRouterService, RouteCallback } from '@data/data-router.service';
import { DataStatus, DtoBaseFilter, DtoDataResponse, DtoInvoice, DtoInvoiceList, WorkPackageTypeMap } from '@common';
import { RoutedRequest } from '@data/routed-request';
import { IInvoiceCollectionAdapter, IInvoiceEntityAdapter } from '@adapters';
import { ILogService, IOpenprojectService } from '@core';
import { IWorkPackageTypeService } from './work-package-type.service';
import { WorkPackageCollectionModel, WorkPackageEntityModel } from '@core/hal-models';

export interface IInvoiceService extends IRoutedDataService {
  getInvoicesForProject(projectId: number): Promise<DtoInvoiceList>;
}

@injectable()
export class InvoiceService extends BaseDataService implements IInvoiceService {

  //#region Private properties ------------------------------------------------
  private invoiceCollectionAdapter: IInvoiceCollectionAdapter;
  private invoiceEntityAdapter: IInvoiceEntityAdapter;
  private workPackageTypeService: IWorkPackageTypeService;
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/work_packages'; }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.WorkPackageTypeService) workPackageTypeService: IWorkPackageTypeService,
    @inject(ADAPTERTYPES.InvoiceCollectionAdapter) invoiceCollectionAdapter: IInvoiceCollectionAdapter,
    @inject(ADAPTERTYPES.InvoiceEntityAdapter) invoiceEntityAdapter: IInvoiceEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageTypeService = workPackageTypeService;
    this.invoiceCollectionAdapter = invoiceCollectionAdapter;
    this.invoiceEntityAdapter = invoiceEntityAdapter;
  }
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get('/invoices/open', this.getOpenInvoices.bind(this) as RouteCallback);
    router.post('/invoices', this.createNewInvoice.bind(this) as RouteCallback);
  }
  //#endregion

  //#region IInvoiceService interface -----------------------------------------
  public async getInvoicesForProject(projectId: number): Promise<DtoInvoiceList> {
    const invoiceType = await this.workPackageTypeService.getWorkPackageTypeByName(WorkPackageTypeMap.Invoice);
    const filters = new Array<any>();
    filters.push({
      'type': {
        'operator': '=',
        'values': [
          invoiceType.id
        ]
      }
    });
    filters.push({
      'project': {
        'operator': '=',
        'values': [
          projectId
        ]
      }
    });

    const filter: DtoBaseFilter = {
      offset: 0,
      pageSize: 100,
      filters: JSON.stringify(filters)
    };

    return this.getInvoices(filter);
  }
  //#endregion

  //#region GET callbacks -----------------------------------------------------
  private async getOpenInvoices(_request: RoutedRequest<DtoBaseFilter>): Promise<DtoDataResponse<DtoInvoiceList>> {
    const workPackageTypes = await this.workPackageTypeService.loadWorkPackageTypes();
    const invoiceTypeId = new Array<number>();
    invoiceTypeId.push(workPackageTypes.items.find(t => t.name === WorkPackageTypeMap.Invoice).id);
    const filters = new Array<any>();
    filters.push({
      'status_id': {
        'operator': 'o',
        'values': null
      }
    });
    filters.push({
      'type_id': {
        'operator': '=',
        'values': invoiceTypeId
      }
    });
    const filter: DtoBaseFilter = {
      offset: 1,
      pageSize: 50,
      filters: JSON.stringify(filters)
    };

    let response: DtoDataResponse<DtoInvoiceList>;
    try {
      const result = await this.getInvoices(filter);
      response = {
        status: DataStatus.Ok,
        data: result
      }
    } catch (error) {
      response = this.processServiceError(error)
    }
    return response;
  }

  //#endregion

  //#region POST Callback ------------------------------------------------------
  private createNewInvoice(request: RoutedRequest<DtoInvoice>): Promise<DtoInvoice> {
    throw new Error;
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private async getInvoices(filter: DtoBaseFilter): Promise<DtoInvoiceList> {
    const collection = await this.getCollectionModelByUnfilteredUri(true, this.entityRoot, WorkPackageCollectionModel, true, filter);
    await this.preFetchLinks(collection.elements, (m: WorkPackageEntityModel) => m.project);
    return await this.invoiceCollectionAdapter.resourceToDto(this.invoiceEntityAdapter, collection);
  }
  //#endregion
}