import { TestBed } from '@angular/core/testing';

import { BackendServerService } from './backend-server.service';

describe('BackendServerService', () => {
  let service: BackendServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
