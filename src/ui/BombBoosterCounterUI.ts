import {BaseBoosterCounterUI} from "./BaseBoosterCounterUI";
import {Sprite, Texture} from "pixi.js";

export class BombBoosterCounterUI extends BaseBoosterCounterUI
{
    constructor()
    {
        super();

        this.name = "bombCounter";
        this.x = 630;
        this.y = 440;

        this.addChild(Sprite.from(Texture.from("bomb-icon.png")))
            .position.set(20, 10);
    }
}