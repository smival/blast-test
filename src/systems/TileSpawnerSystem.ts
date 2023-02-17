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

    // detect new fields available
    // spawn new Tiles to fill those free fields
    public update(engine: GameEngine, delta: number): void
    {
        this.level.grid.getEmptyCells().forEach(newPosition =>
        {
            //console.log("new ", newPosition.x, newPosition.y);

            const newTile = EntitiesFactory.createTile(
                newPosition,
                this.level.gameState == EGameState.init ? 20 : 0
            );
            engine.addEntity(newTile);
            this.level.grid.putCell(
                newPosition, newTile.getComponent(TileComponent)
            );
        });

        if (this.level.gameState == EGameState.init) {
            this.level.gameState = EGameState.playing;
        }
    }
}