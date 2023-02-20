import {Entity, Family, FamilyBuilder} from "@nova-engine/ecs";
import {Eng, GameEngine} from "../GameEngine";
import {ViewComponent} from "../components/ViewComponent";
import {AppSystem} from "./AppSystem";
import {TileComponent} from "../components/TileComponent";
import {TileEntity} from "../entity/TileEntity";
import {ETileState} from "../types/ETileState";

export class ViewSystem extends AppSystem
{
    protected viewsFamily?: Family;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine)
    {
        super.onAttach(engine);
        this.viewsFamily = new FamilyBuilder(engine)
            .include(ViewComponent)
            .build();
    }

    public onDetach(engine: GameEngine)
    {
        this.viewsFamily.entities.forEach(entity =>
        {
            this.removeEntityView(engine, entity);
        });
        super.onDetach(engine);
    }

    public onEntityRemoved(entity: Entity)
    {
        super.onEntityRemoved(entity);
        if (entity.hasComponent(ViewComponent)) {
            this.removeEntityView(Eng, entity);
        }
    }

    protected removeEntityView(engine: GameEngine, entity: Entity): void
    {
        const {view} = entity.getComponent(ViewComponent);
        if (view.parent) {
            view.parent.removeChild(view);
        }
    }

    public update(engine: GameEngine, delta: number): void
    {
        this.viewsFamily.entities.forEach(entity =>
        {
            const {view} = entity.getComponent(ViewComponent);
            if (!view.parent) {
                engine.addToLayer(view, entity.getComponent(ViewComponent).layerName);
            }
            if (entity instanceof TileEntity) {
                const tileComp = entity.getComponent(TileComponent);
                // move tile
                if (tileComp.state == ETileState.playable) {
                    view.position.set(tileComp.gridPosition.x * view.width, tileComp.gridPosition.y * view.height);
                }
            }
        });
    }
}