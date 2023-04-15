import {LitElement, html, PropertyValueMap, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {
  select,
  easeLinear,
  pack,
  hierarchy,
  ScaleLinear,
  scaleLinear,
} from 'd3';
import {map, tileLayer, svg} from 'leaflet/dist/leaflet-src.esm.js';
import {MAP_SERVER} from '../common/constants';
import {GeoSymbolMapDataFrame} from '../data-models/geo-symbol-map-data';
import {GeoMapInfo} from './geo-map-info';

@customElement('geo-pack-symbol-map')
export class GeoPackSymbolMap extends LitElement {
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

  @property({type: String, attribute: 'max-symbols'})
  maxSymbols = 20;

  @property({type: String, attribute: 'pack-radius'})
  packRadius = 50;

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
          (enter) => enter.append('g').attr('id', 'symbol-group'),
          (update) => update.attr('id', 'symbol-group'),
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
      this._scale = scaleLinear([minValue, maxValue], [0, this.maxSymbols]);
      this._updateSVG();
    }
  }

  private _getFrameTickerTemplate(frameTitle: string) {
    return `<div>
        <div class="info">${frameTitle}</div>
      </div>`;
  }

  private _updateSVG() {
    this._updateSVGWithMultipleSymbols();
  }

  private _updateSVGWithMultipleSymbols() {
    if (this.data?.length > 0) {
      if (this._frameIndex >= this.data.length) {
        this._frameIndex = 0;
      }
      const geoSymbolMapDataFrame = this.data[this._frameIndex];
      this._frameTicker.update(
        this._getFrameTickerTemplate(geoSymbolMapDataFrame.label)
      );

      const groups = select(this._mapElement)
        .select('svg')
        .select('g#' + 'symbol-group')
        .selectAll('g')
        .data(geoSymbolMapDataFrame.data)
        .join(
          (enter) =>
            enter
              .append('g')
              .attr('id', (_, i) => 'symbol-group-' + i)
              .attr(
                'transform',
                (d) =>
                  'translate(' +
                  this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x +
                  ',' +
                  this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y +
                  ')'
              ),
          (update) =>
            update
              .transition()
              .ease(easeLinear)
              .duration(this.frameRate)
              .attr(
                'transform',
                (d) =>
                  'translate(' +
                  this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x +
                  ',' +
                  this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y +
                  ')'
              ),
          (exit) => exit
        );

      groups
        .selectAll('text.emoji')
        .data((d) => {
          const dataObj: any = {
            children: Array(Math.round(this._scale(d.value)))
              .fill('')
              .map((_) => ({value: 1})),
          };
          const pack1 = pack()
            .size([this.packRadius, this.packRadius])
            .padding(1);
          const nodes1 = pack1(hierarchy(dataObj).sum((d) => d.value));
          return nodes1.descendants();
        })
        .join(
          (enter: any) =>
            enter
              .append('text')
              .attr('class', 'emoji')
              .style('font-size', '0px')
              .attr('x', 0)
              .attr('y', 0)
              .transition()
              .duration(this.frameRate)
              .attr(
                'x',
                (d) => d.x - this.packRadius / 2 + (Math.random() * 20 - 10)
              )
              .attr(
                'y',
                (d) => d.y - this.packRadius / 2 + (Math.random() * 20 - 10)
              )
              .text(this.content)
              .style('font-size', this.packRadius * 0.3 + 'px'),
          (update) =>
            update
              .transition()
              .ease(easeLinear)
              .duration(this.frameRate)
              .attr(
                'x',
                (d) => d.x - this.packRadius / 2 + (Math.random() * 20 - 10)
              )
              .attr(
                'y',
                (d) => d.y - this.packRadius / 2 + (Math.random() * 20 - 10)
              )
              .style('font-size', this.packRadius * 0.3 + 'px')
              .text(this.content),
          (exit) =>
            exit
              .transition()
              .ease(easeLinear)
              .duration(this.frameRate)
              .attr('x', 0)
              .attr('y', 0)
              .remove()
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
    'geo-pack-symbol-map': GeoPackSymbolMap;
  }
}
