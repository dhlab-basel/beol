import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadDateValue,
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

class PersonProps implements PropertyValues {
    comment: ReadTextValue[] = [];
    alternative: ReadTextValue[] = [];
    birthDate: ReadDateValue[] = [];
    birthPlace: ReadTextValue[] = [];
    deathDate: ReadDateValue[] = [];
    deathPlace: ReadTextValue[] = [];
    dictionary: ReadTextValue[] = [];
    givenName: ReadTextValue[] = [];
    familyName: ReadTextValue[] = [];
    title: ReadTextValue[] = [];
    IAF: ReadTextValue[] = [];
    mentioned: ReadTextValue[] = [];
    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-person',
    templateUrl: './person.component.html',
    styleUrls: ['./person.component.scss']
})
export class PersonComponent extends BeolResource {

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
        'id': this.ontologyIri + '/ontology/0801/beol/v2#beolIDs',
        'comment': this.ontologyIri + '/ontology/0801/beol/v2#comment',
        'alternative': this.ontologyIri + '/ontology/0801/beol/v2#hasAlternativeName',
        'birthDate': this.ontologyIri + '/ontology/0801/beol/v2#hasBirthDate',
        'birthPlace': this.ontologyIri + '/ontology/0801/beol/v2#hasBirthPlace',
        'deathDate': this.ontologyIri + '/ontology/0801/beol/v2#hasDeathDate',
        'deathPlace': this.ontologyIri + '/ontology/0801/beol/v2#hasDeathPlace',
        'dictionary': this.ontologyIri + '/ontology/0801/beol/v2#hasDictionaryEntries',
        'familyName': this.ontologyIri + '/ontology/0801/beol/v2#hasFamilyName',
        'givenName': this.ontologyIri + '/ontology/0801/beol/v2#hasGivenName',
        'title': this.ontologyIri + '/ontology/0801/beol/v2#personHasTitle',
        'IAF': this.ontologyIri + '/ontology/0801/beol/v2#hasIAFIdentifier',
        'mentioned': this.ontologyIri + '/ontology/0801/beol/v2#mentionedIn',
    };

    props: PersonProps;

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

        const props = new PersonProps();

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
