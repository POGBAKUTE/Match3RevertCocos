import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UICanvas')
export class UICanvas extends Component {
    public open() {
        this.node.active = true;
    }

    public setup() {

    }

    public close(time: number) {
        this.scheduleOnce(this.closeDirectionly, time);
    }

    public closeDirectionly() {
        this.node.active = false;
    }
}


