export interface GeoSymbolMapData {
  description: string;
  geoSymbolDataFrame: GeoSymbolDataFrame[];
}

export interface GeoSymbolDataFrame {
  label: string;
  geoSymbolData: GeoSymbolData[];
}

export interface GeoSymbolData {
  symbol: string;
  lat: number;
  lng: number;
  value1: number;
  value2: number;
  value3: number;
  value4: number;
}
