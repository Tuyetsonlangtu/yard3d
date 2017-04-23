/**
 * Created by Hien.Tran on 4/23/2017.
 */

class Common {
  constructor() {
    this.rootObj3DFolder = "./object-3d";
    this.bayType = {
      lane: "0100L",
      slot: "0100S"
    }
    this.materials = {
      yellow: new THREE.MeshPhongMaterial({
        color: 0xF9BF3B
      }),
      white: new THREE.MeshPhongMaterial({
        color: 0xffffff
      })
    }
    this.type = {
      normal: "nm",
      extra: "ext"
    }
    this.rate = 10;
  }

  createLabelGeo(w, h) {
    return new THREE.PlaneGeometry(w, h);
  }

  loadTexture(objPath, extPath) {
    let sysPath = this.rootObj3DFolder + "/" + objPath;
    return new Promise(function (resolve, reject) {
      let path = extPath ? extPath : sysPath;
      let loader = new THREE.ImageLoader();
      loader.load(path, function (img) {
        resolve(img);
      });
    });
  }

  createRootAxis(pos) {
    let material = new THREE.MeshLambertMaterial({color: 0xff0000});
    let group = new THREE.Object3D();
    let g = new THREE.BoxGeometry(1, 500, 1);
    let cube = new THREE.Mesh(g, material);
    group.add(cube);

    g = new THREE.BoxGeometry(200, 1, 1);
    cube = new THREE.Mesh(g, material);
    group.add(cube);

    g = new THREE.BoxGeometry(1, 1, 200);
    cube = new THREE.Mesh(g, material);
    group.add(cube);

    group.position.x = pos.x;
    group.position.y = pos.y;
    group.position.z = pos.z;
    group.updateMatrix();
    return group;
  }

  drawCube(xSize, ySize, zSize, opts, translate, rad) {
    let g = new THREE.BoxGeometry(xSize, ySize, zSize);
    let cube = new THREE.Mesh(g, opts.material);
    if (translate)
      cube.geometry.translate(-xSize / 2, ySize / 2, -zSize / 2);
    if (rad)
      cube.rotation.y = rad;
    cube.position.set(opts.x, opts.y, opts.z);
    return cube;
  }

  createLine(lnWidth, lnHeight) {
    let geometry = new THREE.PlaneGeometry(lnWidth, lnHeight);
    let line = new THREE.Mesh(geometry);
    line.rotation.x = -Math.PI / 2;
    return line;
  }
}

let common = new Common();
export default common;