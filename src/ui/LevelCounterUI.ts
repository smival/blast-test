import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class LevelCounterUI extends BaseCounterUI {
    private readonly _counter: Text;

    constructor()
    {
        super();

        this.name = "levelCounter";
        this.y = 60;

        const bg = new Sprite(Texture.from('counter_0.png'));
        this._counter = new Text('99', {
            fontFamily: 'Marvin',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this._counter.position.set(40, 0);

        this.addChild(bg);
        this.addChild(this._counter);
    }

    public set value(value: number)
    {
        this._counter.text = (value + 1).toString();
    }


}