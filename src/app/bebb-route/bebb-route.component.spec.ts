import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BebbRouteComponent } from './bebb-route.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BeolService } from '../services/beol.service';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('BebbRouteComponent', () => {
    let component: BebbRouteComponent;
    let fixture: ComponentFixture<BebbRouteComponent>;
    const lt = '1706-03-17_Hermann_Jacob-Scheuchzer_Johannes';

    beforeEach(waitForAsync(() => {

        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['searchForLetterFromBEBB', 'routeByResourceType']); // see https://angular.io/guide/testing#angular-testbed

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
            declarations: [BebbRouteComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of({
                            get: () => {
                                return lt;
                            }
                        })
                    }
                },
                { provide: BeolService, useValue: beolServiceSpy },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy },
                { provide: AppInitService, useValue: appInitServiceMock }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {

        const res = new ReadResource();
        res.type = 'http://0.0.0.0:3333/ontology/0801/beol/v2#letter';
        res.id = 'letterIri';

        const mockRes = of(
            new ReadResourceSequence(
                [res],
                false
            )
        );

        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(mockRes);

        const beolServiceSpy = TestBed.inject(BeolService);

        (beolServiceSpy as jasmine.SpyObj<BeolService>).searchForLetterFromBEBB.and.returnValue('gravsearchQuery');
        (beolServiceSpy as jasmine.SpyObj<BeolService>).routeByResourceType.and.stub();

        fixture = TestBed.createComponent(BebbRouteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should perform a query to get the letter\'s actual Iri', () => {

        const beolServiceSpy = TestBed.inject(BeolService);

        expect(beolServiceSpy.searchForLetterFromBEBB).toHaveBeenCalledWith(lt);

        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        expect(dspServiceSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith('gravsearchQuery');
        expect(beolServiceSpy.routeByResourceType).toHaveBeenCalledTimes(1);

    });
});
