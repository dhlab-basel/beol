import { Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Observable, Subscription} from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService, DataGraphDB} from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';

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
    isJouneryLoading = true
    isStageLoading = true
    isMapLoading = true
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
    pages$: Observable<any>;
    journey$: Observable<any>;
    stages$: Observable<any>;
    mapCoordinates$: Observable<any>;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        private _appInitService: AppInitService,
        private _router: Router,
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
            this.getMapCoordinates();
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
        const gravsearch = this._beolService.getPagesOfManuscriptEntry(this.iri);
        this.pages$ = this._dspApiConnection.v2.search.doExtendedSearch(gravsearch);
    }

    /**
     * Function that adds the uri information to the data.
     *
     * @param data
     * @private
     */
    private addURI(data: DataGraphDB) {
        const headerWithIRI = data.head.vars.filter((item: string) => item.endsWith("Iri"));
        data.head.vars = data.head.vars.filter((item: string) => !item.endsWith("Iri"));

        for(let i = 0; i < data.results.bindings.length; i++) {

            const keys = Object.keys(data.results.bindings[i]);
            keys.map(key => {
                if (headerWithIRI.find(header => header === key)) {
                    const uri = data.results.bindings[i][key].value
                    data.results.bindings[i][key.split('Iri')[0]]['uri'] = uri;
                    delete data.results.bindings[i][key];
                }
                return key;
            })
        }
        return data;
    }

    private getJourney() {
        this.journey$ = this._beolService.getJourney(this.iri)
            .pipe(
                map((data: DataGraphDB) => this.addURI(data))
            );
            this.isJouneryLoading = false
    }

    private getStages() {
        this.stages$ = this._beolService.getStages(this.iri)
            .pipe(
                map((data: DataGraphDB) => this.addURI(data)),
            );
        this.isStageLoading = false
    }

    private getMapCoordinates() {
        this.mapCoordinates$ = this._beolService.make_coordinates_query(this.iri);

        this.isMapLoading = false

    }

    goToLocation(resIri) {
        this.goToResource(this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#Location', resIri, undefined);
    }

    goToResource(resType: string, resIri: string, res) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }

    goToFirstPageTranscription(id: string) {
        this._router.navigate(['pageTranscription/', id]);
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
