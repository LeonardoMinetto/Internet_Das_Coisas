# SmartTag — primeira versão

Esta versão contém uma seção de telemetria e um histórico de ocorrências para simular como seria o funcionamento real da tag.

## Dados apresentados

- nível da bateria;
- intensidade do sinal;
- temperatura interna;
- quantidade de mensagens recebidas na sessão;
- horário da última atualização;
- pico de impacto e aceleração resultante coletados pelo acelerômetro;
- inclinação e velocidade angular coletadas pelo giroscópio;
- ocorrências de bateria baixa, sinal fraco, temperatura, impacto ou orientação fora da faixa esperada.

Os valores são simulados localmente no arquivo `smartTag.js`. A cada cinco segundos são aplicadas variações nos sensores, a bateria diminui lentamente e o contador de mensagens aumenta.

## Parâmetros monitorados

- bateria: mínimo de 20%;
- sinal: mínimo de −80 dBm;
- temperatura: entre 18 °C e 28 °C;
- impacto: máximo de 3 g;
- inclinação: máximo de 30°.

O acelerômetro fornece o pico de impacto e a aceleração resultante da carga. O giroscópio registra a inclinação e a velocidade angular para identificar uma orientação incorreta do produto.

Uma ocorrência é adicionada ao histórico quando uma leitura ultrapassa um desses limites. Um novo registro do mesmo tipo só é criado depois que a leitura volta ao normal e sai novamente do parâmetro.

## Executar localmente
Execute o comando `python3 -m http.server 8000`.

Acesse `http://localhost:8000`.
