import {LitElement, html, PropertyValueMap, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {select, easeLinear, ScaleLinear, scaleLinear} from 'd3';
import {map, tileLayer, svg} from 'leaflet/dist/leaflet-src.esm.js';
import {MAP_SERVER} from '../common/constants';
import {SequentialGeoMapColor} from '../common/sequential-color';
import {GeoBubbleMapDataFrame} from '../data-models/geo-bubble-map-data';
import {GeoMapInfo} from './geo-map-info';

@customElement('geo-bubble-map')
export class GeoBubbleMap extends LitElement {
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

  @property({type: Array, attribute: 'lat-lng-bounds'})
  latLngBounds = [
    [79.6240562918881, -332.57812500000006],
    [-79.99716840285254, 332.22656250000006],
  ];

  @property({type: Number, attribute: 'frame-rate'})
  frameRate = 1000;

  @property({type: String, attribute: 'bubble-max-size'})
  bubbleMaxSize = 3;

  @property({type: String, attribute: 'color-scheme'})
  colorScheme = 'red';

  @property({type: String, attribute: 'bubble-stroke'})
  bubbleStroke = '#3B5998';

  @property({type: String, attribute: 'map-title'})
  mapTitle = '';

  @property({type: String, attribute: 'title-loc'})
  titleLoc = 'topright';

  @property({type: String, attribute: 'ticker-loc'})
  tickerLoc = 'topright';

  @property({
    attribute: false,
    type: Object,
    hasChanged: (newVal: any, oldVal: any) =>
      JSON.stringify(newVal) !== JSON.stringify(oldVal),
  })
  data!: GeoBubbleMapDataFrame[];

  @query('#geo-bubble-map')
  private _mapElement!: HTMLElement;

  private _geoMap: any;
  private _frameIndex = 0;
  private _timerInterval!: ReturnType<typeof setInterval>;
  private _scale!: ScaleLinear<number, number, never>;
  private _colorScale = new SequentialGeoMapColor(this.colorScheme, []);
  private _frameTicker!: GeoMapInfo;
  private _domRect!: DOMRect;

  override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    super.firstUpdated(_changedProperties);
    this._createMap();
    this._createSVGElements();
    this._showMapInfo();
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
    this._geoMap = map(this._mapElement, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoom: false,
    }).fitBounds(this.latLngBounds);
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
            enter.append('g').attr('id', (elm) => 'bubble-group' + elm),
          (update) => update.attr('id', (elm) => 'bubble-group' + elm),
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
    this._domRect = this.getBoundingClientRect();
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

      console.log(
        '(this.bubbleMaxSize / 100) * this._domRect.width =',
        (this.bubbleMaxSize / 100) * this._domRect.width
      );
      this._scale = scaleLinear(
        [minValue, maxValue],
        [0, (this.bubbleMaxSize / 100) * this._domRect.width]
      );
      this._colorScale.update(this.colorScheme, [minValue, maxValue]);
      this._updateSVG();
    }
  }

  private _getFrameTickerTemplate(frameTitle: string) {
    return `<div>
        <div class="info">${frameTitle}</div>
      </div>`;
  }

  private _showMapInfo() {
    new GeoMapInfo(
      this._geoMap,
      this.titleLoc,
      `<div class="description">${this.mapTitle}</div>`
    );
    this._frameTicker = new GeoMapInfo(this._geoMap, this.tickerLoc, '');
  }

  private _updateSVG() {
    if (this.data?.length > 0) {
      if (this._frameIndex >= this.data.length) {
        this._frameIndex = 0;
      }
      const geoBubbleMapDataFrame = this.data[this._frameIndex];
      this._frameTicker.update(
        this._getFrameTickerTemplate(geoBubbleMapDataFrame.label)
      );
      select(this._mapElement)
        .select('svg')
        .select('g#' + 'bubble-group1')
        .selectAll('circle')
        .data(geoBubbleMapDataFrame.data)
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
              .attr('r', (d) => this._scale(d.value))
              .style('fill', (d) => d.color || this._colorScale.get(d.value))
              .attr('stroke', this.bubbleStroke)
              .attr('fill-opacity', 0.6),
          (update) =>
            update
              .transition()
              .ease(easeLinear)
              .duration(this.frameRate)
              .attr(
                'cx',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x
              )
              .attr(
                'cy',
                (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y
              )
              .attr('r', (d) => this._scale(d.value))
              .style('fill', (d) => d.color || this._colorScale.get(d.value))
              .attr('stroke', this.bubbleStroke)
              .attr('fill-opacity', 0.6),
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
      <div style="width:100%; height:100%" id="geo-bubble-map"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-bubble-map': GeoBubbleMap;
  }
}
