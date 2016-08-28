function Cube(world,
              length = 1,
              width = 1,
              height = 1,
              mass = 1,
              pos_x = 0,
              pos_y = 0,
              pos_z = 0,
              color 0xff0000) {
    this.length = length;
    this.width = width;
    this.height = height;

    // physics stuff
    var cube = new CANNON.Box(new CANNON.Vec3(length, width, height));
    this.physicsBody = new CANNON.Body({
        mass: mass,
        position: new CANNON.Vec3(pos_x, pos_y, pos_z)
    });
    this.physicsBody.addShape(cube);
    world.addBody(this.physicsBody);

    // display stuff
    var geometry = new THREE.BoxGeometry(length, width, height);
    var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } );
    this.viewBody = new THREE.Mesh( geometry, material );

    this.synchronize = function() {
        this.viewBody.position.copy(this.physicsBody.position);
        mesh.quaternion.copy(body.quaternion);
    }

    this.addToWorld = function() {

    }

    this.removeFromWorld = function() {

    }
}
