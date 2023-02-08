import {GameEngine} from "../GameEngine";
import {AppSystem} from "./AppSystem";

export class AddRemoveEntitySystem extends AppSystem {
    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine) {
        engine.applyAdd();
    }

    public update(engine: GameEngine, delta: number): void
    {
        engine.applyRemove();
        engine.applyAdd();
    }
}