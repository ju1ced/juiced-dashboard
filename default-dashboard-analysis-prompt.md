# Analyse en verbeterplan voor het Home Assistant default dashboard

## Rol

Je werkt als senior Home Assistant-dashboardarchitect en performance engineer. Je opdracht is om mijn huidige default dashboard grondig te onderzoeken, de bestaande functionaliteit en structuur volledig in kaart te brengen en een concreet stappenplan op te stellen voor een sneller, onderhoudbaarder en visueel consistenter dashboard.

Dit is in deze fase **uitsluitend een onderzoeks- en planningsopdracht**. Bouw of migreer het nieuwe dashboard nog niet, tenzij een strikt afgebakende test noodzakelijk is om een bevinding te valideren.

## Projectcontext

- Doelrepository: `https://github.com/ju1ced/juiced-dashboard`
- De repository moet de centrale, versiebeheerbare bron worden voor het toekomstige dashboard.
- Het bestaande default dashboard bevat alle huidige functionaliteit die behouden moet blijven.
- De huidige dashboardstructuur is met Graphify beschreven en kan via de beschikbare MCP-tools worden uitgelezen.
- Via de Home Assistant MCP-tools kun je dashboardconfiguratie, entities en andere relevante Home Assistant-informatie onderzoeken.
- Er bestaat een dashboard met de naam **MCP test** dat momenteel een exacte kopie is van het default dashboard.
- Het bestaande Kia Connect-dashboard en Garden-dashboard dienen als referenties voor stijl, repositoryopbouw, modulariteit en eventuele herbruikbare dashboardkaarten.
- Trek de visuele stijl van het Kia Connect-dashboard waar passend door als algemene stijl: kleuren, hiërarchie, spacing, kaarten, navigatie en algemene gebruikerservaring.

## Absolute veiligheidsregels

1. **Wijzig nooit het huidige default dashboard.**
2. Voer geen schrijf-, update-, verwijder- of migratieactie uit op het default dashboard.
3. Gebruik het default dashboard en de Graphify-output uitsluitend als read-only bron.
4. Als een test echt nodig is, mag die uitsluitend in het dashboard **MCP test** worden uitgevoerd.
5. Controleer vóór iedere schrijfactie expliciet dat het doel het MCP-testdashboard is en niet het default dashboard.
6. Maak vóór een eventuele wijziging aan het MCP-testdashboard eerst een export of herstelbaar snapshot van de huidige configuratie.
7. Voer geen wijzigingen uit aan automations, scripts, scenes, helpers, integrations, devices of entities. Deze mogen alleen read-only worden onderzocht.
8. Verwijder niets en overschrijf geen bestaande bestanden zonder eerst de repositorystatus en inhoud te controleren.
9. Zet geen secrets, tokens, interne URL's of andere gevoelige gegevens in Git of in het onderzoeksrapport.
10. Bij twijfel: stop de betreffende actie, documenteer wat ontbreekt en ga verder met het deel dat veilig read-only kan worden onderzocht.

## Instructies en bronnen eerst ontdekken

Voordat je de analyse start:

1. Controleer de huidige werkmap en bevestig dat je in de repository `ju1ced-dashboard` werkt.
2. Zoek naar toepasselijke instructiebestanden zoals `CLAUDE.md`, ook in bovenliggende mappen, en lees ze volledig. Volg deze instructies tenzij ze conflicteren met de veiligheidsregels in deze opdracht.
3. Inspecteer de huidige Git-status, remote, default branch en bestaande repository-inhoud.
4. Lokaliseer de beschikbare Graphify- en Home Assistant MCP-tools.
5. Lokaliseer, indien lokaal beschikbaar, de repositories of bronbestanden van:
   - `ha-kia-connect-dashboard`
   - het Garden-dashboard
6. Als een referentiebron niet beschikbaar is, noteer dat als beperking. Ga niet gokken hoe die repository is opgebouwd.

## Hoofddoel

Maak een onderbouwd ontwerp- en migratieplan waarmee het default dashboard later opnieuw kan worden opgebouwd in `juiced-dashboard`, met:

- behoud van alle bestaande relevante functionaliteit;
- merkbaar vlottere rendering, navigatie en interactie;
- minder onnodige kaart- en templatecomplexiteit;
- een consistente responsieve layout voor desktop, tablet en mobiel;
- herbruikbare, modulaire configuratie;
- eenvoudige installatie, updates, testen en rollback via Git;
- een consistente stijl gebaseerd op het Kia Connect-dashboard;
- een architectuur die toekomstige uitbreidingen eenvoudiger maakt.

## Onderzoeksvragen

Beantwoord minimaal de volgende vragen.

### 1. Huidige functionele inventaris

- Welke views, subpagina's, secties en navigatiepaden bestaan er?
- Welke functionaliteit biedt iedere view of subpagina?
- Welke kaarten, custom cards, templates, helpers, scripts, services en entities worden gebruikt?
- Welke onderdelen zijn essentieel, dubbel, verouderd, verborgen, conditioneel of mogelijk ongebruikt?
- Welke functionaliteit mag bij een latere migratie absoluut niet verloren gaan?
- Welke afhankelijkheden zijn nodig via HACS of andere Home Assistant-integraties?

Maak een traceerbare functionele matrix met minstens:

| Huidige view/subpagina | Doel | Belangrijkste kaarten | Entities/acties | Afhankelijkheden | Behouden? | Opmerkingen |
| --- | --- | --- | --- | --- | --- | --- |

### 2. Technische en structurele analyse

- Hoe is de huidige YAML- of storage-mode-configuratie georganiseerd?
- Waar zit duplicatie in kaarten, styling, templates, navigatie of entitylijsten?
- Welke configuratie is moeilijk onderhoudbaar of sterk gekoppeld?
- Welke delen lenen zich voor gedeelde templates, YAML-anchors, decluttering, auto-entities of losse include-bestanden?
- Welke custom cards voegen echte waarde toe en welke kunnen door lichtere native kaarten worden vervangen?
- Zijn er foutgevoelige entityreferenties, ontbrekende entities of historische restanten?
- Welke delen van Graphify zijn actueel, volledig en betrouwbaar, en waar is verificatie via Home Assistant MCP nodig?

### 3. Performanceanalyse

Onderzoek mogelijke oorzaken van traagheid, waaronder:

- totaal aantal kaarten en entities per view;
- kaarten die veel templates of frequente updates gebruiken;
- zware grafieken, historievragen, camera's, kaarten, auto-entities of geneste layouts;
- onnodig tegelijk geladen content;
- grote DOM-structuren of diep geneste stacks;
- overmatig gebruik van `card-mod`, Jinja-templates of JavaScript-templates;
- resources en custom cards die de frontend vertragen;
- navigatieconstructies die volledige views onnodig zwaar maken;
- verschillen tussen desktop, tablet en mobiel.

Gebruik meetbare gegevens waar de beschikbare tools dat toelaten. Scheid duidelijk:

- **vastgesteld feit**;
- **waarschijnlijke oorzaak**;
- **hypothese die later nog gemeten moet worden**.

Verzin geen benchmarkresultaten. Als echte metingen niet mogelijk zijn, beschrijf exact hoe ze in een volgende fase veilig kunnen worden uitgevoerd.

### 4. Gewenste architectuur

Onderzoek meerdere realistische opties en vergelijk ze. Neem minstens mee:

1. één modulair dashboard met losse YAML-bestanden per view of domein;
2. herbruikbare dashboardkaarten per subpagina, naar analogie van het Kia Connect- en Garden-dashboard;
3. een hybride model met een lichte hoofdnavigatie en afzonderlijke modulaire domeinpagina's;
4. een andere aanpak als het onderzoek aantoont dat die beter past.

Vergelijk de opties minimaal op:

| Optie | Performance | Onderhoudbaarheid | Hergebruik | Installatie/update | Mobiel | Migratierisico |
| --- | --- | --- | --- | --- | --- | --- |

Kies pas na de analyse een voorkeursarchitectuur. Ga er dus niet vooraf van uit dat iedere subpagina een eigen dashboardkaart moet worden. Onderbouw de keuze met bevindingen uit het huidige dashboard en de referentieprojecten.

Beantwoord daarbij:

- Welke onderdelen worden gedeelde componenten?
- Welke onderdelen blijven domein- of paginaspecifiek?
- Hoe worden navigatie, thema, styling en responsiviteit centraal beheerd?
- Welke repositorystructuur past hierbij?
- Is installatie via HACS zinvol en haalbaar, of is een andere Git-gebaseerde distributievorm beter?
- Hoe worden omgevingsspecifieke entity-ID's configureerbaar zonder secrets te committen?
- Hoe voorkomen we dat alle subpagina's en kaarten tegelijk worden geladen?

### 5. Visuele en UX-analyse

- Welke onderdelen van de Kia Connect-stijl zijn geschikt als algemene dashboardtaal?
- Hoe kunnen spacing, typografie, kleuren, statusweergave, iconografie en navigatie consistent worden gemaakt?
- Hoe blijft de interface duidelijk bij unavailable, unknown, offline en foutstatussen?
- Welke informatie moet bovenaan staan en welke kan via progressive disclosure of subnavigatie worden getoond?
- Hoe moet de layout zich gedragen op mobiel, tablet en desktop?
- Welke toegankelijkheidsaspecten moeten worden meegenomen, zoals contrast, tap targets en kleurgebruik?

### 6. Git-, test- en migratiestrategie

Werk een veilige aanpak uit voor:

- repositorystructuur en bestandsnamen;
- branches, kleine commits en pull requests;
- documentatie en changelog;
- linting en statische validatie van YAML;
- controle op ontbrekende entities en resources;
- functionele vergelijking tussen default en MCP test;
- responsieve tests;
- performance-baseline en hertests;
- gefaseerde migratie per view of domein;
- acceptatiecriteria per fase;
- rollback zonder impact op het default dashboard;
- uiteindelijke omschakeling, maar alleen na expliciete goedkeuring in een latere opdracht.

## Uit te voeren werkwijze

### Fase A — Oriëntatie

- Bevestig repository, instructies en beschikbare bronnen.
- Maak een lijst van databronnen en beperkingen.
- Leg vast welk dashboard exact het default dashboard is en welk dashboard exact het MCP-testdashboard is.
- Voer nog geen wijzigingen uit.

### Fase B — Read-only inventarisatie

- Lees de Graphify-structuur volledig uit.
- Controleer kritieke of onduidelijke bevindingen read-only via Home Assistant MCP.
- Breng views, kaarten, navigatie, entities, services, templates, resources en afhankelijkheden in kaart.
- Inspecteer de relevante patronen in het Kia Connect- en Garden-dashboard.
- Noteer verschillen tussen de Graphify-weergave en de actuele Home Assistant-configuratie.

### Fase C — Analyse

- Identificeer functionele duplicatie, technische schuld en onderhoudsproblemen.
- Rangschik performanceknelpunten op verwachte impact en zekerheid.
- Vergelijk architectuuropties.
- Bepaal welke stijl- en componentpatronen herbruikbaar zijn.

### Fase D — Advies en stappenplan

- Formuleer een doelarchitectuur.
- Stel een voorgestelde repositorystructuur voor.
- Maak een gefaseerd implementatieplan met afhankelijkheden, risico's, testcriteria en rollback.
- Markeer quick wins afzonderlijk van ingrijpende wijzigingen.
- Geef een expliciete lijst van open vragen of beslissingen waarvoor menselijke input nodig is.

### Fase E — Documentatie

Schrijf alle bevindingen naar:

`docs/default-dashboard-analysis-and-plan.md`

Maak zo nodig de map `docs/` aan. Dit rapport wordt de nieuwe referentie voor vervolgwerk.

Maak in deze onderzoeksfase geen dashboardimplementatiebestanden aan, behalve wanneer ik daar later expliciet om vraag.

## Verplichte inhoud van het eindrapport

Het rapport moet minimaal deze hoofdstukken bevatten:

1. Executive summary
2. Scope en veiligheidsgrenzen
3. Onderzochte bronnen en betrouwbaarheid
4. Huidige dashboardarchitectuur
5. Functionele inventaris en behoudmatrix
6. Navigatie- en afhankelijkhedenoverzicht
7. Performancebevindingen
8. Onderhoudbaarheidsproblemen en technische schuld
9. Analyse van Kia Connect- en Garden-dashboardpatronen
10. Vergelijking van architectuuropties
11. Aanbevolen doelarchitectuur en motivatie
12. Voorgestelde repositorystructuur
13. UX-, stijl- en responsive-richtlijnen
14. Gefaseerd implementatie- en migratieplan
15. Teststrategie en acceptatiecriteria
16. Risico's, mitigaties en rollback
17. Quick wins
18. Open vragen en beslispunten
19. Concrete volgende stap
20. Bijlagen met relevante inventarissen

Gebruik tabellen waar die de vergelijking of traceerbaarheid verbeteren.

## Kwaliteitseisen

- Iedere aanbeveling moet terug te leiden zijn naar een concrete bevinding.
- Geef prioriteiten aan met `P0`, `P1`, `P2` of `P3`.
- Geef bij performancebevindingen zowel impact als zekerheid aan: `hoog`, `middel` of `laag`.
- Maak duidelijk onderscheid tussen observaties, interpretaties en aanbevelingen.
- Vermeld bij ontbrekende informatie wat niet kon worden vastgesteld en hoe dit later gecontroleerd kan worden.
- Vermijd een generiek Home Assistant-adviesrapport; maak het specifiek voor dit dashboard.
- Behoud functionele pariteit als harde eis.
- Geef geen schijnzekerheid en verzin geen entities, bestanden, metingen of afhankelijkheden.

## Definition of done

De onderzoeksopdracht is pas klaar wanneer:

- het default dashboard aantoonbaar niet is gewijzigd;
- alle huidige views en belangrijke functionaliteiten traceerbaar zijn geïnventariseerd;
- Graphify-bevindingen waar nodig zijn geverifieerd;
- de referentieprojecten zijn onderzocht of hun onbeschikbaarheid is vastgelegd;
- meerdere architectuuropties objectief zijn vergeleken;
- één voorkeursarchitectuur met argumenten is gekozen;
- er een uitvoerbaar, gefaseerd migratieplan met tests en rollback bestaat;
- `docs/default-dashboard-analysis-and-plan.md` volledig is bijgewerkt;
- de repositorystatus en alle gemaakte bestandswijzigingen in de eindmelding worden opgesomd.

## Afsluitende rapportage in de terminal

Sluit je werk af met een korte samenvatting van:

- wat je hebt onderzocht;
- welke bestanden je hebt aangemaakt of gewijzigd;
- de belangrijkste conclusie;
- de grootste onzekerheden;
- de aanbevolen eerstvolgende stap;
- bevestiging dat het default dashboard niet is gewijzigd;
- eventuele tests in MCP test en hoe die zijn teruggedraaid of bewaard.

Commit of push niets tenzij ik daar expliciet om vraag.
