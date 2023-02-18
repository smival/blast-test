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

export class BoosterSystem extends AppSystem
{
    // todo move to meta
    public readonly bombRadius: number = 2;

    protected tilesFamily: Family;
    protected boosterUIFamily: Family;
    protected levelFamily:Family;

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
    }

    public update(engine: GameEngine, delta: number): void
    {
        let level: LevelComponent;
        this.levelFamily.entities.forEach(entity => {
            level = entity.getComponent(LevelComponent);
        });
        if (!level) return;

        if (this.selectedBoosterUI) {
            this.tilesFamily.entities.filter(
                tileEntity => tileEntity.getComponent(UIComponent).triggered
                    && tileEntity.getComponent(TileComponent).state == ETileState.playable
            )
            .forEach(triggeredTileEntity =>
            {
                triggeredTileEntity.getComponent(UIComponent).cleanTriggered();
                const tileComp = triggeredTileEntity.getComponent(TileComponent);
                switch (this.selectedBoosterType) {
                    case EBoosterType.bomb:
                        const affectedTiles = level.grid.getTilesInRadius(tileComp.gridPosition, this.bombRadius);
                        level.incrementPoints(affectedTiles.length);
                        TileUtils.blastTiles(affectedTiles, level.grid);
                        this.tilesFamily.entities.forEach(tileEntity =>
                        {
                            // remove view
                            if (affectedTiles.indexOf(tileEntity.getComponent(TileComponent)) != -1) {
                                tileEntity.getComponent(ViewComponent).removed = true;
                            }
                        });
                        break;
                    case EBoosterType.teleport:

                        break;
                }
                if (this.selectedBoosterUI) {
                    this.selectedBoosterUI.filters = [];
                    this.selectedBoosterUI = null;
                }
            });
        }

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

                this.selectedBoosterUI = uiComp.ui;
                this.selectedBoosterType = uiComp.payload.type;
                this.selectedBoosterUI.filters = [this.filter];
            });
    }
}