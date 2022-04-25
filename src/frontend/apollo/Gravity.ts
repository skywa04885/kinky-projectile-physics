export namespace Gravity {
  export class GravitationalBody {
    public static readonly G: number = 6.67430 * Math.pow(10, -11);
    
    public static readonly EARTH: GravitationalBody = new GravitationalBody(
      5.972 * Math.pow(10, 24), // Estimated Mass in KG.
      6371000
    );
  
    public constructor(
      public readonly mass: number,
      public readonly radius: number
    ) {}

    public getForceOnObject(altitude: number, mass: number): number {
      const numerator: number =
        -1 * GravitationalBody.G * this.mass * mass;
      const denominator: number = Math.pow((this.radius + altitude), 2);
  
      return numerator / denominator;
    }
  }
  
}
