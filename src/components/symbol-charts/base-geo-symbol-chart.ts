import {LitElement, html, PropertyValueMap} from 'lit';
import {query, property} from 'lit/decorators.js';
import {map, tileLayer, svg, tooltip} from 'leaflet/dist/leaflet-src.esm.js';
import {select} from 'd3';
import {mapCss} from '../../common/css';
import {MAP_SERVER} from '../../common/constants';
import {GeoSymbolChartData} from './geo-symbol-chart-data';

const SVG_GROUP_ID = 'group';

export abstract class BaseGeoSymbolChart extends LitElement {
  @property({type: Array, attribute: 'lat-lng-bounds'})
  latLngBounds = [
    [79.6240562918881, -332.57812500000006],
    [-79.99716840285254, 332.22656250000006],
  ];

  @property({
    type: String,
  })
  symbol = '📍';

  @property({
    type: Array,
  })
  data!: GeoSymbolChartData[];

  @query('#geo-symbol-chart')
  private _mapElement!: HTMLElement;

  private _geoMap: any;
  private _toolTip: any;
  static override styles = [mapCss];

  override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    super.firstUpdated(_changedProperties);
    this._addMap();
    this._addSVGElements();
    this._addToolTip();
    this.init();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('data')) {
      this._updateSVG();
    }
  }

  override render() {
    return html`<div
      style="width:100%; height:100%"
      id="geo-symbol-chart"
    ></div>`;
  }

  getSvgGroup1Element() {
    return select(this._mapElement)
      .select('svg')
      .select('g#' + SVG_GROUP_ID + '1');
  }

  getLatLngToLayerPoint(lat, lng) {
    return this._geoMap.latLngToLayerPoint([lat, lng]);
  }

  showToolTip(data: GeoSymbolChartData) {
    return this._toolTip
      .setLatLng([data.lat, data.lng])
      .setContent(
        `<div>${data.symbol || this.symbol} ${data.text || ''}</div>
         <b><div>${data.value || 0}</div></b>
        `
      )
      .openOn(this._geoMap);
  }

  private _addMap() {
    this._geoMap = map(this._mapElement, {
      attributionControl: false,
      // zoomControl: false,
      // scrollWheelZoom: false,
      // dragging: false,
      // doubleClickZoom: false,
      // boxZoom: false,
      // touchZoom: false,
    }).fitBounds(this.latLngBounds);
    tileLayer(MAP_SERVER).addTo(this._geoMap);

    this._geoMap.on('moveend', () => {
      this._updateSVG();
    });
  }
  private _updateSVG() {
    this.updateSVG(this.data);
  }

  private _addSVGElements() {
    svg().addTo(this._geoMap);
    select(this._mapElement)
      .select('svg')
      .selectAll('g')
      .data([1])
      .join(
        (enter) => enter.append('g').attr('id', (elm) => SVG_GROUP_ID + elm),
        (update) => update.attr('id', (elm) => 'group' + elm),
        (exit) => exit.remove()
      );
  }

  private _addToolTip() {
    this._toolTip = tooltip();
  }

  protected abstract updateSVG(data: GeoSymbolChartData[]);
  protected abstract init();
}