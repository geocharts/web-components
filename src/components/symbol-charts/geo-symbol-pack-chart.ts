import {property} from 'lit/decorators.js';
import {customElement} from 'lit/decorators.js';
import {ScaleLinear, scaleLinear, pack, hierarchy} from 'd3';
import {BaseGeoSymbolChart} from './base-geo-symbol-chart';
import {ToolTipType} from '../../common/tool-tip-type';

@customElement('geo-symbol-pack-chart')
export class GeoSymbolPackChart extends BaseGeoSymbolChart {
  @property({type: Number, attribute: 'symbol-font-size'})
  symbolFontSize = 20;

  @property({type: Number, attribute: 'max-symbols'})
  maxSymbols = 20;

  private _scale!: ScaleLinear<number, number, never>;

  updateSVG() {
    this._updateScale();
    const group1Elm = this.getSvgGroup1Element();
    const groups = group1Elm
      .selectAll('g')
      .data(this.data)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr(
              'transform',
              (d) =>
                `translate(${this.getLatLngToLayerPoint(d.lat, d.lng).x}, ${
                  this.getLatLngToLayerPoint(d.lat, d.lng).y
                })`
            ),
        (update) =>
          update.attr(
            'transform',
            (d) =>
              `translate(${this.getLatLngToLayerPoint(d.lat, d.lng).x}, ${
                this.getLatLngToLayerPoint(d.lat, d.lng).y
              })`
          ),
        (exit) => exit.remove()
      );

    groups
      .selectAll('text.symbol')
      .data((nodeData) => {
        const dataObj: any = {
          children: Array(Math.round(this._scale(nodeData.value))).fill({
            value: 1,
            nodeData: nodeData,
          }),
        };
        const packObj = pack().size([50, 50]).padding(2);
        const packLayout = packObj(hierarchy(dataObj).sum((d) => d.value));
        return packLayout.descendants();
      })
      .join(
        (enter) => {
          const newSymbolElm = enter
            .append('text')
            .attr('class', 'symbol')
            .text((d: any) => d.data?.nodeData?.symbol || this.symbol)
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .style('font-size', this.symbolFontSize + 'px')
            .attr('pointer-events', 'visible');
          if (
            this.toolTipType === ToolTipType.mouseover ||
            this.toolTipType === ToolTipType.touchstart
          ) {
            newSymbolElm.on('mouseover', (_, data: any) =>
              this.showToolTip(data.data.nodeData)
            );

            newSymbolElm.on(
              'touchstart',
              (_, data: any) => this.showToolTip(data.data.nodeData),
              {passive: true}
            );
          }
          return newSymbolElm;
        },
        (update) =>
          update.text((d: any) => d.data?.nodeData?.symbol || this.symbol),
        (exit) => exit.remove()
      );
  }

  private _updateScale() {
    if (this.data?.length > 0) {
      const minValue = this.data.reduce((min, current) => {
        return current.value < min ? current.value : min;
      }, this.data[0].value);

      const maxValue = this.data.reduce((max, current) => {
        return current.value > max ? current.value : max;
      }, this.data[0].value);
      this._scale = scaleLinear([minValue, maxValue], [1, this.maxSymbols]);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-pack-chart': GeoSymbolPackChart;
  }
}
