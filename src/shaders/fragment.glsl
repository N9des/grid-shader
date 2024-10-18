uniform float uSize;
uniform float uTime;
uniform sampler2D uDisplacementTexture;

varying float uWave;
varying vec2 vUv;

void main() {
	// Displacement
	float displacementIntensity = texture2D(uDisplacementTexture, vUv).r;
	displacementIntensity = smoothstep(0.1, 0.5, displacementIntensity);

	vec2 uv = gl_PointCoord;
	float distanceToCenter = length(uv - vec2(0.5));
	float wave = uSize * uWave;
	float strength = 1. - step(uSize+displacementIntensity, distanceToCenter + 0.25);

	gl_FragColor = vec4(vec3(strength), 1.0);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}