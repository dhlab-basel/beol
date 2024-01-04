import { ReversePipe } from './reverse.pipe';
import { SortingService } from '../../services/sorting.service';
import { TestBed } from '@angular/core/testing';

describe('ReversePipe', () => {

  let pipe: ReversePipe;
  let service: SortingService;
  let data: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            SortingService
        ]
    });
    service = TestBed.inject(SortingService);
    pipe = new ReversePipe(service);
    data = ['Bernouilli', 'Euler', 'Goldbach', 'Hermann'];
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should slice and reverse data', () => {
    expect(pipe.transform(data)).toEqual(['Hermann', 'Goldbach', 'Euler', 'Bernouilli']);
  });
});
