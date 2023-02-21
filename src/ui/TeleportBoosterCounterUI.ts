import {BaseBoosterCounterUI} from "./BaseBoosterCounterUI";
import {Sprite, Texture} from "pixi.js";

export class TeleportBoosterCounterUI extends BaseBoosterCounterUI
{
    constructor()
    {
        super();

        this.name = "teleportCounter";
        this.x = 740;
        this.y = 440;

        this.addChild(Sprite.from(Texture.from("swap-icon.png")))
            .position.set(25, 10);
    }
}