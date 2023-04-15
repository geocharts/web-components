export interface GeoMapDataFrame {
  label: string;
  data: GeoMapLocationData[];
}

export interface GeoMapLocationData {
  lat: number;
  lng: number;
  value: number;
  content: string;
  color: string;
}
