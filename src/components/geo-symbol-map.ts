import {LitElement, html, PropertyValueMap} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {select, ScaleLinear, scaleLinear, easeLinear} from 'd3';
import {map, tileLayer, svg} from 'leaflet/dist/leaflet-src.esm.js';
import {MAP_SERVER} from '../common/constants';
import {GeoSymbolMapData} from '../data-models/geo-symbol-data';

@customElement('geo-symbol-map')
export class GeoSymbolMap extends LitElement {
  @property({type: Array, attribute: 'center-lat-lng'})
  centerLatLng = [0, 0];

  @property({type: Number})
  zoom = 5;

  @property({type: Number})
  frameRate = 1000;

  @property({
    type: Object,
    hasChanged: (newVal: any, oldVal: any) =>
      JSON.stringify(newVal) !== JSON.stringify(oldVal),
  })
  data!: GeoSymbolMapData;

  private _id = 'geo-symbol-map-' + Math.random().toString(36).substring(2, 10);
  private _geoMap: any;
  private _frameIndex = 0;
  private _timerInterval!: ReturnType<typeof setInterval>;
  private _scale!: ScaleLinear<number, number, never>;

  override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    super.firstUpdated(_changedProperties);
    this._createMap();
    this._createSVGElements();
    this._startFrames();
  }

  override attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null
  ) {
    super.attributeChangedCallback(name, oldVal, newVal);
    this._inputChanged();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('data')) {
      this._inputChanged();
    }
  }

  override disconnectedCallback(): void {
    clearInterval(this._timerInterval);
    super.disconnectedCallback();
  }

  private _createMap() {
    const mapElement = this.shadowRoot?.getElementById(this._id);
    if (mapElement) {
      this._geoMap = map(mapElement, {attributionControl: false}).setView(
        this.centerLatLng,
        this.zoom
      );
      tileLayer(MAP_SERVER).addTo(this._geoMap);

      this._geoMap.on('moveend', () => {
        this._updateSVG();
      });
    }
  }

  private _startFrames() {
    this._timerInterval = setInterval(() => {
      this._frameIndex++;
      this._updateSVG();
    }, this.frameRate);
  }

  private _createSVGElements() {
    const mapElement = this.shadowRoot?.getElementById(this._id);
    if (mapElement && this._geoMap) {
      svg().addTo(this._geoMap);
      select(mapElement)
        .select('svg')
        .selectAll('g')
        .data([1, 2, 3, 4])
        .join(
          (enter) => enter.append('g').attr('id', (elm) => this._id + elm),
          (update) => update.attr('id', (elm) => this._id + elm),
          (exit) => exit
        );
    }
  }

  private _inputChanged() {
    const minValue = 0;
    const maxValue = 40000;
    this._scale = scaleLinear([minValue, maxValue], [2, 35]);

    this._frameIndex = 0;
    this._updateSVG();
  }

  private _updateSVG() {
    if (this._frameIndex >= this.data.geoSymbolDataFrame.length) {
      this._frameIndex = 0;
    }
    const geoSymbolDataFrame = this.data.geoSymbolDataFrame[this._frameIndex];
    const mapElement = this.shadowRoot?.getElementById(this._id);
    if (mapElement) {
      select(mapElement)
        .select('svg')
        .select('g#' + this._id + 1)
        .selectAll('circle')
        .data(geoSymbolDataFrame.geoSymbolData)
        .join(
          (enter) =>
            enter
              .append('circle')
              .attr(
                'cx',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x
              )
              .attr(
                'cy',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y
              )
              .attr('r', (d) => this._scale(d.value1))
              .style('fill', 'red')
              .attr('stroke', 'red')
              .attr('stroke-width', 3)
              .attr('fill-opacity', 0.4),
          (update) =>
            update
              .attr(
                'cx',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x
              )
              .attr(
                'cy',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y
              )
              .transition()
              .ease(easeLinear)
              .duration(this.frameRate)
              .attr('r', (d) => this._scale(d.value1)),
          (exit) => exit
        );
    }
  }

  override render() {
    console.log(this.centerLatLng, this.frameRate);
    return html`
      <link
        rel="stylesheet"
        type="text/css"
        href="../node_modules/leaflet/dist/leaflet.css"
      />
      <div style="width:100%; height:100%" id=${this._id}>Hello11</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-map': GeoSymbolMap;
  }
}
