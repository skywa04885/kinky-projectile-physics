export class Circle {
    public constructor(public readonly radius: number) {}

    public get area(): number {
        return Math.PI * Math.pow(this.radius, 2);
    }

    public get circumference(): number {
        return Math.PI * this.diameter;
    }

    public get diameter(): number {
        return 2 * this.radius;
    }
}