import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let camera, scene, renderer, model;

function init() {
    // Создаем сцену
    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Рендерер с поддержкой XR
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Автоматически активируем AR-режим
    const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] });
    arButton.click(); // Имитируем нажатие на кнопку

    // Свет
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Загрузка модели
    const loader = new GLTFLoader();
    loader.load('./model/scene.gltf', function (gltf) {
        model = gltf.scene;
        model.position.set(0, 0, -0.5); // Устанавливаем перед камерой
        model.scale.set(0.01, 0.01, 0.01); // Уменьшаем масштаб модели
        scene.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    // Запуск рендера
    renderer.setAnimationLoop(render);
}

function render() {
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();