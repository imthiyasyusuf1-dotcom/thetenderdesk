/**
 * lens-shader.js
 * Tinted sunglass lens with per-channel refraction (chromatic dispersion),
 * a Fresnel reflection of the prefiltered studio env map, and a slow
 * gradient tint so the lens reads as "rosé to smoke" in motion.
 */
import * as THREE from 'three';

export function makeLensMaterial(envMap) {
  // PMREM atlas constants, derived the same way three's own materials do.
  const H = envMap.image.height, maxMip = Math.log2(H) - 2;
  return new THREE.ShaderMaterial({
    defines: {
      CUBEUV_MAX_MIP: maxMip.toFixed(1),
      CUBEUV_TEXEL_WIDTH: (1 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16))).toFixed(8),
      CUBEUV_TEXEL_HEIGHT: (1 / H).toFixed(8),
    },
    transparent: true,
    uniforms: {
      uEnv: { value: envMap },
      uTintA: { value: new THREE.Color(0x2a0508) },
      uTintB: { value: new THREE.Color(0xd7263d) },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vP;
      void main(){
        vec4 wp = modelMatrix * vec4(position,1.);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        vP = position;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      // PMREM textures are cube-UV atlases; three injects the sampler helpers.
      #define ENVMAP_TYPE_CUBE_UV
      #include <common>
      #include <cube_uv_reflection_fragment>
      uniform sampler2D uEnv; uniform vec3 uTintA; uniform vec3 uTintB;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        if (!gl_FrontFacing) n = -n;
        // Chromatic refraction: three IORs, one tap each.
        float r = textureCubeUV(uEnv, refract(-v, n, 1./1.46), .35).r;
        float g = textureCubeUV(uEnv, refract(-v, n, 1./1.50), .35).g;
        float b = textureCubeUV(uEnv, refract(-v, n, 1./1.55), .35).b;
        vec3 refr = vec3(r,g,b);
        vec3 refl = textureCubeUV(uEnv, reflect(-v, n), .04).rgb;
        float fres = pow(1. - clamp(dot(n, v), 0., 1.), 3.);
        vec3 tint = mix(uTintB, uTintA, smoothstep(-.5, .45, vP.y));
        vec3 col = refr * tint * .9 + refl * (.18 + fres * 1.6);
        gl_FragColor = vec4(col, .78 + fres * .2);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
