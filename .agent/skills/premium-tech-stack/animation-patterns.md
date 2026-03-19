# Padrões de Animação Premium

> Catálogo de padrões de código para GSAP, Swup e Three.js extraídos de sites premiados.

---

## GSAP — Scroll Effects

### 1. Reveal on Scroll (Padrão base)

Elementos surgem com opacity e translate quando entram na viewport.

```javascript
gsap.registerPlugin(ScrollTrigger);

// Reveal staggered — múltiplos elementos surgem em sequência
gsap.utils.toArray('.reveal-element').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    y: 60,
    opacity: 0,
    duration: 0.8,
    delay: i * 0.1,
    ease: 'power2.out'
  });
});
```

### 2. Sticky Section com Conteúdo Animado

Seção fica fixa enquanto conteúdo interno muda com o scroll.

```html
<section class="panel-sticky">
  <div class="panel-inner">
    <h2 class="title">Produto X</h2>
    <p class="description">Descrição que muda com o scroll.</p>
  </div>
</section>
```

```css
.panel-sticky {
  position: relative;
  height: 300vh; /* espaço de scroll */
}
.panel-inner {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.panel-sticky',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true
  }
});

tl.fromTo('.title', { y: 100, opacity: 0 }, { y: 0, opacity: 1 })
  .fromTo('.description', { y: 50, opacity: 0 }, { y: 0, opacity: 1 }, '<0.2');
```

### 3. Parallax Multi-Camadas

Layers de background/foreground movem-se em velocidades diferentes.

```javascript
gsap.utils.toArray('[data-speed]').forEach(layer => {
  const speed = parseFloat(layer.dataset.speed);
  gsap.to(layer, {
    scrollTrigger: {
      trigger: layer.closest('section'),
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    },
    y: () => (1 - speed) * 300,
    ease: 'none'
  });
});
```

```html
<section class="parallax-section">
  <div data-speed="0.3" class="bg-layer">Background</div>
  <div data-speed="0.6" class="mid-layer">Midground</div>
  <div data-speed="1.0" class="fg-layer">Foreground</div>
</section>
```

### 4. Horizontal Scroll

Conteúdo se move horizontalmente enquanto o scroll é vertical.

```javascript
const sections = gsap.utils.toArray('.horizontal-panel');
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container',
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => '+=' + document.querySelector('.horizontal-container').offsetWidth
  }
});
```

### 5. Dual-Wave (Codrops Pattern)

Duas colunas de texto movem-se em ondas opostas com item em foco sincronizado a uma imagem central.

```html
<main id="smooth-wrapper">
  <div id="smooth-content">
    <div class="dual-wave-wrapper" data-animation="dual-wave">
      <div class="wave-column wave-column-left">
        <div class="animated-text" data-image="product1.webp">Item 1</div>
        <div class="animated-text" data-image="product2.webp">Item 2</div>
      </div>
      <div class="image-thumbnail-wrapper">
        <img src="default.webp" alt="Preview" class="image-thumbnail" />
      </div>
      <div class="wave-column wave-column-right">
        <div class="animated-text">Item A</div>
        <div class="animated-text">Item B</div>
      </div>
    </div>
  </div>
</main>
```

```javascript
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1
});

ScrollTrigger.create({
  trigger: '.dual-wave-wrapper',
  start: 'top bottom',
  end: 'bottom top',
  scrub: true,
  onUpdate: self => handleWaveScroll(self.progress)
});

function handleWaveScroll(progress) {
  // Calcular posições em onda baseadas no progresso
  // Determinar item em foco e atualizar thumbnail
}
```

### 6. Cards Empilhados (Stack Cards)

Cards se empilham em camadas conforme o scroll.

```javascript
const cards = gsap.utils.toArray('.stack-card');
cards.forEach((card, i) => {
  gsap.to(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 20%',
      end: 'bottom 20%',
      scrub: true,
      pin: true,
      pinSpacing: false
    },
    scale: 1 - (cards.length - i) * 0.05,
    opacity: i === cards.length - 1 ? 1 : 0.8,
  });
});
```

---

## Swup — Transições de Página

### 1. Fade Básico

```html
<main id="swup" class="transition-fade">
  <!-- conteúdo da página -->
</main>
```

```css
.transition-fade {
  transition: opacity 0.4s ease;
  opacity: 1;
}
html.is-animating .transition-fade {
  opacity: 0;
}
```

```javascript
import Swup from 'swup';
const swup = new Swup();
```

### 2. Slide Direcional

```css
.transition-slide {
  transition: transform 0.5s ease, opacity 0.5s ease;
  transform: translateX(0);
  opacity: 1;
}
html.is-animating .transition-slide {
  transform: translateX(-100px);
  opacity: 0;
}
html.is-rendering .transition-slide {
  transform: translateX(100px);
  opacity: 0;
}
```

### 3. Wipe com Overlay

```css
.page-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  z-index: 9999;
  pointer-events: none;
}
html.is-changing .page-overlay {
  animation: wipe-in 0.4s ease forwards;
}
html.is-rendering .page-overlay {
  animation: wipe-out 0.4s ease forwards;
}
@keyframes wipe-in {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes wipe-out {
  from { transform: scaleX(1); transform-origin: right; }
  to { transform: scaleX(0); transform-origin: right; }
}
```

### 4. Integração Swup + GSAP

```javascript
import Swup from 'swup';
import SwupJsPlugin from '@swup/js-plugin';

const swup = new Swup({
  plugins: [
    new SwupJsPlugin({
      animations: [
        {
          from: '(.*)',
          to: '(.*)',
          out: (done) => {
            gsap.to('#swup', {
              opacity: 0,
              y: -20,
              duration: 0.3,
              onComplete: done
            });
          },
          in: (done) => {
            gsap.fromTo('#swup',
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.3, onComplete: done }
            );
          }
        }
      ]
    })
  ]
});
```

---

## Three.js — Experiências 3D

### 1. Setup Básico

```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true // fundo transparente
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // limitar para performance
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.set(0, 0, 5);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### 2. Partículas Interativas (Mouse Follow)

```javascript
const particleCount = 1000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.02,
  color: 0x00A8E8,
  transparent: true,
  opacity: 0.8
});
const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Mouse interaction
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
  requestAnimationFrame(animate);
  particles.rotation.x += mouse.y * 0.001;
  particles.rotation.y += mouse.x * 0.001;
  renderer.render(scene, camera);
}
```

### 3. Scroll-Driven Camera

Câmera se move pela cena conforme o scroll, cada seção = um ponto de vista.

```javascript
gsap.registerPlugin(ScrollTrigger);

const cameraPositions = [
  { x: 0, y: 0, z: 5 },    // Seção 1
  { x: 2, y: 1, z: 3 },    // Seção 2
  { x: -1, y: 2, z: 2 },   // Seção 3
  { x: 0, y: 0, z: 1 }     // Seção final
];

const sections = document.querySelectorAll('section');
sections.forEach((section, index) => {
  if (index >= cameraPositions.length) return;
  const pos = cameraPositions[index];

  gsap.to(camera.position, {
    scrollTrigger: {
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      scrub: true
    },
    x: pos.x,
    y: pos.y,
    z: pos.z,
    ease: 'none'
  });
});
```

### 4. React Three Fiber Setup

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function Scene() {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#00A8E8" metalness={0.5} roughness={0.2} />
    </mesh>
  );
}

function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Scene />
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="city" />
    </Canvas>
  );
}
```

---

## Micro-Interactions Premium

### Cursor Customizado

```css
.custom-cursor {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.15s ease, background 0.15s ease;
  mix-blend-mode: difference;
}
.custom-cursor.hovering {
  transform: scale(2.5);
  background: var(--color-accent);
  opacity: 0.3;
}
```

```javascript
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
  gsap.to(cursor, {
    x: e.clientX - 10,
    y: e.clientY - 10,
    duration: 0.15
  });
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});
```

### Magnetic Buttons

```javascript
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  });
});
```

### Text Reveal (SplitText Pattern)

```javascript
// Requer GSAP SplitText plugin
const title = new SplitText('.hero-title', { type: 'chars, words' });
gsap.from(title.chars, {
  scrollTrigger: {
    trigger: '.hero-title',
    start: 'top 80%'
  },
  y: 80,
  opacity: 0,
  rotateX: -90,
  stagger: 0.02,
  duration: 0.6,
  ease: 'back.out(1.7)'
});
```
