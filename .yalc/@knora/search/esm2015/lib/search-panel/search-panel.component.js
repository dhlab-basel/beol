import { Component, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
export class SearchPanelComponent {
    constructor() {
        this.route = '/search';
        this.showMenu = false;
        this.focusOnExtended = 'inactive';
    }
    /**
     * Show or hide the extended search menu
     *
     * @returns void
     */
    toggleMenu() {
        this.showMenu = !this.showMenu;
        this.focusOnExtended = (this.focusOnExtended === 'active' ? 'inactive' : 'active');
    }
}
SearchPanelComponent.decorators = [
    { type: Component, args: [{
                selector: 'kui-search-panel',
                template: `<div class="kui-search-panel">

    <div class="kui-search-bar">

        <div class="fulltext-search">
            <kui-fulltext-search [route]="route"></kui-fulltext-search>
        </div>

        <div *ngIf="showMenu" [@extendedSearchMenu]="focusOnExtended" class="kui-menu extended-search">
            <div class="kui-menu-header">
                <span class="kui-menu-title">
                    <h4>Advanced search</h4>
                </span>
                <span class="kui-menu-action">
                    <button mat-icon-button (click)="toggleMenu()">
                        <mat-icon>close</mat-icon>
                    </button>
                </span>
            </div>
            <div class="extended-search-box">
                <kui-extended-search [route]="route" (toggleExtendedSearchForm)="toggleMenu()"></kui-extended-search>
            </div>
        </div>

    </div>

    <div class="advanced-btn">
        <button mat-button color="primary" (click)="toggleMenu()">advanced</button>
    </div>

</div>`,
                styles: [`.advanced-btn{margin-left:10px}.kui-search-panel{display:flex;position:relative;z-index:100}.kui-search-bar{background-color:#f9f9f9;border-radius:4px;display:inline-flex;height:40px;position:relative;z-index:10}.kui-search-bar:hover{box-shadow:0 1px 3px rgba(0,0,0,.5)}.kui-menu{box-shadow:0 3px 5px -1px rgba(11,11,11,.2),0 6px 10px 0 rgba(11,11,11,.14),0 1px 18px 0 rgba(11,11,11,.12);background-color:#f9f9f9;border-radius:4px;position:absolute}.kui-menu .kui-menu-header{background-color:#f9f9f9;border-top-left-radius:4px;border-top-right-radius:4px;display:inline-block;height:48px;width:100%}.kui-menu .kui-menu-header .kui-menu-title{float:left;font-size:14px;font-weight:400;margin-top:4px;padding:12px}.kui-menu .kui-menu-header .kui-menu-action{float:right;margin:4px}.kui-menu.extended-search{min-height:680px;width:680px;z-index:20}.extended-search-box{margin:12px}@media screen and (max-width:1024px){.kui-search-bar{width:480px}.kui-search-bar div.input-field input{width:calc(480px - 80px)}.fulltext-search,.kui-menu.extended-search{width:480px}}@media screen and (max-width:768px){.kui-search-bar{width:calc(480px - 160px)}.kui-search-bar div.input-field input{width:calc(480px - 160px - 80px)}.fulltext-search,.kui-menu.extended-search{width:calc(480px - 80px)}}`],
                animations: [
                    trigger('extendedSearchMenu', [
                        state('inactive', style({ display: 'none' })),
                        state('active', style({ display: 'block' })),
                        transition('inactive => active', animate('100ms ease-in')),
                        transition('active => inactive', animate('100ms ease-out'))
                    ])
                ]
            },] },
];
/** @nocollapse */
SearchPanelComponent.ctorParameters = () => [];
SearchPanelComponent.propDecorators = {
    route: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLXBhbmVsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Brbm9yYS9zZWFyY2gvIiwic291cmNlcyI6WyJsaWIvc2VhcmNoLXBhbmVsL3NlYXJjaC1wYW5lbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQStDakYsTUFBTSxPQUFPLG9CQUFvQjtJQU0vQjtRQUpTLFVBQUssR0FBVyxTQUFTLENBQUM7UUFDbkMsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixvQkFBZSxHQUFXLFVBQVUsQ0FBQztJQUVyQixDQUFDO0lBRWpCOzs7O09BSUc7SUFDSCxVQUFVO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7OztZQTdERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E4Qkw7Z0JBQ0wsTUFBTSxFQUFFLENBQUMsbXdDQUFtd0MsQ0FBQztnQkFDN3dDLFVBQVUsRUFBRTtvQkFDVixPQUFPLENBQUMsb0JBQW9CLEVBQzFCO3dCQUNFLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7d0JBQzdDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7d0JBQzVDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQzFELFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztxQkFDNUQsQ0FDRjtpQkFDRjthQUNGOzs7OztvQkFHRSxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgYW5pbWF0ZSwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCB0cmlnZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2t1aS1zZWFyY2gtcGFuZWwnLFxuICB0ZW1wbGF0ZTogYDxkaXYgY2xhc3M9XCJrdWktc2VhcmNoLXBhbmVsXCI+XG5cbiAgICA8ZGl2IGNsYXNzPVwia3VpLXNlYXJjaC1iYXJcIj5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiZnVsbHRleHQtc2VhcmNoXCI+XG4gICAgICAgICAgICA8a3VpLWZ1bGx0ZXh0LXNlYXJjaCBbcm91dGVdPVwicm91dGVcIj48L2t1aS1mdWxsdGV4dC1zZWFyY2g+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgKm5nSWY9XCJzaG93TWVudVwiIFtAZXh0ZW5kZWRTZWFyY2hNZW51XT1cImZvY3VzT25FeHRlbmRlZFwiIGNsYXNzPVwia3VpLW1lbnUgZXh0ZW5kZWQtc2VhcmNoXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwia3VpLW1lbnUtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJrdWktbWVudS10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8aDQ+QWR2YW5jZWQgc2VhcmNoPC9oND5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJrdWktbWVudS1hY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBtYXQtaWNvbi1idXR0b24gKGNsaWNrKT1cInRvZ2dsZU1lbnUoKVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1hdC1pY29uPmNsb3NlPC9tYXQtaWNvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXh0ZW5kZWQtc2VhcmNoLWJveFwiPlxuICAgICAgICAgICAgICAgIDxrdWktZXh0ZW5kZWQtc2VhcmNoIFtyb3V0ZV09XCJyb3V0ZVwiICh0b2dnbGVFeHRlbmRlZFNlYXJjaEZvcm0pPVwidG9nZ2xlTWVudSgpXCI+PC9rdWktZXh0ZW5kZWQtc2VhcmNoPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwiYWR2YW5jZWQtYnRuXCI+XG4gICAgICAgIDxidXR0b24gbWF0LWJ1dHRvbiBjb2xvcj1cInByaW1hcnlcIiAoY2xpY2spPVwidG9nZ2xlTWVudSgpXCI+YWR2YW5jZWQ8L2J1dHRvbj5cbiAgICA8L2Rpdj5cblxuPC9kaXY+YCxcbiAgc3R5bGVzOiBbYC5hZHZhbmNlZC1idG57bWFyZ2luLWxlZnQ6MTBweH0ua3VpLXNlYXJjaC1wYW5lbHtkaXNwbGF5OmZsZXg7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDoxMDB9Lmt1aS1zZWFyY2gtYmFye2JhY2tncm91bmQtY29sb3I6I2Y5ZjlmOTtib3JkZXItcmFkaXVzOjRweDtkaXNwbGF5OmlubGluZS1mbGV4O2hlaWdodDo0MHB4O3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTB9Lmt1aS1zZWFyY2gtYmFyOmhvdmVye2JveC1zaGFkb3c6MCAxcHggM3B4IHJnYmEoMCwwLDAsLjUpfS5rdWktbWVudXtib3gtc2hhZG93OjAgM3B4IDVweCAtMXB4IHJnYmEoMTEsMTEsMTEsLjIpLDAgNnB4IDEwcHggMCByZ2JhKDExLDExLDExLC4xNCksMCAxcHggMThweCAwIHJnYmEoMTEsMTEsMTEsLjEyKTtiYWNrZ3JvdW5kLWNvbG9yOiNmOWY5Zjk7Ym9yZGVyLXJhZGl1czo0cHg7cG9zaXRpb246YWJzb2x1dGV9Lmt1aS1tZW51IC5rdWktbWVudS1oZWFkZXJ7YmFja2dyb3VuZC1jb2xvcjojZjlmOWY5O2JvcmRlci10b3AtbGVmdC1yYWRpdXM6NHB4O2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjRweDtkaXNwbGF5OmlubGluZS1ibG9jaztoZWlnaHQ6NDhweDt3aWR0aDoxMDAlfS5rdWktbWVudSAua3VpLW1lbnUtaGVhZGVyIC5rdWktbWVudS10aXRsZXtmbG9hdDpsZWZ0O2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjQwMDttYXJnaW4tdG9wOjRweDtwYWRkaW5nOjEycHh9Lmt1aS1tZW51IC5rdWktbWVudS1oZWFkZXIgLmt1aS1tZW51LWFjdGlvbntmbG9hdDpyaWdodDttYXJnaW46NHB4fS5rdWktbWVudS5leHRlbmRlZC1zZWFyY2h7bWluLWhlaWdodDo2ODBweDt3aWR0aDo2ODBweDt6LWluZGV4OjIwfS5leHRlbmRlZC1zZWFyY2gtYm94e21hcmdpbjoxMnB4fUBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6MTAyNHB4KXsua3VpLXNlYXJjaC1iYXJ7d2lkdGg6NDgwcHh9Lmt1aS1zZWFyY2gtYmFyIGRpdi5pbnB1dC1maWVsZCBpbnB1dHt3aWR0aDpjYWxjKDQ4MHB4IC0gODBweCl9LmZ1bGx0ZXh0LXNlYXJjaCwua3VpLW1lbnUuZXh0ZW5kZWQtc2VhcmNoe3dpZHRoOjQ4MHB4fX1AbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOjc2OHB4KXsua3VpLXNlYXJjaC1iYXJ7d2lkdGg6Y2FsYyg0ODBweCAtIDE2MHB4KX0ua3VpLXNlYXJjaC1iYXIgZGl2LmlucHV0LWZpZWxkIGlucHV0e3dpZHRoOmNhbGMoNDgwcHggLSAxNjBweCAtIDgwcHgpfS5mdWxsdGV4dC1zZWFyY2gsLmt1aS1tZW51LmV4dGVuZGVkLXNlYXJjaHt3aWR0aDpjYWxjKDQ4MHB4IC0gODBweCl9fWBdLFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignZXh0ZW5kZWRTZWFyY2hNZW51JyxcbiAgICAgIFtcbiAgICAgICAgc3RhdGUoJ2luYWN0aXZlJywgc3R5bGUoeyBkaXNwbGF5OiAnbm9uZScgfSkpLFxuICAgICAgICBzdGF0ZSgnYWN0aXZlJywgc3R5bGUoeyBkaXNwbGF5OiAnYmxvY2snIH0pKSxcbiAgICAgICAgdHJhbnNpdGlvbignaW5hY3RpdmUgPT4gYWN0aXZlJywgYW5pbWF0ZSgnMTAwbXMgZWFzZS1pbicpKSxcbiAgICAgICAgdHJhbnNpdGlvbignYWN0aXZlID0+IGluYWN0aXZlJywgYW5pbWF0ZSgnMTAwbXMgZWFzZS1vdXQnKSlcbiAgICAgIF1cbiAgICApXG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgU2VhcmNoUGFuZWxDb21wb25lbnQge1xuXG4gIEBJbnB1dCgpIHJvdXRlOiBzdHJpbmcgPSAnL3NlYXJjaCc7XG4gIHNob3dNZW51OiBib29sZWFuID0gZmFsc2U7XG4gIGZvY3VzT25FeHRlbmRlZDogc3RyaW5nID0gJ2luYWN0aXZlJztcblxuICBjb25zdHJ1Y3RvcigpIHsgfVxuXG4gIC8qKlxuICAgKiBTaG93IG9yIGhpZGUgdGhlIGV4dGVuZGVkIHNlYXJjaCBtZW51XG4gICAqXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHRvZ2dsZU1lbnUoKTogdm9pZCB7XG4gICAgdGhpcy5zaG93TWVudSA9ICF0aGlzLnNob3dNZW51O1xuICAgIHRoaXMuZm9jdXNPbkV4dGVuZGVkID0gKHRoaXMuZm9jdXNPbkV4dGVuZGVkID09PSAnYWN0aXZlJyA/ICdpbmFjdGl2ZScgOiAnYWN0aXZlJyk7XG4gIH1cbn1cbiJdfQ==