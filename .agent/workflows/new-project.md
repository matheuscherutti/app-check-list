---
description: Roteiro para iniciar um Novo Projeto usando esta base de inteligência
---

# 🚀 Fluxo de Criação de Novo Projeto

Este workflow guia o usuário na criação de um novo repositório ou pasta de projeto, importando toda a "Equipe Profissional" (arquivos `.agent/`) desta base.

## 🛠️ Fase 1: Preparação do Terreno
O agente deve perguntar os seguintes pontos estratégicos:
1. "Qual o nome do novo projeto?"
2. "A ideia do projeto já está clara ou quer usar o `/brainstorm` primeiro?"
3. "Você já criou a pasta no seu computador onde quer salvar os arquivos?"

## 📦 Fase 2: Linkagem da Inteligência (Exportação do Kit)
O agente deve explicar que para o novo projeto ter a mesma inteligência, você precisa copiar o "cérebro" do kit:

1. **Copiar a pasta `.agent/`**: O agente deve fornecer o comando correto baseado no sistema operacional (Windows/PowerShell):
   ```powershell
   Copy-Item -Path "c:\Users\ferna\Desktop\IA Project\antigravity-kit-personalizado\.agent" -Destination "C:\Caminho\Para\Seu\Novo-Projeto\.agent" -Recurse -Force
   ```
2. **Copiar os arquivos base** (se necessário): Como `.gitignore`, `README.md` (modelo), etc.

## 🏥 Fase 3: Batismo e Verificação
Assim que os arquivos forem copiados para a nova pasta:
1. Peça ao usuário para abrir o novo projeto no Editor (VS Code/Cursor).
2. O agente deve rodar no novo local:
   ```bash
   python .agent/scripts/doctor.py
   ```
3. Se o `doctor.py` passar (✅), o kit está "vivo" e pronto para trabalhar no novo projeto.

## 👥 Fase 4: Definindo os Membros da Equipe
Pergunte ao usuário:
"Quem você quer que eu seja neste novo projeto hoje? 
- **Tech Lead** (para planejar a estrutura segura)
- **Product Owner** (para definir as funcionalidades prioritárias)
- **Designer** (para focar na interface visual premium)"

---

### Dica para o Agente:
Mantenha a conversa focada nos **resultados de negócio** e não na estrutura de pastas. Sempre use o `doctor.py` para garantir que o usuário não esqueceu nada importante no processo de cópia.
