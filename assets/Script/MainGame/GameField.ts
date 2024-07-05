import { _decorator, Component, game, instantiate, Prefab, tween, UITransform, Vec3, Node, easing } from 'cc';
const { ccclass, property } = _decorator;

import { Circle } from "./Circle";
import { Cell } from "./Cell";
import { CheckerBoolean } from "./ClassHelpers";
import { tipeCircle } from "./CircleEnums";
import { typeColorCircle } from "./CircleEnums";
import { data_level, eventTarget, GameController } from './GamesController';
import { MaskCircle } from './MaskCircle';
import { GatePopup } from '../Gate/GatePopup';
import { GateParticle } from '../Gate/GateParticle';

@ccclass('GameField')
export class GameField extends Component {
      @property(Prefab)
      private Circle: Prefab | null = null;
      @property(Prefab)
      private Cell: Prefab | null = null;
      @property
      private needRandomVoidCell: boolean = true;
      @property
      private ChangeForCreateAnActiveCell: number = 25;
      @property
      private iter: number = 0.5;
      @property
      private StartCellPosX: number = -150;
      @property
      private StartCellPosY: number = 250;
      @property
      private heightCell: number = 62;
      @property
      private widthCell: number = 62;

      @property(Prefab)
      maskCirclePrefab: Prefab

      private countCircle: number = 0;
      countProgressStep: number = 0;
      private previousCountCircle: number = 0;
      busterClick: boolean = false;
      private Cells: Array<Array<Cell>> = new Array<Array<Cell>>()
      destroyTipeColors: number[];
      private currentI_cell_click: number = 0;
      private currentJ_cell_click: number = 0;
      private timeForCheckFild: number = 0;
      private row: number = 8;
      private col: number = 8;
      private amountColor: number
      private level: any
      onLoad() {
            eventTarget.on("wasClickOnCell", this.workWithClickedCell, this);
            eventTarget.on("wasTwoClickOnCell", this.workWithTwoClickedCell, this);

      }

      onInit() {

            this.destroyCellInit()
            let levelCurrent = GameController.Instance.getLevelCurrent()
            this.level = data_level.levels[`level${levelCurrent}`]
            this.amountColor = this.level.numColors ?? 6
            this.initializeCells()
            this.createCells();
            let startCandiesTemplate = this.level.startCandiesTemplate
            console.log(startCandiesTemplate)
            this.CreateCircles(startCandiesTemplate);
            this.destroyTipeColors = new Array(Object.keys(typeColorCircle).length);
            for (var i = 0; i < this.destroyTipeColors.length; i++) this.destroyTipeColors[i] = 0;
      }

      destroyCellInit() {
            if (this.Cells != null) {

                  for (var cellTmp of this.Cells) {
                        for (var cell of cellTmp) {
                              cell.node.destroy()
                        }
                  }
            }
      }

      private initializeCells() {
            let levelCurrent = GameController.Instance.getLevelCurrent()
            this.Cells = new Array<Array<Cell>>()
            this.row = data_level.levels[`level${levelCurrent}`].rows
            this.col = data_level.levels[`level${levelCurrent}`].cols
            for (let i = 0; i < this.row; i++) {
                  let cellTmp = new Array<Cell>()
                  for (let j = 0; j < this.col; j++) {
                        cellTmp.push(new Cell()); // Khởi tạo từng đối tượng Cell
                  }
                  this.Cells.push(cellTmp)
            }
            this.timeForCheckFild = this.Cells.length * this.iter + 0.1;
      }

      protected onEnable(): void {
            this.onInit()
      }

      onDisable() {
            this.DestroyCircles();
      }
      private prewCell: Cell;
      private currentCell: Cell;
      //todo 
      private tmpPrewCell: Cell;
      workWithClickedCell() {
            this.currentCell = this.getClickCell();

            if (this.currentCell === this.prewCell) this.prewCell = null;
            if (this.currentCell != null) {
                  if (!this.buster()) {
                        this.setSelectPrewCell();
                        if (this.prewCell != null) {
                              this.tmpPrewCell = this.prewCell;
                              //Tim duoc 2 o khac nhau roi thi check xem lien ke khong
                              this.checkNeighboringCell();
                        }
                        this.prewCell = this.currentCell;
                  }
            }
      }
      workWithTwoClickedCell() {
            console.log("clear cells")
            // this.prewCell= null;
            //this.currentCell=null;
      }
      private checkNeighboringCell() {
            if (this.prewCell._circle.getComponent(Circle).CircleTypeColor !== this.currentCell._circle.getComponent(Circle).CircleTypeColor)
                  if (this.prewCell !== this.currentCell
                        && this.prewCell._circle != null
                        && this.currentI_cell_click != null) {
                        if (this.prewCell.irow + 1 == this.currentCell.irow
                              && this.prewCell.jcolumn == this.currentCell.jcolumn ||
                              this.prewCell.irow - 1 == this.currentCell.irow
                              && this.prewCell.jcolumn == this.currentCell.jcolumn ||
                              this.prewCell.irow == this.currentCell.irow
                              && this.prewCell.jcolumn + 1 == this.currentCell.jcolumn ||
                              this.prewCell.irow == this.currentCell.irow
                              && this.prewCell.jcolumn - 1 == this.currentCell.jcolumn) {
                              // this.node.dispatchEvent(new Event.EventCustom('setBlockTouch', true));
                              //Neu lien ke thi khong cho cham man hinh nua va thuc hien doi cho
                              GameController.Instance.setIsTouch(false)
                              this.swapCircles(this.prewCell, this.currentCell, true);
                              //thuc hien doi cho xong thi check ca Map xem nhung o nao can xoa
                              this.needCheckFieldAfterSwapCircle();
                        }
                  }
      }

      private needCheckFieldAfterSwapCircle() {
            this.scheduleOnce(function () {
                  console.log(this.tmpPrewCell.jcolumn + " " + this.tmpPrewCell.irow + " " + this.currentCell.jcolumn + " " + this.currentCell.irow)
                  // needCheckField goi den CheckLine de thuc hien duyet toan bo map de thay doi bien destroyExisted
                  // bien destroyExisted cho biet co xoa duoc o nao khong
                  eventTarget.emit("needCheckField", this.tmpPrewCell.jcolumn, this.tmpPrewCell.irow, this.currentCell.jcolumn, this.currentCell.irow)
                  this.setCellNoClick(this.prewCell);
                  this.setCellNoClick(this.currentCell);
                  this.oneCheckField = true;
            }, this.iter + this.iter + this.iter);
            this.scheduleOnce(function () {
                  if (!this.destroyExisted) {
                        //neu khong xoa duoc thi swap lai 2 o
                        console.log("comeBackCircle")
                        // this.node.dispatchEvent(new Event.EventCustom('setUnBlockTouch', true));
                        // GameController.Instance.setIsTouch(false)
                        this.swapCircles(this.currentCell, this.tmpPrewCell, false);
                        this.setCellNoClick(this.tmpPrewCell);
                        this.setCellNoClick(this.currentCell);
                        this.prewCell = null;
                        this.currentCell = null;
                        this.tmpPrewCell = null;
                  } else {
                        //neu xoa duoc thi cong diem 
                        console.log("countProgressStep")
                        GameController.Instance.setIsTouch(true)
                        // this.node.dispatchEvent(new Event.EventCustom('setUnBlockTouch', true));
                        eventTarget.emit('countProgressStep')
                        this.prewCell = null;
                        this.currentCell = null;
                        this.tmpPrewCell = null;
                  }
            }, this.timeForCheckFild);
      }
      private swapCircles(cell1, cell2, direction) {
            if (cell1 == null && cell2 == null) return;
            console.log("swapCirle")
            this.animateMoveCircle(cell1, cell2, direction);
            this.animateMoveCircle(cell2, cell1, direction);
            var tmpCircle = cell2._circle;
            cell2._circle = cell1._circle;
            cell1._circle = tmpCircle;
            this.setCellNoClick(cell1);
            this.setCellNoClick(cell2);
      }
      private setCellNoClick(cell) {
            cell.countClick = 0;
            cell.wasSelectCircle = false;
            cell.wasClick = false;
            cell.setNormalSize();
      }
      private animateMoveCircle(Cell1, Cell2, direction) {
            if (Cell1 == null || Cell2 == null) return;
            let posEnd = Cell2.node.getPosition()
            tween(Cell1._circle)
                  .parallel(
                        tween().to(this.iter, { scale: new Vec3(1, 1, 1) }),
                        tween().to(this.iter, { position: posEnd })
                  )
                  .call(() => {
                        console.log("finish move");
                        if (!direction) {
                              GameController.Instance.setIsTouch(true)
                        }
                  }).start()
      }
      setBuster() {
            console.log("Buster Set");
            this.busterClick = true;
      }
      private buster() {
            if (this.busterClick)
                  if (this.currentCell != null) {
                        // this.setSelectPrewCell(cell);
                        this.startTypeDestroer(this.currentCell);
                        this.animateDestroyCircle(this.currentCell);
                        this.setCellNoClick(this.currentCell);
                        this.busterClick = false;

                        this.eventDestoyArow();

                        this.currentCell = null;
                        eventTarget.emit('countProgressStep')
                        return true;
                  }
            return false;
      }
      setSelectPrewCell() {
            if (this.prewCell != null)
                  if (this.prewCell !== this.currentCell && this.prewCell.wasSelectCircle) {
                        this.prewCell.selectCircle();
                  }
      }
      setSelectCurrentCell() {
            if (this.currentCell != null)
                  if (this.currentCell.wasSelectCircle) {
                        this.currentCell.selectCircle();
                  }
      }
      private getClickCell() {
            for (var j = 0; j < this.Cells.length; j++)
                  for (var i = 0; i < this.Cells[j].length; i++)
                        if (this.Cells[j][i].wasClick) {
                              this.Cells[j][i].wasClick = false;
                              console.log("cliced")
                              return this.Cells[j][i];
                        }
            return null;
      }
      clickDestroyCircleInCell() {
            this.countCircle--;
            eventTarget.emit('setPoint')
            this.allCirclesMove();
      }
      private oneCheckField: boolean = true;
      createOneLineCircles() {
            for (var i = 0; i < this.Cells[0].length; i++) {
                  this.createCircle(this.Cells[0][i], undefined);
            }
            this.allCirclesMove();
            if (this.oneCheckField) {
                  this.oneCheckField = false;
                  this.needCheckField();
            }
      }
      private needCheckField() {
            this.scheduleOnce(function () {
                  eventTarget.emit('needCheckField')
                  this.oneCheckField = true;
            }, this.timeForCheckFild);
      }
      checkLine(j1 = -1, i1 = -1, j2 = -1, i2 = -1) {
            //Trong luc check thuc hien xoa luon
            console.log(j1 + " " + i1 + " " + j2 + " " + i2)
            this.destroyExisted = false;
            this.InArow(j1, i1, j2, i2);
            console.log("fied fullness");
            // GameController.Instance.setIsTouch(true)
            // this.node.dispatchEvent(new Event.EventCustom('setUnBlockTouch', true));
      }
      private createCells() {
            let pos = this.node.getPosition()
            this.StartCellPosX = this.widthCell * -1 * (this.col / 2 - 0.5)
            this.StartCellPosY = this.heightCell * (this.row / 2 - 0.5)
            var xPos: number = 0;
            var yPos: number = 0;
            var _cell;
            let map = this.level.map
            for (var j = 0; j < this.Cells.length; j++) {
                  for (var i = 0; i < this.Cells[j].length; i++) {
                        _cell = instantiate(this.Cell);
                        _cell.getComponent(UITransform).setContentSize(this.heightCell, this.widthCell);
                        _cell.parent = this.node;
                        _cell.setPosition(this.StartCellPosX + xPos, this.StartCellPosY + yPos, 0);
                        this.Cells[j][i] = _cell.getComponent(Cell);
                        this.Cells[j][i].setNormalColor()
                        if (i % 2 != 0 && j % 2 == 0) { this.Cells[j][i].setGrayColor(); }
                        if (i % 2 == 0 && j % 2 != 0) { this.Cells[j][i].setGrayColor(); }
                        // if (this.needRandomVoidCell) this.createAnyTypeCell(this.Cells[j][i], 1);
                        if (map !== undefined && map[j][i] === 0) {
                              this.createAnyTypeCell(this.Cells[j][i], 1)
                        }
                        this.Cells[j][i].jcolumn = j;
                        this.Cells[j][i].irow = i;
                        xPos = xPos + this.heightCell;
                  }
                  xPos = 0;
                  yPos = yPos - this.widthCell;
            }
            console.log(this.Cells.length)

      }
      private createAnyTypeCell(Cell, type) {
            Cell.typeCell = type;
            Cell.setColorInType();
      }
      private setTypeCellsOnIandJ(i_, j_, iLength, jLegth, type) {
            for (var j = j_; j < jLegth; j++) {
                  for (var i = i_; i < iLength; i++) {
                        this.Cells[j][i].typeCell = type;
                        this.Cells[j][i].setColorInType();
                  }
            }
      }
      private CreateCircles(startCandiesTemplate) {
            for (var j = 0; j < this.Cells.length; j++)
                  for (var i = 0; i < this.Cells[j].length; i++) {
                        if (this.Cells[j][i].typeCell == 0) this.createCircle(this.Cells[j][i], startCandiesTemplate);
                  }
            eventTarget.emit('needCheckField')
      }
      private DestroyCircles() {
            for (var j = 0; j < this.Cells.length; j++)
                  for (var i = 0; i < this.Cells[j].length; i++) {
                        if (this.Cells[j][i].circleIsNotNull()) {
                              this.Cells[j][i]._circle.destroy();
                              this.Cells[j][i]._circle = null;
                        }
                  }
      }
      private createCircle(Cell, startCandiesTemplate) {
            if (!Cell.circleIsNotNull() && Cell.typeCell == 0) {
                  Cell._circle = instantiate(this.Circle);
                  if (startCandiesTemplate === undefined) {

                        Cell._circle.getComponent(Circle).setColor(0, false, this.amountColor)
                  }
                  else {
                        Cell._circle.getComponent(Circle).setColor(startCandiesTemplate[Cell.jcolumn][Cell.irow] - 1, true, this.amountColor)
                  }
                  Cell._circle.setParent(this.node);
                  Cell._circle.setPosition(Cell.node.getPosition());
                  Cell._circle.getComponent(UITransform).setContentSize(this.heightCell - 15, this.widthCell - 15);
                  this.countCircle++;
            }
      }
      private createCircleAdd() {
            let _circle = instantiate(this.Circle);
            _circle.getComponent(Circle).setColor(0, false, this.amountColor)
            _circle.getComponent(UITransform).setContentSize(this.heightCell - 15, this.widthCell - 15);
            this.countCircle++;
            return _circle
      }
      cellExist: boolean = false;
      // allCirclesMove() {

      //       for (var j = 0; j < this.Cells.length; j++)
      //             for (var i = 0; i < this.Cells[j].length; i++) {
      //                   if (this.Cells[j][i].CellIsNotNull())
      //                         if (!this.Cells[j][i].circleIsNotNull() && this.Cells[j][i].typeCell == 0) {
      //                               if (j == 0) {
      //                                     this.scheduleOnce(function () {
      //                                           eventTarget.emit("moveCircleEnd")
      //                                     }, this.iter);
      //                               }
      //                               if (j >= 1) {
      //                                     this.swapCircleInCell(i, j, i, j - 1);
      //                               }
      //                               if (!this.cellExist) {
      //                                     if (j >= 1 && i < this.Cells[j].length - 1) {
      //                                           if (Math.floor(Math.random() * Math.floor(2)) == 1) {
      //                                                 this.swapCircleInCell(i, j, i - 1, j - 1);
      //                                                 if (!this.cellExist) this.swapCircleInCell(i, j, i + 1, j - 1);
      //                                           }
      //                                           else this.swapCircleInCell(i, j, i + 1, j - 1);
      //                                           if (!this.cellExist) this.swapCircleInCell(i, j, i - 1, j - 1);
      //                                     }
      //                                     if (i == 0 && j >= 1) {
      //                                           this.swapCircleInCell(i, j, i + 1, j - 1);
      //                                     }
      //                                     if (i == this.Cells[j].length - 1 && j >= 1) {
      //                                           this.swapCircleInCell(i, j, i - 1, j - 1);
      //                                     }
      //                               }
      //                         }
      //             }

      // }

      allCirclesMove() {
            let mapCellsNull: Map<Cell, number> = new Map<Cell, number>()
            for (var i = 0; i < this.Cells[0].length; i++) {
                  let amountNull = 0;
                  let cellPos: Cell = null
                  for (var j = this.Cells.length - 1; j >= 0; j--) {
                        if (this.Cells[j][i].CellIsNotNull()) {
                              if (!this.Cells[j][i].circleIsNotNull() && this.Cells[j][i].typeCell == 0) {
                                    if (cellPos == null) {
                                          cellPos = this.Cells[j][i];
                                    }
                                    amountNull++;
                              }
                        }
                  }
                  if (cellPos != null) {
                        mapCellsNull.set(cellPos, amountNull)
                  }
            }

            for (var [key, value] of mapCellsNull) {
                  let cellHeightMax = this.findCellByCol(key.irow)
                  let listCirclesAdd: Array<Node> = new Array<Node>()
                  let maskCircleNode = instantiate(this.maskCirclePrefab)
                  maskCircleNode.parent = this.node.parent
                  let posCellHeightMax = cellHeightMax.node.getWorldPosition()
                  maskCircleNode.setWorldPosition(new Vec3(posCellHeightMax.x, posCellHeightMax.y + this.heightCell / 2, posCellHeightMax.z))
                  maskCircleNode.getComponent(MaskCircle).onInit(this.widthCell, this.heightCell * value)
                  this.addListCirclesAdd(listCirclesAdd, key.irow, key.jcolumn)
                  for (var j = 1; j <= value; j++) {
                        let circleAdd = this.createCircleAdd()
                        circleAdd.parent = maskCircleNode
                        let yAdd = this.heightCell * j
                        circleAdd.setWorldPosition(new Vec3(posCellHeightMax.x, posCellHeightMax.y + yAdd, posCellHeightMax.z))
                        listCirclesAdd.push(circleAdd)
                  }
                  for (var j = 0; j < listCirclesAdd.length; j++) {
                        this.Cells[key.jcolumn - j][key.irow]._circle = listCirclesAdd[j]
                  }
                  for (var j = 0; j < listCirclesAdd.length; j++) {
                        if (j === listCirclesAdd.length - 1) {

                              this.moveCircle(listCirclesAdd[j], this.Cells[key.jcolumn - j][key.irow], true, maskCircleNode)
                        }
                        else {
                              this.moveCircle(listCirclesAdd[j], this.Cells[key.jcolumn - j][key.irow], false, maskCircleNode)
                        }
                  }
            }
      }

      addListCirclesAdd(listCirclesAdd, indexCol, indexRow) {
            for (var j = indexRow - 1; j >= 0; j--) {
                  if (this.Cells[j][indexCol].circleIsNotNull()) {
                        listCirclesAdd.push(this.Cells[j][indexCol]._circle)
                  }
            }
      }

      findCellByCol(index: number) {
            for (var j = 0; j < this.Cells.length; j++) {
                  if (this.Cells[j][index].typeCell == 0) {
                        return this.Cells[j][index]
                  }
            }
      }

      private moveCircle(circle, cell, checkEnd, mask, timeScale = 1) {
            GatePopup.popupBubleItem(circle, 1.2, 1)
            var _circle = circle.getComponent(Circle);
            _circle.inMove = true;
            let startPos: Vec3 = circle.getWorldPosition()
            let endPos = cell.node.getWorldPosition()
            tween(circle)
                  .parallel(
                        tween().to(this.iter * 5 * timeScale, { scale: new Vec3(1, 1, 1) }),
                        tween()
                              // .to(this.iter, {}, {
                              //       onUpdate: (target, ratio) => {
                              //             // Tính toán vị trí mới dựa trên tỷ lệ
                              //             let newPos = startPos.lerp(endPos, easing.cubicOut(ratio));
                              //                   // Cập nhật vị trí mới
                              //                   circle.setWorldPosition(newPos);
                              //       },
                              //       easing: easing.cubicOut,
                              // })
                              .to(this.iter * 5 * timeScale, { worldPosition: endPos }, { easing: easing.backInOut })
                  )
                  .call(() => {
                        circle.parent = this.node
                        circle.setPosition(cell.node.getPosition())
                        // cell._circle = circle
                        _circle.inMove = false;
                        if (checkEnd) {
                              this.needCheckField();
                              mask.destroy()
                        }
                  })
                  .start()
      }

      // private swapCircleInCell(i, j, newi, newj) {
      //       if (this.validateCircleMove(i, j, newi, newj)) {
      //             console.log("DA DOI TOA DO + " + "(" + newj + " , " + newi + ")" + " cho toa do " + "(" + j + " , " + i + ")")
      //             this.Cells[j][i]._circle = this.Cells[newj][newi]._circle;
      //             this.Cells[newj][newi]._circle = null;
      //             this.moveCircle(this.Cells[j][i]._circle, this.Cells[j][i].node.getPosition());
      //             this.cellExist = true;
      //             return;
      //       }
      //       this.cellExist = false;
      // }
      // private validateCircleMove(i, j, newi, newj) {
      //       if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].CellIsNotNull(), this.Cells[newj][newi] != null))
      //             if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[newj][newi].typeCell == 0))
      //                   if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i]._circle == null, this.Cells[newj][newi]._circle != null)) return true;
      //       return false;
      // }
      // private moveCircle(circle, toMove) {
      //       var _circle = circle.getComponent(Circle);
      //       _circle.inMove = true;
      //       tween(circle)
      //             .parallel(
      //                   tween().to(this.iter, { scale: new Vec3(1, 1, 1) }),
      //                   tween().to(this.iter, { position: toMove })
      //             )
      //             .call(() => {
      //                   eventTarget.emit("moveCircleEnd")
      //                   _circle.inMove = false;
      //             })
      //             .start()
      // }
      private tmpCountCircle: number = 0;
      //todo 
      private fieldOnFilledWithCircles() {
            var allcirclenowinfield = 0;
            var allcirclenowinfieldandmove = 0;
            for (var j = 0; j < this.Cells[0].length; j++) {
                  for (var i = 0; i < this.Cells[j].length; i++)
                        if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[j][i].circleIsNotNull())) {
                              if (this.Cells[j][i]._circle.getComponent(Circle).inMove) allcirclenowinfieldandmove++;
                        }
            }

            console.log(allcirclenowinfield);
            console.log(allcirclenowinfieldandmove);
            if (allcirclenowinfieldandmove == allcirclenowinfield) return false;
            return false;
      }
      private horizont: boolean = false;
      private vertical: boolean = false;
      private goDestroyThreeInArow: boolean = false;
      // InArow(j1, i1, j2, i2) {

      //       for (var j = 0; j < this.Cells.length; j++) {
      //             for (var i = 0; i < this.Cells[j].length; i++) {
      //                   this.goDestroyThreeInArow = true;
      //                   if (j >= 2) {
      //                         this.vertical = true;
      //                         this.horizont = false;
      //                         this.InArowTmp(i, j, i, j - 1, i, j - 2, j1, i1, j2, i2);
      //                   }
      //                   if (i < this.Cells[j].length - 2) {
      //                         this.horizont = true;
      //                         this.vertical = false;
      //                         this.InArowTmp(i, j, i + 1, j, i + 2, j, j1, i1, j2, i2);
      //                   }
      //             }
      //       }
      // }
      // private InArowTmp(i, j, iOne, jOne, iTwo, jTwo, j1Swap, i1Swap, j2Swap, i2Swap) {

      //       if (this.Cells[j][i] != null && this.Cells[jOne][iOne] != null && this.Cells[jTwo][iTwo] != null) {
      //             var tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[jOne][iOne].typeCell == 0);
      //             var tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].typeCell == 0);
      //             if (!tmpBool2) return;
      //             tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].circleIsNotNull(), this.Cells[jOne][iOne].circleIsNotNull());
      //             tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].circleIsNotNull())
      //             if (!tmpBool2) return;
      //             var tmpBool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[j][i]._circle.getComponent(Circle).CircleTypeColor,
      //                   this.Cells[jOne][iOne]._circle.getComponent(Circle).CircleTypeColor,
      //                   this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor);
      //             if (!tmpBool3) return;
      //             if (this.horizont) {
      //                   if (i < this.Cells[j].length - 4) {
      //                         this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo, iTwo + 1, jTwo, iTwo + 2, 3);
      //                   }
      //                   if (i < this.Cells[j].length - 3 && this.goDestroyThreeInArow) {
      //                         this.createLightning(i, j, iOne, jOne, iTwo, jTwo, iTwo + 1, jTwo, 1, j1Swap, i1Swap, j2Swap, i2Swap);
      //                   }
      //             }
      //             if (this.vertical) {
      //                   if (j >= 4) {
      //                         this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo - 1, iTwo, jTwo - 2, iTwo, 3);
      //                   }
      //                   if (j >= 3 && this.goDestroyThreeInArow) {
      //                         this.createLightning(i, j, iOne, jOne, iTwo, jTwo, iTwo, jTwo - 1, 2, j1Swap, i1Swap, j2Swap, i2Swap);
      //                   }
      //             }
      //             if (this.goDestroyThreeInArow) {
      //                   this.check3Circle(this.Cells[j][i], this.Cells[jOne][iOne], this.Cells[jTwo][iTwo]);
      //                   this.eventDestoyArow();
      //             }
      //       }
      // }
      // private createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, iFour, jFour, tipe) {
      //       if (this.Cells[iThree][jThree] == null || this.Cells[iFour][jFour] == null) return;
      //       var bool1 = CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell == 0, this.Cells[iThree][jThree].circleIsNotNull());
      //       var bool2 = CheckerBoolean.checkTwoBoolean(this.Cells[iFour][jFour].typeCell == 0, this.Cells[iFour][jFour].circleIsNotNull());
      //       if (CheckerBoolean.checkTwoBoolean(bool1, bool2)) {
      //             var bool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
      //                   this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor,
      //                   this.Cells[iFour][jFour]._circle.getComponent(Circle).CircleTypeColor);
      //             if (bool3) {
      //                   console.log("RainbowCreate");
      //                   this.Cells[j][i]._circle.getComponent(Circle).setTipe(tipe);
      //                   console.log(this.Cells[j][i]._circle.getComponent(Circle).CircleType);
      //                   this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
      //                   this.startCheckCircleForDestroy(this.Cells[iFour][jFour]);
      //                   this.goDestroyThreeInArow = false;
      //                   this.eventDestoyArow();
      //             }
      //       }
      // }
      // private createLightning(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, tipe, j1Swap, i1Swap, j2Swap, i2Swap) {
      //       if (this.Cells[jThree][iThree] == null) return;
      //       if (CheckerBoolean.checkTwoBoolean(this.Cells[jThree][iThree].typeCell == 0, this.Cells[jThree][iThree].circleIsNotNull()))
      //             if (CheckerBoolean.EqualsTwoObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
      //                   this.Cells[jThree][iThree]._circle.getComponent(Circle).CircleTypeColor)) {
      //                   console.log(`Truoc ${j} ${i} ${jOne} ${iOne} ${jTwo} ${iTwo} ${jThree} ${iThree}`)
      //                   this.goDestroyThreeInArow = false;
      //                   if (CheckerBoolean.EqualsIJCell(jTwo, iTwo, j1Swap, i1Swap) || CheckerBoolean.EqualsIJCell(jTwo, iTwo, j2Swap, i2Swap)) {
      //                         let tmp = iOne
      //                         iOne = iTwo
      //                         iTwo = tmp

      //                         tmp = jOne
      //                         jOne = jTwo
      //                         jTwo = tmp

      //                         console.log("COOOOOOOOOOOOOOOOO")
      //                   }
      //                   console.log(`Sau ${j} ${i} ${jOne} ${iOne} ${jTwo} ${iTwo} ${jThree} ${iThree}`)
      //                   var circle = this.Cells[jOne][iOne]._circle.getComponent(Circle);
      //                   circle.setTipe(tipe);
      //                   this.check3Circle(this.Cells[j][i], this.Cells[jTwo][iTwo], this.Cells[jThree][iThree]);

      //                   this.eventDestoyArow();
      //             }
      // }

      InArow(j1, i1, j2, i2) {
            //Duyet qua mang
            for (var j = 0; j < this.Cells.length; j++) {
                  for (var i = 0; i < this.Cells[j].length; i++) {
                        this.goDestroyThreeInArow = true;
                        if (j >= 2) {
                              //Neu j >= 2 co nghia la thoa man 3 o j, j-1, j-2 nen goi ham InArowTmp de check 3 o do
                              this.vertical = true;
                              this.horizont = false;
                              this.InArowTmp(i, j, i, j - 1, i, j - 2, j1, i1, j2, i2);
                        }
                        if (i < this.Cells[j].length - 2) {
                              //Neu i < length - 2 co nghia la thoa man 3 o i , i+ 1, i+2 nen goi ham InArowTmp de check 3 o do
                              this.horizont = true;
                              this.vertical = false;
                              this.InArowTmp(i, j, i + 1, j, i + 2, j, j1, i1, j2, i2);
                        }
                  }
            }
      }

      checkHorizontalAndVertical() {
            for (var j = 0; j < this.Cells.length; j++) {

                  for (var i = 0; i < this.Cells[j].length; i++) {
                        
                  }
            }
      }
      private InArowTmp(i, j, iOne, jOne, iTwo, jTwo, j1Swap, i1Swap, j2Swap, i2Swap) {
            //Ham nay check cac dieu kien ve 3 o do co giong nhau khong
            if (this.Cells[j][i] != null && this.Cells[jOne][iOne] != null && this.Cells[jTwo][iTwo] != null) {
                  var tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[jOne][iOne].typeCell == 0);
                  var tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].typeCell == 0);
                  if (!tmpBool2) return;
                  tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].circleIsNotNull(), this.Cells[jOne][iOne].circleIsNotNull());
                  tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].circleIsNotNull())
                  if (!tmpBool2) return;
                  var tmpBool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[j][i]._circle.getComponent(Circle).CircleTypeColor,
                        this.Cells[jOne][iOne]._circle.getComponent(Circle).CircleTypeColor,
                        this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor);
                  if (!tmpBool3) return;
                  //Neu vuot qua cac dieu kien thi toi duoc buoc nay
                  if (this.horizont) {
                        //Check co 5 o cung mau ko
                        if (i < this.Cells[j].length - 4) {
                              //Tao rainbow la 5 o
                              this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo, iTwo + 1, jTwo, iTwo + 2, 3);
                        }
                        //Check co 4 o cung mau khong
                        //Bien goDestroyThreeInArow the hien su uu tien cho cac, truong hop
                        //Neu vao truong hop nao roi thi cac truong hop sau se bo qua
                        if (i < this.Cells[j].length - 3 && this.goDestroyThreeInArow) {
                              //Tao lightning la 4 o
                              this.createLightning(i, j, iOne, jOne, iTwo, jTwo, iTwo + 1, jTwo, 1, j1Swap, i1Swap, j2Swap, i2Swap);
                        }
                  }
                  if (this.vertical) {
                        if (j >= 4) {
                              this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo - 1, iTwo, jTwo - 2, iTwo, 3);
                        }
                        if (j >= 3 && this.goDestroyThreeInArow) {
                              this.createLightning(i, j, iOne, jOne, iTwo, jTwo, iTwo, jTwo - 1, 2, j1Swap, i1Swap, j2Swap, i2Swap);
                        }
                  }
                  if (this.goDestroyThreeInArow) {
                        //Sau do xu ly 3 o
                        this.check3Circle(this.Cells[j][i], this.Cells[jOne][iOne], this.Cells[jTwo][iTwo]);
                        this.eventDestoyArow();
                  }
            }
      }
      private createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, iFour, jFour, tipe) {
            if (this.Cells[iThree][jThree] == null || this.Cells[iFour][jFour] == null) return;
            var bool1 = CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell == 0, this.Cells[iThree][jThree].circleIsNotNull());
            var bool2 = CheckerBoolean.checkTwoBoolean(this.Cells[iFour][jFour].typeCell == 0, this.Cells[iFour][jFour].circleIsNotNull());
            if (CheckerBoolean.checkTwoBoolean(bool1, bool2)) {
                  var bool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
                        this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor,
                        this.Cells[iFour][jFour]._circle.getComponent(Circle).CircleTypeColor);
                  if (bool3) {
                        //Neu thoa man dieu kien ve mau thi se cho o dau tien la rainbow va xoa 4 o
                        console.log("RainbowCreate");
                        this.Cells[j][i]._circle.getComponent(Circle).setTipe(tipe);
                        console.log(this.Cells[j][i]._circle.getComponent(Circle).CircleType);
                        this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
                        this.startCheckCircleForDestroy(this.Cells[iFour][jFour]);
                        this.goDestroyThreeInArow = false;
                        this.eventDestoyArow();
                  }
            }
      }
      private createLightning(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, tipe, j1Swap, i1Swap, j2Swap, i2Swap) {
            if (this.Cells[jThree][iThree] == null) return;
            if (CheckerBoolean.checkTwoBoolean(this.Cells[jThree][iThree].typeCell == 0, this.Cells[jThree][iThree].circleIsNotNull()))
                  if (CheckerBoolean.EqualsTwoObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
                        this.Cells[jThree][iThree]._circle.getComponent(Circle).CircleTypeColor)) {
                        console.log(`Truoc ${j} ${i} ${jOne} ${iOne} ${jTwo} ${iTwo} ${jThree} ${iThree}`)
                        this.goDestroyThreeInArow = false;
                        //todo : Truong hop nay dang lam 
                        if (CheckerBoolean.EqualsIJCell(jTwo, iTwo, j1Swap, i1Swap) || CheckerBoolean.EqualsIJCell(jTwo, iTwo, j2Swap, i2Swap)) {
                              let tmp = iOne
                              iOne = iTwo
                              iTwo = tmp

                              tmp = jOne
                              jOne = jTwo
                              jTwo = tmp

                              console.log("COOOOOOOOOOOOOOOOO")
                        }
                        console.log(`Sau ${j} ${i} ${jOne} ${iOne} ${jTwo} ${iTwo} ${jThree} ${iThree}`)
                        //
                        //Neu thoa man dieu kien thi se cho o dau tien la lightning va xoa 3 o tiep theo
                        var circle = this.Cells[j][i]._circle.getComponent(Circle);
                        circle.setTipe(tipe);
                        this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[jThree][iThree]);

                        this.eventDestoyArow();
                  }
      }


      private destroyRainbowBall(Cell, circle) {
            for (var j = 0; j < this.Cells.length; j++) {
                  for (var i = 0; i < this.Cells[j].length; i++) {
                        if (this.Cells[j][i].circleIsNotNull()) var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
                        else return;
                        if (Cell != this.Cells[j][i] &&
                              circle.CircleTypeColor === currentCircle.CircleTypeColor) {
                              if (circle.CircleType === currentCircle.CircleType)
                                    this.animateDestroyCircle(this.Cells[j][i]);
                              else this.startCheckCircleForDestroy(this.Cells[j][i])
                        }
                  }
            }
      }
      // private destroyLightningVertical(Cell, circle) {
      //       var j = Cell.jcolumn;
      //       for (var i = 0; i < this.Cells[j].length; i++) {
      //             console.log("KAKAKAKAKAK11111")
      //             if (Cell != this.Cells[j][i] || this.Cells[j][i].CellIsNotNull()) return;
      //             console.log("KAKAKAKAKAK")
      //             if (this.Cells[j][i].circleIsNotNull()) var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
      //             else return;
      //             if (circle.CircleType === currentCircle.CircleType) this.animateDestroyCircle(this.Cells[j][i]);
      //             else this.startCheckCircleForDestroy(this.Cells[j][i]);
      //       }
      // }
      // private destroyLightningHorizont(Cell, circle) {
      //       var i = Cell.irow;
      //       var thisCircle = circle.getComponent(Circle);
      //       for (var j = 0; j < this.Cells.length; j++) {
      //             console.log("KAKAKAKAKAK11111")
      //             if (Cell != this.Cells[j][i] || this.Cells[j][i] != null) return;
      //             console.log("KAKAKAKAKAK")
      //             if (this.Cells[j][i].circleIsNotNull()) var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
      //             if (currentCircle == null) return;
      //             if (circle.CircleType === currentCircle.CircleType) this.animateDestroyCircle(this.Cells[j][i]);
      //             else this.startCheckCircleForDestroy(this.Cells[j][i]);
      //       }
      // }

      private destroyLightningVertical(Cell, circle) {
            var i = Cell.irow;
            var thisCircle = circle.getComponent(Circle);
            for (var j = 0; j < this.Cells.length; j++) {
                  if (this.Cells[j][i].circleIsNotNull()) {
                        var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
                        if (currentCircle == null) continue;
                        this.animateDestroyCircle(this.Cells[j][i]);

                  }
            }
      }

      private destroyLightningHorizont(Cell, circle) {
            var j = Cell.jcolumn;
            for (var i = 0; i < this.Cells[j].length; i++) {
                  if (this.Cells[j][i].circleIsNotNull()) {
                        var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
                        if (currentCircle == null) continue;
                        this.animateDestroyCircle(this.Cells[j][i]);

                  }
            }
      }
      private destroylightningVerticalAndlightningHorizont(Cell, circle) {
            this.destroyLightningVertical(Cell, circle);
            this.destroyLightningHorizont(Cell, circle);
      }
      private check3Circle(Cell1, Cell2, Cell3) {
            this.startCheckCircleForDestroy(Cell1);
            this.startCheckCircleForDestroy(Cell2);
            this.startCheckCircleForDestroy(Cell3);
      }
      private startCheckCircleForDestroy(Cell) {
            this.startTypeDestroer(Cell);
            this.animateDestroyCircle(Cell);
      }
      private startTypeDestroer(Cell) {
            if (Cell.circleIsNotNull()) {
                  var circle = Cell._circle.getComponent(Circle);
                  console.log("CIRCLE : " + tipeCircle[circle.CircleType])
                  switch (circle.CircleType) {
                        case tipeCircle.lightningVerticalAndlightningHorizont: {
                              this.destroylightningVerticalAndlightningHorizont(Cell, circle);
                              break;
                        }
                        case tipeCircle.rainbowBall: {
                              this.destroyRainbowBall(Cell, circle);
                              break;
                        }
                        case tipeCircle.lightningVertical: {
                              this.destroyLightningVertical(Cell, circle);
                              break;
                        }
                        case tipeCircle.lightningHorizont: {
                              this.destroyLightningHorizont(Cell, circle);
                              break;
                        }
                        case tipeCircle.normal: {
                              this.animateDestroyCircle(Cell);
                              break;
                        }
                  }
            }
      }
      private destroyEveryCircles() {
            for (var j = 0; j < this.Cells.length; j++) {
                  for (var i = 0; i < this.Cells[j].length; i++) {
                        this.animateDestroyCircle(this.Cells[j][i]);
                  }
            }
            this.scheduleOnce(function () {
                  eventTarget.emit("destroyCircles")
            }, this.iter + 0.1);
            this.scheduleOnce(function () {
                  eventTarget.emit("needCheckField")
            }, (this.iter + 0.2) * 4);

      }
      private destroyExisted: boolean = false;
      private eventDestoyArow() {
            this.scheduleOnce(function () {
                  // this.node.dispatchEvent(new Event.EventCustom('setBlockTouch', true));
                  // GameController.Instance.setIsTouch(false)
                  eventTarget.emit("destroyCircles")
                  this.destroyExisted = true;
            }, this.iter + this.iter);
      }
      animationStart: boolean = true;
      private animateDestroyCircle(Cell) {
            if (Cell == null) return;
            tween(Cell._circle)
                  .parallel(
                        tween().to(this.iter, { scale: new Vec3(0, 0, 0) }),
                        tween().to(this.iter, {})
                  )
                  .call(() => {
                        if (Cell._circle == null) return;
                        this.countCircle--;
                        this.getTypeDestroyCircle(Cell._circle.getComponent(Circle));
                        eventTarget.emit('setPoint');
                        GateParticle.getDestroyCircle(this.node, Cell.node.getPosition(), Cell._circle.getComponent(Circle).getSprite())
                        GateParticle.getBlastCircle(this.node, Cell.node.getPosition())
                        Cell._circle.destroy();
                        Cell._circle = null;

                  }).start()
      }
      getTypeDestroyCircle(circle) {
            this.destroyTipeColors[circle.CircleTypeColor]++;
            console.log(this.destroyTipeColors[circle.CircleTypeColor]);
            eventTarget.emit("setDestroyCirclesType_")
      }
}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// import { Circle } from "./Circle";
// import { Cell } from "./Cell";
// import { CheckerBoolean } from "./ClassHelpers";
// import { tipeCircle } from "./CircleEnums";
// import { typeColorCircle } from "./CircleEnums";
//
// const { ccclass, property } = _decorator;
//
// @ccclass
// export class eventTargetField extends Component {
//
//   @property(Prefab)
//   private Circle: Prefab = null;
//
//   @property(Prefab)
//   private Cell: Prefab = null;
//
//   @property
//   private needRandomVoidCell: boolean = true;
//   @property
//   private ChangeForCreateAnActiveCell: number = 25;
//
//   @property
//   private iter: number = 0.1;
//
//   @property
//   private StartCellPosX: number = -150;
//   @property
//   private StartCellPosY: number = 250;
//
//   @property
//   private heightCell: number = 62;
//   @property
//   private widthCell: number = 62;
//
//   private countCircle: number = 0;
//   countProgressStep: number = 0;
//
//   private previousCountCircle: number = 0;
//
//   busterClick: boolean = false;
//
//   private Cells: Cell[][] = [
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//     [, , , , , , , ,],
//   ];
//
//   destroyTipeColors: number[];
//
//   private currentI_cell_click: number = 0;
//   private currentJ_cell_click: number = 0;
//
//   private timeForCheckFild: number = 0;
//
//   onLoad() {
//     this.node.on('wasClickOnCell', this.workWithClickedCell, this);
//     this.node.on('wasTwoClickOnCell', this.workWithTwoClickedCell, this);
//     this.timeForCheckFild = this.Cells.length * this.iter + 0.1;
//   }
//
//   start() {
//     this.createCells();
//     this.setTypeCellsOnIandJ(4, 0, this.Cells.length, 4, 1);
//     this.CreateCircles();
//   }
//
//   onEnable() {
//     this.createCells();
//     this.setTypeCellsOnIandJ(4, 0, this.Cells.length, 4, 1);
//     this.CreateCircles();
//     this.destroyTipeColors = new Array(Object.keys(typeColorCircle).length);
//     for (var i = 0; i < this.destroyTipeColors.length; i++) this.destroyTipeColors[i] = 0;
//   }
//
//   onDisable() {
//     this.DestroyCircles();
//   }
//
//   private prewCell: Cell;
//   private currentCell: Cell;
//   //todo
//   private tmpPrewCell: Cell;
//   workWithClickedCell() {
//       this.currentCell = this.getClickCell();
//
//       if (this.currentCell===this.prewCell) this.prewCell= null;
//       if (this.currentCell!=null){
//         if (!this.buster()) {
//           this.setSelectPrewCell();
//           if (this.prewCell!=null) {
//             this.tmpPrewCell=this.prewCell ;
//             this.checkNeighboringCell();
//           }
//           this.prewCell = this.currentCell;
//         }
//       }
//   }
//   workWithTwoClickedCell() {
//     console.log("clear cells")
//    // this.prewCell= null;
//     //this.currentCell=null;
//   }
//
//   private checkNeighboringCell() {
//     if (this.prewCell._circle.getComponent(Circle).CircleTypeColor!== this.currentCell._circle.getComponent(Circle).CircleTypeColor)
//     if (this.prewCell!==this.currentCell
//       && this.prewCell._circle!=null
//       &&  this.currentI_cell_click!=null) {
//       if (this.prewCell.irow + 1 == this.currentCell.irow
//           && this.prewCell.jcolumn == this.currentCell.jcolumn ||
//           this.prewCell.irow - 1 == this.currentCell.irow
//           && this.prewCell.jcolumn == this.currentCell.jcolumn  ||
//           this.prewCell.irow == this.currentCell.irow
//           && this.prewCell.jcolumn + 1 == this.currentCell.jcolumn ||
//           this.prewCell.irow == this.currentCell.irow
//           && this.prewCell.jcolumn - 1 == this.currentCell.jcolumn) {
//             this.node.dispatchEvent(new Event.EventCustom('setBlockTouch', true));
//             this.swapCircles(this.prewCell,  this.currentCell);
//             this.needCheckFieldAfterSwapCircle();
//       }
//     }
//   }
//
//   private needCheckFieldAfterSwapCircle() {
//     this.scheduleOnce(function () {
//       eventTarget.emit("needCheckField")
//       this.setCellNoClick( this.prewCell);
//       this.setCellNoClick( this.currentCell);
//       this.oneCheckField= true;
//     }, this.iter+this.iter+this.iter);
//     this.scheduleOnce(function () {
//       if (!this.destroyExisted) {
//         console.log("comeBackCircle")
// //         this.node.dispatchEvent(new Event.EventCustom('setUnBlockTouch', true));
//         this.swapCircles(this.currentCell, this.tmpPrewCell);
//         this.setCellNoClick( this.tmpPrewCell);
//         this.setCellNoClick( this.currentCell);
//         this.prewCell = null;
//         this.currentCell = null;
//         this.tmpPrewCell = null;
//       } else {
//         console.log("countProgressStep")
// //         this.node.dispatchEvent(new Event.EventCustom('setUnBlockTouch', true));
//         game.emit('countProgressStep')
//         this.prewCell = null;
//         this.currentCell = null;
//         this.tmpPrewCell = null;
//       }
//     }, this.timeForCheckFild);
//   }
//
//   private swapCircles(cell1, cell2){
//     console.log("swapCirle")
//     this.animateMoveCircle(cell1, cell2);
//     this.animateMoveCircle(cell2, cell1);
//     var tmpCircle =  cell2._circle;
//     cell2._circle = cell1._circle;
//     cell1._circle = tmpCircle;
//     this.setCellNoClick(cell1);
//     this.setCellNoClick(cell2);
//   }
//
//   private setCellNoClick(cell){
//     cell.countClick=0;
//     cell.wasSelectCircle = false;
//     cell.wasClick = false;
//     cell.setNormalSize();
//   }
//
//   private animateMoveCircle(Cell1, Cell2) {
//     if (Cell1 == null || Cell2==null) return;
//       tween(Cell1._circle)
//         .parallel(
//           tween().to(this.iter, { scale: 1 }),
//           tween().to(this.iter, { position: Cell2.node.position })
//         )
//         .call(() => {
//         console.log("finish move");
//         }).start()
//   }
//
//   setBuster() {
//     console.log("Buster Set");
//     this.busterClick = true;
//   }
//
//   private buster() {
//     if (this.busterClick)
//       if (this.currentCell!=null)  {
//       // this.setSelectPrewCell(cell);
//         this.startTypeDestroer(this.currentCell);
//         this.animateDestroyCircle(this.currentCell);
//         this.setCellNoClick(this.currentCell);
//         this.busterClick=false;
//
//         this.eventDestoyArow();
//
//         this.currentCell=null;
//         game.emit('countProgressStep')
//         return true;
//       }
//       return false;
//   }
//
//   setSelectPrewCell() {
//     if (this.prewCell!=null)
//       if(this.prewCell!==this.currentCell && this.prewCell.wasSelectCircle) {
//        this.prewCell.selectCircle();
//       }
//   }
//
//   setSelectCurrentCell() {
//     if (this.currentCell!=null)
//       if (this.currentCell.wasSelectCircle) {
//         this.currentCell.selectCircle();
//       }
//   }
//
//   private getClickCell() {
//     for (var j = 0; j < this.Cells.length; j++)
//       for (var i = 0; i < this.Cells[j].length; i++)
//         if (this.Cells[j][i].wasClick) {
//           this.Cells[j][i].wasClick=false;
//           console.log("cliced")
//           return this.Cells[j][i];
//         }
//     return null;
//   }
//
//   clickDestroyCircleInCell() {
//     this.countCircle--;
//     this.node.dispatchEvent(new Event.EventCustom('setPoint', true));
//     this.allCirclesMove();
//   }
//
//   private oneCheckField: boolean = true;
//   createOneLineCircles() {
//     for (var i = 0; i < this.Cells[0].length; i++) {
//       this.createCircle(this.Cells[0][i]);
//     }
//     this.allCirclesMove();
//     if (this.oneCheckField){
//       this.oneCheckField=false;
//       this.needCheckField();
//     }
//   }
//
//   private needCheckField() {
//     this.scheduleOnce(function () {
//       eventTarget.emit("needCheckField")
//       this.oneCheckField= true;
//     }, this.timeForCheckFild);
//   }
//
//   checkLine() {
//     this.destroyExisted = false;
//     this.InArow();
//     console.log("fied fullness");
// //     this.node.dispatchEvent(new Event.EventCustom('setUnBlockTouch', true));
//   }
//
//   private createCells() {
//
//     var xPos: number = 0;
//     var yPos: number = 0;
//     var _cell;
//
//     for (var j = 0; j < this.Cells.length; j++) {
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         _cell = instantiate(this.Cell);
//         _cell.setContentSize(this.heightCell, this.widthCell);
//         _cell.setParent(this.node);
//         _cell.setPosition(this.StartCellPosX + xPos, this.StartCellPosY + yPos);
//         this.Cells[j][i] = _cell.getComponent(Cell);
//         if (i % 2 != 0 && j % 2 == 0) { this.Cells[j][i].setGrayColor(); }
//         if (i % 2 == 0 && j % 2 != 0) { this.Cells[j][i].setGrayColor(); }
//         if (this.needRandomVoidCell) this.createAnyTypeCell(this.Cells[j][i], 1);
//         this.Cells[j][i].jcolumn = j;
//         this.Cells[j][i].irow = i;
//         xPos = xPos + this.heightCell;
//       }
//       xPos = 0;
//       yPos = yPos - this.widthCell;
//     }
//
//   }
//
//   private createAnyTypeCell(Cell, type) {
//     if (Math.floor((Math.random() * this.ChangeForCreateAnActiveCell) + 1) == 1) {
//       Cell.typeCell = type;
//       Cell.setColorInType();
//     }
//   }
//
//   private setTypeCellsOnIandJ(i_, j_, iLength, jLegth, type) {
//     for (var j = j_; j < jLegth; j++) {
//       for (var i = i_; i < iLength; i++) {
//         this.Cells[j][i].typeCell = type;
//         this.Cells[j][i].setColorInType();
//       }
//     }
//   }
//
//   private CreateCircles() {
//     for (var j = 0; j < this.Cells.length; j++)
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         if (this.Cells[j][i].typeCell == 0) this.createCircle(this.Cells[j][i]);
//       }
//     eventTarget.emit("needCheckField")
//   }
//
//   private DestroyCircles() {
//     for (var j = 0; j < this.Cells.length; j++)
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         if (this.Cells[j][i].circleIsNotNull()) {
//           this.Cells[j][i]._circle.destroy();
//           this.Cells[j][i]._circle = null;
//         }
//       }
//   }
//
//   private createCircle(Cell) {
//     if (!Cell.circleIsNotNull() && Cell.typeCell == 0) {
//       Cell._circle = instantiate(this.Circle);
//       Cell._circle.setParent(this.node);
//       Cell._circle.setPosition(Cell.node.position);
//       Cell._circle.setContentSize(this.heightCell - 15, this.widthCell - 15);
//       this.countCircle++;
//     }
//   }
//
//   cellExist: boolean = false;
//
//   allCirclesMove() {
//
//     for (var j = 0; j < this.Cells.length; j++)
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         if (this.Cells[j][i].CellIsNotNull())
//           if (!this.Cells[j][i].circleIsNotNull() && this.Cells[j][i].typeCell == 0) {
//             if (j == 0) {
//               this.scheduleOnce(function () {
//                 this.node.dispatchEvent(new Event.EventCustom('moveCircleEnd', true));
//               }, this.iter);
//             }
//             if (j >= 1) {
//               this.swapCircleInCell(i, j, i, j - 1);
//             }
//             if (!this.cellExist) {
//               if (j >= 1 && i < this.Cells[j].length - 1) {
//                 if (Math.floor(Math.random() * Math.floor(2)) == 1) {
//                   this.swapCircleInCell(i, j, i - 1, j - 1);
//                   if (!this.cellExist) this.swapCircleInCell(i, j, i + 1, j - 1);
//                 }
//                 else this.swapCircleInCell(i, j, i + 1, j - 1);
//                 if (!this.cellExist) this.swapCircleInCell(i, j, i - 1, j - 1);
//               }
//               if (i == 0 && j >= 1) {
//                 this.swapCircleInCell(i, j, i + 1, j - 1);
//               }
//               if (i == this.Cells[j].length - 1 && j >= 1) {
//                 this.swapCircleInCell(i, j, i - 1, j - 1);
//               }
//             }
//           }
//       }
//
//   }
//
//   private swapCircleInCell(i, j, newi, newj) {
//     if (this.validateCircleMove(i, j, newi, newj)) {
//       this.Cells[j][i]._circle = this.Cells[newj][newi]._circle;
//       this.Cells[newj][newi]._circle = null;
//       this.moveCircle(this.Cells[j][i]._circle, this.Cells[j][i].node.position);
//       this.cellExist = true;
//       return;
//     }
//     this.cellExist = false;
//   }
//
//   private validateCircleMove(i, j, newi, newj) {
//     if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].CellIsNotNull(), this.Cells[newj][newi] != null))
//       if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[newj][newi].typeCell == 0))
//         if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i]._circle == null, this.Cells[newj][newi]._circle != null)) return true;
//     return false;
//   }
//
//
//   private moveCircle(circle, toMove) {
//     var _circle = circle.getComponent(Circle);
//     _circle.inMove = true;
//     tween(circle)
//       .parallel(
//         tween().to(this.iter, { scale: 1 }),
//         tween().to(this.iter, { position: toMove })
//       )
//       .call(() => {
//         this.node.dispatchEvent(new Event.EventCustom('moveCircleEnd', true));
//         _circle.inMove = false;
//       })
//       .start()
//   }
//
//   private tmpCountCircle: number = 0;
//
//     //todo
//   private fieldOnFilledWithCircles() {
//     var allcirclenowinfield = 0;
//     var allcirclenowinfieldandmove = 0;
//     for (var j = 0; j < this.Cells[0].length; j++) {
//       for (var i = 0; i < this.Cells[j].length; i++)
//         if (CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[j][i].circleIsNotNull())) {
//           if (this.Cells[j][i]._circle.getComponent(Circle).inMove) allcirclenowinfieldandmove++;
//         }
//     }
//
//     console.log(allcirclenowinfield);
//     console.log(allcirclenowinfieldandmove);
//     if (allcirclenowinfieldandmove == allcirclenowinfield) return false;
//     return false;
//   }
//
//   private horizont: boolean = false;
//   private vertical: boolean = false;
//   private goDestroyThreeInArow: boolean = false;
//
//   private InArow() {
//
//     for (var j = 0; j < this.Cells.length; j++) {
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         this.goDestroyThreeInArow = true;
//         if (j >= 2) {
//           this.vertical = false;
//           this.horizont = true;
//           this.InArowTmp(i, j, i, j - 1, i, j - 2);
//         }
//         if (i < this.Cells[j].length - 2) {
//           this.horizont = false;
//           this.vertical = true;
//           this.InArowTmp(i, j, i + 1, j, i + 2, j);
//         }
//       }
//     }
//   }
//
//
//   private InArowTmp(i, j, iOne, jOne, iTwo, jTwo) {
//
//     if (this.Cells[j][i] != null && this.Cells[jOne][iOne] != null && this.Cells[jTwo][iTwo] != null) {
//       var tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].typeCell == 0, this.Cells[jOne][iOne].typeCell == 0);
//       var tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].typeCell == 0);
//       if (!tmpBool2) return;
//       tmpBool1 = CheckerBoolean.checkTwoBoolean(this.Cells[j][i].circleIsNotNull(), this.Cells[jOne][iOne].circleIsNotNull());
//       tmpBool2 = CheckerBoolean.checkTwoBoolean(tmpBool1, this.Cells[jTwo][iTwo].circleIsNotNull())
//       if (!tmpBool2) return;
//       var tmpBool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[j][i]._circle.getComponent(Circle).CircleTypeColor,
//       this.Cells[jOne][iOne]._circle.getComponent(Circle).CircleTypeColor,
//       this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor);
//       if (!tmpBool3) return;
//         if (this.vertical) {
//           if (i < this.Cells[j].length - 4) {
//             this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo, iTwo + 1, jTwo, iTwo + 2, 3);
//           }
//           if (i < this.Cells[j].length - 3 && this.goDestroyThreeInArow) {
//             this.createLightning(i, j, iOne, jOne, iTwo, jTwo, jTwo, iTwo + 1, 2);
//           }
//         }
//         if (this.horizont) {
//           if (j >= 4) {
//             this.createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, jTwo - 1, iTwo, jTwo - 2, iTwo, 3);
//           }
//           if (j >= 3 && this.goDestroyThreeInArow) {
//             this.createLightning(i, j, iOne, jOne, iTwo, jTwo, jTwo - 1, iTwo, 1);
//           }
//         }
//           if (this.goDestroyThreeInArow) {
//             this.check3Circle(this.Cells[j][i], this.Cells[jOne][iOne], this.Cells[jTwo][iTwo]);
//             this.eventDestoyArow();
//             }
//           }
//   }
//
//   private createRainbowBall(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, iFour, jFour, tipe) {
//     if (this.Cells[iThree][jThree] == null || this.Cells[iFour][jFour] == null) return;
//       var bool1 = CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell == 0, this.Cells[iThree][jThree].circleIsNotNull());
//       var bool2 = CheckerBoolean.checkTwoBoolean(this.Cells[iFour][jFour].typeCell == 0, this.Cells[iFour][jFour].circleIsNotNull());
//       if (CheckerBoolean.checkTwoBoolean(bool1, bool2)) {
//         var bool3 = CheckerBoolean.EqualsTrheeObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
//           this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor,
//           this.Cells[iFour][jFour]._circle.getComponent(Circle).CircleTypeColor);
//         if (bool3) {
//           console.log("RainbowCreate");
//           this.Cells[j][i]._circle.getComponent(Circle).setTipe(tipe);
//           console.log(this.Cells[j][i]._circle.getComponent(Circle).CircleType);
//           this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
//           this.startCheckCircleForDestroy(this.Cells[iFour][jFour]);
//           this.goDestroyThreeInArow = false;
//           this.eventDestoyArow();
//         }
//       }
//   }
//
//   private createLightning(i, j, iOne, jOne, iTwo, jTwo, iThree, jThree, tipe) {
//     if (this.Cells[iThree][jThree] == null) return;
//       if (CheckerBoolean.checkTwoBoolean(this.Cells[iThree][jThree].typeCell == 0, this.Cells[iThree][jThree].circleIsNotNull()))
//         if (CheckerBoolean.EqualsTwoObj(this.Cells[jTwo][iTwo]._circle.getComponent(Circle).CircleTypeColor,
//           this.Cells[iThree][jThree]._circle.getComponent(Circle).CircleTypeColor)) {
//           var circle = this.Cells[j][i]._circle.getComponent(Circle);
//           circle.setTipe(tipe);
//           this.check3Circle(this.Cells[jOne][iOne], this.Cells[jTwo][iTwo], this.Cells[iThree][jThree]);
//           this.goDestroyThreeInArow = false;
//           this.eventDestoyArow();
//         }
//   }
//
//   private destroyRainbowBall(Cell, circle) {
//     for (var j = 0; j < this.Cells.length; j++) {
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         if (this.Cells[j][i].circleIsNotNull()) var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
//         else return;
//         if (Cell != this.Cells[j][i] &&
//           circle.CircleTypeColor === currentCircle.CircleTypeColor) {
//           if (circle.CircleType === currentCircle.CircleType)
//             this.animateDestroyCircle(this.Cells[j][i]);
//           else this.startCheckCircleForDestroy(this.Cells[j][i])
//         }
//       }
//     }
//   }
//
//   private destroyLightningVertical(Cell, circle) {
//     var j = Cell.jcolumn;
//     for (var i = 0; i < this.Cells[j].length; i++) {
//       if (Cell != this.Cells[j][i] || this.Cells[j][i].CellIsNotNull()) return;
//         if (this.Cells[j][i].circleIsNotNull()) var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
//         else return;
//         if (circle.CircleType === currentCircle.CircleType) this.animateDestroyCircle(this.Cells[j][i]);
//         else this.startCheckCircleForDestroy(this.Cells[j][i]);
//     }
//   }
//
//   private destroyLightningHorizont(Cell, circle) {
//     var i = Cell.irow;
//     var thisCircle = circle.getComponent(Circle);
//     for (var j = 0; j < this.Cells.length; j++) {
//       if (Cell != this.Cells[j][i] || this.Cells[j][i] != null) return;
//       if (this.Cells[j][i].circleIsNotNull()) var currentCircle = this.Cells[j][i]._circle.getComponent(Circle);
//       if (currentCircle == null) return;
//       if (circle.CircleType === currentCircle.CircleType) this.animateDestroyCircle(this.Cells[j][i]);
//       else this.startCheckCircleForDestroy(this.Cells[j][i]);
//     }
//   }
//
//   private destroylightningVerticalAndlightningHorizont(Cell, circle) {
//     this.destroyLightningVertical(Cell, circle);
//     this.destroyLightningHorizont(Cell, circle);
//   }
//
//   private check3Circle(Cell1, Cell2, Cell3) {
//     this.startCheckCircleForDestroy(Cell1);
//     this.startCheckCircleForDestroy(Cell2);
//     this.startCheckCircleForDestroy(Cell3);
//   }
//
//   private startCheckCircleForDestroy(Cell) {
//     this.startTypeDestroer(Cell);
//     this.animateDestroyCircle(Cell);
//   }
//
//   private startTypeDestroer(Cell) {
//     if (Cell.circleIsNotNull()) {
//       var circle = Cell._circle.getComponent(Circle);
//       switch (circle.CircleType) {
//         case tipeCircle.lightningVerticalAndlightningHorizont: {
//           this.destroylightningVerticalAndlightningHorizont(Cell, circle);
//           break;
//         }
//         case tipeCircle.rainbowBall: {
//           this.destroyRainbowBall(Cell, circle);
//           break;
//         }
//         case tipeCircle.lightningVertical: {
//           this.destroyLightningVertical(Cell, circle);
//           break;
//         }
//         case tipeCircle.lightningHorizont: {
//           this.destroyLightningHorizont(Cell, circle);
//           break;
//         }
//         case tipeCircle.normal: {
//           this.animateDestroyCircle(Cell);
//           break;
//         }
//       }
//     }
//   }
//
//   private destroyEveryCircles() {
//     for (var j = 0; j < this.Cells.length; j++) {
//       for (var i = 0; i < this.Cells[j].length; i++) {
//         this.animateDestroyCircle(this.Cells[j][i]);
//       }
//     }
//     this.scheduleOnce(function () {
//       eventTarget.emit("destroyCircles")
//     }, this.iter + 0.1);
//     this.scheduleOnce(function () {
//       eventTarget.emit("needCheckField")
//     }, (this.iter + 0.2) * 4);
//
//   }
//
//   private destroyExisted:boolean=false;
//   private eventDestoyArow() {
//     this.scheduleOnce(function () {
//       this.node.dispatchEvent(new Event.EventCustom('setBlockTouch', true));
//       eventTarget.emit("destroyCircles")
//       this.destroyExisted = true;
//     }, this.iter + this.iter);
//   }
//
//   animationStart: boolean = true;
//
//   private animateDestroyCircle(Cell) {
//     if (Cell == null) return;
//     tween(Cell._circle)
//         .parallel(
//           tween().to(this.iter, { scale: 0 }),
//           tween().to(this.iter, {})
//         )
//         .call(() => {
//           if (Cell._circle == null) return;
//           this.countCircle--;
//           this.getTypeDestroyCircle(Cell._circle.getComponent(Circle));
//           this.node.dispatchEvent(new Event.EventCustom('setPoint', true));
//           Cell._circle.destroy();
//           Cell._circle = null;
//
//     }).start()
//   }
//
//   getTypeDestroyCircle(circle) {
//     this.destroyTipeColors[circle.CircleTypeColor]++;
//     console.log(this.destroyTipeColors[circle.CircleTypeColor]);
//     this.node.dispatchEvent(new Event.EventCustom('setDestroyCirclesType_', true));
//   }
//
// }
