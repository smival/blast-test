import {TileEntity} from "./entity/game/TileEntity";
import {ETileType} from "./ETileType";
import {Point, Sprite, Texture} from "pixi.js";
import {TileComponent} from "./components/TileComponent";
import {UIComponent} from "./components/UIComponent";
import {LevelEntity} from "./entity/game/LevelEntity";
import {LevelComponent} from "./components/LevelComponent";
import {Grid} from "./utils/Grid";
import {GameEngine} from "./GameEngine";
import {ELayerName, ViewComponent} from "./components/ViewComponent";

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
        comp.grid.createSquare(size, TileComponent);
        for (let i=0; i<size; i++) {
            for (let j=0; j<size; j++) {
                const newTile = EntitiesFactory.createTile(new Point(i, j));
                engine.add(newTile);
                comp.grid.putCell(
                    new Point(i, j), newTile.getComponent(TileComponent)
                );
            }
        }

        return entity;
    }

    public static createTile(position: Point, type?: ETileType): TileEntity
    {
        const entity = new TileEntity();
        entity.id = this.nextEntityId();
        entity.putComponent(TileComponent).type = type ? type : EntitiesFactory.getRandomTile();
        entity.getComponent(TileComponent).position = position.clone();

        let view: Sprite;
        entity.putComponent(ViewComponent).views = [view] = [
            EntitiesFactory.getTileView(entity.getComponent(TileComponent).type)
        ];
        view.interactive = view.interactiveChildren = true;
        view.scale.set(0.2);
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