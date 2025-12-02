## Banco de dados

As imagens devem ser salvas no banco de dados em formato base64.

## Validação de dados

Os dados enviados devem ser validados no backend, usando o zod para tipagem e validação.

## Enums

```typescript
export enum VehicleSpecies {
  PASSAGEIRO = "PASSAGEIRO",
  CARGA = "CARGA",
  MISTO = "MISTO",
  COMPETICAO = "COMPETIÇÃO",
  COLECAO = "COLEÇÃO",
  TRACAO = "TRAÇÃO",
  ESPECIAL = "ESPECIAL",
  LOCOMOCAO = "LOCOMOÇÃO",
  ENSINO = "ENSINO",
  AUTORIDADE = "AUTORIDADE",
  VISITANTE = "VISITANTE"
}

export enum VehicleType {
  AUTOMOVEL = "AUTOMÓVEL",
  CAMIONETA = "CAMIONETA",
  CAMIONETA_MISTA = "CAMIONETA MISTA",
  CAMINHAO = "CAMINHÃO",
  CAMINHAO_TRATOR = "CAMINHÃO TRATOR",
  UTILITARIO = "UTILITÁRIO",
  MICROONIBUS = "MICROÔNIBUS",
  ONIBUS = "ÔNIBUS",
  REBOQUE = "REBOQUE",
  SEMI_REBOQUE = "SEMI-REBOQUE",
  MOTOCICLETA = "MOTOCICLETA",
  MOTONETA = "MOTONETA",
  CICLOMOTOR = "CICLOMOTOR",
  TRICICLO = "TRICICLO",
  QUADRICICLO = "QUADRICICLO",
  BICICLETA_MOTORIZADA = "BICICLETA MOTORIZADA",
  ESPECIAL = "ESPECIAL",
  SIDE_CAR = "SIDE-CAR",
  CHASSI_PLATAFORMA = "CHASSI-PLATAFORMA",
  TRATOR_RODAS = "TRATOR DE RODAS",
  TRATOR_ESTEIRAS = "TRATOR DE ESTEIRAS",
  TRATOR_MISTO = "TRATOR MISTO",
  MAQUINA_TERRAPLANAGEM = "MÁQUINA DE TERRAPLANAGEM",
  MAQUINA_AGRICOLA = "MÁQUINA AGRÍCOLA"
}
```

## Cadastro de laudos

Todos os campos abaixo são obrigatórios, exceto os que estão marcados como "opcional".

Separe o formulário de cada usuário em etapas, para facilitar o preenchimento.

### Campos que agente vai preencher

- Órgão Requisitante
- Autoridade Requisitante
- Guia/Ofício
- Data Guia/Ofício
- Ocorrência Policial
- Inquérito policial
- Colocar prioridade (alta, médio, alto)
- Objetivo da Perícia (sugerir por padrão: "Proceder a exame pericial de Identificação de Veículo, a fim de constatar sua originalidade")
- Preâmbulo (sugerir por padrão: "A signatária perita deste Departamento de Polícia Técnica, designada por sua coordenadora para atender à requisição da autoridade, apresenta o resultado de seus trabalhos")
- Placa Portada
- Marca / Modelo
- Espécie / Tipo (usar enum definido acima)
- Cor
- Vidro (opcional, caso não preenchido pelo agente o campo de numeração deve ser apresentado no tópico correspondente para o policial preencher)
- Numeração do motor (opcional, caso não preenchido pelo agente o campo de numeração deve ser apresentado no tópico correspondente para o policial preencher)
- CHASSI (opcional, caso não preenchido pelo agente o campo de numeração deve ser apresentado no tópico correspondente para o policial preencher)
- Outras numerações (opcional)
- Prazo para concluir
- Data de atribuição/criação

### Campos que o policial vai preencher

Tópico de dados:
- Fotos do veículo
- Observação

Tópico de placa, será preenchido:
- Fotos da placa
- Observação

Tópico do Chassi / do Vin:
- Fotos do chassi
- Observação

Tópico do motor:
- Fotos do motor
- Observação

Tópico dos vidros:
- Opção de “Não adequado” (pois motos não terão essa etapa)
- Fotos dos vidros
- Observação

Tópico das etiquetas:
- Opção de “Não adequado” (pois motos não terão essa etapa)
- Foto das etiquetas
- Observação

Tópico da plaqueta do ano de fabricação:
- Opção de “Não adequado” (pois motos não terão essa etapa)
- Foto da plaqueta
- Observação

Tópico auxiliares
- Opção de “Não adequado” (pois motos não terão essa etapa)
- Dados da central eletrônica
- Dados sobre Séries Auxiliares

Tópico de adulteração:
- Marcação se o veículo é clonado ou adulterado, se for verdade, preencher os campos abaixo depois de consultar os dados do veículo original:
- Placa original
- Marca / Modelo
- Espécie / Tipo
- Cor
- CHASSI
- Numeração do motor
- Licenciado em nome de
- Detalhes da análise

Tópico de conclusão:
- Conclusão
- Histórico (O campo de histórico será um texto montado por data e hora do início do preenchimento do laudo do policial , local onde se encontrava o veículo. Para no fim montar o seguinte texto 'Refere-se este trabalho aos exames iniciados ás --------- no pátio ---------, no município ------, onde se encontrava o veículo a ser periciado, que fora conduzido por agentes da delegacia --------, conforme a solicitação na guia para requisição de exame pericial de número -------'  esse texto já montado deve aparecer no fim da etapa do policial com possibilidade de edição')
- Opção se é conclusivo ou inconclusivo




### Depois de concluído

Depois de concluído a resposta do laudo, será possível exportar em PDF um documento com um resumo de todas as informações respondidas sobre o laudo, cada foto enviada deve vir com uma identificação numérica cardinal
