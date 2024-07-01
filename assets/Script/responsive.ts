import {_decorator, Component, size, UITransform, view,} from "cc";

const {ccclass, property} = _decorator;

@ccclass("responsive")
export class responsive extends Component {

    onLoad() {
        this.updatecanvas();
        // bắt sự kiện thay đổi kích thước màn hình
        view.on("canvas-resize", this.updatecanvas, this);
    }

    updatecanvas() {
        const canvas = view.getDesignResolutionSize();
        let deviceResolution = view.getResolutionPolicy();
        let designRatio = canvas.width / canvas.height;
        let deviceRatio =
            deviceResolution.canvasSize.width /
            deviceResolution.canvasSize.height;
        if (deviceRatio < designRatio) {
            this.node.getComponent(UITransform).contentSize = size(
                canvas.width,
                canvas.width / deviceRatio
            );
        } else {
            this.node.getComponent(UITransform).contentSize = size(
                canvas.height * deviceRatio,
                canvas.height
            );
        }
    }
}
