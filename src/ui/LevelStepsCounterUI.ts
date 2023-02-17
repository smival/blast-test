import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class LevelStepsCounterUI extends BaseCounterUI {
    private readonly _counter: Text;

    constructor()
    {
        super();

        this.name = "stepsCounter";

        this.x = 600;
        this.y = 100;

        this._counter = new Text('99', {
            fontFamily: 'Marvin',
            fontSize: 55,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this._counter.position.set(100, 40);

        this.addChild(Sprite.from(Texture.from("score_steps.png")));
        this.addChild(this._counter);
    }

    public set value(value: number)
    {
        this._counter.text = value.toString();
    }
}