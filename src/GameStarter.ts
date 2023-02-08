import {AbstractRenderer, autoDetectRenderer, Container} from "pixi.js";
import {Context} from "@robotlegsjs/core";
import {PalidorBundle} from "@robotlegsjs/pixi-palidor";
import {ContextView} from "@robotlegsjs/pixi";
import Stats from "stats.js";

export class GameStarter {
    private _stage: Container;
    private _renderer: AbstractRenderer;
    private _context: Context;
    private _stats: Stats;

    constructor() {
        this._renderer = autoDetectRenderer({width: 1300, height: 700, backgroundColor: 0x1099bb});
        this._stage = new Container();
        this._context = new Context();
        this._context
            .install(PalidorBundle)
            .configure(new ContextView(this._stage))
            .initialize();

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