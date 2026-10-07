# Central Asian Square-Hole Coinage Atlas

**An independent digital heritage project connecting Central Asian coinage, cultural exchange and accessible research.**

[Explore the live atlas](https://sogdian-cash-atlas.gugu4-5.chatgpt.site) · [Browse the repository](https://github.com/gugujilulu/Sogdian-coins-website) · [Suggest a correction](https://github.com/gugujilulu/Sogdian-coins-website/issues)

![Atlas on desktop](docs/screenshots/atlas-desktop.png)

## Why this project exists

How can the cultural value of Sogdian and Central Asian coinage become more accessible in the digital age?

These coins offer a material route into the history of exchange between China, Central Asia and neighbouring societies. Their inscriptions, symbols and monetary forms connect questions of language, identity, trade and political authority. Making this material easier to explore can bring a specialised field into wider conversations about cultural heritage and historical connections.

The Central Asian Square-Hole Coinage Atlas grew out of that question. Relevant material is distributed across specialist databases, catalogues and individual records. The project brings photographs, source references, historical geography and editorial classifications into a shared map and catalogue, helping visitors move from an individual object to its wider context.

Its purpose is to build a public-facing digital resource that supports cultural education, comparative research and dialogue between collectors, researchers and cultural institutions.

## Explore the first edition

The live atlas combines a geographical view with a searchable catalogue:

- **56 editorial coin families**, **120 source/catalogue groups** and **1,010 records with 1,013 images**.
- Search by family, source record and historical place, with combined date, region and source filters.
- Open original photographs, compare records and follow links to their sources.
- Explore in **English, Chinese and Russian**.
- Browse on desktop or use the mobile detail panel in summary, half-height or reading mode.

Start with the map, select a city collection and open a coin family. The catalogue also provides access to records without mapped locations. The Research section brings together bibliography, coverage notes and future research directions.

A separate research-material gallery contains **701 related, held or excluded records**. Record counts describe imported source material; multiple records may refer to the same physical coin.

## Cultural and research value

**Public access to specialist knowledge.** The atlas provides a visual entry point for people who may be unfamiliar with Central Asian numismatics. Multilingual navigation and geographical context help connect individual objects with places, traditions and historical questions.

**Comparative exploration.** Bringing coin families, photographs and source references into one interface makes it easier to examine similarities and differences across regions and traditions. The intended research value lies in supporting comparison and helping users identify material for closer study.

**Traceable evidence.** Source identities, attribution notes and uncertainty remain attached to the material. Visitors can return to the original record, assess an interpretation and propose a correction with supporting evidence.

**A foundation for collaboration.** The data structure and interface provide a basis for expanding the corpus, incorporating specialist review and developing educational resources with researchers and cultural organisations.

## Independent project ownership

I initiated and developed this project as the cultural heritage and public-interest component of my personal portfolio, bringing together my background in design, product management and data science.

The work connects a cultural question with an operational digital product: defining its scope and audiences, structuring heterogeneous records, preserving provenance, designing map and catalogue interactions, implementing a multilingual interface and deploying the application.

| Area | Work represented in the project |
| --- | --- |
| Product development | Translating a specialist cultural domain into navigable discovery and research workflows |
| Data modelling | Separating editorial families, source groups, records and historical location roles |
| Data quality and provenance | Retaining source references, review decisions and uncertain attributions |
| User experience | Integrating map exploration, catalogue search, photographs and mobile reading modes |
| Software engineering | Building a React and TypeScript application with geographic visualisation and reproducible Python data exports |
| Public engagement | Developing a resource for cultural interpretation, specialist discussion and educational outreach |

## Collaboration and future direction

The next direction is to develop the atlas through specialist feedback and institutional dialogue. Planned outreach includes **Zeno and its numismatic community**, alongside **cultural institutions in China** with relevant collections, research interests or public education programmes.

Areas I intend to explore with potential collaborators include:

- **Corpus review and enrichment:** checking classifications, reconciling records and identifying additional material.
- **Responsible source integration:** discussing attribution, permissions and ways to connect users with existing collections and databases.
- **Cultural education:** developing accessible narratives, presentations and digital exhibitions around Central Asian coinage and historical exchange.
- **Research extensions:** expanding tamgha, inscription and language resources, supported by specialist interpretation and bibliography.

These collaborations are planned outreach objectives. The current edition establishes the working resource through which those discussions can take place.

Further development includes additional coin families and auction records, dated historical-map versions, and evidence-backed hoard, findspot and circulation layers.

## How the material is organised

The working scope covers Central Asian and related Inner Asian traditions derived from Chinese-style square-hole cash, including Sogdiana, Chach, Ferghana, Semirechye, the Tarim region and neighbouring contact zones.

Families are editorial groupings; catalogue groups retain their source identities. Historical locations preserve their stated roles, while uncertain dates and competing attributions remain visible. City anchors identify geographical context without automatically establishing a mint or findspot.

The current map has **14 registered places**, with **38 families mapped** and **18 accessible through the catalogue**. Verified hoard and findspot layers await supporting evidence. See [Corpus notes](docs/corpus-notes.md) for acquisition history, coverage and source policies.

## Technology and project structure

The application uses **React, TypeScript, MapLibre GL and Vinext**. Python scripts produce the normalised display export and SQLite research database.

| Path | Purpose |
| --- | --- |
| `app/`, `components/atlas/` | Map, catalogue, research pages and detail panels |
| `lib/` | Search, filtering, display text and map layout |
| `public/data/atlas.json` | Normalised display export |
| `research/` | Source snapshots, provenance and review decisions |
| `db/schema.sql` | Research database model |
| `scripts/` | Collection, validation and reproducible exports |

[Development notes](docs/project-notes.md) explain the data model and interaction decisions.

## Run locally

Requires Node.js 22.13 or later, pnpm 11.25 and Python 3. Install Pillow for the data scripts.

```sh
git clone https://github.com/gugujilulu/Sogdian-coins-website.git
cd Sogdian-coins-website
pnpm install --frozen-lockfile
pnpm dev
```

The development server prints its address. Run `pnpm build` for a production build; `pnpm start` serves the generated worker locally.

### Validation

```sh
python -m pip install Pillow
python scripts/validate-atlas.py
pnpm exec tsc --noEmit
node --test tests/phase1-final.test.mjs
pnpm build
```

## Sources, credits and corrections

Photographs retain their original credits and source links. Map attribution remains visible in the application. Source policies are documented in `research/source-provenance-policy.json` and `research/source-authorities.json`.

Questions and corrections are welcome through [GitHub issues](https://github.com/gugujilulu/Sogdian-coins-website/issues). Please include the record ID and supporting source so that proposed changes can be reviewed against the evidence.

## Licensing

No general reuse licence has been granted for this repository. Third-party photographs, source texts, map services and fonts retain their own rights and terms. Font licences are included with their files in `public/visual/t47/fonts/`; bundled build and style dependencies retain their licence notices in `build/` and `vendor/`. Consult the per-record provenance before reusing source material.
