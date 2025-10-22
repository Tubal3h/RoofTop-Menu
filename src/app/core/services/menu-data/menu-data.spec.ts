import { TestBed } from '@angular/core/testing';

import { MenuData } from './menu-data';

describe('MenuData', () => {
  let service: MenuData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
