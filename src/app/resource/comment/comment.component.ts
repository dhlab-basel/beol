import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ResourceClassAndPropertyDefinitions,
    ReadValue,
    ReadTextValue,
    ReadLinkValue
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '../../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

class CommentProps implements PropertyValues {
    commentOf: ReadLinkValue[] = [];
    text: ReadTextValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    navigationSubscription: Subscription;
    dspConstants = Constants;

    ontologyIri = this._appInitService.config['ontologyIRI'];

    propIris: PropIriToNameMapping = {
        'commentOf': this.ontologyIri + '/ontology/0801/beol/v2#entryCommentOfValue',
        'text': this.ontologyIri + '/ontology/0801/beol/v2#hasText',
    };

    props: CommentProps;

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

        const props = new CommentProps();

        this.mapper(props);

        this.props = props;

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
