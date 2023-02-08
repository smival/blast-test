import {Component} from "@nova-engine/ecs";
import {ETileType} from "../ETileType";
import {Point} from "pixi.js";

export class TileComponent implements Component {
    public type: ETileType;
    public position: Point;
}