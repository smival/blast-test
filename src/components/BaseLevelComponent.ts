import {Component} from "@nova-engine/ecs";
import {EGameState} from "../types/EGameState";
import {Grid, GridCell} from "../types/Grid";
import {ILevelMeta} from "../types/IMeta";

export class BaseLevelComponent<CellType extends GridCell> implements Component {
    public grid: Grid<CellType>;
    public gameState: EGameState;
    public levelMeta:ILevelMeta;

    public get isGameOver(): boolean
    {
        return this.gameState == EGameState.playing
            && this.levelMeta.winSteps.curValue >= this.levelMeta.winSteps.maxValue
            && this.levelMeta.winPoints.curValue < this.levelMeta.winPoints.maxValue
            || (!this.hasSteps && !this.hasShuffle);
    }

    public get isGameWin(): boolean
    {
        return this.gameState == EGameState.playing
            && this.levelMeta.winPoints.curValue >= this.levelMeta.winPoints.maxValue;
    }

    public get hasSteps(): boolean
    {
        return true;
    }

    public get shufflesLeft(): number
    {
        return this.levelMeta.shuffle.maxValue - this.levelMeta.shuffle.curValue;
    }

    public get hasShuffle(): boolean
    {
        return this.levelMeta.shuffle.curValue <= this.levelMeta.shuffle.maxValue;
    }

    public incrementShuffle(): void
    {
        this.levelMeta.shuffle.curValue++;
    }

    public incrementStep(tilesCount: number): void
    {
        this.levelMeta.winPoints.curValue += tilesCount * 10;
        this.levelMeta.winSteps.curValue++;
    }
}