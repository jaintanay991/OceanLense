export interface AppState {
  activeRegionType: 'GLOBAL' | 'OCEAN' | 'SEA';
  activeOceanId: string | null;
  activeSeaId: string | null;
  scientificVariable: 'temperature' | 'salinity' | null;
  scientificDepth: number;
}

export type SetAppState = (
  updater: (prev: AppState) => AppState
) => void;
