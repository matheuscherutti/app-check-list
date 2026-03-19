# Biblioteca de Tipografia Premium

> **Pairings tipográficos curados por nicho.** Cada combinação foi validada em sites premiados e segue princípios de hierarquia, legibilidade e identidade de marca.

---

## Princípios Fundamentais

### 1. Máximo 2-3 famílias por projeto
A variação visual vem de **peso, tamanho e tracking** — não de acumular famílias diferentes.

### 2. Base de interface = Sans-serif moderna
80-90% do texto usa a sans escolhida. A serif/display entra apenas em títulos e branding.

### 3. Contraste cria hierarquia
| Papel | Tipo | Exemplo |
|-------|------|---------|
| **Display / Hero** | Serif alta-contraste ou Display bold | Bodoni Moda 700 |
| **Headings** | Sans bold ou Serif medium | Inter 600 |
| **Body** | Sans regular | Inter 400 |
| **Caption / UI** | Sans light ou regular | Inter 300-400 |

### 4. Escala tipográfica recomendada
```css
/* Ratio 1.25 (Major Third) — uso geral */
--text-xs:   0.64rem;   /* 10px */
--text-sm:   0.8rem;    /* 13px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.25rem;   /* 20px */
--text-xl:   1.563rem;  /* 25px */
--text-2xl:  1.953rem;  /* 31px */
--text-3xl:  2.441rem;  /* 39px */
--text-4xl:  3.052rem;  /* 49px */
--text-5xl:  3.815rem;  /* 61px — Hero */
```

---

## 1. Luxo (Quiet Luxury)

**Essência tipográfica:** Serif de alto contraste em títulos, sans discreta em corpo. Muito tracking, muito respiro.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Classic Luxe** | Cormorant Garamond 600 | Montserrat 300-400 | Elegante, editorial |
| **Modern Luxe** | Bodoni Moda 700 | Lato 300-400 | Alto contraste, fashion |
| **Heritage** | Cinzel 500-700 | Open Sans 300-400 | Clássico, atemporal |
| **Subtle Luxe** | Prata 400 | Avenir / Work Sans 300 | Discreto, espaçoso |
| **Editorial Luxe** | Playfair Display 700 | Inter 300-400 | Revista de luxo |

```css
/* Exemplo: Classic Luxe */
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Montserrat', system-ui, sans-serif;
  --letter-spacing-display: 0.05em;
  --letter-spacing-body: 0.01em;
  --line-height-display: 1.1;
  --line-height-body: 1.7;
}
```

---

## 2. Tecnologia / SaaS

**Essência tipográfica:** Sans-serif geométrica ou humanista dominando tudo. Legibilidade máxima, sem ornamentação.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Startup Clean** | Inter 600-700 | Inter 400 | Mono-família minimalista |
| **Dashboard Pro** | DM Sans 600-700 | DM Sans 400 | Compacta, data-friendly |
| **Tech Editorial** | GT Super / Space Grotesk 600 | Inter 400 | Títulos editoriais |
| **Modern SaaS** | Poppins 600-700 | Work Sans 400 | Friendly, acessível |
| **Clean Product** | Montserrat 600 | Open Sans 400 | Equilibrado, versátil |

```css
/* Exemplo: Startup Clean */
:root {
  --font-display: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-weight-display: 700;
  --font-weight-body: 400;
  --letter-spacing-display: -0.02em;
  --line-height-body: 1.6;
}
```

---

## 3. Wellness / Saúde

**Essência tipográfica:** Sans humanista suave para corpo, serif orgânica ou sans rounded para títulos. Feeling natural e acolhedor.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Serene** | Cormorant Garamond 500 | Lato 300-400 | Spa sofisticado |
| **Natural** | Alegreya 600 | Open Sans 400 | Orgânico, editorial |
| **Clean Wellness** | Montserrat 500-600 | Nunito Sans 400 | Moderno, clean |
| **Zen** | Josefin Sans 300-400 | Work Sans 300-400 | Minimalista, airoso |
| **Botanical** | Lora 500 | Inter 400 | Warm, confiável |

```css
/* Exemplo: Serene */
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Lato', system-ui, sans-serif;
  --font-weight-display: 500;
  --letter-spacing-display: 0.03em;
  --line-height-body: 1.75;
}
```

---

## 4. Criativo / Moderno

**Essência tipográfica:** Display bold, geométrica ou experimental em títulos. Sans limpa no corpo. Alto impacto visual.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Bold Studio** | Space Grotesk 700 | DM Sans 400 | Geométrico, arrojado |
| **Creative Night** | Syne 700-800 | Inter 400 | Experimental, energético |
| **Pop Portfolio** | Poppins 700-800 | Work Sans 400 | Vibrante, acessível |
| **Art Display** | Clash Display 600 | Satoshi 400 | Statement, impactante |
| **Neon Studio** | Outfit 700 | Outfit 400 | Mono-família com range |

```css
/* Exemplo: Bold Studio */
:root {
  --font-display: 'Space Grotesk', monospace, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-weight-display: 700;
  --letter-spacing-display: -0.03em;
  --line-height-display: 1.0;
}
```

---

## 5. Finanças / Investimentos

**Essência tipográfica:** Sans neutra e sóbria como base total. Serif discreta apenas para seriedade em títulos institucionais.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Executive** | Roboto 500-700 | Roboto 400 | Corporativo, confiável |
| **Trust** | Merriweather 700 | Open Sans 400 | Institucional, sério |
| **Fintech Modern** | Inter 600-700 | Inter 400 | Tech-forward |
| **Capital** | PT Serif 700 | PT Sans 400 | Clássico-moderno |
| **Ledger** | Georgia 700 | Lato 400 | Tradicional, sólido |

```css
/* Exemplo: Trust */
:root {
  --font-display: 'Merriweather', Georgia, serif;
  --font-body: 'Open Sans', system-ui, sans-serif;
  --font-weight-display: 700;
  --line-height-body: 1.6;
}
```

---

## 6. Educação / Cursos Online

**Essência tipográfica:** Acessível e confiável. Sans friendly para UI, serif legível para conteúdo denso.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Campus** | Poppins 600-700 | Open Sans 400 | Jovem, acessível |
| **Knowledge** | Montserrat 600 | Merriweather 400 | Editorial, creditável |
| **Study** | Inter 600-700 | Inter 400 | Clean, focado |
| **Academy** | Lora 600 | Lato 400 | Confiável, tradicional |
| **Pastel** | Nunito 700 | Nunito Sans 400 | Suave, inclusivo |

---

## 7. Gastronomia Gourmet

**Essência tipográfica:** Serif elegante para títulos (sensação de menu), sans discreta para corpo. Scripts apenas em detalhes.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Fine Dining** | Cormorant Garamond 600 | Lato 300-400 | Sofisticado, editorial |
| **Bistro** | Playfair Display 700 | Open Sans 400 | Clássico, acolhedor |
| **Gourmet** | Cinzel 500 | Montserrat 300-400 | Premium, estruturado |
| **Rustic** | Lora 600 | Work Sans 400 | Orgânico, artesanal |
| **Modern Chef** | DM Serif Display 400 | DM Sans 400 | Contemporâneo, clean |

---

## 8. Moda / Beleza / Skincare

**Essência tipográfica:** Serif alto-contraste ou script refinada em display. Feminino e sofisticado com sans neutra no corpo.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Haute Couture** | Bodoni Moda 700 | Montserrat 300 | Alto contraste, fashion |
| **Clean Beauty** | Cormorant Garamond 500 | Lato 300-400 | Elegante, natural |
| **Rose Gold** | Antic Didone 400 | Open Sans 300-400 | Didone, feminino |
| **Skincare** | Josefin Sans 300-400 | Roboto 300-400 | Minimalista, clean |
| **Vanity** | Playfair Display 700 | Poppins 300-400 | Editorial de moda |

```css
/* Exemplo: Haute Couture */
:root {
  --font-display: 'Bodoni Moda', 'Didot', serif;
  --font-body: 'Montserrat', system-ui, sans-serif;
  --font-weight-display: 700;
  --font-weight-body: 300;
  --letter-spacing-display: 0.08em;
  --text-transform-display: uppercase;
}
```

---

## 9. Arquitetura / Interiores

**Essência tipográfica:** Minimalista, estruturada. Sans geométrica com muito respiro. Serif apenas para sofisticação pontual.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Studio** | Work Sans 500-600 | Work Sans 300-400 | Minimalista, limpo |
| **Concrete** | Montserrat 600 | Open Sans 400 | Sólido, profissional |
| **Gallery** | Inter 600 | Inter 400 | Galeria, neutro |
| **Blueprint** | Space Grotesk 500-600 | DM Sans 400 | Técnico moderno |
| **Interior** | Cormorant Garamond 500 | Lato 300 | Sofisticado, refinado |

---

## 10. Sustentabilidade / Eco

**Essência tipográfica:** Humanista, friendly, natural. Sans com personality (Nunito, Lato) e serif orgânica para títulos.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Botanical** | Alegreya 600 | Nunito Sans 400 | Orgânico, editorial |
| **Clean Energy** | Montserrat 600 | Open Sans 400 | Moderno, responsável |
| **Eco SaaS** | Inter 600-700 | Inter 400 | Tech verde |
| **Garden** | Lora 500 | Lato 400 | Natural, warm |
| **Earth** | Josefin Sans 400 | Work Sans 300-400 | Minimalista, natural |

---

## 11. Hotelaria & Turismo

**Essência tipográfica:** Open Sans como base universal. Serif editorial em títulos para aspiração. Scripts com muita parcimônia.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Resort** | Canela / Lora 500 | Open Sans 400 | Aspiracional, luxuoso |
| **Boutique** | Cormorant Garamond 600 | Work Sans 300-400 | Intimista, elegante |
| **Urban Hotel** | Poppins 600 | Open Sans 400 | Moderno, acessível |
| **Mountain** | Merriweather 700 | Lato 400 | Rústico sofisticado |
| **Coastal** | Josefin Sans 300 | Heebo 300-400 | Leve, airoso |

---

## 12. Jurídico / Consultoria B2B

**Essência tipográfica:** Máxima sobriedade. Sans neutra em quase tudo. Georgia/Merriweather para seriedade institucional.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Law Firm** | Georgia 700 | Open Sans 400 | Tradicional, sério |
| **Consulting** | Roboto 500-700 | Roboto 400 | Corporativo, clean |
| **Advisory** | PT Serif 700 | PT Sans 400 | Clássico-moderno |
| **Corporate** | Merriweather 700 | Lato 400 | Institucional |
| **Boardroom** | Inter 600 | Inter 400 | Moderno B2B |

---

## 13. Games / eSports

**Essência tipográfica:** Sans geométrica bold para impacto. Display condensada ou wide para branding. Zero serifs.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **eSports** | Rajdhani 700 | Inter 400 | Competitive, tech |
| **Cyber** | Orbitron 700-900 | DM Sans 400 | Futurista, sci-fi |
| **Arcade** | Press Start 2P 400 | Poppins 400 | Retro, pixelado |
| **Pro Team** | Montserrat 800-900 | Montserrat 400 | Bold, impactante |
| **Dark Mode** | Space Grotesk 700 | Work Sans 400 | Tech gaming |

---

## 14. Infantil Premium

**Essência tipográfica:** Rounded, suave, lúdica mas controlada. Sem exageros — sofisticação para pais, diversão para crianças.

| Pairing | Display / Títulos | Corpo / Interface | Estilo |
|---------|-------------------|-------------------|--------|
| **Pastel** | Nunito 700-800 | Nunito Sans 400 | Suave, rounded |
| **Playful** | Fredoka One 400 | Open Sans 400 | Lúdico controlado |
| **Montessori** | Josefin Sans 400-600 | Work Sans 400 | Limpo, pedagógico |
| **Baby** | Poppins 600-700 | Lato 400 | Moderno, premium |
| **Soft** | Comfortaa 500-700 | DM Sans 400 | Minimal rounded |

---

## Referência Rápida: Google Fonts por Papel

### Sans-Serif (Interface / Corpo)
| Fonte | Personality | Melhor para |
|-------|------------|-------------|
| **Inter** | Neutra, técnica | SaaS, tech, dashboards |
| **DM Sans** | Compacta, geométrica | Dados, apps, UI densa |
| **Work Sans** | Equilibrada, profissional | Corporate, B2B |
| **Open Sans** | Amigável, universal | Hotelaria, e-commerce, geral |
| **Lato** | Humanista, warm | Wellness, educação, e-commerce |
| **Montserrat** | Geométrica, versátil | Moda, luxo acessível |
| **Poppins** | Geométrica, friendly | Startups, educação |
| **Roboto** | Neutra, mecânica | Android, B2B, corporativo |
| **Nunito Sans** | Rounded, suave | Kids, wellness, friendly |

### Serif (Display / Títulos)
| Fonte | Personality | Melhor para |
|-------|------------|-------------|
| **Cormorant Garamond** | Elegante, editorial | Luxo, gastronomia, hotelaria |
| **Bodoni Moda** | Alto contraste, fashion | Moda, beleza, luxury brands |
| **Playfair Display** | Editorial, clássica | Revistas, blogs premium |
| **Cinzel** | Monumental, atemporal | Luxo clássico, joias, heritage |
| **Lora** | Warm, equilibrada | Editorial, sustentabilidade |
| **Merriweather** | Legível, densa | Blogs, finanças, educação |
| **Alegreya** | Humanista, orgânica | Wellness, editorial, eco |
| **Georgia** | Clássica, web-native | Corporativo, jurídico |
| **DM Serif Display** | Moderna, sharp | Gastronomia, moderno |
