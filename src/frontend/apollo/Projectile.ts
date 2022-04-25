import { Circle } from "../math/Circle";

export class Projectile {
  /**
   * Constructs a new projectile.
   * @param mass the mass of the projectile in killograms.
   * @param dragCoefficient the drag coefficient.
   */
  public constructor(public readonly mass: number, public readonly dragCoefficient: number) {}

  /**
   * Gets the projected area.
   * @return the projected area.
   */
  public projectedArea(): number {
    throw new Error();
  }
}

export class SphericalProjectile extends Projectile {
  /**
   * Constructs a new spherical projectile.
   * @param mass the mass of the projectile in killograms.
   * @param radius the radius of the projectile in meters.
   */
  public constructor(
    mass: number,
    public readonly radius: number
  ) {
    super(mass, 0.47);
  }

  /**
   * Gets the projected area.
   * @return the projected area.
   */
  public projectedArea(): number {
    return new Circle(this.radius).area;
  }
}
