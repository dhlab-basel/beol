import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MaterialModule } from '../material-module';
import { ResourceComponent } from './resource.component';
import { ReadTextValueAsHtmlComponent } from '../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../properties/read-list-value/read-list-value.component';
import { MathJaxDirective } from '../directives/mathjax.directive';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';
import { BeolService } from '../services/beol.service';

describe('ResourceComponent', () => {
    let component: ResourceComponent;
    let fixture: ComponentFixture<ResourceComponent>;

    const id = 'http://rdfh.ch/0801/qEy1S5u4Tsurt2wU58J6zw'; // letter nr. 001

    beforeEach(waitForAsync(() => {
        const dspConnectionSpy = {
            v2: {
                res: jasmine.createSpyObj('res', ['getResource']),
                search: jasmine.createSpyObj('search', ['doExtendedSearch'])
            }
        };

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['routeByResourceType']);

        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                RouterTestingModule,
                HttpClientModule,
                HttpClientTestingModule
            ],
            declarations: [
                ResourceComponent,
                MathJaxDirective,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of({
                            get: () => {
                                return id;
                            }
                        })
                    }
                },
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy },
                { provide: BeolService, useValue: beolServiceSpy }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(new ReadResource()));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        const beolServiceSpy = TestBed.inject(BeolService);

        (beolServiceSpy as jasmine.SpyObj<BeolService>).routeByResourceType.and.stub();

        fixture = TestBed.createComponent(ResourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        const beolServiceSpy = TestBed.inject(BeolService);

        expect(beolServiceSpy.routeByResourceType).toHaveBeenCalledTimes(1);

        expect(component).toBeTruthy();


    });
});
