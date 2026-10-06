import type {CoinDisplay, CoinPlace} from './coin-map';

// Keep hidden city collections reachable without moving their historical anchors.
export function hiddenCityCollections(layout: readonly CoinDisplay[]): CoinPlace[] {
  const groups = new Map<string, CoinPlace>();
  for (const entry of layout) {
    if (!entry.occluded || entry.stage === 'near' || entry.overflow) continue;
    for (const group of entry.collectionGroups) {
      if (group.members.some(member => member.recordCount > 0)) {
        groups.set(group.place.id, group);
      }
    }
  }
  return [...groups.values()].sort((a, b) => a.place.id.localeCompare(b.place.id));
}
