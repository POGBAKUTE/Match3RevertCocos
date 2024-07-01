import { _decorator, Component, SpriteFrame, Prefab, Sprite, instantiate, UITransform } from 'cc';
const { ccclass, property } = _decorator;

import { typeColorCircle } from "./CircleEnums";
import { tipeCircle } from "./CircleEnums";

@ccclass('Circle')
export class Circle extends Component {
      @property(SpriteFrame)
      sprite: SpriteFrame[] = [];
      @property(Prefab)
      circlesTipe: Prefab[] = [];
      @property
      CircleTypeColor: typeColorCircle;
      CircleType: tipeCircle = 0;
      randomNumber: number;
      inMove: boolean = false;
      onLoad() {
            this.setRandomColor();
      }
      setRandomColor() {
            var sp = this.node.getComponent(Sprite);
            this.randomNumber = Math.floor(Math.random() * Math.floor(this.sprite.length));
            sp.spriteFrame = this.sprite[this.randomNumber];
            this.setColorTipe(this.randomNumber);
      }
      setTipe(tipe) {
            this.CircleType = tipe;
            if (tipe > 0) {
                  if (tipe == 4) {
                        this.setTipeTMP(1);
                        this.setTipeTMP(2);
                  } else {
                        this.setTipeTMP(tipe - 1);
                  }
            }
      }
      private setTipeTMP(tipe) {
            var newNode = instantiate(this.circlesTipe[tipe]);
            newNode.setParent(this.node);
            newNode.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).contentSize);
            newNode.setPosition(0, 0, 0);
      }
      setColorTipe(tipe) {
            var sp = this.node.getComponent(Sprite);
            this.CircleTypeColor = tipe;
            sp.spriteFrame = this.sprite[tipe];
      }
}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// import { typeColorCircle } from "./CircleEnums";
// import { tipeCircle } from "./CircleEnums";
//
// const { ccclass, property } = cc._decorator;
//
// @ccclass
// export class Circle extends cc.Component {
//
//   @property(cc.SpriteFrame)
//   sprite: cc.SpriteFrame[] = [];
//
//   @property(cc.Prefab)
//   circlesTipe: cc.Prefab[] = [];
//
//   @property
//   CircleTypeColor: typeColorCircle;
//
//   CircleType: tipeCircle = 0;
//
//   randomNumber: number;
//
//   inMove: boolean = false;
//
//   onLoad() {
//     this.setRandomColor();
//   }
//
//   setRandomColor(){
//     var sp = this.node.getComponent(cc.Sprite);
//     this.randomNumber = Math.floor(Math.random() * Math.floor(this.sprite.length));
//     sp.spriteFrame = this.sprite[this.randomNumber];
//     this.setColorTipe(this.randomNumber);
//   }
//
//   setTipe(tipe) {
//     this.CircleType = tipe;
//     if (tipe > 0) {
//       if (tipe == 4) {
//         this.setTipeTMP(1);
//         this.setTipeTMP(2);
//       } else {
//         this.setTipeTMP(tipe - 1);
//       }
//     }
//   }
//
//   private setTipeTMP(tipe) {
//     var newNode = cc.instantiate(this.circlesTipe[tipe]);
//     newNode.setParent(this.node);
//     newNode.setContentSize(this.node.getContentSize());
//     newNode.setPosition(0, 0);
//   }
//
//   setColorTipe(tipe) {
//     var sp = this.node.getComponent(cc.Sprite);
//     this.CircleTypeColor = tipe;
//     sp.spriteFrame = this.sprite[tipe];
//   }
//
// }
