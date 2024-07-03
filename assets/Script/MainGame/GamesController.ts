import { _decorator, Component, game, Label, Node, EventTarget, resources,JsonAsset } from 'cc';
const { ccclass, property } = _decorator;

import { Circle } from "./Circle";
import { GameField } from "./GameField";
import { UIManager } from '../UI/UIManager';
import { UIFail } from '../UI/UIFail';
import { UIVictory } from '../UI/UIVictory';
import { UIGamePlay } from '../UI/UIGamePlay';
export const eventTarget = new EventTarget();

export let data_level

@ccclass('GamesController')
export class GameController extends Component {
    public static Instance: GameController;

    @property
    countTypeAndMove: number = 12;
    private allpoints: number = 0;
    @property(Label)
    taskType: Label | null = null;
    private taskpoints: number = 0;
    @property(Label)
    currentMove: Label | null = null;
    private movepoints: number = 0;
    @property
    testGame: boolean = false;
    @property(Label)
    textPoint: Label | null = null;
    @property(GameField)
    gameField: GameField = null;
    @property(Node)
    typeTask: Node | null = null;
    @property(Node)
    testGameText: Node | null = null;
    @property(Node)
    blockField: Node | null = null;

    private isEnd : boolean = false

    onLoad() {
        if (GameController.Instance == null) {
            GameController.Instance = this;
        }
        else {
            this.destroy();
        }
        if (this.testGame) {
            this.testGameText.active = true;
        }

        this.taskpoints = Number(this.taskType.string);
        this.movepoints = Number(this.currentMove.string);

        this.loadJsonFile()

        eventTarget.on('moveCircleEnd', this.gameField.createOneLineCircles, this.gameField);
        // eventTarget.on('moveCircleEnd', (event) => {
        //     event.stopPropagation();
        // });

        eventTarget.on('clickOnCellForDestroyCircle', this.gameField.clickDestroyCircleInCell, this.gameField);
        // eventTarget.on('clickOnCellForDestroyCircle', (event) => {
        //     event.stopPropagation();
        // });

        eventTarget.on('destroyCircles', this.gameField.allCirclesMove, this.gameField);
        // eventTarget.on('destroyCircles', (event) => {
        //     event.stopPropagation();
        // });

        eventTarget.on("needCheckField", this.gameField.checkLine, this.gameField);
        // eventTarget.on('needCheckField', (event) => {
        //     event.stopPropagation();
        // });

        eventTarget.on('setPoint', this.setPoint, this);
        // eventTarget.on('setPoint', (event) => {
        //     event.stopPropagation();
        // });


        this.node.on('getDestroyCirclesType', this.gameField.getTypeDestroyCircle, this.gameField);
        // this.node.on('getDestroyCirclesType', (event) => {
        //     event.stopPropagation();
        // });

        eventTarget.on('setDestroyCirclesType_', this.setTypeDestroyCircle, this);
        // eventTarget.on('setDestroyCirclesType_', (event) => {
        //     event.stopPropagation();
        // });

        eventTarget.on('countProgressStep', this.countProgressStep, this);
        // eventTarget.on('countProgressStep',  (event) => {
        //     event.stopPropagation();
        // });
        this.node.on('countProgressDestrCirles', this.countProgressStep, this);
        // this.node.on('countProgressDestrCirles', (event) => {
        //     event.stopPropagation();
        // });


    }

    loadJsonFile() {
        resources.load('data/levels_configurations', JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.error(err);
                return;
            }
            const jsonData = jsonAsset.json;
            data_level = jsonData
            // Thực hiện các thao tác với jsonData tại đây
        });
    }

    private setPoint() {
        this.allpoints += 1;
        this.textPoint.string = this.allpoints.toString();

    }
    /*
        setBuster() {
            this.gameField.
        }
    */
    private countProgressStep() {

        this.movepoints--;
        console.log(this.movepoints)
        this.currentMove.string = String(this.movepoints);
        if (!this.testGame) {
            if (this.movepoints == 0 && !this.isEnd) {
                this.isEnd = true
                UIManager.Instance.openUI(UIFail)
            }
        }

    }
    progressTargetDestoyCircle() {

        var circleTask = this.typeTask.getComponent(Circle);
        var countDestroyersTaskCircles = this.countTypeAndMove - this.gameField.destroyTipeColors[circleTask.CircleTypeColor];
        this.taskType.string = String(countDestroyersTaskCircles);
        if (!this.testGame) {
            if (countDestroyersTaskCircles <= 0 && !this.isEnd) {
                this.isEnd = true
                UIManager.Instance.openUI(UIVictory)
            }
        }
    }
    private CheckGameOverIfColorChallengeIsComplete() {

    }

    private levelCurrent: number = 1

    getLevelCurrent() {
        return this.levelCurrent;
    }

    setLevelCurrent(levelCurrent) {
        this.levelCurrent = levelCurrent
    }

    RestartGame() {
        UIManager.Instance.openUI(UIGamePlay)
        this.isEnd = false
        this.gameField.node.active = false;
        this.gameField.node.active = true;
        this.allpoints = 0;
        this.textPoint.string = this.allpoints.toString();
        let levelString = `level${this.levelCurrent}`;
        this.movepoints = data_level.levels[levelString].moves ?? this.countTypeAndMove
        this.taskType.string = "12"
        this.currentMove.string = this.movepoints.toString()
        var circleTask = this.typeTask.getComponent(Circle);
        circleTask.setRandomColor(data_level.levels[levelString].numColors ?? 6);
    }

    setTypeDestroyCircle() {
        this.progressTargetDestoyCircle();
    }
}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// import { Circle } from "./Circle";
// import { GameField } from "./GameField";
// const { ccclass, property } = cc._decorator;
//
// @ccclass
// export class GameController extends cc.Component {
//
//     @property
//     countTypeAndMove: number = 12;
//
//     private allpoints: number = 0;
//
//     @property(cc.Label)
//     taskType: cc.Label = null;
//
//     private taskpoints: number = 0;
//
//     @property(cc.Label)
//     currentMove: cc.Label = null;
//
//     private movepoints: number = 0;
//
//     @property
//     testGame: boolean = true;
//
//     @property(cc.Label)
//     textPoint: cc.Label = null;
//
//     @property(GameField)
//     gameField: GameField = null;
//
//     @property(cc.Node)
//     gameOver: cc.Node = null;
//
//     @property(cc.Node)
//     gameWon: cc.Node = null;
//
//     @property(cc.Node)
//     typeTask: cc.Node = null;
//
//     @property(cc.Node)
//     testGameText: cc.Node = null;
//
//     @property(cc.Node)
//     blockField: cc.Node = null;
//     onLoad() {
//
//         if(this.testGame) {
//             this.testGameText.active=true;
//         }
//
//         this.taskpoints = Number(this.taskType.string);
//         this.movepoints = Number(this.currentMove.string);
//
//         this.node.on('moveCircleEnd', this.gameField.createOneLineCircles, this.gameField);
//         this.node.on('moveCircleEnd', (event) => {
//             event.stopPropagation();
//         });
//
//         this.node.on('clickOnCellForDestroyCircle', this.gameField.clickDestroyCircleInCell, this.gameField);
//         this.node.on('clickOnCellForDestroyCircle', (event) => {
//             event.stopPropagation();
//         });
//
//         this.node.on('destroyCircles', this.gameField.allCirclesMove, this.gameField);
//         this.node.on('destroyCircles', (event) => {
//             event.stopPropagation();
//         });
//
//         this.node.on('needCheckField', this.gameField.checkLine, this.gameField);
//         this.node.on('needCheckField', (event) => {
//             event.stopPropagation();
//         });
//
//         this.node.on('setPoint', this.setPoint, this);
//         this.node.on('setPoint', (event) => {
//             event.stopPropagation();
//         });
//
//
//         this.node.on('getDestroyCirclesType', this.gameField.getTypeDestroyCircle, this.gameField);
//         this.node.on('getDestroyCirclesType', (event) => {
//             event.stopPropagation();
//         });
//
//         this.node.on('setDestroyCirclesType_', this.setTypeDestroyCircle, this);
//         this.node.on('setDestroyCirclesType_', (event) => {
//             event.stopPropagation();
//         });
//
//         this.node.on('countProgressStep', this.countProgressStep, this);
//         this.node.on('countProgressStep', (event) => {
//             event.stopPropagation();
//         });
//         this.node.on('countProgressDestrCirles', this.countProgressStep, this);
//         this.node.on('countProgressDestrCirles', (event) => {
//             event.stopPropagation();
//         });
//
//
//     }
//
//
//     private setPoint() {
//         this.allpoints += 1;
//         this.textPoint.string = this.allpoints.toString();
//
//     }
// /*
//     setBuster() {
//         this.gameField.
//     }
// */
//
//     private countProgressStep() {
//
//         this.movepoints--;
//         cc.log(this.movepoints)
//         this. currentMove.string = String(this.movepoints);
//         if (!this.testGame) {
//             if (this.movepoints==0) {
//                 this.gameOver.active = true;
//             }
//         }
//
//     }
//
//     progressTargetDestoyCircle(){
//
//         var circleTask = this.typeTask.getComponent(Circle);
//         var countDestroyersTaskCircles = this.countTypeAndMove - this.gameField.destroyTipeColors[circleTask.CircleTypeColor];
//         this.taskType.string = String(countDestroyersTaskCircles);
//         if (!this.testGame) {
//             if (countDestroyersTaskCircles<=0){
//                 this.gameWon.active = true;
//             }
//         }
//     }
//
//     gameOverNodeDeActivate(){
//         this.gameOver.active = false;
//     }
//
//     gameWonNodeDeActivate(){
//         this.gameWon.active = false;
//     }
//
//     private CheckGameOverIfColorChallengeIsComplete(){
//
//     }
//
//     RestartGame() {
//
//         this.gameField.node.active = false;
//         this.gameField.node.active = true;
//         this.allpoints = 1;
//         this.textPoint.string = this.allpoints.toString();
//         this.movepoints = this.countTypeAndMove;
//         this.taskType.string = this.countTypeAndMove.toString();
//         this.currentMove.string = this.countTypeAndMove.toString();
//         var circleTask = this.typeTask.getComponent(Circle);
//         circleTask.setRandomColor();
//
//     }
//
//     setTypeDestroyCircle() {
//         this.progressTargetDestoyCircle();
//     }
//
// }
