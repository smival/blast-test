import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {AppSystem} from "./AppSystem";
import {LevelComponent} from "../components/LevelComponent";
import {ETileState, TileComponent} from "../components/TileComponent";
import {EGameState} from "../EGameState";

// has enough points
export class GameWinSystem extends AppSystem {
    protected readonly targetState: EGameState = EGameState.win;
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
        if (this.level.isGameWin) {
            this.level.gameState = this.targetState;
        }

        // wait all tiles
        const animationComplete = this.tilesFamily.entities
            .every(tileEntity => tileEntity.getComponent(TileComponent).state === ETileState.playable);

        if (this.level.gameState == this.targetState && animationComplete) {
            engine.pause();
            alert("Congrats! You are winner! Lets play next level");
        }
    }
}