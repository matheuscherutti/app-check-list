# Gotchas & Armadilhas — Antigravity Kit

> Erros comuns e como evitá-los. Consulte antes de iniciar desenvolvimento.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — [Nome do Problema]
**Sintoma:** O que aconteceu / como se manifesta
**Causa raiz:** Por que aconteceu
**Solução:** Como foi resolvido
**Prevenção:** Como evitar que aconteça de novo
```

---

## 2026-03-03 — GEMINI.md não refletia novos scripts

**Sintoma:** Agente não invocava `doctor.py` ou `/ade` automaticamente mesmo após implementação.
**Causa raiz:** Arquivos foram criados no filesystem mas não registrados no `GEMINI.md` (Request Classifier + Scripts table + Quick Reference).
**Solução:** Atualizar as 4 seções de GEMINI.md + ARCHITECTURE.md + intelligent-routing.
**Prevenção:** Usar o `/ade` workflow para qualquer nova adição ao kit — ele inclui fase de Memory Registration.

---

## Regra Geral: ZeroDivisionError em checklist.py

**Sintoma:** `checklist.py` falha na linha ~232 com `ZeroDivisionError`.
**Causa raiz:** Dicionário `scores` está vazio quando nenhum check retorna resultado.
**Solução:** Adicionar guard `if max_val > 0` antes de calcular percentual.
**Prevenção:** Sempre rodar `doctor.py` antes de `checklist.py` para validar que o ambiente está correto.
