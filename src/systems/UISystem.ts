import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {UIComponent} from "../components/UIComponent";
import {LevelComponent} from "../components/LevelComponent";
import {GameComponent} from "../components/GameComponent";
import {ILevelMeta} from "../types/IMeta";
import {EBoosterType} from "../types/EBoosterType";

export class UISystem extends AppSystem
{
    protected uiFamily: Family;
    protected levelFamily:Family;
    protected gameFamily:Family;

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
        this.levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.gameFamily = new FamilyBuilder(engine)
            .include(GameComponent)
            .build();
    }

    public update(engine: GameEngine, delta: number): void
    {
        let meta: ILevelMeta;
        let game: GameComponent;

        this.levelFamily.entities.forEach(levelEntity => {
            meta = levelEntity.getComponent(LevelComponent).levelMeta;
        });
        this.gameFamily.entities.forEach(gameEntity => {
            game = gameEntity.getComponent(GameComponent);
        });

        this.uiFamily.entities.filter(item => item.getComponent(UIComponent).counter != null)
            .forEach(item =>
            {
                const comp = item.getComponent(UIComponent);
                switch (comp.counter.name) {
                    case "levelCounter":
                        comp.counter.value = game.currentLevel
                        break;
                    case "progressBar":
                        comp.counter.value = Math.min(1,
                            meta.winPoints.curValue / meta.winPoints.maxValue
                        );
                        break;
                    case "totalWinCounter":
                        comp.counter.value = Math.round(game.totalPoints);
                        break;
                    case "stepsCounter":
                        comp.counter.value = Math.round(meta.winSteps.maxValue - meta.winSteps.curValue);
                        break;
                    case "levelPointsCounter":
                        comp.counter.value = meta.winPoints.curValue;
                        break;
                    case "bombCounter":
                        comp.counter.value = game.getBoosterCount(EBoosterType.bomb);
                        break;
                    case "teleportCounter":
                        comp.counter.value = game.getBoosterCount(EBoosterType.teleport);
                        break;
                }
            });
    }
}