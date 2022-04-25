import { Vector3 } from "@babylonjs/core";

export namespace AeroDynamics {
  export class Gas {
    public constructor(
      public readonly r: number,
      public readonly pressure: number,
      public readonly temperature: number
    ) {}

    public get density(): number {
      const numerator: number = this.pressure;
      const denominator: number = this.r * this.temperature;
      return numerator / denominator;
    }
  }

  export class DryAir extends Gas {
    public constructor(pressure: number, temperature: number) {
      super(287.058, pressure, temperature);
    }
  }

  export class WaterVapor extends Gas {
    public constructor(pressure: number, temperature: number) {
      super(461.5, pressure, temperature);
    }
  }

  export interface CompoundGas {
    gas: Gas;
    mul: number;
  }

  export class Compound {
    /**
     * Constructs a new compound.
     * @param gasses the gasses of the compound.
     */
    public constructor(public readonly gasses: CompoundGas[]) {}

    /**
     * Gets the total density of the compound.
     */
    public get density(): number {
      let sum: number = 0;

      this.gasses.forEach(({ gas, mul }: CompoundGas): void => {
        sum += gas.density * mul;
      });

      return sum;
    }
  }

  /**
   * Calculates the drag.
   * @param objectVelocity the velocity of the object.
   * @param gasVelocity the velocity of the gas.
   * @param gasDensity the density of the gas.
   * @param cSectionArea the cross section of the object.
   * @param dragCoefficient the drag coefficient of the object.
   * @returns the force vector of the drag.
   */
  export const drag = (
    objectVelocity: Vector3,
    gasVelocity: Vector3,
    gasDensity: number,
    cSectionArea: number,
    dragCoefficient: number
  ) => {
    const relativeVelocity: Vector3 = gasVelocity
      .clone()
      .subtract(objectVelocity);
    
    const dragForce: number =
      (1 / 2) *
      gasDensity *
      Math.pow(relativeVelocity.length(), 2) *
      dragCoefficient *
      cSectionArea;
    
    return relativeVelocity.normalize().scale(dragForce);
  };
}
