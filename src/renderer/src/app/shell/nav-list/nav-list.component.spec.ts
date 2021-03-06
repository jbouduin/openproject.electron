import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavListComponent } from './nav-list.component';

describe('NavlistComponent', () => {
  let component: NavListComponent;
  let fixture: ComponentFixture<NavlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
