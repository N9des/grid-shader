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

		this.addLight();

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

	addLight() {
		this.directionalLight = new THREE.DirectionalLight('#ffffff', 3)
		this.scene.add(this.directionalLight)
		this.directionalLight.position.set(0, 0, 10)
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
		// this.geometry = new THREE.PlaneGeometry(1, 1);

		this.customUniforms = {
			uTime: { value: 0 },
			uSize: { value: 0.8 }
			// uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
		}

		this.gridCol = 92;
		this.gridRow = 52;
		this.geometrySize = 0.5;
		this.gridColSize = this.gridCol * this.geometrySize;
		this.gridRowSize = this.gridRow * this.geometrySize;
		this.geometry = new THREE.PlaneGeometry(this.geometrySize, this.geometrySize)
		this.material = new THREE.MeshPhysicalMaterial({});

		this.material.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, this.customUniforms)
			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`
					#include <common>
					uniform float uTime;
					varying float vAnim;
					varying vec2 vUv;

					float cubicInOut(float t) {
						return t < 0.5
							? 4.0 * t * t * t
							: 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
					}
				`
			)
			shader.vertexShader = shader.vertexShader.replace(
				'#include <begin_vertex>',
				`
					#include <begin_vertex>

					vec4 position = instanceMatrix[3];
					float toLeft = length(position.x / 50.);
					vAnim += clamp(sin(uTime * 1.4 - cubicInOut(toLeft)), .45, 1.) + 0.09;

					vUv = uv;
				`
			)
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <common>',
				`
					#include <common>
					uniform float uSize;
					uniform float uTime;

					varying float vAnim;
					varying vec2 vUv;
				`
			)
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <color_fragment>',
				`
					float anim = uSize * vAnim;
					float strength = 1. - step(anim, distance(vUv, vec2(0.5)) + 0.25);

					diffuseColor.rgb = vec3(strength);
				`
			)
		}
		


		this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.gridCol * this.gridRow);
		this.scene.add(this.mesh);

		let dummy = new THREE.Object3D();
		let i = 0;
		let w = 1.4;
		for(let x = 0; x < this.gridCol; x++)
			for(let y = 0; y < this.gridRow; y++) {
				dummy.position.set( 
					w*(x * this.geometrySize - this.gridColSize/2 + this.geometrySize / 2.),
					w*(y * this.geometrySize - this.gridRowSize/2 + this.geometrySize / 2.),
					0,
				);

				dummy.updateMatrix();
				this.mesh.setMatrixAt(i, dummy.matrix);
				i++;
			}
		this.mesh.instanceMatrix.needsUpdate = true;
		this.mesh.computeBoundingSphere();
	}

	addDebug() {
		const gui = new dat.GUI();
		gui.add(this.customUniforms.uSize, 'value').min(0).max(1).step(0.0001).name('Dot Size').onChange(value => {
			this.customUniforms.uSize.value = value
		})
	}

	addAnim() {
		const elapsedTime = this.clock.getElapsedTime();

		// Update time
		this.customUniforms.uTime.value = elapsedTime;
	}

	resize() {
		// Update sizes
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

		// Resize geometry
		// this.planeFitPerspectiveCamera(this.mesh, this.camera);
		// this.material.uniforms.uResolution.value.set(this.sizes.width, this.sizes.height);

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
