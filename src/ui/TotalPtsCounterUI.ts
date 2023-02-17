import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class TotalPtsCounterUI extends BaseCounterUI {
    private readonly _counter: Text;

    constructor()
    {
        super();

        this.name = "totalWinCounter";

        this.x = 650;
        this.y = 30;

        const counter1 = new Sprite(Texture.from('counter_1.png'));
        this._counter = new Text('9999', {
            fontFamily: 'Marvin',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this._counter.position.set(40, 0);

        this.addChild(counter1);
        this.addChild(this._counter);
    }

    public set value(value: number)
    {
        this._counter.text = value.toString();
    }
}