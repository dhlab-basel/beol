import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    Constants,
    KnoraApiConnection,
    ReadIntValue,
    ReadLinkValue,
    ReadResource,
    ReadResourceSequence,
    ReadTextValue,
    ReadTextValueAsHtml,
    ReadValue,
    ResourceClassAndPropertyDefinitions
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '../../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { MatDialog } from '@angular/material/dialog';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';

class PageProps implements PropertyValues {

    pagenum: ReadTextValue[] = [];
    seqnum: ReadIntValue[] = [];
    partOf: ReadLinkValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss']
})
export class PageComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    dspConstants = Constants;
    navigationSubscription: Subscription;

    propIris: PropIriToNameMapping = {
        'pagenum': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#pagenum',
        'seqnum': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#seqnum',
        'partOf': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#partOfValue'
    };

    props: PageProps;

    transcriptionResource: ReadResource;
    transcription: ReadTextValueAsHtml;
    transcriptionBelongsToRegion: ReadLinkValue;
    manuscriptEntry: ReadLinkValue;
    transcriptionsForManuscriptEntry: ReadResource[] = [];

    activeRegion: string;

    previousPage: ReadResource;
    nextPage: ReadResource;
    versionArkUrl: string;

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

        const props = new PageProps();

        this.mapper(props);

        this.props = props;
        this.versionArkUrl = this.resource.readResource.versionArkUrl;

        this.getPreviousAndNextPage();

        // check if there is an active region (submitted as a parameter)
        const activeRegionIri = this.params.get('region');

        if (activeRegionIri !== null) {
            this.activeRegion = activeRegionIri;
            this.getTranscription(activeRegionIri);
        }
    }

    private getTranscription(regionIri: string) {

        const gravsearchQuery: string = this._beolService.getTranscriptionIriForRegion(regionIri);

        this._dspApiConnection.v2.search.doExtendedSearch(gravsearchQuery).subscribe(
            (transcriptions: ReadResourceSequence) => {
                if (transcriptions.resources.length === 1) {
                    // get transcription associated to region
                    this._dspApiConnection.v2.res.getResource(transcriptions.resources[0].id).subscribe(
                        (transcr: ReadResource) => {

                            this.transcriptionBelongsToRegion = transcr.properties[this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#belongsToRegionValue'][0] as ReadLinkValue;

                            this.manuscriptEntry = transcr.properties[this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#transcriptionOfValue'][0] as ReadLinkValue;

                            this.transcriptionResource = transcr;

                            this.transcription =
                                transcr.properties[this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasText'][0] as ReadTextValueAsHtml;

                            const transcriptionsFormManuscriptEntry = this._beolService.getTranscriptionsForManuscriptEntry(this.manuscriptEntry.linkedResourceIri, 0);

                            this._dspApiConnection.v2.search.doExtendedSearch(transcriptionsFormManuscriptEntry).subscribe(
                                (manEntries: ReadResourceSequence) => {
                                    if (manEntries.resources.length > 0) {
                                        this.transcriptionsForManuscriptEntry = manEntries.resources;
                                    }
                                }
                            );
                        },
                        (error) => {
                            this.errorMessage = <any>error;
                            this.isLoading = false;
                        }
                    );
                }
            },
            (err) => {
                console.log('Could not load transcription for active region');
            }
        );
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
                    } else {
                        // last page
                        this.previousPage = pages.resources[0];
                    }
                }

            });
    }

    regionActive(regionIri: string) {
        this._beolService.routeToPageWithActiveRegion(regionIri);
    }

    goToResource(resType: string, resIri: string, res) {
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
