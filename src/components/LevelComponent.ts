import {BaseLevelComponent} from "./BaseLevelComponent";
import {TileComponent} from "./TileComponent";
import {ETileState} from "../types/ETileState";

export class LevelComponent extends BaseLevelComponent<TileComponent>
{
    public get hasSteps(): boolean
    {
        const checked = Symbol("checked");
        let resultTiles = [];

        for (let cell of this.grid.getNotEmptyCells()) {
            if (cell[checked]) {
                continue;
            }

            const list = this.grid.getCellGroupByPoint(cell.gridPosition,
                {
                    type: cell.type,
                    state: ETileState.playable
                });
            list.forEach(cell => cell[checked] = true);

            resultTiles = resultTiles.concat(list);
            if (list.length >= this.levelMeta.blastSize) {
                resultTiles.forEach(cell => delete cell[checked]);
                return true;
            }
        }
        resultTiles.forEach(cell => delete cell[checked]);
        return false;
    }
}