import {AppSystem} from "./AppSystem";
import {GameEngine} from "../GameEngine";
import {Family, FamilyBuilder} from "@nova-engine/ecs";
import {TileComponent} from "../components/TileComponent";
import {UIComponent} from "../components/UIComponent";
import {ETileState} from "../types/ETileState";
import {EBoosterType} from "../types/EBoosterType";
import {Container, filters} from "pixi.js";
import {PayloadBooster} from "../types/IMeta";
import {TileUtils} from "../utils/TileUtils";
import {LevelComponent} from "../components/LevelComponent";
import {ViewComponent} from "../components/ViewComponent";
import {ESoundName, SoundUtils} from "../utils/SoundUtils";
import {GameComponent} from "../components/GameComponent";
import {TileEntity} from "../entity/TileEntity";
import {MoveComponent} from "../components/MoveComponent";

export class BoosterSystem extends AppSystem
{
    // todo move to meta
    public readonly bombRadius: number = 2;

    protected teleportFirstEntity: TileEntity;

    protected tilesFamily: Family;
    protected boosterUIFamily: Family;
    protected levelFamily: Family;
    protected gameFamily: Family;

    protected selectedBoosterUI: Container;
    protected selectedBoosterType: EBoosterType;
    protected filter: any;

    constructor(priority: number)
    {
        super();
        this.priority = priority;
        this.filter = new filters.ColorMatrixFilter();
        this.filter.brightness(0.5, false);
    }

    onAttach(engine: GameEngine)
    {
        super.onAttach(engine);
        this.tilesFamily = new FamilyBuilder(engine)
            .include(TileComponent)
            .include(UIComponent)
            .build();
        this.boosterUIFamily = new FamilyBuilder(engine)
            .exclude(TileComponent)
            .include(UIComponent)
            .build();
        this.levelFamily = new FamilyBuilder(engine)
            .include(LevelComponent)
            .build();
        this.gameFamily = new FamilyBuilder(engine)
            .include(GameComponent)
            .build();
    }

    public update(engine: GameEngine, delta: number): void
    {
        let level: LevelComponent;
        let game: GameComponent;

        this.levelFamily.entities.forEach(entity =>
        {
            level = entity.getComponent(LevelComponent);
        });
        this.gameFamily.entities.forEach(gameEntity =>
        {
            game = gameEntity.getComponent(GameComponent);
        });

        // apply booster effect
        if (this.selectedBoosterUI) {
            this.tilesFamily.entities.filter(
                tileEntity => tileEntity.getComponent(UIComponent).triggered
                    && tileEntity.getComponent(TileComponent).state == ETileState.playable
            )
                .forEach(triggeredTileEntity =>
                {
                    const uiComp = triggeredTileEntity.getComponent(UIComponent);
                    const tileComp = triggeredTileEntity.getComponent(TileComponent);
                    uiComp.cleanTriggered();

                    switch (this.selectedBoosterType) {
                        case EBoosterType.bomb:
                            const affectedTiles = level.grid.getTilesInRadius(tileComp.gridPosition, this.bombRadius);
                            const points = level.incrementPointsByTilesCount(affectedTiles.length);
                            game.incrementTotalPoints(points);
                            game.useBooster(this.selectedBoosterType);

                            SoundUtils.play(ESoundName.blast);
                            TileUtils.blastTiles(affectedTiles, level.grid);
                            this.tilesFamily.entities.filter(tileEntity => affectedTiles.indexOf(tileEntity.getComponent(TileComponent)) != -1)
                                .forEach(tile => engine.removeEntity(tile));
                            this.unSelectBooster();

                            break;
                        case EBoosterType.teleport:
                            if (this.teleportFirstEntity) {
                                uiComp.ui.filters = [];
                            }
                            // apply teleport
                            if (this.teleportFirstEntity && this.teleportFirstEntity != triggeredTileEntity) {
                                const pair1 = this.teleportFirstEntity;
                                const pair2 = triggeredTileEntity;
                                const pos1 = pair1.getComponent(ViewComponent).view.position.clone();
                                const pos2 = pair2.getComponent(ViewComponent).view.position.clone();
                                const tile1 = pair1.getComponent(TileComponent);
                                const tile2 = pair2.getComponent(TileComponent);
                                const gridPos1 = tile1.gridPosition.clone();
                                const gridPos2 = tile2.gridPosition.clone();

                                TileUtils.moveTiles(
                                    tile1, pair1.getComponent(MoveComponent),
                                    pos1, pos2
                                );
                                TileUtils.moveTiles(
                                    tile2, pair2.getComponent(MoveComponent),
                                    pos2, pos1
                                );

                                level.grid.putCell(gridPos1, tile2);
                                level.grid.putCell(gridPos2, tile1);

                                game.useBooster(this.selectedBoosterType);
                                this.unSelectBooster();
                                this.teleportFirstEntity.getComponent(UIComponent).ui.filters = [];
                                this.teleportFirstEntity = null;
                                return;
                            }
                            // unselect
                            if (this.teleportFirstEntity == triggeredTileEntity) {
                                this.teleportFirstEntity = null;
                                return;
                            }
                            // select
                            this.teleportFirstEntity = triggeredTileEntity;
                            uiComp.ui.filters = [this.filter];

                            break;
                    }
                });
        }

        // select booster UI button
        this.boosterUIFamily.entities.filter(
            uiEntity => uiEntity.getComponent(UIComponent<PayloadBooster>).payload != null
                && uiEntity.getComponent(UIComponent<PayloadBooster>).triggered
        )
            .forEach(boosterEntity =>
            {
                const uiComp = boosterEntity.getComponent(UIComponent<PayloadBooster>);
                uiComp.cleanTriggered();

                if (this.selectedBoosterUI) {
                    this.selectedBoosterUI.filters = [];
                }
                if (this.selectedBoosterUI == uiComp.ui) {
                    this.selectedBoosterUI = null;
                    return;
                }
                if (game.getBoosterCount(uiComp.payload.type) > 0) {
                    this.selectedBoosterUI = uiComp.ui;
                    this.selectedBoosterType = uiComp.payload.type;
                    this.selectedBoosterUI.filters = [this.filter];
                }
            });
    }

    protected unSelectBooster(): void
    {
        this.selectedBoosterUI.filters = [];
        this.selectedBoosterUI = null;
    }
}