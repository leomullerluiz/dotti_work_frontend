import type { Metadata } from "next";
import {
  LegalDocument,
  LegalLink,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalDocument";

const contactEmail = "privacidade@dotti.work";

const pt = {
  title: "Termos de Uso",
  description:
    "Estes termos definem as regras de acesso e uso do dotti.work, uma aplicacao para descobrir, avaliar e acompanhar oportunidades de contribuicao em projetos open source.",
  updatedAt: "3 de julho de 2026",
};

const en = {
  title: "Terms of Use",
  description:
    "These terms define the rules for accessing and using dotti.work, an application for discovering, evaluating, and tracking open source contribution opportunities.",
  updatedAt: "July 3, 2026",
};

export const metadata: Metadata = {
  title: "Termos de Uso - dotti.work",
  description:
    "Condicoes para usar o dotti.work, incluindo conta GitHub, recomendacoes, dados de repositorios e responsabilidades do usuario.",
};

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <LegalDocument en={en} pt={pt}>
      <div className="legal-pt space-y-10" lang="pt-BR">
        <TermsContentPt />
      </div>
      <div className="legal-en space-y-10" lang="en-US">
        <TermsContentEn />
      </div>
    </LegalDocument>
  );
}

function TermsContentPt() {
  return (
    <>
      <LegalSection title="1. Aceite dos termos">
        <p>
          Ao acessar ou usar o dotti.work, voce concorda com estes Termos de Uso
          e com a Politica de Privacidade. Se voce nao concordar, nao use o
          servico.
        </p>
        <p>
          Esta versao foi preparada para o estagio atual do produto e deve ser
          revisada juridicamente antes da operacao publica com usuarios reais.
        </p>
      </LegalSection>

      <LegalSection title="2. O que e o dotti.work">
        <p>
          O dotti.work ajuda desenvolvedores a encontrar repositorios open source
          compativeis com seu perfil tecnico, senioridade, tecnologias,
          preferencias e objetivos de contribuicao. O servico pode usar dados
          publicos do GitHub, dados informados pelo usuario e um algoritmo de
          matching para sugerir projetos e issues.
        </p>
        <p>
          As recomendacoes sao informativas. Elas nao garantem que um projeto
          aceitara contribuicoes, que uma issue estara disponivel, que o
          repositorio e seguro ou que uma contribuicao sera aprovada.
        </p>
      </LegalSection>

      <LegalSection title="3. Conta e login pelo GitHub">
        <p>
          O login principal do dotti.work e feito por GitHub OAuth. Voce deve
          manter sua conta GitHub segura e cumprir os termos, politicas e regras
          do GitHub ao usar integracoes, repositorios, issues e pull requests.
        </p>
        <p>
          O dotti.work nao solicita senha do GitHub. Tokens de integracao, quando
          existirem, devem ser tratados pelo backend e nao devem ser armazenados
          no navegador.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso permitido">
        <p>
          Voce concorda em usar o dotti.work apenas para finalidades licitas e
          compativeis com o produto, incluindo:
        </p>
        <LegalList
          items={[
            "configurar seu perfil tecnico e preferencias de contribuicao;",
            "explorar repositorios e issues publicas;",
            "salvar, ignorar, acompanhar e registrar seu progresso em projetos;",
            "exportar ou importar dados proprios quando a funcionalidade estiver disponivel.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Usos proibidos">
        <p>Voce nao deve:</p>
        <LegalList
          items={[
            "tentar acessar contas, dados, tokens, sessoes ou sistemas de terceiros sem autorizacao;",
            "interferir na seguranca, disponibilidade ou integridade do dotti.work, da API, do GitHub ou de provedores relacionados;",
            "usar automacoes abusivas, scraping excessivo, engenharia reversa indevida ou contornar limites tecnicos;",
            "inserir dados sensiveis, segredos, tokens, senhas ou informacoes de terceiros sem base legal;",
            "usar recomendacoes para spam, assedio, violacao de licencas, fraude, malware ou atividades ilicitas;",
            "fingir identidade, manipular metricas ou tentar burlar mecanismos de autenticacao.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Conteudo e dados informados pelo usuario">
        <p>
          Voce e responsavel pela veracidade e licitude dos dados que informa no
          dotti.work. Ao fornecer perfil, tecnologias, preferencias, historico ou
          dados importados, voce autoriza o tratamento dessas informacoes para
          prestar o servico, gerar recomendacoes, manter estados de projetos e
          permitir exportacao ou exclusao.
        </p>
        <p>
          Evite inserir dados sensiveis ou informacoes confidenciais em campos
          livres. O dotti.work pode remover ou limitar dados que violem estes
          Termos, a lei ou direitos de terceiros.
        </p>
      </LegalSection>

      <LegalSection title="7. Dados de terceiros e repositorios open source">
        <p>
          Repositorios, issues, labels, licencas, readmes e demais conteudos do
          GitHub pertencem aos respectivos titulares e comunidades. O dotti.work
          apenas organiza e apresenta sinais publicos ou autorizados para ajudar
          na descoberta de oportunidades.
        </p>
        <p>
          Antes de contribuir, leia a licenca, o codigo de conduta, o guia de
          contribuicao e as regras do repositorio. Voce e responsavel pelas suas
          contribuicoes, interacoes e pull requests.
        </p>
      </LegalSection>

      <LegalSection title="8. Servicos de terceiros">
        <p>
          O dotti.work pode depender de servicos de terceiros, incluindo GitHub,
          hospedagem, banco de dados, observabilidade e provedores de
          infraestrutura. Esses servicos podem ter termos e politicas proprios.
        </p>
        <LegalList
          items={[
            <>
              <LegalLink href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service">
                Termos de Servico do GitHub
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                Politica de Privacidade do GitHub
              </LegalLink>
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Disponibilidade e mudancas">
        <p>
          O dotti.work pode mudar, suspender, limitar ou descontinuar
          funcionalidades, especialmente durante fases de prototipo, beta ou
          integracao com backend. Tambem pode haver indisponibilidade por
          manutencao, incidentes, limites de API, falhas do GitHub ou problemas
          de infraestrutura.
        </p>
      </LegalSection>

      <LegalSection title="10. Propriedade intelectual">
        <p>
          A marca, interface, textos, organizacao visual, codigo proprietario e
          documentacao do dotti.work pertencem aos seus respectivos titulares. O
          uso do app nao transfere direitos sobre esses materiais.
        </p>
        <p>
          Bibliotecas, icones, frameworks, dados publicos do GitHub e projetos
          open source exibidos no app continuam sujeitos as suas proprias
          licencas e creditos.
        </p>
      </LegalSection>

      <LegalSection title="11. Privacidade">
        <p>
          O tratamento de dados pessoais e descrito na{" "}
          <a
            className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            href="/privacy"
          >
            Politica de Privacidade
          </a>
          . Ao usar o servico, voce reconhece que dados de perfil, GitHub,
          preferencias, estados e historico podem ser tratados para operar o
          dotti.work.
        </p>
      </LegalSection>

      <LegalSection title="12. Encerramento e exclusao">
        <p>
          Voce pode parar de usar o dotti.work a qualquer momento. Quando as
          funcionalidades autenticadas estiverem ativas, o app devera oferecer
          meios para logout, exportacao de dados e solicitacao de exclusao de
          conta, conforme a Politica de Privacidade.
        </p>
        <p>
          O dotti.work pode suspender ou limitar acesso em caso de violacao
          destes Termos, risco a seguranca, ordem legal ou uso abusivo.
        </p>
      </LegalSection>

      <LegalSection title="13. Limitacoes de responsabilidade">
        <p>
          Na maxima extensao permitida pela legislacao aplicavel, o dotti.work
          nao se responsabiliza por decisoes tomadas com base em recomendacoes,
          alteracoes em repositorios de terceiros, rejeicao de contribuicoes,
          indisponibilidade de APIs externas, conteudo de projetos open source ou
          perdas decorrentes de uso indevido do servico.
        </p>
        <p>
          Nada nestes Termos exclui direitos que nao possam ser renunciados por
          lei.
        </p>
      </LegalSection>

      <LegalSection title="14. Alteracoes destes termos">
        <p>
          Estes Termos podem ser atualizados para refletir mudancas no produto,
          na legislacao, em integracoes ou em medidas de seguranca. A versao
          publicada nesta pagina indicara a data de atualizacao.
        </p>
      </LegalSection>

      <LegalSection title="15. Lei aplicavel e contato">
        <p>
          Estes Termos serao interpretados conforme as leis brasileiras.
          Eventuais conflitos serao resolvidos pelo foro competente conforme a
          legislacao aplicavel.
        </p>
        <p>
          Para assuntos relacionados a estes Termos, privacidade ou dados
          pessoais, entre em contato por{" "}
          <a
            className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}

function TermsContentEn() {
  return (
    <>
      <LegalSection title="1. Acceptance of the terms">
        <p>
          By accessing or using dotti.work, you agree to these Terms of Use and
          to the Privacy Policy. If you do not agree, do not use the service.
        </p>
        <p>
          This version was prepared for the product&apos;s current stage and
          should be legally reviewed before public operation with real users.
        </p>
      </LegalSection>

      <LegalSection title="2. What dotti.work is">
        <p>
          dotti.work helps developers find open source repositories that match
          their technical profile, seniority, technologies, preferences, and
          contribution goals. The service may use public GitHub data, data
          provided by the user, and a matching algorithm to suggest projects and
          issues.
        </p>
        <p>
          Recommendations are informational. They do not guarantee that a project
          will accept contributions, that an issue will remain available, that a
          repository is secure, or that a contribution will be approved.
        </p>
      </LegalSection>

      <LegalSection title="3. Account and GitHub login">
        <p>
          dotti.work&apos;s main login flow uses GitHub OAuth. You must keep
          your GitHub account secure and comply with GitHub&apos;s terms,
          policies, and rules when using integrations, repositories, issues, and
          pull requests.
        </p>
        <p>
          dotti.work does not ask for your GitHub password. Integration tokens,
          when they exist, should be handled by the backend and should not be
          stored in the browser.
        </p>
      </LegalSection>

      <LegalSection title="4. Permitted use">
        <p>
          You agree to use dotti.work only for lawful purposes compatible with
          the product, including:
        </p>
        <LegalList
          items={[
            "setting up your technical profile and contribution preferences;",
            "exploring public repositories and issues;",
            "saving, ignoring, tracking, and recording your progress on projects;",
            "exporting or importing your own data when the feature is available.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Prohibited use">
        <p>You must not:</p>
        <LegalList
          items={[
            "try to access accounts, data, tokens, sessions, or third-party systems without authorization;",
            "interfere with the security, availability, or integrity of dotti.work, the API, GitHub, or related providers;",
            "use abusive automation, excessive scraping, improper reverse engineering, or attempts to bypass technical limits;",
            "enter sensitive data, secrets, tokens, passwords, or third-party information without a legal basis;",
            "use recommendations for spam, harassment, license violations, fraud, malware, or illegal activities;",
            "impersonate others, manipulate metrics, or attempt to bypass authentication mechanisms.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. User-provided content and data">
        <p>
          You are responsible for the accuracy and lawfulness of the data you
          provide to dotti.work. By providing profile data, technologies,
          preferences, history, or imported data, you authorize processing of
          that information to provide the service, generate recommendations,
          maintain project states, and allow export or deletion.
        </p>
        <p>
          Avoid entering sensitive data or confidential information in free-form
          fields. dotti.work may remove or limit data that violates these Terms,
          the law, or third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-party data and open source repositories">
        <p>
          Repositories, issues, labels, licenses, readmes, and other GitHub
          content belong to their respective owners and communities. dotti.work
          only organizes and presents public or authorized signals to help users
          discover opportunities.
        </p>
        <p>
          Before contributing, read the repository license, code of conduct,
          contribution guide, and project rules. You are responsible for your
          contributions, interactions, and pull requests.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-party services">
        <p>
          dotti.work may depend on third-party services, including GitHub,
          hosting, databases, observability, and infrastructure providers. These
          services may have their own terms and policies.
        </p>
        <LegalList
          items={[
            <>
              <LegalLink href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service">
                GitHub Terms of Service
              </LegalLink>
            </>,
            <>
              <LegalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub Privacy Statement
              </LegalLink>
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Availability and changes">
        <p>
          dotti.work may change, suspend, limit, or discontinue features,
          especially during prototype, beta, or backend integration phases. The
          service may also be unavailable due to maintenance, incidents, API
          limits, GitHub failures, or infrastructure issues.
        </p>
      </LegalSection>

      <LegalSection title="10. Intellectual property">
        <p>
          The dotti.work brand, interface, text, visual organization,
          proprietary code, and documentation belong to their respective owners.
          Use of the app does not transfer rights over these materials.
        </p>
        <p>
          Libraries, icons, frameworks, public GitHub data, and open source
          projects displayed in the app remain subject to their own licenses and
          credits.
        </p>
      </LegalSection>

      <LegalSection title="11. Privacy">
        <p>
          Personal data processing is described in the{" "}
          <a
            className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            href="/privacy"
          >
            Privacy Policy
          </a>
          . By using the service, you acknowledge that profile, GitHub,
          preference, state, and history data may be processed to operate
          dotti.work.
        </p>
      </LegalSection>

      <LegalSection title="12. Termination and deletion">
        <p>
          You may stop using dotti.work at any time. When authenticated features
          are active, the app should provide ways to log out, export data, and
          request account deletion, as described in the Privacy Policy.
        </p>
        <p>
          dotti.work may suspend or limit access in case of violation of these
          Terms, security risk, legal order, or abusive use.
        </p>
      </LegalSection>

      <LegalSection title="13. Limitations of liability">
        <p>
          To the maximum extent permitted by applicable law, dotti.work is not
          responsible for decisions made based on recommendations, changes in
          third-party repositories, rejected contributions, unavailability of
          external APIs, open source project content, or losses arising from
          misuse of the service.
        </p>
        <p>
          Nothing in these Terms excludes rights that cannot be waived by law.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to these terms">
        <p>
          These Terms may be updated to reflect changes in the product, law,
          integrations, or security measures. The version published on this page
          will indicate its update date.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing law and contact">
        <p>
          These Terms will be interpreted under Brazilian law. Any disputes will
          be resolved by the competent venue under applicable law.
        </p>
        <p>
          For matters related to these Terms, privacy, or personal data, contact
          us at{" "}
          <a
            className="font-medium text-coral-600 underline-offset-4 hover:underline dark:text-coral-300"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}
