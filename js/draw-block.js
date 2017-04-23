/**
 * Created by Hien.Tran on 4/23/2017.
 */
import Common from './common';

export default class DrawBlock {
  constructor(canvas3D) {
    this.canvas3D = canvas3D;
    this.initiate();
  }

  initiate() {
    this.lbGeos = {
      "0": Common.createLabelGeo(20, 40), // extra
      "1": Common.createLabelGeo(20, 40), // normal
      "2": Common.createLabelGeo(50, 85)
    };
    this.isShow = true;
    this.group3DBlocks = []
    this.groupLable = [];
    this.lnWidth = 1.5;
  }

  drawBlocks(blocks) {
    //Data demo
    blocks[0].parentId = blocks[0].idx;
    let lv1 = _.cloneDeep(blocks[0]);
    lv1.idx = "lv1";
    lv1.y = 200;
    blocks["lv1"] = lv1;

    let lv2 = _.cloneDeep(blocks[0]);
    lv2.idx = "lv2";
    lv2.y = 400;
    blocks["lv2"] = lv2;

    let lv3 = _.cloneDeep(blocks[0]);
    lv3.idx = "lv3";
    lv3.y = 600;
    blocks["lv3"] = lv3;

    let lv4 = _.cloneDeep(blocks[0]);
    lv4.idx = "lv4";
    lv4.y = 800;
    blocks["lv4"] = lv4;

    let lv5 = _.cloneDeep(blocks[0]);
    lv5.idx = "lv5";
    lv5.y = 1000;
    blocks["lv5"] = lv5;
    //End data demo

    blocks = this.groupByData(blocks);
    Object.keys(blocks).map((key, idx) => {
      this.drawBlock(blocks[key]);
    });
    this.show();
  }

  groupByData(blocks) {
    let blockGroup = _.groupBy(blocks, obj => {
      return obj.parentId;
    });
    Object.keys(blockGroup).map((key, idx) => {
      if (key != 'null') {
        let _blocks = blockGroup[key];
        let max = _.maxBy(_blocks, 'y');
        blocks[max.idx].endFloor = true;
      }
    });
    return blocks;
  }

  drawBlock(block) {
    let geoBay = {
      normal: new THREE.Geometry(),
      extra: new THREE.Geometry(),
      lable: new THREE.Object3D()
    }

    let group = new THREE.Object3D();
    let height = block.height * Common.rate;
    let width = block.width * Common.rate;
    let z = block.z;
    let x = block.x;
    let y = block.y;
    let angle = block.angle;
    let position;
    let isSingleBay = this.isSingleBayColor(block);
    let isSingleRow = this.isSingleBayColor(block);
    let floorPosStart = 0;
    let lnVer, lnHoz, lnClone, meshGroup;
    let blockInfo = {
      width: width,
      height: height,
      xDB: block.xDB,
      zDB: block.zDB,
      x: x,
      y: y,
      z: z
    }
    if (block.idx == 6)
      angle = -Math.PI / 48;

    this.canvas3D.scene.add(Common.createRootAxis({x: 0, y: 0, z: 0}));
    if (y != floorPosStart) {
      let mesh = this.createBlockPlan({
        width: width,
        length: height,
        height: 10,
        x: x,
        y: y,
        z: z,
        angle: 0
      });
      this.canvas3D.scene.add(mesh);
    }

    if (block.endFloor) {
      let xSize = 40, ySize = y + 100, zSize = 40;
      let size = {x: xSize, y: ySize, z: zSize}
      this.drawColumn(size, width, height, {
        x: x,
        y: 0,
        z: z
      });
    }

    //Start create left right line
    lnVer = Common.createLine(this.lnWidth, height);
    lnVer.position.x = width / 2;
    //Line left
    lnClone = lnVer.clone(``);
    lnClone.updateMatrix();
    this.mergeGeo(isSingleBay, geoBay, lnClone);
    //Line right
    lnClone = lnVer.clone();
    lnClone.position.x = lnVer.position.x - width;
    lnClone.updateMatrix();
    this.mergeGeo(isSingleBay, geoBay, lnClone);
    //End

    //Start create top bottom line
    lnHoz = Common.createLine(width + this.lnWidth, this.lnWidth);
    lnHoz.position.z = height / 2;
    //Line top
    lnClone = lnHoz.clone();
    lnClone.updateMatrix();
    this.mergeGeo(isSingleBay, geoBay, lnClone);
    //Line bottom
    lnClone = lnHoz.clone();
    lnClone.position.z = lnClone.position.z - height;
    lnClone.updateMatrix();
    this.mergeGeo(isSingleBay, geoBay, lnClone);
    //End

    //Draw block name
    geoBay.lable.add(this.createText(block.name, "2", true, {x: width / 2 + 20, y: 0, z: height / 2 - 15}));
    geoBay.lable.add(this.createText(block.name, "2", true, {
      x: width / 2 - width - 20,
      y: 0,
      z: height / 2 - height - 30
    }));

    //Draw normal bay
    this.drawBays(blockInfo, block.bays, geoBay, lnVer, isSingleBay, isSingleRow, Common.type.normal);
    //Draw extra bay
    this.drawDashedBays(blockInfo, block.bayExts, geoBay, isSingleBay, isSingleRow, Common.type.extra);

    //Add all component to one object 3D
    meshGroup = new THREE.Mesh(geoBay.normal, Common.materials.white);
    meshGroup.matrixAutoUpdate = true;
    meshGroup.updateMatrix();
    group.add(meshGroup);

    meshGroup = new THREE.Mesh(geoBay.extra, Common.materials.yellow);
    meshGroup.matrixAutoUpdate = true;
    meshGroup.updateMatrix();
    group.add(meshGroup);

    geoBay.lable.objName = "DOU-block-label";
    this.groupLable.push(geoBay.lable);
    group.add(geoBay.lable);

    group.position.set(x, y, z);
    group.rotation.y = angle;
    group.translateX(-width / 2);
    group.translateZ(-height / 2);
    group.objName = "DOU-block-obj3D";
    this.group3DBlocks.push(group);
  }

  isSingleBayColor(block) {
    if (block.bayExtWidth == block.bayWidth && block.maxBay == block.maxExtBay)
      return true;
    return false;
  }

  createBlockPlan(opts) {
    let material = new THREE.MeshPhongMaterial({color: 0x666666, specular: 0x111111, shininess: 1});
    let g = new THREE.BoxGeometry(opts.width + 100, opts.height, opts.length + 100);
    let cube = new THREE.Mesh(g, material);
    cube.geometry.translate(-opts.width / 2, opts.height / 2, -opts.length / 2);
    cube.position.x = opts.x;
    cube.position.y = opts.y - opts.height - 1;
    cube.position.z = opts.z;
    cube.rotation.y = opts.angle;
    return cube;
  }

  drawColumn(size, width, height, pos) {
    let material = new THREE.MeshPhongMaterial({color: 0x666666, specular: 0x111111, shininess: 1})
    let col = Common.drawCube(size.x, size.y, size.z, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      material: material
    });
    this.canvas3D.scene.add(col);

    col = Common.drawCube(size.x, size.y, size.z, {
      x: pos.x,
      y: pos.y,
      z: pos.z - height + size.z,
      material: material
    });
    this.canvas3D.scene.add(col);

    col = Common.drawCube(size.x, size.y, size.z, {
      x: pos.x - width + size.x,
      y: pos.y,
      z: pos.z,
      material: material
    });
    this.canvas3D.scene.add(col);

    col = Common.drawCube(size.x, size.y, size.z, {
      x: pos.x - width + size.x,
      y: pos.y,
      z: pos.z - height + size.z,
      material: material
    });
    this.canvas3D.scene.add(col);

    col = Common.drawCube(size.x, size.y, size.z, {
      x: pos.x - width / 2,
      y: pos.y,
      z: pos.z,
      material: material
    });
    this.canvas3D.scene.add(col);

    col = Common.drawCube(size.x, size.y, size.z, {
      x: pos.x - width / 2,
      y: pos.y,
      z: pos.z - height + size.z,
      material: material
    });
    this.canvas3D.scene.add(col);
  }

  mergeGeo(isSingle, geo, line, bayType) {
    if (isSingle) {
      //Draw normal and extra with normal color
      geo.normal.merge(line.geometry, line.matrix);
      return geo;
    }
    if (!bayType || bayType == Common.type.normal)
      return geo.normal.merge(line.geometry, line.matrix);
    else
      return geo.extra.merge(line.geometry, line.matrix);
  }

  createText(text, blockType, rotate, position) {
    let texture = new THREEx.DynamicTexture(128, 256);
    if (blockType == "2")
      texture.context.font = "bolder 80px Verdana";
    else
      texture.context.font = "bolder 70px Verdana";
    texture.clear().drawTextCooked(text, {
      align: "center",
      fillStyle: (blockType == "2") ? "#F9BF3B" : ((blockType == "1") ? "white" : "#F9BF3B"),
      lineHeight: (!blockType) ? 0.6 : 0.3
    });
    let material = new THREE.MeshLambertMaterial({
      transparent: true,
      map: texture.texture,
      needsUpdate: true
    });
    let mesh = new THREE.Mesh(this.lbGeos[blockType], material);
    if (rotate) {
      mesh.rotation.y = Math.PI;
      mesh.rotation.x = Math.PI * 0.5;
    } else {
      mesh.rotation.y = Math.PI;
      mesh.rotation.x = Math.PI / 2;
    }
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    mesh.updateMatrix();
    return mesh;
  }

  drawBays(blockInfo, bays, geoBay, lnVer, isSingleBay, isSingleRow, bayType) {
    if (!bays) return;
    let line, posXEnd = 0;
    let _this = this;

    let baysClone = _.cloneDeep(bays);
    baysClone["end-line"] = {x: 0}
    Object.keys(baysClone).map(function (key, idx) {
      let value = baysClone[key];
      let posX = -value.x * Common.rate + blockInfo.xDB * Common.rate + blockInfo.width / 2;
      posXEnd = posX - value.width * Common.rate;
      line = lnVer.clone();
      line.position.x = posX;
      line.updateMatrix();
      _this.mergeGeo(isSingleBay, geoBay, line, bayType);

      if (key != "end-line") {
        if (value.tp == Common.bayType.slot) {
          _this.drawCells(blockInfo, posX, value.cells, geoBay, isSingleRow, bayType);
        }
        //create bay name
        if (bayType == Common.type.normal)
          geoBay.lable.add(_this.createText(value.bayNm, "1", true, {x: posX - 12, y: 0, z: blockInfo.height / 2}));
        else
          geoBay.lable.add(_this.createText(value.bayNm, "0", true, {
            x: posX - 12,
            y: 0,
            z: -blockInfo.height / 2 - 15
          }));
        baysClone["end-line"].x = value.x + value.width;
      }
    });
  }

  drawDashedBays(blockInfo, bays, geoBay, isSingleBay, isSingleRow, bayType) {
    if (!bays) return;
    let line, lnClone;
    let lnHeight = 20, space = 4;
    let _this = this;

    line = Common.createLine(this.lnWidth, lnHeight);
    let baysClone = _.cloneDeep(bays);
    baysClone["end-line"] = {x: 0}
    Object.keys(baysClone).map(function (key, idx) {
      let value = baysClone[key];
      let posX = -value.x * Common.rate + blockInfo.xDB * Common.rate + blockInfo.width / 2;
      let posZ = blockInfo.height / 2 - lnHeight / 2;
      line.position.x = posX;

      let nHeight = 0;
      while (nHeight + lnHeight < blockInfo.height) {
        lnClone = line.clone();
        lnClone.position.z = posZ - nHeight;
        lnClone.updateMatrix();
        _this.mergeGeo(isSingleBay, geoBay, lnClone, bayType);
        nHeight += lnHeight + space;
      }

      lnClone = Common.createLine(_this.lnWidth, blockInfo.height - nHeight);
      lnClone.position.x = posX;
      lnClone.position.z = posZ - nHeight + space;
      lnClone.updateMatrix();
      _this.mergeGeo(isSingleBay, geoBay, lnClone, bayType);

      if (key != "end-line") {
        if (value.tp == Common.bayType.slot) {
          _this.drawCells(blockInfo, posX, value.cells, geoBay, isSingleRow, bayType);
        }
        //create bay name
        if (bayType == Common.type.normal)
          geoBay.lable.add(_this.createText(value.bayNm, "1", true, {x: posX - 12, y: 0, z: blockInfo.height / 2}));
        else
          geoBay.lable.add(_this.createText(value.bayNm, "0", true, {
            x: posX - 12,
            y: 0,
            z: -blockInfo.height / 2 - 15
          }));

        baysClone["end-line"].x = value.x + value.width;
      }
    });
  }

  drawCells(blockInfo, posX, cells, geoBay, isSingleRow, bayType){
    for (var i = 0; i < cells.length; i++) {
      let line = Common.createLine(cells[i].width, this.lnWidth);
      line.position.x = posX - cells[i].width / 2;
      line.position.z = blockInfo.height/ 2 - cells[i].length * i;
      line.updateMatrix();
      this.mergeGeo(isSingleRow, geoBay, line, bayType);
    }
  }

  show() {
    for (let i = 0; i < this.group3DBlocks.length; i++)
      this.canvas3D.scene.add(this.group3DBlocks[i]);
  }
}