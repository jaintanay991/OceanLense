export interface AppState {
  activeRegionType: 'GLOBAL' | 'OCEAN' | 'SEA';
  activeOceanId: string | null;
  activeSeaId: string | null;
}

export type SetAppState = (
  updater: (prev: AppState) => AppState
) => void;
