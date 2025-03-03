#version 300 es
precision highp float;

in vec2 screenUV;
in vec2 sourceUV;
in vec2 destinationUV;

out vec4 outColor;

uniform float time;
uniform float deltaTime;
uniform float framerate;
uniform int frame;
uniform vec2 resolution;
uniform sampler2D sourceTexture;
uniform sampler2D destinationTexture;
uniform mat4 sourceMatrix;
uniform mat4 destinationMatrix;

uniform float strength;  

float rand(vec2 c) {
    return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float gaussian(float x, float y, float sigma) {
    float r2 = x * x + y * y;
    return exp(-r2 / (2.0 * sigma * sigma)) / (2.0 * 3.141592653589793 * sigma * sigma);
}

void main() {
    vec4 color = vec4(0.);  
    float total = 0.0;

    // Calculate the number of samples per dimension
    int grid_side = int(32); // Use total samples directly
    float scale = float(grid_side) / resolution.x; // Normalize by resolution

    for (int i = -grid_side/2; i < grid_side/2; i++) {
        for (int j = -grid_side/2; j < grid_side/2; j++) {
            vec2 offset = normalize(vec2(float(i), float(j))) * float(i) * scale;  // Offset based on grid and resolution
            float val = gaussian(float(i), float(j), strength);  // Gaussian weight
            color += texture(destinationTexture, destinationUV + offset) * val;  // Sample the texture
            total += val;  // Accumulate total weight
        }
    }

    if (total > 0.0) {
        vec4 noiseTexture = vec4(rand(sourceUV));
        vec4 fade = smoothstep(0.0, 2.1, vec4(distance(sourceUV-.5, vec2(0.))) * resolution.x / resolution.y);
        outColor = color / (total-.01)  + noiseTexture * 0.03;  // Normalize the color by total weight
        outColor.a = texture(sourceTexture, sourceUV).a;
    } else {
        outColor = texture(destinationTexture, screenUV);  // Fallback to black if no samples are accumulated
    }
    outColor.z = 1.-strength;
}