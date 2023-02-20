import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {AppSystem} from "./AppSystem";
import {TileComponent} from "../components/TileComponent";
import {EGameState} from "../types/EGameState";
import {LevelComponent} from "../components/LevelComponent";
import {ETileState} from "../types/ETileState";
import {EPauseReason} from "../types/EPauseReason";
import {ESoundName, SoundUtils} from "../utils/SoundUtils";

// game over = no tiles to blast and its last Shuffle
// game over = not enough points for X steps
export class GameOverSystem extends AppSystem
{
    protected readonly targetState: EGameState = EGameState.lose;
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
            engine.pause({reason: EPauseReason.lose, popupTitle: "The Game is over! Start from scratch."});
            SoundUtils.play(ESoundName.lose);
        }

        if (level.isGameOver(engine) && engine.gameState == EGameState.playing) {
            engine.gameState = this.targetState;
        }
    }

    protected checkAnimationsCompleted(): boolean
    {
        return this.tilesFamily.entities
            .every(tileEntity => tileEntity.getComponent(TileComponent).state === ETileState.playable);
    }
}