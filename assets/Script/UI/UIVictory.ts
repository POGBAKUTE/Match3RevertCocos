import { _decorator, Component, Node } from 'cc';
import { UICanvas } from './UICanvas';
import { GameController } from '../MainGame/GamesController';
const { ccclass, property } = _decorator;

@ccclass('UIVictory')
export class UIVictory extends UICanvas {
    retryGame() {
        this.close(0)
        GameController.Instance.RestartGame();
    }
}


