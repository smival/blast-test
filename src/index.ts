import {Eng} from "./GameEngine";
import {GameStarter} from "./GameStarter";

const resize = () => {
    Eng.resize(
        window.innerWidth,
        window.innerHeight);
};

const starter = new GameStarter();
Eng.start(starter.stage, starter.renderer).then(() => {
    window.addEventListener("resize", resize);
    resize();
});

