import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";
import {ETileState} from "../types/ETileState";
import {TileUtils} from "../utils/TileUtils";
import {ESoundName, SoundUtils} from "../utils/SoundUtils";
import {GameComponent} from "../components/GameComponent";

export class TileKillerSystem extends AppSystem
{
    protected tilesFamily?: Family;
    protected levelFamily: Family;
    protected gameFamily: Family;

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
            .include(UIComponent)
            .build();
        this.levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.gameFamily = new FamilyBuilder(engine)
            .include(GameComponent)
            .build();
    }

    public update(engine: GameEngine, delta: number): void
    {
        let blastTilesComps: TileComponent[] = [];
        let hasBlast = false;
        let level: LevelComponent;
        let game: GameComponent;

        this.levelFamily.entities.forEach(entity =>
        {
            level = entity.getComponent(LevelComponent);
        });
        this.gameFamily.entities.forEach(gameEntity =>
        {
            game = gameEntity.getComponent(GameComponent);
        });

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
                    SoundUtils.play(ESoundName.blast);
                    TileUtils.blastTiles(blastTilesComps, level.grid);
                }
            });

        if (hasBlast) {
            level.incrementStep();
            const points = level.incrementPointsByTilesCount(blastTilesComps.length);
            game.incrementTotalPoints(points);

            this.tilesFamily.entities.filter(tile => blastTilesComps.indexOf(tile.getComponent(TileComponent)) != -1)
                .forEach(tile => engine.removeEntity(tile));
        }
    }
}