import {Component} from "@nova-engine/ecs";
import {Container} from "pixi.js";
import {BaseCounterUI} from "../ui/BaseCounterUI";

export class UIComponent implements Component {
    public counter: BaseCounterUI;
    private _ui: Container;
    private _triggered: boolean = false;

    public cleanTriggered(): void
    {
        this._triggered = false;
    }

    public get triggered(): boolean
    {
        return this._triggered;
    }

    public get ui(): Container
    {
        return this._ui;
    }

    public set ui(value: Container)
    {
        this._ui = value;
        this._ui.addListener("pointerdown", () =>
        {
            this._triggered = true;
        });
    }
}