import { _decorator, Component, Node } from 'cc';
import { UICanvas } from './UICanvas';
import { GameController } from '../MainGame/GamesController';
const { ccclass, property } = _decorator;

@ccclass('UIFail')
export class UIFail extends UICanvas {
    retryGame() {
        this.close(0)
        GameController.Instance.RestartGame();
    }
}


