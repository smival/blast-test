import {Point} from "pixi.js";

export interface GridCell
{
    gridPosition: Point;
}

export class Grid<T extends GridCell>
{
    private _grid: T[][];
    private _width: number = 0;
    private _height: number = 0;

    public createGrid(width: number, height: number): T[][]
    {
        this._width = width;
        this._height = height;

        this.clear();
        return this._grid;
    }

    public getTilesInRadius(position: Point, radius: number): T[]
    {
        return this.getNotEmptyCells()
            .filter(cell => cell.gridPosition.x >= position.x - radius
                && cell.gridPosition.x <= position.x + radius
                && cell.gridPosition.y >= position.y - radius
                && cell.gridPosition.y <= position.y + radius
            );
    }

    public getCellGroupByPoint(position: Point, compareProps: Partial<T>): T[]
    {
        const list: T[] = [];
        const checked = Symbol("checked");
        const getCellsInternal = (position: Point) =>
        {
            const cell = this.getCell(position);

            if (!cell || cell[checked] || !this.hasSameProps(cell, compareProps)) {
                return;
            }

            cell[checked] = true;
            list.push(cell);

            getCellsInternal(new Point(position.x, position.y - 1));
            getCellsInternal(new Point(position.x, position.y + 1));
            getCellsInternal(new Point(position.x - 1, position.y));
            getCellsInternal(new Point(position.x + 1, position.y));
        }
        getCellsInternal(position);
        list.forEach(item => delete item[checked]);
        //console.log(list);
        return list;
    }

    protected hasSameProps(target: T, props: Partial<T>): boolean
    {
        for (let key of Object.keys(props)) {
            if (target[key] !== props[key]) {
                return false;
            }
        }
        return true;
    }

    public dropCellsToFreePositions(column: number): T[]
    {
        const cells = this.getCol(column).concat();
        const affectedCells: T[] = [];
        let moveDelta = 0;
        for (let i = cells.length - 1; i >= 0; i--) {
            const curCell = cells[i];
            if (curCell) {
                if (moveDelta) {
                    this.killCell(new Point(column, i));
                    this.putCell(new Point(column, i + moveDelta), curCell);
                    affectedCells.push(curCell);
                }
            } else {
                moveDelta++;
            }
        }

        return affectedCells;
    }

    public getNotEmptyCells(): T[]
    {
        const result: T[] = [];
        for (let i = 0; i < this._height; i++) {
            for (let j = 0; j < this._width; j++) {
                const pos = new Point(i, j);
                if (this.getCell(pos)) {
                    result.push(this.getCell(pos));
                }
            }
        }
        return result;
    }

    public getEmptyCells(): Point[]
    {
        const result: Point[] = [];
        for (let i = 0; i < this._height; i++) {
            for (let j = 0; j < this._width; j++) {
                const pos = new Point(i, j);
                if (!this.getCell(pos)) {
                    result.push(pos);
                }
            }
        }
        return result;
    }

    public getCol(row: number): T[]
    {
        return this._grid[row];
    }

    public getRow(column: number): T[]
    {
        const result: T[] = [];
        this._grid.forEach(row =>
        {
            result.push(row[column]);
        });

        return result;
    }

    public putCell(pos: Point, cell: T)
    {
        this._grid[pos.x][pos.y] = cell;
        cell.gridPosition = pos.clone();
    }

    public getCell(pos: Point): T | null
    {
        if (this._grid[pos.x] && this._grid[pos.x][pos.y]) {
            return this._grid[pos.x][pos.y];
        }
        return null;
    }

    public killCell(pos: Point): void
    {
        if (this._grid[pos.x] && this._grid[pos.x][pos.y]) {
            this._grid[pos.x][pos.y] = null;
        }
    }

    public clear(): void
    {
        this._grid = new Array(this._height)
            .fill(null)
            .map(() =>
                new Array(this._width).fill(null)
            );
    }
}