export class Shere {
    public constructor(public readonly radius: number) {}

    public get area(): number {
        return 4 * Math.PI * Math.pow(this.radius, 2);
    }
}