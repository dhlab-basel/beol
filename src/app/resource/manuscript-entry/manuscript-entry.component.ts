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
    ReadValue,
    ResourceClassAndPropertyDefinitions
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, AppInitService } from '../../dsp-ui-lib/core';
import { Observable, Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

class ManuscriptEntryProps implements PropertyValues {

    title: ReadTextValue[] = [];
    seqnum: ReadIntValue[] = [];
    page: ReadLinkValue[] = [];
    manuscriptEntryOf: ReadLinkValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
    selector: 'app-manuscript-entry',
    templateUrl: './manuscript-entry.component.html',
    styleUrls: ['./manuscript-entry.component.scss']
})
export class ManuscriptEntryComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    dspConstants = Constants;
    navigationSubscription: Subscription;
    isPartOfReisbuechlein: boolean;

    propIris: PropIriToNameMapping = {
        'title': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#title',
        'seqnum': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#seqnum',
        'page': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasPageValue',
        'manuscriptEntryOf': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#manuscriptEntryOfValue'
    };

    props: ManuscriptEntryProps;

    transcriptions: ReadResource[] = [];
    journey$: Observable<any>;
    stages$: Observable<any>;

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

        const props = new ManuscriptEntryProps();

        this.mapper(props);

        this.props = props;

        this.getTranscriptions();

        this.checkReisbuechlein();

        if (this.isPartOfReisbuechlein) {
            this.getPages();
            this.getJourney();
            this.getStages();
        }
    }

    private getTranscriptions() {

        const titleRegionTranscriptionQuery = this._beolService.getTitleRegionTranscriptionForManuscriptEntry(this.iri);

        const criticalLayersQuery = this._beolService.getTranscriptionsForManuscriptEntry(this.iri, 0, false);

        this._dspApiConnection.v2.search.doExtendedSearch(titleRegionTranscriptionQuery).subscribe(
            (titleRegionTranscr: ReadResourceSequence) => {
                this._dspApiConnection.v2.search.doExtendedSearch(criticalLayersQuery).subscribe(
                    (transcriptions: ReadResourceSequence) => {
                        this.transcriptions = titleRegionTranscr.resources.concat(transcriptions.resources);
                    }
                );
            }
        );

    }

    private checkReisbuechlein() {
        this.isPartOfReisbuechlein = this.props?.manuscriptEntryOf[0].linkedResourceIri === "http://rdfh.ch/0801/N1XIvGvYSBO1wODFfl0QjQ";
    }

    private getPages() {
        // TODO
    }

    private getJourney() {
        this.journey$ = this._beolService.getJourney(this.iri);
    }

    private getStages() {
        this.stages$ = this._beolService.getStages(this.iri);
    }

    goToResource(resType: string, resIri: string, res) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }

    goToFirstPageTranscription() {
        // TODO
        console.log(this.resource, this.props);
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
