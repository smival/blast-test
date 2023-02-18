import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {AppSystem} from "./AppSystem";
import {TileComponent} from "../components/TileComponent";
import {EGameState} from "../types/EGameState";
import {LevelComponent} from "../components/LevelComponent";
import {ETileState} from "../types/ETileState";
import {EPauseReason} from "../types/EPauseReason";

// has enough points
export class GameShuffleSystem extends AppSystem
{
    protected readonly targetState: EGameState = EGameState.shuffle;
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
        let level;
        this.levelFamily.entities.forEach(entity => {
            level = entity.getComponent(LevelComponent);
        });
        if (!level) return;

        if (engine.gameState == this.targetState && this.checkAnimationsCompleted()) {
            engine.pause({
                reason:EPauseReason.shuffle,
                popupTitle:`No any steps! Shuffle left: ${level.shufflesLeft}`
            });


/*
            this.level.incrementShuffle();
            this.tilesFamily.entities.forEach(tileEntity =>
            {
                tileEntity.getComponent(ViewComponent).removed = true;
                this.level.grid.clear();
            });
            engine.gameState = EGameState.init;

 */
        }

        if (!level.hasSteps && level.hasShuffle && engine.gameState == EGameState.playing
        && this.checkAnimationsCompleted()) {
            engine.gameState = this.targetState;
        }
    }

    protected checkAnimationsCompleted(): boolean
    {
        return this.tilesFamily.entities
            .every(tileEntity => tileEntity.getComponent(TileComponent).state === ETileState.playable);
    }
}