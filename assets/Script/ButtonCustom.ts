import { _decorator, Button as CCButton, CCFloat, Component, Node, tween } from "cc";
import { GateUtils } from "./Gate/GateUtils";
import { AudioUtils } from "./Audio/AudioUtils";

const { ccclass, property } = _decorator;

const DURATION = 0.1;

class Vec3 {}

@ccclass("ButtonCustom")
export class ButtonCustom extends Component {
    @property({ type: CCFloat })
    customScale: Number = 0;

    start() {
        // this.node.on(
        //     Button.EventType.CLICK,
        //     ()=>{
        //         console.log('oke bttn')
        //     }
        // );
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    touchStart() {
        tween(this.node).stop();
        tween(this.node)
            .to(DURATION, {
                scale: GateUtils.scaleVector(this.customScale || 0.85),
            })
            .start();

        AudioUtils.playButtonSound();
    }

    touchEnd() {
        tween(this.node).stop();
        tween(this.node)
            .to(DURATION, { scale: GateUtils.scaleVector(1) })
            .start();

        // prevent double touch
        if (this.node) this.node.getComponent(CCButton).interactable = false;
        setTimeout(() => {
            if (this.node) this.node.getComponent(CCButton).interactable = true;
        }, 500);
    }
}
