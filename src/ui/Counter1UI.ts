import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class Counter1UI extends BaseCounterUI {
    constructor()
    {
        super();

        this.name = "totalWinCounter";

        this.x = 650;
        this.y = 30;

        const counter1 = new Sprite(Texture.from('counter_1.png'));
        const textCounter1 = new Text('9999', {
            fontFamily: 'Marvin',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        textCounter1.position.set(40, 0);

        this.addChild(counter1);
        this.addChild(textCounter1);
    }

    public set value(value: number)
    {
    }
}