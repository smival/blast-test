import {AbstractRenderer, autoDetectRenderer, Container} from "pixi.js";
import Stats from "stats.js";

export class GameStarter {
    private _stage: Container;
    private _renderer: AbstractRenderer;
    private _stats: Stats;

    constructor() {
        this._renderer = autoDetectRenderer(
            {width: 1300, height: 700, backgroundColor: 0xa1a1a1, forceCanvas:true}
        );
        this._stage = new Container();

        this._stats = new Stats();
        document.body.appendChild(this._renderer.view);
        document.body.appendChild( this._stats.dom );
        this.render();
    }

    public get stage(): Container {
        return this._stage;
    }

    public render = (): void => {
        this._renderer.render(this._stage);
        this._stats.update();
        window.requestAnimationFrame(this.render);
    };
}