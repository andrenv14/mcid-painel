# MCID Painel

Painel web de produtividade para acompanhar projetos, tarefas e fontes de dados em um único lugar.

A primeira etapa do projeto entrega o front-end responsivo em React. Os dados ainda são de demonstração e ficam salvos no navegador; a arquitetura visual já foi pensada para receber informações reais de pastas, arquivos, planilhas e sites na próxima etapa.

## O que já funciona

- indicadores de progresso geral, tarefas concluídas, itens em andamento e prazos;
- cartões de progresso por projeto;
- quadro Kanban com movimentação por arrastar e soltar;
- busca por tarefa, projeto ou responsável;
- filtros por projeto e fonte de dados;
- criação de novas tarefas;
- painel lateral com os detalhes de cada tarefa;
- avanço de etapa pelo painel de detalhes;
- persistência local das alterações do Kanban;
- restauração dos dados de demonstração;
- notificações simuladas;
- tema claro e escuro;
- layout adaptado para desktop, tablet e celular;
- navegação por teclado, rótulos acessíveis e suporte a redução de movimento.

## Tecnologias

- React 18
- TypeScript
- Vite
- CSS responsivo sem dependência de biblioteca visual

A interface evita acoplar os componentes a uma API específica. Os dados de demonstração ficam em `src/data/mockData.ts` e os contratos estão em `src/types.ts`.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Para gerar uma versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura principal

```text
src/
├── components/
│   ├── Icon.tsx
│   └── ProgressBar.tsx
├── data/
│   └── mockData.ts
├── App.tsx
├── main.tsx
├── styles.css
└── types.ts
```

## Integração com o back-end

Na próxima etapa, o arquivo de demonstração pode ser substituído por um serviço HTTP. Uma resposta inicial sugerida é:

```json
{
  "syncedAt": "2026-10-08T15:30:00-03:00",
  "summary": {
    "overallProgress": 69,
    "completedTasks": 2,
    "activeTasks": 5,
    "attentionTasks": 3
  },
  "projects": [],
  "tasks": [],
  "sources": [],
  "activities": []
}
```

Os valores de `status` aceitos pelo Kanban são:

- `backlog`
- `inProgress`
- `review`
- `done`

As fontes aceitas atualmente são `Pasta`, `Planilha`, `Site` e `Manual`.

Uma organização recomendada para o back-end:

1. conectores independentes para pastas, planilhas e sites;
2. rotina de sincronização com registro de data, resultado e erros;
3. camada de normalização para transformar cada origem no mesmo contrato;
4. API para resumo, projetos, tarefas e histórico;
5. armazenamento do último estado conhecido;
6. autenticação e controle de acesso antes de conectar dados institucionais.

## Verificação

O repositório possui um fluxo de integração contínua que instala as dependências e executa o build TypeScript a cada envio para a branch principal e em pull requests.
