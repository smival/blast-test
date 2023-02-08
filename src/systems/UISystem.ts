import {AppSystem} from "./AppSystem";

export class UISystem extends AppSystem {
    constructor(priority: number)
    {
        super();
        this.priority = priority;
    }
}