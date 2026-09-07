# Horizon Redesign — van Casa-disclosure naar een echte IA-vernieuwing

> Bouwt voort op [`pr-roadmap.md`](pr-roadmap.md) (privacy-model §1, MCP-Test-validatielus §2,
> CI-gates §4, branch/PR-conventies §3) en op [`casa-inspired-dashboard-roadmap.md`](casa-inspired-dashboard-roadmap.md)
> (Fasen B–F, alle gemerged). Dit document **vervangt niet** die twee plannen — het herdefinieert
> waar ze eindigden: Casa Fase G ("custom overview card, enkel indien gemeten nodig") en de
> aanname in `pr-roadmap.md` M3 dat kamerviews een 1:1/functionele-pariteit *lift* blijven.
> Vanaf hier is het bewust een visuele + structurele herontwerp, geen lift meer.
>
> Datum: 2026-09-07. **Niets in dit document is uitgevoerd** — het is een fasering die stap voor
> stap, per goedgekeurde branch/PR, wordt uitgevoerd zoals de rest van dit project (zie §6).

---

## 0. Aanleiding

In sessie is een concept-render doorlopen (Kia Connect-stijl als referentie — dezelfde rust,
witruimte en sectietabs als de bestaande `car.yaml`/`kia-dashboard-card`-view, toegepast op de
rest van het dashboard) en akkoord bevonden. De render was een losse HTML-mockup, geen Lovelace —
dit document vertaalt de bevestigde richting naar iets wat we in `dashboard/**` kunnen bouwen,
en legt vast welke technische aannames nog een spike nodig hebben vóór we 13 kamers aanraken.

## 1. Het herontwerp in het kort

- **Topnavigatie** — `Home · Kamers · Energie · Domeinen · Meer` in plaats van de ±12-chip
  nav-badge (`global_navigation_badges`).
- **Home** — begroeting + 3 samenvattingspillen (aanwezig / weer / aandachtspunten — die laatste
  enkel zichtbaar bij een afwijking) → **Snelacties** (gecureerde, kruis-kamer togglerij: alarm,
  garagepoort, sfeerlicht, airco, camera-privacy, "alle lichten uit", "rolluiken dicht") →
  **"Vandaag"-kaart** (weer + 4-daagse verwachting + energie als 2×3-grid van grote cijfers +
  afvalophaling) naast een **doorbladerbare camerakaart** (vorige/volgende, auto-cyclus, privacy-
  indicator enkel bij camera's die dat effectief hebben) → **Gezin** (aanwezigheid, zonder
  technische "niet recent bijgewerkt"-ruis) → een **compacte kamerlijst** waarvan elke rij een
  **quick-control-popup** opent (verlichting / rolluiken / luifels / radio / airco — per kamer
  verschillend, een lege categorie wordt gewoon weggelaten).
- **Kamers** — een doorbladerbaar grid van de 13 kamers (navigatie-hub, geen eigen content) →
  volledige kamerpagina: hero (naam + kern-stats) + sectietabs (Overzicht/Klimaat/Verlichting/
  Sensoren/Media) in plaats van het huidige ene blok met tientallen kleine iconen.
- **Doorlopend principe** — rust (alleen tonen wat relevant is), grote leesbare cijfers, en **drie
  dieptes voor drie soorten intentie**: Snelacties (vaste kleine set, kruis-kamer) → kamerlijst-
  popup (de paar bedienbare dingen van één kamer, geen navigatie) → volledige kamerpagina (alles,
  incl. sensoren/historiek).
- **Visuele taal** — hergebruikt de bestaande `juiced-horizon`-tokens (kleuren, radius, schaduw)
  1-op-1; dit is een IA/layout-herontwerp, geen nieuw kleurenschema.

## 2. Impact op het bestaande plan

| Bestaand item | Wat verandert |
| --- | --- |
| `pr-roadmap.md` M3 (PR-07…19, `room_view`-template) | Premise was 1:1-lift + lichte template voor herhaalde blokken. Wordt nu een structurele herbouw per kamer (hero + tabs). De Phase D-bouwstenen (`sensor_graph_mini`, `air_quality_mini`) blijven bruikbaar **binnen** de nieuwe Sensoren-tab — niet weggegooid. |
| Casa Fase C (Overview/detail-collapse, PR #45) | Gedeeltelijk vervangen: "collapse room mirrors tot nav-chips **binnen** `home.yaml`" wordt nu een aparte **Kamers-tab** (navigatie-hub) + een **kamerlijst-met-popup** op Home — geen chip-rijen meer in de hub zelf. |
| Nav-badge-verlichting (PR-39, niet gestart) | Wordt de topnav-herstructurering (Fase H1 hieronder) i.p.v. "het bestaande ±12-chip-badge optimaliseren". |
| Casa Fase G (custom overview card, P3) | Vervalt als losstaand idee. Als een custom card ooit nodig blijkt (bv. voor de camera-cyclus, zie §3.2), wordt dat afgewogen **binnen** de betreffende fase, gemeten — niet vooraf aangenomen. |
| Energiemeters/afvalophaling op home | Blijven, maar verhuizen naar de "Vandaag"-kaart (2×3-grid i.p.v. 15 losse gauges) — inhoudelijk ongewijzigd, enkel presentatie. |
| **Ongewijzigd** | Privacy-model (`pr-roadmap.md` §1), MCP-Test-validatielus (§2), CI-gates (§4), branch/PR-conventies (§3), `juiced-horizon`-theme, entity-mapping-laag, "default dashboard nooit wijzigen". |

## 3. Technische beslispunten — mens, vóór uitvoering

Deze render leunt op Lovelace-mechanismen die dit project nog niet gebruikt. Geen van onderstaande
wordt aangeraakt zonder expliciet akkoord.

1. **Kamer-popup-mechanisme** (verlichting/rolluiken/luifels/radio/airco tonen zonder te
   navigeren):
   - **(a) `browser_mod`** (HACS custom integration) — krachtigst, native "popup met willekeurige
     kaarten"; nieuwe dependency, extra resource, niet in de huidige resource-lijst.
   - **(b) Native `more-info`-dialoog** per entiteit (tik op één tegel) — geen nieuwe dependency,
     maar toont telkens één entiteit, geen gecombineerde kamer-popup met 5 categorieën.
   - **(c) Eigen lichte `custom:`-popup-kaart** — middenweg, extra onderhoud.
   - **Aanbeveling:** start met **(a)** als PoC op **één** kamer (Bureau — heeft alle 5
     categorieën, dus de zwaarste stress-test) vóór uitrol. Alternatief **(b)** als je liever geen
     nieuwe dependency toevoegt, met als concessie: geen gecombineerde popup, wel vijf losse
     `more-info`-taps per kamer.
2. **Sectietabs binnen de kamerpagina** (Overzicht/Klimaat/Verlichting/Sensoren/Media zonder
   paginareload): geen native HA-kaart hiervoor. Opties: `custom:` tab-kaart, `card_mod` +
   `conditional`-kaarten, of HA's nieuwere **Sections-strategie met meerdere subviews** (vereist
   een HA-versiecheck op deze instance). **Nog geen aanbeveling — aparte spike binnen Fase H4.**
3. **"Kamers" als tab blijft 13 aparte HA-views.** De render deed page-in-page-navigatie met JS
   omdat het een losse HTML-mockup was; in Lovelace is dat geen goed patroon. **Aanbeveling:**
   "Kamers" wordt een nieuwe, kleine navigatie-hub-view (grid met `navigate`-tegels naar de
   bestaande 13 views) — kleinste wijziging, geen page-in-page-truc nodig.
4. **Camera-cyclus** (auto-advance, vorige/volgende, privacy enkel bij relevante camera): geen
   natieve HA-kaart doet dit. Waarschijnlijk `auto-entities` + een kleine custom kaart, of
   `browser_mod`-gebonden JS als (a) hierboven al gekozen wordt. **Aparte spike, kan samenvallen
   met punt 1.**
5. **Scope Energie/Domeinen/Meer** — voorstel: *Energie* = bestaande `energy.yaml` (enkel
   verplaatst in de nav), *Domeinen* = nieuwe grid-hub naar de 10 resterende specialistviews (net,
   valliant, hainfo, water, person, ecopower, batteries1, anycubic, zwembad, car), *Meer* =
   instellingen/geschiedenis (HA-eigen, geen dashboardwerk).
6. **Privacy-model** — geen wijziging nodig aan `pr-roadmap.md` §1; dit is structuur/YAML, geen
   nieuwe entiteitstypen of secrets.

## 4. Herziene fasering

Elke fase = kleine, reviewbare branch/PR, dezelfde MCP-Test-validatielus als `pr-roadmap.md` §2
(extractie read-only → parameteriseer → schrijf → lokale CI → render + stage op MCP Test →
pariteit + visueel → PR-review → snapshot-rollback indien nodig). Default dashboard blijft
read-only; alles wordt eerst bewezen op `mcp-test-dashboard`.

| Fase | Doel | Omvang | Afhankelijk van |
| --- | --- | --- | --- |
| **H0** | Spike: kamer-popup PoC op Bureau | 1 view + evt. 1 nieuwe resource | Beslissing §3.1 |
| **H1** | Topnav-herstructurering (Home·Kamers·Energie·Domeinen·Meer) | `dashboard.yaml` + 2 nieuwe hub-views | — |
| **H2** | Home-hub herbouw (Vandaag + camera-cyclus + Snelacties) | `home.yaml` herschreven | H0 (camera), H1 |
| **H3** | Kamerlijst + quick-control popup, overige 12 kamers | Batchbaar, 2–3/PR | H0 |
| **H4** | Kamerpagina herbouw: hero + sectietabs, 13 kamers | Grootste stuk werk | Beslissing §3.2 |
| **H5** | Energie/Domeinen/Meer invulling | 2 nieuwe hub-views, geen contentwijziging | H1 |
| **H6** | Opruiming (oude nav-badge-template, overbodige Casa-chip-rijen) | Klein | H1–H3 |

### Fase H0 — Spike: kamer-popup PoC (Bureau) · P1

> **Status (2026-09-07, herzien):** mechanisme-beslissing (§3.1) genomen: **eigen custom card**,
> geen `browser_mod`. **Architectuur herzien** — niet als apart repo (de aanvankelijke
> `ju1ced/juiced-room-card`-spike), maar als HACS-packaging **in dit repo zelf**: `hacs.json`,
> TypeScript → esbuild → getrackte `dist/juiced-dashboard.js`, `hacs/action`-CI-validatie en een
> tag-getriggerde release-workflow (zelfde patroon als de sibling-repo's
> `ha-kia-connect-dashboard`/`garden-dashboard`). Card herbouwd in TypeScript als
> `custom:juiced-dashboard-room-card` in PR [#58](https://github.com/ju1ced/juiced-dashboard/pull/58);
> `juiced-room-card` wordt gearchiveerd zodra deze PR gemerged en getagd is. Uitdrukkelijk **geen**
> samenvoeging met `ju1ced/home-dashboard` (apart project, apart ontwikkeld, zie project-notities).
> CI groen (typecheck + build + 37 unit-/render-smoke-tests + hacs/action-structuurcheck) en
> handmatig geverifieerd in een echte browser via `docs/renders/preview.html` (lijst + popup, alle
> vier secties). **Nog niet gedaan:** geïnstalleerd/getoetst op een echte Home Assistant-instance
> of MCP Test, en een echte README-screenshot (2 van de 8 `hacs/action`-checks — license/images —
> hangen af van de default branch en sluiten pas na merge).

- **Doel:** bewijs het gekozen mechanisme (§3.1) end-to-end vóór 13 kamers worden aangeraakt —
  dit was de enige aanname in de hele render die nog niet technisch bevestigd was.
- **Bestanden:** `src/`, `dist/`, `hacs.json`, `test/` in dít repo (niet meer een apart repo) —
  zie [`docs/hacs-card.md`](hacs-card.md). In dit repo volgt nog: de resource toevoegen aan
  `dashboard/resources.yaml` en een testview op MCP Test met `custom:juiced-dashboard-room-card`
  voor Bureau.
- **Resterende acceptatie:** resource geregistreerd op MCP Test, popup opent/sluit met een echte
  MCP-Test-entiteit, minstens één toggle werkt end-to-end, 0 error-cards, screenshot dark + light.
- **Risico:** laag nu de card zelf werkt (unit-getest); resterend risico zit in de HA-integratie
  (resource laden, thema-tokens die effectief doorkomen op een echte instance).

### Fase H1 — Topnav-herstructurering · P1

- Vervangt het nav-badge-verlichtingsplan (PR-39). Nieuwe hub-views `kamers.yaml`, `domeinen.yaml`;
  bestaande views blijven 1:1 bereikbaar via die hubs.
- **Acceptatie:** link-audit — elke view die vandaag via de nav-badge bereikbaar is, blijft
  bereikbaar; functionele pariteit (geen entiteit verdwijnt).

### Fase H2 — Home-hub herbouw · P1 (na H0/H1)

- Vervangt de huidige `home.yaml` (na Casa B/C/D/E/F) door de indeling uit §1.
- **Acceptatie:** aangepast pariteitsbegrip — geen exacte card-diff meer (de render is bewust geen
  1:1 layout), wel een **bereikbaarheids-diff**: elke entiteit die vandaag op home staat, blijft
  ergens bereikbaar (Snelacties, kamerlijst-popup, of de volledige kamerpagina). Dit vervangt de
  set-diff-methode uit `pr-roadmap.md` §2 voor deze fase specifiek — de tuple-set-diff blijft wel
  het hek voor H4 (kamerpagina's), waar de content per kaart nog wel 1:1 herleidbaar is.

### Fase H3 — Kamerlijst + quick-control popup, 13 kamers · P2 (na H0)

- Rolt het H0-mechanisme uit over de overige 12 kamers; per kamer een klein config-blok (welke
  categorieën gelden: licht/rolluik/luifel/radio/airco) — analoog aan de `ROOM_QUICK`-datastructuur
  uit de render. Batchbaar, 2–3 kamers per PR (zoals `pr-roadmap.md` §5 al toelaat voor lichte
  views).

### Fase H4 — Kamerpagina herbouw: hero + sectietabs · P2/P3 (grootste stuk werk, na §3.2-beslissing)

- 13 kamerpagina's van "één blok" naar hero + tabs. Bouwt voort op de Phase D-bouwstenen
  (`sensor_graph_mini`, `air_quality_mini`) als inhoud van de Sensoren-tab.
- **Volgorde:** licht → zwaar, zelfde principe als `pr-roadmap.md` §6 M3 — Bureau of Badkamer
  eerst als referentie (Bureau heeft alle 5 categorieën, dus de beste stress-test).
- **Acceptatie:** functionele pariteit via de tuple-set-diff (`entity, card_type, action`), zoals
  `pr-roadmap.md` §2, toegepast per sectietab in plaats van op de hele view ineens.

### Fase H5 — Energie/Domeinen/Meer invulling · P3

- *Energie*: bestaande `energy.yaml`, enkel navigatie-koppeling. *Domeinen*: nieuwe grid-hub naar
  de 10 specialistviews (geen wijziging aan die views zelf). *Meer*: instellingen/geschiedenis.

### Fase H6 — Opruiming oude patronen · P3

- Verwijder `global_navigation_badges` zodra H1 live is; verwijder de Casa-Fase-C-chiprijen in
  `home.yaml` die door H2/H3 vervangen zijn.

## 5. Wat niet verandert

MCP-Test-validatielus, snapshot-vooraf, privacy-mapping-laag, CI-gates, `juiced-horizon`-tokens
(1-op-1 hergebruikt in de render), branch/PR-conventies, "default dashboard nooit wijzigen",
"geen automations/scripts/scenes/helpers/integraties/entiteiten wijzigen — enkel dashboard-YAML".

## 6. Volgende stap

`custom:juiced-dashboard-room-card` bestaat, is HACS-installeerbaar vanuit dit repo, en is
handmatig geverifieerd in een browser (§4, Fase H0-status; PR
[#58](https://github.com/ju1ced/juiced-dashboard/pull/58)). Resterend om H0 volledig te sluiten —
**niets hiervan is uitgevoerd zonder jouw akkoord:**

1. PR #58 mergen, `v0.1.0` taggen/releasen, en daarna `ju1ced/juiced-room-card` archiveren
   (per afspraak deze sessie).
2. Een echte screenshot uit `docs/renders/preview.html` toevoegen aan de README (laatste
   `hacs/action`-bevinding).
3. Installeer de card op de echte Home Assistant-instance (HACS custom repository) en voeg de
   resource toe.
4. Zet een testview met `custom:juiced-dashboard-room-card` voor Bureau op **MCP Test** (snapshot
   vooraf, zoals altijd), met een config die alle 5 categorieën dekt (licht/rolluik/luifel/radio/airco).
5. Verifieer de resterende acceptatiecriteria (popup opent/sluit, een echte toggle werkt,
   0 error-cards, screenshot dark + light) en rapporteer terug.

Na een akkoord op deze vijf stappen is H0 gesloten en kan H1 (topnav-herstructurering) starten.
