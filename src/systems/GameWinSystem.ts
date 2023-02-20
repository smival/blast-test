import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {AppSystem} from "./AppSystem";
import {TileComponent} from "../components/TileComponent";
import {EGameState} from "../types/EGameState";
import {LevelComponent} from "../components/LevelComponent";
import {ETileState} from "../types/ETileState";
import {EPauseReason} from "../types/EPauseReason";
import {ESoundName, SoundUtils} from "../utils/SoundUtils";

// has enough points
export class GameWinSystem extends AppSystem
{
    protected readonly targetState: EGameState = EGameState.win;
    protected tilesFamily?: Family;
    protected levelFamily: Family;

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
        this.levelFamily.entities.forEach(entity =>
        {
            level = entity.getComponent(LevelComponent);
        });
        if (!level) return;

        // wait all tiles before dialog
        if (engine.gameState == this.targetState && this.checkAnimationsCompleted()) {
            engine.pause({
                reason: EPauseReason.win,
                popupTitle: `Congrats! You are winner!\nYou made ${level.levelMeta.winPoints.curValue} points and ${level.levelMeta.winSteps.curValue} steps\nLets play next level`
            });
            SoundUtils.play(ESoundName.win);
        }

        if (level.isGameWin(engine) && engine.gameState == EGameState.playing) {
            engine.gameState = this.targetState;
        }
    }

    protected checkAnimationsCompleted(): boolean
    {
        return this.tilesFamily.entities
            .every(tileEntity => tileEntity.getComponent(TileComponent).state === ETileState.playable);
    }
}