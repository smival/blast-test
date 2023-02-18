import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {UIComponent} from "../components/UIComponent";

export class CleanSystem extends AppSystem
{
    protected uiFamily: Family;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine)
    {
        super.onAttach(engine);
        this.uiFamily = new FamilyBuilder(engine)
            .include(UIComponent)
            .build();
    }

    public update(engine: GameEngine, delta: number): void
    {

        this.uiFamily.entities.filter(item => item.getComponent(UIComponent).ui != null)
            .forEach(item =>
                {
                    const comp = item.getComponent(UIComponent);
                    comp.cleanTriggered();
                }
            );
    }
}