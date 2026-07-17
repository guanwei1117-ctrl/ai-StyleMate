export const STYLE_PROFILE_STORAGE_KEY = 'stylemate.styleProfile.v1';

export function clearStyleProfileFromStorage(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(STYLE_PROFILE_STORAGE_KEY);
}
