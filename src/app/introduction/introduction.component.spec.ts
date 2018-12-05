import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../material-module';
import { environment } from '../../environments/environment';
import { KuiActionModule } from '@knora/action';
import { KuiCoreModule } from '@knora/core';
import { KuiSearchModule } from '@knora/search';
import { IntroductionComponent } from './introduction.component';
import { ReadTextValueAsHtmlComponent } from '../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../properties/read-list-value/read-list-value.component';
import { of } from 'rxjs';
import { BeolService } from '../services/beol.service';
import { ActivatedRoute } from '@angular/router';
import { AppConfig } from '../app.config';
import { MathJaxDirective } from '../directives/mathjax.directive';

describe('IntroductionComponent', () => {
    let component: IntroductionComponent;
    let fixture: ComponentFixture<IntroductionComponent>;
    const project = 'leooIV';
    const id = 'goldbach_introduction_1';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                KuiActionModule,
                KuiCoreModule.forRoot({
                    name: environment.appName,
                    api: environment.api,
                    media: environment.media,
                    app: environment.app,
                }),
                KuiSearchModule,
                MaterialModule,
                RouterTestingModule],
            declarations: [
                IntroductionComponent,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
                MathJaxDirective
            ],
            providers: [
                BeolService,
                AppConfig,
                {
                    provide: ActivatedRoute,
                    useValue: {params: of({project, id})}
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
