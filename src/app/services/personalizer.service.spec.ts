import { TestBed } from '@angular/core/testing';

import { PersonalizerService } from './personalizer.service';

describe('PersonalizerService', () => {
  let service: PersonalizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
