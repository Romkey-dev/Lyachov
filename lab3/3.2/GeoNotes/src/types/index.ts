export interface GeoNote {
  id: string;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  address?: string;
  photoUri?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AppState {
  notes: GeoNote[];
  currentLocation: LocationInfo | null;
  loading: boolean;
  error: string | null;
}
