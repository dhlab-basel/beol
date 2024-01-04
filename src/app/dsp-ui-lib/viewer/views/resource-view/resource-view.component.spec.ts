import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import {
    Constants,
    DeleteValue,
    MockResource,
    PropertyDefinition,
    ReadIntValue,
    ReadLinkValue,
    ReadResource,
    ReadResourceSequence,
    ReadTextValueAsString,
    ReadTextValueAsXml,
    ResourcesEndpointV2,
    SearchEndpointV2
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { DspApiConnectionToken } from '../../../core/core.module';
import { EmitEvent, Events, ValueOperationEventService } from '../../services/value-operation-event.service';
import { PropertyInfoValues, ResourceViewComponent } from './resource-view.component';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Test host component to simulate child component, here property-view.
 */
@Component({
selector: `dsp-property-view`,
template: ``
})
class TestPropertyViewComponent implements OnInit {

    @Input() parentResource: ReadResource;
    @Input() propArray: PropertyInfoValues;
    @Input() systemPropArray: PropertyDefinition;
    @Input() showAllProps: boolean;

    @Output() referredResourceClicked: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

    @Output() referredResourceHovered: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

    ngOnInit() { }
}

/**
 * Test host component to simulate resource-view component.
 */
@Component({
template: `
    <dsp-resource-view #resView [iri]="resourceIri" (referredResourceClicked)="internalLinkClicked($event)"
                       (referredResourceHovered)="internalLinkHovered($event)"></dsp-resource-view>`
})
class TestParentComponent implements OnInit, OnDestroy {

    @ViewChild('resView') resourceViewComponent: ResourceViewComponent;

    resourceIri = 'http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw';

    voeSubscriptions: Subscription[] = [];

    myNum = 0;

    linkValClicked: ReadLinkValue;

    linkValHovered: ReadLinkValue;

    constructor(public _valueOperationEventService: ValueOperationEventService) { }

    ngOnInit() {
        this.voeSubscriptions.push(this._valueOperationEventService.on(Events.ValueAdded, () => this.myNum = 1));
        this.voeSubscriptions.push(this._valueOperationEventService.on(Events.ValueUpdated, () => this.myNum = 2));
        this.voeSubscriptions.push(this._valueOperationEventService.on(Events.ValueDeleted, () => this.myNum = 3));
    }

    internalLinkClicked(linkVal: ReadLinkValue) {
        this.linkValClicked = linkVal;
    }

    internalLinkHovered(linkVal: ReadLinkValue) {
        this.linkValHovered = linkVal;
    }


    ngOnDestroy() {
        if (this.voeSubscriptions) {
            this.voeSubscriptions.forEach(sub => sub.unsubscribe());
        }
    }
}

@Component({selector: 'dsp-property-toolbar', template: ''})
class MockDspPropertyToolbarComponent {
    @Input() resource: ReadResource;
    @Input() showAllProps: boolean;
}

describe('ResourceViewComponent', () => {
    let testHostComponent: TestParentComponent;
    let testHostFixture: ComponentFixture<TestParentComponent>;
    let hostCompDe;
    let resourceComponentDe;
    let voeService: ValueOperationEventService;

    beforeEach(waitForAsync(() => {

        const spyObj = {
            v2: {
                res: jasmine.createSpyObj('res', ['getResource']),
                search: jasmine.createSpyObj('search', ['doExtendedSearch'])
            }
        };

        TestBed.configureTestingModule({
        declarations: [
            ResourceViewComponent,
            TestParentComponent,
            TestPropertyViewComponent,
            MockDspPropertyToolbarComponent
        ],
        imports: [
            MatIconModule,
            MatSnackBarModule,
            MatDividerModule
        ],
        providers: [
            {
                provide: DspApiConnectionToken,
                useValue: spyObj
            },
            ValueOperationEventService
        ]
        })
        .compileComponents();

        voeService = TestBed.inject(ValueOperationEventService);
    }));

    beforeEach(() => {
        const resSpy = TestBed.inject(DspApiConnectionToken);

        (resSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.callFake(
            (id: string) => {

                return MockResource.getTestThing().pipe(
                    map(
                        (res: ReadResource) => {
                            res.id = id;
                            return res;
                        }
                    ));
            }
        );

        testHostFixture = TestBed.createComponent(TestParentComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        hostCompDe = testHostFixture.debugElement;
        resourceComponentDe = hostCompDe.query(By.directive(ResourceViewComponent));

        expect(testHostComponent).toBeTruthy();
    });


    it('should get a resource', () => {

        const resSpy = TestBed.inject(DspApiConnectionToken);

        expect(resSpy.v2.res.getResource).toHaveBeenCalledTimes(1);
        expect(resSpy.v2.res.getResource).toHaveBeenCalledWith(testHostComponent.resourceIri);
    });

    it('should propagate a click event on a link value', () => {

        const displayEdit = testHostFixture.debugElement.query(By.directive(TestPropertyViewComponent));

        const linkVal = new ReadLinkValue();
        linkVal.linkedResourceIri = 'testIri';

        expect(testHostComponent.linkValClicked).toBeUndefined();

        (displayEdit.componentInstance as TestPropertyViewComponent).referredResourceClicked.emit(linkVal);

        expect(testHostComponent.linkValClicked.linkedResourceIri).toEqual('testIri');

    });

    it('should propagate a hover event on a link value', () => {

        const displayEdit = testHostFixture.debugElement.query(By.directive(TestPropertyViewComponent));

        const linkVal = new ReadLinkValue();
        linkVal.linkedResourceIri = 'testIri';

        expect(testHostComponent.linkValHovered).toBeUndefined();

        (displayEdit.componentInstance as TestPropertyViewComponent).referredResourceHovered.emit(linkVal);

        expect(testHostComponent.linkValHovered.linkedResourceIri).toEqual('testIri');

    });

    it('should trigger the correct callback when an event is emitted', () => {

        expect(testHostComponent.myNum).toEqual(0);

        voeService.emit(new EmitEvent(Events.ValueAdded));

        expect(testHostComponent.myNum).toEqual(1);

        voeService.emit(new EmitEvent(Events.ValueUpdated));

        expect(testHostComponent.myNum).toEqual(2);

        voeService.emit(new EmitEvent(Events.ValueDeleted));

        expect(testHostComponent.myNum).toEqual(3);
    });

    it('should unsubscribe from changes when destroyed', () => {
        testHostComponent.voeSubscriptions.forEach(sub => {
            expect(sub.closed).toBe(false);
        });

        testHostFixture.destroy();

        testHostComponent.voeSubscriptions.forEach(sub => {
            expect(sub.closed).toBe(true);
        });
    });

    it('should add a value to a property of a resource', () => {
        const newReadIntValue = new ReadIntValue();

        newReadIntValue.int = 123;
        newReadIntValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger';

        testHostComponent.resourceViewComponent.addValueToResource(newReadIntValue);

        const propArrayIntValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === newReadIntValue.property
        );

        expect(propArrayIntValues[0].values.length).toEqual(2);

        expect((propArrayIntValues[0].values[1] as ReadIntValue).int).toEqual(123);

    });

    it('should add an XML text value to a property of a resource updating the standoff link value', () => {

        const resSpy = TestBed.inject(DspApiConnectionToken);

        // once the XML text value is added, there will be a standoff link val
        (resSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.callFake(
            (query: string) => {

                return MockResource.getTestThing().pipe(
                    map(
                        res => {

                            const linkVal = res.getValuesAs('http://0.0.0.0:3333/ontology/0001/anything/v2#hasOtherThingValue', ReadLinkValue);

                            linkVal[0].property = Constants.HasStandoffLinkToValue;
                            linkVal[0].linkedResourceIri = 'testId';

                            res.properties[Constants.HasStandoffLinkToValue] = linkVal;

                            return new ReadResourceSequence([res]);
                        }
                    )
                );

            }
        );

        const newReadXmlValue = new ReadTextValueAsXml();

        newReadXmlValue.xml = '<?xml version="1.0" encoding="UTF-8"?>\n<text><p><a href="testId" class="salsah-link">test-link</a></p></text>';
        newReadXmlValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasRichtext';

        const propArrayXmlValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === newReadXmlValue.property
        );

        const propArrStandoffLinkValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === Constants.HasStandoffLinkToValue
        );

        expect(propArrayXmlValues[0].values.length).toEqual(1);

        expect(propArrStandoffLinkValues[0].values.length).toEqual(0);

        testHostComponent.resourceViewComponent.addValueToResource(newReadXmlValue);

        expect(propArrayXmlValues[0].values.length).toEqual(2);

        expect((propArrayXmlValues[0].values[1] as ReadTextValueAsXml).xml).toEqual('<?xml version="1.0" encoding="UTF-8"?>\n<text><p><a href="testId" class="salsah-link">test-link</a></p></text>');

        expect(propArrStandoffLinkValues[0].values.length).toEqual(1);

        expect((propArrStandoffLinkValues[0].values[0] as ReadLinkValue).linkedResourceIri).toEqual('testId');

        expect(resSpy.v2.search.doExtendedSearch).toHaveBeenCalledTimes(1);

        const expectedQuery = `
 PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
 CONSTRUCT {
     ?res knora-api:isMainResource true .
     ?res knora-api:hasStandoffLinkTo ?target .
 } WHERE {
     BIND(<http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw> as ?res) .
     OPTIONAL {
         ?res knora-api:hasStandoffLinkTo ?target .
     }
 }
 OFFSET 0
 `;

        expect(resSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith(expectedQuery);
    });

    it('should delete an int value from a property of a resource', () => {
        // add new value to be deleted (so that I can ensure the id will be what I expect)
        const newReadIntValue = new ReadIntValue();

        newReadIntValue.id = 'myNewReadIntId';
        newReadIntValue.int = 123;
        newReadIntValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger';

        testHostComponent.resourceViewComponent.addValueToResource(newReadIntValue);

        // delete the value
        const valueToBeDeleted = new DeleteValue();

        valueToBeDeleted.id = 'myNewReadIntId';
        valueToBeDeleted.type = 'http://api.knora.org/ontology/knora-api/v2#IntValue';

        testHostComponent.resourceViewComponent.deleteValueFromResource(valueToBeDeleted);

        const propArrayIntValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.objectType === valueToBeDeleted.type
        );

        // expect there to be one value left after deleting the newly created value
        expect(propArrayIntValues[0].values.length).toEqual(1);

    });

    it('should delete a text value from a property of a resource', () => {
        // add new value to be deleted (so that I can ensure the id will be what I expect)
        const newReadTextValueAsString = new ReadTextValueAsString();

        newReadTextValueAsString.id = 'myNewReadTextValueAsStringId';
        newReadTextValueAsString.text = 'my text';
        newReadTextValueAsString.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasText';

        testHostComponent.resourceViewComponent.addValueToResource(newReadTextValueAsString);

        // delete the value
        const valueToBeDeleted = new DeleteValue();

        valueToBeDeleted.id = 'myNewReadTextValueAsStringId';
        valueToBeDeleted.type = 'http://api.knora.org/ontology/knora-api/v2#TextValue';

        testHostComponent.resourceViewComponent.deleteValueFromResource(valueToBeDeleted);

        const propArrayIntValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.objectType === valueToBeDeleted.type
        );

        // expect there to be one value left after deleting the newly created value
        expect(propArrayIntValues[0].values.length).toEqual(1);

    });

    it('should delete an XML text value linking to a resource from a property of a resource', () => {

        const resSpy = TestBed.inject(DspApiConnectionToken);

        // once the XML text value is deleted, there is no more standoff link value
        (resSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.callFake(
            (query: string) => {

                return MockResource.getTestThing().pipe(
                    map(
                        res => {
                            // no standoff link link value exists anymore
                            return new ReadResourceSequence([res]);
                        }
                    )
                );

            }
        );

        // add new value to be deleted (so that I can ensure the id will be what I expect)
        const readTextValueAsXml = new ReadTextValueAsXml();

        readTextValueAsXml.id = 'myNewReadTextValueAsXmlId';
        readTextValueAsXml.xml = '<?xml version="1.0" encoding="UTF-8"?><text><p><a href="testId" class="salsah-link">test-link</a></p></text>';
        readTextValueAsXml.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasRichtext';

        const existingXmlVal = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfo => propInfo.propDef.id === 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasRichtext'
        );

        const existingStandoffLinkVal = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfo => propInfo.propDef.id === Constants.HasStandoffLinkToValue
        );

        // add value
        existingXmlVal[0].values.push(readTextValueAsXml);

        const standoffLinkVal = new ReadLinkValue();

        standoffLinkVal.linkedResourceIri = 'testId';
        standoffLinkVal.property = Constants.HasStandoffLinkToValue;

        // add corresponding link val
        existingStandoffLinkVal[0].values.push(standoffLinkVal);

        expect(existingXmlVal[0].values.length).toEqual(2);
        expect(existingStandoffLinkVal[0].values.length).toEqual(1);

        // delete the value
        // after that, there won't be any standoff link value
        const valueToBeDeleted = new DeleteValue();

        valueToBeDeleted.id = 'myNewReadTextValueAsXmlId';
        valueToBeDeleted.type = 'http://api.knora.org/ontology/knora-api/v2#TextValue';

        testHostComponent.resourceViewComponent.deleteValueFromResource(valueToBeDeleted);

        expect(existingXmlVal[0].values.length).toEqual(1);
        expect(existingXmlVal[0].values[0].id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw/values/rvB4eQ5MTF-Qxq0YgkwaDg');

        expect(existingStandoffLinkVal.values.length).toEqual(0);

        expect(resSpy.v2.search.doExtendedSearch).toHaveBeenCalledTimes(1);

        const expectedQuery = `
 PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
 CONSTRUCT {
     ?res knora-api:isMainResource true .
     ?res knora-api:hasStandoffLinkTo ?target .
 } WHERE {
     BIND(<http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw> as ?res) .
     OPTIONAL {
         ?res knora-api:hasStandoffLinkTo ?target .
     }
 }
 OFFSET 0
 `;

        expect(resSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith(expectedQuery);

    });

    it('should update a value of a property of a resource', () => {
        const newReadIntValue = new ReadIntValue();

        newReadIntValue.id = 'myNewReadIntId';
        newReadIntValue.int = 123;
        newReadIntValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger';

        testHostComponent.resourceViewComponent.addValueToResource(newReadIntValue);

        let propArrayIntValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === newReadIntValue.property
        );

        expect(propArrayIntValues[0].values.length).toEqual(2);

        expect((propArrayIntValues[0].values[1] as ReadIntValue).int).toEqual(123);

        const updateReadIntValue = new ReadIntValue();

        updateReadIntValue.int = 321;
        updateReadIntValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger';

        testHostComponent.resourceViewComponent.updateValueInResource(newReadIntValue, updateReadIntValue);

        propArrayIntValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === updateReadIntValue.property
        );

        expect(propArrayIntValues[0].values.length).toEqual(2);

        expect((propArrayIntValues[0].values[1] as ReadIntValue).int).toEqual(321);
    });

    it('should update an XMl text value of a property of a resource so it links to another resource', () => {

        const resSpy = TestBed.inject(DspApiConnectionToken);

        // once the XML text value is updated, there will be a standoff link value
        (resSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.callFake(
            (query: string) => {

                return MockResource.getTestThing().pipe(
                    map(
                        res => {

                            const linkVal = res.getValuesAs('http://0.0.0.0:3333/ontology/0001/anything/v2#hasOtherThingValue', ReadLinkValue);

                            linkVal[0].linkedResourceIri = 'testId';
                            linkVal[0].property = Constants.HasStandoffLinkToValue;

                            res.properties[Constants.HasStandoffLinkToValue] = linkVal;

                            return new ReadResourceSequence([res]);
                        }
                    )
                );

            }
        );

        const newReadXmlValue = new ReadTextValueAsXml();

        newReadXmlValue.id = 'myNewReadXmlId';
        newReadXmlValue.xml = '<?xml version="1.0" encoding="UTF-8"?><text><p>test</p></text>';
        newReadXmlValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasRichtext';

        const propArrayXmlValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === newReadXmlValue.property
        );

        const propArrStandoffLinkValues = testHostComponent.resourceViewComponent.resPropInfoVals.filter(
            propInfoValueArray => propInfoValueArray.propDef.id === Constants.HasStandoffLinkToValue
        );

        propArrayXmlValues[0].values.push(newReadXmlValue);

        expect(propArrayXmlValues[0].values.length).toEqual(2);

        expect((propArrayXmlValues[0].values[1] as ReadTextValueAsXml).xml).toEqual('<?xml version="1.0" encoding="UTF-8"?><text><p>test</p></text>');

        expect(propArrStandoffLinkValues[0].values.length).toEqual(0);

        const updateReadXmlValue = new ReadTextValueAsXml();

        updateReadXmlValue.xml = '<?xml version="1.0" encoding="UTF-8"?><text><p><a href="testId" class="salsah-link">test-link</a></p></text>';
        updateReadXmlValue.property = 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasInteger';

        testHostComponent.resourceViewComponent.updateValueInResource(newReadXmlValue, updateReadXmlValue);

        expect(propArrayXmlValues[0].values.length).toEqual(2);

        expect((propArrayXmlValues[0].values[1] as ReadTextValueAsXml).xml).toEqual('<?xml version="1.0" encoding="UTF-8"?><text><p><a href="testId" class="salsah-link">test-link</a></p></text>');

        expect(propArrStandoffLinkValues[0].values.length).toEqual(1);

        expect((propArrStandoffLinkValues[0].values[0] as ReadLinkValue).linkedResourceIri).toEqual('testId');

        expect(resSpy.v2.search.doExtendedSearch).toHaveBeenCalledTimes(1);

        const expectedQuery = `
 PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
 CONSTRUCT {
     ?res knora-api:isMainResource true .
     ?res knora-api:hasStandoffLinkTo ?target .
 } WHERE {
     BIND(<http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw> as ?res) .
     OPTIONAL {
         ?res knora-api:hasStandoffLinkTo ?target .
     }
 }
 OFFSET 0
 `;

        expect(resSpy.v2.search.doExtendedSearch).toHaveBeenCalledWith(expectedQuery);
    });

    // TODO: currently not possible to test copy to clipboard from Material Angular
    // https://stackoverflow.com/questions/60337742/test-copy-to-clipboard-function

});
