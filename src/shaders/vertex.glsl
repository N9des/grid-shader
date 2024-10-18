uniform vec2 uResolution;
uniform float uTime;

// Picture Textures
uniform sampler2D uTexture01;
uniform sampler2D uTexture02;
uniform sampler2D uTexture03;
uniform sampler2D uTexture04;
uniform sampler2D uTexture05;
uniform float uSelectedTexture;
uniform float uPictureIntensityMultipler;

// GUI
uniform float uFrequencyXWaves;
uniform float uFrequencyYWaves;
uniform bool uYAddition;

varying float uWave;
varying vec2 vUv;
varying float vPictureIntensity;

float cubicInOut(float t) {
	return t < 0.5
		? 4.0 * t * t * t
		: 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

		// Picture texture
		float pictureIntensity;

		if (uSelectedTexture == 1.) {
			pictureIntensity = texture(uTexture01, uv).r;
		} else if (uSelectedTexture == 2.) {
			pictureIntensity = texture(uTexture02, uv).r;
		} else if (uSelectedTexture == 3.) {
			pictureIntensity = texture(uTexture03, uv).r;
		} else if (uSelectedTexture == 4.) {
			pictureIntensity = texture(uTexture04, uv).r;
		} else if (uSelectedTexture == 5.) {
			pictureIntensity = texture(uTexture05, uv).r;
		} else {
			pictureIntensity = 0.;
		}

    // Point size
    gl_PointSize = 0.4 * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

		// Wave	
		float direction;

		if (uFrequencyXWaves > 0.) {
			direction = length(uv.x * uFrequencyXWaves);
		}

		if (uFrequencyYWaves > 0. && !uYAddition && uFrequencyXWaves == 0.) {
			direction = length(uv.y * uFrequencyYWaves);
		} else if (uFrequencyYWaves > 0. && !uYAddition && uFrequencyXWaves > 0.) {
			direction *= length(uv.y * uFrequencyYWaves);
		} else if (uFrequencyYWaves > 0. && uYAddition) {
			if (uYAddition) {
				direction *= length(uv.y + uFrequencyYWaves);
			} else {
				direction *= length(uv.y * uFrequencyYWaves);
			}
		}

		uWave += clamp(sin(uTime * 1.4 + direction), -0.2, 1.) + 1.08;

		// Varying
		vPictureIntensity = pow(pictureIntensity, uPictureIntensityMultipler);
		vUv = uv;
}