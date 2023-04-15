import {BaseFrameMap} from './base-frame-map';
import {customElement, property} from 'lit/decorators.js';
import {select, easeLinear} from 'd3';
import {GeoMapDataFrame} from '../data-models/geo-map-frame-data';

@customElement('geo-symbol-map')
export class GeoSymbolMap extends BaseFrameMap {
  @property({type: String})
  content = '😂';

  updateSVG(geoSymbolMapDataFrame: GeoMapDataFrame) {
    select(this._mapElement)
      .select('svg')
      .select('g#' + 'group1')
      .selectAll('text')
      .data(geoSymbolMapDataFrame.data)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('x', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x)
            .attr('y', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y)
            .text(this.content)
            .style('font-size', (d) => this._scale(d.value) + 'px'),
        (update) =>
          update
            .transition()
            .ease(easeLinear)
            .duration(this.frameRate)
            .attr('x', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).x)
            .attr('y', (d) => this._geoMap.latLngToLayerPoint([d.lat, d.lng]).y)
            .text(this.content)
            .style('font-size', (d) => this._scale(d.value) + 'px'),
        (exit) =>
          exit.transition().ease(easeLinear).duration(this.frameRate).remove()
      );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-symbol-map': GeoSymbolMap;
  }
}
