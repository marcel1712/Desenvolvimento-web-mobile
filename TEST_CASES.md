# Casos de Teste

Meta: 80% de cobertura no backend e frontend.

Estado atual (medido em 2026-06-18):

| Camada   | Statements | Branches | Functions | Lines  |
|----------|-----------|----------|-----------|--------|
| Backend  | 59.56%    | 39.56%   | 42.85%    | 60.05% |
| Frontend | 58.28%    | 24.46%   | 50.00%    | 57.90% |

---

## Backend

### Implementados

**Schemas de metas (`createMetaSchema` / `updateMetaSchema`)**
- [x] Dado um body com `titulo` preenchido, a validação deve passar
- [x] Dado um body com `titulo` e `descricao`, a validação deve passar
- [x] Dado um body sem `titulo`, a validação deve falhar e retornar erro no campo `titulo`
- [x] Dado um body com `titulo` vazio (`""`), a validação deve falhar
- [x] Dado um body com campos desconhecidos como `concluida`, eles devem ser removidos pelo schema
- [x] Dado um body vazio no update, a validação deve passar (todos os campos são opcionais)
- [x] Dado `concluida: true` no update, a validação deve passar e manter o valor
- [x] Dado `concluida: "yes"` (string), a validação deve falhar por tipo incorreto

**Guarda de acesso por tipo de usuário**
- [x] Dado um usuário com `tipo: "paciente"`, o acesso a rotas de paciente deve ser permitido
- [x] Dado um usuário com `tipo: "medico"`, o acesso a rotas exclusivas de paciente deve ser bloqueado
- [x] Dado um usuário não autenticado (`tipo: undefined`), o acesso deve ser bloqueado

**POST /api/consultas — agendamento**
- [x] Dado um horário que não está na agenda do médico, deve retornar 422
- [x] Dado um horário já ocupado por outra consulta com status `agendada`, deve retornar 409
- [x] Dado um horário disponível e sem conflito, deve retornar 201 com os dados da consulta
- [x] Dado uma falha de serialização do PostgreSQL (código 40001), deve retornar 409
- [x] Dado um erro inesperado no banco, deve retornar 500

**GET /api/consultas — listagem**
- [x] Dado um usuário autenticado, deve retornar 200 com a lista de consultas

**GET e POST /api/consultas/:id/documentos**
- [x] Dado uma consulta com documentos, o GET deve retornar 200 com uma URL por documento
- [x] Dado um ID de consulta inexistente, o GET deve retornar 404
- [x] Dado uma consulta sem documentos, o GET deve retornar 200 com array vazio
- [x] Dado um POST sem arquivo anexado, deve retornar 400
- [x] Dado um POST com ID de consulta inexistente, deve retornar 404
- [x] Dado uma falha no upload para o Azure, deve retornar 502 sem inserir registro no banco
- [x] Dado um arquivo válido e consulta existente, o POST deve retornar 201 com URL de acesso
- [x] Dado um upload bem-sucedido, o registro no banco deve conter `blobName` e `uploaderId`, mas não `url`
- [x] Dado múltiplos documentos, o GET deve gerar uma URL SAS para cada um via `blobName`

**GET, POST e DELETE /api/disponibilidade**
- [x] Dado um médico autenticado, o GET deve retornar 200 com seus slots
- [x] Dado um body válido (`diaSemana` + `horarioInicio`), o POST deve retornar 201 com o slot criado
- [x] Dado um body inválido (ex: `diaSemana: "monday"`), o POST deve retornar 400 com erros
- [x] Dado um usuário com `tipo: "paciente"`, o POST deve retornar 403
- [x] Dado um slot já cadastrado para o mesmo dia e horário, o POST deve retornar 409
- [x] Dado um slot existente do próprio médico, o DELETE deve retornar 204
- [x] Dado um ID de slot inexistente, o DELETE deve retornar 404
- [x] Dado um usuário paciente tentando deletar, deve retornar 403
- [x] Dado um médico tentando deletar slot de outro médico, deve retornar 403

**GET /api/disponibilidade/slots-livres**
- [x] Dado ausência do parâmetro `data`, deve retornar 400
- [x] Dado `medicoId` não numérico, deve retornar 400
- [x] Dado slots configurados com um já reservado, deve retornar apenas os livres
- [x] Dado todos os slots do dia reservados, deve retornar array vazio
- [x] Dado médico sem slots configurados, deve retornar array vazio

**Schemas de disponibilidade**
- [x] Dado `diaSemana: "segunda"` e `horarioInicio: "08:00"`, a validação deve passar
- [x] Dado qualquer valor fora dos 7 dias válidos (ex: `"monday"`), a validação deve falhar
- [x] Dado `horarioInicio` no formato `"8:00"` (sem zero à esquerda), a validação deve falhar
- [x] Dado `horarioInicio: "08:00:00"` (com segundos), a validação deve falhar
- [x] Dado a data `2026-06-07` (domingo), o mapeamento UTC deve retornar `"domingo"`
- [x] Dado a data `2026-06-08` (segunda), o mapeamento UTC deve retornar `"segunda"`
- [x] (idem para os demais dias da semana)

**Azure Storage (`uploadBlob` / `generateSasUrl`)**
- [x] Dado um buffer e content-type, o upload deve chamar o SDK com os parâmetros corretos
- [x] Dado uma falha no SDK do Azure, o erro deve ser propagado para o chamador
- [x] Dado um `blobName` válido, a função deve retornar uma URL HTTPS
- [x] Dado qualquer chamada, o container configurado via variável de ambiente deve ser usado

**Schema de ID de consulta (`consultaIdParamSchema`)**
- [x] Dado `"42"` como parâmetro, deve converter para o número `42`
- [x] Dado `"abc"`, deve falhar
- [x] Dado `"0"` ou negativo, deve falhar
- [x] Dado `"1.5"` (float), deve falhar

---

### Implementados (adicionados após 2026-06-18)

**GET /api/consultas — filtro por usuário**
- [x] Dado um paciente autenticado, deve retornar apenas as consultas onde ele é o paciente
- [x] Dado um médico autenticado, deve retornar apenas as consultas onde ele é o médico

**GET /api/consultas/pacientes**
- [x] Dado um usuário com `tipo: "paciente"`, deve retornar 403
- [x] Dado um médico autenticado, deve retornar a lista de pacientes distintos que já consultaram com ele

**GET /api/consultas/:id**
- [x] Dado um ID inexistente, deve retornar 404
- [x] Dado um usuário que não é nem paciente nem médico da consulta, deve retornar 403
- [x] Dado o paciente dono da consulta, deve retornar 200 com os dados
- [x] Dado o médico dono da consulta, deve retornar 200 com os dados

**GET /api/consultas/:id/documentos — controle de acesso**
- [x] Dado um usuário que não participa da consulta, deve retornar 403

**PATCH /api/consultas/:id/concluir**
- [x] Dado um usuário com `tipo: "paciente"`, deve retornar 403
- [x] Dado um ID de consulta inexistente, deve retornar 404
- [x] Dado um médico que não é o responsável pela consulta, deve retornar 403
- [x] Dado uma consulta com status diferente de `"agendada"`, deve retornar 422
- [x] Dado uma consulta `"agendada"` do próprio médico, deve retornar 200 com status `"concluida"`

**PATCH /api/consultas/:id/cancelar**
- [x] Dado um usuário com `tipo: "medico"`, deve retornar 403
- [x] Dado um ID de consulta inexistente, deve retornar 404
- [x] Dado um paciente que não é o dono da consulta, deve retornar 403
- [x] Dado uma consulta com status diferente de `"agendada"`, deve retornar 422
- [x] Dado uma consulta `"agendada"` do próprio paciente, deve retornar 200 com status `"cancelada"`

**GET /api/consultas/:id/link**
- [x] Dado um ID de consulta inexistente, deve retornar 404
- [x] Dado um usuário que não participa da consulta, deve retornar 403
- [x] Dado uma consulta sem `linkMeet`, deve retornar 404 com mensagem de link indisponível
- [x] Dado uma consulta com `linkMeet` preenchido, deve retornar 200 com o link

**GET /api/disponibilidade/datas-disponiveis**
- [x] Dado ausência de `medicoId`, `inicio` ou `fim`, deve retornar 400
- [x] Dado um médico sem slots configurados, deve retornar array vazio
- [x] Dado slots configurados, deve retornar as datas com pelo menos um slot livre no intervalo
- [x] Dado todas as datas do intervalo completamente reservadas, deve retornar array vazio
- [x] Dado datas fora do intervalo solicitado, não devem aparecer no resultado

**Google Meet (`services/googleMeet.ts`)**
- [x] Dado um `state` válido, `getGoogleAuthUrl` deve retornar uma URL de autenticação contendo o scope
- [x] Dado um código de autorização válido, `getRefreshTokenFromCode` deve retornar o refresh token
- [x] Dado uma resposta do Google sem `refresh_token`, `getRefreshTokenFromCode` deve lançar erro
- [x] Dados os parâmetros de evento válidos, `createMeetEvent` deve retornar `meetLink` e `eventId`
- [x] Dado que o Google não retorna `hangoutLink`, `createMeetEvent` deve lançar erro

---

## Frontend

### Implementados

**ToastContext e integração de notificações**
- [x] Dado que um toast é adicionado, ele deve aparecer na lista de toasts ativos
- [x] Dado que um toast é removido, ele deve sumir da lista
- [x] Dado uso fora do `ToastProvider`, deve lançar erro descritivo

**`useDisponibilidade`**
- [x] Dado um token válido, os slots devem ser carregados ao montar o componente
- [x] Dado a adição de um slot com sucesso, ele deve aparecer na lista
- [x] Dado conflito de horário (409), o erro deve ser registrado e a lista não deve mudar
- [x] Dado uma nova chamada de `addSlot`, o erro anterior deve ser limpo
- [x] Dado remoção de slot com sucesso, ele deve sumir da lista
- [x] Dado falha na remoção, o erro deve ser registrado e o slot deve permanecer na lista

**`useDocumentosConsulta`**
- [x] Dado um `consultaId` válido com documentos, deve retornar a lista com URLs
- [x] Dado ausência de documentos, deve retornar array vazio

**`useMetas`**
- [x] Dado um token válido, as metas devem ser carregadas ao montar
- [x] Dado criação de meta com sucesso, ela deve ser adicionada à lista
- [x] Dado atualização de meta, o item correspondente deve ser substituído na lista
- [x] Dado exclusão de meta, o item deve ser removido da lista
- [x] Dado falha na criação, o erro deve ser propagado para o chamador

**`useSlotsLivres`**
- [x] Dado `medicoId` e `data` válidos, deve retornar os slots livres
- [x] Dado `medicoId` nulo, deve retornar lista vazia

**`useUpdateProfile`**
- [x] Dado dados válidos, deve salvar o perfil e retornar os dados atualizados

**`useUserProfile`**
- [x] Dado um token válido, deve carregar o perfil do usuário autenticado

**Tela de documentos (`/documentos/[consultaId]`)**
- [x] Dado documentos existentes, deve exibi-los com nome e link de acesso
- [x] Dado consulta sem documentos, deve exibir estado vazio
- [x] Dado upload de arquivo, deve adicionar o documento à lista após sucesso

**`consultasNavigation.test.tsx`**
- [x] Dado que o usuário pressiona "Ver documentos", deve navegar para `/documentos/:id`

---

### Implementados (adicionados após 2026-06-18)

**`lib/api.ts` — função `apiFetch`**
- [x] Dado um token, deve incluir o header `Authorization: Bearer <token>` na requisição
- [x] Dado ausência de token, não deve incluir o header `Authorization`
- [x] Dado resposta com status 200, deve retornar o JSON parseado
- [x] Dado resposta com status 204, deve retornar `undefined`
- [x] Dado resposta com status de erro (4xx/5xx), deve lançar erro com a mensagem da API
- [x] Dado resposta de erro sem JSON válido no body, deve lançar erro com mensagem de fallback

**`AuthContext` — provedor de autenticação**
- [x] Dado token e usuário salvos no AsyncStorage, devem ser carregados ao inicializar o app
- [x] Dado ausência de dados no AsyncStorage, `usuario` e `token` devem ser `null`
- [x] Dado chamada de `login`, token e usuário devem ser salvos no AsyncStorage e no estado
- [x] Dado chamada de `logout`, token e usuário devem ser removidos do AsyncStorage e limpos do estado
- [x] Dado qualquer estado, `isLoading` deve ser `true` durante a inicialização e `false` após

**`useAuth`**
- [x] Dado uso dentro de um `AuthProvider`, deve retornar o contexto de autenticação

**`useMetasPaciente`**
- [x] Dado um `pacienteId` válido e token, deve buscar as metas do paciente ao montar
- [x] Dado `pacienteId` nulo, deve retornar lista vazia sem fazer requisição
- [x] Dado falha na API, deve registrar o erro

**`useConsultas`**
- [x] Dado um token válido, deve carregar a lista de consultas ao montar
- [x] Dado ausência de token, não deve fazer requisição e deve finalizar o carregamento
- [x] Dado falha na API, deve registrar o erro
- [x] Dado chamada de `concluir`, o status da consulta na lista deve mudar para `"concluida"` sem recarregar tudo
- [x] Dado chamada de `cancelar`, o status deve mudar para `"cancelada"` e o pagamento para `"cancelado"`
- [x] Dado `token` nulo ao chamar `concluir` ou `cancelar`, deve lançar erro

**`useAgendarConsulta`**
- [x] Dado payload válido, `agendar` deve retornar os dados da consulta criada
- [x] Dado falha na API, deve registrar o erro e relançá-lo para o chamador
- [x] Dado nova chamada de `agendar`, o erro anterior deve ser limpo

**`usePagamentos`**
- [x] Dado um token válido, deve carregar a lista de pagamentos ao montar
- [x] Dado ausência de token, deve finalizar o carregamento sem fazer requisição
- [x] Dado falha na API, deve registrar o erro
- [x] Dado chamada de `confirmarPagamento`, o status do pagamento na lista deve mudar para `"aprovado"`
- [x] Dado `token` nulo ao confirmar, deve lançar erro

**`useMedicos`**
- [x] Dado um token válido, deve carregar a lista de médicos ao montar
- [x] Dado ausência de token, deve finalizar o carregamento sem fazer requisição
- [x] Dado falha na API, deve registrar o erro

**`useProtocolos`**
- [x] Dado um token válido, deve carregar a lista de protocolos ao montar
- [x] Dado ausência de token, deve finalizar o carregamento sem fazer requisição
- [x] Dado falha na API, deve registrar o erro
- [x] Dado chamada de `createProtocolo` com sucesso, o novo protocolo deve aparecer na lista

**`useAnamneses`**
- [x] Dado um token válido, deve carregar a lista de anamneses ao montar
- [x] Dado ausência de token, deve finalizar o carregamento sem fazer requisição
- [x] Dado chamada de `salvar` sem anamnese existente, deve criar via POST e atualizar o estado
- [x] Dado chamada de `salvar` com anamnese existente, deve atualizar via PUT e atualizar o estado
- [x] Dado `token` nulo ao salvar, deve lançar erro

### A implementar

**`useDatasDisponiveis`** — hook ainda não existe no frontend
- [ ] Dado `medicoId` e token válidos, deve buscar as datas disponíveis do médico
- [ ] Dado `token` nulo, deve retornar `Set` vazio sem fazer requisição
- [ ] Dado `medicoId` nulo, deve retornar `Set` vazio sem fazer requisição
- [ ] Dado falha na API, deve retornar `Set` vazio


CASOS DE TESTE PARA SENHA
