import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription} from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BeolService } from '../services/beol.service';
import { KnoraApiConnection, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';

/**
 * Represents a correspondent.
 */
class Correspondent {

    /**
     * Represents a person that took part in a correspondence.
     *
     * @param {string} name the name of the person.
     * @param {string} gnd the GND/IAF identifier of the person.
     */
    constructor(readonly name: string, readonly gnd: string) {
    }
}

/**
 * Represents a correspondence between two persons.
 * A correspondence consists of all the letters exchanged between two persons (they are either the author or recipient).
 */
class Correspondence {

    constructor(
        readonly correspondent1: Correspondent,
        readonly correspondent2: Correspondent,
        readonly description: string = '',
        readonly showTranslation: boolean = false) {
    }
}

class Section {

    constructor(
        readonly label: string,
        readonly correspondences: Correspondence[],
        public panelOpenState: boolean = false) {

    }
}

class CorrespondenceGroupWithSection {

    constructor(
        readonly mainCorrespondent: Correspondent,
        readonly sections: Section[],
        readonly description: string = '',
        public panelOpenState: boolean = false) {

    }
}

/**
 * Represents a group of correspondences.
 */
class CorrespondenceGroup {

    constructor(
        readonly mainCorrespondent: Correspondent,
        readonly correspondences: Correspondence[],
        readonly description: string = '',
        public panelOpenState: boolean = false) {
    }
}

@Component({
  selector: 'app-biography',
  templateUrl: './biography.component.html',
  styleUrls: ['./biography.component.scss']
})
export class BiographyComponent implements OnInit, OnDestroy {
    isLoading = true;
    name: string;
    navigationSubscription: Subscription;

    /**
     * List of all existing correspondents
     */
    readonly Jacob_I_Bernoulli = new Correspondent('Jacob I Bernoulli', '(DE-588)118509950');
    readonly Jacob_II_Bernoulli = new Correspondent('Jacob II Bernoulli', '(DE-588)120475030')
    readonly Leonhard_Euler = new Correspondent('Leonhard Euler', '(DE-588)118531379');
    readonly Johann_Albrecht_Euler = new Correspondent('Johann Albrecht Euler', '(DE-588)116610832');
    readonly Condorcet = new Correspondent('Le marquis de Condorcet', '(DE-588)118521772');
    readonly Turgot = new Correspondent('Anne Robert Jacques Turgot', '(DE-588)118763202');
    readonly Lexell = new Correspondent('Anders Johan Lexell', '(DE-588)100189180');
    readonly FussNI = new Correspondent('Niklaus (I) Fuss', '(DE-588)116878894');
    readonly Christian_Goldbach = new Correspondent('Christian Goldbach', '(DE-588)118696149');
    readonly Daniel_I_Bernoulli = new Correspondent('Daniel I Bernoulli', '(DE-588)118656503');
    readonly Johann_I_Bernoulli = new Correspondent('Johann I Bernoulli', '(DE-588)118509969');
    readonly Johann_II_Bernoulli = new Correspondent('Johann II Bernoulli', '(DE-588)117589136');
    readonly Johann_III_Bernoulli = new Correspondent('Johann III Bernoulli', '(DE-588)116170654');
    readonly Nicolaus_I_Bernoulli = new Correspondent('Nicolaus I Bernoulli', '(DE-588)119166895');
    readonly Nicolaus_II_Bernoulli = new Correspondent('Nicolaus II Bernoulli', '(DE-588)117589144');
    readonly Johannes_Scheuchzer = new Correspondent('Johannes Scheuchzer', '(DE-588)120379260');
    readonly Johann_Jakob_Scheuchzer = new Correspondent('Johann Jakob Scheuchzer', '(DE-588)118607308');
    readonly John_Arnold = new Correspondent('John Arnold', '(DE-588)1141832453');
    readonly Christian_Wolf = new Correspondent('Christian Wolff', '(DE-588)118634771');
    readonly Johann_Frick = new Correspondent('Johannes Frick', '(DE-588)123393094');
    readonly Henri_Basnage_de_Beauval = new Correspondent('Henri Basnage de Beauval', '(DE-588)12053827X');
    readonly Christoph_Battier = new Correspondent('Christoph Battier', '(DE-588)141546573');
    readonly Georg_Bernhard_Bilfinger = new Correspondent('Georg Bernhard Bilfinger', '(DE-588)118663208');
    readonly Johann_Wendel_Bilfinger = new Correspondent('Johann Wendelin Bilfinger', '(DE-588)104171057');
    readonly Pierre_Bouguer = new Correspondent('Pierre Bouguer', '(DE-588)117622974');
    readonly Marc_Michel_Bousquet = new Correspondent('Marc-Michel Bousquet', '(DE-588)136952968');
    readonly William_Burnet = new Correspondent('William Burnet', '(DE-588)104185643');
    readonly Johann_Buxtorf = new Correspondent('Johann Buxtorf', '(DE-588)12068943X');
    readonly George_Cheyne = new Correspondent('George Cheyne', '(DE-588)117659606');
    readonly Alexis_Claude_Clairaut = new Correspondent('Alexis Claude Clairaut', '(DE-588)11852092X');
    readonly Jean_Pierre_de_Crousaz = new Correspondent('Jean Pierre de Crousaz', '(DE-588)100097413');
    readonly Jean_Boecler = new Correspondent('Jean Boecler', '(DE-588)117609048');
    // TODO Brandenburgische Sozietät
    // TODO readonly Georg_Faeh = new Correspondent('Georg Faeh','');
    readonly Robert_Falconer = new Correspondent('Robert Falconer', '(DE-588)1141833808');
    readonly Michelangelo_Fardella = new Correspondent('Michelangelo Fardella', '(DE-588)119291967');
    readonly Bernard_le_Bouyer_Bovier_de_Fontenelle = new Correspondent('Bernard le Bouyer Bovier de Fontenelle', '(DE-588)118639056');
    readonly Du_Fresne = new Correspondent('Du Fresne', '(DE-588)1142274934');
    readonly Amedee_Francois_Frezier = new Correspondent('Amédée François Frézier', '(DE-588)117537373');
    readonly Vitus_Friesl = new Correspondent('Vitus Friesl', '(DE-588)10012786X');
    readonly Johann_Caspar_Funck = new Correspondent('Johann Caspar Funck', '(DE-588)143843133');
    readonly Johannes_Gessner = new Correspondent('Johannes Gessner', '(DE-588)119331136');
    readonly Nicasius_Grammatici = new Correspondent('Nicasius Grammatici', '(DE-588)100108296');
    readonly Jean_Paul_Gua_de_Malves = new Correspondent('Jean Paul Gua de Malves', '(DE-588)117572535');
    readonly Edmond_Halley = new Correspondent('Edmond Halley', '(DE-588)118720066');
    readonly Peter_Hammer = new Correspondent('Peter Hammer', '(DE-588)1147909822');
    readonly German_Hermann = new Correspondent('German Hermann', '(DE-588)1048628825');
    readonly Jacob_Hermann = new Correspondent('Jacob Hermann', '(DE-588)119112450');
    readonly Jacob_Christoph_Iselin = new Correspondent('Jacob Christoph Iselin', '(DE-588)117205508');
    readonly Adam_Meson_Isink = new Correspondent('Adam Meson Isink', '(DE-588)1141836106');
    readonly Johann_Theodor_Jablonski = new Correspondent('Johann Theodor Jablonski', '(DE-588)120517892');
    readonly Christian_Kortholt = new Correspondent('Christian Kortholt', '(DE-588)116341815');
    readonly Jacques_L_Enfant = new Correspondent('Jacques L\'Enfant', '(DE-588)117636290');
    readonly Daniel_Le_Clerc = new Correspondent('Daniel Le Clerc', '(DE-588)116850841');
    readonly Johann_Wilhelm_Theodor_Leichner = new Correspondent('Johann Wilhelm Theodor Leichner', '(DE-588)1052878059');
    readonly Henry_Leslie = new Correspondent('Henry Leslie', '(DE-588)1141836866');
    readonly Johann_Georg_Liebknecht = new Correspondent('Johann Georg Liebknecht', '(DE-588)116997052');
    readonly Pierre_Louis_Moreau_de_Maupertuis = new Correspondent('Pierre Louis Moreau de Maupertuis', '(DE-588)118731998');
    readonly Johann_Burckhard_Mencke = new Correspondent('Johann Burckhard Mencke', '(DE-588)118783181');
    readonly Johann_Rudolf_Mieg = new Correspondent('Johann Rudolf Mieg', '(DE-588)104138556');
    readonly Pierre_Remond_de_Montmort = new Correspondent('Pierre Remond de Montmort', '(DE-588)117601020');
    readonly Giovanni_Battista_Morgagni = new Correspondent('Giovanni Battista Morgagni', '(DE-588)104265264');
    readonly Johann_Joosten_van_Musschenbroek = new Correspondent('Johann Joosten van Musschenbroek', '(DE-588)1089913966');
    readonly Theodor_Muykens = new Correspondent('Theodor Muykens', '(DE-588)128862130');
    readonly Gerhard_Noodt = new Correspondent('Gerhard Noodt', '(DE-588)118869361');
    readonly Louis_Leon_Payot_Comte_de_Onsembray = new Correspondent('Louis Leon Payot Comte de Onsembray', '(DE-588)117679879');
    readonly Jean_Frederic_Osterwald = new Correspondent('Jean Frederic Osterwald', '(DE-588)12364433X');
    readonly Jean_Rodolphe_Osterwald = new Correspondent('Jean Rodolphe Osterwald', '(DE-588)104243236');
    readonly Domenico_Passionei = new Correspondent('Domenico Passionei', '(DE-588)116052546');
    readonly Leopold_Gottlieb_Graf_von_Pergen = new Correspondent('Leopold Gottlieb Graf von Pergen', '(DE-588)114183734X');
    readonly Christoph_Pflug = new Correspondent('Christoph Pflug', '(DE-588)1142279391');
    readonly Giovanni_Poleni = new Correspondent('Giovanni Poleni', '(DE-588)11887733X');
    readonly Jakob_Christoph_Ramspeck = new Correspondent('Jakob Christoph Ramspeck', '(DE-588)121471640');
    readonly Elicagaray_Bernard_Renau = new Correspondent('Bernard Renau d\'Éliçagaray', '(DE-588)108987216X');
    // TODO: this seems to be the same person
    readonly Elicagaray_Bernard_Renau2 = new Correspondent('Bernard Renau d\'Éliçagaray', '(DE-588)102079056');
    readonly Charles_Rene_Reyneau = new Correspondent('Charles René Reyneau', '(DE-588)117526789');
    readonly Gabriel_Rilliet = new Correspondent('Gabriel Rilliet', '(DE-588)1142279774');
    readonly Andreas_Ritz = new Correspondent('Andreas Ritz', '(DE-588)1012090132');
    readonly Michel_Rossal = new Correspondent('Michel Rossal', '(DE-588)1055238948');
    readonly Johann_Salzmann = new Correspondent('Johann Salzmann', '(DE-588)128382058');
    readonly Alexandre_Saverien = new Correspondent('Alexandre Saverien', '(DE-588)172354366');
    readonly Johann_Daniel_Schoepflin = new Correspondent('Johann Daniel Schoepflin', '(DE-588)118610260');
    readonly Willem_Jacob_SGravesande = new Correspondent('Willem Jacob sGravesande', '(DE-588)118939297');
    readonly Thomas_Spleiss = new Correspondent('Thomas Spleiss', '(DE-588)138483922');
    readonly Henry_Sully = new Correspondent('Henry Sully', '(DE-588)122006011');
    readonly Georges_Joseph_Tacheron = new Correspondent('Georges Joseph Tacheron', '(DE-588)114228039X');
    readonly de_Thiancourt = new Correspondent('de Thiancourt', '(DE-588)1082012769');
    readonly Ludwig_Philipp_Thuemmig = new Correspondent('Ludwig Philipp Thuemmig', '(DE-588)120076276');
    readonly Abraham_Trommius = new Correspondent('Abraham Trommius', '(DE-588)100657672');
    readonly Giuseppe_Verzaglia = new Correspondent('Giuseppe Verzaglia', '(DE-588)1089923198');
    readonly Burchard_de_Volder = new Correspondent('Burchard de Volder', '(DE-588)120665182');
    readonly Johann_Friedrich_Weidler = new Correspondent('Johann Friedrich Weidler', '(DE-588)100696198');
    readonly Johann_Caspar_Wettstein = new Correspondent('Johann Caspar Wettstein', '(DE-588)140645292');
    readonly Wicher_Wichers = new Correspondent('Wicher Wichers', '(DE-588)1089913737');
    readonly Daniel_Wolleb = new Correspondent('Daniel Wolleb', '(DE-588)1055118640');
    readonly John_Thomas_Woolhouse = new Correspondent('John Thomas Woolhouse', '(DE-588)104179619');
    readonly Francesco_Maria_Zanotti = new Correspondent('Francesco Maria Zanotti', '(DE-588)117592307');

    correspondences_Daniel_I_Bernoulli: CorrespondenceGroupWithSection;
    correspondences_Johann_I_Bernoulli: CorrespondenceGroupWithSection;
    correspondences_Johann_II_Bernoulli: CorrespondenceGroupWithSection;
    correspondences_Nicolaus_I_Bernoulli: CorrespondenceGroupWithSection;
    correspondences_Nicolaus_II_Bernoulli: CorrespondenceGroupWithSection;
    correspondences_Jacob_Hermann: CorrespondenceGroupWithSection;
    correspondences_Leonhard_Euler: CorrespondenceGroup;
    correspondences_Johann_Albrecht_Euler: CorrespondenceGroup;
    correspondences_Niklaus_I_Fuss: CorrespondenceGroup;
    correspondences_Condorcet: CorrespondenceGroupWithSection;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        private _appInitService: AppInitService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _beol: BeolService,
        public location: Location
    ) {
        this.isLoading = false;
    }

    ngOnInit() {
        this.navigationSubscription = this._route.paramMap.subscribe((params: ParamMap) => {
            this.name = params.get('person');
        });

        /**
         * Correspondences
         */
        this.correspondences_Daniel_I_Bernoulli = new CorrespondenceGroupWithSection(this.Daniel_I_Bernoulli, [
            new Section('S', [
                new Correspondence(this.Daniel_I_Bernoulli, this.Johannes_Scheuchzer)
            ])
        ]);

        this.correspondences_Johann_I_Bernoulli = new CorrespondenceGroupWithSection(this.Johann_I_Bernoulli,
            [
                new Section('A', [
                    new Correspondence(this.Johann_I_Bernoulli, this.John_Arnold)
                ]),
                new Section('B', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Henri_Basnage_de_Beauval),
                    new Correspondence(this.Johann_I_Bernoulli, this.Christoph_Battier),
                    new Correspondence(this.Johann_I_Bernoulli, this.Georg_Bernhard_Bilfinger),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Wendel_Bilfinger),
                    new Correspondence(this.Johann_I_Bernoulli, this.Jean_Boecler),
                    new Correspondence(this.Johann_I_Bernoulli, this.Pierre_Bouguer),
                    new Correspondence(this.Johann_I_Bernoulli, this.Marc_Michel_Bousquet),
                    new Correspondence(this.Johann_I_Bernoulli, this.William_Burnet),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Buxtorf)
                ]),
                new Section('C', [
                    new Correspondence(this.Johann_I_Bernoulli, this.George_Cheyne),
                    new Correspondence(this.Johann_I_Bernoulli, this.Alexis_Claude_Clairaut),
                    new Correspondence(this.Johann_I_Bernoulli, this.Jean_Pierre_de_Crousaz)
                ]),
                new Section('F', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Robert_Falconer),
                    new Correspondence(this.Johann_I_Bernoulli, this.Michelangelo_Fardella),
                    new Correspondence(this.Johann_I_Bernoulli, this.Bernard_le_Bouyer_Bovier_de_Fontenelle),
                    new Correspondence(this.Johann_I_Bernoulli, this.Du_Fresne),
                    new Correspondence(this.Johann_I_Bernoulli, this.Amedee_Francois_Frezier),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Frick),
                    // TODO: 0000-00-00_Bernoulli_Johann_I-Frick_Johannes has no date and does not show up!
                    new Correspondence(this.Johann_I_Bernoulli, this.Vitus_Friesl),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Caspar_Funck)
                ]),
                new Section('G', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Johannes_Gessner),
                    new Correspondence(this.Johann_I_Bernoulli, this.Christian_Goldbach),
                    new Correspondence(this.Johann_I_Bernoulli, this.Nicasius_Grammatici),
                    new Correspondence(this.Johann_I_Bernoulli, this.Jean_Paul_Gua_de_Malves)]),
                new Section('H', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Edmond_Halley),
                    new Correspondence(this.Johann_I_Bernoulli, this.Peter_Hammer),
                    new Correspondence(this.Johann_I_Bernoulli, this.German_Hermann),
                    new Correspondence(this.Johann_I_Bernoulli, this.Jacob_Hermann),
                ]),
                new Section('I', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Jacob_Christoph_Iselin),
                    new Correspondence(this.Johann_I_Bernoulli, this.Adam_Meson_Isink),
                ]),
                new Section('J', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Theodor_Jablonski)
                ]),
                new Section('K', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Christian_Kortholt),
                ]),
                new Section('L', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Jacques_L_Enfant),
                    new Correspondence(this.Johann_I_Bernoulli, this.Daniel_Le_Clerc),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Wilhelm_Theodor_Leichner),
                    new Correspondence(this.Johann_I_Bernoulli, this.Henry_Leslie),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Georg_Liebknecht),
                ]),
                new Section('M', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Pierre_Louis_Moreau_de_Maupertuis),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Burckhard_Mencke),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Rudolf_Mieg),
                    new Correspondence(this.Johann_I_Bernoulli, this.Pierre_Remond_de_Montmort),
                    new Correspondence(this.Johann_I_Bernoulli, this.Giovanni_Battista_Morgagni),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Joosten_van_Musschenbroek),
                    new Correspondence(this.Johann_I_Bernoulli, this.Theodor_Muykens)]),
                new Section('N', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Gerhard_Noodt),
                ]),
                new Section('O', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Louis_Leon_Payot_Comte_de_Onsembray),
                    new Correspondence(this.Johann_I_Bernoulli, this.Jean_Frederic_Osterwald),
                    new Correspondence(this.Johann_I_Bernoulli, this.Jean_Rodolphe_Osterwald)
                ]),
                new Section('P', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Domenico_Passionei),
                    new Correspondence(this.Johann_I_Bernoulli, this.Leopold_Gottlieb_Graf_von_Pergen),
                    new Correspondence(this.Johann_I_Bernoulli, this.Christoph_Pflug),
                    new Correspondence(this.Johann_I_Bernoulli, this.Giovanni_Poleni)]),
                new Section('R', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Jakob_Christoph_Ramspeck),
                    new Correspondence(this.Johann_I_Bernoulli, this.Elicagaray_Bernard_Renau),
                    new Correspondence(this.Johann_I_Bernoulli, this.Elicagaray_Bernard_Renau2),
                    new Correspondence(this.Johann_I_Bernoulli, this.Charles_Rene_Reyneau),
                    new Correspondence(this.Johann_I_Bernoulli, this.Gabriel_Rilliet),
                    new Correspondence(this.Johann_I_Bernoulli, this.Andreas_Ritz),
                    new Correspondence(this.Johann_I_Bernoulli, this.Michel_Rossal)]),
                new Section('S', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Salzmann),
                    new Correspondence(this.Johann_I_Bernoulli, this.Alexandre_Saverien),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Jakob_Scheuchzer),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johannes_Scheuchzer),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Daniel_Schoepflin),
                    new Correspondence(this.Johann_I_Bernoulli, this.Willem_Jacob_SGravesande),
                    new Correspondence(this.Johann_I_Bernoulli, this.Thomas_Spleiss),
                    new Correspondence(this.Johann_I_Bernoulli, this.Henry_Sully)]),
                new Section('T', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Georges_Joseph_Tacheron),
                    new Correspondence(this.Johann_I_Bernoulli, this.de_Thiancourt),
                    new Correspondence(this.Johann_I_Bernoulli, this.Ludwig_Philipp_Thuemmig),
                    new Correspondence(this.Johann_I_Bernoulli, this.Abraham_Trommius)]),
                new Section('V', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Giuseppe_Verzaglia),
                    new Correspondence(this.Johann_I_Bernoulli, this.Burchard_de_Volder)]),
                new Section('W', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Friedrich_Weidler),
                    new Correspondence(this.Johann_I_Bernoulli, this.Johann_Caspar_Wettstein),
                    new Correspondence(this.Johann_I_Bernoulli, this.Wicher_Wichers),
                    new Correspondence(this.Johann_I_Bernoulli, this.Christian_Wolf),
                    new Correspondence(this.Johann_I_Bernoulli, this.Daniel_Wolleb),
                    new Correspondence(this.Johann_I_Bernoulli, this.John_Thomas_Woolhouse)]),
                new Section('Z', [
                    new Correspondence(this.Johann_I_Bernoulli, this.Francesco_Maria_Zanotti),
                ])
            ]);

        this.correspondences_Johann_II_Bernoulli = new CorrespondenceGroupWithSection(this.Johann_II_Bernoulli, [
            new Section('M', [
                new Correspondence(this.Johann_II_Bernoulli, this.Pierre_Louis_Moreau_de_Maupertuis)]
            )]);

        this.correspondences_Nicolaus_I_Bernoulli = new CorrespondenceGroupWithSection(this.Nicolaus_I_Bernoulli, [
            new Section('S', [
                new Correspondence(this.Nicolaus_I_Bernoulli, this.Johann_Jakob_Scheuchzer),
                new Correspondence(this.Nicolaus_I_Bernoulli, this.Johannes_Scheuchzer)
            ])]);

        this.correspondences_Nicolaus_II_Bernoulli = new CorrespondenceGroupWithSection(this.Nicolaus_II_Bernoulli, [
            new Section('S', [
                new Correspondence(this.Nicolaus_II_Bernoulli, this.Johann_Jakob_Scheuchzer),
                new Correspondence(this.Nicolaus_II_Bernoulli, this.Johannes_Scheuchzer)
            ])]);

        this.correspondences_Jacob_Hermann = new CorrespondenceGroupWithSection(this.Jacob_Hermann, [
            new Section('B', [
                new Correspondence(this.Jacob_Hermann, this.Johann_I_Bernoulli)
            ]),
            new Section('S', [
                    new Correspondence(this.Jacob_Hermann, this.Johann_Jakob_Scheuchzer),
                    new Correspondence(this.Jacob_Hermann, this.Johannes_Scheuchzer)
                ]
            )]
        );

        this.correspondences_Leonhard_Euler = new CorrespondenceGroup(this.Leonhard_Euler, [
            new Correspondence(this.Leonhard_Euler, this.Christian_Goldbach),
            new Correspondence(this.Leonhard_Euler, this.Condorcet),
            new Correspondence(this.Leonhard_Euler, this.Turgot),

        ]);

        this.correspondences_Johann_Albrecht_Euler = new CorrespondenceGroup(this.Johann_Albrecht_Euler, [
            new Correspondence(this.Johann_Albrecht_Euler, this.Condorcet),
            new Correspondence(this.Johann_Albrecht_Euler, this.Christian_Goldbach)
        ]);

        this.correspondences_Niklaus_I_Fuss = new CorrespondenceGroup(this.FussNI, [
            new Correspondence(this.FussNI, this.Condorcet)
        ])

        this.correspondences_Condorcet = new CorrespondenceGroupWithSection(this.Condorcet, [
            new Section('Condorcet', [
                new Correspondence(this.Condorcet, this.Johann_Albrecht_Euler),
                new Correspondence(this.Condorcet, this.Lexell),
                new Correspondence(this.Condorcet, this.FussNI)
            ])]
        );
    }

    ngOnDestroy() {
        if (this.navigationSubscription !== undefined) {
            this.navigationSubscription.unsubscribe();
        }
    }

    searchForManuscriptEntries(manuscriptIri: string) {

        const gravsearch = this._beol.getEntriesForManuscript(manuscriptIri);

        this._router.navigate(['/search/gravsearch/', gravsearch], { relativeTo: this._route });
    }

    goToResource(gnd: string) {
        const resType =  this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#person';

        // create a query that gets the person by gnd
        const query = this._beol.searchForPersonWithGND(gnd);

        this._dspApiConnection.v2.search.doExtendedSearch(query).subscribe(
            (resourceSeq: ReadResourceSequence) => {

                if (resourceSeq.resources.length === 1) {
                    const personResource = resourceSeq.resources[0];
                    const personIri: string = personResource.id;

                    // given the Iri of the person, display the whole resource
                    this._beol.routeByResourceType(resType, personIri, personResource);
                } else {
                    // person not found
                    console.log(`person with gnd number ${gnd} not found`);
                }

            }, (err) => {
                console.log('search failed ' + err);
            }
        );
    }


    /**
     * Generate Gravsearch query to search for BEBB and LECE correspondence
     *
     * @param gnd1 GND of the first correspondent.
     * @param gnd2 GND of the second correspondent.
     */
    searchForCorrespondence(gnd1: string, gnd2: string) {

        const gravsearch: string = this._beol.searchForCorrespondence(gnd1, gnd2, 0);

        this.submitQuery(gravsearch);
    }

    /**
     * Show a correspondence between two persons.
     *
     * @param gravsearch the Gravsearch query to be executed.
     */
    private submitQuery(gravsearch: string) {

        this._router.navigate(['/search/gravsearch/', gravsearch], { relativeTo: this._route });
    }
}
