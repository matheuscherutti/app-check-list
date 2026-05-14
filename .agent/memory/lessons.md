# Lessons Learned — Antigravity Kit

> Padrões identificados durante o desenvolvimento. Consulte antes de iniciar uma task complexa.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — [Feature/Task Name]
**Padrão identificado:** O que funcionou bem (reutilizável)
**Pitfall evitado:** O que não fazer / armadilha identificada
**Contexto:** Quando aplicar este padrão
**Arquivos chave:** lista de arquivos relevantes
```

---

## 2026-03-03 — AIOS Integration Planning

**Padrão identificado:** Ao integrar novos scripts/workflows ao kit, atualizar SEMPRE os 4 arquivos de configuração do agente em sequência: GEMINI.md → ARCHITECTURE.md → intelligent-routing → workflow file.
**Pitfall evitado:** Criar novos scripts sem registrá-los no GEMINI.md faz o agente não saber que existem.
**Contexto:** Toda vez que um novo script master, workflow ou skill for adicionado ao kit.
**Arquivos chave:** `.agent/rules/GEMINI.md`, `.agent/ARCHITECTURE.md`, `.agent/skills/intelligent-routing/SKILL.md`

## 2026-03-06 — Premium Design Agent (Skills Locais)

**Padrão identificado:** Skills complexas devem ser organizadas em múltiplos arquivos: SKILL.md (instruções) + reference files (dados). O SKILL.md contém a tabela de referências internas com prioridade (🔴 Obrigatório / 🟡 Sob demanda). Exemplo: premium-design-orchestrator tem SKILL.md + palette-library.md + design-references.md.
**Pitfall evitado:** Skills Globais (`~/.gemini/antigravity/skills/`) NÃO são versionadas no Git. Para projetos compartilháveis, usar Skills Locais (`.agent/skills/`). A portabilidade exige que tudo relevante esteja dentro do repositório.
**Contexto:** Toda vez que precisar criar skills reutilizáveis e compartilháveis entre projetos e equipes.
**Arquivos chave:** `.agent/skills/premium-design-orchestrator/`, `.agent/skills/brand-identity-extractor/`, `.agent/skills/premium-tech-stack/`

## 2026-04-04 — Subtask Drag-and-Drop Reordering

**Padrão identificado:** Utilização do `@dnd-kit/sortable` de forma aninhada para subtarefas, empregando um "drag handle" exclusivo (ícone dedicado) para garantir que apenas a intenção de mover a subtarefa seja capturada.
**Pitfall evitado:** Evitar que a área interativa do item filho conflite com a área interativa do item pai (Cartão). O handle exclusivo isola os eventos.
**Contexto:** Ao implementar reordenação de itens (ex: checklist) dentro de "conteineres" que também são arrastáveis (ex: cartões em Kanban).
**Arquivos chave:** `src/components/kanban/SortableSubtaskItem.tsx`, `src/components/kanban/CardItem.tsx`, `src/pages/Board.tsx`
