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
import {ILevelMeta} from "./types/IMeta";
import {EGameState} from "./types/EGameState";
import {ETileState} from "./types/ETileState";
import {UIEntity} from "./entity/UIEntity";
import {BaseCounterUI} from "./ui/BaseCounterUI";

export class EntitiesFactory
{
    protected static _nextEntityId: number = 0;
    protected static nextEntityId(): number
    {
        return ++EntitiesFactory._nextEntityId;
    }

    public static createUICounter(view: Container): UIEntity
    {
        const entity = new UIEntity();
        entity.id = this.nextEntityId();
        entity.putComponent(UIComponent).counter = view as BaseCounterUI;

        return entity;
    }

    public static createLevel(engine:GameEngine, meta:ILevelMeta): LevelEntity
    {
        const entity = new LevelEntity();
        entity.id = this.nextEntityId();
        entity.putComponent(LevelComponent);
        const comp = entity.getComponent(LevelComponent);
        comp.levelMeta = meta;
        comp.grid = new Grid<TileComponent>();
        comp.grid.createGrid(comp.levelMeta.size.x, comp.levelMeta.size.y);
        comp.gameState = EGameState.init;

        comp.levelMeta.shuffle.curValue = 0;
        comp.levelMeta.winSteps.curValue = 0;
        comp.levelMeta.winPoints.curValue = 0;

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
        view.scale.set(0.2);
        view.position.set(position.x * view.width, position.y * view.height);
        entity.getComponent(ViewComponent).layerName = ELayerName.game;
        entity.getComponent(ViewComponent).removed = false;

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