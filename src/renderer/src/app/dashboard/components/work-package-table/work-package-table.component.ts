import { Component, Input, OnInit } from '@angular/core';
import { WorkPackage } from './work-package';

@Component({
  selector: 'work-package-table',
  templateUrl: './work-package-table.component.html',
  styleUrls: ['./work-package-table.component.scss']
})
export class WorkPackageTableComponent implements OnInit {

  @Input() public workPackages: Array<WorkPackage>;

  // <editor-fold desc='Public properties'>
  public displayedColumns: string[];
  // </editor-fold>

  constructor() {
    this.displayedColumns = [
      'dueDate',
      'type',
      'project',
      // 'parent',
      'subject'
    ];
    this.workPackages = new Array<WorkPackage>();
  }

  ngOnInit(): void {
  }

}
