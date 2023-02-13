import {Eng} from "./GameEngine";
import {GameStarter} from "./GameStarter";

const starter = new GameStarter();
Eng.start(starter.stage).then();

// todo lets implement it step by step

// TileKillerSystem - remove group tiles by click single tile
    // rules to killing
// TileSpawnerSystem - generate new tiles instead empty fields
// TileAnimateSystem - animate tiles to finish positions
// BoosterSystem - apply booster effects

/*
    Level
        size: Point
        gameState: boolean
        maxShuffle: number
        winPoints: number
        winSteps: number

*/
/*

TileEntity
ButtonEntity
CounterEntity

 */

