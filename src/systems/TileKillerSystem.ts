import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";
import {ViewComponent} from "../components/ViewComponent";

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
        let blastTilesComps:TileComponent[] = [];
        let movedTilesComps:TileComponent[] = [];
        let hasBlast = false;

        // blast
        this.tilesFamily.entities.filter(tileEntity => tileEntity.getComponent(UIComponent).triggered)
            .forEach(triggeredTileEntity => {
                triggeredTileEntity.getComponent(UIComponent).cleanTriggered();

                blastTilesComps = blastTilesComps.concat(
                    this.level.grid.getCellNeighborsByProp(
                    triggeredTileEntity.getComponent(TileComponent).position,
                    "type"
                ));

                if (blastTilesComps.length >= this.level.blastSize) {
                    hasBlast = true;
                    const affectedCols = [];
                    blastTilesComps.forEach(tileComp => {
                        this.level.grid.killCell(tileComp.position);
                        if (affectedCols.indexOf(tileComp.position.x) == -1) {
                            affectedCols.push(tileComp.position.x);
                        }
                    })
                    affectedCols.forEach(col => {
                        movedTilesComps = movedTilesComps.concat(this.level.grid.dropCellsToFreePositions(col));
                    });
                }
            });

        if (hasBlast) {
            // remove
            this.tilesFamily.entities.forEach(tileEntity => {
                if (blastTilesComps.indexOf(tileEntity.getComponent(TileComponent)) != -1) {
                    tileEntity.getComponent(ViewComponent).removed = true;
                }
            });
            // move
            this.tilesFamily.entities.forEach(tileEntity => {
                if (movedTilesComps.indexOf(tileEntity.getComponent(TileComponent)) != -1) {
                    tileEntity.getComponent(ViewComponent).moved = true;
                }
            });
        }
    }
}