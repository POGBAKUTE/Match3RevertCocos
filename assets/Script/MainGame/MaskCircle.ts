import { _decorator, Component, Node, Size, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MaskCircle')
export class MaskCircle extends Component {
    @property(UITransform)
    sizeMask: UITransform

    protected start(): void {
        
    }

    onInit(width, height) {
        this.sizeMask.setContentSize(new Size(width, height))
    }
}


