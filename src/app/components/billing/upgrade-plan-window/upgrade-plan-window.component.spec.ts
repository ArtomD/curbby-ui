import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradePlanWindowComponent } from './upgrade-plan-window.component';

describe('UpgradePlanWindowComponent', () => {
  let component: UpgradePlanWindowComponent;
  let fixture: ComponentFixture<UpgradePlanWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradePlanWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradePlanWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
