
var world, mass, body, shape, timeStep=1/60,
camera, scene, renderer, geometry, material, mesh, floor_body, floor_mesh;

var camera_pos = {
    x: 0,
    y: 0,
    z: 3,
};

var camera_rot = {

}

var canvas;

var holding = true;
var held_mesh, held_body;
var is_colliding = true;

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
    shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
    mass = 1;
    held_body = new CANNON.Body({
        mass: 1
    });
    held_body.position.set(0, 0, 0);
    held_body.addShape(shape);
}

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
    camera.rotation.order = "YXZ";
    scene.add( camera );
    geometry = new THREE.BoxGeometry( 2, 2, 2 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    geometry = new THREE.BoxGeometry( 20, 2, 20 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
    floor_mesh = new THREE.Mesh( geometry, material );
    scene.add( floor_mesh );

    geometry = new THREE.BoxGeometry(2, 2, 2);
    material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );
    held_mesh = new THREE.Mesh( geometry, material );
    scene.add( held_mesh );

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

    document.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);
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

function mousedown(e) {
}
function mouseup(e) {
    if (!holding) {
        // Cast a ray through the world
        // Find the object
        // Pick up the object
    } else {
        if (!is_colliding) {
            world.addBody(held_body);
            held_body = null;
            holding = false;
        }
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

    if (holding) {
        held_mesh.rotation.copy(camera.rotation);
        held_mesh.rotation.x = 0;
        var offset = new THREE.Vector3(0, 0, -3);
        offset.applyEuler(camera.rotation);
        held_mesh.position.copy(camera.position);
        held_mesh.position.add(offset);
        held_body.position.set(held_mesh.position.x, held_mesh.position.y, held_mesh.position.z);
        held_body.quaternion.setFromEuler(camera.rotation.x, camera.rotation.y, camera.rotation.z, "YXZ");

        // Check if held_mesh is colliding:
        // Add held_body to the world
        world.addBody(held_body);
        is_colliding = false;
        var result = [];
        for (var body_iter in world.bodies) {
            if (body_iter == held_body) { continue; }
            world.narrowphase.getContacts([held_body], [world.bodies[1]], world, result, [], [], []);
            if (result.length) {
                is_colliding = true;
            }
        }

        if (is_colliding) {
            held_mesh.material.color.set(0x4444ff);
        } else {
            held_mesh.material.color.set(0x0000ff);
        }
        world.removeBody(held_body);
    }

    var old_keyboard = Object.create(keyboard);
}

function render() {
    renderer.render( scene, camera );
}


initThree();
initCannon();
initInput();
animate();
