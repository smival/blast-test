import {Component} from "@nova-engine/ecs";
import {ETileType} from "../types/ETileType";
import {Point} from "pixi.js";
import {GridCell} from "../types/Grid";
import {ETileState} from "../types/ETileState";

export class TileComponent implements Component, GridCell
{
    public type: ETileType;
    public gridPosition: Point;
    public state: ETileState;
}