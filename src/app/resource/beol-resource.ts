import { Directive, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    Constants,
    KnoraApiConnection,
    ReadLinkValue,
    ReadResource,
    ReadResourceSequence,
    ReadStillImageFileValue,
    ReadValue
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { DspApiConnectionToken } from '../dsp-ui-lib/core';
import { Region, StillImageComponent, StillImageRepresentation} from '../dsp-ui-lib/viewer';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IncomingService } from '../services/incoming.service';
import { BeolService } from '../services/beol.service';

export class BeolCompoundResource {

    readResource: ReadResource;

    incomingRegions: ReadResource[] = [];

    incomingStillImageRepresentations: ReadResource[] = [];

    stillImageRepresentationsToDisplay: StillImageRepresentation[] = [];

    constructor(resource: ReadResource) {

        this.readResource = resource;
    }
}

export interface PropIriToNameMapping {
    [index: string]: string;
}

export interface PropertyValues {
    [index: string]: ReadValue[];
}


@Directive()
export abstract class BeolResource implements OnInit, OnDestroy {

    abstract iri: string;
    abstract resource: BeolCompoundResource;
    isLoading = true;
    abstract errorMessage: any;
    abstract incomingStillImageRepresentationCurrentOffset: number;
    abstract navigationSubscription: Subscription;
    protected params;

    @ViewChild('OSDViewer') osdViewer: StillImageComponent;

    abstract dspConstants: Constants;

    abstract propIris: PropIriToNameMapping;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        protected _beolService: BeolService) {
    }

    /**
     * Creates a collection of [[StillImageRepresentation]] belonging to the given resource and assigns it to it.
     * Each [[StillImageRepresentation]] represents an image including regions.
     *
     * @param resource  The resource to get the images for.
     * @returns A collection of images for the given resource.
     */
    protected static collectImagesAndRegionsForResource(resource: BeolCompoundResource): void {

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

    /**
     * Given a `PropIriToNameMapping`, inverts its keys and values.
     *
     * @param propMapping mapping of names to property Iris.
     * @returns mapping of property Iris to names.
     */
    private static swap(propMapping: PropIriToNameMapping): object {
        const invertedMapping: PropIriToNameMapping = {};
        for (const key in propMapping) {
            if (propMapping.hasOwnProperty(key)) {
                invertedMapping[propMapping[key]] = key;
            }
        }
        return invertedMapping;
    }

    /**
     * Requests incoming resources for [[this.resource]].
     * Incoming resources are: regions, StillImageRepresentations, and incoming links.
     *
     *
     */
    protected requestIncomingResources(): void {

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

    /**
     * Gets the incoming regions for [[this.resource]].
     *
     * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
     */
    protected getIncomingRegions(offset: number): void {
        this._incomingService.getIncomingRegions(this.resource.readResource.id, offset).subscribe(
            (regions: ReadResourceSequence) => {

                // Append elements of regions.resources to resource.incoming
                Array.prototype.push.apply(this.resource.incomingRegions, regions.resources);

                // prepare regions to be displayed
                // triggers ngOnChanges of StillImageComponent
                BeolResource.collectImagesAndRegionsForResource(this.resource);

            },
            (error: any) => {
                this.errorMessage = error;
                this.isLoading = false;
            }
        );
    }

    /**
     * Get StillImageRepresentations pointing to [[this.resource]].
     * This method may have to called several times with an increasing offsetChange in order to get all available StillImageRepresentations.
     *
     * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
     * It takes the number of images returned as an argument.
     */
    protected getIncomingStillImageRepresentations(offset: number): void {
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
                    BeolResource.collectImagesAndRegionsForResource(this.resource);
                }
            },
            (error: any) => {
                this.errorMessage = error;
                this.isLoading = false;
            }
        );

    }

    /**
     * Get resources pointing to [[this.resource]] with properties other than knora-api:isPartOf and knora-api:isRegionOf.
     *
     * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
     * It takes the number of images returned as an argument.
     */
    protected getIncomingLinks(offset: number): void {

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

    /**
     * The user clicked on an internal link.
     *
     * @param linkVal the value representing the referred resource.
     */
    resLinkClicked(linkVal: ReadLinkValue) {

        const refResType = (linkVal.linkedResource !== undefined ? linkVal.linkedResource.type : '');

        this._beolService.routeByResourceType(refResType, linkVal.linkedResourceIri, linkVal.linkedResource);
    }

    ngOnInit() {
        this.navigationSubscription = this._route.paramMap.subscribe((params: ParamMap) => {
            this.params = params;
            this.iri = params.get('id');
            if (this.iri) {
                this.getResource(this.iri);
            }
        });

    }

    ngOnDestroy() {
        if (this.navigationSubscription !== undefined) {
            this.navigationSubscription.unsubscribe();
        }
    }

    /**
     * Initializes properties for a specific resource class.
     * To be implemented in template component.
     */
    abstract initProps(): void;

    /**
     * Assigns the resource's properties to `propClass`.
     *
     * @param propClass instance to assign the property values to.
     */
    protected mapper(propClass: PropertyValues) {

        const swapped = BeolResource.swap(this.propIris);

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

    /**
     * Requests a resource.
     *
     * @param iri the Iri of the resource to be requested.
     */
    getResource(iri: string): void {

        this._dspApiConnection.v2.res.getResource(iri)
            .subscribe(
                (result: ReadResource) => {

                    // console.log(result)

                    const res = new BeolCompoundResource(result);

                    // prepare a possibly attached image file to be displayed
                    BeolResource.collectImagesAndRegionsForResource(res);

                    this.resource = res;

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
}
