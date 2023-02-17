import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {AppSystem} from "./AppSystem";
import {TileComponent} from "../components/TileComponent";
import {EGameState} from "../types/EGameState";
import {LevelComponent} from "../components/LevelComponent";
import {ETileState} from "../types/ETileState";
import {ViewComponent} from "../components/ViewComponent";

// has enough points
export class GameShuffleSystem extends AppSystem
{
    protected readonly targetState: EGameState = EGameState.noSteps;
    protected tilesFamily?: Family;
    protected level: LevelComponent;

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
        const levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.level = levelFamily.entities[0].getComponent(LevelComponent);
    }

    public update(engine: GameEngine, delta: number): void
    {
        // wait all tiles
        const animationComplete = this.tilesFamily.entities
            .every(tileEntity => tileEntity.getComponent(TileComponent).state === ETileState.playable);

        if (animationComplete && !this.level.hasSteps && this.level.hasShuffle) {
            this.level.gameState = this.targetState;
        }

        if (this.level.gameState == this.targetState && animationComplete) {
            engine.pause();
            alert(`No any steps! Shuffle left: ${this.level.shufflesLeft}`);
            engine.play();

            this.level.incrementShuffle();
            this.tilesFamily.entities.forEach(tileEntity =>
            {
                tileEntity.getComponent(ViewComponent).removed = true;
                this.level.grid.clear();
            });
            this.level.gameState = EGameState.init;
        }
    }
}