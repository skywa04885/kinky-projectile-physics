import { Vector3 } from "@babylonjs/core";
import { AeroDynamics } from "./AeroDynamics";
import { Gravity } from "./Gravity";
import { Projectile } from "./Projectile";
import { SimulatorOptions } from "./SimulatorOptions";
import { WeatherCondition } from "./WeatherCondition";

export class Simulator {
  protected _iterations: number | undefined;

  protected _start: number | undefined;
  protected _end: number | undefined;

  protected _projectilePosition: Vector3 | undefined;
  protected _projectileVelocity: Vector3 | undefined;

  protected _dataPoints: Vector3[] | undefined;

  public constructor(
    public readonly options: SimulatorOptions,
    public readonly weather: WeatherCondition,
    public readonly projectile: Projectile,
    public readonly initialVelocity: Vector3,
    public readonly initialPosition: Vector3 = new Vector3(0, 0, 0)
  ) {
    this._iterations = undefined;

    this._start = undefined;
    this._end = undefined;

    this._projectilePosition = undefined;
    this._projectileVelocity = undefined;

    this._dataPoints = undefined;
  }

  public get projectilePosition(): Vector3 {
      return this._projectilePosition!;
  }

  protected _getGravitationalForce(): Vector3 {
    return new Vector3(
      0,
      Gravity.GravitationalBody.EARTH.getForceOnObject(
        this._projectilePosition.y,
        this.projectile.mass
      ),
      0
    );
  }

  protected _getDragForce(): Vector3 {
    return AeroDynamics.drag(
      this._projectileVelocity!,
      this.weather.wind.velocityVector,
      this.weather.airCompound.density,
      this.projectile.projectedArea(),
      this.projectile.dragCoefficient
    );
  }

  protected _getNetForce(): Vector3 {
      // Gets the individual forces.
      const gravitationalForce: Vector3 = this._getGravitationalForce();
      const dragForce: Vector3 = this._getDragForce();

      // Calculates the net force.
      const netForce: Vector3 = gravitationalForce.add(dragForce);

      // Returns the net force.
      return netForce;
  }

  protected _getAcceleration(): Vector3 {
      return this._getNetForce().scale(1 / this.projectile.mass);
  }

  public run(dt: number = 0.01) {
    this._iterations = 0;

    this._start = new Date().getTime();

    this._projectilePosition = this.initialPosition.clone();
    this._projectileVelocity = this.initialVelocity.clone();

    if (this.options.generateDataPoints) {
      this._dataPoints = [];
    }

    while (this._iterations++ < this.options.maxIterations) {
        // Gets the acceleration.
        let acceleration: Vector3 = this._getAcceleration();
        acceleration.scaleInPlace(dt);

        // Changes the velocity with the acceleration.
        this._projectileVelocity.addInPlace(acceleration);

        // Changes the position.
        this._projectilePosition.addInPlace(this._projectileVelocity.scale(dt));

        // Generates the data point.
        if (this.options.generateDataPoints) {
          this._dataPoints.push(this._projectilePosition.clone());
        }

        // Breaks if we've hit the floor.
        if (this._projectilePosition.y <= 0) {
          break;
        }
    }

    this._end = new Date().getTime();
  }
  
  public get dataPoints(): Vector3[] {
    if (!this._dataPoints) {
      throw new Error('No datapoints available.');
    }

    return this._dataPoints;
  }

  public get duration(): number {
    if (!this._end || !this._start) {
      throw new Error("Run simulation properly first.");
    }

    return this._end - this._start;
  }
}
