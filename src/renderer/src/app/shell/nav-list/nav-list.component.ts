import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-shell-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.scss']
})
export class NavListComponent implements OnInit {

  // <editor-fold desc='@Output'>
  @Output() public sideNavClose: EventEmitter<any>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  constructor() {
    this.sideNavClose = new EventEmitter();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public routerLinkClick(): void {
    this.sideNavClose.emit();
  }
  // </editor-fold>
}
