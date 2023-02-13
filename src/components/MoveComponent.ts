import { Component } from "@nova-engine/ecs";
import {Point} from "pixi.js";
import {Utils} from "../utils/Utils";

export class MoveComponent implements Component {
    private _strategy: IMoveStrategy;
    enabled: boolean = false; // todo remove and use start/end point
    speed: number = 5;
    progress: number = 0;

    startPoint: Point;
    curPoint: Point;
    endPoint: Point;
    pathLength: number;

    public get strategy(): IMoveStrategy
    {
        return this._strategy;
    }

    public set strategy(value: IMoveStrategy)
    {
        this._strategy = value;
        this.progress = 0;
        this.enabled = true;
    }
}

export class MoveToTargetStrategy implements IMoveStrategy {
    onStart(comp: MoveComponent):void {
        comp.startPoint = comp.curPoint || comp.startPoint;
        comp.pathLength = Utils.len(Utils.delta(comp.startPoint, comp.endPoint));
    }
    onFinish(comp: MoveComponent): void {
        comp.enabled = false;
        comp.startPoint = null;
    }
}

export interface IMoveStrategy {
    onStart(comp: MoveComponent):void;
    onFinish(comp: MoveComponent): void;
}