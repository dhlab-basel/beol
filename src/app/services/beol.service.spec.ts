import { TestBed } from '@angular/core/testing';

import { BeolService } from './beol.service';
import { DspApiConnectionToken } from '../dsp-ui-lib/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('BeolService', () => {
    let service: BeolService;

    const dspConnSpyObj = {
        v2: {
            res: jasmine.createSpyObj('res', ['getResource']),
            search: jasmine.createSpyObj('search', ['doExtendedSearch'])
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpyObj
                }
            ]
        });
        service = TestBed.inject(BeolService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});
