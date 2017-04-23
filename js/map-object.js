/**
 * Created by hientran on 4/23/17.
 */

import DataDemo from './data-demo';
import Common from './common';

export default class MapObject {

  constructor(canvas3D) {
    this.canvas3D = canvas3D;
    this.initiate();
  }

  initiate() {
    this.initMapPlan();
    this.initLight();
    this.initSky();
    this.initSea();
    this.initPlan();
  }

  initMapPlan() {
    let mapPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(DataDemo.mapWidth, DataDemo.mapHeight),
      new THREE.MeshBasicMaterial({
        color: 0xababab
      })
    );
    mapPlane.rotation.x = -Math.PI / 2;
    mapPlane.position.y = -4;
    this.mapPlane = mapPlane;
    this.canvas3D.scene.add(mapPlane);
  }

  initLight() {
    let nlight = new THREE.DirectionalLight(0xFDE3A7, 0.5);
    this.canvas3D.scene.add(nlight);

    let light = new THREE.AmbientLight(0x95A5A6);
    this.canvas3D.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.shadow.camera.far = 7000;
    light.shadow.camera.left = -3500;
    light.shadow.camera.right = 3500;
    light.shadow.camera.top = 2000;
    light.shadow.camera.bottom = -1500;

    light.castShadow = true;
    light.shadowDarkness = 1.5;

    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 1024;

    light.position.x = 2500;
    light.position.y = 1500;
    light.position.z = -3000;
    this.light = light;
    this.canvas3D.scene.add(light);
  }

  initSky() {

    let sky = new THREE.Sky();
    this.canvas3D.scene.add(sky.mesh);

    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(20000, 16, 8),
      new THREE.MeshBasicMaterial({color: 0xffffff})
    );
    sunSphere.position.y = -700000;
    sunSphere.visible = false;
    this.canvas3D.scene.add(sunSphere);

    /// GUI
    let effectController = {
      turbidity: 1,
      reileigh: 0.2,
      mieCoefficient: 0.015,
      mieDirectionalG: 0.6,
      luminance: 0.2,
      inclination: 0.4, // elevation / inclination
      azimuth: 0.13, // Facing front,
      sun: false
    };

    let distance = 400000;
    let uniforms = sky.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.reileigh.value = effectController.reileigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

    let theta = Math.PI * ( effectController.inclination - 0.5 );
    let phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

    sunSphere.position.x = distance * Math.cos(phi);
    sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
    sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);

    sunSphere.visible = effectController.sun;
    sky.uniforms.sunPosition.value.copy(sunSphere.position);
  }

  initSea() {
    let promise = Common.loadTexture("sea.jpg");
    if (!promise) return;
    promise.then( img => {
      console.log("img: ", img);
      let texture = new THREE.Texture();
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.image = img;
      texture.needsUpdate = true;
      let water = new THREE.Water(this.canvas3D.renderer, this.canvas3D.camera, this.canvas3D.scene, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: texture,
        alpha: 1.0,
        sunDirection: this.light.position.clone().normalize(),
        waterColor: 0x03C9A9,
        distortionScale: 50.0
      });

      let mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(DataDemo.seaHeight, (DataDemo.fullMapWidth + DataDemo.fullMapHeight) / 2),
        water.material
      );
      mesh.position.x = DataDemo.mapWidth / 2 + DataDemo.seaHeight / 2;
      mesh.position.z = DataDemo.fullMapHeight / 4 - DataDemo.fullMapHeight / 4;
      mesh.position.y = -10;
      mesh.add(water);
      mesh.rotation.x = -Math.PI * 0.5;
      this.canvas3D.scene.add(mesh);
    })
    this.canvas3D.addPromise(promise);
  }

  createPlan(opts, postion, img) {
    let texture = new THREE.Texture();
    texture.repeat.set(opts.texture.height, opts.texture.width);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.image = img;
    texture.needsUpdate = true;
    var L = new THREE.Mesh(
      new THREE.BoxGeometry(opts.map.width, 5, opts.map.height),
      new THREE.MeshLambertMaterial({
        map: texture
      })
    );
    L.position.x = postion.x;
    L.position.y = postion.y;
    L.position.z = postion.z;
    this.canvas3D.scene.add(L);
  }

  initPlan() {
    let _this = this;
    var promise = Common.loadTexture("plane.jpg");
    if (!promise) return;
    promise.then( img => {
      var opts = {
        texture: {width: 4, height: 100},
        map: {width: DataDemo.fullMapWidth - DataDemo.mapWidth / 2, height: DataDemo.mapHeight}
      }
      _this.createPlan(opts, {x: (-opts.map.width - DataDemo.mapWidth) / 2, y: -5, z: 0}, img);

      opts = {
        texture: {width: 50, height: 100},
        map: {
          width: DataDemo.fullMapWidth + DataDemo.mapWidth / 2,
          height: (DataDemo.fullMapHeight - DataDemo.mapHeight) / 2
        }
      }
      _this.createPlan(opts, {
        x: (-opts.map.width + DataDemo.mapWidth) / 2,
        y: -5,
        z: (opts.map.height + DataDemo.mapHeight) / 2
      }, img);

      opts = {
        texture: {width: 50, height: 200},
        map: {width: DataDemo.fullMapWidth * 2, height: (DataDemo.fullMapHeight - DataDemo.mapHeight) / 2}
      }
      _this.createPlan(opts, {x: 0, y: -5, z: -(opts.map.height + DataDemo.mapHeight) / 2}, img);

      opts = {
        texture: {width: 50, height: 100},
        map: {
          width: DataDemo.fullMapWidth - DataDemo.mapWidth / 2 - DataDemo.seaHeight,
          height: DataDemo.fullMapHeight / 2 + DataDemo.mapHeight / 2
        }
      }
      _this.createPlan(opts, {
        x: DataDemo.mapWidth / 2 + DataDemo.seaHeight + opts.map.width / 2,
        y: -5,
        z: -DataDemo.mapHeight / 2 + (DataDemo.fullMapHeight / 2 + DataDemo.mapHeight / 2) / 2
      }, img);
    });
    this.canvas3D.addPromise(promise);
  }
}
