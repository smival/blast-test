import {Entity, Family, FamilyBuilder} from "@nova-engine/ecs";
import {Eng, GameEngine} from "../GameEngine";
import {ViewComponent} from "../components/ViewComponent";
import {AppSystem} from "./AppSystem";
import {LevelComponent} from "../components/LevelComponent";
import {TileComponent} from "../components/TileComponent";
import {TileEntity} from "../entity/game/TileEntity";

export class ViewSystem extends AppSystem {
    protected family?: Family;
    protected level: LevelComponent<TileComponent>;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }
    onAttach(engine: GameEngine) {
        super.onAttach(engine);
        this.family = new FamilyBuilder(engine)
            .include(ViewComponent)
            .build();
        const levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.level = levelFamily.entities[0].getComponent(LevelComponent<TileComponent>);
    }

    public onDetach(engine: GameEngine)
    {
        this.family.entities.forEach(entity => {
            this.removeEntityView(engine, entity);
        });
        super.onDetach(engine);
    }

    public onEntityRemoved(entity: Entity)
    {
        super.onEntityRemoved(entity);
        if(entity.hasComponent(ViewComponent)) {
            this.removeEntityView(Eng, entity);
        }
    }

    protected removeEntityView(engine: GameEngine, entity: Entity): void {
        entity.getComponent(ViewComponent).views.forEach(view => {
            if (view.parent) {
                view.parent.removeChild(view);
            }
        });
    }

    public update(engine: GameEngine, delta: number): void
    {
        this.family.entities.forEach(entity => {
            entity.getComponent(ViewComponent).views.forEach(view => {
                if (!view.parent) {
                    engine.addToLayer(view, entity.getComponent(ViewComponent).layerName);
                }
            });
            if (entity instanceof TileEntity) {
                const tileComp = entity.getComponent(TileComponent);
                const viewComp = entity.getComponent(ViewComponent);
                // remove tile
                if (viewComp.removed) {
                    engine.remove(entity.id as number);
                } // move tile
                else if (viewComp.moved) {
                    viewComp.moved = false;
                    const view = viewComp.views[0];
                    view.position.set(tileComp.position.x * view.width, tileComp.position.y * view.height);
                }
            }
        });
    }
}