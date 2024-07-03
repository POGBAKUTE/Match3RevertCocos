import { _decorator, Component, Node } from 'cc';
import { UICanvas } from './UICanvas';
import { UIManager } from './UIManager';
import { UIGamePlay } from './UIGamePlay';
import { GameController } from '../MainGame/GamesController';
const { ccclass, property } = _decorator;

@ccclass('UIHome')
export class UIHome extends UICanvas {
    playButton() {
        this.close(0);
        GameController.Instance.RestartGame()
    }
}


