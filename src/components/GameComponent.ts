import {Component} from "@nova-engine/ecs";
import {BoosterMeta} from "../types/IMeta";
import {EBoosterType} from "../types/EBoosterType";

export class GameComponent implements Component
{
    public currentLevel: number;
    public maxLevel: number;
    public totalPoints: number;
    public boosters: BoosterMeta;

    public isMaxLevel(): boolean
    {
       return this.currentLevel >= this.maxLevel;
    }

    public getBoosterCount(name:EBoosterType): number
    {
        return this.boosters[name] || 0;
    }
}