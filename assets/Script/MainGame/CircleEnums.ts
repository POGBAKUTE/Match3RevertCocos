import { SpriteFrame, _decorator} from 'cc';
const { ccclass, property } = _decorator;

export enum typeColorCircle {
    yellow,
    blue,
    orange,
    green,
    red,
    violet,
    rainbow
}

export enum tipeCircle {
    normal,
    lightningHorizont,
    lightningVertical,
    rainbowBall,
    lightningVerticalAndlightningHorizont
}

@ccclass('CircleTypes')
export class CircleTypes {
    @property(SpriteFrame)
    listTypes : SpriteFrame[] = []
}