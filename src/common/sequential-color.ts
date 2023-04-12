import {
  interpolateBrBG,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePuOr,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateSpectral,
  interpolateBlues,
  interpolateGreens,
  interpolateGreys,
  interpolateOranges,
  interpolatePurples,
  interpolateReds,
  interpolateTurbo,
  interpolateViridis,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateCividis,
  interpolateWarm,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateBuGn,
  interpolateBuPu,
  interpolateGnBu,
  interpolateOrRd,
  interpolatePuBuGn,
  interpolatePuBu,
  interpolatePuRd,
  interpolateRdPu,
  interpolateYlGnBu,
  interpolateYlGn,
  interpolateYlOrBr,
  interpolateYlOrRd,
  interpolateRainbow,
  interpolateSinebow,
  scaleSequential,
} from 'd3';

const SCHEMA_MAP = {
  interpolateBrBG: interpolateBrBG,
  interpolatePRGn: interpolatePRGn,
  interpolatePiYG: interpolatePiYG,
  interpolatePuOr: interpolatePuOr,
  interpolateRdBu: interpolateRdBu,
  interpolateRdGy: interpolateRdGy,
  interpolateRdYlBu: interpolateRdYlBu,
  interpolateRdYlGn: interpolateRdYlGn,
  interpolateSpectral: interpolateSpectral,
  interpolateBlues: interpolateBlues,
  interpolateGreens: interpolateGreens,
  interpolateGreys: interpolateGreys,
  interpolateOranges: interpolateOranges,
  interpolatePurples: interpolatePurples,
  interpolateReds: interpolateReds,
  interpolateTurbo: interpolateTurbo,
  interpolateViridis: interpolateViridis,
  interpolateInferno: interpolateInferno,
  interpolateMagma: interpolateMagma,
  interpolatePlasma: interpolatePlasma,
  interpolateCividis: interpolateCividis,
  interpolateWarm: interpolateWarm,
  interpolateCool: interpolateCool,
  interpolateCubehelixDefault: interpolateCubehelixDefault,
  interpolateBuGn: interpolateBuGn,
  interpolateBuPu: interpolateBuPu,
  interpolateGnBu: interpolateGnBu,
  interpolateOrRd: interpolateOrRd,
  interpolatePuBuGn: interpolatePuBuGn,
  interpolatePuBu: interpolatePuBu,
  interpolatePuRd: interpolatePuRd,
  interpolateRdPu: interpolateRdPu,
  interpolateYlGnBu: interpolateYlGnBu,
  interpolateYlGn: interpolateYlGn,
  interpolateYlOrBr: interpolateYlOrBr,
  interpolateYlOrRd: interpolateYlOrRd,
  interpolateRainbow: interpolateRainbow,
  interpolateSinebow: interpolateSinebow,
};

export class SequentialColor {
  private _colorScale!: any;
  private _colorVal!: string;

  constructor(schema: string, domain: number[]) {
    this.update(schema, domain);
  }

  update(schema: string, domain: number[]) {
    const schemaFn = SCHEMA_MAP[schema];
    if (schemaFn) {
      this._colorScale = scaleSequential()
        .interpolator(schemaFn)
        .domain(domain);
    } else {
      this._colorScale = null;
      this._colorVal = schema;
    }
  }

  get(value) {
    return this._colorScale ? this._colorScale(value) : this._colorVal;
  }
}
