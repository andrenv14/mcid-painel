# MCID · Painel de Governança

Painel web responsivo para acompanhamento de governança, privacidade, segurança da informação e execução dos planos institucionais.

O front-end foi estruturado para o cenário levantado com a área responsável: PPSI 2.0, iESGo, iGestTI, iGovSISP, PDTIC, PTD, plano de comunicação, ações, prazos e evidências.

> Os números incluídos nesta etapa são dados de demonstração e estão identificados como tal na interface. Os valores oficiais entrarão após o recebimento e o mapeamento das planilhas institucionais.

## Funcionalidades

- visão executiva com indicadores e pontos de atenção;
- página do PPSI 2.0 com execução, cobertura por segmento e matriz de controles;
- análise de iESGo e iGestTI por dimensão e estágio de capacidade;
- acompanhamento do PDTIC, PTD, plano de comunicação e plano de trabalho PPSI;
- Kanban interativo com arrastar e soltar;
- criação de novas ações e persistência local no navegador;
- filtros e busca por instrumento, controle, ação ou responsável;
- catálogo das fontes que alimentarão o back-end;
- tema claro e escuro;
- layout responsivo para desktop, tablet e celular;
- avisos explícitos para não confundir execução de ações, cobertura de medidas e índices de capacidade.

## Executar localmente

Requer Node.js 20 ou superior.

~~~bash
git pull
npm install
npm run dev
~~~

Abra o endereço exibido pelo Vite, normalmente [http://localhost:5173](http://localhost:5173).

Para verificar a versão de produção:

~~~bash
npm run build
npm run preview
~~~

## Estrutura dos dados

A interface distingue quatro conceitos:

1. **Execução**: ações concluídas em relação às ações previstas.
2. **Cobertura**: medidas implantadas e evidenciadas em relação às medidas aplicáveis.
3. **Índice de capacidade**: resultado calculado pela metodologia do iESGo, iGestTI ou iGovSISP.
4. **Execução do plano**: entregas realizadas em relação ao planejamento do período.

## Próxima etapa: back-end

As fontes já identificadas são:

- \`correta-iESGo_PlanilhaSimulacao_analise_considerada_2026.xlsx\`;
- \`Análise de execução do PDTIC MDR - 2023-2026 finalizada.xlsx\`;
- diagnóstico e plano de trabalho do PPSI;
- resultado do iGovSISP;
- PTD e plano de comunicação;
- pastas de evidências no Teams, SharePoint ou OneDrive;
- referências oficiais do PPSI 2.0 e do iESGo/TCU.

O back-end deverá ter conectores independentes, normalização dos registros, histórico de sincronização, controle de erros e uma API única para o front-end.

## Tecnologias

- React 18
- TypeScript
- Vite
- CSS responsivo sem biblioteca visual externa

## Verificação contínua

O GitHub Actions instala as dependências e executa o build TypeScript em cada envio para a branch principal e em pull requests.
