import { Vector3 } from "@babylonjs/core";
import { AeroDynamics } from "./apollo/AeroDynamics";
import { Gravity } from "./apollo/Gravity";
import { Projectile, SphericalProjectile } from "./apollo/Projectile";
import { Simulator } from "./apollo/Simulator";
import { SimulatorOptimizer } from "./apollo/SimulatorOptimizer";
import { SimulatorOptions } from "./apollo/SimulatorOptions";
import {
  WeatherCondition,
  WeatherConditionAir,
  WeatherConditionTemperatures,
  WeatherConditionWind,
} from "./apollo/WeatherCondition";

const projectile: Projectile = new SphericalProjectile(0.1, 0.09);
const weatherCondition: WeatherCondition = new WeatherCondition(
  new WeatherConditionWind(2, 0),
  new WeatherConditionTemperatures(303),
  new WeatherConditionAir(102300, 0.0)
);

const simopts = new SimulatorOptions(10000, false);

// let optimizer = new SimulatorOptimizer(100, 0.01, 10.0, simopts, weatherCondition, projectile);
// optimizer.run(new Vector3(10, 10, 10));