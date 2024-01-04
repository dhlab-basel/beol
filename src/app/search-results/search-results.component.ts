import { Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
    Constants,
    CountQueryResponse,
    KnoraApiConnection,
    ReadResource,
    ReadResourceSequence
} from '@dasch-swiss/dsp-js';
import {
    AdvancedSearchParams,
    AdvancedSearchParamsService,
} from '../dsp-ui-lib/search';
import {
    AppInitService,
    DspApiConnectionToken
} from '../dsp-ui-lib/core';
import { ValueService } from '../dsp-ui-lib/viewer';
import { Subscription } from 'rxjs';
import { BeolService } from '../services/beol.service';
import * as BeolConstants from '../beol-constants';

@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {

    isLoading = true;

    dspConstants = Constants;

    result: ReadResource[] = []; // the results of a search query
    numberOfAllResults: number; // total number of results (count query)
    numberOfExternalResults = 0; // total number of results of text search on 3rd party repos
    rerender = false;

    offset = 0;
    maxOffset = 0;
    gravsearchGenerator: AdvancedSearchParams;

    step: number = undefined;
    panelOpenState = false;

    searchQuery: string;
    searchMode: string;

    navigationSubscription: Subscription;

    beolIri = BeolConstants.BEOL_PROJECT_IRI;
    leibnizApiBasePath = BeolConstants.LEIBNIZ_SOLR_API_BASE_PATH;
    newtonBasePath = BeolConstants.NEWTON_PROJECT_IRI;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _appInitService: AppInitService,
        private _route: ActivatedRoute,
        private _searchParamsService: AdvancedSearchParamsService,
        private _router: Router,
        public location: Location,
        private _beol: BeolService,
        public _valueTypeService: ValueService) {
    }

    ngOnInit() {
        this.navigationSubscription = this._route.paramMap.subscribe((params: Params) => {
            this.searchMode = params.get('mode');
            // init offset to 0
            this.offset = 0;
            this.result = [];
            this.resetStep();

            if (this.searchMode === 'fulltext') {
                // filter by project
                this.searchQuery = params.get('q');
            } else if (this.searchMode === 'gravsearch') {
                this.gravsearchGenerator = this._searchParamsService.getSearchParams();
                this.generateGravsearchQuery();
            }

            this.rerender = true;
            this.getResult();
        });

    }

    ngOnDestroy() {
        if (this.navigationSubscription !== undefined) {
            this.navigationSubscription.unsubscribe();
        }
    }

    /**
     * Generates the Gravsearch query for the current offset.
     */
    private generateGravsearchQuery() {

        const gravsearch: string | boolean = this.gravsearchGenerator.generateGravsearch(this.offset);
        if (gravsearch === false) {
            // no valid search params (application has been reloaded)
            // go to root
            this._router.navigate([''], { relativeTo: this._route });
            return;
        } else {
            this.searchQuery = <string>gravsearch;
        }
    }
    filterExpression(results: string[]): string {
        let filter = '';

        for (let it = 0; it < results.length; it++) {
            filter += '?letterNumber = "' + results[it] + '"';
            if (it !== results.length - 1) {
                filter += ' || '; // or operation should be in double quote otherwise it is skipped
            }
        }
        return filter;
    }
    /**
     * Given the letterID of a letter from The Newton Project, searches for that letter.
     *
     * @param letterID the letterID to search for.
     * @returns the Gravsearch query.
     */
    queryExpressionWithLetterID(filter: string, ontology: string, property: string): string {

        const letterByNumberTemplate = `
            PREFIX ${ontology}: <${this._appInitService.config['ontologyIRI']}/ontology/0801/${ontology}/simple/v2#>
            PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>

            CONSTRUCT {
                ?letter knora-api:isMainResource true .

            } WHERE {

                ?letter a knora-api:Resource .
                ?letter a ${ontology}:letter .
                ?letter ${ontology}:${property} ?letterNumber.
                ${ontology}:${property} knora-api:objectType <http://www.w3.org/2001/XMLSchema#string> .
                ?letterNumber a <http://www.w3.org/2001/XMLSchema#string> .
                FILTER(${filter}^^<http://www.w3.org/2001/XMLSchema#string>)
        }

        OFFSET 0
        `;
        return letterByNumberTemplate;

    }

    /**
     * Extended search for letters by ID
     */
    extendedSearchForExternalLetters(query: string) {
        this._dspApiConnection.v2.search.doExtendedSearch(query).subscribe(
            (resourceSeq: ReadResourceSequence) => {
                this.processSearchResults(resourceSeq);
                this.numberOfExternalResults += resourceSeq.resources.length;
            }
        );
    }
    /**
     * make search expression to be sent to search route of Briefportal Leibniz
     */
    makeLeibnizSearchExpressions(searchTerm: string, expressions: string[]) {
        for (let it = 0; it < expressions.length; it++) {
            searchTerm += '*' + this.searchQuery + '*+OR+' + expressions[it] + '%3A';
        }

        return searchTerm + '*' + this.searchQuery + '*';
    }
    /**
     * Get the search result leibniz letters by ID
     */
    getLeibnizLetters(retrunedSearchResults: HTMLObjectElement[]) {
        const results: string[] = [];
        for (let it = 0; it < retrunedSearchResults.length; it++) {
            results.push(retrunedSearchResults[it].id);
        }
        if (results.length) {
            const filter = this.filterExpression(results);
            const query = this.queryExpressionWithLetterID(filter, 'leibniz', 'letterID');
            this.extendedSearchForExternalLetters(query);
        }
    }
    /**
     * Get text search results from Briefportal Leibniz
     */
    getResultsLeibniz() {
        // cache the leibniz ontology before starting the text search to prevent unnecessary loading of ontology during the process
        /*this._cacheService.getEntityDefinitionsForOntologies(
            [this._appInitService.getSettings().ontologyIRI + '/ontology/0801/leibniz/v2']).subscribe(
                (info2: OntologyInformation) => {*/
                    const searchRoute = this.leibnizApiBasePath + 'select?q=type%3Abrief+AND+(+volltext%3A';
                    const experssions = ['id', 'reihe', 'band', 'brief_nummer', 'all_suggest', 'ort_anzeige',
                        'datum_anzeige', 'datum_gregorianisch', 'datum_julianisch', 'kontext'];
                    const format = ')&rows=9999&wt=json';
                    const searchExpression = this.makeLeibnizSearchExpressions(searchRoute, experssions) + format;
                    fetch(searchExpression)
                        .then(response => response.json())
                        .then(contents => {
                            this.getLeibnizLetters(contents.response.docs);
                        })
                        .catch(() => console.log('Can’t access ' + searchExpression + ' response. Blocked by browser?'));
                // });
    }
    getNewtonLetters(content: string) {
        /*todo just parses the first page of the results due to hard coded pagination*/
        const results: string[] = [];
        const html = new DOMParser().parseFromString(content, 'text/html');
        const returnedSearchResults = html.getElementsByTagName('tr');
        for (let it = 0; it < returnedSearchResults.length; it++) {

            // every row of the result table has two cells 0: key 1:content
            const links = returnedSearchResults[it].children[1].getElementsByClassName('link_wrapper');
            if (links.length) {
                const hrefSegmented = links[0].children[0].getAttribute('href').split('/');
                const letterID = hrefSegmented[hrefSegmented.length - 1];
                results.push(letterID);
            }
        }
        if (results.length) {
            const filter = this.filterExpression(results);
            const query = this.queryExpressionWithLetterID(filter, 'newton', 'newtonProjectID');
            this.extendedSearchForExternalLetters(query);
        }
    }
    /**
     * Get text search results from the Newton Project
     */
    getResultsNewton() {
        // cache the newton ontology before starting the text search to prevent unnecessary loading of ontology during the process
        /*this._cacheService.getEntityDefinitionsForOntologies(
            [this._appInitService.getSettings().ontologyIRI + '/ontology/0801/newton/v2']).subscribe(
                (info2: OntologyInformation) => {*/
                    const searchRoute = this.newtonBasePath + '/search/results?n=25&cat=';
                    const cors_proxyurl = 'https://cors-container.herokuapp.com/';
                    const mathCategory = 'Mathematics&ce=0&keyword=';
                    const opticsCategory = 'Optics&ce=0&keyword=';
                    const queryTail = '&sort=relevance';
                    const searchExpressions = [searchRoute + mathCategory + this.searchQuery + queryTail,
                    searchRoute + opticsCategory + this.searchQuery + queryTail];
                    for (let it = 0; it < searchExpressions.length; it++) {
                        fetch(cors_proxyurl + searchExpressions[it])
                            .then(response => response.text())
                            .then(contents => {
                                this.getNewtonLetters(contents);
                            })
                            .catch(() => console.log('Can’t access ' + searchExpressions[it] + ' response. Blocked by browser?'));
                    }
                // });
    }

    /**
     * Get search result from Knora - 2 cases: simple search and extended search
     */
    getResult() {
        this.isLoading = true;

        // FULLTEXT SEARCH
        if (this.searchMode === 'fulltext') {
            // cache the beol ontology and its dependencies before starting the text search to
            // prevent unnecessary loading of ontology during the process
            /*this._cacheService.getEntityDefinitionsForOntologies(
                [this._appInitService.getSettings().ontologyIRI + '/ontology/0801/beol/v2']).subscribe(
                    (info2: OntologyInformation) => {*/

                        const searchParams = { limitToProject: this.beolIri };
                        // perform count query
                        if (this.offset === 0) {

                            this._dspApiConnection.v2.search.doFulltextSearchCountQuery(this.searchQuery, this.offset, searchParams)
                                .subscribe(
                                    this.showNumberOfAllResults,
                                    (error: any) => {
                                        console.error(error);
                                    }
                                );
                            // here get the search results from the other projects
                            this.getResultsLeibniz();
                            this.getResultsNewton();

                        }

                        // perform full text search

                        this._dspApiConnection.v2.search.doFulltextSearch(this.searchQuery, this.offset, searchParams)
                            .subscribe(
                                this.processSearchResults, // function pointer
                                (error: any) => {
                                    console.error(error);
                                },
                            );
                    // });

            // EXTENDED SEARCH
        } else if (this.searchMode === 'gravsearch' && this.searchQuery) {
            // perform count query
            if (this.offset === 0) {
                this._dspApiConnection.v2.search.doExtendedSearchCountQuery(this.searchQuery)
                    .subscribe(
                        this.showNumberOfAllResults,
                        (error: any) => {
                            console.error(error);
                        }
                    );
            }

            this._dspApiConnection.v2.search.doExtendedSearch(this.searchQuery)
                .subscribe(
                    this.processSearchResults, // function pointer
                    (error: any) => {
                        console.error(error);
                    });

        }
    }

    /**
     * Shows total number of results returned by a count query.
     *
     * @param countQueryResult the response to a count query.
     */
    private showNumberOfAllResults = (countQueryResult: CountQueryResponse) => {
        this.numberOfAllResults = countQueryResult.numberOfResults;

        if (this.numberOfAllResults > 0) {
            // offset is 0-based
            // if numberOfAllResults equals the pagingLimit, the max. offset is 0
            this.maxOffset = Math.floor((this.numberOfAllResults - 1) / BeolConstants.PAGING_LIMIT);
        } else {
            this.maxOffset = 0;
        }
    }

    /**
     *
     * Converts search results from JSON-LD to a [[ReadResourcesSequence]] and requests information about ontology entities.
     * This function is passed to `subscribe` as a pointer (instead of redundantly defining the same lambda function).
     *
     * Attention: this function definition makes uses of the arrow notation
     * because the context of `this` has to be inherited from the context.
     * See: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#No_binding_of_this>
     *
     * @param {ApiServiceResult} searchResult the answer to a search request.
     */
    private processSearchResults = (searchResult: ReadResourceSequence) => {
        // assign ontology information to a variable so it can be used in the component's template
        /* if (this.ontologyInfo === undefined) {
            // init ontology information
            this.ontologyInfo = searchResult.resources[0].entityInfo;
        } else {
            // update ontology information
            this.ontologyInfo.updateOntologyInformation(searchResult.resources[0].entityInfo);
        }*/
        // append results to search results
        this.result = this.result.concat(searchResult.resources);

        this.isLoading = false;
        this.rerender = false;
    }

    /* the following methods will be moved to @knora/viewer views */

    setStep(index: number) {
        this.step = index;
    }

    resetStep() {
        this.step = undefined;
    }

    nextStep() {
        this.step++;
    }

    prevStep() {
        this.step--;
    }

    /**
     * Navigate to the viewer that displays the resource's content
     * @param resourceIri the Iri of the resource.
     * @param resourceType the type (class) of the resource.
     */
    goToViewer(resourceIri: string, resourceType: string, res: ReadResource) {
        this._beol.routeByResourceType(resourceType, resourceIri, res);
    }

    /**
     * Loads the next page of results.
     * The results will be appended to the existing ones.
     *
     */
    loadMore() {

        // update the page offset when the end of scroll is reached to get the next page of search results
        if (this.offset < this.maxOffset) {
            this.offset++;
        } else {
            return;
        }

        if (this.searchMode === 'gravsearch') {
            this.generateGravsearchQuery();
        }

        this.getResult();

    }
}
