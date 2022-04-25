import { Vector3 } from "@babylonjs/core";
import { Projectile } from "./Projectile";
import { Simulator } from "./Simulator";
import { SimulatorOptions } from "./SimulatorOptions";
import { WeatherCondition } from "./WeatherCondition";

export class SimulatorOptimizer {
  protected _iteration: number | undefined;

  protected _yaw: number | undefined;
  protected _pitch: number | undefined;

  protected _simulator: Simulator | undefined;

  public constructor(
    public readonly maxIterations: number,
    public readonly threshold: number,
    public readonly initialSpeed: number,
    public readonly simulatorOptions: SimulatorOptions,
    public readonly simulatorWeather: WeatherCondition,
    public readonly simulatorProjectile: Projectile
  ) {
    this._iteration = undefined;

    this._simulator = undefined;
  }

  public get pitch(): number {
    if (this._pitch === undefined) {
      throw new Error('No pitch available.');
    }

    return this._pitch;
  }

  public get yaw(): number {
    if (this._yaw === undefined) {
      throw new Error('No yaw available.');
    }

    return this._yaw;
  }

  public get iterations(): number {
    if (this._iteration === undefined) {
      throw new Error('No iterations available.');
    }

    return this._iteration;
  }

  /**
   * Calculates the error to the given point.
   * @param target the target we want to reach.
   * @returns the error towards the end.
   */
  protected _calculateError(target: Vector3) {
    const initialPosition: Vector3 = new Vector3(0, 0, 0);

    // Creates the initial velocity vector.
    const initialVelocity: Vector3 = new Vector3(
      this.initialSpeed * Math.cos(this._pitch) * Math.sin(this._yaw),
      this.initialSpeed * Math.sin(this._pitch),
      this.initialSpeed * Math.cos(this._pitch) * Math.cos(this._yaw)
    );

    // Creates the new simulator.
    this._simulator = new Simulator(
      this.simulatorOptions,
      this.simulatorWeather,
      this.simulatorProjectile,
      initialVelocity,
      initialPosition
    );

    // Runs the simulator.
    this._simulator.run(0.01);

    // Calculates the error.
    return Math.sqrt(
      Math.pow(this._simulator.projectilePosition.x - target.x, 2) +
        Math.pow(this._simulator.projectilePosition.y - target.y, 2) +
        Math.pow(this._simulator.projectilePosition.z - target.z, 2)
    );
  }

  public run(target: Vector3, pitchIntervalBegin: number = 0, pitchIntervalEnd: number = Math.PI, yawIntervalBegin: number = -Math.PI / 2, yawIntervalEnd: number = Math.PI / 2) {
    const midpoint = (start: number, end: number) => {
      return (end - start) / 2 + start;
    }

    this._iteration = 0;
    this._pitch = pitchIntervalBegin;

    let previousError: number = this._calculateError(target);

    while (this._iteration++ < this.maxIterations) {
      // Calculates the test points.
      const pitchSep: number = midpoint(pitchIntervalBegin, pitchIntervalEnd);
      const pitchTestPointA: number = midpoint(pitchIntervalBegin, pitchSep);
      const pitchTestPointB: number = midpoint(pitchSep, pitchIntervalEnd);

      const yawSep: number = midpoint(yawIntervalBegin, yawIntervalEnd);
      const yawTestPointA: number = midpoint(yawIntervalBegin, yawSep);
      const yawTestPointB: number = midpoint(yawSep, yawIntervalEnd);

      // Calculates the errors for the test points.
      const options = [
        [pitchTestPointA, pitchTestPointB],
        [yawTestPointA, yawTestPointB]
      ]

      let bestError: number;
      let bestPitch: number;
      let bestYaw: number;

      for (let i: number = 0; i < options[0].length; ++i) {
        for (let j: number = 0; j < options[1].length; ++j) {
          this._pitch = options[0][i];
          this._yaw = options[1][j];

          const currentTestError: number = this._calculateError(target);

          if (bestError === undefined || currentTestError < bestError) {
            bestError = currentTestError;
            bestPitch = this._pitch;
            bestYaw = this._yaw;
          }
        }
      }

      if (bestPitch > pitchSep) {
        pitchIntervalBegin = pitchSep;
      } else {
        pitchIntervalEnd = pitchSep;
      }

      if (bestYaw > yawSep) {
        yawIntervalBegin = yawSep;
      } else {
        yawIntervalEnd = yawSep;
      }

      // Sets the pitch and the yaw to the best.
      this._pitch = bestPitch;
      this._yaw = bestYaw;

      // Checks if the error is bellow the threshold.
      if (bestError < this.threshold) {
        break;
      }

      if (Math.abs(bestError - previousError) < 0.00001) {
        break;
      }

      previousError = bestError;
    }

    return previousError;
  }
}
