import { Component, OnInit } from '@angular/core';
import { WorkPackageService } from '@core';
import * as moment from 'moment';
import { WorkPackage } from '../work-package-table/work-package';

@Component({
  selector: 'work-package-list',
  templateUrl: './work-packages.component.html',
  styleUrls: ['./work-packages.component.scss']
})
export class WorkPackagesComponent implements OnInit {

  private workPackageService: WorkPackageService;

  public overdueWorkPackages: Array<WorkPackage>
  public dueTodayWorkPackages: Array<WorkPackage>
  public dueNextSevenDays: Array<WorkPackage>
  public dueNextThirtyDays: Array<WorkPackage>

  public constructor(workPackageService: WorkPackageService) {
    this.workPackageService = workPackageService;
  }

  ngOnInit(): void {
    this.loadWorkPackages();
  }

  private async loadWorkPackages(): Promise<void> {
    // TODO await... this.workPackageService.loadWorkPackages();
    const workPackages = new Array<WorkPackage>();
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
