import {Component} from "@nova-engine/ecs";
import {EGameState} from "../types/EGameState";
import {Grid, GridCell} from "../types/Grid";
import {ILevelMeta} from "../types/IMeta";
import {GameEngine} from "../GameEngine";

export class BaseLevelComponent<CellType extends GridCell> implements Component
{
    public grid: Grid<CellType>;
    public levelMeta: ILevelMeta;

    public isGameOver(engine: GameEngine): boolean
    {
        return engine.gameState == EGameState.playing
            && this.levelMeta.winSteps.curValue >= this.levelMeta.winSteps.maxValue
            && this.levelMeta.winPoints.curValue < this.levelMeta.winPoints.maxValue
            || (!this.hasSteps && !this.hasShuffle);
    }

    public isGameWin(engine: GameEngine): boolean
    {
        return engine.gameState == EGameState.playing
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

    public incrementPoints(tilesCount: number): void
    {
        this.levelMeta.winPoints.curValue += tilesCount * 10;
    }

    public incrementStep(): void
    {
        this.levelMeta.winSteps.curValue++;
    }
}