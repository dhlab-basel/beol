
import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularSplitModule } from 'angular-split';
import { MultipleResourcesViewComponent } from './multiple-resources-view.component';

/**
 * Test host component to simulate child component, here resource-view.
 */
 @Component({
  selector: `dsp-resource-view`,
  template: ``
  })
  class TestResourceViewComponent {
      @Input() iri: string;
      @Input() showToolbar: boolean;
  }

/**
 * Test host component to simulate parent component.
 */
@Component({
  selector: `dsp-multiple-resources-host-component`,
  template: `
    <dsp-multiple-resources-view #multipleResourcesView [noOfResources]="noOfResources" [resourceIds]="resourceIds">
    </dsp-multiple-resources-view>
    `
})
class TestHostMultipleResourcesComponent {

  @ViewChild('multipleResourcesView') multipleResourcesView: MultipleResourcesViewComponent;

  resourceIds = [
    'http://rdfh.ch/0803/18a671b8a601',
    'http://rdfh.ch/0803/7e4cfc5417',
    'http://rdfh.ch/0803/6ad3e2c47501',
    'http://rdfh.ch/0803/009e225a5f01',
    'http://rdfh.ch/0803/00ed33070f02'
  ];
  noOfResources = this.resourceIds.length;
}

describe('MultipleResourcesViewComponent', () => {

  let testHostComponent: TestHostMultipleResourcesComponent
  let testHostFixture: ComponentFixture<TestHostMultipleResourcesComponent>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [
        MultipleResourcesViewComponent,
        TestHostMultipleResourcesComponent,
        TestResourceViewComponent
      ],
      imports: [AngularSplitModule]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(TestHostMultipleResourcesComponent);
    testHostComponent = testHostFixture.componentInstance;
    testHostFixture.detectChanges();
  });

  it('should create', () => {
    expect(testHostComponent.multipleResourcesView).toBeTruthy();
  });

  it('expect top row with 2 resources', () => {
    expect(testHostComponent.multipleResourcesView.topRow.length).toEqual(2);
  });

  it('expect bottom row with 3 resources', () => {
    expect(testHostComponent.multipleResourcesView.bottomRow.length).toEqual(3);
  });

});
