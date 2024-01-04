import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadDateValue,
    ReadLinkValue,
    ReadTextValue,
    ReadUriValue,
    ReadValue
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '../../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

class BiblioItemsProps implements PropertyValues {
    startPage: ReadTextValue[] = [];
    endPage: ReadTextValue[] = [];
    mentionedIn: ReadTextValue[] = [];
    comment: ReadTextValue[] = [];
    isPartOfJournal: ReadLinkValue[] = [];
    isPartOfCollection: ReadLinkValue[] = [];
    isPartOfEditedBook: ReadLinkValue[] = [];
    journalVolume: ReadTextValue[] = [];
    numVolumes: ReadTextValue[] = [];
    numPages: ReadTextValue[] = [];
    author: ReadLinkValue[] = [];
    editor: ReadLinkValue[] = [];
    editorOrg: ReadLinkValue[] = [];
    date: ReadDateValue[] = [];
    title: ReadTextValue[] = [];
    subtitle: ReadTextValue[] = [];
    name: ReadTextValue[] = [];
    publisher: ReadLinkValue[] = [];
    abbreviation: ReadTextValue[] = [];
    location: ReadTextValue[] = [];
    isReprinted: ReadLinkValue[] = [];
    bookContent: ReadLinkValue[] = [];
    isbn: ReadTextValue[] = [];
    collectionNumber: ReadTextValue[] = [];
    introduction: ReadLinkValue[] = [];
    translator: ReadLinkValue[] = [];
    isTranslationOf: ReadLinkValue[] = [];
    journalIssue: ReadTextValue[] = [];
    externalLink: ReadUriValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-biblio-items',
    templateUrl: './biblio-items.component.html',
    styleUrls: ['./biblio-items.component.scss']
})
export class BiblioItemsComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    navigationSubscription: Subscription;
    dspConstants = Constants;

    ontologyIri = this._appInitService.config['ontologyIRI'];

    propIris: PropIriToNameMapping = {
        'id': this.ontologyIri + '/ontology/0801/beol/v2#beolIDs',
        'comment': this.ontologyIri + '/ontology/0801/beol/v2#comment',
        'mentionedIn': this.ontologyIri + '/ontology/0801/beol/v2#mentionedIn',
        'endPage': this.ontologyIri + '/ontology/0801/biblio/v2#endPage',
        'startPage': this.ontologyIri + '/ontology/0801/biblio/v2#startPage',
        'isPartOfJournal': this.ontologyIri + '/ontology/0801/biblio/v2#isPartOfJournalValue',
        'isPartOfEditedBook': this.ontologyIri + '/ontology/0801/biblio/v2#isPartOfEditedBookValue',
        'isPartOfCollection': this.ontologyIri + '/ontology/0801/biblio/v2#isPartOfCollectionValue',
        'journalVolume': this.ontologyIri + '/ontology/0801/biblio/v2#journalVolume',
        'numVolumes': this.ontologyIri + '/ontology/0801/biblio/v2#numVolumes',
        'numPages': this.ontologyIri + '/ontology/0801/biblio/v2#numPages',
        'collectionNumber': this.ontologyIri + '/ontology/0801/biblio/v2#collectionNumber',
        'author': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasAuthorValue',
        'editor': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasEditorValue',
        'editorOrg': this.ontologyIri + '/0801/biblio/v2#publicationHasEditorOrgValue',
        'date': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasDate',
        'title': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasTitle',
        'subtitle': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasSubtitle',
        'name': this.ontologyIri + '/ontology/0801/biblio/v2#hasName',
        'publisher': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasPublisherValue',
        'abbreviation': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasAbbreviation',
        'location': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasLocation',
        'isReprinted': this.ontologyIri + '/ontology/0801/biblio/v2#publicationIsReprintedValue',
        'bookContent': this.ontologyIri + '/ontology/0801/biblio/v2#bookHasContentValue',
        'isbn': this.ontologyIri + '/ontology/0801/biblio/v2#bookHasISBN',
        'introduction': this.ontologyIri + '/ontology/0801/biblio/v2#hasIntroductionValue',
        'translator': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasTranslatorValue',
        'isTranslationOf': this.ontologyIri + '/ontology/0801/biblio/v2#publicationIsTranslationOfValue',
        'journalIssue': this.ontologyIri + '/ontology/0801/biblio/v2#journalIssue',
        'externalLink': this.ontologyIri + '/ontology/0801/biblio/v2#publicationHasExternalLink',

        /* // Unused properties (names come from Knora biblio ontology)
        'volumeSubtitle': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#volumeSubtitle',
        'edited': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationIsEditedValue',
        'editionOf': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationIsEditionOfValue',
        'reprintOf': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationIsReprintOfValue',
        'reviewed': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationIsReviewedValue',
        'reviewOf': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationIsReviewOfValue',
        'hasManuscript': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationHasManuscriptValue',
        'link': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#hasLinkValue',
        'translatedTo': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationIsTranslatedValue',
        'doi': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationHasDOI',
        'publisherLocation': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publisherHasLocation',
        'editionEditor': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#editionHasEditorValue',
        'editionOrg': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#editionHasOrganizationValue',
        'editionNumber': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#editionHasNumber',
        'editionName': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#editionHasName',
        'uri': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#hasURI',
        'content': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#hasContentValue',
        'webpageHrefTag': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#webpageHasHrefTag',
        'translationOf': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#translationOfValue',
        'translationLanguage': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#translationHasLanguage',
        'translationTitle': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#translationHasTitle',
        'publicationTranslator': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#publicationHasTranslatorValue',
        'translationDate': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#translationHasDate',
        'IsPartOfWebsite': this._appInitService.getSettings().ontologyIRI + '/ontology/0801/biblio/v2#isPartOfWebsiteValue' */
    };

    props: BiblioItemsProps;

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

        const props = new BiblioItemsProps();

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
