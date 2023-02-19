import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class BaseBoosterCounterUI extends BaseCounterUI
{
    private readonly _counter: Text;

    constructor()
    {
        super();

        const bonus = new Sprite(Texture.from('booster.png'));
        this._counter = new Text('-', {
            fontFamily: 'Marvin',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this._counter.anchor.set(0.5, 0);
        this._counter.position.set(40, 65);

        this.addChild(bonus);
        this.addChild(this._counter);
    }

    public set value(value: number)
    {
        this._counter.text = value.toString();
    }
}