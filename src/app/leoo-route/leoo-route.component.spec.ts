import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LeooRouteComponent } from './leoo-route.component';
import { of } from 'rxjs';
import { BeolService } from '../services/beol.service';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('LeooRouteComponent', () => {
    let component: LeooRouteComponent;
    let fixture: ComponentFixture<LeooRouteComponent>;
    const rn = '721';

    beforeEach(waitForAsync(() => {

        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['searchForLetterFromLEOO', 'routeByResourceType']); // see https://angular.io/guide/testing#angular-testbed

        const dspConnectionSpy = {
            v2: {
                search: jasmine.createSpyObj('search', ['doExtendedSearch'])
            }
        };

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            declarations: [LeooRouteComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of({
                            get: () => {
                                return rn;
                            }
                        })
                    }
                },
                { provide: BeolService, useValue: beolServiceSpy },
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {

        const beolServiceSpy = TestBed.inject(BeolService);

        (beolServiceSpy as jasmine.SpyObj<BeolService>).searchForLetterFromLEOO.and.returnValue('gravsearchQuery');

        const res = new ReadResource();
        res.id = 'letterIri';
        res.type = 'http://0.0.0.0:3333/ontology/0801/beol/v2#letter';
        res.label = 'label';

        const mockRes = of(
            new ReadResourceSequence(
                [res],
            )
        );

        const dspConnectionSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnectionSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(mockRes);

        fixture = TestBed.createComponent(LeooRouteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should perform a query to get the letter\'s actual Iri', () => {

        const beolServiceSpy = TestBed.inject(BeolService);

        expect(beolServiceSpy.searchForLetterFromLEOO).toHaveBeenCalledWith(rn);

        const dspConnectionSpy = TestBed.inject(DspApiConnectionToken);

        expect(dspConnectionSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith('gravsearchQuery');

        expect(beolServiceSpy.routeByResourceType).toHaveBeenCalledTimes(1);

    });
});
