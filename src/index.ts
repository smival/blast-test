import {Eng} from "./GameEngine";
import {GameStarter} from "./GameStarter";

const starter = new GameStarter();
Eng.start(starter.stage).then();

