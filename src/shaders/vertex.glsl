uniform vec2 uResolution;
uniform float uTime;

varying float uWave;
varying vec2 vUv;

float cubicInOut(float t) {
	return t < 0.5
		? 4.0 * t * t * t
		: 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

void main() {
		// Displacement
		vec3 newPosition = position;
		// float displacementIntensity = texture2D(uDisplacementTexture, uv).r;

		// vec3 displacement = vec3(0.0, 0.0, 1.0);
		// displacement *= displacementIntensity;
		// displacement *= 3.0;

		// newPosition += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

		// Texture
		// float textureIntensity = texture2D(uDisplacementTexture, uv).r;

    // Point size
    gl_PointSize = 0.4 * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

		// Wave	
		float toLeft = length((uv.x * 10.) * (uv.y * 4.));
		// float toLeft = length(gl_Position.x) / length(gl_Position.y);
		uWave += clamp(sin(uTime * 1.4 + toLeft), -0.2, 1.) + 1.08;

		vUv = uv;
}