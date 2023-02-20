import {Loader} from "pixi.js";

export enum ESoundName
{
    blast = "blast.mp3",
    fall = "fall.mp3",
    win = "win.mp3",
    lose = "lose.mp3"
}

export class SoundUtils
{
    public static soundList(): string[]
    {
        return Object.keys(ESoundName).map(key => ESoundName[key]);
    }

    public static play(sound: ESoundName)
    {
        Loader.shared.resources[sound].data.play();
    }
}