import {property} from 'lit/decorators.js';
import {customElement} from 'lit/decorators.js';
import {BaseGeoSymbolChart} from './base-geo-symbol-chart';
import {ToolTipType} from '../../common/tool-tip-type';

@customElement('geo-symbol-chart')
export class GeoSymbolChart extends BaseGeoSymbolChart {
  @property({type: Number, attribute: 'symbol-font'})
  symbolFont = 24;

  @property({type: Number, attribute: 'text-font'})
  textFont = 0;

  updateSVG() {
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
      .data((d) => [d])
      .join(
        (enter) => {
          const newSymbolElm = enter
            .append('text')
            .attr('class', 'symbol')
            .text((d) => d.symbol || this.symbol)
            .style('font-size', this.symbolFont + 'px')
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
        (update) =>
          update
            .style('font-size', this.symbolFont + 'px')
            .text((d) => d.symbol || this.symbol),
        (exit) => exit.remove()
      );

    if (this.textFont > 0) {
      groups
        .selectAll('text.value')
        .data((d) => [d])
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('class', 'value')
              .attr('dy', -this.symbolFont + 'px')
              .text((d) => d.value || 0)
              .attr('font-weight', 600)
              .style('font-size', this.textFont + 'px'),
          (update) =>
            update
              .attr('dy', -this.symbolFont + 'px')
              .style('font-size', this.textFont + 'px')
              .text((d) => d.value || 0),
          (exit) => exit.remove()
        );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-chart': GeoSymbolChart;
  }
}
