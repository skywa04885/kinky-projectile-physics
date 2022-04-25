import { Vector3 } from "@babylonjs/core";
import { AeroDynamics } from "./AeroDynamics";

export class WeatherConditionWind {
  /**
   * Constructs a new weather condition wind.
   * @param speed the speed of the wind in meters / second.
   * @param direction the direction of the wind.
   */
  public constructor(
    public readonly speed: number,
    public readonly direction: number
  ) {}

  public get velocityVector(): Vector3 {
    return new Vector3(
      Math.cos(this.direction) * this.speed,
      0,
      Math.sin(this.direction) * this.speed,
    )
  }
}

export class WeatherConditionTemperatures {
  public constructor(
    public readonly average: number
  ) {}
}

export class WeatherConditionAir {
  public constructor(
    public readonly pressure: number,
    public readonly humidity: number
  ) {}
}

export class WeatherCondition {
  public constructor(
    public readonly wind: WeatherConditionWind,
    public readonly temp: WeatherConditionTemperatures,
    public readonly air: WeatherConditionAir
  ) {}

  /**
   * Gets the gas compound of the air.
   */
  public get airCompound(): AeroDynamics.Compound {
    const dryAirMultiplier: number = 1.0 - this.air.humidity;
    const waterVaporMultiplier: number = this.air.humidity;

    return new AeroDynamics.Compound([
      {
        gas: new AeroDynamics.DryAir(this.air.pressure, this.temp.average),
        mul: dryAirMultiplier,
      },
    ]);
  }
}
