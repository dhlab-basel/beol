import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TextFieldModule } from '@angular/cdk/text-field';

import { DspViewerModule } from '../viewer';

import { SearchPanelComponent } from './search-panel/search-panel.component';
import { ExpertSearchComponent } from './expert-search/expert-search.component';
import { FulltextSearchComponent } from './fulltext-search/fulltext-search.component';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';
import { SelectOntologyComponent } from './advanced-search/select-ontology/select-ontology.component';
import { SelectResourceClassComponent } from './advanced-search/resource-and-property-selection/select-resource-class/select-resource-class.component';
import { SelectPropertyComponent } from './advanced-search/resource-and-property-selection/select-property/select-property.component';
import { SpecifyPropertyValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/specify-property-value.component';
import { SearchIntValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-int-value/search-int-value.component';
import { SearchBooleanValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-boolean-value/search-boolean-value.component';
import { SearchDateValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-date-value/search-date-value.component';
import { SearchDecimalValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-decimal-value/search-decimal-value.component';
import { SearchLinkValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-link-value/search-link-value.component';
import { SearchListValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-list-value/search-list-value.component';
import { SearchDisplayListComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-list-value/search-display-list/search-display-list.component';
import { SearchTextValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-text-value/search-text-value.component';
import { SearchUriValueComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-uri-value/search-uri-value.component';
import { DspActionModule } from '../action';
import { ResourceAndPropertySelectionComponent } from './advanced-search/resource-and-property-selection/resource-and-property-selection.component';
import { SearchResourceComponent } from './advanced-search/resource-and-property-selection/select-property/specify-property-value/search-resource/search-resource.component';



@NgModule({
    declarations: [
        SearchPanelComponent,
        FulltextSearchComponent,
        ExpertSearchComponent,
        SelectOntologyComponent,
        SelectResourceClassComponent,
        SelectPropertyComponent,
        AdvancedSearchComponent,
        SpecifyPropertyValueComponent,
        SearchIntValueComponent,
        SearchBooleanValueComponent,
        SearchDateValueComponent,
        SearchDecimalValueComponent,
        SearchLinkValueComponent,
        SearchListValueComponent,
        SearchDisplayListComponent,
        SearchTextValueComponent,
        SearchUriValueComponent,
        ResourceAndPropertySelectionComponent,
        SearchResourceComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatMenuModule,
        MatListModule,
        MatButtonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatInputModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        DspActionModule,
        DspViewerModule,
        TextFieldModule
    ],
    exports: [
        SearchPanelComponent,
        FulltextSearchComponent,
        ExpertSearchComponent,
        AdvancedSearchComponent
    ]
})
export class DspSearchModule {
}
