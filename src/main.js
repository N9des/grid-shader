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

	addDisplacement() {
		// Displacements
		this.displacement = {}

		/**
		 * 2D canvas
		 */
		this.displacement.canvas = document.createElement('canvas')
		this.displacement.canvas.width = 128
		this.displacement.canvas.height = 128
		this.displacement.canvas.style.position = 'fixed'
		this.displacement.canvas.style.width = '256px'
		this.displacement.canvas.style.height = '256px'
		this.displacement.canvas.style.top = 0
		this.displacement.canvas.style.left = 0
		this.displacement.canvas.style.zIndex = 10
		document.body.append(this.displacement.canvas)

		/**
		 * Context
		 */
		this.displacement.context = this.displacement.canvas.getContext('2d')
		this.displacement.context.fillRect(0, 0, this.displacement.canvas.width, this.displacement.canvas.height)

		/**
		 * Glow image
		 */
		this.displacement.glowImage = new Image()
		this.displacement.glowImage.src = './images/glow-2.png'
		this.displacement.glowSize = {
			multipler: { value: 0.25 }
		}

		/**
		 * Interactive plane
		 */
		this.displacement.interactivePlane = new THREE.Mesh(
			new THREE.PlaneGeometry(55, 30),
			new THREE.MeshBasicMaterial({
				color: 'red'
			})
		)
		this.displacement.interactivePlane.visible = false
		this.scene.add(this.displacement.interactivePlane)

		/*
		 * Raycaster
		 */
		this.displacement.raycaster = new THREE.Raycaster()

		/**
		 * Coordinates
		 */
		this.displacement.screenCursor = new THREE.Vector2(9999, 9999)
		this.displacement.canvasCursor = new THREE.Vector2(9999, 9999)
		this.displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999)

		window.addEventListener('pointermove', (e) => {
			this.displacement.screenCursor.x = (e.clientX / this.sizes.width) * 2 - 1
			this.displacement.screenCursor.y = -(e.clientY / this.sizes.height * 2 - 1)
		})

		/**
		 * Texture
		 */
		this.displacement.texture = new THREE.CanvasTexture(this.displacement.canvas)
	}

	addMesh() {
		this.addDisplacement()

		/**
		 * Mesh
		 */
		this.particlesGeometry = new THREE.PlaneGeometry(55, 30, 96, 56)
		this.particlesMaterial = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
    	fragmentShader: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uSize: { value: 0.4 },
				uAnim: { value: false },
				uFrequencyXWaves: { value: 10 },
				uFrequencyYWaves: { value: 0 },
				uYAddition: { value: false },
				uResolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)),
				uDisplacementTexture: new THREE.Uniform(this.displacement.texture)
			},
		});

		this.mesh = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
		this.scene.add(this.mesh);
	}

	addDebug() {
		const gui = new dat.GUI();
		gui.add(this.particlesMaterial.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('Particles sizes').onChange(value => {
			this.particlesMaterial.uniforms.uSize.value = value
		})
		gui.add(this.particlesMaterial.uniforms.uAnim, 'value').name('Waves animation').onChange(value => {
			this.particlesMaterial.uniforms.uAnim.value = value;
		})
		gui.add(this.particlesMaterial.uniforms.uFrequencyXWaves, 'value').name('Waves X Frenquency').min(0).max(100).step(0.001).onChange(value => {
			this.particlesMaterial.uniforms.uFrequencyXWaves.value = value;
		})
		gui.add(this.particlesMaterial.uniforms.uFrequencyYWaves, 'value').name('Waves Y Frenquency').min(0).max(100).step(0.001).onChange(value => {
			this.particlesMaterial.uniforms.uFrequencyYWaves.value = value;
		})
		gui.add(this.particlesMaterial.uniforms.uYAddition, 'value').name('Waves Y Addition').onChange(value => {
			this.particlesMaterial.uniforms.uYAddition.value = value;
		})
		gui.add(this.displacement.glowSize.multipler, 'value').name('Cursor Size Multiplier').min(0).max(1).step(0.001)
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

		/**
		 * Update raycaster
		 */
		this.displacement.raycaster.setFromCamera(this.displacement.screenCursor, this.camera)
		const intersections = this.displacement.raycaster.intersectObject(this.displacement.interactivePlane)

		if (intersections.length > 0) {
			const uv = intersections[0].uv
			this.displacement.canvasCursor.x = uv.x * this.displacement.canvas.width
			this.displacement.canvasCursor.y = (1 - uv.y) * this.displacement.canvas.height
		}

		/**
		 * Displacement
		 */
		// Fade Out
		this.displacement.context.globalCompositeOperation = 'source-over'
		this.displacement.context.globalAlpha = 0.02
		this.displacement.context.fillRect(0, 0, this.displacement.canvas.width, this.displacement.canvas.height)

		// Speed Alpha
		const cursorDistance = this.displacement.canvasCursorPrevious.distanceTo(this.displacement.canvasCursor)
		this.displacement.canvasCursorPrevious.copy(this.displacement.canvasCursor)
		const alpha = Math.min(cursorDistance * 0.1, 1)

		// Draw glow
		const glowSize = this.displacement.canvas.width * this.displacement.glowSize.multipler.value
		this.displacement.context.globalCompositeOperation = 'lighten'
		this.displacement.context.globalAlpha = alpha
		this.displacement.context.drawImage(
			this.displacement.glowImage,
			this.displacement.canvasCursor.x - glowSize * 0.5,
			this.displacement.canvasCursor.y - glowSize * 0.5,
			glowSize,
			glowSize
		)

		// Texture
		this.displacement.texture.needsUpdate = true

		/**
		 * Update Renderer
		 */
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
