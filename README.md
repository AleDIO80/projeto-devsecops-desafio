# Desafio DevSecOps — Gerenciador de Tarefas

## Sobre o Projeto

Este repositório faz parte do desafio prático do módulo de DevSecOps da ADA Tech.
O objetivo foi implementar uma esteira de segurança automatizada e corrigir as
vulnerabilidades encontradas no código original.

---

## Como a pipeline funciona

A pipeline é ativada a cada `push` na branch `main`. Ela funciona como uma
esteira de controle de qualidade: o código passa por três verificações de
segurança em sequência antes de chegar à produção. Se qualquer verificação
falhar, o deploy é bloqueado automaticamente — isso é o conceito de
**"break the build"**.

---

### Passo 1 — Checkout do Código

Baixa o repositório completo no servidor do GitHub Actions, incluindo todo o
histórico de commits (`fetch-depth: 0`). O histórico completo é necessário
porque o Gitleaks (Passo 3) precisa varrer não só os arquivos atuais, mas
também todos os commits anteriores — um segredo removido hoje ainda existe
no histórico de ontem.

---

### Passo 2 — Build

Verifica que os arquivos do projeto estão presentes e a estrutura está correta
antes de iniciar as análises de segurança.

---

### Passo 3 — Secrets Scanning com Gitleaks

**O que faz:** Varre todo o código-fonte e o histórico de commits em busca de
credenciais expostas: chaves de API, senhas hardcoded, tokens de acesso e
qualquer string que pareça um segredo.

**Por que é importante:** Credenciais no código são um dos vetores de ataque
mais explorados. Mesmo em repositórios privados, um vazamento pode comprometer
sistemas inteiros. O Gitleaks usa uma biblioteca de centenas de padrões (regex)
treinados para reconhecer o formato de secrets de serviços como AWS, Google,
GitHub, Stripe e outros.

**Vulnerabilidade encontrada e corrigida:**
```js
// ❌ ANTES — quebrava a pipeline
const API_KEY = "VALOR_API";
const DB_PASSWORD = "SENHA_BANCO_DE_DADOS";

// ✅ DEPOIS — removidas do código
```

---

### Passo 4 — SAST com Semgrep

**O que faz:** Analisa o código-fonte estaticamente, sem executá-lo, comparando
com um conjunto de regras que identificam padrões de código inseguros. O
ruleset `auto` cobre as principais vulnerabilidades do OWASP Top 10 para
JavaScript, incluindo XSS, injeção de código, uso de `eval()` e funções
perigosas.

**Por que é importante:** Problemas encontrados antes do deploy custam muito
menos para corrigir do que vulnerabilidades descobertas em produção. O SAST
age como um revisor de segurança automático que lê cada linha de código
procurando padrões conhecidamente perigosos.

**Vulnerabilidades encontradas e corrigidas:**
```js
// ❌ ANTES — XSS: innerHTML interpreta tags HTML como código
li.innerHTML = item.task;

// ✅ DEPOIS — innerText trata o valor como texto puro
li.innerText = item.task;

// ❌ ANTES — eval() executa qualquer string como código JavaScript
eval('console.log("' + input.value + '")');

// ✅ DEPOIS — lógica direta, sem eval
console.log('Tarefa adicionada.');
```

---

### Passo 5 — SCA com Grype

**O que faz:** Verifica as dependências declaradas no `package.json` (e suas
sub-dependências transitivas) contra bancos de dados públicos de CVEs, como
o NVD (National Vulnerability Database) e o GitHub Advisory Database. A
pipeline quebra para qualquer vulnerabilidade de severidade média ou maior.

**Por que é importante:** A maioria das aplicações modernas usa dezenas de
bibliotecas de terceiros. Uma única dependência desatualizada com CVE conhecida
pode ser o vetor de ataque de todo o sistema — e o atacante não precisa nem
conhecer o seu código, só a versão da biblioteca que você usa.

**Vulnerabilidades encontradas e corrigidas:**

| Dependência | Versão vulnerável | CVE | Versão corrigida |
|---|---|---|---|
| lodash | 4.17.4 | CVE-2019-10744 (Prototype Pollution) | 4.17.21 |
| express | 4.17.1 | múltiplas CVEs | 4.19.2 |
| axios | 0.21.1 | CVE-2021-3749 (ReDoS) | 1.7.4 |

---

### Passo 6 — Deploy no GitHub Pages

Só é executado se **todos os passos anteriores passarem**. Publica os arquivos
do diretório `src/` no GitHub Pages automaticamente.

Este é o "break the build" em prática: qualquer vulnerabilidade detectada nos
passos 3, 4 ou 5 impede que código inseguro chegue ao ambiente de produção.

---

## Vulnerabilidades corrigidas (resumo)

| # | Tipo | Ferramenta que detectou | Arquivo | Status |
|---|---|---|---|---|
| 1 | Credencial hardcoded (`API_KEY`) | Gitleaks | `src/script.js` | ✅ Corrigida |
| 2 | Credencial hardcoded (`DB_PASSWORD`) | Gitleaks | `src/script.js` | ✅ Corrigida |
| 3 | XSS via `innerHTML` | Semgrep | `src/script.js` | ✅ Corrigida |
| 4 | Dependências com CVEs | Grype | `package.json` | ✅ Corrigida |

---

## O que implementar

- [x] Secrets Scanning com **Gitleaks**
- [x] SAST com **Semgrep**
- [x] SCA com **Grype**
- [x] Deploy com **GitHub Pages**

---

## URL de Produção
 
https://github.com/AleDIO80/projeto-devsecops-desafio/
