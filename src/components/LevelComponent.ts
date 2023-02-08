import {Component} from "@nova-engine/ecs";
import {Point} from "pixi.js";
import {EGameState} from "../EGameState";
import {Grid} from "../utils/Grid";

export interface LevelProp {
    curValue?: number;
    maxValue: number;
}

export class LevelComponent<CellType extends object> implements Component {
    public size: Point;
    public grid: Grid<CellType>;
    public blastSize: number;
    public gameState: EGameState;
    public shuffle: LevelProp;
    public winPoints: LevelProp;
    public winSteps: LevelProp;
}