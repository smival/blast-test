import {Container, Loader, Ticker} from "pixi.js";
import {Engine, Entity} from "@nova-engine/ecs";
import {IMeta} from "./IMeta";
import {System} from "@nova-engine/ecs/lib/System";
import {Pane, TpChangeEvent} from "tweakpane";
import {Utils} from "./utils/Utils";
import {AddRemoveEntitySystem} from "./systems/AddRemoveEntitySystem";
import {TileKillerSystem} from "./systems/TileKillerSystem";
import {TileSpawnerSystem} from "./systems/TileSpawnerSystem";
import {TileAnimateSystem} from "./systems/TileAnimateSystem";
import {UISystem} from "./systems/UISystem";
import {EntitiesFactory} from "./EntitiesFactory";
import {ViewSystem} from "./systems/ViewSystem";
import {ELayerName} from "./components/ViewComponent";

export class GameEngine extends Engine {
    public meta: IMeta;

    private static _instance: GameEngine;
    private _entityToAdd: Entity[] = [];
    private _entityToRemove: number[] = [];
    private _systemsList: System[] = [];

    private _time = 0;
    private readonly _speed: number = 1;

    private _stage: Container;
    private _pane:Pane;

    public async start(stage: Container): Promise<void> {
        this._stage = stage;

        this._systemsList = [
            new AddRemoveEntitySystem(0),
            new ViewSystem(2),
            new UISystem(1),
            new TileKillerSystem(100),
            new TileSpawnerSystem(101),
            new TileAnimateSystem(102),
        ];
        this._pane = new Pane();
        const PARAMS = {
            AddRemoveEntitySystem: true,
            ViewSystem: true,
            UISystem: true,
            TileKillerSystem: true,
            TileSpawnerSystem: true,
            TileAnimateSystem: true
        };

        const paneFolder = this._pane.addFolder({title:"admin", expanded: false})
            .addFolder({title:"working systems"});
        paneFolder.addInput(PARAMS, "AddRemoveEntitySystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "ViewSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "UISystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "TileKillerSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "TileSpawnerSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "TileAnimateSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));

        const FontFaceObserver = require('fontfaceobserver');
        const font = new FontFaceObserver('Roboto Condensed');

        await Promise.all([this.loadAssets(), font.load()]);
        const meta = Loader.shared.resources["meta.json"].data as IMeta;
        this.meta = meta;

        Ticker.shared.maxFPS = 60;
        Ticker.shared.minFPS = 10;
        Ticker.shared.add((dt) => this.update(dt));

        const cont = stage.addChild(new Container());
        cont.position.set(100, 100);

        stage.addChild(new Container()).name = ELayerName.stage;
        stage.addChild(cont).name = ELayerName.game;
        stage.addChild(new Container()).name = ELayerName.gui;

        this.add(EntitiesFactory.createLevel(this));
        this._systemsList.forEach(system => this.addSystem(system));
    }

    protected onPaneSystemClick(e: TpChangeEvent<boolean>):void {
        const system = this._systemsList.filter(sys => sys.constructor.name == e.presetKey).shift();
        if (e.value) {
            this.addSystem(system);
        } else {
            this.removeSystem(system);
        }
    }

    public addToLayer(view: Container, layer?: ELayerName): void
    {
        this.stage.getChildByName<Container>(layer ? layer : ELayerName.stage)
            .addChild(view);
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

    public applyAdd(): void
    {
        this._entityToAdd.forEach(entity => this.addEntity(entity));
        this._entityToAdd = [];
    }

    public add(entity: Entity): void
    {
        //console.log(`entity will be added ${entity.constructor.name}`);
        this._entityToAdd.push(entity);
    }

    public remove(entityId: number): void
    {
        //console.log(`entity will be removed ${entityId}`);
        this._entityToRemove.push(entityId);
    }

    public applyRemove(): void
    {
        if (!this._entityToRemove.length) {
            return;
        }

        const list2die = this.entities.filter(entity => this._entityToRemove.indexOf(entity.id as number) !== -1);
        list2die.forEach(entity => this.removeEntity(entity));
        this._entityToRemove = [];
    }

    public get stage(): Container {
        return this._stage;
    }
}

export const Eng = GameEngine.inst;