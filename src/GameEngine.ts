import {Container, filters, Loader, NineSlicePlane, Texture, Ticker} from "pixi.js";
import {Engine} from "@nova-engine/ecs";
import {IMeta} from "./types/IMeta";
import {System} from "@nova-engine/ecs/lib/System";
import {Pane, TpChangeEvent} from "tweakpane";
import {Utils} from "./utils/Utils";
import {TileKillerSystem} from "./systems/TileKillerSystem";
import {TileSpawnerSystem} from "./systems/TileSpawnerSystem";
import {TileAnimateSystem} from "./systems/TileAnimateSystem";
import {UISystem} from "./systems/UISystem";
import {EntitiesFactory} from "./EntitiesFactory";
import {ViewSystem} from "./systems/ViewSystem";
import {ELayerName} from "./components/ViewComponent";
import {GameFinishSystem} from "./systems/GameFinishSystem";
import {GameWinSystem} from "./systems/GameWinSystem";
import {GameShuffleSystem} from "./systems/GameShuffleSystem";
import {ProgressUI} from "./ui/ProgressUI";
import {Counter0UI} from "./ui/Counter0UI";
import {Counter1UI} from "./ui/Counter1UI";
import {Counter2UI} from "./ui/Counter2UI";
import {PointsCounterUI} from "./ui/PointsCounterUI";

export class GameEngine extends Engine {
    public gameMeta: IMeta;

    private static _instance: GameEngine;
    private _systemsList: System[] = [];

    private _time = 0;
    private _pause: boolean = false;
    private readonly _speed: number = 1;

    private _stage: Container;
    private _pane:Pane;

    public async start(stage: Container): Promise<void> {
        this._stage = stage;

        const FontFaceObserver = require('fontfaceobserver');
        const font = new FontFaceObserver('Roboto Condensed');
        const font2 = new FontFaceObserver('Marvin');

        await Promise.all([this.loadAssets(), font.load(), font2.load()]);
        const meta = Loader.shared.resources["meta.json"].data as IMeta;
        this.gameMeta = meta;

        this._systemsList = [
            new UISystem(1),
            new TileKillerSystem(100),
            new TileSpawnerSystem(101),
            new TileAnimateSystem(102),
            new ViewSystem(200),
            new GameShuffleSystem(201),
            new GameWinSystem(202),
            new GameFinishSystem(203)
        ];
        this._pane = new Pane();
        const PARAMS = {
            UISystem: true,
            TileKillerSystem: true,
            TileSpawnerSystem: true,
            TileAnimateSystem: true,
            ViewSystem: true,
            GameShuffleSystem: true,
            GameWinSystem: true,
            GameFinishSystem: true
        };

        const paneFolder = this._pane.addFolder({title:"admin", expanded: false})
            .addFolder({title:"working systems"});
        paneFolder.addInput(PARAMS, "UISystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "TileKillerSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "TileSpawnerSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "TileAnimateSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "ViewSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "GameShuffleSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "GameWinSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "GameFinishSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));

        Ticker.shared.maxFPS = 60;
        Ticker.shared.minFPS = 10;
        Ticker.shared.add((dt) => this.update(dt));

        const cont = stage.addChild(new Container());
        cont.position.set(130, 130);

        stage.addChild(new Container()).name = ELayerName.stage;
        stage.addChild(new Container()).name = ELayerName.gui;
        stage.addChild(cont).name = ELayerName.game;

        this.addEntity(EntitiesFactory.createLevel(this, meta.levels[0]));
        this._systemsList.forEach(system => {
            if (PARAMS[system.constructor.name])
                this.addSystem(system)
        });

        // field
        const fieldBg = new NineSlicePlane(Texture.from('field_bg.png'), 46, 46, 46, 46);
        fieldBg.width = 470;
        fieldBg.height = 530;
        fieldBg.position.set(100, 100);

        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new ProgressUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new Counter0UI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new Counter1UI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new Counter2UI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new PointsCounterUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(fieldBg, ELayerName.gui)));
    }

    protected onPaneSystemClick(e: TpChangeEvent<boolean>):void {
        const system = this._systemsList.filter(sys => sys.constructor.name == e.presetKey).shift();
        if (e.value) {
            this.addSystem(system);
        } else {
            this.removeSystem(system);
        }
    }

    public addToLayer(view: Container, layer?: ELayerName): Container
    {
        return this.stage.getChildByName<Container>(layer ? layer : ELayerName.stage)
            .addChild(view);
    }

    public getLayer(layerName: ELayerName): Container
    {
        return this.stage.getChildByName<Container>(layerName);
    }

    protected async loadAssets(): Promise<void> {
        return new Promise(resolve => {
            Loader.shared.add([
                "red.png", "blue.png", "yellow.png", "meta.json", "green.png", "purple.png"]).load(() => {
                resolve();
            });
        });
    }

    public static get inst(): GameEngine
    {
        if (!GameEngine._instance) {
            GameEngine._instance = new GameEngine();
        }

        return GameEngine._instance;
    }

    public update(delta: number): void
    {
        if (this._pause) {
            return;
        }
        const frameTime = 1 / Ticker.shared.maxFPS;
        this._time += (Ticker.shared.deltaMS / 1000) * this._speed;
        let count = Math.min(
            Math.floor(this._time / frameTime),
            Ticker.shared.maxFPS / Ticker.shared.minFPS
        );
        if (this._time / frameTime > 0.99) {
            count = count < 1 ? 1 : count;
            for (let i = 0; i < count; i++) {
                super.update(Utils.roundTo(frameTime * 1000, 5));
                this._time -= frameTime;
            }
        }
    }

    public get stage(): Container {
        return this._stage;
    }

    public pause(): void
    {
        this._pause = true;
        this.getLayer(ELayerName.game).interactiveChildren = false;
        const colorMatrix = new filters.ColorMatrixFilter();
        this.getLayer(ELayerName.game).filters = [colorMatrix];
        colorMatrix.brightness(0.5, false);
    }

    public play(): void
    {
        this._pause = false;
        this.getLayer(ELayerName.game).interactiveChildren = true;
        this.getLayer(ELayerName.game).filters = [];
    }
}

export const Eng = GameEngine.inst;