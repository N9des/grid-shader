uniform vec2 uResolution;
uniform float uTime;

varying float uWave;

float cubicInOut(float t) {
	return t < 0.5
		? 4.0 * t * t * t
		: 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

void main() {
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = 0.4 * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

		// Wave
		// float toLeft = length(gl_Position.x / 50.);
		float toLeft = length(gl_Position.x) + length(gl_Position.y);
		uWave += clamp(sin(uTime * 1.4 - cubicInOut(toLeft)), -0.2, 1.) + 1.08;
}