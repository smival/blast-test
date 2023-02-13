import {TileEntity} from "./entity/game/TileEntity";
import {ETileType} from "./ETileType";
import {Point, Sprite, Texture} from "pixi.js";
import {ETileState, TileComponent} from "./components/TileComponent";
import {UIComponent} from "./components/UIComponent";
import {LevelEntity} from "./entity/game/LevelEntity";
import {LevelComponent} from "./components/LevelComponent";
import {Grid} from "./utils/Grid";
import {GameEngine} from "./GameEngine";
import {ELayerName, ViewComponent} from "./components/ViewComponent";
import {MoveComponent} from "./components/MoveComponent";

export class EntitiesFactory
{
    protected static _nextEntityId: number = 0;
    protected static nextEntityId(): number
    {
        return ++EntitiesFactory._nextEntityId;
    }

    // todo level from meta
    public static createLevel(engine:GameEngine): LevelEntity
    {
        const entity = new LevelEntity();
        const size = 12;
        entity.id = this.nextEntityId();
        entity.putComponent(LevelComponent<TileComponent>);
        const comp = entity.getComponent(LevelComponent<TileComponent>);
        comp.blastSize = 3;
        comp.grid = new Grid<TileComponent>();
        comp.grid.createSquare(size);

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
        entity.getComponent(ViewComponent).moved = false;
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