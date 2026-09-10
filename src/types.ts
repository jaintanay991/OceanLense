export interface AppState {
  activeRegionType: 'GLOBAL' | 'OCEAN' | 'SEA';
  activeOceanId: string | null;
  activeSeaId: string | null;
  scientificVariable: 'temperature' | 'salinity' | 'currents' | null;
  scientificDepth: number;
  scientificOpacity: number;
  scientificRange: { min: number, max: number } | null;
  currentPlaying: boolean;
  currentSpeed: number; // visual playback speed 0.1 to 3.0
  activeObservations: ('argo' | 'glider' | 'ctd' | 'bgc')[];
  selectedObservationId: string | null;
  isModelVsObs: boolean;
}

export type SetAppState = (
  updater: (prev: AppState) => AppState
) => void;
