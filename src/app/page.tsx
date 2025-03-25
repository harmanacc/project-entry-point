"use client";
import * as THREE from "three";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { div } from "three/src/nodes/TSL.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";

const angleToRad = (deg: number) => {
  return deg * (Math.PI / 180);
};

function getRandomInterval(min: number, max: number) {
  return Math.random() * (max - min + 1) + min;
}

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

    // Simulate the light beam with a semi-transparent cone
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.95);
    const rightLightBeamGeometry = new THREE.ConeGeometry(1.5, 8, 40);
    const rightLightBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      clippingPlanes: [clippingPlane],
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const leftLightBeamGeometry = new THREE.ConeGeometry(1.5, 8, 40);
    const leftLightBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      clippingPlanes: [clippingPlane],
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rightLightBeam = new THREE.Mesh(
      rightLightBeamGeometry,
      rightLightBeamMaterial,
    );

    // initial light beam position
    rightLightBeam.position.set(1.5, 2, 0);
    rightLightBeam.rotation.z = 0; // Straight down
    scene.add(rightLightBeam);

    const leftLightBeam = new THREE.Mesh(
      leftLightBeamGeometry,
      leftLightBeamMaterial,
    );
    leftLightBeam.position.set(-1.5, 2, 0);
    leftLightBeam.rotation.z = 0; // Straight down
    scene.add(leftLightBeam);

    // Create a geometry for the disc
    const discGeometry = new THREE.CircleGeometry(1.46, 32);
    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      emissive: 0xffffff, // Add emissive color [[4]]
      emissiveIntensity: 0, // Start fully dark
      opacity: 0,
      side: THREE.BackSide,
    });

    // Create a mesh for the disc
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.castShadow = true;
    disc.position.set(0, -0.95, 0);
    // disc.position.set(0, 0, 0);
    disc.rotation.x = angleToRad(90);
    const discLightUpDuration = 2000;
    const lightUpTween = new TWEEN.Tween(disc.material)
      .to({ emissiveIntensity: 1, opacity: 1 }, discLightUpDuration)
      .easing(TWEEN.Easing.Linear.None) // Linear interpolation [[7]]
      .start();

    // 4. Force render order (draw discs last)
    disc.renderOrder = 1;
    rightLightBeam.renderOrder = 0;
    leftLightBeam.renderOrder = 0;

    // 5- setup the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // remove antialias for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current?.appendChild(renderer.domElement);
    // (important) Enable local clipping planes in the renderer
    renderer.clippingPlanes = [];
    renderer.localClippingEnabled = true;

    // 6- add the controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // 7- animate the scene
    //
    function animateLighting() {
      let animationStartTime: number | null = null;
      let malfunctionActive: boolean = false;
      let malfunctionStartTime: number = 0;
      let malfunctionDuration: number = 0;
      let timeUntilNextMalfunction = getRandomInterval(5, 20) * 1000;

      function animate(time: number) {
        if (animationStartTime === null) {
          animationStartTime = time;
        }
        const elapsedTime = time - animationStartTime;

        // Cube loading delay (1 second)
        if (elapsedTime < 1000) {
          if (elapsedTime < 500) {
            // Flicker for first 500ms using sine wave for smooth effect
            const flickerIntensity = Math.sin(time * 0.1) * 0.5 + 0.5;
            leftLightBeam.material.opacity = flickerIntensity * 0.3;
            leftLightBeam.material.needsUpdate = true;
          }
          requestAnimationFrame(animate);
          return;
        }

        // Phase 2: Rotation & intensity animation: Light beam rotation phase (1 second)
        if (elapsedTime < 2000) {
          const rotationProgress = (elapsedTime - 1000) / 1000;

          // Rotate light beams
          rightLightBeam.rotation.z = angleToRad(-25 * rotationProgress);
          leftLightBeam.rotation.z = angleToRad(25 * rotationProgress);
          // Gradually increase light intensity
          ambientLight.intensity = 0.01 + 0.99 * rotationProgress;
          pointLight.intensity = 0.01 + 0.49 * rotationProgress;
          spotLight.intensity = 0.01 + 0.99 * rotationProgress;

          scene.add(disc);
          lightUpTween.start();
          discMaterial.needsUpdate = true;
          lightUpTween.update(time);
          requestAnimationFrame(animate);
          return;
        }

        // Final light and beam positioning
        rightLightBeam.rotation.z = angleToRad(-24.8);
        rightLightBeam.rotation.x = 0;
        leftLightBeam.rotation.z = angleToRad(24.8);
        leftLightBeam.rotation.x = 0;

        ambientLight.intensity = 1;
        pointLight.intensity = 0.5;
        spotLight.intensity = 1;

        const currentTime = performance.now(); // More precise timing

        // Check if it's time for a malfunction
        if (
          !malfunctionActive &&
          currentTime - malfunctionStartTime >= timeUntilNextMalfunction
        ) {
          console.log("Malfunction started"); // Debug log
          malfunctionActive = true;
          malfunctionStartTime = currentTime;
          malfunctionDuration = getRandomInterval(0, 3) * 1000; // 1-3 seconds
          timeUntilNextMalfunction = getRandomInterval(5, 20) * 1000;
        }

        // Handle active malfunction
        if (malfunctionActive) {
          const malfunctionElapsedTime = currentTime - malfunctionStartTime;

          if (malfunctionElapsedTime < malfunctionDuration) {
            // More dramatic flicker effect
            const flickerIntensity = Math.sin(time * 0.1) * 0.5 + 0.5;
            leftLightBeam.material.opacity = flickerIntensity * 0.3;
            leftLightBeam.material.needsUpdate = true;

            console.log("Flickering:", flickerIntensity); // Debug log
          } else {
            // End of malfunction
            console.log("Malfunction ended"); // Debug log
            malfunctionActive = false;
            leftLightBeam.material.opacity = 0.3; // Back to original opacity
            leftLightBeam.material.needsUpdate = true;

            // Set next malfunction timing
            timeUntilNextMalfunction = getRandomInterval(5, 20) * 1000;
            malfunctionStartTime = currentTime;
          }
        }
        requestAnimationFrame(animate);
      }
      renderer.render(scene, camera);
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

    // add helpers when in dev mode
    // Create an AxesHelper with a size of 5 units
    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);
    // const helper = new THREE.CameraHelper(spotLight.shadow.camera);
    // scene.add(helper);
    // // Add a helper to visualize the spotLight cone
    // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(spotLightHelper);

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
