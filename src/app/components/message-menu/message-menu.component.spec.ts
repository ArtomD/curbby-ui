import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageMenuComponent } from './message-menu.component';

describe('MessageMenuComponent', () => {
  let component: MessageMenuComponent;
  let fixture: ComponentFixture<MessageMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
