import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { KnoraApiConnection, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';
import { BeolService } from '../services/beol.service';
import { ReadResource } from '@dasch-swiss/dsp-js/src/models/v2/resources/read/read-resource';

@Component({
    selector: 'app-leoo-route',
    templateUrl: './leoo-route.component.html',
    styleUrls: ['./leoo-route.component.scss']
})
export class LeooRouteComponent implements OnInit {

    repertoriumNumber: string;
    notFound: boolean;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _route: ActivatedRoute,
        private _beolService: BeolService,
        private _appInitService: AppInitService) {
    }

    ngOnInit() {
        this._route.paramMap.subscribe((params: ParamMap) => {

            this.repertoriumNumber = params.get('rn');

            if (this.repertoriumNumber !== null) {

                // create a query that gets the Iri of the LEOO letter
                const query = this._beolService.searchForLetterFromLEOO(this.repertoriumNumber);

                this._dspApiConnection.v2.search.doExtendedSearch(query).subscribe(
                    (resourceSeq: ReadResourceSequence) => {

                        if (resourceSeq.resources.length === 1) {
                            const letterRes: ReadResource = resourceSeq.resources[0];
                            const letterIri: string = letterRes.id;

                            // given the Iri of the letter, display the whole resource
                            this._beolService.routeByResourceType(this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#letter', letterIri, letterRes);
                        } else {
                            // letter not found
                            console.log(`letter with repertorium number ${this.repertoriumNumber} not found`);
                            this.notFound = true;
                        }

                    }, (err) => {
                        console.log('search failed ' + err);
                        this.notFound = true;
                    }
                );
            }
        });
    }
}
