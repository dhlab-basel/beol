import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MaterialModule } from '../../material-module';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { BiblioItemsComponent } from './biblio-items.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { ResourcesEndpointV2, SearchEndpointV2, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';

describe('BiblioItemsComponent', () => {
    let component: BiblioItemsComponent;
    let fixture: ComponentFixture<BiblioItemsComponent>;

    const id = 'http://rdfh.ch/0802/eJ-JOOfoS4yvACkcTgZDfw';

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

        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                RouterTestingModule
            ],
            declarations: [
                BiblioItemsComponent,
                ReadTextValueAsHtmlComponent,
                MathJaxDirective,
                ReadTextValueComponent
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
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {

        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(new ReadResource()));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(BiblioItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
