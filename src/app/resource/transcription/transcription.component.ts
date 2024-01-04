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
import { Subscription } from 'rxjs';
import { IncomingService } from 'src/app/services/incoming.service';
import { BeolService } from '../../services/beol.service';
import { BeolCompoundResource, BeolResource, PropertyValues, PropIriToNameMapping } from '../beol-resource';
import { ArkUrlDialogComponent } from '../../dialog/ark-url-dialog.component';
import { MatDialog } from '@angular/material/dialog';

class TranscriptionProps implements PropertyValues {
    text: ReadTextValue[] = [];
    layer: ReadIntValue[] = [];
    transcriptionOf: ReadLinkValue[] = [];
    belongsToRegion: ReadLinkValue[] = [];

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
    selector: 'app-transcription',
    templateUrl: './transcription.component.html',
    styleUrls: ['./transcription.component.scss']
})
export class TranscriptionComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    navigationSubscription: Subscription;
    dspConstants = Constants;
    otherLayers: ReadResource[] = [];
    editor: Editor;
    propIris: PropIriToNameMapping = {
        'text': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasText',
        'layer': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#layer',
        'transcriptionOf': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#transcriptionOfValue',
        'belongsToRegion': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#belongsToRegionValue'

    };

    props: TranscriptionProps;

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

        const props = new TranscriptionProps();

        this.mapper(props);

        this.props = props;

        this.getOtherLayersForManuscriptEntry();

        /**
         * List of all existing editors
         */
       this.editor = new Editor('Martin Mattmüller', '(VIAF)69100561');

    }

    getOtherLayersForManuscriptEntry() {

        if (this.props.transcriptionOf.length !== 1 || this.props.layer.length !== 1) {
            return;
        }

        const otherLayersForManEntry =
            this._beolService.getTranscriptionsForManuscriptEntry(
                this.props.transcriptionOf[0].linkedResourceIri,
                this.props.layer[0].int, true
            );

        this._dspApiConnection.v2.search.doExtendedSearch(otherLayersForManEntry).subscribe(
            (otherLayers: ReadResourceSequence) => {
                if (otherLayers.resources.length > 0) {
                    this.otherLayers = otherLayers.resources;
                }
            }
        );
    }

    goToResource(resType: string, resIri: string, res: ReadResource) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }

    showEditorsRes(gnd) {
        const resType = this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#person';

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
