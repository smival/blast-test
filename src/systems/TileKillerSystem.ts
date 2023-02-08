import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";

export class TileKillerSystem extends AppSystem {
    protected tilesFamily?: Family;
    protected level: LevelComponent<TileComponent>;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine) {
        super.onAttach(engine);
        this.tilesFamily = new FamilyBuilder(engine)
            .include(TileComponent)
            .build();
        const levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.level = levelFamily.entities[0].getComponent(LevelComponent<TileComponent>);
    }

    public update(engine: GameEngine, delta: number): void
    {
        this.tilesFamily.entities.filter(tileEntity => tileEntity.getComponent(UIComponent).triggered)
            .forEach(triggeredTileEntity => {
                triggeredTileEntity.getComponent(UIComponent).cleanTriggered();

                const blastTiles = this.level.grid.getCellNeighborsByProp(
                    triggeredTileEntity.getComponent(TileComponent).position,
                    "type"
                );

                if (blastTiles.length >= this.level.blastSize) {
                    blastTiles.forEach(tileComp => {
                        this.level.grid.cleanCell(tileComp.position);
                    })
                }
            });
    }
}