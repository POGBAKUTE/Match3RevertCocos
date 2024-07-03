import { _decorator, Component, Label, Node } from 'cc';
import { UICanvas } from './UICanvas';
import { GameController } from '../MainGame/GamesController';
const { ccclass, property } = _decorator;

@ccclass('UIGamePlay')
export class UIGamePlay extends UICanvas {
    @property(Label)
    level: Label

    open() {
        super.open()
        this.updateLevel()
    }

    updateLevel() {
        this.level.string = "Level " + GameController.Instance.getLevelCurrent().toString()
    }
}


