import {
    Container,
    filters,
    Loader,
    NineSlicePlane,
    Texture,
    Ticker,
    TickerCallback,
    Graphics,
    AbstractRenderer
} from "pixi.js";
import {Engine} from "@nova-engine/ecs";
import {IMeta, PayloadBooster} from "./types/IMeta";
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
import {GameWinSystem} from "./systems/GameWinSystem";
import {GameShuffleSystem} from "./systems/GameShuffleSystem";
import {LevelProgressUI} from "./ui/LevelProgressUI";
import {LevelCounterUI} from "./ui/LevelCounterUI";
import {TotalPtsCounterUI} from "./ui/TotalPtsCounterUI";
import {LevelPtsCounterUI} from "./ui/LevelPtsCounterUI";
import {LevelStepsCounterUI} from "./ui/LevelStepsCounterUI";
import {GamePauseData} from "./ui/GamePauseData";
import {EGameState} from "./types/EGameState";
import {GameRestartSystem} from "./systems/GameRestartSystem";
import {GameOverSystem} from "./systems/GameOverSystem";
import {CleanSystem} from "./systems/CleanSystem";
import {BoosterSystem} from "./systems/BoosterSystem";
import {EBoosterType} from "./types/EBoosterType";
import {BombBoosterCounterUI} from "./ui/BombBoosterCounterUI";
import {TeleportBoosterCounterUI} from "./ui/TeleportBoosterCounterUI";
import {SoundUtils} from "./utils/SoundUtils";

export class GameEngine extends Engine
{
    public gameMeta: IMeta;

    private static _instance: GameEngine;
    private _systemsList: System[] = [];
    private _gameState: EGameState = EGameState.restart;

    private _time = 0;
    private _pause: boolean = false;
    private _pauseData: GamePauseData;
    private readonly _speed: number = 1;
    private readonly _tickCallback: TickerCallback<any> = (dt) => this.update(dt)

    private _root: Container;
    private _stage: Container;
    private _renderer: AbstractRenderer;
    private _pane: Pane;

    public async start(stage: Container, renderer: AbstractRenderer): Promise<void>
    {
        this._stage = stage;
        this._renderer = renderer;

        const FontFaceObserver = require('fontfaceobserver');
        const font = new FontFaceObserver('Roboto Condensed');
        const font2 = new FontFaceObserver('Marvin');

        await Promise.all([this.loadAssets(), font.load(), font2.load()]);
        const meta = Loader.shared.resources["meta.json"].data as IMeta;
        this.gameMeta = meta;

        this._systemsList = [
            new GameRestartSystem(0),
            new UISystem(1),
            new BoosterSystem(100),
            new TileKillerSystem(101),
            new TileSpawnerSystem(102),
            new TileAnimateSystem(103),
            new ViewSystem(200),
            new GameShuffleSystem(201),
            new GameWinSystem(202),
            new GameOverSystem(203),
            new CleanSystem(204)

        ];
        this._pane = new Pane();
        const PARAMS = {
            GameRestartSystem: true,
            UISystem: true,
            BoosterSystem: true,
            TileKillerSystem: true,
            TileSpawnerSystem: true,
            TileAnimateSystem: true,
            ViewSystem: true,
            GameShuffleSystem: true,
            GameWinSystem: true,
            GameOverSystem: true,
            CleanSystem: true
        };

        const paneFolder = this._pane.addFolder({title: "admin", expanded: false})
            .addFolder({title: "working systems"});
        paneFolder.addInput(PARAMS, "GameRestartSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "UISystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "BoosterSystem")
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
        paneFolder.addInput(PARAMS, "GameOverSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));
        paneFolder.addInput(PARAMS, "CleanSystem")
            .on("change", (ev) => this.onPaneSystemClick(ev));

        Ticker.shared.maxFPS = 60;
        Ticker.shared.minFPS = 10;
        Ticker.shared.add(this._tickCallback);

        // view
        const rootContainer = this._root = new Container();
        const rootGraphics = new Graphics();
        rootGraphics.beginFill(renderer.options.backgroundColor);
        const gameContainer = new Container();
        gameContainer.position.set(130, 130);

        stage.addChild(rootContainer);
        rootContainer.addChild(rootGraphics);
        rootContainer.addChild(new Container()).name = ELayerName.stage;
        rootContainer.addChild(new Container()).name = ELayerName.gui;
        rootContainer.addChild(gameContainer).name = ELayerName.game;

        this._systemsList.forEach(system =>
        {
            if (PARAMS[system.constructor.name])
                this.addSystem(system)
        });

        // field
        const fieldBg = new NineSlicePlane(Texture.from('field_bg.png'), 46, 46, 46, 46);
        fieldBg.width = 470;
        fieldBg.height = 530;
        fieldBg.position.set(100, 100);
        // UI
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new LevelProgressUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new LevelCounterUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new TotalPtsCounterUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new LevelPtsCounterUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(new LevelStepsCounterUI(), ELayerName.gui)));
        this.addEntity(EntitiesFactory.createUICounter(this.addToLayer(fieldBg, ELayerName.gui)));

        this.addEntity(EntitiesFactory.createUICounter<PayloadBooster>(this.addToLayer(new BombBoosterCounterUI(), ELayerName.gui), true, {type: EBoosterType.bomb}));
        this.addEntity(EntitiesFactory.createUICounter<PayloadBooster>(this.addToLayer(new TeleportBoosterCounterUI(), ELayerName.gui), true, {type: EBoosterType.teleport}));

        rootGraphics.drawRect(0, 0, 900, 700);
    }

    public resize(width: number, height: number): void
    {
        this._renderer.resize(width, height);
        this.resizeGame(width, height);
    }

    protected onPaneSystemClick(e: TpChangeEvent<boolean>): void
    {
        const system = this._systemsList.filter(sys => sys.constructor.name == e.presetKey).shift();
        if (e.value) {
            this.addSystem(system);
        } else {
            this.removeSystem(system);
        }
    }

    public addToLayer(view: Container, layer?: ELayerName): Container
    {
        return this._root.getChildByName<Container>(layer ? layer : ELayerName.stage)
            .addChild(view);
    }

    public getLayer(layerName: ELayerName): Container
    {
        return this._root.getChildByName<Container>(layerName);
    }

    protected async loadAssets(): Promise<void>
    {
        return new Promise(resolve =>
        {
            Loader.shared.add([
                "red.png", "blue.png", "yellow.png", "meta.json", "green.png", "purple.png",
                ...SoundUtils.soundList()]).load(() =>
            {
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
            Ticker.shared.remove(this._tickCallback);
            window.requestAnimationFrame(() =>
            {
                alert(this.pauseData.popupTitle);
                this._gameState = EGameState.restart;
                this.play();
                Ticker.shared.add(this._tickCallback);
            });
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

    public get stage(): Container
    {
        return this._stage;
    }

    private resizeGame(appWidth: number, appHeight: number): void
    {
        const {width, height} = this._root;
        let scale: number = Math.min(appWidth / width, appHeight / height);
        scale = scale > 1 ? 1 : scale;

        this._root.scale.set(scale, scale);
    }

    public pause(data: GamePauseData): void
    {
        this._pause = true;
        this._pauseData = data;
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

    public get pauseData(): GamePauseData
    {
        return this._pauseData;
    }

    public get gameState(): EGameState
    {
        return this._gameState;
    }

    public set gameState(value: EGameState)
    {
        console.log(`change state "${this._gameState}" => "${value}"`);
        this._gameState = value;
    }
}

export const Eng = GameEngine.inst;