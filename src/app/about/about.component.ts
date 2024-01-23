import {Component, Inject, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import {KnoraApiConnection, ReadResource, ReadResourceSequence} from "@dasch-swiss/dsp-js";
import {AppInitService, DspApiConnectionToken} from "../dsp-ui-lib/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BeolService} from "../services/beol.service";

@Component({
  selector: 'app-contact',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        private _appInitService: AppInitService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _beol: BeolService,
        public location: Location
    ) {
    }

  ngOnInit() {

  }
    goToResource(iri: string) {
        const resType =  this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#person';

        // create a query that gets the person by gnd
        this._dspApiConnection.v2.res.getResource(iri).subscribe(
            (personResource: ReadResource) => {
                this._beol.routeByResourceType(resType, iri, personResource);
            }
        );
    }
}
