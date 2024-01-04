import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadDateValue,
    ReadLinkValue,
    ReadListValue,
    ReadTextValue,
    ReadTextValueAsString,
    ReadUriValue,
    ReadValue,
    ResourceClassAndPropertyDefinitions
} from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import * as BeolConstants from '../../beol-constants';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

class LetterProps implements PropertyValues {
    id: ReadTextValue[] = [];
    author: ReadLinkValue[] = [];
    recipient: ReadLinkValue[] = [];
    facsimiles: ReadUriValue[] = [];
    date: ReadDateValue[] = [];
    subject: ReadListValue[] = [];
    text: ReadTextValueAsString[] = [];
    mentionedPerson: ReadLinkValue[] = [];
    replyTo: ReadLinkValue[] = [];
    location: ReadTextValue[] = [];
    title: ReadTextValue[] = [];
    npID: ReadTextValue[] = [];
    language: ReadTextValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-newton-letter',
    templateUrl: './newton-letter.component.html',
    styleUrls: ['./newton-letter.component.scss']
})
export class NewtonLetterComponent extends BeolResource {
    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    isLoadingText = true;
    errorMessage: any;
    navigationSubscription: Subscription;
    dspConstants = Constants;

    letter: string;
    test: string;

    ontologyIri = this._appInitService.config['ontologyIRI'];
    newtonProjectPath = BeolConstants.NEWTON_PROJECT_IRI;
    newtonLetterPath = BeolConstants.NEWTON_DIRECTIVE_PATH;

    propIris: PropIriToNameMapping = {
        'id': this.ontologyIri + '/ontology/0801/beol/v2#beolIDs',
        'date': this.ontologyIri + '/ontology/0801/beol/v2#creationDate',
        'author': this.ontologyIri + '/ontology/0801/beol/v2#hasAuthorValue',
        'recipient': this.ontologyIri + '/ontology/0801/beol/v2#hasRecipientValue',
        'facsimiles': this.ontologyIri + '/ontology/0801/newton/v2#hasFacsimiles',
        'subject': this.ontologyIri + '/ontology/0801/beol/v2#hasSubject',
        'text': this.ontologyIri + '/ontology/0801/beol/v2#hasText',
        'mentionedPerson': this.ontologyIri + '/ontology/0801/beol/v2#mentionsPersonValue',
        'replyTo': this.ontologyIri + '/ontology/0801/newton/v2#isReplyToValue',
        'location': this.ontologyIri + '/ontology/0801/beol/v2#location',
        'title': this.ontologyIri + '/ontology/0801/beol/v2#title',
        'npID': this.ontologyIri + '/ontology/0801/newton/v2#newtonProjectID',
        'language': this.ontologyIri + '/ontology/0801/beol/v2#letterHasLanguage',
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

    // this is for our own (knora) resources
    initProps() {

        const props = new LetterProps();

        this.mapper(props);
        this.props = props;
        // get the id from the route newtonletter/:id e.g. NATP00120
        this.getNewtonLetterText(this.props.npID[0].strval);
    }


    private getNewtonLetterText(filename) {
        const cors_proxyurl = 'https://cors-container.herokuapp.com/';
        const basePath = this.newtonLetterPath;

        const url = basePath + filename; // site that doesn’t send Access-Control-*

        fetch(cors_proxyurl + url)
            .then(response => response.text())
            .then(contents => {
                    this.getNewtonLetterBody(contents);
                    this.isLoadingText = false;
                }
            ).catch(() => console.log('Can’t access ' + url + ' response. Blocked by browser?'));
    }

    private getNewtonLetterBody(contents) {
        let text = '';
        const html = new DOMParser().parseFromString(contents, 'text/html');
        const divs = html.getElementsByTagName('div');
        for (let divIt = 0; divIt < divs.length; divIt++) {
            const divEl = divs[divIt];
            if (divEl.id === 'tei') {
                for (let child = 0; child < divEl.children.length; child++) {
                    const divelement = this.imageSrcAttribute(divEl.children[child]);
                    text = text.concat(divelement.innerHTML);
                }
                this.letter = text;
            }
        }
    }

    private imageSrcAttribute(element) {
        const imgs = element.getElementsByTagName('img');
        for (let imgIt = 0; imgIt < imgs.length; imgIt++) {
            const image = imgs[imgIt];
            if (image.src) {
                image.src = image.src.replace(this._appInitService.config['appURL'], this.newtonProjectPath);
            }
        }
        return element;
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
