import {Component, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BeolCompoundResource, PropertyValues, PropIriToNameMapping} from '../../beol-resource';
import {
    Constants,
    KnoraApiConnection,
    ReadIntValue,
    ReadLinkValue,
    ReadResource,
    ReadResourceSequence, ReadStillImageFileValue,
    ReadTextValue,
    ReadValue
} from '@dasch-swiss/dsp-js';
import {AppInitService, DspApiConnectionToken} from '../../../dsp-ui-lib/core';
import {ActivatedRoute} from '@angular/router';
import {IncomingService} from '../../../services/incoming.service';
import {BeolService} from '../../../services/beol.service';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {Region, StillImageRepresentation} from '../../../dsp-ui-lib/viewer';

class TranscriptionProps implements PropertyValues {
    text: ReadTextValue[] = [];
    layer: ReadIntValue[] = [];
    transcriptionOf: ReadLinkValue[] = [];
    belongsToRegion: ReadLinkValue[] = [];

    [index: string]: ReadValue[];
}

@Component({
  selector: 'app-only-transcription',
  templateUrl: './only-transcription.component.html',
  styleUrls: ['./only-transcription.component.scss']
})
export class OnlyTranscriptionComponent implements OnChanges {
    @Input() iri: string;
    errorMessage: any;
    propIris: PropIriToNameMapping = {
        'text': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasText',
        'layer': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#layer',
        'transcriptionOf': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#transcriptionOfValue',
        'belongsToRegion': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#belongsToRegionValue'
    }
    resource: BeolCompoundResource;
    isLoading = true;
    props: TranscriptionProps;
    incomingStillImageRepresentationCurrentOffset: number;
    otherLayers: ReadResource[] = [];

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        protected _beolService: BeolService,
        private _appInitService: AppInitService,
        public location: Location,
        public dialog: MatDialog
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (this.iri) {
            this.getResource(this.iri);
        }
    }

    collectImagesAndRegionsForResource(resource: BeolCompoundResource): void {

        const imgRepresentations: StillImageRepresentation[] = [];

        if (resource.readResource.properties[Constants.HasStillImageFileValue] !== undefined) {
            // TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
            // resource has StillImageFileValues that are directly attached to it (properties)

            const fileValues: ReadStillImageFileValue[] = resource.readResource.properties[Constants.HasStillImageFileValue] as ReadStillImageFileValue[];

            for (const img of fileValues) {

                const regions: Region[] = [];
                for (const incomingRegion of resource.incomingRegions) {

                    const region = new Region(incomingRegion);

                    regions.push(region);

                }

                const stillImage = new StillImageRepresentation(img, regions);
                imgRepresentations.push(stillImage);

            }


        } else if (resource.incomingStillImageRepresentations.length > 0) {
            // there are StillImageRepresentations pointing to this resource (incoming)

            const readStillImageFileValues: ReadStillImageFileValue[] = resource.incomingStillImageRepresentations.map(
                (stillImageRes: ReadResource) => {
                    const fileValues = stillImageRes.properties[Constants.HasStillImageFileValue] as ReadStillImageFileValue[];
                    // TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)

                    return fileValues;
                }
            ).reduce((prev, curr) => {
                // transform ReadStillImageFileValue[][] to ReadStillImageFileValue[]
                return prev.concat(curr);
            });

            for (const img of readStillImageFileValues) {

                const regions: Region[] = [];
                for (const incomingRegion of resource.incomingRegions) {

                    const region = new Region(incomingRegion);
                    regions.push(region);

                }

                const stillImage = new StillImageRepresentation(img, regions);
                imgRepresentations.push(stillImage);
            }

        }

        resource.stillImageRepresentationsToDisplay = imgRepresentations;
    }

    private getIncomingRegions(offset: number): void {
        this._incomingService.getIncomingRegions(this.resource.readResource.id, offset).subscribe(
            (regions: ReadResourceSequence) => {

                // Append elements of regions.resources to resource.incoming
                Array.prototype.push.apply(this.resource.incomingRegions, regions.resources);

                // prepare regions to be displayed
                // triggers ngOnChanges of StillImageComponent
                this.collectImagesAndRegionsForResource(this.resource);

            },
            (error: any) => {
                this.errorMessage = error;
                this.isLoading = false;
            }
        );
    }

    private getIncomingStillImageRepresentations(offset: number): void {
        // make sure that this.resource has been initialized correctly
        if (this.resource === undefined) {
            return;
        }

        if (offset < 0) {
            console.log(`offset of ${offset} is invalid`);
            return;
        }

        this._incomingService.getStillImageRepresentationsForCompoundResource(this.resource.readResource.id, offset).subscribe(
            (incomingImageRepresentations: ReadResourceSequence) => {

                if (incomingImageRepresentations.resources.length > 0) {

                    // set current offset
                    this.incomingStillImageRepresentationCurrentOffset = offset;

                    // TODO: implement prepending of StillImageRepresentations when moving to the left (getting previous pages)
                    // TODO: append existing images to response and then assign response to `this.resource.incomingStillImageRepresentations`
                    // TODO: maybe we have to support non consecutive arrays (sparse arrays)

                    // append incomingImageRepresentations.resources to this.resource.incomingStillImageRepresentations
                    Array.prototype.push.apply(this.resource.incomingStillImageRepresentations, incomingImageRepresentations.resources);

                    // prepare attached image files to be displayed
                    this.collectImagesAndRegionsForResource(this.resource);
                }
            },
            (error: any) => {
                this.errorMessage = error;
                this.isLoading = false;
            }
        );

    }

    private getIncomingLinks(offset: number): void {

        this._incomingService.getIncomingLinksForResource(this.resource.readResource.id, offset).subscribe(
            (incomingResources: ReadResourceSequence) => {

                // Append elements incomingResources to this.resource.incomingLinks
                Array.prototype.push.apply(this.resource.readResource.incomingReferences, incomingResources.resources);
            },
            (error: any) => {
                this.errorMessage = error;
                this.isLoading = false;
            }
        );
    }

    private requestIncomingResources(): void {

        // make sure that this.resource has been initialized correctly
        if (this.resource === undefined) {
            return;
        }

        // request incoming regions
        if (this.resource.readResource.properties[Constants.HasStillImageFileValue]) {
            // TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
            // the resource is a StillImageRepresentation, check if there are regions pointing to it

            this.getIncomingRegions(0);

        } else {
            // this resource is not a StillImageRepresentation
            // check if there are StillImageRepresentations pointing to this resource

            // this gets the first page of incoming StillImageRepresentations
            // more pages may be requested by [[this.viewer]].
            // TODO: for now, we begin with offset 0. This may have to be changed later (beginning somewhere in a collection)
            this.getIncomingStillImageRepresentations(0);
        }

        // check for incoming links for the current resource
        this.getIncomingLinks(0);

    }

    private getResource(iri: string): void {
        this._dspApiConnection.v2.res.getResource(iri)
            .subscribe(
                (result: ReadResource) => {

                    this.resource = new BeolCompoundResource(result);

                    this.initProps();

                    this.isLoading = false;

                    this.requestIncomingResources();

                },
                (error: any) => {
                    this.errorMessage = error;
                    this.isLoading = false;
                }
            );
    }

    private swap(propMapping: PropIriToNameMapping): object {
        const invertedMapping: PropIriToNameMapping = {};
        for (const key in propMapping) {
            if (propMapping.hasOwnProperty(key)) {
                invertedMapping[propMapping[key]] = key;
            }
        }
        return invertedMapping;
    }

    private mapper(propClass: PropertyValues) {
        const swapped = this.swap(this.propIris);

        for (const key in this.resource.readResource.properties) {
            if (this.resource.readResource.properties.hasOwnProperty(key)) {
                for (const val of this.resource.readResource.properties[key]) {
                    const name = swapped[val.property];

                    if (name !== undefined && Array.isArray(propClass[name])) {
                        propClass[name].push(val);
                    }
                }
            }
        }
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

    private initProps() {
        const props = new TranscriptionProps();

        this.mapper(props);

        this.props = props;

        this.getOtherLayersForManuscriptEntry();
    }
}
