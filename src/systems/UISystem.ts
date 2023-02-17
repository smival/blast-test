import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";

export class UISystem extends AppSystem
{
    protected uiFamily?: Family;
    protected level: LevelComponent;

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
        const levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.level = levelFamily.entities[0].getComponent(LevelComponent);
    }

    public update(engine: GameEngine, delta: number): void
    {
        // todo separate buttons and counters, buttons should be cleaned
        this.uiFamily.entities.filter(item => item.getComponent(UIComponent).counter != null)
            .forEach(item =>
            {
                const comp = item.getComponent(UIComponent);
                const meta = this.level.levelMeta;
                switch (comp.counter.name) {
                    case "levelCounter":
                        //comp.counter.value = this.level.currentLevel;
                        break;
                    case "progressBar":
                        comp.counter.value = Math.min(1,
                            meta.winPoints.curValue / meta.winPoints.maxValue
                        );
                        break;
                    case "totalWinCounter":
                        comp.counter.value = Math.round(meta.winPoints.curValue);
                        break;
                    case "stepsCounter":
                        comp.counter.value = Math.round(meta.winSteps.maxValue - meta.winSteps.curValue);
                        break;
                    case "levelPointsCounter":
                        comp.counter.value = meta.winPoints.curValue;
                        break;
                    case "boosterCounter":
                        comp.counter.value = this.level.boosters.bomb;
                        break;
                }
            });
    }
}