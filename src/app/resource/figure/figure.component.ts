import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadTextValue,
    ReadValue,
    ResourceClassAndPropertyDefinitions
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '@dasch-swiss/dsp-ui';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { MatSnackBar } from '@angular/material/snack-bar';

class FigureProps implements PropertyValues {
    caption: ReadTextValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-figure',
    templateUrl: './figure.component.html',
    styleUrls: ['./figure.component.scss']
})
export class FigureComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    navigationSubscription: Subscription;
    dspConstants = Constants;

    propIris: PropIriToNameMapping = {
        'id': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#beolIDs',
        'caption': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasCaption'
    };

    props: FigureProps;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        public location: Location,
        protected _beolService: BeolService,
        private _appInitService: AppInitService,
        protected _snackBar: MatSnackBar
    ) {

        super(_dspApiConnection, _route, _incomingService, _beolService, _snackBar);

    }

    initProps() {

        const props = new FigureProps();

        this.mapper(props);

        this.props = props;
    }

}
