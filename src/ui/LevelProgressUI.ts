import {Container, NineSlicePlane, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class LevelProgressUI extends BaseCounterUI
{
    private readonly maxWidth = 470;
    private readonly minWidth = 25;
    private progressLineView: Container;

    constructor()
    {
        super();

        this.name = "progressBar";

        this.x = 100;

        const plane9progressBg = new NineSlicePlane(Texture.from('progress_bg.png'),
            23, 23, 23, 23);
        plane9progressBg.width = 500;
        plane9progressBg.height = 132;
        plane9progressBg.y = -66;

        const plane9progressLine = this.progressLineView = new NineSlicePlane(Texture.from('progress_line.png'),
            25, 25, 25, 25);
        plane9progressLine.width = 270;
        plane9progressLine.height = 26;
        plane9progressLine.position.set(10, 30);

        const plane9progressLineBg = new NineSlicePlane(Texture.from('progress_line_bg.png'),
            25, 25, 25, 25);
        plane9progressLineBg.width = 470;
        plane9progressLineBg.height = 26;
        plane9progressLineBg.position.set(10, 30)

        const text = new Text('Прогресс', {
            fontFamily: 'Roboto Condensed',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        text.position.x = 220;

        this.addChild(plane9progressBg);
        this.addChild(plane9progressLineBg);
        this.addChild(plane9progressLine);
        this.addChild(text);
    }

    public set value(value: number)
    {
        const totalWidth = value * this.maxWidth;
        this.progressLineView.width = totalWidth > 0 && totalWidth < this.minWidth ? this.minWidth : totalWidth;
    }
}