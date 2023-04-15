import {customElement, property} from 'lit/decorators.js';
import {select, easeLinear, pack, hierarchy} from 'd3';
import {BaseFrameChart} from './base-frame-chart';
import {GeoChartDataFrame} from '../data-models/geo-chart-frame-data';

@customElement('geo-symbol-pack-chart')
export class GeoSymbolPackChart extends BaseFrameChart {
  @property({type: String, attribute: 'pack-radius'})
  packRadius = 30;

  @property({type: String})
  content = '😂';

  protected updateSVG(geoChartDataFrame: GeoChartDataFrame) {
    const groups = select(this._chartElement)
      .select('svg')
      .select('g#' + 'group1')
      .selectAll('g')
      .data(geoChartDataFrame.data)
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

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-pack-chart': GeoSymbolPackChart;
  }
}
