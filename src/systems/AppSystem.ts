import {System} from "@nova-engine/ecs/lib/System";
import {GameEngine} from "../GameEngine";
import {EngineEntityListener, Entity} from "@nova-engine/ecs";

export abstract class AppSystem extends System implements EngineEntityListener{
    public update(engine: GameEngine, delta: number): void
    {

    }

    public onAttach(engine: GameEngine): void
    {
        super.onAttach(engine);

        engine.addEntityListener(this);
    }


    public onDetach(engine: GameEngine): void
    {
        engine.removeEntityListener(this);

        super.onDetach(engine);
    }

    public onEntityAdded(entity: Entity): void
    {

    }

    public onEntityRemoved(entity: Entity): void
    {

    }
}