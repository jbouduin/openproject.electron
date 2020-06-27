import { Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DtoProject } from '@ipc';
import { ProjectTreeItem } from './project-tree-item';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'project-tree-select',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss']
})
export class ProjectTreeComponent implements OnChanges, OnInit {

  // <editor-fold desc='@Input'>
  @Input() public multipleSelect: boolean;
  @Input() public projects: Array<DtoProject>;
  @Input() public readOnly: boolean;
  @Input() public selection: Array<number>;
  @Output() public selectionChanged: EventEmitter<Array<number>>;
  // </editor-fold>

  // <editor-fold desc='public getter/setter methods'>
  public get selectTrigger(): string {
    if (this.formControl.value) {
      if (Array.isArray(this.formControl.value)) {
        switch (this.formControl.value.length) {
          case 0: { // nothing will be displayed...
            return '';
          }
          case 1: {
            return this.formControl.value[0].name;
          }
          case 2: {
            return `${this.formControl.value[0].name} (+1 other)`;
          }
          default: {
            return `${this.formControl.value[0].name} (+${this.formControl.value.length + 1} others)'`;
          }
        }
      } else {
        return this.formControl.value.name;
      }
    }
    else {
      // nothing will be displayed...
      return '';
    }
  }
  // </editor-fold>

  // <editor-fold desc='Public readonly properties'>
  // this projectTree is a flat list, as mat-select only knows two levels
  // https://github.com/angular/components/issues/8703
  public readonly projectTree: Array<ProjectTreeItem>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formControl: FormControl;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.projectTree = new Array<ProjectTreeItem>();
    this.formControl = new FormControl();
    this.selection = new Array<number>();
    this.selectionChanged = new EventEmitter<Array<number>>();
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private setSelection(value: Array<number>) {
    const items = value.map(id => this.projectTree.find(project => project.id === id));
    if (this.multipleSelect) {
      this.formControl.patchValue(items);
    } else {
      this.formControl.patchValue(items[0]);
    }
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }

  public ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'projects': {
            this.buildProjectTree(changes[propName].currentValue);
            break;
          }
          case 'selection': {
            this.setSelection(changes[propName].currentValue);
            break;
          }
          case 'readOnly': {
            console.log('readOnly', changes[propName].currentValue)
            if (changes[propName].currentValue === true) {
              this.formControl.disable();
            } else {
              this.formControl.enable();
            }
          }
        }
      }
    }
  }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public itemPadding(item: ProjectTreeItem): Object {
    return {
      'padding': `0 0 0 ${36 + 20 * item.level}px`
    };
  }

  public selectionChange(event: MatSelectChange) {
    if (event.value) {
      if (Array.isArray(event.value)) {
        this.selectionChanged.emit(event.value.map( (selected: ProjectTreeItem) => selected.id));
      } else {
        this.selectionChanged.emit(new Array<number>(event.value.id));
      }
    } else {
      this.selectionChanged.emit(new Array<number>());
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private buildProjectTree(projects: Array<DtoProject>): void {
    this.projectTree.splice(0, this.projectTree.length);
    const rootProjects = projects.filter(project => project.parentId === undefined);
    rootProjects.forEach(project => {
      const rootProject = new ProjectTreeItem(project, 0);
      this.projectTree.push(rootProject);
      this.addChildProjects(rootProject, projects);
    });

  }

  private addChildProjects(parent: ProjectTreeItem, allProjects: Array<DtoProject>) {
    const children = allProjects.filter(project => project.parentId && project.parentId === parent.id);
    children.forEach(child => {
      const newTreeItem = new ProjectTreeItem(child, parent.level + 1);
      this.projectTree.push(newTreeItem);
      this.addChildProjects(newTreeItem, allProjects);
    });
  }
  // </editor-fold>
}
