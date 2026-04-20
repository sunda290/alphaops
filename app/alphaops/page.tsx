import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import LeadForm from '@/components/ui/LeadForm'
import styles from './alphaops.module.css'

export const metadata: Metadata = {
  title: 'AlphaOps — Operação no Nível Alpha',
  description: 'O sistema que centraliza, padroniza e automatiza os processos internos da sua empresa — para que você saia da execução e assuma o comando.',
}

export default function AlphaOpsPage() {
  return (
    <>
      <Nav variant="alphaops" />

      {/* HERO */}
      <section className={styles.hero} id="hero">
        <div className={styles.opsGrid} />
        <div className="container">
          <div className={styles.heroInner}>
            <div>
              <div className={styles.heroTag}>
                <span className="mono">Sistema Operacional v1.0</span>
              </div>
              <h1 className={styles.heroH1}>
                <span className={styles.alpha}>ALPHA</span>
                <span className={styles.ops}>OPS</span>
              </h1>
              <p className={styles.heroTagline}>
                Operação no nível Alpha
                <span className={styles.cursor} />
              </p>
              <p className={styles.heroDesc}>
                O sistema que centraliza, padroniza e automatiza os processos internos
                da sua empresa — para que você{' '}
                <strong>saia da execução e assuma o comando.</strong>
              </p>
              <div className={styles.heroBtns}>
                <a href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico" className={styles.btnOps}>
                  → Contratar o AlphaOps
                </a>
                <a href="#solution" className={styles.btnGhost}>
                  Ver como funciona
                </a>
              </div>
            </div>

            <div className={styles.terminal}>
              <div className={styles.termBar}>
                <span className={`${styles.dot} ${styles.dotR}`} />
                <span className={`${styles.dot} ${styles.dotY}`} />
                <span className={`${styles.dot} ${styles.dotG}`} />
                <span className={styles.termTitle}>alphaops — diagnóstico@operação</span>
              </div>
              <div className={styles.termBody}>
                {[
                  { prompt: true, text: 'scan --empresa ./operacao' },
                  { out: true, text: '> mapeando processos internos...' },
                  { out: true, text: '[!] tarefas manuais detectadas: 14', red: true },
                  { out: true, text: '[!] gargalos críticos: 3', red: true },
                  { out: true, text: '[!] dependência do dono: 89%', red: true },
                  { gap: true },
                  { prompt: true, text: 'deploy alphaops --modo=full' },
                  { out: true, text: '[✓] processos automatizados', green: true },
                  { out: true, text: '[✓] operação sem o dono', green: true },
                  { out: true, text: '[✓] missão cumprida', green: true },
                ].map((line, i) => (
                  <div key={i} className={`${styles.termLine} ${line.gap ? styles.termGap : ''}`}>
                    {line.prompt && <span className={styles.termPrompt}>$</span>}
                    {line.out && <span className={styles.termOut} />}
                    <span className={`${styles.termText} ${line.red ? styles.termRed : ''} ${line.green ? styles.termGreen : ''}`}>
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className={`${styles.section} ${styles.sectionLight}`} id="solution">
        <div className="container">
          <span className="mono">// O Sistema</span>
          <h2 className={styles.sectionH2}>
            O que o <em>AlphaOps</em> entrega
          </h2>
          <div className={styles.featuresGrid}>
            {[
              { code: 'mapeamento', title: 'Mapa Operacional', desc: 'Processos documentados e executáveis por qualquer membro da equipe — sem depender do dono.' },
              { code: 'automação', title: 'Automação de Rotinas', desc: 'Tarefas repetitivas executadas automaticamente — relatórios, notificações e controles.' },
              { code: 'visibilidade', title: 'Dashboard de Comando', desc: 'Visibilidade total em tempo real. Você vê tudo sem precisar perguntar para ninguém.' },
              { code: 'integração', title: 'Integração Completa', desc: 'Conecta-se com as ferramentas que você já usa — sem jogar fora o que funciona.' },
              { code: 'IA', title: 'IA Integrada', desc: 'Triagem de demandas, relatórios automáticos e atendimento inteligente onde gera resultado.' },
            ].map(f => (
              <div key={f.code} className={styles.featureCard}>
                <div className={styles.featureCode}>// {f.code}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.section} id="pricing">
        <div className="container">
          <span className="mono">// Investimento</span>
          <h2 className={styles.sectionH2}>Escolha sua <em>missão</em></h2>

          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingTier}>// entrada</div>
              <div className={styles.pricingName}>Diagnóstico</div>
              <p className={styles.pricingDesc}>
                60 minutos para mapear seus gargalos e sair com o plano de automação.
              </p>
              <div className={styles.pricingPrice}>Gratuito</div>
              <div className={styles.pricingPeriod}>vagas limitadas por mês</div>
              <LeadForm
                origem="alphaops"
                produto="consultoria"
                ctaText="→ Agendar Diagnóstico"
                showFields={['nome', 'email', 'telefone']}
              />
            </div>

            <div className={`${styles.pricingCard} ${styles.pricingMain}`}>
              <div className={styles.pricingBadge}>RECOMENDADO</div>
              <div className={styles.pricingTier}>// sistema completo</div>
              <div className={styles.pricingName}>AlphaOps Full</div>
              <p className={styles.pricingDesc}>
                Sistema customizado desenvolvido do zero. Entrega completa com suporte.
              </p>
              <div className={styles.pricingPrice}>Sob Consulta</div>
              <div className={styles.pricingPeriod}>começa pelo diagnóstico gratuito</div>
              <LeadForm
                origem="alphaops"
                produto="alphaops_full"
                ctaText="→ Quero o AlphaOps Full"
                showFields={['nome', 'email', 'telefone', 'empresa']}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerLogo}>
            <span className={styles.alpha}>ALPHA</span>OPS
          </div>
          <div className={styles.footerBy}>by André de Souza Oliveira</div>
          <div className={styles.footerCopy}>© 2025 AlphaOps</div>
        </div>
      </footer>
    </>
  )
}
