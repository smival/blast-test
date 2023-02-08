import {AppSystem} from "./AppSystem";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {GameEngine} from "../GameEngine";
import {TileComponent} from "../components/TileComponent";

export class TileSpawnerSystem extends AppSystem {
    protected tilesFamily?: Family;

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
    }

    public update(engine: GameEngine, delta: number): void
    {

    }
}