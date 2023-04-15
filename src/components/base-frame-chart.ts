import {LitElement, PropertyValueMap, html} from 'lit';
import {property, query} from 'lit/decorators.js';
import {map, tileLayer, svg} from 'leaflet/dist/leaflet-src.esm.js';
import {ScaleLinear, select, scaleLinear} from 'd3';
import {titleCss, infoCss} from '../common/css';
import {GeoChartDataFrame} from '../data-models/geo-chart-frame-data';
import {GeoChartInfo} from './geo-chart-info';
import {MAP_SERVER} from '../common/constants';

export abstract class BaseFrameChart extends LitElement {
  static override styles = [titleCss, infoCss];

  @property({type: Array, attribute: 'lat-lng-bounds'})
  latLngBounds = [
    [79.6240562918881, -332.57812500000006],
    [-79.99716840285254, 332.22656250000006],
  ];

  @property({type: Number, attribute: 'frame-rate'})
  frameRate = 1000;

  @property({type: String, attribute: 'max-size'})
  maxSize = 3;

  @property({type: String, attribute: 'chart-title'})
  chartTitle = '';

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
  data!: GeoChartDataFrame[];

  @query('#geo-chart')
  protected _chartElement!: HTMLElement;
  protected _geoMap: any;
  protected _scale!: ScaleLinear<number, number, never>;

  private _frameIndex = 0;
  private _timerInterval!: ReturnType<typeof setInterval>;
  private _frameTicker!: GeoChartInfo;
  private _domRect!: DOMRect;

  override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ) {
    super.firstUpdated(_changedProperties);
    this._createChart();
    this._createSVGElements();
    this._showChartInfo();
    this._startFrames();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('data')) {
      this._inputChanged();
    }
  }

  override attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null
  ) {
    super.attributeChangedCallback(name, oldVal, newVal);
    this._inputChanged();
  }

  override disconnectedCallback(): void {
    clearInterval(this._timerInterval);
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <link
        rel="stylesheet"
        type="text/css"
        href="../node_modules/leaflet/dist/leaflet.css"
      />
      <div style="width:100%; height:100%" id="geo-chart"></div>
    `;
  }

  private _createChart() {
    this._geoMap = map(this._chartElement, {
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
      select(this._chartElement)
        .select('svg')
        .selectAll('g')
        .data([1])
        .join(
          (enter) => enter.append('g').attr('id', (elm) => 'group' + elm),
          (update) => update.attr('id', (elm) => 'group' + elm),
          (exit) => exit.remove()
        );
    }
  }

  private _showChartInfo() {
    new GeoChartInfo(
      this._geoMap,
      this.titleLoc,
      `<div class="title">${this.chartTitle}</div>`
    );
    this._frameTicker = new GeoChartInfo(this._geoMap, this.tickerLoc, '');
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
      this._scale = scaleLinear(
        [minValue, maxValue],
        [0, (this.maxSize / 100) * this._domRect.width]
      );
      if (this.inputChanged) {
        this.inputChanged(minValue, maxValue);
      }

      this._updateSVG();
    }
  }

  private _getFrameTickerTemplate(frameTitle: string) {
    return `<div>
        <div class="info">${frameTitle}</div>
      </div>`;
  }

  private _updateSVG() {
    if (this.data?.length > 0) {
      if (this._frameIndex >= this.data.length) {
        this._frameIndex = 0;

        if (this.data.length == 1) {
          return;
        }
      }
      const frameData = this.data[this._frameIndex];
      this._frameTicker.update(this._getFrameTickerTemplate(frameData.label));
      this.updateSVG(frameData);
    }
  }

  protected abstract updateSVG(frameData: GeoChartDataFrame);
  protected inputChanged?(minValue: number, maxValue: number);
}
