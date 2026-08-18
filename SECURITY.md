# Política de Segurança do MoedaFlow

A segurança e a privacidade são prioridades no desenvolvimento do **MoedaFlow**. Este documento descreve as práticas adotadas para proteger a aplicação, o fluxo de dados e os serviços de terceiros.

## 1. Gestão de Chaves e Credenciais
Nenhuma chave de API, token de acesso ou URL de webhook sensível é inserida diretamente ("hardcoded") no código fonte do projeto.
- O sistema utiliza variáveis de ambiente (arquivo `.env`) para gerenciar as credenciais.
- O arquivo `.env` está explicitamente incluído no `.gitignore` para garantir que as chaves nunca sejam comitadas em repositórios públicos.
- Para configurar o projeto em um novo ambiente, deve-se utilizar o arquivo `.env.example` como modelo estrutural.

## 2. Privacidade e LGPD
O MoedaFlow é uma aplicação voltada para o consumo e análise de cotações financeiras públicas (câmbio e criptomoedas).
- **Dados Pessoais:** A plataforma **NÃO** coleta, processa ou armazena nenhum dado pessoal identificável (PII) de seus usuários.
- **Cookies e Rastreamento:** Não há utilização de cookies de rastreamento para fins de terceiros.
- Sendo assim, o escopo da plataforma minimiza riscos associados à Lei Geral de Proteção de Dados (LGPD).

## 3. Proteção Contra Abusos (Backend)
Para assegurar a estabilidade e integridade da infraestrutura, foram adotadas as seguintes medidas:
- **CORS Estrito:** O backend está configurado para aceitar apenas requisições originárias da URL oficial do Frontend, mitigando ataques de *Cross-Site Request Forgery* (CSRF).
- **Rate Limiting:** A API possui proteção de limite de taxa (Rate Limiting). O acesso de qualquer IP está limitado a 100 requisições a cada 15 minutos, prevenindo ataques de negação de serviço (DDoS) ou *scraping* abusivo.
- **Validação de Input (Whitelist):** Rotas sensíveis possuem validação rígida de parâmetros. Parâmetros como "moeda" só aceitam valores de uma lista pré-aprovada (*whitelist*), prevenindo ataques de *Injection*.

## 4. Reporte de Vulnerabilidades
Caso você seja um pesquisador de segurança ou desenvolvedor e encontre alguma falha de segurança no MoedaFlow, por favor, reporte.
- **Como reportar:** Entre em contato diretamente com os administradores ou abra uma *Issue* sinalizada como confidencial no repositório.
- Não explore a vulnerabilidade nem exponha publicamente até que a equipe tenha tido tempo hábil de lançar um patch de correção.
