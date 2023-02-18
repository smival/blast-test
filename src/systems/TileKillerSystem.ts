import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";
import {ViewComponent} from "../components/ViewComponent";
import {ETileState} from "../types/ETileState";

export class TileKillerSystem extends AppSystem
{
    protected tilesFamily?: Family;
    protected levelFamily:Family;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine)
    {
        super.onAttach(engine);
        this.tilesFamily = new FamilyBuilder(engine)
            .include(TileComponent)
            .build();
        this.levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
    }

    public update(engine: GameEngine, delta: number): void
    {
        let blastTilesComps: TileComponent[] = [];
        let movedTilesComps: TileComponent[] = [];
        let hasBlast = false;

        let level;
        this.levelFamily.entities.forEach(entity => {
            level = entity.getComponent(LevelComponent);
        });
        if (!level) return;

        this.tilesFamily.entities.filter(
            tileEntity => tileEntity.getComponent(UIComponent).triggered
                && tileEntity.getComponent(TileComponent).state == ETileState.playable
        )
            .forEach(triggeredTileEntity =>
            {
                triggeredTileEntity.getComponent(UIComponent).cleanTriggered();
                // check blast
                blastTilesComps = blastTilesComps.concat(
                    level.grid.getCellGroupByPoint(
                        triggeredTileEntity.getComponent(TileComponent).gridPosition,
                        {
                            type: triggeredTileEntity.getComponent(TileComponent).type,
                            state: ETileState.playable
                        }
                    ));
                // blast
                if (blastTilesComps.length >= level.levelMeta.blastSize) {
                    hasBlast = true;
                    const affectedCols = [];
                    blastTilesComps.forEach(tileComp =>
                    {
                        level.grid.killCell(tileComp.gridPosition);
                        if (affectedCols.indexOf(tileComp.gridPosition.x) == -1) {
                            affectedCols.push(tileComp.gridPosition.x);
                        }
                    })
                    // move old tiles
                    affectedCols.forEach(col =>
                    {
                        movedTilesComps = movedTilesComps.concat(level.grid.dropCellsToFreePositions(col));
                    });
                }
            });

        if (hasBlast) {
            level.incrementStep(blastTilesComps.length);
            // remove
            this.tilesFamily.entities.forEach(tileEntity =>
            {
                if (blastTilesComps.indexOf(tileEntity.getComponent(TileComponent)) != -1) {
                    tileEntity.getComponent(ViewComponent).removed = true;
                }
            });
            // falling
            this.tilesFamily.entities.forEach(tileEntity =>
            {
                if (movedTilesComps.indexOf(tileEntity.getComponent(TileComponent)) != -1) {
                    tileEntity.getComponent(TileComponent).state = ETileState.falling
                }
            });
        }
    }
}