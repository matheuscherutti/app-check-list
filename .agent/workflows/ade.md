---
description: ADE Pipeline Autônomo — transforma uma descrição em código funcional via pipeline multi-agente supervisionado (Req → Spec → Critique → Execution → QA → Memory)
---

# /ade - Autonomous Development Engine Pipeline

$ARGUMENTS

---

## 🔴 REGRAS CRÍTICAS

1. **SOCRATIC GATE REDUZIDO** — diferente do /plan padrão, o /ade faz apenas 1-2 perguntas essenciais
2. **PIPELINE SEQUENCIAL** — cada fase deve completar antes da próxima iniciar
3. **HUMAN-IN-THE-LOOP na fase 3** — o usuário aprova a spec antes da execução
4. **MEMORY OBRIGATÓRIA** — toda execução deve registrar aprendizados em `.agent/memory/`

---

## Pipeline: 6 Fases

```
$ARGUMENTS
    │
    ▼
[F1] DISCOVERY (@project-planner)
    │  → Entende o contexto, escopo, dependências
    │  → 1 pergunta máxima ao usuário
    ▼
[F2] SPEC (@backend-specialist | @frontend-specialist)
    │  → Cria spec técnica detalhada
    │  → Define: arquivos a criar, modificar, dependências
    ▼
[F3] CRITIQUE (@qa-automation-engineer)
    │  → Revisa a spec → aponta lacunas, riscos, edge cases
    │  → ⚠️ PAUSA: mostra spec revisada ao usuário para aprovação
    ▼
[F4] EXECUTION (@orchestrator → multi-agent)
    │  → Divide em subtasks paralelas/sequenciais
    │  → Implementa com zero-break garantido
    ▼
[F5] QA REVIEW (@test-engineer)
    │  → Valida output: testes passam, sem regressão
    │  → Roda `python .agent/scripts/checklist.py .`
    ▼
[F6] MEMORY (@project-planner)
       → Registra padrões em `.agent/memory/lessons.md`
       → Registra pitfalls em `.agent/memory/gotchas.md`
```

---

## Fase 1: Discovery

**Agent:** `@project-planner`
**Skill:** `brainstorming` + `plan-writing`

```
Ação: Analisar o pedido em $ARGUMENTS e identificar:
1. Domínio principal (web, backend, mobile, kit, infra)
2. Arquivos impactados (existentes ou novos)
3. Dependências do kit (.agent/ refs, imports)
4. Escopo (pequeno <30min | médio <2h | grande >2h)

Se escopo for "grande" → dividir em sub-ADEs e perguntar ao usuário.
Fazer no máximo 1 pergunta de clarificação se necessário.
```

**Output:** `[ADE] Discovery completo. Scope: {small|medium|large}. Iniciando spec...`

---

## Fase 2: Spec Técnica

**Agent:** `@backend-specialist` (backend/infra) ou `@frontend-specialist` (UI/UX)
**Skill:** `clean-code` + skill específica do domínio

A spec deve conter:

```markdown
## ADE Spec: {nome da feature}

### Arquivos a criar
- `caminho/arquivo.ext` — propósito

### Arquivos a modificar
- `caminho/arquivo.ext` — linha X: o que muda e por quê

### Dependências
- imports necessários, versões de libs

### Critério de sucesso
- [ ] Teste A passa
- [ ] Comportamento B funciona
- [ ] Nenhum arquivo existente quebrado
```

---

## Fase 3: Critique + Aprovação do Usuário

**Agent:** `@qa-automation-engineer`
**Skill:** `testing-patterns` + `systematic-debugging`

```
Ação: Revisar a spec da Fase 2 e identificar:
- Edge cases não cobertos
- Arquivos impactados que foram esquecidos
- Riscos de rollback
- Testes ausentes
```

**⚠️ PAUSA OBRIGATÓRIA:** Apresentar spec revisada ao usuário com:

```
[ADE] Spec pronta para execução:
{spec revisada}

Riscos identificados:
- {risco 1}
- {risco 2}

▶ Confirme para iniciar execução, ou peça ajustes.
```

> 🔴 NÃO prosseguir para Fase 4 sem confirmação explícita.

---

## Fase 4: Execution

**Agent:** `@orchestrator`
**Delegação:** skills específicas por subtask

```
Protocolo de execução:
1. Criar arquivos novos primeiro (nunca modificar existentes antes)
2. Modificar arquivos existentes com edições cirúrgicas (multi_replace)
3. Verificar zero-break após cada arquivo modificado
4. Se qualquer arquivo quebrar → ROLLBACK imediato dessa subtask
```

**Durante execução, reportar progresso:**
```
[ADE] ✅ {arquivo} criado/modificado
[ADE] ⚡ Executando: {próximo passo}
```

---

## Fase 5: QA Review

**Agent:** `@test-engineer`
**Skill:** `testing-patterns` + `webapp-testing`

```bash
# Passo 1: Verificar kit integridade (se .agent/ foi modificado)
python -m pytest .agent/tests/test_kit_integrity.py -v

# Passo 2: Checklist geral
python .agent/scripts/checklist.py .

# Passo 3: Testes do projeto (se existirem)
npm test 2>/dev/null || python -m pytest . 2>/dev/null || echo "No tests configured"
```

**Se falhar:** `@debugger` é invocado automaticamente para investigar e corrigir.

---

## Fase 6: Memory

**Agent:** `@project-planner`

Registrar em `.agent/memory/lessons.md`:

```markdown
## {DATA} — {Nome da Feature}
**Padrão identificado:** {O que funcionou bem}
**Pitfall evitado:** {O que não fazer}
**Contexto:** {Quando aplicar este padrão}
**Arquivos chave:** {lista}
```

Registrar em `.agent/memory/gotchas.md` se houver problemas encontrados:

```markdown
## {DATA} — {Nome do Problema}
**Sintoma:** {O que aconteceu}
**Causa raiz:** {Por que aconteceu}
**Solução:** {Como foi resolvido}
```

---

## Output Final

```
[ADE] ✅ Pipeline completo

Entregue:
- {lista de arquivos criados/modificados}

QA:
- Kit integrity: ✅
- Checklist: ✅

Memory: atualizada em .agent/memory/lessons.md

Próximos passos sugeridos:
- {sugestão 1}
```

---

## Exemplos de uso

```
/ade adicione uma nova skill chamada data-analysis ao kit
/ade crie o test_kit_integrity.py conforme o plano aios-integration.md
/ade implemente o doctor.py para diagnóstico do kit
/ade refatore o intelligent-routing para incluir roteamento para /ade e /doctor
```
