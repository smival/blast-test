import {Component} from "@nova-engine/ecs";
import {ETileType} from "../ETileType";
import {Point} from "pixi.js";
import {GridCell} from "../utils/Grid";

export class TileComponent implements Component, GridCell {
    public type: ETileType;
    public position: Point;
}