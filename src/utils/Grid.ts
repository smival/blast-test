import {Point} from "pixi.js";

export class Grid<T extends object>
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

    public putCell(pos: Point, cell: T) {
        this._grid[pos.x][pos.y] = cell;
    }

    public getCell(pos: Point): T | null {
        if (this._grid[pos.x] && this._grid[pos.x][pos.y]) {
            return this._grid[pos.x][pos.y];
        }
       return null;
    }

    public cleanCell(pos: Point): void {
        if (this._grid[pos.x] && this._grid[pos.x][pos.y]) {
            this._grid[pos.x][pos.y] = null;
        }
    }
}