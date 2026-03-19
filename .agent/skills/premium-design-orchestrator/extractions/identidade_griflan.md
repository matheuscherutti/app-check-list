---
name: identidade-griflan
description: Identidade visual extraída de griflan.com (Awwwards SOTD)
source: https://griflan.com
extracted: 2026-03-06
niche: Criativo / Moderno
---

# Identidade Visual — Griflan

> Creative Agency for Bold Brands & Digital Design. Agência B2B premium com estética de luxo moderno.

---

## Paleta de Cores

| Papel | Cor | Hex | Uso |
|-------|-----|-----|-----|
| Primary Background | Charcoal profundo | `#0E0E0E` | Fundo principal (hero, seções escuras) |
| Secondary Background | Cream quente | `#F4F4F0` | Seções claras, alternância de ritmo |
| Accent / CTA | Vermelho vibrante | `#FF3B30` | Botões CTA ("Let's Connect"), destaques |
| Text on Dark | Cream claro | `#F4F4F0` | Texto sobre fundo escuro |
| Text on Light | Charcoal | `#0E0E0E` | Texto sobre fundo claro |

### CSS Custom Properties

```css
:root {
  --color-bg-primary: #0E0E0E;
  --color-bg-secondary: #F4F4F0;
  --color-text-primary: #F4F4F0;
  --color-text-secondary: #0E0E0E;
  --color-accent: #FF3B30;
  --color-accent-hover: #E6342B;
  --color-muted: #6B6B6B;
  --color-border: rgba(244, 244, 240, 0.15);
}
```

---

## Tipografia

| Papel | Fonte | Peso | Observação |
|-------|-------|------|-----------|
| Display / Hero | Serif alto-contraste (Didone-like) | 400-700 | Letras com terminais afiados, elegante |
| Script de destaque | Script estilizada | 400 | Usada em "awesome sauce" — toque de personalidade |
| Nav / Body / UI | Sans-serif geométrica | 300-500 | Limpa, legível, moderna |

### CSS Typography

```css
:root {
  --font-display: 'Cormorant Garamond', 'Didot', Georgia, serif;
  --font-accent: 'Playfair Display', cursive;
  --font-body: 'DM Sans', 'Inter', system-ui, sans-serif;
  --font-size-base: 16px;
  --font-size-hero: clamp(3rem, 6vw, 5rem);
  --line-height-body: 1.6;
  --line-height-display: 1.1;
  --letter-spacing-display: -0.01em;
  --letter-spacing-nav: 0.02em;
}
```

---

## Espaçamento

```css
:root {
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 8rem;
  --space-2xl: 12rem;
}
```

> Nota: o site usa espaçamento MUITO generoso, especialmente entre seções. Respiro extremo = sensação de luxo.

---

## Efeitos e Bordas

```css
:root {
  --border-radius-sm: 0;
  --border-radius-md: 4px;
  --border-radius-lg: 8px;
  --border-radius-pill: 100px;  /* Usado nos CTAs "Let's Connect" */
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}
```

> Nota: o site quase NÃO usa border-radius nos containers e cards — estética reta, editorial. O CTA vermelho usa pill shape para destaque.

---

## Diretrizes de Animação

- **Estilo de easing:** ease-out / power2.out
- **Duração base:** 400-600ms para reveals
- **Scroll effects:** Sim — reveal suave de texto (translate Y + opacity)
- **Alternância de blocos:** Dark ↔ Cream durante scroll — criando ritmo visual
- **Hover states:** Scale + opacity em project cards, com video preview
- **Transições de página:** Fluidas, integradas ao scroll
- **Cursor:** Sem cursor customizado (abordagem clean)

---

## Layout

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | Boutique Grid — assimétrico, "airoso" |
| **Whitespace** | Extremamente generoso — luxury vibes |
| **Hierarquia** | Hero serif grande → stats → trabalhos → footer |
| **Alternância** | Black ↔ cream blocks criam ritmo e narrativa |
| **Cards** | Tamanhos variados, posições offset |

---

## Essência

> **"Luxo moderno criativo"** — A combinação de serif editor alto-contraste sobre fundo escuro com alternância para cream quente cria uma experiência de galeria de arte. O vermelho CTA é usado com extrema parcimônia, o que amplifica seu impacto. O site respira confiança, craft e sofisticação sem ser pretensioso.
