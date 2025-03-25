"use client";
import * as THREE from "three";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { div } from "three/src/nodes/TSL.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const angleToRad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const scene = new THREE.Scene();
    // 2- add the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;
    // 3- create and add  the cube object
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x0000ff,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 4- add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.01);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);
    // For point light
    pointLight.castShadow = true;

    // // Adjust shadow map size and camera properties
    // pointLight.shadow.mapSize.width = 512;
    // pointLight.shadow.mapSize.height = 512;
    // pointLight.shadow.camera.near = 0.5;
    // pointLight.shadow.camera.far = 50;

    const spotLight = new THREE.SpotLight(0xffffff, 0.01);
    spotLight.castShadow = true; // default false
    spotLight.position.set(0, 3, 3);
    spotLight.target = cube;
    scene.add(spotLight);

    // Add a helper to visualize the spotLight cone
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);

    // Simulate the light beam with a semi-transparent cone
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.95);
    const lightBeamGeometry = new THREE.ConeGeometry(1.5, 8, 40);
    const lightBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      clippingPlanes: [clippingPlane],
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rightLightBeam = new THREE.Mesh(lightBeamGeometry, lightBeamMaterial);
    // rightLightBeam.position.set(1.5, 2, 0);
    // rightLightBeam.rotation.z = angleToRad(-25);
    // rightLightBeam.rotation.x = angleToRad(-3);

    // initial light beam position
    rightLightBeam.position.set(1.5, 2, 0);
    rightLightBeam.rotation.z = 0; // Straight down
    // rightLightBeam.rotation.z = angleToRad(90); // Facing down
    scene.add(rightLightBeam);

    const leftLightBeam = new THREE.Mesh(lightBeamGeometry, lightBeamMaterial);
    leftLightBeam.position.set(-1.5, 2, 0);
    // leftLightBeam.rotation.z = angleToRad(25);
    // leftLightBeam.rotation.x = angleToRad(-3);
    leftLightBeam.rotation.z = 0; // Straight down
    // leftLightBeam.rotation.z = angleToRad(90); // Facing down
    scene.add(leftLightBeam);

    const helper = new THREE.CameraHelper(spotLight.shadow.camera);
    scene.add(helper);

    // Create a geometry for the disc
    const discGeometry = new THREE.CircleGeometry(1.46, 32);
    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      // side: THREE.DoubleSide,
      // depthWrite: true,
      // roughness: 0.5,
      // metalness: 0.2,
    });

    // Create a mesh for the disc
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.receiveShadow = true;
    // disc.position.set(0, 0, 0);
    disc.position.set(0, -0.95, 0);
    disc.rotation.x = angleToRad(90);
    scene.add(disc);

    // 4. Force render order (draw discs last)
    disc.renderOrder = 1;
    rightLightBeam.renderOrder = 0;
    leftLightBeam.renderOrder = 0;

    // 5- setup the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // remove antialias for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current?.appendChild(renderer.domElement);
    // Enable local clipping planes in the renderer
    renderer.clippingPlanes = [];
    renderer.localClippingEnabled = true;

    // 6- add the controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Create an AxesHelper with a size of 5 units
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    // 7- animate the scene
    //
    function animateLighting() {
      let animationStartTime: number | null = null;

      function animate(time: number) {
        if (animationStartTime === null) {
          animationStartTime = time;
        }
        const elapsedTime = time - animationStartTime;

        // Cube loading delay (1 second)
        if (elapsedTime < 1000) {
          requestAnimationFrame(animate);
          return;
        }

        // Light beam rotation phase (1 second)
        if (elapsedTime < 2000) {
          const rotationProgress = (elapsedTime - 1000) / 1000;

          // Rotate right light beam
          rightLightBeam.rotation.z = angleToRad(-25 * rotationProgress);
          // rightLightBeam.rotation.x = angleToRad(90 - 90 * rotationProgress);

          // Rotate left light beam
          leftLightBeam.rotation.z = angleToRad(25 * rotationProgress);
          // leftLightBeam.rotation.x = angleToRad(90 - 90 * rotationProgress);

          // Gradually increase light intensity
          ambientLight.intensity = 0.01 + 0.99 * rotationProgress;
          pointLight.intensity = 0.01 + 0.49 * rotationProgress;
          spotLight.intensity = 0.01 + 0.99 * rotationProgress;

          requestAnimationFrame(animate);
          return;
        }

        // Final light and beam positioning
        rightLightBeam.rotation.z = angleToRad(-25);
        rightLightBeam.rotation.x = 0;

        leftLightBeam.rotation.z = angleToRad(25);
        leftLightBeam.rotation.x = 0;

        ambientLight.intensity = 1;
        pointLight.intensity = 0.5;
        spotLight.intensity = 1;
      }

      requestAnimationFrame(animate);
    }
    animateLighting();
    //-------
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    // 8- handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
}
