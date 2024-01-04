import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadDateValue,
    ReadLinkValue,
    ReadListValue,
    ReadResourceSequence,
    ReadTextValue,
    ReadUriValue,
    ReadValue,
    ResourceClassAndPropertyDefinitions
} from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';


class LetterProps implements PropertyValues {
    id: ReadTextValue[] = [];
    author: ReadLinkValue[] = [];
    recipient: ReadLinkValue[] = [];
    figure: ReadLinkValue[] = [];
    date: ReadDateValue[] = [];
    subject: ReadListValue[] = [];
    text: ReadTextValue[] = [];
    mentionedPerson: ReadLinkValue[] = [];
    language: ReadTextValue[] = [];
    number: ReadTextValue[] = [];
    original: ReadLinkValue[] = [];
    repertorium: ReadTextValue[] = [];
    translation: ReadLinkValue[] = [];
    published: ReadLinkValue[] = [];
    replyTo: ReadLinkValue[] = [];
    location: ReadTextValue[] = [];
    title: ReadTextValue[] = [];
    sysnum: ReadTextValue[] = [];
    comment: ReadTextValue[] = [];
    letterURI: ReadUriValue[] = [];

    [index: string]: ReadValue[];
}

/**
 * Represents an editor.
 */
class Editor {

    /**
     * Represents a person that took part in an edition.
     *
     * @param {string} name the name of the person.
     * @param {string} gnd the GND/IAF identifier of the person.
     */
    constructor(readonly name: string, readonly gnd: string) {
    }
}

@Component({
    selector: 'app-letter',
    templateUrl: './letter.component.html',
    styleUrls: ['./letter.component.scss']
})
export class LetterComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    navigationSubscription: Subscription;
    dspConstants = Constants;
    editors: Editor[] = [];

    ontologyIri = this._appInitService.config['ontologyIRI'];

    propIris: PropIriToNameMapping = {
        'id': this.ontologyIri + '/ontology/0801/beol/v2#beolIDs',
        'date': this.ontologyIri + '/ontology/0801/beol/v2#creationDate',
        'author': this.ontologyIri + '/ontology/0801/beol/v2#hasAuthorValue',
        'recipient': this.ontologyIri + '/ontology/0801/beol/v2#hasRecipientValue',
        'figure': this.ontologyIri + '/ontology/0801/beol/v2#hasFigureValue',
        'subject': this.ontologyIri + '/ontology/0801/beol/v2#hasSubject',
        'text': this.ontologyIri + '/ontology/0801/beol/v2#hasText',
        'mentionedPerson': this.ontologyIri + '/ontology/0801/beol/v2#mentionsPersonValue',
        'language': this.ontologyIri + '/ontology/0801/beol/v2#letterHasLanguage',
        'number': this.ontologyIri + '/ontology/0801/beol/v2#letterHasNumber',
        'original': this.ontologyIri + '/ontology/0801/beol/v2#letterHasOriginalValue',
        'repertorium': this.ontologyIri + '/ontology/0801/beol/v2#letterHasRepertoriumNumber',
        'translation': this.ontologyIri + '/ontology/0801/beol/v2#letterHasTranslationValue',
        'published': this.ontologyIri + '/ontology/0801/beol/v2#letterIsPublishedValue',
        'replyTo': this.ontologyIri + '/ontology/0801/beol/v2#letterIsReplyToValue',
        'location': this.ontologyIri + '/ontology/0801/beol/v2#location',
        'title': this.ontologyIri + '/ontology/0801/beol/v2#title',
        'sysnum': this.ontologyIri + '/ontology/0801/beol/v2#hasSystemNumber',
        'standoff': this.ontologyIri + '/ontology/knora-api/v2#hasStandoffLinkToValue',
        'comment': this.ontologyIri + '/ontology/0801/beol/v2#comment',
        'letterURI': this.ontologyIri + '/ontology/0801/beol/v2#letterHasURI',
    };

    props: LetterProps;

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

        const props = new LetterProps();

        this.mapper(props);

        this.props = props;

        /**
         * List of all existing editors
         */
        const Martin_Mattmueller = new Editor('Martin Mattmüller', '(VIAF)69100561');
        const Franz_Lemmermeyer = new Editor('Franz Lemmermeyer', '(DE-588)114515999');
        const Fritz_Nagel =  new Editor('Fritz Nagel', '(DE-588)101629915');
        const Sulamith_Gehr = new Editor('Sulamith Gehr', '(DE-588)128594551');
        const Vanja_Hug = new Editor('Vanja Hug', '(DE-588)1077840497');
        const Christian_Gilain = new Editor('Christian Gilain', '(DE-588)103230197X');
        const Rene_Taton = new Editor('René Taton', '(DE-588)117232521');

        if (this.props.sysnum.length > 0) {
            this.editors = [Fritz_Nagel, Sulamith_Gehr];
        } else if (this.props.letterURI.length > 0 ) {
            this.editors = [Franz_Lemmermeyer, Martin_Mattmueller];
        } else {
            this.editors = [Christian_Gilain, Vanja_Hug, Rene_Taton];
        }

    }

    showIncomingRes(resIri, resType, res) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }

    showEditorsRes(gnd) {
        const resType =  this.ontologyIri + '/ontology/0801/beol/v2#person';

        // create a query that gets the editor by gnd
        const query = this._beolService.searchForPersonWithGND(gnd);

        this._dspApiConnection.v2.search.doExtendedSearch(query).subscribe(
            (resourceSeq: ReadResourceSequence) => {

                if (resourceSeq.resources.length === 1) {
                    const personResource = resourceSeq.resources[0];
                    const personIri: string = personResource.id;

                    // given the Iri of the letter, display the whole resource
                    this._beolService.routeByResourceType(resType, personIri, personResource);
                } else {
                    // person not found
                    console.log(`editor with gnd number ${gnd} not found`);
                }

            }, (err) => {
                console.log('search failed ' + err);
            }
        );
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
