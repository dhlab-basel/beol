import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { SearchService } from './search.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "../../core.module";
import * as i3 from "./ontology-cache.service";
/**
 * Requests incoming information (regions, links, stillImageRepresentations) from Knora.
 */
var IncomingService = /** @class */ (function (_super) {
    tslib_1.__extends(IncomingService, _super);
    function IncomingService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
    * Returns all incoming regions for a particular resource.
    *
    * @param {string} resourceIRI the Iri of the resource whose Incoming regions should be returned.
    * @param {number} offset the offset to be used for paging. 0 is the default and is used to get the first page of results.
    * @returns {Observable<any>}
    */
    IncomingService.prototype.getIncomingRegions = function (resourceIRI, offset) {
        var sparqlQueryStr = "\nPREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>\n\nCONSTRUCT {\n?region knora-api:isMainResource true .\n\n?region knora-api:hasGeometry ?geom .\n\n?region knora-api:hasComment ?comment .\n\n?region knora-api:hasColor ?color .\n} WHERE {\n?region a knora-api:Region .\n?region a knora-api:Resource .\n\n?region knora-api:isRegionOf <" + resourceIRI + "> .\nknora-api:isRegionOf knora-api:objectType knora-api:Resource .\n\n<" + resourceIRI + "> a knora-api:Resource .\n\n?region knora-api:hasGeometry ?geom .\nknora-api:hasGeometry knora-api:objectType knora-api:Geom .\n\n?geom a knora-api:Geom .\n\n?region knora-api:hasComment ?comment .\nknora-api:hasComment knora-api:objectType xsd:string .\n\n?comment a xsd:string .\n\n?region knora-api:hasColor ?color .\nknora-api:hasColor knora-api:objectType knora-api:Color .\n\n?color a knora-api:Color .\n} OFFSET " + offset + "\n";
        // console.log('sparqlQueryStr ', sparqlQueryStr);
        return this.doExtendedSearchReadResourceSequence(sparqlQueryStr);
    };
    /**
     * Returns all the StillImageRepresentations for the given resource, if any.
     * StillImageRepresentations link to the given resource via knora-base:isPartOf.
     *
     * @param {string} resourceIri the Iri of the resource whose StillImageRepresentations should be returned.
     * @param {number} offset the offset to be used for paging. 0 is the default and is used to get the first page of results.
     * @returns {Observable<any>}
     */
    IncomingService.prototype.getStillImageRepresentationsForCompoundResource = function (resourceIri, offset) {
        var sparqlQueryStr = "\nPREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>\n\nCONSTRUCT {\n?page knora-api:isMainResource true .\n\n?page knora-api:seqnum ?seqnum .\n\n?page knora-api:hasStillImageFile ?file .\n} WHERE {\n\n?page a knora-api:StillImageRepresentation .\n?page a knora-api:Resource .\n\n?page knora-api:isPartOf <" + resourceIri + "> .\nknora-api:isPartOf knora-api:objectType knora-api:Resource .\n\n<" + resourceIri + "> a knora-api:Resource .\n\n?page knora-api:seqnum ?seqnum .\nknora-api:seqnum knora-api:objectType xsd:integer .\n\n?seqnum a xsd:integer .\n\n?page knora-api:hasStillImageFile ?file .\nknora-api:hasStillImageFile knora-api:objectType knora-api:File .\n\n?file a knora-api:File .\n\n} ORDER BY ?seqnum\nOFFSET " + offset + "\n";
        return this.doExtendedSearchReadResourceSequence(sparqlQueryStr);
    };
    /**
     * Returns all incoming links for the given resource Iri but incoming regions and still image representations.
     *
     * @param {string} resourceIri the Iri of the resource whose incoming links should be returned.
     * @param {number} offset the offset to be used for paging. 0 is the default and is used to get the first page of results.
     * @returns {Observable<any>}
     */
    IncomingService.prototype.getIncomingLinksForResource = function (resourceIri, offset) {
        var sparqlQueryStr = "\nPREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>\n\nCONSTRUCT {\n?incomingRes knora-api:isMainResource true .\n\n?incomingRes ?incomingProp <" + resourceIri + "> .\n\n} WHERE {\n\n?incomingRes a knora-api:Resource .\n\n?incomingRes ?incomingProp <" + resourceIri + "> .\n\n<" + resourceIri + "> a knora-api:Resource .\n\n?incomingProp knora-api:objectType knora-api:Resource .\n\nknora-api:isRegionOf knora-api:objectType knora-api:Resource .\nknora-api:isPartOf knora-api:objectType knora-api:Resource .\n\nFILTER NOT EXISTS {\n ?incomingRes  knora-api:isRegionOf <" + resourceIri + "> .\n}\n\nFILTER NOT EXISTS {\n ?incomingRes  knora-api:isPartOf <" + resourceIri + "> .\n}\n\n} OFFSET " + offset + "\n";
        return this.doExtendedSearchReadResourceSequence(sparqlQueryStr);
    };
    IncomingService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root',
                },] },
    ];
    IncomingService.ngInjectableDef = i0.defineInjectable({ factory: function IncomingService_Factory() { return new IncomingService(i0.inject(i1.HttpClient), i0.inject(i2.KuiCoreConfigToken), i0.inject(i3.OntologyCacheService)); }, token: IncomingService, providedIn: "root" });
    return IncomingService;
}(SearchService));
export { IncomingService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jb21pbmcuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Brbm9yYS9jb3JlLyIsInNvdXJjZXMiOlsibGliL3NlcnZpY2VzL3YyL2luY29taW5nLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7OztBQUdqRDs7R0FFRztBQUNIO0lBR3FDLDJDQUFhO0lBSGxEOztLQStJQztJQTFJRzs7Ozs7O01BTUU7SUFDRiw0Q0FBa0IsR0FBbEIsVUFBbUIsV0FBbUIsRUFBRSxNQUFjO1FBQ2xELElBQU0sY0FBYyxHQUFHLDJXQWVDLFdBQVcsZ0ZBR3hDLFdBQVcsMmFBZ0JILE1BQU0sT0FDaEIsQ0FBQztRQUNNLGtEQUFrRDtRQUNsRCxPQUFPLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILHlFQUErQyxHQUEvQyxVQUFnRCxXQUFtQixFQUFFLE1BQWM7UUFDL0UsSUFBTSxjQUFjLEdBQUcsMlVBY0gsV0FBVyw4RUFHcEMsV0FBVywrVEFhTCxNQUFNLE9BQ2QsQ0FBQztRQUVNLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRXJFLENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSCxxREFBMkIsR0FBM0IsVUFBNEIsV0FBbUIsRUFBRSxNQUFjO1FBQzNELElBQU0sY0FBYyxHQUFHLDBLQU1ELFdBQVcsK0ZBTVgsV0FBVyxnQkFFdEMsV0FBVyx5UkFReUIsV0FBVywwRUFJYixXQUFXLDJCQUdyQyxNQUFNLE9BQ2hCLENBQUM7UUFFTSxPQUFPLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyRSxDQUFDOztnQkE3SUosVUFBVSxTQUFDO29CQUNSLFVBQVUsRUFBRSxNQUFNO2lCQUNyQjs7OzBCQVZEO0NBdUpDLEFBL0lELENBR3FDLGFBQWEsR0E0SWpEO1NBNUlZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBTZWFyY2hTZXJ2aWNlIH0gZnJvbSAnLi9zZWFyY2guc2VydmljZSc7XG5pbXBvcnQgeyBSZWFkUmVzb3VyY2VzU2VxdWVuY2UgfSBmcm9tICcuLi8uLi9kZWNsYXJhdGlvbnMnO1xuXG4vKipcbiAqIFJlcXVlc3RzIGluY29taW5nIGluZm9ybWF0aW9uIChyZWdpb25zLCBsaW5rcywgc3RpbGxJbWFnZVJlcHJlc2VudGF0aW9ucykgZnJvbSBLbm9yYS5cbiAqL1xuQEluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgSW5jb21pbmdTZXJ2aWNlIGV4dGVuZHMgU2VhcmNoU2VydmljZSB7XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgYWxsIGluY29taW5nIHJlZ2lvbnMgZm9yIGEgcGFydGljdWxhciByZXNvdXJjZS5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzb3VyY2VJUkkgdGhlIElyaSBvZiB0aGUgcmVzb3VyY2Ugd2hvc2UgSW5jb21pbmcgcmVnaW9ucyBzaG91bGQgYmUgcmV0dXJuZWQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gb2Zmc2V0IHRoZSBvZmZzZXQgdG8gYmUgdXNlZCBmb3IgcGFnaW5nLiAwIGlzIHRoZSBkZWZhdWx0IGFuZCBpcyB1c2VkIHRvIGdldCB0aGUgZmlyc3QgcGFnZSBvZiByZXN1bHRzLlxuICAgICogQHJldHVybnMge09ic2VydmFibGU8YW55Pn1cbiAgICAqL1xuICAgIGdldEluY29taW5nUmVnaW9ucyhyZXNvdXJjZUlSSTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcik6IE9ic2VydmFibGU8UmVhZFJlc291cmNlc1NlcXVlbmNlPiB7XG4gICAgICAgIGNvbnN0IHNwYXJxbFF1ZXJ5U3RyID0gYFxuUFJFRklYIGtub3JhLWFwaTogPGh0dHA6Ly9hcGkua25vcmEub3JnL29udG9sb2d5L2tub3JhLWFwaS9zaW1wbGUvdjIjPlxuXG5DT05TVFJVQ1Qge1xuP3JlZ2lvbiBrbm9yYS1hcGk6aXNNYWluUmVzb3VyY2UgdHJ1ZSAuXG5cbj9yZWdpb24ga25vcmEtYXBpOmhhc0dlb21ldHJ5ID9nZW9tIC5cblxuP3JlZ2lvbiBrbm9yYS1hcGk6aGFzQ29tbWVudCA/Y29tbWVudCAuXG5cbj9yZWdpb24ga25vcmEtYXBpOmhhc0NvbG9yID9jb2xvciAuXG59IFdIRVJFIHtcbj9yZWdpb24gYSBrbm9yYS1hcGk6UmVnaW9uIC5cbj9yZWdpb24gYSBrbm9yYS1hcGk6UmVzb3VyY2UgLlxuXG4/cmVnaW9uIGtub3JhLWFwaTppc1JlZ2lvbk9mIDwke3Jlc291cmNlSVJJfT4gLlxua25vcmEtYXBpOmlzUmVnaW9uT2Yga25vcmEtYXBpOm9iamVjdFR5cGUga25vcmEtYXBpOlJlc291cmNlIC5cblxuPCR7cmVzb3VyY2VJUkl9PiBhIGtub3JhLWFwaTpSZXNvdXJjZSAuXG5cbj9yZWdpb24ga25vcmEtYXBpOmhhc0dlb21ldHJ5ID9nZW9tIC5cbmtub3JhLWFwaTpoYXNHZW9tZXRyeSBrbm9yYS1hcGk6b2JqZWN0VHlwZSBrbm9yYS1hcGk6R2VvbSAuXG5cbj9nZW9tIGEga25vcmEtYXBpOkdlb20gLlxuXG4/cmVnaW9uIGtub3JhLWFwaTpoYXNDb21tZW50ID9jb21tZW50IC5cbmtub3JhLWFwaTpoYXNDb21tZW50IGtub3JhLWFwaTpvYmplY3RUeXBlIHhzZDpzdHJpbmcgLlxuXG4/Y29tbWVudCBhIHhzZDpzdHJpbmcgLlxuXG4/cmVnaW9uIGtub3JhLWFwaTpoYXNDb2xvciA/Y29sb3IgLlxua25vcmEtYXBpOmhhc0NvbG9yIGtub3JhLWFwaTpvYmplY3RUeXBlIGtub3JhLWFwaTpDb2xvciAuXG5cbj9jb2xvciBhIGtub3JhLWFwaTpDb2xvciAuXG59IE9GRlNFVCAke29mZnNldH1cbmA7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzcGFycWxRdWVyeVN0ciAnLCBzcGFycWxRdWVyeVN0cik7XG4gICAgICAgIHJldHVybiB0aGlzLmRvRXh0ZW5kZWRTZWFyY2hSZWFkUmVzb3VyY2VTZXF1ZW5jZShzcGFycWxRdWVyeVN0cik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbGwgdGhlIFN0aWxsSW1hZ2VSZXByZXNlbnRhdGlvbnMgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSwgaWYgYW55LlxuICAgICAqIFN0aWxsSW1hZ2VSZXByZXNlbnRhdGlvbnMgbGluayB0byB0aGUgZ2l2ZW4gcmVzb3VyY2UgdmlhIGtub3JhLWJhc2U6aXNQYXJ0T2YuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzb3VyY2VJcmkgdGhlIElyaSBvZiB0aGUgcmVzb3VyY2Ugd2hvc2UgU3RpbGxJbWFnZVJlcHJlc2VudGF0aW9ucyBzaG91bGQgYmUgcmV0dXJuZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9mZnNldCB0aGUgb2Zmc2V0IHRvIGJlIHVzZWQgZm9yIHBhZ2luZy4gMCBpcyB0aGUgZGVmYXVsdCBhbmQgaXMgdXNlZCB0byBnZXQgdGhlIGZpcnN0IHBhZ2Ugb2YgcmVzdWx0cy5cbiAgICAgKiBAcmV0dXJucyB7T2JzZXJ2YWJsZTxhbnk+fVxuICAgICAqL1xuICAgIGdldFN0aWxsSW1hZ2VSZXByZXNlbnRhdGlvbnNGb3JDb21wb3VuZFJlc291cmNlKHJlc291cmNlSXJpOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKTogT2JzZXJ2YWJsZTxSZWFkUmVzb3VyY2VzU2VxdWVuY2U+IHtcbiAgICAgICAgY29uc3Qgc3BhcnFsUXVlcnlTdHIgPSBgXG5QUkVGSVgga25vcmEtYXBpOiA8aHR0cDovL2FwaS5rbm9yYS5vcmcvb250b2xvZ3kva25vcmEtYXBpL3NpbXBsZS92MiM+XG5cbkNPTlNUUlVDVCB7XG4/cGFnZSBrbm9yYS1hcGk6aXNNYWluUmVzb3VyY2UgdHJ1ZSAuXG5cbj9wYWdlIGtub3JhLWFwaTpzZXFudW0gP3NlcW51bSAuXG5cbj9wYWdlIGtub3JhLWFwaTpoYXNTdGlsbEltYWdlRmlsZSA/ZmlsZSAuXG59IFdIRVJFIHtcblxuP3BhZ2UgYSBrbm9yYS1hcGk6U3RpbGxJbWFnZVJlcHJlc2VudGF0aW9uIC5cbj9wYWdlIGEga25vcmEtYXBpOlJlc291cmNlIC5cblxuP3BhZ2Uga25vcmEtYXBpOmlzUGFydE9mIDwke3Jlc291cmNlSXJpfT4gLlxua25vcmEtYXBpOmlzUGFydE9mIGtub3JhLWFwaTpvYmplY3RUeXBlIGtub3JhLWFwaTpSZXNvdXJjZSAuXG5cbjwke3Jlc291cmNlSXJpfT4gYSBrbm9yYS1hcGk6UmVzb3VyY2UgLlxuXG4/cGFnZSBrbm9yYS1hcGk6c2VxbnVtID9zZXFudW0gLlxua25vcmEtYXBpOnNlcW51bSBrbm9yYS1hcGk6b2JqZWN0VHlwZSB4c2Q6aW50ZWdlciAuXG5cbj9zZXFudW0gYSB4c2Q6aW50ZWdlciAuXG5cbj9wYWdlIGtub3JhLWFwaTpoYXNTdGlsbEltYWdlRmlsZSA/ZmlsZSAuXG5rbm9yYS1hcGk6aGFzU3RpbGxJbWFnZUZpbGUga25vcmEtYXBpOm9iamVjdFR5cGUga25vcmEtYXBpOkZpbGUgLlxuXG4/ZmlsZSBhIGtub3JhLWFwaTpGaWxlIC5cblxufSBPUkRFUiBCWSA/c2VxbnVtXG5PRkZTRVQgJHtvZmZzZXR9XG5gO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRvRXh0ZW5kZWRTZWFyY2hSZWFkUmVzb3VyY2VTZXF1ZW5jZShzcGFycWxRdWVyeVN0cik7XG5cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIGluY29taW5nIGxpbmtzIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2UgSXJpIGJ1dCBpbmNvbWluZyByZWdpb25zIGFuZCBzdGlsbCBpbWFnZSByZXByZXNlbnRhdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzb3VyY2VJcmkgdGhlIElyaSBvZiB0aGUgcmVzb3VyY2Ugd2hvc2UgaW5jb21pbmcgbGlua3Mgc2hvdWxkIGJlIHJldHVybmVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXQgdGhlIG9mZnNldCB0byBiZSB1c2VkIGZvciBwYWdpbmcuIDAgaXMgdGhlIGRlZmF1bHQgYW5kIGlzIHVzZWQgdG8gZ2V0IHRoZSBmaXJzdCBwYWdlIG9mIHJlc3VsdHMuXG4gICAgICogQHJldHVybnMge09ic2VydmFibGU8YW55Pn1cbiAgICAgKi9cbiAgICBnZXRJbmNvbWluZ0xpbmtzRm9yUmVzb3VyY2UocmVzb3VyY2VJcmk6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpOiBPYnNlcnZhYmxlPFJlYWRSZXNvdXJjZXNTZXF1ZW5jZT4ge1xuICAgICAgICBjb25zdCBzcGFycWxRdWVyeVN0ciA9IGBcblBSRUZJWCBrbm9yYS1hcGk6IDxodHRwOi8vYXBpLmtub3JhLm9yZy9vbnRvbG9neS9rbm9yYS1hcGkvc2ltcGxlL3YyIz5cblxuQ09OU1RSVUNUIHtcbj9pbmNvbWluZ1JlcyBrbm9yYS1hcGk6aXNNYWluUmVzb3VyY2UgdHJ1ZSAuXG5cbj9pbmNvbWluZ1JlcyA/aW5jb21pbmdQcm9wIDwke3Jlc291cmNlSXJpfT4gLlxuXG59IFdIRVJFIHtcblxuP2luY29taW5nUmVzIGEga25vcmEtYXBpOlJlc291cmNlIC5cblxuP2luY29taW5nUmVzID9pbmNvbWluZ1Byb3AgPCR7cmVzb3VyY2VJcml9PiAuXG5cbjwke3Jlc291cmNlSXJpfT4gYSBrbm9yYS1hcGk6UmVzb3VyY2UgLlxuXG4/aW5jb21pbmdQcm9wIGtub3JhLWFwaTpvYmplY3RUeXBlIGtub3JhLWFwaTpSZXNvdXJjZSAuXG5cbmtub3JhLWFwaTppc1JlZ2lvbk9mIGtub3JhLWFwaTpvYmplY3RUeXBlIGtub3JhLWFwaTpSZXNvdXJjZSAuXG5rbm9yYS1hcGk6aXNQYXJ0T2Yga25vcmEtYXBpOm9iamVjdFR5cGUga25vcmEtYXBpOlJlc291cmNlIC5cblxuRklMVEVSIE5PVCBFWElTVFMge1xuID9pbmNvbWluZ1JlcyAga25vcmEtYXBpOmlzUmVnaW9uT2YgPCR7cmVzb3VyY2VJcml9PiAuXG59XG5cbkZJTFRFUiBOT1QgRVhJU1RTIHtcbiA/aW5jb21pbmdSZXMgIGtub3JhLWFwaTppc1BhcnRPZiA8JHtyZXNvdXJjZUlyaX0+IC5cbn1cblxufSBPRkZTRVQgJHtvZmZzZXR9XG5gO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRvRXh0ZW5kZWRTZWFyY2hSZWFkUmVzb3VyY2VTZXF1ZW5jZShzcGFycWxRdWVyeVN0cik7XG4gICAgfVxuXG59XG4iXX0=