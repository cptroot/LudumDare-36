
var world, mass, body, shape, timeStep=1/60,
camera, scene, renderer, geometry, material, mesh, floor_body, floor_mesh;
initThree();
initCannon();
animate();

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
    camera.position.z = 5;
    scene.add( camera );
    geometry = new THREE.BoxGeometry( 2, 2, 2 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    geometry = new THREE.BoxGeometry( 20, 2, 20 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
    floor_mesh = new THREE.Mesh( geometry, material );
    scene.add( floor_mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}

function animate() {
    requestAnimationFrame( animate );
    updatePhysics();
    render();
}

function updatePhysics() {
    // Step the physics world
    body.applyForce(new CANNON.Vec3(0, -1, 0), new CANNON.Vec3(0, 0, 0));
    body.applyLocalForce(new CANNON.Vec3(0, 0.75, 0), new CANNON.Vec3(0, 0, 1));
    body.applyLocalForce(new CANNON.Vec3(0, -0.75, 0), new CANNON.Vec3(0, 0, -1));

    world.step(timeStep);
    // Copy coordinates from Cannon.js to Three.js
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    floor_mesh.position.copy(floor_body.position);
}

function render() {
    renderer.render( scene, camera );
}