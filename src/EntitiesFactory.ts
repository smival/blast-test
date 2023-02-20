import {TileEntity} from "./entity/TileEntity";
import {ETileType} from "./types/ETileType";
import {Container, Point, Sprite, Texture} from "pixi.js";
import {TileComponent} from "./components/TileComponent";
import {UIComponent} from "./components/UIComponent";
import {LevelEntity} from "./entity/LevelEntity";
import {LevelComponent} from "./components/LevelComponent";
import {Grid} from "./types/Grid";
import {GameEngine} from "./GameEngine";
import {ELayerName, ViewComponent} from "./components/ViewComponent";
import {MoveComponent} from "./components/MoveComponent";
import {ILevelMeta, IMeta} from "./types/IMeta";
import {ETileState} from "./types/ETileState";
import {UIEntity} from "./entity/UIEntity";
import {BaseCounterUI} from "./ui/BaseCounterUI";
import {GameEntity} from "./entity/GameEntity";
import {GameComponent} from "./components/GameComponent";

export class EntitiesFactory
{
    protected static _nextEntityId: number = 0;

    protected static nextEntityId(): number
    {
        return ++EntitiesFactory._nextEntityId;
    }

    public static createUICounter<PayloadType>(
        view: Container,
        clickable: boolean = false,
        payload:PayloadType = null): UIEntity
    {
        const entity = new UIEntity();
        entity.id = this.nextEntityId();
        entity.putComponent(UIComponent).counter = view as BaseCounterUI;
        if (clickable) {
            view.interactive = view.interactiveChildren = true;
            entity.getComponent(UIComponent).ui = view;
        }
        if (payload) {
            entity.getComponent(UIComponent).payload = payload;
        }

        return entity;
    }

    public static createLevel(engine: GameEngine, lavelMeta:ILevelMeta): LevelEntity
    {
        const entity = new LevelEntity();
        entity.id = this.nextEntityId();

        entity.putComponent(LevelComponent);
        const comp = entity.getComponent(LevelComponent);
        comp.levelMeta = lavelMeta;
        comp.grid = new Grid<TileComponent>();
        comp.grid.createGrid(comp.levelMeta.size.x, comp.levelMeta.size.y);

        comp.levelMeta.shuffle.curValue = 0;
        comp.levelMeta.winSteps.curValue = 0;
        comp.levelMeta.winPoints.curValue = 0;

        return entity;
    }

    public static createGame(engine: GameEngine, meta: IMeta): GameEntity
    {
        const entity = new GameEntity();
        entity.id = this.nextEntityId();

        const comp = entity.putComponent(GameComponent);
        comp.currentLevel = 0;
        comp.maxLevel = meta.levels.length-1;
        comp.totalPoints = 0;
        comp.boosters = meta.boosters;
        for (let compKey in comp.boosters) {
            comp.boosters[compKey].curValue = 0;
        }

        return entity;
    }

    public static createTile(position: Point, speed?: number): TileEntity
    {
        const entity = new TileEntity();
        entity.id = this.nextEntityId();
        entity.putComponent(TileComponent).type = EntitiesFactory.getRandomTile();
        entity.getComponent(TileComponent).gridPosition = position.clone();
        entity.getComponent(TileComponent).state = ETileState.new;

        entity.putComponent(MoveComponent);
        if (speed) {
            entity.getComponent(MoveComponent).speed = speed;
        }

        let view: Sprite;
        entity.putComponent(ViewComponent).view = view =
            EntitiesFactory.getTileView(entity.getComponent(TileComponent).type);
        view.interactive = view.interactiveChildren = true;
        view.position.set(position.x * view.width, position.y * view.height);
        entity.getComponent(ViewComponent).layerName = ELayerName.game;

        entity.putComponent(UIComponent);
        entity.getComponent(UIComponent).ui = view;

        return entity;
    }

    public static getTileView(tileType: ETileType): Sprite
    {
        return Sprite.from(Texture.from(ETileType[tileType] + ".png"));
    }

    public static getRandomTile(): ETileType
    {
        const allTiles = Object.keys(ETileType).filter(k => isNaN(Number(k)))
            .sort(() => Math.random() > 0.5 ? -1 : 1);
        return ETileType[allTiles.shift()];
    }
}