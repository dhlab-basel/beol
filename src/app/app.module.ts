// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { environment } from '../environments/environment';
// @dsp-js library
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
// @dsp-ui library
import {
    AppInitService,
    DspApiConfigToken,
    DspApiConnectionToken,
    DspCoreModule
} from './dsp-ui-lib/core';
import { DspSearchModule } from './dsp-ui-lib/search';
import { DspActionModule } from './dsp-ui-lib/action';
import { DspViewerModule } from './dsp-ui-lib/viewer';
// modules from @angular/material and @angular/flex-layout
import { MaterialModule } from './material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRouting } from './app.routing';
// app components
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { ErrorComponent } from './error/error.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { ResourceComponent } from './resource/resource.component';
import { SimpleResourceComponent } from './resource/simpleResource/simpleResource.component';
import { PersonComponent } from './resource/person/person.component';
import { PublisherComponent } from './resource/publisher/publisher.component';
import { LetterComponent } from './resource/letter/letter.component';
import { NewtonLetterComponent } from './resource/newton-letter/newton-letter.component';
import { LeibnizLetterComponent } from './resource/leibniz-letter/leibniz-letter.component';
import { ReadListValueComponent } from './properties/read-list-value/read-list-value.component';
import { ReadTextValueAsHtmlComponent } from './properties/read-text-value-as-html/read-text-value-as-html.component';
import { LeooRouteComponent } from './leoo-route/leoo-route.component';
import { EndnoteComponent } from './resource/endnote/endnote.component';
import { FigureComponent } from './resource/figure/figure.component';
import { BiblioItemsComponent } from './resource/biblio-items/biblio-items.component';
import { PublishedLetterComponent } from './resource/publishedLetter/publishedLetter.component';
// directives
import { MathJaxDirective } from './directives/mathjax.directive';
// Loads the application configuration file during application startup
import { ContactComponent } from './contact/contact.component';

import { ReactiveFormsModule } from '@angular/forms';

import { PageComponent } from './resource/page/page.component';
import { ReadTextValueComponent } from './properties/read-text-value/read-text-value.component';

import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { SanitizeUrlPipe } from './pipes/sanitize-url.pipe';
import { NewtonProjectDirective } from './directives/newton-project.directive';
import { LeibnizPortalDirective } from './directives/leibniz-portal.directive';

import { HanCatalogueDirective } from './directives/han-catalogue.directive';
import { BebbRouteComponent } from './bebb-route/bebb-route.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { TranscriptionComponent } from './resource/transcription/transcription.component';
import { ManuscriptEntryComponent } from './resource/manuscript-entry/manuscript-entry.component';
import { TeiLinkDirective } from './directives/tei-link.directive';
import { CommentComponent } from './resource/comment/comment.component';
import { HttpClientModule } from '@angular/common/http';
import { BiographyComponent } from './biography/biography.component';
import { LeceLeooComponent } from './lece-leoo/lece-leoo.component';
import { ArkUrlDialogComponent } from './dialog/ark-url-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        LandingPageComponent,
        SearchResultsComponent,
        ErrorComponent,
        IntroductionComponent,
        ResourceComponent,
        SimpleResourceComponent,
        PersonComponent,
        PublisherComponent,
        LetterComponent,
        NewtonLetterComponent,
        LeibnizLetterComponent,
        ReadListValueComponent,
        ReadTextValueAsHtmlComponent,
        ContactComponent,
        MathJaxDirective,
        LeooRouteComponent,
        BiblioItemsComponent,
        EndnoteComponent,
        FigureComponent,
        PageComponent,
        ReadTextValueComponent,
        HanCatalogueDirective,
        TranscriptionComponent,
        NewtonProjectDirective,
        LeibnizPortalDirective,
        SanitizeHtmlPipe,
        SanitizeUrlPipe,
        BebbRouteComponent,
        ManuscriptEntryComponent,
        TeiLinkDirective,
        CommentComponent,
        PublishedLetterComponent,
        BiographyComponent,
        LeceLeooComponent,
        ArkUrlDialogComponent
    ],
    imports: [
        AppRouting,
        BrowserModule,
        FlexLayoutModule,
        DspCoreModule,
        DspViewerModule,
        DspActionModule,
        DspSearchModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (appInitService: AppInitService) =>
                (): Promise<void> => {
                    return appInitService.Init('config', environment);
                },
            deps: [AppInitService],
            multi: true
        },
        {
            provide: DspApiConfigToken,
            useFactory: (appInitService: AppInitService) => appInitService.dspApiConfig,
            deps: [AppInitService]
        },
        {
            provide: DspApiConnectionToken,
            useFactory: (appInitService: AppInitService) => new KnoraApiConnection(appInitService.dspApiConfig),
            deps: [AppInitService]
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: false
            }
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
