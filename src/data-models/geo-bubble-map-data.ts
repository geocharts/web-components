export interface GeoBubbleMapDataFrame {
  label: string;
  data: GeoBubbleMapData[];
}

export interface GeoBubbleMapData {
  lat: number;
  lng: number;
  value: number;
  content: string;
  color: string;
}
