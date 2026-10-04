# SmartTag — primeira versão

Esta é a primeira versão e contém somente uma seção de telemetria da tag com alguns valores constantes para simular como seria o funcionamento real da tag.

## Dados apresentados

- nível da bateria;
- intensidade do sinal;
- temperatura interna;
- quantidade de mensagens recebidas na sessão;
- horário da última atualização.

Os valores são simulados localmente no arquivo `Internet_Das_Coisas/smartTag.js`. A cada cinco segundos são aplicadas pequenas variações no sinal e na temperatura, a bateria diminui lentamente e o contador de mensagens aumenta.

## Executar localmente
acesse `http://localhost:4173`.
