/**
 * Created by hientran on 4/23/17.
 */
import MapObject from './map-object';
import blockData from './json/block.json';
import DrawBlock from './draw-block';

class Yard3D {
  constructor() {
    this.initiate();
  }

  initiate() {
    let _this = this;
    this.arrPromise = [];
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });

    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window["devicePixelRatio"]);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 500000);
    this.camera.position.set(0, 3500, -3000);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.rotationAutoUpdate = true;
    this.scene.add(this.camera);

    let mapObject = new MapObject(this);
    this.mapPlane = mapObject.mapPlane;
    this.is2D = false;
    //Map control event
    this.controls = new MapControls(document.getElementById("container"), this);
    this.controls.minZoom = 0;
    this.controls.maxZoom = 8000;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 8000;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.zoomSpeed = 200;
    this.controls.staticMoving = true;

    let drawBlock = new DrawBlock(this);
    drawBlock.drawBlocks(blockData);
    Promise.all(this.arrPromise).then(values => {
      _this.render();
    }, reason => {
      console.log(reason)
    });
  }

  initData(){
    console.log("Wellcome Yard3D Management");
    this.render();
  }

  loadObjInFrustum(){

  }

  addPromise(promise){
    this.arrPromise.push(promise);
  }
  animate() {
    requestAnimationFrame(this.animate);
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

}

let yard3D = new Yard3D();
export default yard3D;