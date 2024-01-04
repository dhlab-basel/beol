import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { SearchResultsComponent } from './search-results.component';
import { MathJaxDirective } from '../directives/mathjax.directive';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ReadListValueComponent } from '../properties/read-list-value/read-list-value.component';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';
import { AdvancedSearchParams, AdvancedSearchParamsService } from '../dsp-ui-lib/search';
import { CountQueryResponse, ReadResourceSequence, SearchEndpointV2 } from '@dasch-swiss/dsp-js';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchResultsComponent', () => {
    let component: SearchResultsComponent;
    let fixture: ComponentFixture<SearchResultsComponent>;

    const mode = 'gravsearch';
    const q = 'test';

    beforeEach(waitForAsync(() => {
        const dspConnectionSpy = {
            v2: {
                search: jasmine.createSpyObj('search', ['doExtendedSearch', 'doExtendedSearchCountQuery'])
            }
        };

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        const mockSearchParamService = new MockSearchParamsService();

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatIconModule,
                MatExpansionModule,
                BrowserAnimationsModule
            ],
            declarations: [
                SearchResultsComponent,
                MathJaxDirective,
                ReadListValueComponent
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of({
                            get: (param: string) => {
                                if (param === 'q') {
                                    return q;
                                } else {
                                    return mode;
                                }
                            }
                        })
                    }
                },
                { provide: AdvancedSearchParamsService, useValue: mockSearchParamService },
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {

        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearchCountQuery.and.callFake((gravsearch: string) => {

                const countQueryRes = new CountQueryResponse();
                countQueryRes.numberOfResults = 0;

                return of(
                    countQueryRes
                );
            }
        );

        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.callFake((gravsearch: string) => {

            const lettersSeq = new ReadResourceSequence([]);

            return of(
                lettersSeq
            );
        });

        fixture = TestBed.createComponent(SearchResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should perform a count query', () => {
        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        expect(dspServiceSpy.v2.search.doExtendedSearchCountQuery).toHaveBeenCalledTimes(1);

        expect(dspServiceSpy.v2.search.doExtendedSearchCountQuery).toHaveBeenCalledWith('testquery0');

        expect(component.numberOfAllResults).toEqual(0);

    });

    it('should perform a gravsearch query', () => {
        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        expect(dspServiceSpy.v2.search.doExtendedSearch).toHaveBeenCalledTimes(1);

        expect(dspServiceSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith('testquery0');

        expect(component.result.length).toEqual(0);

    });


});


class MockSearchParamsService {

    private _currentSearchParams: BehaviorSubject<any>;

    constructor() {
        this._currentSearchParams = new BehaviorSubject<AdvancedSearchParams>(new AdvancedSearchParams((offset: number) => 'testquery' + offset));
    }

    changeSearchParamsMsg(searchParams: AdvancedSearchParams): void {
        this._currentSearchParams.next(searchParams);
    }

    getSearchParams(): AdvancedSearchParams {
        return this._currentSearchParams.getValue();
    }



}
