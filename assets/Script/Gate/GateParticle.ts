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
import { Scratch } from "../../resources/particle/scratch/Scratch";

export namespace GateParticle {
    export function getDestroyCircle(parent, pos, sprite, target) {
        resources.load('particle/destroyCircle', Prefab, (err, destroyCirclePrefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let destroyCircle = instantiate(destroyCirclePrefab)
            destroyCircle.parent = parent
            destroyCircle.setPosition(pos)
            destroyCircle.getComponent(ParticleSystem2D).spriteFrame = sprite
            if (target) {
                let endPos = target.getPosition()
                tween(destroyCircle)
                    .to(this.iter * 2, { position: endPos }, { easing: easing.elasticIn })
                    .start()
            }
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
            return destroyCircle
        });
    }

    export function getScratch(parent, pos, rotation) {
        resources.load('particle/scratch/scratch', Prefab, (err, scratchPrefab) => {
            if (err) {
                console.error(err);
                return;
            }
            let scratch = instantiate(scratchPrefab)
            scratch.parent = parent
            scratch.setPosition(pos)
            scratch.setRotationFromEuler(new Vec3(0, 0, rotation))
            scratch.getComponent(Scratch).handleScratch()
        });
    }
}

