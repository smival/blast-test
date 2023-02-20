import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {MoveComponent} from "../components/MoveComponent";
import {Utils} from "../utils/Utils";
import {ViewComponent} from "../components/ViewComponent";
import {Container, Point} from "pixi.js";
import {ETileState} from "../types/ETileState";
import {ESoundName, SoundUtils} from "../utils/SoundUtils";
import {TileUtils} from "../utils/TileUtils";

export class TileAnimateSystem extends AppSystem
{
    protected tilesFamily?: Family;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }

    onAttach(engine: GameEngine)
    {
        super.onAttach(engine);
        this.tilesFamily = new FamilyBuilder(engine)
            .include(TileComponent)
            .build();
    }

    public update(engine: GameEngine, delta: number): void
    {
        // todo falling onEnter - disable ui, playable onEnter - enable ui
        // old tiles falling from its positions
        this.tilesFamily.entities.filter(
            tileEntity => tileEntity.getComponent(TileComponent).state == ETileState.falling
                && !tileEntity.getComponent(MoveComponent).enabled
        ).forEach(tileEntity =>
        {
            const moveComp = tileEntity.getComponent(MoveComponent);
            const {view} = tileEntity.getComponent(ViewComponent);
            const tileComp = tileEntity.getComponent(TileComponent);
            TileUtils.moveTiles(tileComp, moveComp, view.position.clone(),
                new Point(
                    tileComp.gridPosition.x * view.width,
                    tileComp.gridPosition.y * view.height
                ), 4);
        });
        // new tiles falling from grid outside
        const entities = this.tilesFamily.entities.filter(
            tileEntity => tileEntity.getComponent(TileComponent).state == ETileState.new
                && !tileEntity.getComponent(MoveComponent).enabled
        );
        const colsDelta = [];
        entities.forEach(tileEntity =>
        {
            const tileComp = tileEntity.getComponent(TileComponent);
            const {x} = tileComp.gridPosition;
            colsDelta[x] = !colsDelta[x] ? 1 : colsDelta[x] + 1;
        });

        entities.forEach(tileEntity =>
        {
            const moveComp = tileEntity.getComponent(MoveComponent);
            const tileComp = tileEntity.getComponent(TileComponent);
            const {view} = tileEntity.getComponent(ViewComponent);
            const {x, y} = tileComp.gridPosition;
            TileUtils.moveTiles(tileComp, moveComp,
                new Point(tileComp.gridPosition.x * view.width, (y - colsDelta[x]) * view.height),
                new Point(
                    tileComp.gridPosition.x * view.width,
                    tileComp.gridPosition.y * view.height
                ));
        });

        // todo move strategy (move code to strategy)
        this.tilesFamily.entities.forEach(entity =>
        {
            const moveComp = entity.getComponent(MoveComponent);
            const tileComp = entity.getComponent(TileComponent);
            if (moveComp.enabled) {
                if (moveComp.progress == 0) {
                    moveComp.strategy.onStart(moveComp);
                }

                this.moveView(entity.getComponent(ViewComponent).view, moveComp);
                const deltaByFrame = moveComp.speed / 60;
                const deltaOnePercent = moveComp.pathLength / 100;
                moveComp.progress += deltaByFrame / deltaOnePercent;

                if (moveComp.progress >= 1) {
                    moveComp.progress = 1;
                    SoundUtils.play(ESoundName.fall);
                    this.moveView(entity.getComponent(ViewComponent).view, moveComp);
                    tileComp.state = ETileState.playable;
                    moveComp.strategy.onFinish(moveComp);
                }
            }
        });
    }

    protected moveView(view: Container, moveComp: MoveComponent): void
    {
        moveComp.curPoint = Utils.getPosOnLine(moveComp.startPoint, moveComp.endPoint, moveComp.progress);
        view.position.set(moveComp.curPoint.x, moveComp.curPoint.y);
    }
}