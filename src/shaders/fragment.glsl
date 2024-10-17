uniform float uSize;
uniform float uTime;

varying float uWave;

void main() {
		vec2 uv = gl_PointCoord;
		float distanceToCenter = length(uv - vec2(0.5));
		float wave = uSize * uWave;
		float strength = 1. - step(wave, distanceToCenter + 0.25);

    gl_FragColor = vec4(vec3(strength), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}