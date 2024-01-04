import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../material-module';
import { IntroductionComponent } from './introduction.component';
import { ReadTextValueAsHtmlComponent } from '../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../properties/read-list-value/read-list-value.component';
import { of } from 'rxjs';
import { BeolService } from '../services/beol.service';
import { ActivatedRoute } from '@angular/router';
import { MathJaxDirective } from '../directives/mathjax.directive';
import { DspApiConnectionToken, AppInitService } from '../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('IntroductionComponent', () => {
    let component: IntroductionComponent;
    let fixture: ComponentFixture<IntroductionComponent>;
    const project = 'leooIV';
    const id = 'goldbach_introduction_1';

    beforeEach(waitForAsync(() => {

        const dspConnectionSpy = {
            v2: {
                res: jasmine.createSpyObj('res', ['getResource']),
                search: jasmine.createSpyObj('search', ['doExtendedSearch'])
            }
        };
        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['searchForIntroductionById']);

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                RouterTestingModule
            ],
            declarations: [
                IntroductionComponent,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
                MathJaxDirective
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of({
                            get: (param) => {
                                if (param === 'project') {
                                    return project;
                                } else {
                                    return id;
                                }
                            }
                        }
                        )
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

        const dspConnectionSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnectionSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.callFake((gravsearch: string) => {

            const res = new ReadResource();
            res.id = 'http://rdfh.ch/0801/jTAU22HmTJWplGJgO6uVIw';

            const seq = new ReadResourceSequence([res]);

            return of(
                seq
            );
        });

        (dspConnectionSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.callFake((resIri) => {

            const res = new ReadResource();

            return of(
                res
            );

        });

        const beolServiceSpy = TestBed.inject(BeolService);

        (beolServiceSpy as jasmine.SpyObj<BeolService>).searchForIntroductionById.and.callFake((introid: string) => {

            const introTemplate = `
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX beol: <http://0.0.0.0:3333/ontology/0801/beol/simple/v2#>

    CONSTRUCT {

        ?introSection knora-api:isMainResource true .

    } WHERE {

        ?introSection a beol:section .
      	?introSection a knora-api:Resource .
        ?introSection beol:beolIDs ?sectionId .

        beol:beolIDs knora-api:objectType xsd:string .
        ?sectionId a xsd:string .

        FILTER(?sectionId = "${introid}")

    }

    OFFSET 0
        `;

            return introTemplate;
        });


        fixture = TestBed.createComponent(IntroductionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {

        const dspConnectionSpy = TestBed.inject(DspApiConnectionToken);

        const beolServiceSpy = TestBed.inject(BeolService);

        expect(component).toBeTruthy();

        expect(beolServiceSpy.searchForIntroductionById).toHaveBeenCalledTimes(1);

        expect(beolServiceSpy.searchForIntroductionById).toHaveBeenCalledWith('goldbach_introduction_1');

        expect(dspConnectionSpy.v2.search.doExtendedSearch).toHaveBeenCalledTimes(1);

        const introTemplate = `
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX beol: <http://0.0.0.0:3333/ontology/0801/beol/simple/v2#>

    CONSTRUCT {

        ?introSection knora-api:isMainResource true .

    } WHERE {

        ?introSection a beol:section .
      	?introSection a knora-api:Resource .
        ?introSection beol:beolIDs ?sectionId .

        beol:beolIDs knora-api:objectType xsd:string .
        ?sectionId a xsd:string .

        FILTER(?sectionId = "goldbach_introduction_1")

    }

    OFFSET 0
        `;

        expect(dspConnectionSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith(introTemplate);

        expect(dspConnectionSpy.v2.res.getResource).toHaveBeenCalledTimes(1);

        expect(dspConnectionSpy.v2.res.getResource).toHaveBeenCalledWith('http://rdfh.ch/0801/jTAU22HmTJWplGJgO6uVIw');

    });

});
