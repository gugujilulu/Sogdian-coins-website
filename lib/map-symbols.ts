import type {SymbolRole} from './map-layers';
// Original 32-unit pen drawings; one source for markers and legend. No third-party assets.
const paths:Record<SymbolRole,string>={
 city:'M5 25V12h4V8h4v4h6V8h4v4h4v13H5Zm8 0v-7a3 3 0 0 1 6 0v7M7 16h3m12 0h3M3 27h26',
 center:'M5 25V14h7V9h8v5h7v11H5Zm8 0v-6h6v6M12 9V5l4 2 4-2v4M3 27h26M8 18h2m12 0h2',
 site:'M5 26V15l4-3 3 3V8h5v9h5v-5h5v14M3 27h26M8 18v5m7-12v8m10-3v7M12 23h7',
 mint:'M5 25h22M8 25v-4h16v4M9 17l13-9 3 4-13 9-3-4Zm7-10 2-3 5 3-2 3M7 7a5 5 0 1 0 1 10M5 10h3v3H5z',
 'mint-candidate':'M5 25h22M8 25v-4h16v4M9 17l13-9 3 4-13 9-3-4ZM4 7a3 3 0 1 1 4 3v3M8 16h.1',
 findspot:'M4 25h24M8 22l4-3m9 3 3-2M16 5a6 6 0 0 1 6 6c0 4-6 9-6 9s-6-5-6-9a6 6 0 0 1 6-6Zm-2 4h4v4h-4z',
 hoard:'M10 8h12l-2 4c8 4 7 14-4 14S4 16 12 12l-2-4ZM10 12h12M12 18a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm3-1h2v2h-2zM12 4h8'
};
export function symbolSvg(role:SymbolRole){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none"><path d="${paths[role]}" stroke="#fff8e7" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="${paths[role]}" stroke="${role==='hoard'||role==='findspot'?'#8d533e':'#403e31'}" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
export function symbolUrl(role:SymbolRole){return `data:image/svg+xml,${encodeURIComponent(symbolSvg(role))}`}
