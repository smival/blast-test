import {AppSystem} from "./AppSystem";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {TileComponent} from "../components/TileComponent";
import {EntitiesFactory} from "../EntitiesFactory";
import {EGameState} from "../types/EGameState";
import {LevelComponent} from "../components/LevelComponent";

export class TileSpawnerSystem extends AppSystem
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

    // detect new fields available
    // spawn new Tiles to fill those free fields
    public update(engine: GameEngine, delta: number): void
    {
        let level;
        this.levelFamily.entities.forEach(entity => {
            level = entity.getComponent(LevelComponent);
        });
        if (!level) return;

        level.grid.getEmptyCells().forEach(newPosition =>
        {
            const newTile = EntitiesFactory.createTile(
                newPosition,
                engine.gameState == EGameState.init ? 20 : 0
            );
            engine.addEntity(newTile);
            level.grid.putCell(
                newPosition, newTile.getComponent(TileComponent)
            );
        });

        if (engine.gameState == EGameState.init) {
            engine.gameState = EGameState.playing;
        }
    }
}