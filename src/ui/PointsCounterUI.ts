import {Sprite, Text, Texture} from "pixi.js";
import {BaseCounterUI} from "./BaseCounterUI";

export class PointsCounterUI  extends BaseCounterUI {
     constructor()
     {
         super();

         this.name = "levelPointsCounter";

         this.x = 600;
         this.y = 100;

         const counter2 = new Sprite(Texture.from('score_bar.png'));
         const textCounter2 = new Text('999', {
             fontFamily: 'Marvin',
             fontSize: 33,
             fill: 0xFFFFFF,
             align: 'center'
         });
         textCounter2.position.set(100, 170);
         const textCounter22 = new Text('Очки', {
             fontFamily: 'Roboto Condensed',
             fontSize: 19,
             fill: 0xFFFFFF,
             align: 'center'
         });
         textCounter22.position.set(110, 155);
         const textCounter222 = new Text('99', {
             fontFamily: 'Marvin',
             fontSize: 55,
             fill: 0xFFFFFF,
             align: 'center'
         });
         textCounter222.position.set(100, 40);

         this.addChild(counter2);
         this.addChild(textCounter2);
         this.addChild(textCounter22);
         this.addChild(textCounter222);
     }

    public set value(value: number)
    {
    }
}