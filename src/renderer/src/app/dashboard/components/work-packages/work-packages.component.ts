import { Component, OnInit } from '@angular/core';
import { WorkPackageService } from '@core';
import * as moment from 'moment';
import { WorkPackage } from '../work-package-table/work-package';
import { DtoBaseFilter, DtoWorkPackageType } from '@ipc';

@Component({
  selector: 'work-package-list',
  templateUrl: './work-packages.component.html',
  styleUrls: ['./work-packages.component.scss']
})
export class WorkPackagesComponent implements OnInit {

  private typeFilter: Array<number>;
  private workPackageService: WorkPackageService;
  private workPackageTypes: Array<DtoWorkPackageType>;

  public overdueWorkPackages: Array<WorkPackage>;
  public dueTodayWorkPackages: Array<WorkPackage>;
  public dueNextSevenDays: Array<WorkPackage>;
  public dueNextThirtyDays: Array<WorkPackage>;

  public constructor(workPackageService: WorkPackageService) {
    this.workPackageService = workPackageService;
    this.workPackageTypes = new Array<DtoWorkPackageType>();
    this.overdueWorkPackages = new Array<WorkPackage>();
    this.dueTodayWorkPackages = new Array<WorkPackage>();
    this.dueNextSevenDays = new Array<WorkPackage>();
    this.dueNextThirtyDays = new Array<WorkPackage>();
  }

  ngOnInit(): void {
    this.loadWorkPackageTypes().then( () => this.loadWorkPackages());
  }

  private async loadWorkPackageTypes(): Promise<void> {
    this.workPackageTypes = await this.workPackageService.loadWorkPackageTypes();
    this.typeFilter = this.workPackageTypes
      .filter(t => [ 'User story', 'Bug', 'Blog post', 'Web page', 'Bewerbung' ].indexOf(t.name) >= 0)
      .map(t => t.id);
  }

  private async loadWorkPackages(): Promise<void> {
    const filters = new Array<any>();
    filters.push({
      'dueDate': {
        'operator': '<t+',
        'values': [ 30 ]
      }
    });
    filters.push({
      'status_id': {
        'operator': 'o',
        'values': null
      }
    });
    filters.push({
      'type_id': {
        'operator': '=',
        'values': this.typeFilter
      }
    });

    const filter: DtoBaseFilter = {
      offset: 0,
      pageSize: 500,
      filters: JSON.stringify(filters)
    };

    const workPackagesdto = await this.workPackageService.loadWorkPackages(filter);

    const workPackages = workPackagesdto.items.map(item => new WorkPackage(item));
    this.overdueWorkPackages = this.getOverdueWorkPackages(workPackages);
    this.dueTodayWorkPackages = this.getDueTodayWorkPackages(workPackages);
    this.dueNextSevenDays = this.getDueNextSevenDays(workPackages);
    this.dueNextThirtyDays = this.getDueNextThirtyDays(workPackages);
  }

  private getOverdueWorkPackages(workPackages: Array<WorkPackage>): Array<WorkPackage> {
    const today = moment();
    return workPackages.filter(wp => wp.dueDate.isBefore(today, 'day'));
  }

  private getDueTodayWorkPackages(workPackages: Array<WorkPackage>): Array<WorkPackage> {
    const today = moment();
    return workPackages.filter(wp => wp.dueDate.isSame(today, 'day'));
  }

  private getDueNextSevenDays(workPackages: Array<WorkPackage>): Array<WorkPackage> {
    const today = moment();
    const inSevenDays = moment().add(7, 'day');
    return workPackages
      .filter(wp => wp.dueDate.isAfter(today, 'day') && wp.dueDate.isSameOrBefore(inSevenDays, 'day'));
  }

  private getDueNextThirtyDays(workPackages: Array<WorkPackage>): Array<WorkPackage> {
    const inSevenDays = moment().add(7, 'day');
    const inThirtyDays = moment().add(30, 'day');
    return workPackages
      .filter(wp => wp.dueDate.isAfter(inSevenDays, 'day') && wp.dueDate.isSameOrBefore(inThirtyDays, 'day'));
  }
}
