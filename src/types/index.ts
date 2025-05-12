export interface Point {
  lat: number;
  lng: number;
  height?: number;
}

export interface PathPoint extends Point {
  sortNum: number;
}

export interface BoundaryData {
  paths: Point[];
  styleId?: string;
  rank?: number;
  id?: string;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export type AlertType = 'info' | 'success' | 'warning' | 'danger';
