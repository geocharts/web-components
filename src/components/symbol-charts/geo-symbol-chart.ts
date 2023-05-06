import {property} from 'lit/decorators.js';
import {customElement} from 'lit/decorators.js';

import {BaseGeoSymbolChart} from './base-geo-symbol-chart';
import {GeoSymbolChartData} from './geo-symbol-chart-data';

@customElement('geo-symbol-chart')
export class GeoSymbolChart extends BaseGeoSymbolChart {
  @property({type: String})
  size = `20px`;

  init() {
    console.log('init');
  }

  updateSVG(data: GeoSymbolChartData[]) {
    const group1Elm = this.getSvgGroup1Element();
    group1Elm
      .selectAll('text.symbol')
      .data(data)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('class', 'symbol')
            .attr('x', (d) => this.getLatLngToLayerPoint(d.lat, d.lng).x)
            .attr('y', (d) => this.getLatLngToLayerPoint(d.lat, d.lng).y)
            .text((d) => d.symbol || this.symbol)
            .style('font-size', this.size)
            .attr('pointer-events', 'visible')
            .on('mouseover', (_, data) => this.showToolTip(data)),
        (update) =>
          update
            .attr('x', (d) => this.getLatLngToLayerPoint(d.lat, d.lng).x)
            .attr('y', (d) => this.getLatLngToLayerPoint(d.lat, d.lng).y)
            .style('font-size', this.size),
        (exit) => exit.remove()
      );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-chart': GeoSymbolChart;
  }
}
