import { Component, Inject} from '@angular/core';
import { Location } from '@angular/common';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import {
    Constants,
    KnoraApiConnection,
    ReadIntValue,
    ReadLinkValue,
    ReadResource, ReadResourceSequence,
    ReadTextValue,
    ReadValue
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { ActivatedRoute } from '@angular/router';
import { IncomingService } from '../../services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { MatDialog } from '@angular/material/dialog';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';

class PageProps implements PropertyValues {
    pagenum: ReadTextValue[] = [];
    seqnum: ReadIntValue[] = [];
    partOf: ReadLinkValue[] = [];
    hasTranscription: ReadLinkValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
  selector: 'app-page-transcription',
  templateUrl: './page-transcription.component.html',
  styleUrls: ['./page-transcription.component.scss']
})
export class PageTranscriptionComponent extends BeolResource {
    isLoading = true;
    versionArkUrl: string;
    dspConstants: Constants;
    errorMessage: any;
    incomingStillImageRepresentationCurrentOffset: number;
    iri: string;
    navigationSubscription: Subscription;
    propIris: PropIriToNameMapping = {
        'pagenum': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#pagenum',
        'seqnum': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#seqnum',
        'partOf': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#partOfValue',
        'hasTranscription': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasTranscriptionValue'
    };
    resource: BeolCompoundResource;
    previousPage: ReadResource;
    nextPage: ReadResource;
    transcriptionIri: string;
    activeRegion: string;
    props: PageProps;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        protected _beolService: BeolService,
        private _appInitService: AppInitService,
        public location: Location,
        public dialog: MatDialog
    ) {
        super(_dspApiConnection, _route, _incomingService, _beolService);
    }

    openDialog(arkURL: string) {
        this.dialog.open(ArkUrlDialogComponent, {
            hasBackdrop: true,
            width: '500px',
            data: {
                arkURL: arkURL
            }
        });
    }

    initProps(): void {
        const props = new PageProps();

        this.mapper(props);

        this.props = props;
        this.versionArkUrl = this.resource.readResource.versionArkUrl;

        this.getPreviousAndNextPage();
        this.getTranscriptionIRI();
    }

    private getPreviousAndNextPage() {

        const manuscriptIri = this.props.partOf[0].linkedResourceIri;

        const gravsearchQuery = this._beolService.getPreviousAndNextPartOfCompound(manuscriptIri, this.props.seqnum[0].int);

        this._dspApiConnection.v2.search.doExtendedSearch(gravsearchQuery).subscribe(
            (pages: ReadResourceSequence) => {

                if (pages.resources.length === 2) {
                    this.previousPage = pages.resources[0];
                    this.nextPage = pages.resources[1];
                } else if (pages.resources.length === 1) {
                    if (this.props.seqnum[0].int === 1) {
                        // first page
                        this.nextPage = pages.resources[0];
                        this.previousPage = null;
                    } else {
                        // last page
                        this.previousPage = pages.resources[0];
                        this.nextPage = null;
                    }
                }

            });
    }

    getTranscriptionIRI() {

        const gravsearchQuery = this._beolService.getTranscriptionSPARQL(this.iri);

        this._dspApiConnection.v2.search.doExtendedSearch(gravsearchQuery).subscribe(
            (result: ReadResourceSequence) => {
                    if (result.resources.length === 1) {
                        console.log('we got a resource sequence ', result.resources);
                        this.transcriptionIri = result.resources[0].id;
                    }

                });
    }

    regionActive(regionIri: string) {
        this._beolService.routeToPageWithActiveRegion(regionIri);
    }

    goToResource(resType: string, resIri: string, res) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }
}
