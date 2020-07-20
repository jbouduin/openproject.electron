import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPackageTableComponent } from './work-package-table.component';

describe('WorkPackageTableComponent', () => {
  let component: WorkPackageTableComponent;
  let fixture: ComponentFixture<WorkPackageTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkPackageTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPackageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
