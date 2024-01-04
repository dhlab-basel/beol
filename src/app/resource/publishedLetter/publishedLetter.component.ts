import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadLinkValue,
    ReadTextValue,
    ReadValue,
    ResourceClassAndPropertyDefinitions
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '../../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

class PublishedLetterProps implements PropertyValues {
    publishedLetterNumber: ReadTextValue[] = [];
    startPage: ReadTextValue[] = [];
    endPage: ReadTextValue[] = [];
    isPublishedIn: ReadLinkValue[] = [];
    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-publishedLetter',
    templateUrl: './publishedLetter.component.html',
    styleUrls: ['./publishedLetter.component.scss']
})
export class PublishedLetterComponent extends BeolResource {

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
        'isPublishedIn': this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#isPublishedInValue',
        'publishedLetterNumber': this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#publishedLetterNumber',
        'startPage': this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#publishedLetterStartPage',
        'endPage': this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#publishedLetterEndPage'
    };

    props: PublishedLetterProps;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        private _appInitService: AppInitService,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        protected _beolService: BeolService,
        public location: Location,
        public dialog: MatDialog
    ) {
        super(_dspApiConnection, _route, _incomingService, _beolService);
    }

    initProps() {

        const props = new PublishedLetterProps();

        this.mapper(props);

        this.props = props;
    }

    showIncomingRes(resIri, resType, res) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }

    openDialog(arkURL: string) {
        this.dialog.open(ArkUrlDialogComponent, {
            hasBackdrop: true,
            width: '600px',
            data: {
                arkURL: arkURL
            }
        });
    }
}
