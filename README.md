# CheckListAPP

CheckListAPP é um app simples de checklist de estudos para organizar assuntos por dependência. O projeto foi pensado para uma rotina de preparação para a PMES, com visual em temática policial discreta e foco em leitura confortável.

## Funcionalidades

- Checklists por matéria: Português, Matemática, Geografia e História.
- Blocos organizados por ordem de dependência.
- Marcação individual de cada assunto.
- Conclusão automática do módulo quando todos os assuntos são marcados.
- Filtro por matéria, foco e busca por assunto.
- Progresso geral e progresso por matéria.
- Persistência no navegador usando `localStorage`.
- Layout responsivo com tabela no desktop e cards no mobile.

## Tecnologias

- React
- Vite
- JavaScript
- CSS

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://127.0.0.1:5173/
```

## Build de produção

```bash
npm run build
```

Para pré-visualizar o build:

```bash
npm run preview
```

## Persistência de dados

O progresso é salvo no `localStorage` do navegador. Isso significa que as marcações continuam salvas ao fechar e abrir o app no mesmo dispositivo e navegador.

Os dados não são sincronizados entre dispositivos. Para sincronização com login e banco de dados, o próximo passo seria integrar um backend, como Supabase, Firebase ou Spring Boot com PostgreSQL.

## Estrutura

```text
src/
  App.jsx
  main.jsx
  style.css
  checklistData.js
  components/
    ChecklistBoard.jsx
  utils/
    checklist.js
public/
  escudoPM.png
  favicon.svg
```

## Atalho local

O arquivo `start-checklistapp.ps1` inicia o servidor Vite e abre o app no navegador. Ele pode ser usado por um atalho na Área de Trabalho.
