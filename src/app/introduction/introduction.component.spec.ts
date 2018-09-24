import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../material-module';
import { environment } from '../../environments/environment';
import { KuiActionModule } from '@knora/action';
import { KuiCoreModule } from '@knora/core';
import { KuiSearchModule } from '@knora/search';
import { IntroductionComponent } from './introduction.component';
import { ReadLinkValueComponent } from '../properties/read-link-value/read-link-value.component';
import { ReadTextValueAsHtmlComponent } from '../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadTextValueAsStringComponent } from '../properties/read-text-value-as-string/read-text-value-as-string.component';
import { ReadTextValueAsXmlComponent } from '../properties/read-text-value-as-xml/read-text-value-as-xml.component';
import { ReadDateValueComponent } from '../properties/read-date-value/read-date-value.component';
import { ReadIntegerValueComponent } from '../properties/read-integer-value/read-integer-value.component';
import { ReadBooleanValueComponent } from '../properties/read-boolean-value/read-boolean-value.component';
import { ReadDecimalValueComponent } from '../properties/read-decimal-value/read-decimal-value.component';
import { ReadUriValueComponent } from '../properties/read-uri-value/read-uri-value.component';
import { ReadIntervalValueComponent } from '../properties/read-interval-value/read-interval-value.component';
import { ReadListValueComponent } from '../properties/read-list-value/read-list-value.component';
import { ReadGeomValueComponent } from '../properties/read-geom-value/read-geom-value.component';
import { ReadColorValueComponent } from '../properties/read-color-value/read-color-value.component';
import { ReadTextfileValueComponent } from '../properties/read-textfile-value/read-textfile-value.component';
import { of } from 'rxjs';

fdescribe('IntroductionComponent', () => {
  let component: IntroductionComponent;
  let fixture: ComponentFixture<IntroductionComponent>;
  const project = 'leoo';
  const id = 'goldbach_introduction_1';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        KuiActionModule,
        KuiCoreModule.forRoot({
          name: environment.name,
          api: environment.api,
          media: environment.media,
          app: environment.app,
        }),
        KuiSearchModule,
        MaterialModule,
        RouterTestingModule],
      declarations: [
        IntroductionComponent,
        ReadLinkValueComponent,
        ReadTextValueAsHtmlComponent,
        ReadTextValueAsStringComponent,
        ReadTextValueAsXmlComponent,
        ReadDateValueComponent,
        ReadIntegerValueComponent,
        ReadBooleanValueComponent,
        ReadDecimalValueComponent,
        ReadUriValueComponent,
        ReadIntervalValueComponent,
        ReadListValueComponent,
        ReadGeomValueComponent,
        ReadColorValueComponent,
        ReadTextfileValueComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ project }), of({ id }) }
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });
});
