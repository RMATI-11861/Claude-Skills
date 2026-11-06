# Claude-Skills

Skills, regras e instruções para o Claude Code resolver cada tipo de tarefa do jeito mais eficaz, gastando o mínimo de tokens e entregando código limpo. As skills seguem o padrão aberto do [skills.sh](https://skills.sh), então também instalam em Cursor, Codex e outros agentes.

## Como funciona

Uma skill só entra no contexto quando é chamada. Por isso a economia e o padrão de código vêm em quatro camadas, cada regra em um único lugar:

| Camada | Onde fica | Quando age | O que faz |
|---|---|---|---|
| Estilo Concise | `"outputStyle": "Concise"` no `~/.claude/settings.json` | Sempre | Resposta primeiro, sem preâmbulo nem recapitulação |
| Bloco global | `~/.claude/CLAUDE.md` | Sempre | Economia de ferramentas, código limpo, segurança, critério de pronto |
| Regras por arquivo | `~/.claude/rules/*.md` | Ao tocar `.ps1`, testes, SQL ou workflows de CI | Regras daquele tipo de arquivo, custo zero fora disso |
| Skill `lean-code` | `/lean-code` | Sob demanda | Modo estrito, checklist antes de entregar, auditoria de custo |

## Catálogo

| Skill | Use quando | Chamada |
|---|---|---|
| `lean-code` | Quiser o mínimo de tokens, revisar a entrega ou auditar o custo | `/lean-code`, `/lean-code ultra`, `/lean-code gate`, `/lean-code audit` |
| `debugging` | Houver bug, erro, crash, teste instável ou CI quebrado | automática ou `/debugging` |
| `writing-tests` | Precisar criar ou refazer testes, TDD ou cobertura | automática ou `/writing-tests` |
| `building-features` | A funcionalidade mexer em vários arquivos | automática ou `/building-features` |
| `refactoring` | For reestruturar código além do diff atual sem mudar comportamento | automática ou `/refactoring` |
| `git-recovery` | Houver conflito, commit errado, trabalho perdido ou segredo vazado | automática ou `/git-recovery` |
| `performance-tuning` | Algo estiver lento ou gastando memória ou CPU | automática ou `/performance-tuning` |
| `http-apis` | For projetar uma API HTTP ou um cliente de API | automática ou `/http-apis` |
| `sql-and-migrations` | Houver mudança de schema, migration ou SQL lento | automática ou `/sql-and-migrations` |
| `automation-scripts` | For escrever script PowerShell, Bash ou Node, tarefa agendada ou workflow de CI | automática ou `/automation-scripts` |
| `data-analysis` | Quiser respostas a partir de CSV, Excel, JSON, logs ou SQL | automática ou `/data-analysis` |
| `repo-docs` | For escrever README, CHANGELOG, ADR ou docstrings do repositório | automática ou `/repo-docs` |
| `upgrading-dependencies` | For atualizar pacotes, runtime ou framework | automática ou `/upgrading-dependencies` |
| `project-instructions` | For criar ou enxugar o CLAUDE.md, AGENTS.md ou `.claude/rules` de um projeto | automática ou `/project-instructions` |
| `session-handoff` | Quiser continuar um trabalho longo numa sessão nova | só `/session-handoff` |
| `plan-interview` | Quiser fechar as decisões de um plano, uma pergunta por vez | só `/plan-interview` |
| `pr-feedback` | Quiser responder os comentários de revisão de um PR (precisa do `gh`) | só `/pr-feedback` |

Fora do catálogo de propósito, porque já existem no Claude Code: `/code-review`, `/simplify`, `/security-review` e `/init`, além das skills de docx, pdf, xlsx, pptx e gráficos.

## Instalação

Requisitos: Claude Code 2.1.237 ou mais novo (estilo Concise) e Node 22.20 ou mais novo.

```powershell
git clone https://github.com/RMATI-11861/Claude-Skills.git
cd Claude-Skills
node scripts/install.mjs           # mostra o que vai mudar
node scripts/install.mjs --apply   # grava, com backup .bak-<data> de cada arquivo alterado
$env:DISABLE_TELEMETRY = '1'
npx.cmd --yes skills add ./ -g -a claude-code --copy -y
```

Depois, abra uma sessão nova do Claude Code.

- `DISABLE_TELEMETRY` impede que a CLI do skills.sh registre a instalação enquanto o repositório não for publicado.
- No Windows, use `npx.cmd` (o console bloqueia o `npx.ps1`) e `./`, não `.\`.
- O `install.mjs` não sobrescreve um `outputStyle` que você já escolheu, a não ser com `--force`.

### O que muda na sua máquina

- `~/.claude/CLAUDE.md`: o bloco entre `<!-- claude-skills:begin -->` e `<!-- claude-skills:end -->`, mais a seção "This machine", que é sua para editar e nunca é reescrita.
- `~/.claude/rules/`: `powershell.md`, `tests.md`, `sql-migrations.md` e `github-actions.md`.
- `~/.claude/settings.json`: `outputStyle` e `skillOverrides`, que deixam `session-handoff`, `plan-interview` e `pr-feedback` disponíveis só pelo menu `/`.
- `~/.claude/skills/`: uma pasta por skill. A pasta `synced` do claude.ai não é tocada.

### Para desfazer

Restaure os arquivos `.bak-<data>`, ou apague o bloco entre os marcadores, as quatro regras e as chaves `outputStyle` e `skillOverrides`. Para tirar as skills: `npx.cmd --yes skills remove -g -a claude-code <nome>`.

## Guia de economia de tokens

Hábitos que mais economizam:
- `/clear` ao trocar de assunto. Em sessão longa, `/compact <foco>`. Para desfazer um caminho errado, `/rewind` em vez de corrigir em cima.
- `/context` mostra o que ocupa a janela, `/usage` mostra o gasto por skill, plugin e MCP, e `/skill-doctor` mostra o custo de cada skill.
- `/lean-code audit` faz esse levantamento e propõe as mudanças em ordem de impacto.

Alavancas que ficam com vocês:
- **Plugin vercel.** Ocupa 13.774 caracteres em toda sessão, cerca de 5 mil tokens. Se não usam Vercel, desativem com `/plugin`.
- **Effort.** No Fable, xhigh custa cerca de 38% a mais que high. Usem high ou medium na rotina e `/effort` por tarefa.
- **Skills sincronizadas** que ninguém usa (morning, import-memory, google-workspace): desliguem no claude.ai.
- **Orçamento da lista de skills.** São 30.000 caracteres com janela de 1M, e a lista atual usa perto de 29.600. Com janela de 200K (por exemplo `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`), o limite cai para 6.000 e as descrições viram só nomes; nesse caso, configurem `"skillListingBudgetFraction": 0.05`.

## Templates de CLAUDE.md

`/project-instructions` cria ou enxuga o CLAUDE.md de um projeto a partir de templates para projeto genérico, Node/TypeScript, Python com uv, .NET, automação PowerShell e dados/SQL. Também traz a ponte para AGENTS.md e um exemplo de regra por caminho em `.claude/rules`.

## Manutenção

- As regras de autoria estão no `CLAUDE.md` deste repositório.
- `node scripts/validate.mjs` confere formato, nomes, tamanho das descrições, links e o custo total da lista. `--cross-check` também roda o `quick_validate.py` oficial via uv.
- `node scripts/eval-triggers.mjs [--skill <nome>]` verifica se cada prompt de `evals/triggers.json` aciona a skill certa.
- `node scripts/bench-tokens.mjs` compara tokens e custo com e sem as camadas, em tarefas fixas na fixture `evals/fixture`.
- Os dois últimos rodam sessões headless e consomem a cota de uso do plano. Os dois aceitam `--model`.

## Skills de terceiros recomendadas

Leiam o SKILL.md antes de instalar e prefiram autores oficiais e com mais de mil instalações.
- `find-skills` (vercel-labs/skills): procura skills prontas no skills.sh.
- `frontend-design` (anthropics/skills): interfaces com direção visual.
- `grill-me` (mattpocock/skills): alternativa ao `plan-interview` para entrevistas longas de design.

## Publicar no skills.sh

O skills.sh lista repositórios públicos automaticamente, a partir das instalações feitas com `npx skills add RMATI-11861/Claude-Skills`. Antes de publicar, escolham uma licença: sem o arquivo LICENSE, o conteúdo fica com todos os direitos reservados.
