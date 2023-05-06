// import {BaseFrameChart} from './base-frame-chart';
// import {customElement, property} from 'lit/decorators.js';
// import {select, easeLinear} from 'd3';
// import {GeoChartDataFrame} from '../data-models/geo-chart-frame-data';

// @customElement('race-geo-symbol-chart')
// export class GeoSymbolChart extends BaseFrameChart {
//   @property({type: String})
//   content = '😂';

//   updateSVG(geoChartDataFrame: GeoChartDataFrame) {
//     select(this._chartElement)
//       .select('svg')
//       .select('g#' + 'group1')
//       .selectAll('text')
//       .data(geoChartDataFrame.data)
//       .join(
//         (enter) =>
//           enter
//             .append('text')
//             .attr('x', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x)
//             .attr('y', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y)
//             .text(this.content)
//             .style('font-size', (d) => this._scale(d.value) + 'px'),
//         (update) =>
//           update
//             .transition()
//             .ease(easeLinear)
//             .duration(this.frameRate)
//             .attr('x', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x)
//             .attr('y', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y)
//             .text(this.content)
//             .style('font-size', (d) => this._scale(d.value) + 'px'),
//         (exit) =>
//           exit.transition().ease(easeLinear).duration(this.frameRate).remove()
//       );
//   }
// }

// declare global {
//   interface HTMLElementTagNameMap {
//     'race-geo-symbol-chart': GeoSymbolChart;
//   }
// }
