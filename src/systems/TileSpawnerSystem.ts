import {AppSystem} from "./AppSystem";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {TileComponent} from "../components/TileComponent";
import {LevelComponent} from "../components/LevelComponent";
import {EntitiesFactory} from "../EntitiesFactory";

export class TileSpawnerSystem extends AppSystem {
    protected tilesFamily?: Family;
    protected level: LevelComponent<TileComponent>;
    protected firstState: boolean = true; // todo set to game state

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

    // detect new fields available
    // spawn new Tiles to fill those free fields
    public update(engine: GameEngine, delta: number): void
    {
        this.level.grid.getFreeCells().forEach(newPosition => {
            //console.log("new ", newPosition.x, newPosition.y);

            const newTile = EntitiesFactory.createTile(newPosition, this.firstState ? 20 : 0);
            engine.add(newTile);
            this.level.grid.putCell(
                newPosition, newTile.getComponent(TileComponent)
            );
        });
        this.firstState = false;
    }
}