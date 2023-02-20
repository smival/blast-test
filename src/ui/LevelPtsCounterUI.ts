import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class LevelPtsCounterUI extends BaseCounterUI
{
    private readonly _counter: Text;

    constructor()
    {
        super();

        this.name = "levelPointsCounter";

        this.x = 600;
        this.y = 140;

        const counter2 = new Sprite(Texture.from('score_bar.png'));
        const textCounter22 = new Text('Очки', {
            fontFamily: 'Roboto Condensed',
            fontSize: 19,
            fill: 0xFFFFFF,
            align: 'center'
        });
        textCounter22.position.set(110, 155);
        this._counter = new Text('-', {
            fontFamily: 'Marvin',
            fontSize: 33,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this._counter.anchor.set(0.5, 0);
        this._counter.position.set(130, 170);

        const text = new Text('Бустеры', {
            fontFamily: 'Roboto Condensed',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        text.position.set(100, 260);

        this.addChild(counter2);
        this.addChild(textCounter22);
        this.addChild(this._counter);
        this.addChild(text);
    }

    public set value(value: number)
    {
        this._counter.text = value.toString();
    }
}