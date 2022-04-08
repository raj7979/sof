import {TestBed} from '@angular/core/testing';

import {EmrAuthService} from './emr-auth.service';

describe('OktaAuthService', () => {
  let service: EmrAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmrAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
