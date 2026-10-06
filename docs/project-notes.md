# Development notes

## Keeping source records separate from objects

A source page, a photograph and a physical coin have different identities. One page may contain several coins, and the same photograph may appear in more than one database. The import keeps provider and original record key together; physical identity is reconciled only when the evidence supports it.

This choice adds some work to the model, but it makes corrections traceable. Original HTML, images and competing claims remain available alongside the display export.

## Map and catalogue

The map is a way into the collection. The catalogue also includes records without dates or coordinates, so incomplete geographical metadata does not make a coin inaccessible.

City collections use stable place IDs. Where small-screen layout hides a collection marker, a separate collection list preserves access to its members. Map placement is display geometry; the underlying historical coordinates stay unchanged.

## Detail panels

On desktop, the family panel sits beside the map. On mobile, the same content uses three panel heights. Introduction, location and catalogue navigation precede the filters and photographs, keeping useful context within reach for families with long galleries.

Visual order follows DOM order so keyboard navigation follows the same sequence. Closing a photograph returns to its family panel; returning to a city collection restores the current collection context.

## Languages and original text

English, Chinese and Russian display text is kept separately from the source descriptions. Readers can inspect the original wording where it differs from the translated presentation.

The current description mapping covers 1,007 of 1,010 records. Three records without an individual body use family background. Bibliographic titles and citations retain their source wording where translation would make identification harder.

## Next edition

The next research work concerns dated polity-map versions, archaeological centres and mints, findspots and hoards, and regional circulation evidence. Each layer needs explicit sources and coverage notes before it can support historical interpretation.

The repository keeps its real development history, including fixes and review corrections. Current maintenance status is recorded in [STATUS](workflow/STATUS.md).
