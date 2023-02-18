import {TileComponent} from "../components/TileComponent";
import {ETileState} from "../types/ETileState";
import {Grid} from "../types/Grid";

export class TileUtils
{
    public static blastTiles(tiles:TileComponent[], grid: Grid<TileComponent>): void
    {
        const affectedCols = [];
        tiles.forEach(tileComp =>
        {
            grid.killCell(tileComp.gridPosition);
            if (affectedCols.indexOf(tileComp.gridPosition.x) == -1) {
                affectedCols.push(tileComp.gridPosition.x);
            }
        })
        // move old tiles
        affectedCols.forEach(col =>
        {
            grid.dropCellsToFreePositions(col)
                .forEach(tileComp => tileComp.state = ETileState.falling);
        });
    }
}