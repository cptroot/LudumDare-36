
var world, mass, body, shape, timeStep=1/60,
    camera, scene, renderer, geometry, material, mesh, floor_body, floor_mesh;

var amb_light, point_light, player_light;

var camera_pos = {
    x: 0,
    y: 0,
    z: 5,
};

var camera_rot = {

}

var canvas;

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0,0,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    floor = new CANNON.Box(new CANNON.Vec3(10, 1, 10));
    floor_body = new CANNON.Body({
    });
    floor_body.position.set(0, -5, 0);
    floor_body.addShape(floor);
    world.addBody(floor_body);
    shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
    mass = 1;
    body = new CANNON.Body({
        mass: 1
    });
    body.addShape(shape);
    body.angularVelocity.set(0,10,0);
    body.angularDamping = 0.5;
    world.addBody(body);
}

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
    camera.rotation.order = "YXZ";
    scene.add( camera );
    geometry = new THREE.BoxGeometry( 2, 2, 2 );
    material = new THREE.MeshStandardMaterial( { color: 0xff0000, metalness: 0.8 } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    geometry = new THREE.BoxGeometry( 20, 2, 20 );
    material = new THREE.MeshStandardMaterial( { color: 0x00ff00, roughness: 0.8 } );
    floor_mesh = new THREE.Mesh( geometry, material );
    scene.add( floor_mesh );

    amb_light = new THREE.AmbientLight( 0xffffff, 0.05 );
    scene.add( amb_light );
    point_light = new THREE.PointLight( 0xffffff, 0.75, 0 );
    point_light.position.set( 30, 30, -30 );
    scene.add( point_light );
    player_light = new THREE.PointLight( 0xffffff, 1, 0 );
    player_light.position.set( 0, 0, 0 );
    scene.add( player_light );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}

function initInput() {
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);

    canvas = document.children[0].children[1].children[3];

    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock;

    canvas.onclick = function() {
        canvas.requestPointerLock();
    }

    document.addEventListener('mousemove', mousemove);
}


var keyboard = {};
var old_keyboard = {};

function keydown(e) {
    keyboard[e.key] = true;
}
function keyup(e) {
    keyboard[e.key] = false;
}

var sensitivity = 180;

function mousemove(e) {
    if(document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
        camera.rotation.y -= e.movementX / sensitivity;
        camera.rotation.x -= e.movementY / sensitivity;
    }
}

function animate() {
    requestAnimationFrame( animate );
    updatePhysics();
    render();
}

function updatePhysics() {
    // Step the physics world
    body.applyForce(new CANNON.Vec3(0, -1, 0), new CANNON.Vec3(0, 0, 0));
    body.applyLocalForce(new CANNON.Vec3(0, 1.5, 0), new CANNON.Vec3(0, 0, 1));
    body.applyLocalForce(new CANNON.Vec3(0, -1.5, 0), new CANNON.Vec3(0, 0, -1));

    world.step(timeStep);
    // Copy coordinates from Cannon.js to Three.js
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    floor_mesh.position.copy(floor_body.position);

    if ("d" in keyboard && keyboard.d) {
        camera_pos.x += 0.1 * Math.cos(camera.rotation.y);
        camera_pos.z -= 0.1 * Math.sin(camera.rotation.y);
    }

    if ("a" in keyboard && keyboard.a) {
        camera_pos.x -= 0.1 * Math.cos(camera.rotation.y);
        camera_pos.z += 0.1 * Math.sin(camera.rotation.y);
    }

    if ("w" in keyboard && keyboard.w) {
        camera_pos.z -= 0.1 * Math.cos(camera.rotation.y);
        camera_pos.x -= 0.1 * Math.sin(camera.rotation.y);
    }

    if ("s" in keyboard && keyboard.s) {
        camera_pos.z += 0.1 * Math.cos(camera.rotation.y);
        camera_pos.x += 0.1 * Math.sin(camera.rotation.y);
    }

    camera.position.x = camera_pos.x;
    camera.position.y = camera_pos.y;
    camera.position.z = camera_pos.z;
    player_light.position.x = camera_pos.x;
    player_light.position.y = camera_pos.y;
    player_light.position.z = camera_pos.z;

    var old_keyboard = Object.create(keyboard);
}

function render() {
    renderer.render( scene, camera );
}


initThree();
initCannon();
initInput();
animate();
