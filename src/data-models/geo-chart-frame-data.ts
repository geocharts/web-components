export interface GeoChartDataFrame {
  label: string;
  data: GeoChartLocationData[];
}

export interface GeoChartLocationData {
  lat: number;
  lng: number;
  value: number;
  content: string;
  color: string;
}
