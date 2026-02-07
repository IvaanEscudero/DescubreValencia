import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

// Fixed cameras
// Painting 1 camera
const fixedCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
fixedCamera.position.set(1.8, 1.2, 0);
fixedCamera.lookAt(2.1, 1.2, 0);
let activeCamera = camera;

// Painting 2 camera
const fixedCamera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
fixedCamera1.position.set(-1.8, 1.2, 0);
fixedCamera1.lookAt(-2.1, 1.2, 0);



// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const container = document.getElementById('container3d');
const width = container.clientWidth;
const height = container.clientHeight;
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

// Sky
const sky = new THREE.Mesh(
    new THREE.SphereGeometry(100, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide })
);
scene.add(sky);

// Floor
const loader = new THREE.TextureLoader();
const texture = loader.load('3d/textures/black-marble.jpg');
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(5, 10);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 10),
    new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.05,
        metalness: 0.8
    })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
floor.receiveShadow = true;

// Walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x404040, side: THREE.DoubleSide });
const wallPositions = [
    { w: 5, h: 2, ry: 0, p: [0, 1, -5] },
    { w: 10, h: 2, ry: Math.PI / 2, p: [-2.5, 1, 0] },
    { w: 10, h: 2, ry: -Math.PI / 2, p: [2.5, 1, 0] },
    { w: 5, h: 2, ry: Math.PI, p: [0, 1, 5] }
];

wallPositions.forEach(({ w, h, ry, p }) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMaterial);
    wall.rotation.y = ry;
    wall.position.set(...p);
    wall.receiveShadow = true;
    scene.add(wall);
});

// Ceiling
const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 10),
    new THREE.MeshStandardMaterial({ color: 0x505050, side: THREE.DoubleSide })
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 2;
scene.add(ceiling);

// General Lighting
scene.add(new THREE.AmbientLight(0x404040, 40));

const lightPositions = [
    [-1.5, 2, -3], [1.5, 2, -3],
    [-1.5, 2, 0], [1.5, 2, 0],
    [-1.5, 2, 3], [1.5, 2, 3]
];

lightPositions.forEach(([x, y, z]) => {
    const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.05, 32),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    );
    fixture.position.set(x, y, z);
    scene.add(fixture);

    const bulb = new THREE.PointLight(0xffffff, 5, 0, 1);
    bulb.position.set(x, y - 0.1, z);
    scene.add(bulb);

    //scene.add(new THREE.PointLightHelper(bulb, 0.1));
});

// RectArea Lights
const rectLights = [
    { pos: [0, 0, -4.97], rot: [Math.PI / 2, 0, 0], size: [5, 0.01] },
    { pos: [0, 0, 4.97], rot: [Math.PI / 2, 0, 0], size: [5, 0.01] },
    { pos: [-2.47, 0, 0], rot: [0, Math.PI / 2, 0], size: [10, 0.01] },
    { pos: [2.47, 0, 0], rot: [0, -Math.PI / 2, 0], size: [10, 0.01] }
];

rectLights.forEach(({ pos, rot, size }) => {
    const light = new THREE.RectAreaLight(0xffffff, 200, ...size);
    light.position.set(...pos);
    light.rotation.set(...rot);
    scene.add(light);
});

scene.add(new THREE.AmbientLight(0xffffff, 0.1));

// Postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
));

// Objects

/// 3d model
const mtlLoader = new MTLLoader();
mtlLoader.setPath('3d/models/');
mtlLoader.load('sculpture.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    const size = 20;
    objLoader.setMaterials(materials);
    objLoader.setPath('3d/models//');
    objLoader.load('sculpture.obj', (object) => {
        object.scale.set(size / 10000, size / 10000, size / 10000);
        object.position.set(0, 0.5, 3.5);
        //model shadow
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(object);
    });
});
// 3d model cylinder
const textureLoader = new THREE.TextureLoader();
const cylinderTexture = textureLoader.load('3d/textures/black-marble.jpg');
cylinderTexture.wrapS = cylinderTexture.wrapT = THREE.RepeatWrapping;
cylinderTexture.repeat.set(2, 2);

const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
const material = new THREE.MeshStandardMaterial({ map: cylinderTexture });
const cylinder = new THREE.Mesh(geometry, material);
cylinder.position.set(0, 0, 3.5);
cylinder.castShadow = true;
scene.add(cylinder);

// Light fixture sculpture
const fixtureEscultura1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
const fixtureEscultura2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
fixtureEscultura1.position.set(0.3, 0, 2.7);
fixtureEscultura2.position.set(-0.3, 0, 2.7);

const sculptureTarget = new THREE.Vector3(0, 1.5, 3.5);

// function to rotate y axis object
lookAtY(fixtureEscultura1, sculptureTarget);
lookAtY(fixtureEscultura2, sculptureTarget);

scene.add(fixtureEscultura1);
scene.add(fixtureEscultura2);



// Light target sculpture
const esculturaLightTarget = new THREE.Object3D();
esculturaLightTarget.position.set(0, 0.3, 3.5); // sculpture position
scene.add(esculturaLightTarget);

// Light sculpture
const esculturaSpotLight = new THREE.SpotLight(0xffffff, 4, 5, Math.PI / 5, 0.2);
const esculturaSpotLight1 = new THREE.SpotLight(0xffffff, 4, 5, Math.PI / 5, 0.2);

esculturaSpotLight.position.set(0.5, 0.5, 2.25);
esculturaSpotLight.target = esculturaLightTarget;
esculturaSpotLight.castShadow = true;


esculturaSpotLight1.position.set(-0.5, 0.5, 2.25);
esculturaSpotLight1.target = esculturaLightTarget;
esculturaSpotLight1.castShadow = true;

scene.add(esculturaSpotLight);
scene.add(esculturaSpotLight.target);
window.esculturaSpotLight = esculturaSpotLight;

scene.add(esculturaSpotLight1);
scene.add(esculturaSpotLight1.target);
window.esculturaSpotLight1 = esculturaSpotLight1;


// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);
document.body.addEventListener('click', () => controls.lock());

// Movement
const move = { forward: false, backward: false, left: false, right: false, jump: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

document.addEventListener('keydown', e => {
    if (e.code === 'KeyW') move.forward = true;
    if (e.code === 'KeyS') move.backward = true;
    if (e.code === 'KeyA') move.left = true;
    if (e.code === 'KeyD') move.right = true;
    if (e.code === 'Space') move.jump = true;
});

document.addEventListener('keyup', e => {
    if (e.code === 'KeyW') move.forward = false;
    if (e.code === 'KeyS') move.backward = false;
    if (e.code === 'KeyA') move.left = false;
    if (e.code === 'KeyD') move.right = false;
    if (e.code === 'Space') move.jump = false;
});

camera.position.set(0, 0.6, -3);
camera.rotation.y = Math.PI;

// Animation
function animate(time) {
    const delta = clock.getDelta();
    const speed = 20;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 5.0 * delta;

    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();

    if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
    if (move.left || move.right) velocity.x -= direction.x * speed * delta;

    if (move.jump && Math.abs(controls.object.position.y - 1) < 0.05) {
        velocity.y = 5;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.object.position.y += velocity.y * delta;

    if (controls.object.position.y < 1) {
        velocity.y = 0;
        controls.object.position.y = 1;
    }

    const pos = controls.object.position;
    pos.x = THREE.MathUtils.clamp(pos.x, -2.4, 2.4);
    pos.z = THREE.MathUtils.clamp(pos.z, -4.9, 4.9);

    // Raycast to look paintings
    const raycaster_description = new THREE.Raycaster();
    raycaster_description.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster_description.intersectObjects([painting1, painting2]);


    document.getElementById('infoBox1').style.display = 'none';
    document.getElementById('infoBox2').style.display = 'none';


    if (intersects.length > 0 && intersects[0].distance < 3) {
        const objetoVisto = intersects[0].object;

        // Looking at the painting and the current camera is the mobile camera
        if (objetoVisto === painting1 && activeCamera === camera) {
            document.getElementById('infoBox1').style.display = 'block';
        } else if (objetoVisto === painting2 && activeCamera === camera) {
            document.getElementById('infoBox2').style.display = 'block';
        }
    }

    TWEEN.update(time);
    renderer.render(scene, activeCamera);
}



// Resize
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    composer.setSize(width, height);
});

// Painting 1
const paintingTexture1 = loader.load('3d/textures/sorolla.jpg');

const paintingMaterial1 = new THREE.MeshStandardMaterial({
    map: paintingTexture1,
    roughness: 1,
    metalness: 1
});

const painting1 = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    paintingMaterial1
);

painting1.position.set(2.49, 1.2, 0);
painting1.rotation.y = -Math.PI / 2;
scene.add(painting1);

//Painting 2
const paintingTexture2 = loader.load('3d/textures/sorolla1.jpg');

const paintingMaterial2 = new THREE.MeshStandardMaterial({
    map: paintingTexture2,
    roughness: 1,
    metalness: 1
});

const painting2 = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    paintingMaterial2
);

painting2.position.set(-2.49, 1.2, 0);
painting2.rotation.y = Math.PI / 2;
scene.add(painting2);


// Pillars in front of the paintings
const infoTexture = loader.load('3d/textures/black-marble.jpg');

const infoMaterial = new THREE.MeshStandardMaterial({
    map: infoTexture,
    roughness: 0.5,
    metalness: 0.2
});

const infoGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 32);
const infoPilar = new THREE.Mesh(infoGeometry, infoMaterial);
const infoPilar1 = new THREE.Mesh(infoGeometry, infoMaterial);
infoPilar.castShadow = true;
infoPilar.receiveShadow = true;
infoPilar1.castShadow = true;
infoPilar1.receiveShadow = true;


infoPilar.position.set(2.1, 0.03, 0);
infoPilar1.position.set(-2.1, 0.03, 0);

scene.add(infoPilar);
scene.add(infoPilar1);

// Buttons pillars and hitboxes
const buttonInfoGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32);
const buttonInfoMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const infoButton = new THREE.Mesh(buttonInfoGeometry, buttonInfoMaterial);

infoButton.position.set(infoPilar.position.x, infoPilar.position.y + 0.61, infoPilar.position.z);
scene.add(infoButton);

const paintingButton1Hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.1, 0.1),
    new THREE.MeshBasicMaterial({ visible: false })
);
paintingButton1Hitbox.position.copy(infoButton.position);
scene.add(paintingButton1Hitbox);


const infoButton1 = new THREE.Mesh(buttonInfoGeometry, buttonInfoMaterial);
infoButton1.position.set(infoPilar1.position.x, infoPilar1.position.y + 0.61, infoPilar1.position.z);
scene.add(infoButton1);
const paintingButton2Hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.1, 0.1),
    new THREE.MeshBasicMaterial({ visible: false })
);


paintingButton2Hitbox.position.copy(infoButton1.position);
scene.add(paintingButton2Hitbox);

// Painting fixture
const painting1Fixture = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
const painting2Fixture = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
);
painting1Fixture.position.set(2.5, 1.91, 0);
painting2Fixture.position.set(-2.5, 1.91, 0);
scene.add(painting1Fixture);
scene.add(painting2Fixture);

// Painting Lights
const painting1Spotlight = new THREE.SpotLight(0xffffff, 4, 5, Math.PI / 5, 0.2);
const painting2Spotlight = new THREE.SpotLight(0xffffff, 4, 5, Math.PI / 5, 0.2);

painting1Spotlight.position.set(2.2, 2.1, 0);
painting1Spotlight.target = painting1;
painting1Spotlight.castShadow = true;

painting2Spotlight.position.set(-2.2, 2.1, 0);
painting2Spotlight.target = painting2;
painting2Spotlight.castShadow = true;

scene.add(painting1Spotlight);
scene.add(painting1Spotlight.target);
window.painting1Spotlight = painting1Spotlight;

scene.add(painting2Spotlight);
scene.add(painting2Spotlight.target);
window.painting2Spotlight = painting2Spotlight;


// General Lights Button and hitbox
const buttonGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.02);
const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const lightToggleButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
lightToggleButton.position.set(0, 0.7, -4.97);
scene.add(lightToggleButton);

const buttonLight = new THREE.PointLight(0xfffff, 1, 1);
buttonLight.position.set(0, 0.7, -4.8);
scene.add(buttonLight);

const buttonHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.2, 0.1),
    new THREE.MeshBasicMaterial({ visible: false })
);
buttonHitbox.position.copy(lightToggleButton.position);
scene.add(buttonHitbox);

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 600; // Increased width
canvas.height = 400;

context.fillStyle = 'lightblue';
context.fillRect(0, 0, canvas.width, canvas.height);

context.font = '20px Arial'; // Adjusted font size
context.fillStyle = 'black';
context.textAlign = 'center';
context.fillText('Pulsa este interruptor para apagar/encender luces', canvas.width / 2, 100);
context.font = '16px Arial'; // Adjusted font size
context.fillText('Cuando las luces estén apagadas, solo las luces de las', canvas.width / 2, 250);
context.fillText('pinturas y la escultura permanecerán encendidas.', canvas.width / 2, 300);

const posterTexture = new THREE.CanvasTexture(canvas);
const posterMaterial = new THREE.MeshBasicMaterial({ map: posterTexture, side: THREE.FrontSide });
const posterGeometry = new THREE.PlaneGeometry(1.4, 1); // Adjusted geometry width
const poster = new THREE.Mesh(posterGeometry, posterMaterial);

scene.add(poster);
poster.position.set(lightToggleButton.position.x, lightToggleButton.position.y + 0.7, lightToggleButton.position.z);


// Light button
// Colors
const onColor = new THREE.Color('#50e6e6');
const offColor = new THREE.Color('#797979');

// Shared material
const pillMaterial = new THREE.MeshStandardMaterial({ color: offColor.clone() });

// Pill and button group
const pillButtonGroup = new THREE.Group();

// Pill
const pillGroup = new THREE.Group();

const center = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.6, 32),
    pillMaterial
);
center.rotation.z = Math.PI / 2;
pillGroup.add(center);

const leftCap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 32), pillMaterial);
leftCap.position.x = -0.3;
pillGroup.add(leftCap);

const rightCap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 32), pillMaterial);
rightCap.position.x = 0.3;
pillGroup.add(rightCap);

pillButtonGroup.add(pillGroup);

// Circular button
const button = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.25, 64),
    new THREE.MeshStandardMaterial({ color: 0x00d6c4 })
);
button.rotation.x = Math.PI / 2;
button.position.x = -0.4;
button.position.z = 0.085;
pillButtonGroup.add(button);

scene.add(pillButtonGroup);

pillButtonGroup.position.set(0, 0.7, -5);
pillButtonGroup.scale.set(0.7, 0.7, 0.7);

let isOn = false;
toggleGeneralLights();

// Hitbox for pillButtonGroup
const pillButtonHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.4, 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
);
pillButtonHitbox.position.copy(pillButtonGroup.position);
scene.add(pillButtonHitbox);


// Raycast to look buttons
const raycaster_button = new THREE.Raycaster();

// Mouse coordenates
const mouse = new THREE.Vector2();

// Events click handler
renderer.domElement.addEventListener('click', onClick, false);
function onClick(event) {

    if (activeCamera !== camera) {
        controls.lock();
        activeCamera = camera;
        return;
    }


    mouse.x = 0;
    mouse.y = 0;

    raycaster_button.setFromCamera(mouse, camera);



    // Map paintings buttons hitboxes
    const buttonToCameraMap = new Map();
    buttonToCameraMap.set(paintingButton1Hitbox, fixedCamera);
    buttonToCameraMap.set(paintingButton2Hitbox, fixedCamera1);

    raycaster_button.setFromCamera(mouse, camera);
    const intersects = raycaster_button.intersectObjects([...buttonToCameraMap.keys(), pillButtonHitbox]);


    if (intersects.length > 0) {
        const clicked = intersects[0].object;

        if (clicked === pillButtonHitbox) {
            // Toggle the state of the lights
            toggleGeneralLights();

            //button.position.x = isOn ? -0.4 : 0.4;
            new TWEEN.Tween(button.position)
                .to({ x: isOn ? -0.4 : 0.4 }, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            // Change the color of the pill
            const fromColor = { r: pillMaterial.color.r, g: pillMaterial.color.g, b: pillMaterial.color.b };
            const toColor = isOn ? offColor : onColor;
            new TWEEN.Tween(fromColor)
                .to({ r: toColor.r, g: toColor.g, b: toColor.b }, 300)
                .onUpdate(() => {
                    pillMaterial.color.setRGB(fromColor.r, fromColor.g, fromColor.b);
                })
                .start();

            isOn = !isOn;




        } else if (buttonToCameraMap.has(clicked)) {
            // Display a message bubble to indicate how to exit
            const infoBubble = document.getElementById('infoBubble');
            infoBubble.innerText = 'Haz clic para salir';
            infoBubble.style.display = 'block';
            // Remove the bubble after a few seconds
            setTimeout(() => {
                infoBubble.innerText = '';
                infoBubble.style.display = 'none';
            }, 3000);

            controls.unlock();
            activeCamera = buttonToCameraMap.get(clicked);
        }
    }
}

///Functions
// Turn off the general lights except for those of the paintings and the sculpture
function toggleGeneralLights() {
    scene.traverse(obj => {
        if (
            obj.isPointLight
        ) {
            obj.visible = !obj.visible;
        }
    });
}

// Rotate an object from y axis to target
function lookAtY(object, target) {
    const direction = new THREE.Vector3().subVectors(target, object.position).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    object.setRotationFromQuaternion(quaternion);
}
