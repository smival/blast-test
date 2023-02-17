import {Point} from "pixi.js";

export class Utils
{
    public static roundTo(value: number, count: number = 2): number
    {
        return Math.round(value * Math.pow(10, count)) / Math.pow(10, count);
    }

    public static getDeltaInSec(delta: number, round = 5): number
    {
        return Utils.roundTo(delta / 1000, round);
    }

    public static copyObject<T>(obj: T): T
    {
        return JSON.parse(JSON.stringify(obj)) as T;
    }

    // Vector
    public static getPosOnLine(p0: Point, p1: Point, percentage: number): Point
    {
        return new Point(
            p0.x * (1.0 - percentage) + p1.x * percentage,
            p0.y * (1.0 - percentage) + p1.y * percentage
        );
    }

    public static len(v: Point): number
    {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    public static delta(p0: Point, p1: Point): Point
    {
        return new Point(p1.x - p0.x, p1.y - p0.y);
    }

    public static angle(p0: Point, p1: Point): number
    {
        return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
}