import type { VaultMeta } from '../../storage/electron';

export type VaultSidebarFilter = 'all' | 'recent' | 'favorites' | 'shared' | 'tagged';

export interface VaultPickerPrefs {
  favorites: string[];
  shared: string[];
  tags: Record<string, string[]>;
}

export function createDefaultVaultPickerPrefs(): VaultPickerPrefs {
  return { favorites: [], shared: [], tags: {} };
}

export function filterVaultsByView(
  vaults: VaultMeta[],
  query: string,
  view: VaultSidebarFilter,
  prefs: VaultPickerPrefs,
  now: Date = new Date()
): VaultMeta[] {
  const normalized = query.trim().toLowerCase();
  const nowMs = now.getTime();

  return vaults.filter((vault) => {
    if (normalized && !vault.name.toLowerCase().includes(normalized)) {
      return false;
    }

    if (view === 'favorites') {
      return prefs.favorites.includes(vault.id);
    }
    if (view === 'shared') {
      return prefs.shared.includes(vault.id);
    }
    if (view === 'tagged') {
      const tags = prefs.tags[vault.id] || [];
      return tags.length > 0;
    }
    if (view === 'recent') {
      const lastAccessedMs = new Date(vault.lastAccessedAt).getTime();
      const daysDiff = (nowMs - lastAccessedMs) / (1000 * 60 * 60 * 24);
      return Number.isFinite(daysDiff) && daysDiff <= 7;
    }

    return true;
  });
}

export function normalizeTags(text: string): string[] {
  return text
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 8);
}
