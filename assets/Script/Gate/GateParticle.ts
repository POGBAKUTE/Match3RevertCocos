import {
    assetManager,
    bezier,
    Canvas,
    director,
    instantiate,
    js,
    Label,
    log,
    Node,
    ParticleSystem2D,
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

export namespace GateParticle {
    export function getDestroyCircle(parent, pos, sprite) {
        resources.load('particle/destroyCircle', Prefab, (err, destroyCirclePrefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let destroyCircle = instantiate(destroyCirclePrefab)
            destroyCircle.parent = parent
            destroyCircle.setPosition(pos)
            destroyCircle.getComponent(ParticleSystem2D).spriteFrame = sprite
        });
    }

    export function getBlastCircle(parent, pos) {
        resources.load('particle/blastCircle', Prefab, (err, destroyCirclePrefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let destroyCircle = instantiate(destroyCirclePrefab)
            destroyCircle.parent = parent
            destroyCircle.setPosition(pos)
        });
    }
}

