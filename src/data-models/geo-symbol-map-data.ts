export interface GeoSymbolMapDataFrame {
  label: string;
  data: GeoSymbolMapData[];
}

export interface GeoSymbolMapData {
  lat: number;
  lng: number;
  value: number;
  content: string;
  color: string;
}
