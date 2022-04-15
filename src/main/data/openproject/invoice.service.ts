

import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';
import { IRoutedDataService } from '@data/routed-data-service';
import { BaseDataService } from '@data/base-data-service';
import { inject, injectable } from 'inversify';
import { IDataRouterService, RouteCallback } from '@data/data-router.service';
import { DataStatus, DtoBaseFilter, DtoDataResponse, DtoInvoice, DtoInvoiceList, DtoWorkPackageType, DtoWorkPackageTypeList, WorkPackageTypeMap } from '@common';
import { RoutedRequest } from '@data/routed-request';
import { IInvoiceCollectionAdapter, IInvoiceEntityAdapter } from '@adapters';
import { ILogService, IOpenprojectService } from '@core';
import { IWorkPackageTypeService } from './work-package-type.service';
import { WorkPackageCollectionModel, WorkPackageEntityModel } from '@core/hal-models';
import { CustomFieldMap } from '@core/hal-models/custom-field-map';

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
    router.delete('/invoices/:id', this.deleteInvoice.bind(this) as RouteCallback);
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

  //#region DELETE callback ---------------------------------------------------
  private async deleteInvoice(request: RoutedRequest<unknown>): Promise<DtoDataResponse<boolean>> {
    let response: DtoDataResponse<any>;
    try {
      const uri = `${this.entityRoot}/${request.params.id as number}`;
      await this.openprojectService.delete(uri);
      response = {
        status: DataStatus.Ok,
        data: true
      };
    }
    catch (err) {
      response = this.processServiceError(err);
    }
    return response;
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
  private async createNewInvoice(request: RoutedRequest<DtoInvoice>): Promise<DtoDataResponse<DtoInvoice>> {
    const data: Record<string, unknown> = {};
    let result: DtoDataResponse<DtoInvoice>;
    try {
      const invoiceHref = await this.workPackageTypeService
        .loadWorkPackageTypes()
        .then((workPackageTypes: DtoWorkPackageTypeList) => workPackageTypes.items.find((t: DtoWorkPackageType) => t.name === WorkPackageTypeMap.Invoice).href);
      data['subject'] = request.data.subject;
      data['description'] = request.data.description;
      data['startDate'] = request.data.invoiceDate.toISOString().substring(0, 10);
      // data['dueDate'] = request.data.paymentDate?.toDateString();
      data['project'] = { href: request.data.project.href };
      data[CustomFieldMap.nettoAmount] = request.data.netAmount;
      data['accountable'] = { href: this.openprojectService.currentUser.uri.href };
      data['assignee'] = { href: this.openprojectService.currentUser.uri.href };
      data[CustomFieldMap.billable] = false;
      // TODO create a statusvaluemap
      data['status'] = { href: '/api/v3/statuses/1' };
      data['type'] = { href: invoiceHref };
      const response = await this.openprojectService.post(this.entityRoot, data, WorkPackageEntityModel);
      const created = await this.invoiceEntityAdapter.resourceToDto(response)
      result = {
        status: DataStatus.Created,
        data: created
      };

    } catch (error) {
      result = this.processServiceError(error);
    }
    return result;
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