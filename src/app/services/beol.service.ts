import { Inject, Injectable } from '@angular/core';
import { AdvancedSearchParams, AdvancedSearchParamsService} from '../dsp-ui-lib/search';
import { AppInitService, DspApiConnectionToken} from '../dsp-ui-lib/core';
import { ApiResponseError, KnoraApiConnection, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Constants, ReadResource, ReadLinkValue } from '@dasch-swiss/dsp-js';

@Injectable({
    providedIn: 'root'
})
export class BeolService {

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _searchParamsService: AdvancedSearchParamsService,
        private _appInitService: AppInitService,
        private _router: Router
    ) { }

    /**
     * Given the ISBN, returns the Gravsearch to search for the book.
     *
     * @param isbn the book's ISBN.
     * @param sectionTitle the title to display describing the book.
     * @returns Gravsearch query.
     */
    searchForBookByTitle(isbn: string, sectionTitle: string): string {

        const bookTemplate = `
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX biblio: <${this._appInitService.config['ontologyIRI']}/ontology/0801/biblio/simple/v2#>
    PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>

    CONSTRUCT {

        ?introSection knora-api:isMainResource true .

    } WHERE {

        ?book a knora-api:Resource .

        ?book a biblio:Book .

        ?book biblio:bookHasISBN ?propVal0 .
        biblio:bookHasISBN knora-api:objectType <http://www.w3.org/2001/XMLSchema#string> .
        ?propVal0 a <http://www.w3.org/2001/XMLSchema#string> .

        FILTER(?propVal0 = "${isbn}"^^<http://www.w3.org/2001/XMLSchema#string>)

        ?book biblio:bookHasContent ?content .

        biblio:bookHasContent knora-api:objectType knora-api:Resource .
        ?content a knora-api:Resource .

        ?content biblio:hasIntroduction ?intro .

        biblio:hasIntroduction knora-api:objectType knora-api:Resource .
        ?intro a knora-api:Resource .

        ?intro beol:hasSection ?introSection .
        beol:hasSection knora-api:objectType knora-api:Resource .
        ?introSection a knora-api:Resource .

        ?introSection beol:sectionHasTitle ?sectionTitle .

        beol:sectionHasTitle knora-api:objectType xsd:string .
        ?sectionTitle a xsd:string .

        FILTER(?sectionTitle = "${sectionTitle}")

    }

    OFFSET 0
        `;

        return bookTemplate;

    }


    /**
     * Given the ID, returns the Gravsearch to search for the book's introduction.
     *
     * @param id the id to display describing the introduction.
     * @returns Gravsearch query.
     */
    searchForIntroductionById(id: string): string {

        const introTemplate = `
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>

    CONSTRUCT {

        ?introSection knora-api:isMainResource true .

    } WHERE {

        ?introSection a beol:section .
        ?introSection beol:beolIDs ?sectionId .

        FILTER(?sectionId = "${id}")

    }

    OFFSET 0
        `;

        return introTemplate;

    }


    /**
     * Creates the Gravsearch needed for the search for the LEOO correspodence ordered by date.
     *
     * @param gnd1 the GND/IAF identifier for the first correspondent.
     * @param gnd2 the GND/IAF identifier for the second correspondent.
     * @param showTranslation indicates if the translation of the letter should be shown or in original language.
     * @param offset the offset to be used.
     */
    searchForLeooCorrespondence(gnd1: string, gnd2: string, showTranslation: boolean = false, offset: number = 0): string {

        let resourcesThatHaveNoTranslation = '';

        if (showTranslation) {
            // The resources representing translations of LEOO letters do not have the property: beol:letterHasTranslation.

            resourcesThatHaveNoTranslation = `

            FILTER NOT EXISTS {
                ?letter beol:letterHasTranslation ?translation .
            } `;

        } else {
            // The resources representing the LEOO letters in original language have the property: beol:letterHasTranslation.
            resourcesThatHaveNoTranslation = `
            ?letter beol:letterHasTranslation ?translation .
            `;
        }

        const correspondenceTemplate = `
            PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/v2#>
            PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>

            CONSTRUCT {
                ?letter knora-api:isMainResource true .
                ?letter ?linkingProp1  ?person1 .
                ?letter ?linkingProp2  ?person2 .
                ?letter beol:creationDate ?date .

            } WHERE {

               ?gnd1 knora-api:valueAsString "${gnd1}" .
               ?person1 beol:hasIAFIdentifier ?gnd1 .

               ?gnd2 knora-api:valueAsString "${gnd2}" .
               ?person2 beol:hasIAFIdentifier ?gnd2 .

                ?letter ?linkingProp1 ?person1 .
                FILTER(?linkingProp1 = beol:hasAuthor || ?linkingProp1 = beol:hasRecipient )

                ?letter ?linkingProp2 ?person2 .
                FILTER(?linkingProp2 = beol:hasAuthor || ?linkingProp2 = beol:hasRecipient )

                ?letter beol:creationDate ?date .
                ${resourcesThatHaveNoTranslation}

            } ORDER BY ?date
        `;

        // offset component of the Gravsearch query
        const offsetTemplate = `
        OFFSET ${offset}
        `;

        // function that generates the same Gravsearch query with the given offset
        const generateGravsearchWithCustomOffset = (localOffset: number): string => {
            const offsetCustomTemplate = `
            OFFSET ${localOffset}
            `;

            return correspondenceTemplate + offsetCustomTemplate;
        };

        if (offset === 0) {
            // store the function so another Gravsearch query can be created with an increased offset
            this._searchParamsService.changeSearchParamsMsg(new AdvancedSearchParams(generateGravsearchWithCustomOffset));
        }

        // console.log(correspondenceTemplate + offsetTemplate);

        return correspondenceTemplate + offsetTemplate;
    }

    /**
     * Creates the Gravsearch needed for the search for the correspodence between two persons, ordered by date  (LECE and BEBB editions).
     *
     * @param gnd1 the GND/IAF identifier for the first correspondent.
     * @param gnd2 the GND/IAF identifier for the second correspondent.
     * @param offset the offset to be used.
     */
    searchForCorrespondence(gnd1: string, gnd2: string, offset: number = 0): string {


        const correspondenceTemplate = `
            PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/v2#>
            PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>

            CONSTRUCT {
                ?letter knora-api:isMainResource true .
                ?letter ?linkingProp1  ?person1 .
                ?letter ?linkingProp2  ?person2 .
                ?letter beol:creationDate ?date .

            } WHERE {

               ?gnd1 knora-api:valueAsString "${gnd1}" .
               ?person1 beol:hasIAFIdentifier ?gnd1 .

               ?gnd2 knora-api:valueAsString "${gnd2}" .
               ?person2 beol:hasIAFIdentifier ?gnd2 .

                ?letter ?linkingProp1 ?person1 .
                FILTER(?linkingProp1 = beol:hasAuthor || ?linkingProp1 = beol:hasRecipient )

                ?letter ?linkingProp2 ?person2 .
                FILTER(?linkingProp2 = beol:hasAuthor || ?linkingProp2 = beol:hasRecipient )

                ?letter beol:creationDate ?date .

            } ORDER BY ?date
        `;

        // offset component of the Gravsearch query
        const offsetTemplate = `
        OFFSET ${offset}
        `;

        // function that generates the same Gravsearch query with the given offset
        const generateGravsearchWithCustomOffset = (localOffset: number): string => {
            const offsetCustomTemplate = `
            OFFSET ${localOffset}
            `;

            return correspondenceTemplate + offsetCustomTemplate;
        };

        if (offset === 0) {
            // store the function so another Gravsearch query can be created with an increased offset
            this._searchParamsService.changeSearchParamsMsg(new AdvancedSearchParams(generateGravsearchWithCustomOffset));
        }

        // console.log(correspondenceTemplate + offsetTemplate);

        return correspondenceTemplate + offsetTemplate;
    }

    /**
     * Creates the Gravsearch needed for the search for the newton correspodence.
     */
    searchForNewtonCorrespondence(offset: number = 0): string {

        const correspondenceTemplate = `
            PREFIX newton: <${this._appInitService.config['ontologyIRI']}/ontology/0801/newton/simple/v2#>
            PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>

            CONSTRUCT {
                ?letter knora-api:isMainResource true .

            } WHERE {
                ?letter a newton:letter .

            }
        `;


        // offset component of the Gravsearch query
        const offsetTemplate = `
        OFFSET ${offset}
        `;

        // function that generates the same Gravsearch query with the given offset
        const generateGravsearchWithCustomOffset = (localOffset: number): string => {
            const offsetCustomTemplate = `
            OFFSET ${localOffset}
            `;

            return correspondenceTemplate + offsetCustomTemplate;
        };

        if (offset === 0) {
            // store the function so another Gravsearch query can be created with an increased offset
            this._searchParamsService.changeSearchParamsMsg(new AdvancedSearchParams(generateGravsearchWithCustomOffset));
        }
        return correspondenceTemplate + offsetTemplate;
    }

    /**
     * Creates the Gravsearch needed for the search for the leibniz correspodence.
     */
    searchForLeibnizCorrespondence(offset: number = 0): string {

        const correspondenceTemplate = `
            PREFIX leibniz: <${this._appInitService.config['ontologyIRI']}/ontology/0801/leibniz/simple/v2#>
            PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>

            CONSTRUCT {
                ?letter knora-api:isMainResource true .

            } WHERE {
                ?letter a leibniz:letter .

            }
        `;


        // offset component of the Gravsearch query
        const offsetTemplate = `
        OFFSET ${offset}
        `;

        // function that generates the same Gravsearch query with the given offset
        const generateGravsearchWithCustomOffset = (localOffset: number): string => {
            const offsetCustomTemplate = `
            OFFSET ${localOffset}
            `;

            return correspondenceTemplate + offsetCustomTemplate;
        };

        if (offset === 0) {
            // store the function so another Gravsearch query can be created with an increased offset
            this._searchParamsService.changeSearchParamsMsg(new AdvancedSearchParams(generateGravsearchWithCustomOffset));
        }
        return correspondenceTemplate + offsetTemplate;
    }
    /**
     * Given the repertorium number of a letter from LEOO, searches for that letter.
     *
     * @param repertoriumNumber the repertorium number to search for.
     * @returns the Gravsearch query.
     */
    searchForLetterFromLEOO(repertoriumNumber: string): string {

        const letterByNumberTemplate = `
        PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/v2#>
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
        CONSTRUCT {

            ?letter knora-api:isMainResource true .


        } WHERE {

            ?letter a beol:letter .
            ?repertoriumNr knora-api:valueAsString "${repertoriumNumber}" .
            ?letter beol:letterHasRepertoriumNumber ?repertoriumNr .

        }

        OFFSET 0
        `;

        return letterByNumberTemplate;

    }

    /**
     * Given a region Iri, returns the Gravsearch query to obtain the associated transcription Iri.
     *
     * @param regionIri Iri of the region.
     * @param offset offset to be used.
     * @returns the Gravsearch query to get the transcription Iris.
     */
    getTranscriptionIriForRegion(regionIri: string, offset: number = 0) {

        const transcriptionIriForPage = `
        PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {
            ?transcription knora-api:isMainResource true .
        } WHERE {
            ?transcription beol:belongsToRegion <${regionIri}> .
        }

        OFFSET ${offset}
        `;

        return transcriptionIriForPage;
    }

    /**
     * Given a manuscript entry Iri, get the transcriptions that point to this manuscript entry.
     *
     * @param manuscriptEntryIri Iri of the manuscript entry.
     * @param excludeLayer layer to be excluded.
     * @param excludeLayer0 if set to true, layer 0 is ignored.
     * @param offset offset to be used.
     * @returns the Gravsearch query to get the manuscript entries.
     */
    getTranscriptionsForManuscriptEntry(manuscriptEntryIri: string, excludeLayer: number, excludeLayer0 = false, offset: number = 0) {

        let excludeLayer0filter = '';

        if (excludeLayer0) {
            excludeLayer0filter = `FILTER(?layer > 0)`;
        }

        const transcriptionsForManuscriptEntry = `
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {

            ?trans knora-api:isMainResource true .

        } WHERE {

            ?trans a knora-api:Resource .

            ?trans a <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#transcription> .

            ?trans <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#transcriptionOf> <${manuscriptEntryIri}> .

            ?trans <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#layer> ?layer .

            FILTER(?layer != ${excludeLayer})

            ${excludeLayer0filter}
        }

        ORDER BY ?layer
        OFFSET ${offset}
        `;

        return transcriptionsForManuscriptEntry;
    }

    getTitleRegionTranscriptionForManuscriptEntry(manuscriptEntryIri: string, offset: number = 0) {

        const titleRegionTranscriptionsForManuscriptEntry = `
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {

            ?trans knora-api:isMainResource true .

        } WHERE {

            ?trans a knora-api:Resource .

            ?trans a <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#transcription> .

            ?trans <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#transcriptionOf> <${manuscriptEntryIri}> .

            ?trans <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#belongsToRegion> ?region .

            ?region knora-api:hasComment ?title .

            FILTER(regex(?title, '01-TT'))


        }


        OFFSET ${offset}
        `;

        return titleRegionTranscriptionsForManuscriptEntry;

    }

    /**
     * Routes to the page a region belongs to, submitting the Iri of the region.
     *
     * @param regionIri the region to be displayed on the page it belongs to.
     */
    routeToPageWithActiveRegion(regionIri: string) {
        const isRegionOfValueProp = 'http://api.knora.org/ontology/knora-api/v2#isRegionOfValue';

        this._dspApiConnection.v2.res.getResource(regionIri).subscribe(
            (regionRes: ReadResource) => {
                if (regionRes.type === Constants.Region
                    && Array.isArray(regionRes.properties[isRegionOfValueProp])
                    && regionRes.properties[isRegionOfValueProp].length === 1) {

                    const regionOfVal: ReadLinkValue = regionRes.properties[isRegionOfValueProp][0] as ReadLinkValue;

                    if (regionOfVal.linkedResource !== undefined) {
                        const pageIri = regionOfVal.linkedResource.id;
                        const page = regionOfVal.linkedResource.type;

                        // refer directly to page template, indicating the active region
                        this._router.navigateByUrl('page/' + encodeURIComponent(pageIri) + '/' + encodeURIComponent(regionRes.id));
                    } else {
                        console.error(`Could not route region ${regionIri} to page`);
                    }
                } else {
                    console.error(`Could not route region ${regionIri} to page`);
                }
            }
        );
    }

    /**
     * Generates a Gravsearch query that gets the given region's geometry value and the file value of the image it points to.
     *
     * @param regionIri the Iri of the region whose geometry and related file value should be retrieved.
     * @return Gravsearch string.
     */
    private getRegionDimensionsAndPageQuery(regionIri: string): string {

        const regionDimsTemplate = `
    PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>

    CONSTRUCT {
       ?region knora-api:isMainResource true .

       ?region knora-api:hasGeometry ?geometry .

       ?region knora-api:isRegionOf ?page .

       ?page knora-api:hasStillImageFile ?file .

    } WHERE {
       BIND(<${regionIri}> AS ?region)

 	   ?region knora-api:hasGeometry ?geometry .

       ?region knora-api:isRegionOf ?page .

       ?page knora-api:hasStillImageFile ?file .

    } OFFSET 0
        `;

        return regionDimsTemplate;
    }

    /**
     * Searches for the given region's geometry value and related file value.
     *
     * @param regionIri the Iri of the region whose geometry and related file value should be retrieved.
     * @return the region resource with the geometry value and the related file value.
     */
    getRegionDimsAndFile(regionIri: string): Observable<ApiResponseError | ReadResourceSequence> {

        const gravsearch = this.getRegionDimensionsAndPageQuery(regionIri);

        return this._dspApiConnection.v2.search.doExtendedSearch(gravsearch);

    }

    /**
     * Given the title of a letter from BEBB, searches for that letter.
     *
     * @param title the title of the BEBB letter to search for.
     * @returns the Gravsearch query.
     */
    searchForLetterFromBEBB(title: string): string {

        const letterByTitleTemplate = `
        PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {

            ?letter knora-api:isMainResource true .


        } WHERE {

            ?letter a knora-api:Resource .

            ?letter a beol:letter .

            ?letter beol:title ?title .
            beol:title knora-api:objectType <http://www.w3.org/2001/XMLSchema#string> .
            ?title a <http://www.w3.org/2001/XMLSchema#string> .

            FILTER(?title = "${title}"^^<http://www.w3.org/2001/XMLSchema#string>)

        }

        OFFSET 0
        `;

        return letterByTitleTemplate;

    }


    /**
     * Given the gnd number of a person, searches for that person.
     *
     * @param gnd the gnd number of the person.
     * @returns the Gravsearch query.
     */
    searchForPersonWithGND(gnd: string): string {

        const personByGNDTemplate = `
        PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {

            ?person knora-api:isMainResource true .


        } WHERE {

            ?person a knora-api:Resource .

            ?person a beol:person .

            ?person beol:hasIAFIdentifier ?gnd .
            beol:hasIAFIdentifier knora-api:objectType <http://www.w3.org/2001/XMLSchema#string> .
            ?gnd a <http://www.w3.org/2001/XMLSchema#string> .

            FILTER(?gnd = "${gnd}"^^<http://www.w3.org/2001/XMLSchema#string>)

        }

        OFFSET 0
        `;

        return personByGNDTemplate;

    }

    /**
     * Given the Iri of a compound object and the sequence number of the current part, returns the previous and next part.
     *
     * @param compoundIri the Iri of the compound object the current part belongs to.
     * @param currentSeqnum the sequence number of the current part.
     */
    getPreviousAndNextPartOfCompound(compoundIri: string, currentSeqnum: number): string {

        const pageTemplate = `
        PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {

            ?page knora-api:isMainResource true .


        } WHERE {

            ?page knora-api:isPartOf <${compoundIri}> .

            ?page knora-api:seqnum ?seqnum .

            FILTER(?seqnum = ${currentSeqnum - 1} || ?seqnum = ${currentSeqnum + 1})

        }

        ORDER BY ?seqnum
        OFFSET 0

        `;


        return pageTemplate;
    }

    /**
     * Given the Iri of a manuscript, generates a Gravsearch query to get all its entries sortedby sequence number.
     *
     * @param manuscriptIri the Iri of the manuscript.
     * @param offset the offset to be used.
     */
    getEntriesForManuscript(manuscriptIri: string, offset: number = 0): string {

        const manuscriptEntriesTemplate = `
        PREFIX beol: <${this._appInitService.config['ontologyIRI']}/ontology/0801/beol/simple/v2#>
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
        CONSTRUCT {

            ?entry knora-api:isMainResource true .

        } WHERE {

            ?entry beol:manuscriptEntryOf <${manuscriptIri}> .

            ?entry beol:seqnum ?seqnum .

        }

        ORDER BY ?seqnum

        `;

        // offset component of the Gravsearch query
        const offsetTemplate = `
        OFFSET ${offset}
        `;

        // function that generates the same Gravsearch query with the given offset
        const generateGravsearchWithCustomOffset = (localOffset: number): string => {
            const offsetCustomTemplate = `
            OFFSET ${localOffset}
            `;

            return manuscriptEntriesTemplate + offsetCustomTemplate;
        };

        if (offset === 0) {
            // store the function so another Gravsearch query can be created with an increased offset
            this._searchParamsService.changeSearchParamsMsg(new AdvancedSearchParams(generateGravsearchWithCustomOffset));
        }
        return manuscriptEntriesTemplate + offsetTemplate;

    }

    /**
     * Chooses the apt route to display a resource, depending on its type.
     *
     * @param referredResourceType the type of the referred resource.
     * @param referredResourceIri the Iri of the referred resource.
     * @param resource the referred resource.
     */
    routeByResourceType(referredResourceType: string, referredResourceIri: string, resource: ReadResource): void {

        if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#person') {
            // route to person template
            this._router.navigateByUrl('person/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#Publisher') {
            // route to publisher template
            this._router.navigateByUrl('publisher/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#letter') {
            // route to letter template
            this._router.navigateByUrl('letter/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/newton/v2#letter') {
            this._router.navigateByUrl('newtonLetter/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/leibniz/v2#letter') {
            this._router.navigateByUrl('leibnizLetter/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#endnote') {
            // route to letter template
            this._router.navigateByUrl('endnote/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#figure') {
            // route to letter template
            this._router.navigateByUrl('figure/' + encodeURIComponent(referredResourceIri));
        } else if (
            referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#Book' ||
            referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#EditedBook' ||
            referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#CollectionArticle' ||
            referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#Collection' ||
            referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#Journal' ||
            referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#JournalArticle') {
            // route to biblio-items template
            this._router.navigateByUrl('biblio/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#page') {
            this._router.navigateByUrl('page/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === 'http://api.knora.org/ontology/knora-api/v2#Region') {
            // route region to page it belongs to
            this.routeToPageWithActiveRegion(referredResourceIri);
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#transcription') {
            this._router.navigateByUrl('transcription/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#entryComment') {
            this._router.navigateByUrl('entryComment/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#manuscriptEntry') {
            this._router.navigateByUrl('manuscriptEntry/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/biblio/v2#letter') {
            this._router.navigateByUrl('publishedLetter/' + encodeURIComponent(referredResourceIri));
        } else if (referredResourceType === this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#section') {
            const beolIdPropMaybe = resource.properties[this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#beolIDs'];
            // check if BEOL prop exists
            if (Array.isArray(beolIdPropMaybe) && beolIdPropMaybe.length > 0) {
                const sectionID = beolIdPropMaybe[0].strval;
                if (sectionID.startsWith('goldbach')) {
                    this._router.navigateByUrl('introduction/leoo/' + sectionID);
                } else if (sectionID.startsWith('CondorcetTurgot') || sectionID.startsWith('condorcet') || sectionID.startsWith('CondorcetMJA')
                    || sectionID.startsWith('Turgot')
                ) {
                    this._router.navigateByUrl('introduction/lece/' + sectionID);
                } else {
                    this._router.navigateByUrl('simpleResource/' + encodeURIComponent(referredResourceIri));
                }
            } else {
                // route to generic template
                this._router.navigateByUrl('simpleResource/' + encodeURIComponent(referredResourceIri));
            }
        } else {
            // route to generic template
            this._router.navigateByUrl('simpleResource/' + encodeURIComponent(referredResourceIri));
        }

    }
}
