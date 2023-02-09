import {Point} from "pixi.js";

export interface GridCell {
    position: Point;
}

export class Grid<T extends GridCell>
{
    private _grid: T[][];

    public createSquare(size: number, type: (new () => T)): T[][] {
        this._grid = new Array(size)
            .fill(new type())
            .map(() =>
                new Array(size).fill(new type())
            );
        return this._grid;
    }

    public getCellNeighborsByProp(position: Point, propName:string): T[] {
        const list: T[] = [];
        const rootCell = this.getCell(position);
        const propValue = rootCell[propName];
        const checked = Symbol("checked");
        const getCellsInternal = (position: Point) => {
            const cell = this.getCell(position);

            if (!cell || cell[checked] || cell[propName] != propValue) {
                return;
            }

            cell[checked] = true;
            list.push(cell);

            getCellsInternal(new Point(position.x, position.y-1));
            getCellsInternal(new Point(position.x, position.y+1));
            getCellsInternal(new Point(position.x-1, position.y));
            getCellsInternal(new Point(position.x+1, position.y));
        }
        getCellsInternal(position);
        list.forEach(item => delete item[checked]);
        console.log(list);
        return list;
    }

    public dropCellsToFreePositions(column: number): T[] {
        const cells = this.getCol(column).concat();
        const affectedCells: T[] = [];
        let moveDelta = 0;
        for (let i=cells.length-1; i>=0; i--) {
            const curCell = cells[i];
            if(curCell) {
                if (moveDelta) {
                    this.killCell(new Point(column, i));
                    this.putCell(new Point(column, i+moveDelta), curCell);
                    affectedCells.push(curCell);
                }
            } else {
               moveDelta++;
            }
        }

        return affectedCells;
    }

    public getCol(row: number): T[] {
        return this._grid[row];
    }

    public getRow(column: number): T[] {
        const result: T[] = [];
        this._grid.forEach(row => {
            result.push(row[column]);
        });

        return result;
    }

    public putCell(pos: Point, cell: T) {
        this._grid[pos.x][pos.y] = cell;
        cell.position = pos.clone();
    }

    public getCell(pos: Point): T | null {
        if (this._grid[pos.x] && this._grid[pos.x][pos.y]) {
            return this._grid[pos.x][pos.y];
        }
       return null;
    }

    public killCell(pos: Point): void {
        if (this._grid[pos.x] && this._grid[pos.x][pos.y]) {
            this._grid[pos.x][pos.y] = null;
        }
    }
}