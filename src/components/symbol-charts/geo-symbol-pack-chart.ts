import {property} from 'lit/decorators.js';
import {customElement} from 'lit/decorators.js';
import {BaseGeoSymbolChart} from './base-geo-symbol-chart';
import {GeoSymbolChartData} from './geo-symbol-chart-data';
import {ToolTipType} from '../../common/tool-tip-type';

@customElement('geo-symbol-chart')
export class GeoSymbolChart extends BaseGeoSymbolChart {
  @property({type: Number, attribute: 'symbol-font-size'})
  symbolFontSize = 24;

  @property({type: Number, attribute: 'value-font-size'})
  valueFontSize = 12;

  @property({type: Boolean, attribute: 'show-values'})
  showValues = false;

  updateSVG(data: GeoSymbolChartData[]) {
    const group1Elm = this.getSvgGroup1Element();
    const groups = group1Elm
      .selectAll('g')
      .data(data)
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
      .data((d) => [d])
      .join(
        (enter) => {
          const newSymbolElm = enter
            .append('text')
            .attr('class', 'symbol')
            .text((d) => d.symbol || this.symbol)
            .style('font-size', this.symbolFontSize + 'px')
            .attr('pointer-events', 'visible');
          if (
            this.toolTipType === ToolTipType.mouseover ||
            this.toolTipType === ToolTipType.touchstart
          ) {
            newSymbolElm.on('mouseover', (_, data) => this.showToolTip(data));
            newSymbolElm.on('touchstart', (_, data) => this.showToolTip(data), {
              passive: true,
            });
          }
          return newSymbolElm;
        },
        (update) => update.text((d) => d.symbol || this.symbol),
        (exit) => exit.remove()
      );

    if (this.showValues) {
      groups
        .selectAll('text.value')
        .data((d) => [d])
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('class', 'value')
              .attr('dy', -this.symbolFontSize * 0.8 + 'px')
              .text((d) => d.value || 0)
              .attr('font-weight', 'bold')
              .style('font-size', this.valueFontSize + 'px'),
          (update) => update.text((d) => d.value || 0),
          (exit) => exit.remove()
        );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-pack-chart': GeoSymbolChart;
  }
}
