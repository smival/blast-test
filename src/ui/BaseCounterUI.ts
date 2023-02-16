import {Container} from "pixi.js";

export abstract class BaseCounterUI extends Container {
    abstract set value(value:number);
}