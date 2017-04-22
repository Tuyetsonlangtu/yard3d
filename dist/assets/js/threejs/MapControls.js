/**
 * @author Jacek Jankowski / http://grey-eminence.org/
 */

// It is an adaptation of the three.js OrbitControls class to map environments
MapControls = function (domElement, canvas3D) {

  this.domElement = ( domElement !== undefined ) ? domElement : document;
  this.enabled = true;
  this.enabledRotation = true;
  this.target = new THREE.Vector3();
  this.zoomSpeed = 1.0;
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.rotateSpeed = 0.3;
  // How far you can orbit vertically, upper and lower limits.
  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI / 2; // radians

  // Limits to how far you can zoom in and out ( OrthographicCamera only )
  this.minZoom = 0;
  this.maxZoom = Infinity;

  // internals
  var EPS = 0.000001;
  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();
  var panStart = new THREE.Vector3();
  var panDelta = new THREE.Vector3();
  var phiDelta = 0;
  var thetaDelta = 0;
  var lastPosition = new THREE.Vector3();
  var STATE = {NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2};
  var state = STATE.NONE;
  var vector, projector, raycaster, intersects;
  this.canvas3D = canvas3D;
  var _this = this;

  this.update = function () {
    if (lastPosition.distanceTo(_this.canvas3D.camera.position) > 0) {
      _this.canvas3D.render();
      lastPosition.copy(_this.canvas3D.camera.position);
    }
  };


  function onMouseDown(event) {

    var obj = event.target || event.srcElement;
    if (obj.tagName == 'INPUT') {
      return true;
    }

    if (_this.enabled === false) {
      return;
    }
    event.preventDefault();

    if (event.button === 0) {

      state = STATE.PAN;

      var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
      var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

      vector = new THREE.Vector3(mouseX, mouseY, _this.canvas3D.camera.near);
			/*projector = new THREE.Projector();
			 projector.unprojectVector( vector, _this.canvas3D.camera );*/
      vector.unproject(_this.canvas3D.camera);
      raycaster = new THREE.Raycaster(_this.canvas3D.camera.position, vector.sub(_this.canvas3D.camera.position).normalize());
      intersects = raycaster.intersectObject(_this.canvas3D.mapPlane);
      if (intersects.length > 0) {
        panStart = intersects[0].point;
      }
    } else if (event.button === 2) {
      if (!_this.enabledRotation)
        return;
      state = STATE.ROTATE;
      vector = new THREE.Vector3(0, 0, _this.canvas3D.camera.near);
      if (_this.canvas3D.is2D) {
        projector = new THREE.Projector();
        projector.unprojectVector(vector, _this.canvas3D.camera);
      }
      vector.unproject(_this.canvas3D.camera);
      raycaster = new THREE.Raycaster(_this.canvas3D.camera.position, vector.sub(_this.canvas3D.camera.position).normalize());
      intersects = raycaster.intersectObject(_this.canvas3D.mapPlane);
      if (intersects.length > 0) {
        _this.target = intersects[0].point;
      }
      rotateStart.set(event.clientX, event.clientY);
    }
    _this.domElement.addEventListener('mousemove', onMouseMove, false);
    _this.domElement.addEventListener('mouseup', onMouseUp, false);
  }

  function onMouseMove(event) {

    if (_this.enabled === false) return;

    event.preventDefault();

    var element = _this.domElement === document ? _this.domElement.body : _this.domElement;

    if (state === STATE.PAN) {

      var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
      var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

      vector = new THREE.Vector3(mouseX, mouseY, _this.canvas3D.camera.near);
			/*projector = new THREE.Projector();
			 projector.unprojectVector( vector, _this.canvas3D.camera );*/
      vector.unproject(_this.canvas3D.camera);
      raycaster = new THREE.Raycaster(_this.canvas3D.camera.position, vector.sub(_this.canvas3D.camera.position).normalize());
      intersects = raycaster.intersectObject(_this.canvas3D.mapPlane);

      if (intersects.length > 0) {

        panDelta = intersects[0].point;

        var delta = new THREE.Vector3();
        delta.subVectors(panStart, panDelta);
        _this.canvas3D.camera.position.addVectors(_this.canvas3D.camera.position, delta);

      }

    } else if (state === STATE.ROTATE) {

      if (!_this.enabledRotation)
        return;

      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart);

      thetaDelta -= 2 * Math.PI * rotateDelta.x / element.clientWidth * _this.rotateSpeed;
      phiDelta -= 2 * Math.PI * rotateDelta.y / element.clientHeight * _this.rotateSpeed;

      var position = _this.canvas3D.camera.position;
      var offset = position.clone().sub(_this.target);

      // angle from z-axis around y-axis
      var theta = Math.atan2(offset.x, offset.z);

      // angle from y-axis
      var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

      theta += thetaDelta;
      phi += phiDelta;

      // restrict phi to be between desired limits
      phi = Math.max(_this.minPolarAngle, Math.min(_this.maxPolarAngle, phi));

      // restrict phi to be betwee EPS and PI-EPS
      phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

      var radius = offset.length();

      // restrict radius to be between desired limits
      radius = Math.max(_this.minDistance, Math.min(_this.maxDistance, radius));

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);
      position.copy(_this.target).add(offset);
      _this.canvas3D.camera.lookAt(_this.target);

      thetaDelta = 0;
      phiDelta = 0;

      rotateStart.copy(rotateEnd);

    }

    _this.update();
  }

  function onMouseUp(event) {
    if (_this.enabled === false) return;
    rotateStart.set(event.clientX, event.clientY);

    _this.domElement.removeEventListener('mousemove', onMouseMove, false);
    _this.domElement.removeEventListener('mouseup', onMouseUp, false);

    state = STATE.NONE;

    //console.log(_this.canvas3D.camera);
  }

  function onMouseWheel(event) {

    if (_this.enabled === false) return;

    var factor = 80;
    var mX = ( event.clientX / window.innerWidth ) * 2 - 1;
    var mY = -( event.clientY / window.innerHeight ) * 2 + 1;

    var vector = new THREE.Vector3(mX, mY, 1);
    vector.unproject(_this.canvas3D.camera);
    vector.sub(_this.canvas3D.camera.position);

    var vector_camera_old = _this.canvas3D.camera.position.clone();
    if (event["wheelDeltaY"] < 0) {
      factor = -_this.zoomSpeed;
    }
    else {
      factor = _this.zoomSpeed;
    }
    _this.canvas3D.camera.position.addVectors(_this.canvas3D.camera.position, vector.setLength(factor));
    var vector_camera_new = _this.canvas3D.camera.position.clone();
    if (vector_camera_new.y < _this.minZoom || vector_camera_new.y > _this.maxZoom)
      _this.canvas3D.camera.position.set(vector_camera_old.x, vector_camera_old.y, vector_camera_old.z);
    else
      _this.target.addVectors(_this.target, vector.setLength(factor));

    _this.canvas3D.loadObjInFrustum();
    _this.update();
  }

  this.domElement.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  }, false);
  this.domElement.addEventListener('mousedown', onMouseDown, false);
  this.domElement.addEventListener('mousewheel', onMouseWheel, false);
};
