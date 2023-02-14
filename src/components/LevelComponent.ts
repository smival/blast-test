import {Component} from "@nova-engine/ecs";
import {EGameState} from "../EGameState";
import {Grid, GridCell} from "../utils/Grid";
import {ILevelMeta} from "../IMeta";

export class LevelComponent<CellType extends GridCell> implements Component {
    public grid: Grid<CellType>;
    public gameState: EGameState;
    public levelMeta:ILevelMeta;

    public get isGameOver(): boolean
    {
        return this.gameState == EGameState.playing
            && this.levelMeta.winSteps.curValue >= this.levelMeta.winSteps.maxValue
            && this.levelMeta.winPoints.curValue < this.levelMeta.winPoints.maxValue;
    }

    public get isGameWin(): boolean
    {
        return this.gameState == EGameState.playing
            && this.levelMeta.winPoints.curValue >= this.levelMeta.winPoints.maxValue;
    }

    public makeStep(tilesCount: number): void
    {
        this.levelMeta.winPoints.curValue += tilesCount * 10;
        this.levelMeta.winSteps.curValue++;
    }

    public makeShuffle(): void
    {
        this.levelMeta.shuffle.curValue++;
    }
}