import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

export default class Sketch {
	constructor() {
		// Sizes
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelRatio: Math.min(window.devicePixelRatio, 2)
		}
		// Init Renderer
		this.canvas = document.querySelector('canvas.webgl');

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		// Init scene
		this.scene = new THREE.Scene();

		this.addCamera();

		this.addControls();

		this.addMesh();

		this.addDebug();

		// Init values
		this.time = 0;
		this.clock = new THREE.Clock();
		
		this.render();
		
		// Resize
		this.resize();
		window.addEventListener('resize', this.resize.bind(this));
	}

	addControls() {
		this.controls = new OrbitControls(this.camera, this.canvas)
		this.controls.enableDamping = true
	}

	addCamera() {
		this.camera = new THREE.PerspectiveCamera(
			50,
			this.sizes.width / this.sizes.height,
			0.001,
			1000
		);
		this.camera.position.z = 50;
	}

	addMesh() {
		this.particlesGeometry = new THREE.PlaneGeometry(55, 30, 120, 70)
		this.particlesMaterial = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
    	fragmentShader: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uSize: { value: 0.4 },
				uResolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)),
			}
		});


		this.mesh = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
		this.scene.add(this.mesh);
	}

	addDebug() {
		const gui = new dat.GUI();
		gui.add(this.particlesMaterial.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('Particles sizes').onChange(value => {
			this.particlesMaterial.uniforms.uSize.value = value
		})
	}

	addAnim() {
		const elapsedTime = this.clock.getElapsedTime();

		// Update time
		this.particlesMaterial.uniforms.uTime.value = elapsedTime;
	}

	resize() {
		// Update sizes
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight
		this.sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

		 // Materials
		 this.particlesMaterial.uniforms.uResolution.value.set(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}

	render() {
		this.addAnim()

		// Update controls
    this.controls.update();

		this.renderer.render(this.scene, this.camera, 10);
		window.requestAnimationFrame(this.render.bind(this));
	}

	planeFitPerspectiveCamera(geometry, camera, relativeZ = null) {
		const cameraZ = relativeZ !== null ? relativeZ : camera.position.z;
		const distance = cameraZ - geometry.position.z;
		const vFov = camera.fov * Math.PI / 180;
		const scaleY = 2 * Math.tan(vFov / 2) * distance;
		const scaleX = scaleY * camera.aspect;
	
		geometry.scale.set(scaleX, scaleY, 1);
	}
}

new Sketch();
