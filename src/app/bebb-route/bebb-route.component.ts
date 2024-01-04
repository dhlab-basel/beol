import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { KnoraApiConnection, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '../dsp-ui-lib/core';
import { BeolService } from '../services/beol.service';

@Component({
    selector: 'app-leoo-route',
    templateUrl: './bebb-route.component.html',
    styleUrls: ['./leoo-route.component.scss']
})
export class BebbRouteComponent implements OnInit {

    bebbLettertitle: string;
    notFound: boolean;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _route: ActivatedRoute,
        private _beolService: BeolService,
        private _appInitService: AppInitService) {
    }

    ngOnInit() {

        this._route.paramMap.subscribe((params: ParamMap) => {

            this.bebbLettertitle = params.get('lt');

            if (this.bebbLettertitle !== null) {

                // create a query that gets the Iri of the bebb letter
                const query = this._beolService.searchForLetterFromBEBB(this.bebbLettertitle);

                this._dspApiConnection.v2.search.doExtendedSearch(query).subscribe(
                    (resourceSeq: ReadResourceSequence) => {

                        if (resourceSeq.resources.length === 1) {
                            const letter = resourceSeq.resources[0];
                            const letterIri: string = letter.id;

                            // given the Iri of the letter, display the whole resource
                            this._beolService.routeByResourceType(this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#letter', letterIri, letter);
                        } else {
                            // letter not found
                            this.notFound = true;
                            console.log(`letter with title ${this.bebbLettertitle} not found`);
                        }

                    }, (err) => {
                        this.notFound = true;
                        console.log('search failed ' + err);
                    }
                );
            }
        });
    }
}
