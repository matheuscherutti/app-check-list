---
name: premium-tech-stack
description: Engenheiro de Front-end focado em Experiências Imersivas e Animações de Alta Performance. Implementa os 5 Pilares Premium obrigatórios para sites dignos de premiação. Também triggers em "animações premium", "GSAP", "Three.js", "scroll suave", "transições de página", "experiência imersiva", "5 pilares".
version: 1.0.0
---

# Premium Tech Stack — Os 5 Pilares Premium

> **Todo código de design premium DEVE conter os 5 Pilares abaixo.** Sites sem esses elementos NÃO atingem nível de premiação.

---

## Referências Internas

| Arquivo | Prioridade | Conteúdo |
|---------|-----------|----------|
| [animation-patterns.md](animation-patterns.md) | 🔴 Obrigatório | Código de implementação GSAP, Swup, Three.js |

---

## Os 5 Pilares Mandatórios

### Pilar 1: GSAP (GreenSock Animation Platform)

**Obrigatório para:** Animações de entrada sequenciais, interativas, e scroll-driven.

| Plugin | Uso | Obrigatório? |
|--------|-----|-------------|
| **ScrollTrigger** | Animações ligadas ao scroll | ✅ Sim |
| **SplitText** | Animação de texto letra a letra | 🟡 Quando há títulos grandes |
| **Flip** | Transições de estado (layout shift) | 🟡 Quando há mudança de layout |
| **MotionPath** | Animação ao longo de um caminho | ⚪ Quando necessário |

**Regras:**
- ❌ **Nunca** use animações CSS puras se houver complexidade de timeline
- ✅ **Sempre** use `gsap.context()` para limpeza de memória em frameworks React/Next
- ✅ **Sempre** estruture animações em timelines, não em chamadas soltas
- ✅ **Sempre** use `scrub: true` no ScrollTrigger para sincronizar com scroll

---

### Pilar 2: ScrollSmoother / Lenis

**Obrigatório para:** Scroll suave com inércia, sem travamentos.

| Opção | Quando usar |
|-------|-------------|
| **ScrollSmoother (GSAP)** | Projetos com GSAP pesado — integração nativa com ScrollTrigger |
| **Lenis** | Projetos que querem scroll suave sem dependência do GSAP |

**Regras:**
- ✅ O scroll da página DEVE ter inércia suave
- ✅ O scroll NÃO pode travar ou pular em nenhum dispositivo
- ❌ **Nunca** deixe o scroll nativo do browser sem suavização
- ✅ **Sempre** teste em mobile — scroll suave não pode consumir performance

---

### Pilar 3: SWUP (ou Barba.js)

**Obrigatório para:** Transições de página fluidas, sem "piscar" branco.

| Opção | Quando usar |
|-------|-------------|
| **Swup** | Projetos multi-página com HTML/JS puro ou frameworks leves |
| **Barba.js** | Alternativa para projetos que precisam de transições mais customizadas |
| **View Transitions API** | Projetos modernos que podem usar a API nativa do browser |

**Regras:**
- ✅ A navegação entre páginas DEVE ser fluida, estilo SPA
- ❌ **Nunca** permita o "piscar" branco de recarregamento
- ✅ **Sempre** mantenha elementos persistentes (nav, cursor, áudio) entre páginas
- ✅ **Sempre** use overlays ou crossfades para transições

**Padrões de transição premium:**
- Fade crossfade (mais simples)
- Wipe horizontal/vertical
- Scale + fade
- Slide direcional (esquerda→direita baseado na navegação)
- Mudança de cor de background sincronizada

---

### Pilar 4: Motion (Truque dos 30KB)

**Obrigatório para:** Vídeos de fundo com performance otimizada.

**Técnica:** Exiba primeiro o frame inicial do vídeo como imagem estática otimizada para SEO e LCP (Largest Contentful Paint). O vídeo carrega dinamicamente por trás e substitui a imagem quando estiver pronto.

**Regras:**
- ✅ **Sempre** tenha uma imagem poster otimizada (<30KB, WebP)
- ✅ **Sempre** use `loading="lazy"` e `preload="none"` no vídeo
- ✅ **Sempre** otimize o vídeo: codec H.265/VP9, resolução max 1080p, bitrate controlado
- ❌ **Nunca** inicie autoplay de vídeo sem a imagem poster visível primeiro
- ✅ Considere usar `<picture>` com fallback para mobile (imagem estática em telas <768px)

**Implementação conceitual:**
```html
<!-- Imagem poster (carrega primeiro, boa para SEO/LCP) -->
<div class="hero-video-wrapper">
  <img src="poster.webp" alt="Hero" class="hero-poster" />
  <video autoplay muted loop playsinline preload="none" class="hero-video">
    <source src="hero.mp4" type="video/mp4" />
  </video>
</div>
```

```css
.hero-video-wrapper { position: relative; overflow: hidden; }
.hero-poster { width: 100%; height: 100vh; object-fit: cover; }
.hero-video {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%; object-fit: cover;
  opacity: 0; transition: opacity 0.5s ease;
}
.hero-video.loaded { opacity: 1; }
```

```javascript
const video = document.querySelector('.hero-video');
video.addEventListener('canplaythrough', () => {
  video.classList.add('loaded');
});
```

---

### Pilar 5: Three.js / WebGL

**Obrigatório para:** Seções Hero, fundos interativos, ou experiências 3D.

| Opção | Quando usar |
|-------|-------------|
| **Three.js puro** | Controle total, projetos vanilla JS |
| **React Three Fiber** | Projetos React/Next.js |
| **Spline** | Prototipagem rápida, designs 3D sem código pesado |

**Níveis de complexidade:**

| Nível | Exemplo | Quando usar |
|-------|---------|-------------|
| **Básico** | Partículas que reagem ao mouse | Hero backgrounds |
| **Médio** | Objeto 3D rotacionando com scroll | Product showcase |
| **Avançado** | Cena navegável com câmera fly-through | Experiências imersivas |

**Regras:**
- ✅ **Sempre** otimize o renderer: `antialias: true`, pixel ratio limitado a 2
- ✅ **Sempre** implemente fallback para mobile (imagem estática ou animação simplificada)
- ✅ **Sempre** use `requestAnimationFrame` controlado (pausar quando não visível)
- ❌ **Nunca** carregue modelos 3D pesados sem lazy loading
- ✅ Considere `IntersectionObserver` para iniciar cenas 3D apenas quando visíveis

---

## Regras Globais de Código

### Modularização Obrigatória

```javascript
// ✅ CORRETO: animações isoladas em contexto GSAP
useEffect(() => {
  const ctx = gsap.context(() => {
    // todas as animações dentro do contexto
    gsap.from(".hero-title", { y: 100, opacity: 0, duration: 1 });
    gsap.from(".hero-subtitle", { y: 50, opacity: 0, delay: 0.3 });
  }, containerRef); // scope ao container

  return () => ctx.revert(); // cleanup ao desmontar
}, []);

// ❌ ERRADO: animações soltas sem contexto
gsap.from(".hero-title", { y: 100, opacity: 0 });
```

### Performance First

| Regra | Detalhe |
|-------|---------|
| Limitar animações pesadas | Apenas em seções específicas, não em toda a página |
| Reduzir efeitos em mobile | `matchMedia` ou `gsap.matchMedia()` para desativar 3D |
| Timelines bem estruturadas | Evitar múltiplas animações soltas — usar timeline |
| Lazy loading de assets 3D | Modelos GLTF/GLB sob demanda, não no carregamento |

### Coerência Visual

| Aspecto | Regra |
|---------|-------|
| **Easing** | Consistente em todo o site — escolha UM estilo de easing |
| **Duração** | Base de 400-600ms para transições, 800-1200ms para reveals |
| **Direção** | Manter consistência (se texto entra da esquerda, manter) |
| **Narrativa** | Animação REFORÇA a narrativa, nunca é decorativa |

---

## Boas Práticas de Sites Premiados

1. **Foco primeiro na animação "pura"**, depois conecte ao scroll
2. **Micro-interactions abundantes mas sutis**: hover states, cursor customizado, feedback visual
3. **Transições de página como extensão da identidade**: cor, direção, velocidade
4. **Scroll effects vinculados ao storytelling**: cada seção conta parte da história
5. **Performance em mobile**: reduzir complexidade 3D, manter scroll suave
6. **Consistência de ritmo**: mesma linguagem de motion do começo ao fim
