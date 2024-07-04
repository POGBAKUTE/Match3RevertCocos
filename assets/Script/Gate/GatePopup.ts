import {
    assetManager,
    bezier,
    Canvas,
    director,
    easing,
    instantiate,
    js,
    Label,
    log,
    Node,
    Prefab,
    ProgressBar,
    resources,
    sys,
    tween,
    UIOpacity,
    UITransform,
    Vec2,
    Vec3,
} from "cc";

export namespace GatePopup {
    export function popupBubleItem(item : Node, scale, time) {
        tween(item)
        .set({scale : new Vec3(scale, scale, scale)})
        .to(time, {scale : new Vec3(1, 1, 1)}, {easing : easing.elasticOut})
        .start()
    }

    
}