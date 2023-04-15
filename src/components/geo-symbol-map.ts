import {LitElement, html, PropertyValueMap, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {select, easeLinear, ScaleLinear, scaleLinear} from 'd3';
import {map, tileLayer, svg} from 'leaflet/dist/leaflet-src.esm.js';
import {MAP_SERVER} from '../common/constants';
import {GeoSymbolMapDataFrame} from '../data-models/geo-symbol-map-data';
import {GeoMapInfo} from './geo-map-info';

@customElement('geo-symbol-map')
export class GeoSymbolMap extends LitElement {
  static override styles = css`
    .info {
      padding: 10px;
      font-size: 30px;
      font-family: Arial, Helvetica, sans-serif;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
      border-radius: 15px;
    }
    .description {
      font-size: 15px;
      padding: 5px;
      font-family: Arial, Helvetica, sans-serif;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }
  `;

  @property({type: Array, attribute: 'lat-lng-center'})
  latLngCenter = [0, 0];

  @property({type: Number})
  zoom = 5;

  @property({type: Number, attribute: 'frame-rate'})
  frameRate = 1000;

  @property({type: String, attribute: 'symbol-max-size'})
  symbolMaxSize = 50;

  @property({type: String})
  description!: string;

  @property({type: String, attribute: 'description-location'})
  descriptionLocation = 'topright';

  @property({type: String, attribute: 'frame-ticker-location'})
  frameTickerLocation = 'topright';

  @property({type: String})
  content = '😂';

  @property({
    attribute: false,
    type: Object,
    hasChanged: (newVal: any, oldVal: any) =>
      JSON.stringify(newVal) !== JSON.stringify(oldVal),
  })
  data!: GeoSymbolMapDataFrame[];

  @query('#geo-symbol-map')
  private _mapElement!: HTMLElement;
  private _geoMap: any;
  private _frameIndex = 0;
  private _timerInterval!: ReturnType<typeof setInterval>;
  private _scale!: ScaleLinear<number, number, never>;
  private _frameTicker!: GeoMapInfo;

  override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    super.firstUpdated(_changedProperties);
    this._createMap();
    this._createSVGElements();
    this._startFrames();

    new GeoMapInfo(
      this._geoMap,
      this.descriptionLocation,
      `<div class="description">${this.description}</div>`
    );
    this._frameTicker = new GeoMapInfo(
      this._geoMap,
      this.frameTickerLocation,
      ''
    );
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
    this._geoMap = map(this._mapElement, {attributionControl: false}).setView(
      this.latLngCenter,
      this.zoom
    );
    tileLayer(MAP_SERVER).addTo(this._geoMap);

    this._geoMap.on('moveend', () => {
      this._updateSVG();
    });
  }

  private _createSVGElements() {
    if (this._geoMap) {
      svg().addTo(this._geoMap);
      select(this._mapElement)
        .select('svg')
        .selectAll('g')
        .data([1])
        .join(
          (enter) =>
            enter.append('g').attr('id', (elm) => 'symbol-group' + elm),
          (update) => update.attr('id', (elm) => 'symbol-group' + elm),
          (exit) =>
            exit.transition().ease(easeLinear).duration(this.frameRate).remove()
        );
    }
  }

  private _startFrames() {
    this._timerInterval = setInterval(() => {
      this._frameIndex++;
      this._updateSVG();
    }, this.frameRate);
  }

  private _inputChanged() {
    if (this.data?.length > 0) {
      this._frameIndex = 0;
      const minValue = Math.min(
        ...this.data.map((frameObj) =>
          Math.min(...frameObj.data.map((dataObj) => dataObj.value))
        )
      );

      const maxValue = Math.max(
        ...this.data.map((frameObj) =>
          Math.max(...frameObj.data.map((dataObj) => dataObj.value))
        )
      );
      this._scale = scaleLinear([minValue, maxValue], [0, this.symbolMaxSize]);
      this._updateSVG();
    }
  }

  private _getFrameTickerTemplate(frameTitle: string) {
    return `<div>
        <div class="info">${frameTitle}</div>
      </div>`;
  }

  private _updateSVG() {
    this._updateSVGWithSingleSymbol();
  }

  private _updateSVGWithSingleSymbol() {
    if (this.data?.length > 0) {
      if (this._frameIndex >= this.data.length) {
        this._frameIndex = 0;
      }
      const geoSymbolMapDataFrame = this.data[this._frameIndex];
      this._frameTicker.update(
        this._getFrameTickerTemplate(geoSymbolMapDataFrame.label)
      );
      select(this._mapElement)
        .select('svg')
        .select('g#' + 'symbol-group1')
        .selectAll('text')
        .data(geoSymbolMapDataFrame.data)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr(
                'x',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x
              )
              .attr(
                'y',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y
              )
              .text(this.content)
              .style('font-size', (d) => this._scale(d.value) + 'px'),
          (update) =>
            update
              .transition()
              .ease(easeLinear)
              .duration(this.frameRate)
              .attr(
                'x',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x
              )
              .attr(
                'y',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y
              )
              .text(this.content)
              .style('font-size', (d) => this._scale(d.value) + 'px'),
          (exit) =>
            exit.transition().ease(easeLinear).duration(this.frameRate).remove()
        );
    }
  }

  override render() {
    return html`
      <link
        rel="stylesheet"
        type="text/css"
        href="../node_modules/leaflet/dist/leaflet.css"
      />
      <div style="width:100%; height:100%" id="geo-symbol-map"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-map': GeoSymbolMap;
  }
}
