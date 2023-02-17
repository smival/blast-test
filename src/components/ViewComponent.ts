import {Component} from "@nova-engine/ecs";
import {Container} from "pixi.js";

export class ViewComponent implements Component
{
    view: Container;
    layerName: ELayerName;
    removed: boolean;
}

export enum ELayerName
{
    stage = "stage",
    game = "game",
    gui = "gui"
}