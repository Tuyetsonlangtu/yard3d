/**
 * Created by hientran on 4/23/17.
 */

import DataDemo from './data-demo';

export default class MapObject {

  constructor(yard3D) {
    this.yard3D = yard3D;
    this.initiate();
  }

  initiate() {
    this.initMapPlan();
    this.initLight();
    this.initSky();
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
    this.yard3D.scene.add(mapPlane);
  }

  initLight() {
    let nlight = new THREE.DirectionalLight(0xFDE3A7, 0.5);
    this.yard3D.scene.add(nlight);

    let light = new THREE.AmbientLight(0x95A5A6);
    this.yard3D.scene.add(light);

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

    this.yard3D.scene.add(light);
  }

  initSky() {

    let sky = new THREE.Sky();
    this.yard3D.scene.add(sky.mesh);

    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(20000, 16, 8),
      new THREE.MeshBasicMaterial({color: 0xffffff})
    );
    sunSphere.position.y = -700000;
    sunSphere.visible = false;
    this.yard3D.scene.add(sunSphere);

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

}
