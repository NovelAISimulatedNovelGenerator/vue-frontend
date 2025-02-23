<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

const props = defineProps<{
  loginSuccess?: boolean
}>()

const container = ref<HTMLDivElement>()
let scene: THREE.Scene | null = null
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let water: THREE.Mesh | null = null
let animationFrameId: number | null = null

onMounted(() => {
  if (!container.value) return
  
  // 初始化Three.js场景
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#8e99a2', 1, 8)
  scene.background = new THREE.Color('#8e99a2')

  // 海浪材质和几何体
  const waterGeometry = new THREE.PlaneGeometry(12, 12, 512, 512)
  const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: `#include <fog_pars_vertex>

uniform float uTime;

uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWaveSpeed;

uniform  float uSmallWavesElevation;
uniform  float uSmallWavesFrequency;
uniform  float uSmallWavesSpeed;
uniform float uSmallWavesIterations;

varying float vElevation;

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
  #include <begin_vertex>
  #include <project_vertex>
  #include <fog_vertex>
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float elevation = 
    sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWaveSpeed) 
    * sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWaveSpeed) 
    * uBigWavesElevation;
  
  for(float i = 1.0; i <= 10.0; i++) {
   
    elevation -= abs(
      cnoise(
        vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)
        ) 
        * uSmallWavesElevation / i
      );
     if(i >= uSmallWavesIterations ) {
      break;
    }
  }
  
  modelPosition.y += elevation;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vElevation = elevation;
}`,
    fragmentShader: `#include <fog_pars_fragment>
precision mediump float;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
  gl_FragColor = vec4(color, 1.0);
   #include <fog_fragment>
}`,
    transparent: true,
    fog: true,
    uniforms: {
      uTime: { value: 0 },
      uBigWavesElevation: { value: 0.2 },
      uBigWavesFrequency: { value: new THREE.Vector2(4, 2) },
      uBigWaveSpeed: { value: 0.75 },
      uSmallWavesElevation: { value: 0.15 },
      uSmallWavesFrequency: { value: 3 },
      uSmallWavesSpeed: { value: 0.2 },
      uSmallWavesIterations: { value: 4 },
      uDepthColor: { value: new THREE.Color('#b5e4e4') },
      uSurfaceColor: { value: new THREE.Color('#4d9aaa') },
      uColorOffset: { value: 0.08 },
      uColorMultiplier: { value: 5 },
      ...THREE.UniformsLib["fog"]
    }
  })

  water = new THREE.Mesh(waterGeometry, waterMaterial)
  water.rotation.x = -Math.PI * 0.5
  scene.add(water)

  // 相机设置 - 使用正常视角
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    100
  )
  camera.position.set(1, 1, 1) // 保持原来的初始位置
  scene.add(camera)

  // 渲染器设置
  renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setClearAlpha(0)
  container.value.appendChild(renderer.domElement)

  // 控制器设置
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enabled = true
  controls.enableZoom = true
  controls.enablePan = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5
  controls.target.set(0, 0, 0)
  
  // 登录成功动画
  watch(() => props.loginSuccess, (newValue) => {
    if (newValue) {
      controls.enabled = false
      controls.autoRotate = false
      
      const currentPos = camera.position.clone()
      
      // 构建贝塞尔曲线动画
      gsap.timeline()
        // 1. 缓慢上升并稍微后移，为俯冲做准备
        .to(camera.position, {
          x: currentPos.x * 0.5,
          y: 1,
          z: currentPos.z + 1,
          duration: 0.8,
          ease: "power1.inOut"
        })
        // 2. 暂停一个很短的时间
        .to({}, {
          duration: 0.1
        })
        // 3. 快速俯冲，使用自定义缓动函数让动作更有力量感
        .to(camera.position, {
          x: 0,
          y: 0.2,
          z: -3,
          duration: 1.4,
          ease: "power3.in"
        }, ">=0")
        
      // 视角跟随，但比位移稍慢一些，造成视角拉伸感
      gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: -7,
        duration: 1.8,
        ease: "power2.inOut"
      })

      // 添加相机俯仰角度的微调
      gsap.to(camera.rotation, {
        x: THREE.MathUtils.degToRad(-5),
        duration: 2,
        ease: "power2.inOut"
      })
    }
  })

  // 自适应大小
  const handleResize = () => {
    if (!container.value) return
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }
  window.addEventListener('resize', handleResize)

  // 动画
  const clock = new THREE.Clock()
  const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    waterMaterial.uniforms.uTime.value = elapsedTime
    controls.update()
    renderer.render(scene, camera)
    animationFrameId = requestAnimationFrame(animate)
  }
  animate()

  // 清理
  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    
    // 清理controls
    if (controls) {
      controls.dispose()
      controls = null
    }
  
    // 清理water材质和几何体
    if (water) {
      water.geometry.dispose()
      ;(water.material as THREE.ShaderMaterial).dispose()
      water = null
    }
  
    // 清理renderer
    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      renderer = null
    }
  
    // 清理scene
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          ;(object.material as THREE.Material).dispose()
        }
      })
      scene = null
    }
  
    // 清理camera
    camera = null
  
    // 手动触发垃圾回收
    window.gc?.()
  })
})
</script>

<template>
  <div ref="container" class="background-container"></div>
</template>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
