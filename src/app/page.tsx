"use client";
import * as THREE from "three";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { div } from "three/src/nodes/TSL.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 5- setup the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // remove antialias for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current?.appendChild(renderer.domElement);

    // 6- add the controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // 7- animate the scene
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
