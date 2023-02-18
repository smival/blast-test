import {EPauseReason} from "../types/EPauseReason";

export interface GamePauseData
{
    readonly reason: EPauseReason;
    readonly popupTitle: string;
}