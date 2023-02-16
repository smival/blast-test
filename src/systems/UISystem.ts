import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";

export class UISystem extends AppSystem {
    protected uiFamily?: Family;
    protected level: LevelComponent;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine) {
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
            .forEach(item => {
            const comp = item.getComponent(UIComponent);
            switch (comp.counter.name) {
                case "levelCounter":
                    comp.counter.value = 1;
                    break;
                case "totalWinCounter":

                    break;
                case "boosterCounter":

                    break;
                case "progressBar":
                    comp.counter.value = Math.min(1,
                        this.level.levelMeta.winPoints.curValue / this.level.levelMeta.winPoints.maxValue
                    );
                    break;
                case "levelPointsCounter":

                    break;
            }
        });
    }
}