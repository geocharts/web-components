import {customElement, property} from 'lit/decorators.js';
import {select, easeLinear} from 'd3';
import {SequentialGeoMapColor} from '../common/sequential-color';
import {BaseFrameMap} from './base-frame-map';
import {GeoMapDataFrame} from '../data-models/geo-map-frame-data';

@customElement('geo-bubble-map')
export class GeoBubbleMap extends BaseFrameMap {
  @property({type: String, attribute: 'color-scheme'})
  colorScheme = 'red';

  @property({type: String, attribute: 'bubble-stroke'})
  bubbleStroke = '#3B5998';

  private _colorScale = new SequentialGeoMapColor(this.colorScheme, []);

  override inputChanged(minValue: number, maxValue: number) {
    this._colorScale.update(this.colorScheme, [minValue, maxValue]);
  }

  protected updateSVG(geoBubbleMapDataFrame: GeoMapDataFrame) {
    select(this._mapElement)
      .select('svg')
      .select('g#' + 'group1')
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

declare global {
  interface HTMLElementTagNameMap {
    'geo-bubble-map': GeoBubbleMap;
  }
}
