import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { IpcService, ProjectService } from '@core';

@Component({
  selector: 'app-shell-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // <editor-fold desc='@Input'>
  @Output() public sideNavToggle: EventEmitter<any>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public title: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private projectService: ProjectService,
    private ipcService: IpcService) {
    this.title= 'Openproject';
    this.sideNavToggle = new EventEmitter();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public devToolsClick(): void {
    this.ipcService.openDevTools();
  }

  public menuButtonClick(): void {
    this.sideNavToggle.emit();
  }

  public refreshClick(): void {
    this.projectService.refresh();
  }
  // </editor-fold>
}
