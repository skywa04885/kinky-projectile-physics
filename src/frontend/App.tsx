import React, {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Coordinate, Vector3 } from "@babylonjs/core";
import { Engine, Scene } from "react-babylonjs";
import {
  Col,
  Form,
  Row,
  Button,
  ButtonGroup,
  Table,
  InputGroup,
} from "react-bootstrap";
import { Simulator } from "./apollo/Simulator";
import { round } from "lodash";

import babePng from "./assets/babe.png";
import { SimulatorOptions } from "./apollo/SimulatorOptions";
import {
  WeatherCondition,
  WeatherConditionAir,
  WeatherConditionTemperatures,
  WeatherConditionWind,
} from "./apollo/WeatherCondition";
import { Projectile, SphericalProjectile } from "./apollo/Projectile";
import { SimulatorOptimizer } from "./apollo/SimulatorOptimizer";

export const App = () => {
  const [lineVersion, setLineVersion] = useState<number>(0);
  const [simulatorMaxIterations, setSimulatorMaxIterations] =
    useState<number>(10000);
  const [simulatorDeltaTime, setSimulatorDeltaTime] = useState<number>(0.01);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);
  const [targetPosition, setTargetPosition] = useState<Vector3>(
    new Vector3(100, 0, 0)
  );
  const [optimizerError, setOptimizerError] = useState<number>(0);
  const [optimizerIterations, setOptimizerIterations] = useState<number>(0);

  const [initialVelocitySpeed, setInitialVelocitySpeed] = useState(50);
  const [initialVelocityPitch, setInitialVelocityPitch] = useState(45);
  const [initialVelocityYaw, setInitialVelocityYaw] = useState(0);

  const [windSpeed, setWindSpeed] = useState<number>(2.0);
  const [windOrigin, setWindOrigin] = useState<number>(0);

  const [airPressure, setAirPressure] = useState<number>(1023);
  const [relativeHumidity, setRelativeHumidity] = useState<number>(0);

  const [temperature, setTemperature] = useState<number>(303.15);

  const [objectMass, setObjectMass] = useState<number>(0.15);
  const [objectRadius, setObjectRadius] = useState<number>(0.09);

  const [simulatorDuration, setSimulatorDuration] = useState<number>(0);
  const [simulatorInitialPosition, setSimulatorInitialPosition] =
    useState<Vector3>(new Vector3(0, 0, 0));
  const [simulatorTerminalPosition, setSimulatorTerminalPosition] =
    useState<Vector3>(new Vector3(0, 0, 0));
  const [simulatorDataPoints, setSimulatorDataPoints] = useState<Vector3[]>([]);

  const onAutoSimulateClick = (e: MouseEvent<HTMLButtonElement>) => {
    setAutoSimulate((auto: boolean) => !auto);
  };

  const onWindSpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWindSpeed(e.target.valueAsNumber);
  };

  const onWindOriginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWindOrigin(e.target.valueAsNumber);
  };

  const onairPressureChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAirPressure(e.target.valueAsNumber);
  };

  const onRelativeHumidityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRelativeHumidity(e.target.valueAsNumber);
  };

  const onTemperatureChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTemperature(e.target.valueAsNumber);
  };

  const onObjectMassChange = (e: ChangeEvent<HTMLInputElement>) => {
    setObjectMass(e.target.valueAsNumber);
  };

  const onObjectRadiusChange = (e: ChangeEvent<HTMLInputElement>) => {
    setObjectRadius(e.target.valueAsNumber);
  };

  const onSimulatorMaxIterationsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSimulatorMaxIterations(e.target.valueAsNumber);
  };

  const onSimulatorDeltaTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSimulatorDeltaTime(e.target.valueAsNumber);
  };

  const onInitialVelocityPitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInitialVelocityPitch(e.target.valueAsNumber);
  };

  const onInitialVelocityYawChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInitialVelocityYaw(e.target.valueAsNumber);
  };

  const onInitialVelocitySpeedChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInitialVelocitySpeed(e.target.valueAsNumber);
  };

  const onTargetPositionChange = (
    e: ChangeEvent<HTMLInputElement>,
    v: "x" | "z"
  ) => {
    setTargetPosition((position: Vector3) => {
      let clone: Vector3 = position.clone();

      if (v === "x") {
        clone.x = e.target.valueAsNumber;
      } else if (v === "z") {
        clone.z = e.target.valueAsNumber;
      }

      return clone;
    });
  };

  const solveCallback = useCallback(() => {
    const weather: WeatherCondition = new WeatherCondition(
      new WeatherConditionWind(windSpeed, (windOrigin / 180) * Math.PI),
      new WeatherConditionTemperatures(temperature),
      new WeatherConditionAir(airPressure, relativeHumidity)
    );

    const projectile: Projectile = new SphericalProjectile(
      objectMass,
      objectRadius
    );

    const simulatorOptions: SimulatorOptions = new SimulatorOptions(
      simulatorMaxIterations,
      true
    );

    const optimizer: SimulatorOptimizer = new SimulatorOptimizer(
      100,
      0.01,
      initialVelocitySpeed,
      simulatorOptions,
      weather,
      projectile
    );
    const error: number = optimizer.run(targetPosition);

    setOptimizerError(error);
    setInitialVelocityPitch((optimizer.pitch / Math.PI) * 180);
    setInitialVelocityYaw((optimizer.yaw / Math.PI) * 180);
    setOptimizerIterations(optimizer.iterations);
  }, [
    windSpeed,
    windOrigin,
    airPressure,
    relativeHumidity,
    temperature,
    objectMass,
    objectRadius,
    simulatorDeltaTime,
    simulatorMaxIterations,
    targetPosition,
    initialVelocityPitch,
    initialVelocitySpeed,
    initialVelocityYaw,
  ]);

  const simulateCallback = useCallback(() => {
    const initialVelocity: Vector3 = new Vector3(
      initialVelocitySpeed *
        Math.cos((initialVelocityPitch / 180) * Math.PI) *
        Math.sin((initialVelocityYaw / 180.0) * Math.PI),
      initialVelocitySpeed * Math.sin((initialVelocityPitch / 180) * Math.PI),
      initialVelocitySpeed *
        Math.cos((initialVelocityPitch / 180) * Math.PI) *
        Math.cos((initialVelocityYaw / 180.0) * Math.PI)
    );
    const initialPosition: Vector3 = new Vector3(0, 0, 0);

    const weather: WeatherCondition = new WeatherCondition(
      new WeatherConditionWind(windSpeed, (windOrigin / 180) * Math.PI),
      new WeatherConditionTemperatures(temperature),
      new WeatherConditionAir(airPressure, relativeHumidity)
    );

    const projectile: Projectile = new SphericalProjectile(
      objectMass,
      objectRadius
    );

    const simulatorOptions: SimulatorOptions = new SimulatorOptions(
      simulatorMaxIterations,
      true
    );

    const simulator: Simulator = new Simulator(
      simulatorOptions,
      weather,
      projectile,
      initialVelocity,
      initialPosition
    );

    simulator.run(simulatorDeltaTime);

    setSimulatorDuration(simulator.duration);
    setSimulatorInitialPosition(simulator.initialPosition.scale(0.1));
    setSimulatorTerminalPosition(simulator.projectilePosition.scale(0.1));
    setSimulatorDataPoints(
      simulator.dataPoints.map((d: Vector3) => d.scale(0.1))
    );
    setLineVersion((version: number) => ++version);
  }, [
    windSpeed,
    windOrigin,
    airPressure,
    relativeHumidity,
    temperature,
    objectMass,
    objectRadius,
    simulatorDeltaTime,
    simulatorMaxIterations,
    initialVelocityPitch,
    initialVelocitySpeed,
    initialVelocityYaw,
  ]);

  useEffect(() => {
    // If we're not supposed to simulate automatically, just ignore.
    if (!autoSimulate) {
      return;
    }

    // Calls the simulate callback.
    simulateCallback();
  }, [
    windSpeed,
    windOrigin,
    airPressure,
    relativeHumidity,
    temperature,
    objectMass,
    objectRadius,
    simulatorDeltaTime,
    simulatorMaxIterations,
    initialVelocityPitch,
    initialVelocitySpeed,
    initialVelocityYaw,
  ]);

  return (
    <div className="p-0 m-0 vw-100 vh-100 overflow-hidden">
      <Row className="m-0 p-0">
        <Col md={8} className="vh-100 m-0 p-0">
          <Engine
            className="m-0 p-0"
            antialias={true}
            canvasId="babylon"
            adaptToDeviceRatio={false}
          >
            <Scene>
              <arcRotateCamera
                name="Camera"
                target={new Vector3(0, 0, 0)}
                alpha={-Math.PI / 2}
                beta={0.5 + Math.PI / 4}
                radius={200}
                minZ={0.001}
                wheelPrecision={5}
                lowerRadiusLimit={400}
                upperRadiusLimit={4000}
                upperBetaLimit={Math.PI / 2}
              />
              <hemisphericLight
                name="hemi"
                direction={new Vector3(0, 0.5, 0.5)}
                intensity={0.5}
              />
              <lines
                name="Lines"
                key={lineVersion}
                points={simulatorDataPoints}
              />
              <ground
                name="ground1"
                width={1000}
                height={1000}
                subdivisions={2}
                position={new Vector3(0, -5, 0)}
                receiveShadows={true}
              />
              <sphere
                diameter={5}
                name="Terminal Position"
                position={simulatorTerminalPosition}
              />
            </Scene>
          </Engine>
        </Col>
        <Col md={4} className="m-0 p-0 bg-white">
          <div className="p-2 shadow overflow-auto vh-100">
            <div className="d-flex align-items-center justify-content-center mb-2 flex-column">
              <h5 className="mb-0 p-0">
                LKPP (Luke's Kinky Projectile Physics)
              </h5>
              <p className="text-muted mt-0 pt-0">
                <small>(disclaimer): Hot women not included.</small>
              </p>
              <img className="w-50" src={babePng} />
            </div>
            <div className="border rounded bg-light mb-2">
              <div className="d-flex justify-content-between p-2 border-bottom align-items-center">
                <p className="m-0 p-0 text-primary">Simulatie</p>
                <p className="m-0 p-0">
                  <small className="text-muted">Kinky shit.</small>
                </p>
              </div>
              <div className="p-2">
                <Form.Group className="mb-3">
                  <Form.Label>Doelwit</Form.Label>
                  <InputGroup>
                    <span className="input-group-text">X</span>
                    <Form.Control
                      value={targetPosition.x}
                      type="number"
                      onChange={(e) => onTargetPositionChange(e as any, "x")}
                    />
                    <span className="input-group-text">Z</span>
                    <Form.Control
                      value={targetPosition.z}
                      type="number"
                      onChange={(e) => onTargetPositionChange(e as any, "z")}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Waar moet het projectiel terecht komen.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="controlMaxIterations">
                  <Form.Label>Max aantal iteraties</Form.Label>
                  <Form.Control
                    type="number"
                    step={1}
                    min={1}
                    max={200000}
                    value={simulatorMaxIterations}
                    onChange={onSimulatorMaxIterationsChange}
                  />
                  <Form.Text className="text-muted">
                    Selecteer het max aantal iteraties voor de simulatie.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="controlDeltaTime">
                  <Form.Label>
                    Delta Tijd ({round(simulatorDeltaTime, 4)} s)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={0.001}
                    min={0.001}
                    max={1}
                    value={simulatorDeltaTime}
                    onChange={onSimulatorDeltaTimeChange}
                  />
                  <Form.Text className="text-muted">
                    De delta tijd voor de simulatie in seconden.
                  </Form.Text>
                </Form.Group>
                <hr />
                <ButtonGroup className="mb-3">
                  <button
                    className="btn btn-primary"
                    onClick={simulateCallback}
                    disabled={autoSimulate}
                  >
                    Simuleer
                  </button>
                  <button
                    onClick={onAutoSimulateClick}
                    className={
                      "btn " +
                      (autoSimulate ? "btn-primary" : "btn-outline-primary")
                    }
                  >
                    Auto
                  </button>
                  <button onClick={solveCallback} className="btn btn-success">
                    Optimaliseer
                  </button>
                </ButtonGroup>
                <hr />
                <Table hover striped>
                  <caption>Statistieken Simulatie</caption>
                  <tbody>
                    <tr>
                      <th>Duratie</th>
                      <td className="text-primary">{simulatorDuration} ms</td>
                    </tr>
                    <tr>
                      <th>Optimalisatie Error</th>
                      <td className="text-primary">{optimizerError}</td>
                    </tr>
                    <tr>
                      <th>Optimalisatie Iteraties</th>
                      <td className="text-primary">{optimizerIterations}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <div className="border rounded bg-light mb-2">
              <div className="d-flex justify-content-between p-2 border-bottom align-items-center">
                <p className="m-0 p-0 text-primary">Kannon</p>
                <p className="m-0 p-0">
                  <small className="text-muted">Kannon instellingen.</small>
                </p>
              </div>
              <div className="p-2">
                <Form.Group
                  className="mb-3"
                  controlId="controlInitialVelocityPitch"
                >
                  <Form.Label>
                    Pitch ({round(initialVelocityPitch, 4)} &deg;)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={1}
                    min={0}
                    max={180}
                    value={initialVelocityPitch}
                    onChange={onInitialVelocityPitchChange}
                  />
                  <Form.Text className="text-muted">
                    De hoek van het kannon.
                  </Form.Text>
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="controlInitialVelocityPitch"
                >
                  <Form.Label>
                    Yaw ({round(initialVelocityYaw, 4)} &deg;)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={1}
                    min={0}
                    max={180}
                    value={initialVelocityYaw}
                    onChange={onInitialVelocityYawChange}
                  />
                  <Form.Text className="text-muted">
                    De hoek van het kannon.
                  </Form.Text>
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="controlInitialVelocitySpeed"
                >
                  <Form.Label>
                    Snelheid ({round(initialVelocitySpeed, 4)} m/s)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={0.001}
                    min={0}
                    max={1000}
                    value={initialVelocitySpeed}
                    onChange={onInitialVelocitySpeedChange}
                  />
                  <Form.Text className="text-muted">
                    De initiele velocity.
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
            <div className="border rounded bg-light mb-2">
              <div className="d-flex justify-content-between p-2 border-bottom align-items-center">
                <p className="m-0 p-0 text-primary">Wind</p>
                <p className="m-0 p-0">
                  <small className="text-muted">
                    Wind instellingen van simulatie.
                  </small>
                </p>
              </div>
              <div className="p-2">
                <Form.Group className="mb-3" controlId="controlWindSpeed">
                  <Form.Label>Windsnelheid ({round(windSpeed, 4)})</Form.Label>
                  <Form.Control
                    type="range"
                    step={0.2}
                    min={0}
                    max={60}
                    value={windSpeed}
                    onChange={onWindSpeedChange}
                  />
                  <Form.Text className="text-muted">
                    Selecteer de snelheid van de wind in meters per seconden.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="controlWindOrigin">
                  <Form.Label>
                    Windoorsprong ({round(windOrigin, 4)} &deg;)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={1}
                    min={0}
                    max={360}
                    value={windOrigin}
                    onChange={onWindOriginChange}
                  />
                  <Form.Text className="text-muted">
                    Selecteer de oorsprong (hoek vanaf het noorden in graden).
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
            <div className="border rounded bg-light mb-2">
              <div className="d-flex justify-content-between p-2 border-bottom align-items-center">
                <p className="m-0 p-0 text-primary">Lucht</p>
                <p className="m-0 p-0">
                  <small className="text-muted">
                    Lucht instellingen van simulatie.
                  </small>
                </p>
              </div>
              <div className="p-2">
                <Form.Group className="mb-3" controlId="controlAirPressure">
                  <Form.Label>
                    Luchtdruk ({round(airPressure, 4)} hPa)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={1}
                    min={870}
                    max={1084}
                    value={airPressure}
                    onChange={onairPressureChange}
                  />
                  <Form.Text className="text-muted">
                    Selecteer de luchtdruk in hecto pascal.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="controlAirHumidity">
                  <Form.Label>
                    Relatieve Vochtigheid ({round(relativeHumidity * 100, 4)} %)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={0.01}
                    min={0}
                    max={1}
                    value={relativeHumidity}
                    onChange={onRelativeHumidityChange}
                  />
                  <Form.Text className="text-muted">
                    Selecteer de luchtvochtigheid, in percentages.
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
            <div className="border rounded bg-light mb-2">
              <div className="d-flex justify-content-between p-2 border-bottom align-items-center">
                <p className="m-0 p-0 text-primary">Temperatuur</p>
                <p className="m-0 p-0">
                  <small className="text-muted">Temperatuur van het gas.</small>
                </p>
              </div>
              <div className="p-2">
                <Form.Group className="mb-3" controlId="controlTemperature">
                  <Form.Label>
                    Temperatuur ({round(temperature, 4)} K)
                  </Form.Label>
                  <Form.Control
                    type="range"
                    step={1}
                    min={0}
                    max={500}
                    value={temperature}
                    onChange={onTemperatureChange}
                  />
                  <Form.Text className="text-muted">
                    Is een bikini nodig?
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
            <div className="border rounded bg-light">
              <div className="d-flex justify-content-between p-2 border-bottom align-items-center">
                <p className="m-0 p-0 text-primary">Projectiel</p>
                <p className="m-0 p-0">
                  <small className="text-muted">Zooi van het projectiel.</small>
                </p>
              </div>
              <div className="p-2">
                <Form.Group className="mb-3" controlId="controlObjectMass">
                  <Form.Label>Massa ({round(objectMass, 4)} Kg)</Form.Label>
                  <Form.Control
                    type="range"
                    step={0.001}
                    min={0}
                    max={5}
                    value={objectMass}
                    onChange={onObjectMassChange}
                  />
                  <Form.Text className="text-muted">
                    Wat is de massa van het projectiel (Aardappel lol)?
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="controlObjectRadius">
                  <Form.Label>Radius ({round(objectRadius, 4)} m)</Form.Label>
                  <Form.Control
                    type="range"
                    step={0.001}
                    min={0}
                    max={0.5}
                    value={objectRadius}
                    onChange={onObjectRadiusChange}
                  />
                  <Form.Text className="text-muted">
                    Wat is de radius van het projectiel?
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
