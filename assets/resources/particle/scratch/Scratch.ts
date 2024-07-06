import { _decorator, CCFloat, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Scratch')
export class Scratch extends Component {
    @property(UIOpacity)
    opacityNode: UIOpacity

    @property(CCFloat)
    opacityBegin: number

    handleScratch() {
        this.opacityNode.opacity = this.opacityBegin
        tween(this.node)
            .to(0.1, { scale: new Vec3(10, 1, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start()
        tween(this.opacityNode)
            .to(0.1, { opacity: 255 })
            .to(0.1, { opacity: this.opacityBegin})
            .call(() => {
                // this.node.destroy()
            })
            .start()
    }
}


