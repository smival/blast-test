import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {LevelComponent} from "../components/LevelComponent";
import {EGameState} from "../types/EGameState";
import {EPauseReason} from "../types/EPauseReason";
import {EntitiesFactory} from "../EntitiesFactory";
import {GameComponent} from "../components/GameComponent";
import {LevelEntity} from "../entity/LevelEntity";
import {GameEntity} from "../entity/GameEntity";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {ViewComponent} from "../components/ViewComponent";

export class GameRestartSystem extends AppSystem
{
    protected tilesFamily?: Family;

    protected levelEntity: LevelEntity;
    protected gameEntity: GameEntity;

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
    }

    public update(engine: GameEngine, delta: number): void
    {
        if (engine.gameState == EGameState.restart) {

            /*
        - loose
        remove game
        remove level
        remove tiles
        - win
        game .level++
        remove level
        remove tiles
        - shuffle
        level shuffles++
        remove tiles
         */

            if (!engine.pauseData) {
                this.createFromScratch(engine);
            } else {
                switch (engine.pauseData.reason) {
                    case EPauseReason.win:
                        const gameComp = this.gameEntity.getComponent(GameComponent);
                        if (!gameComp.isMaxLevel()) {
                            gameComp.currentLevel++;
                            engine.removeEntity(this.levelEntity);
                            this.createLevel(engine, gameComp.currentLevel);
                            this.clearTiles();
                        } else {
                            engine.pause({
                                reason:EPauseReason.wonWholeGame,
                                popupTitle: `Winner winner chicken dinner`
                            });
                            return;
                        }

                        break;
                    case EPauseReason.lose:
                    case EPauseReason.wonWholeGame:
                        engine.removeEntity(this.gameEntity);
                        engine.removeEntity(this.levelEntity);
                        this.createLevel(engine);
                        this.clearTiles();
                        this.createFromScratch(engine);
                        break;
                    case EPauseReason.shuffle:
                        const levelComp = this.levelEntity.getComponent(LevelComponent);
                        levelComp.incrementShuffle();
                        levelComp.grid.clear();
                        this.clearTiles();
                        break;
                }
            }

            engine.gameState = EGameState.init;
        }
    }

    protected clearTiles(): void {

        this.tilesFamily.entities.forEach(tileEntity =>
        {
            tileEntity.getComponent(ViewComponent).removed = true;
        });
    }

    protected createFromScratch(engine: GameEngine): void
    {
       this.createGame(engine);
       this.createLevel(engine);
    }

    protected createGame(engine: GameEngine): void
    {
        this.gameEntity = EntitiesFactory.createGame(engine, engine.gameMeta);
        engine.addEntity(this.gameEntity);
    }

    protected createLevel(engine: GameEngine, index: number = -1): void
    {
        const fixLevel = index == -1 ? 0 : index
        this.levelEntity = EntitiesFactory.createLevel(engine, engine.gameMeta.levels[fixLevel]);
        engine.addEntity(this.levelEntity);

        console.log(`level ${fixLevel + 1}`);
    }
}