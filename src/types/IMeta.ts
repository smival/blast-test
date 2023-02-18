import {EBoosterType} from "./EBoosterType";

export interface IMeta
{
    readonly version: number;
    readonly boosters: BoosterMeta;
    readonly levels: ILevelMeta[];
}

export interface PayloadBooster {
    type: EBoosterType;
}

export type BoosterMeta = {
    readonly [key in EBoosterType]: LevelProp;
}

export interface LevelProp
{
    curValue?: number;
    readonly maxValue: number;
}

export interface ILevelMeta
{
    readonly size: IPoint;
    readonly blastSize: number,
    readonly shuffle: LevelProp;
    readonly winPoints: LevelProp;
    readonly winSteps: LevelProp;
}

export interface IPoint
{
    readonly x: number,
    readonly y: number
}