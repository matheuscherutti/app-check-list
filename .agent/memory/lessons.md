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
