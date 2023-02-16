import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class Counter2UI extends BaseCounterUI {
    constructor()
    {
        super();

        this.name = "boosterCounter";

        this.x = 600;
        this.y = 400;

        const bonus = new Sprite(Texture.from('booster.png'));
        const bonusText = new Text('9', {
            fontFamily: 'Marvin',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        bonusText.position.set(30, 65);

        this.addChild(bonus);
        this.addChild(bonusText);
    }

    public set value(value: number)
    {
    }
}