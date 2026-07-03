import type { Metadata } from "next";
import {
  LegalDocument,
  LegalLink,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalDocument";

const contactEmail = "privacidade@dottiwork.com";

const pt = {
  title: "Politica de Privacidade",
  description:
    "Esta politica explica como o dotti.work trata dados pessoais para autenticar usuarios, montar perfis tecnicos, recomendar projetos open source e manter o historico de uso do app.",
  updatedAt: "3 de julho de 2026",
};

const en = {
  title: "Privacy Policy",
  description:
    "This policy explains how dotti.work processes personal data to authenticate users, build technical profiles, recommend open source projects, and maintain app activity history.",
  updatedAt: "July 3, 2026",
};

export const metadata: Metadata = {
  title: "Politica de Privacidade - dotti.work",
  description:
    "Como o dotti.work trata dados pessoais, dados do GitHub, preferencias, historico e tecnologias locais.",
};

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <LegalDocument en={en} pt={pt}>
      <div className="legal-pt space-y-10" lang="pt-BR">
        <PrivacyContentPt />
      </div>
      <div className="legal-en space-y-10" lang="en-US">
        <PrivacyContentEn />
      </div>
    </LegalDocument>
  );
}

function PrivacyContentPt() {
  return (
    <>
      <LegalSection title="1. Escopo e status desta politica">
        <p>
          O dotti.work e uma aplicacao para descoberta de projetos open source
          compativeis com stack, senioridade, objetivos de contribuicao e sinais
          de saude de repositorios. Esta politica cobre a landing page, as telas
          internas do app, a integracao com GitHub OAuth e a API do dotti.work.
        </p>
        <p>
          O produto ainda esta em evolucao. Antes do uso em producao com usuarios
          reais, os dados formais do controlador, do encarregado/DPO, prazos
          finais de retencao e contratos com operadores devem ser confirmados e
          revisados juridicamente.
        </p>
      </LegalSection>

      <LegalSection title="2. Controlador e contato">
        <p>
          O responsavel pela operacao do dotti.work atua como controlador dos
          dados pessoais tratados para disponibilizar o servico. Enquanto os
          dados cadastrais formais do controlador e do encarregado nao forem
          publicados, pedidos de privacidade podem ser direcionados para{" "}
          <a
            className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="3. Dados que podemos tratar">
        <LegalList
          items={[
            <>
              <strong>Dados de conta GitHub:</strong> identificador, login,
              nome publico, e-mail quando disponivel, avatar, bio, localizacao,
              empresa, site, URL do perfil, escopos autorizados e status da
              integracao.
            </>,
            <>
              <strong>Dados de perfil tecnico:</strong> nome de exibicao, cargo,
              senioridade, objetivos, tecnologias, nivel de proficiencia,
              interesse por tecnologia e preferencias de matching.
            </>,
            <>
              <strong>Dados de uso do app:</strong> projetos salvos, ignorados,
              em pesquisa, em contribuicao, PR enviado, contribuidos ou
              arquivados; historico de interacoes; filtros; tema; dados
              importados/exportados.
            </>,
            <>
              <strong>Dados locais do navegador:</strong> chaves como{" "}
              <code>dotti.profile</code>, <code>dotti.savedProjects</code>,{" "}
              <code>dotti.ignoredProjects</code>, <code>dotti.history</code>,{" "}
              <code>dotti.theme</code>, <code>dotti.filters</code> e{" "}
              <code>dotti.pendingOnboarding</code>, quando usadas pelo front.
            </>,
            <>
              <strong>Dados tecnicos e de seguranca:</strong> cookies de sessao,
              IP, user agent, data/hora, origem da requisicao, rotas acessadas,
              erros, logs tecnicos e eventos de monitoramento.
            </>,
            <>
              <strong>Dados publicos de repositorios:</strong> metadados de
              repositorios e issues publicas do GitHub, como owner, nome,
              descricao, linguagens, topics, labels, estrelas, forks, issues e
              sinais de saude.
            </>,
          ]}
        />
        <p>
          O dotti.work nao deve receber nem expor token GitHub no front-end. No
          desenho de backend documentado, tokens OAuth ficam no servidor,
          criptografados, e nao sao retornados ao navegador.
        </p>
      </LegalSection>

      <LegalSection title="4. Finalidades do tratamento">
        <LegalList
          items={[
            "autenticar usuarios via GitHub OAuth e manter sessoes seguras;",
            "criar e atualizar perfil tecnico, tecnologias e preferencias;",
            "gerar, ordenar e explicar recomendacoes de repositorios e issues;",
            "permitir salvar, ignorar, restaurar e acompanhar projetos;",
            "manter historico de interacoes e exportacao/importacao de dados;",
            "prevenir abuso, investigar erros, proteger a aplicacao e cumprir obrigacoes legais;",
            "melhorar estabilidade, acessibilidade, desempenho e qualidade do produto.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Bases legais">
        <p>
          Conforme a LGPD, o tratamento pode se apoiar em bases como execucao de
          contrato ou procedimentos preliminares para login, sessao, onboarding e
          recomendacoes; legitimo interesse para seguranca, prevencao a fraude e
          metricas essenciais; consentimento para cookies, analytics, replay ou
          comunicacoes nao essenciais; cumprimento de obrigacao legal ou
          regulatoria quando aplicavel.
        </p>
        <p>
          Dados publicos do GitHub continuam podendo ser dados pessoais quando
          associados a uma pessoa identificada ou identificavel.
        </p>
      </LegalSection>

      <LegalSection title="6. Compartilhamento e operadores">
        <p>
          Podemos compartilhar dados apenas na medida necessaria para operar o
          servico, cumprir lei ou proteger direitos. Isso pode incluir:
        </p>
        <LegalList
          items={[
            <>
              <strong>GitHub:</strong> autenticacao OAuth e consulta a dados
              publicos de repositorios, conforme politicas do proprio GitHub.
            </>,
            "provedores de hospedagem, banco de dados, logs, CDN e infraestrutura;",
            "Sentry ou ferramenta equivalente de observabilidade, quando ativada;",
            "autoridades, tribunais ou terceiros quando houver obrigacao legal, ordem competente ou defesa de direitos.",
          ]}
        />
        <p>O dotti.work nao vende dados pessoais.</p>
      </LegalSection>

      <LegalSection title="7. Cookies e tecnologias locais">
        <p>
          O backend pode usar cookie de sessao HttpOnly, Secure em producao,
          SameSite=Lax e escopo minimo para manter o usuario autenticado. Esse
          cookie e necessario para a seguranca e funcionamento da conta.
        </p>
        <p>
          O front pode usar <code>localStorage</code> para tema, filtros,
          perfil, salvos, ignorados e historico local. O usuario pode limpar
          esses dados pelo navegador ou por controles do app quando disponiveis.
          Cookies ou replays nao essenciais devem depender de consentimento
          previo quando forem ativados.
        </p>
      </LegalSection>

      <LegalSection title="8. Retencao e exclusao">
        <p>
          Dados locais permanecem no navegador ate que o usuario limpe os dados,
          use uma acao de reset ou remova o armazenamento do site. Dados da conta
          autenticada podem permanecer enquanto a conta estiver ativa e pelo
          periodo necessario para cumprir obrigacoes legais, seguranca, auditoria
          e defesa de direitos.
        </p>
        <p>
          A arquitetura de backend prevista inclui exportacao de dados do usuario
          e exclusao de conta com revogacao de sessoes e soft delete. Prazos
          definitivos para logs, backups, caches e monitoramento devem ser
          publicados antes da operacao em producao.
        </p>
      </LegalSection>

      <LegalSection title="9. Direitos do titular">
        <p>
          A LGPD reconhece direitos como confirmacao de tratamento, acesso,
          correcao, portabilidade, eliminacao, informacao sobre compartilhamento,
          revogacao de consentimento, oposicao e revisao de decisoes
          automatizadas quando aplicavel.
        </p>
        <p>
          O usuario podera exercer esses direitos pelos controles do app quando
          disponiveis ou pelo contato de privacidade. As recomendacoes do
          dotti.work sao baseadas em criterios tecnicos e deterministicos, como
          stack, dificuldade, issues, atividade e saude do repositorio.
        </p>
      </LegalSection>

      <LegalSection title="10. Transferencias internacionais">
        <p>
          GitHub, Sentry, provedores de hospedagem e outros operadores podem
          processar dados fora do Brasil. Quando isso ocorrer, o dotti.work deve
          adotar mecanismos compativeis com a LGPD e contratos adequados com seus
          operadores.
        </p>
      </LegalSection>

      <LegalSection title="11. Seguranca">
        <p>
          O dotti.work adota ou planeja adotar medidas como HTTPS em producao,
          cookies HttpOnly e Secure, CORS restrito, validacao de entradas,
          criptografia de tokens no backend, reducao de logs com dados pessoais e
          monitoramento de erros com mascaramento de informacoes sensiveis.
        </p>
      </LegalSection>

      <LegalSection title="12. Criancas e adolescentes">
        <p>
          O dotti.work nao e direcionado a criancas. Pessoas sem capacidade legal
          para aceitar estes termos devem usar o servico somente com autorizacao
          e supervisao de responsavel legal.
        </p>
      </LegalSection>

      <LegalSection title="13. Referencias">
        <LegalList
          items={[
            <>
              <LegalLink href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm">
                Lei Geral de Protecao de Dados Pessoais - LGPD
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1">
                ANPD - Titular de Dados
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf">
                ANPD - Guia Orientativo de Cookies
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub General Privacy Statement
              </LegalLink>
            </>,
          ]}
        />
      </LegalSection>
    </>
  );
}

function PrivacyContentEn() {
  return (
    <>
      <LegalSection title="1. Scope and status of this policy">
        <p>
          dotti.work is an application for discovering open source projects that
          match a developer&apos;s stack, seniority, contribution goals, and
          repository health signals. This policy covers the landing page, app
          screens, GitHub OAuth integration, and the dotti.work API.
        </p>
        <p>
          The product is still evolving. Before production use with real users,
          the formal controller details, DPO/contact role, final retention
          periods, and operator agreements must be confirmed and legally
          reviewed.
        </p>
      </LegalSection>

      <LegalSection title="2. Controller and contact">
        <p>
          The party responsible for operating dotti.work acts as the controller
          for personal data processed to provide the service. Until the formal
          controller and DPO details are published, privacy requests can be sent
          to{" "}
          <a
            className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="3. Data we may process">
        <LegalList
          items={[
            <>
              <strong>GitHub account data:</strong> identifier, login, public
              name, email when available, avatar, bio, location, company,
              website, profile URL, authorized scopes, and integration status.
            </>,
            <>
              <strong>Technical profile data:</strong> display name, role,
              seniority, goals, technologies, proficiency level, technology
              interest, and matching preferences.
            </>,
            <>
              <strong>App usage data:</strong> saved, ignored, researching,
              working, pull-request-sent, contributed, or archived projects;
              interaction history; filters; theme; imported and exported data.
            </>,
            <>
              <strong>Local browser data:</strong> keys such as{" "}
              <code>dotti.profile</code>, <code>dotti.savedProjects</code>,{" "}
              <code>dotti.ignoredProjects</code>, <code>dotti.history</code>,{" "}
              <code>dotti.theme</code>, <code>dotti.filters</code>, and{" "}
              <code>dotti.pendingOnboarding</code> when used by the front end.
            </>,
            <>
              <strong>Technical and security data:</strong> session cookies, IP
              address, user agent, date/time, request origin, accessed routes,
              errors, technical logs, and monitoring events.
            </>,
            <>
              <strong>Public repository data:</strong> metadata for public
              GitHub repositories and issues, such as owner, name, description,
              languages, topics, labels, stars, forks, issues, and health
              signals.
            </>,
          ]}
        />
        <p>
          dotti.work should not receive or expose GitHub tokens in the front end.
          In the documented backend design, OAuth tokens stay on the server, are
          encrypted, and are not returned to the browser.
        </p>
      </LegalSection>

      <LegalSection title="4. Purposes of processing">
        <LegalList
          items={[
            "authenticate users through GitHub OAuth and maintain secure sessions;",
            "create and update technical profiles, technologies, and preferences;",
            "generate, rank, and explain repository and issue recommendations;",
            "allow users to save, ignore, restore, and track projects;",
            "maintain interaction history and data import/export flows;",
            "prevent abuse, investigate errors, protect the application, and comply with legal obligations;",
            "improve product stability, accessibility, performance, and quality.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Legal bases">
        <p>
          Under the Brazilian LGPD, processing may rely on bases such as contract
          performance or preliminary steps for login, session, onboarding, and
          recommendations; legitimate interest for security, fraud prevention,
          and essential metrics; consent for non-essential cookies, analytics,
          replay, or communications; and compliance with legal or regulatory
          obligations when applicable.
        </p>
        <p>
          Public GitHub data may still be personal data when associated with an
          identified or identifiable person.
        </p>
      </LegalSection>

      <LegalSection title="6. Sharing and processors">
        <p>
          We may share data only as needed to operate the service, comply with
          law, or protect rights. This may include:
        </p>
        <LegalList
          items={[
            <>
              <strong>GitHub:</strong> OAuth authentication and access to public
              repository data, according to GitHub&apos;s own policies.
            </>,
            "hosting, database, logging, CDN, and infrastructure providers;",
            "Sentry or an equivalent observability tool, when enabled;",
            "authorities, courts, or third parties when required by law, competent order, or defense of rights.",
          ]}
        />
        <p>dotti.work does not sell personal data.</p>
      </LegalSection>

      <LegalSection title="7. Cookies and local technologies">
        <p>
          The backend may use an HttpOnly session cookie, Secure in production,
          SameSite=Lax, and minimum scope to keep the user authenticated. This
          cookie is necessary for account security and functionality.
        </p>
        <p>
          The front end may use <code>localStorage</code> for theme, filters,
          profile, saved projects, ignored projects, and local history. The user
          can clear this data through the browser or app controls when
          available. Non-essential cookies or replays should depend on prior
          consent when enabled.
        </p>
      </LegalSection>

      <LegalSection title="8. Retention and deletion">
        <p>
          Local data remains in the browser until the user clears it, uses a
          reset action, or removes site storage. Authenticated account data may
          remain while the account is active and for the period necessary to
          comply with legal obligations, security, audit, and defense of rights.
        </p>
        <p>
          The planned backend architecture includes user data export and account
          deletion with session revocation and soft delete. Final retention
          periods for logs, backups, caches, and monitoring must be published
          before production operation.
        </p>
      </LegalSection>

      <LegalSection title="9. Data subject rights">
        <p>
          The LGPD recognizes rights such as confirmation of processing, access,
          correction, portability, deletion, information about sharing, consent
          revocation, objection, and review of automated decisions when
          applicable.
        </p>
        <p>
          Users may exercise these rights through app controls when available or
          through the privacy contact. dotti.work recommendations are based on
          technical and deterministic criteria, such as stack, difficulty,
          issues, activity, and repository health.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          GitHub, Sentry, hosting providers, and other processors may process
          data outside Brazil. When this happens, dotti.work must adopt
          mechanisms compatible with the LGPD and appropriate processor
          agreements.
        </p>
      </LegalSection>

      <LegalSection title="11. Security">
        <p>
          dotti.work adopts or plans to adopt measures such as HTTPS in
          production, HttpOnly and Secure cookies, restricted CORS, input
          validation, backend token encryption, reduced personal data in logs,
          and error monitoring with masking of sensitive information.
        </p>
      </LegalSection>

      <LegalSection title="12. Children and teenagers">
        <p>
          dotti.work is not directed to children. People who do not have legal
          capacity to accept these terms should use the service only with
          authorization and supervision from a legal guardian.
        </p>
      </LegalSection>

      <LegalSection title="13. References">
        <LegalList
          items={[
            <>
              <LegalLink href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm">
                Brazilian General Personal Data Protection Law - LGPD
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1">
                ANPD - Data Subjects
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf">
                ANPD - Cookies Guidance
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub General Privacy Statement
              </LegalLink>
            </>,
          ]}
        />
      </LegalSection>
    </>
  );
}
