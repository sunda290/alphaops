import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import LeadForm from '@/components/ui/LeadForm'
import styles from './hotelaria.module.css'

export const metadata: Metadata = {
  title: 'AlphaOps Hotelaria — Tecnologia que Transforma Hotéis',
  description: 'Automação operacional, sistemas customizados e dashboard em tempo real para hotéis que querem parar de improvisar e operar com padrão de excelência.',
}

const PILARES = [
  {
    num: 'I',
    title: 'Automação com IA',
    prob: 'Atendimento lento, relatórios manuais, follow-up que não acontece.',
    entrega: 'Atendimento 24h automático, relatório diário gerado sem intervenção, follow-up pós-estadia que aumenta avaliações.',
  },
  {
    num: 'II',
    title: 'Sistema Customizado',
    prob: 'Sistemas isolados que não conversam. Processos que dependem de quem os criou.',
    entrega: 'Plataforma desenvolvida sob medida integrando reservas, gestão interna e comunicação de equipe.',
  },
  {
    num: 'III',
    title: 'Dashboard em Tempo Real',
    prob: 'Gestor que descobre o problema quando o hóspede já reclamou.',
    entrega: 'Painel ao vivo com ocupação, receita por canal, avaliações e alertas operacionais — no celular.',
  },
]

export default function HotelariaPage() {
  return (
    <>
      <Nav variant="hotelaria" />

      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div>
              <span className={styles.eyebrow}>Setor Hoteleiro</span>
              <h1 className={styles.heroH1}>
                Tecnologia que<br />
                <em>transforma hotéis.</em>
              </h1>
              <p className={styles.heroSub}>
                Automação Operacional · Sistemas Customizados · Dashboard em Tempo Real
              </p>
              <p className={styles.heroDesc}>
                A maioria dos hotéis ainda gerencia operações críticas de forma manual.
                O custo disso aparece na avaliação do hóspede, na diária que não sobe
                e na equipe que não escala.
              </p>
              <a href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico" className={styles.btnPrimary}>
                → Quero meu Diagnóstico Gratuito
              </a>
              <p className={styles.heroNote}>
                Atendimento por indicação · Vagas limitadas · 100% remoto
              </p>
            </div>

            <div className={styles.heroStats}>
              {[
                { num: '15–25%', label: 'Comissão OTA evitável', sub: 'com sistema de reserva direta' },
                { num: '480h', label: 'Desperdiçadas por ano', sub: 'em trabalho manual evitável' },
                { num: '< 7d', label: 'Para ver resultado', sub: 'do Módulo I em produção' },
              ].map(s => (
                <div key={s.num} className={styles.statBox}>
                  <div className={styles.statNum}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statSub}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className={`${styles.section} ${styles.sectionLight}`} id="problema">
        <div className="container">
          <h2 className={styles.sectionH2}>
            Quatro gargalos que<br /><em>custam receita todo dia.</em>
          </h2>
          <div className={styles.problemGrid}>
            {[
              { n: '01', t: 'Operação dependente do gestor', d: 'Quando o gestor não está presente, decisões travam e processos quebram.' },
              { n: '02', t: 'Trabalho manual que não escala', d: 'Relatórios feitos à mão consomem horas que poderiam estar no hóspede.' },
              { n: '03', t: 'Visibilidade zero em tempo real', d: 'Taxa de ocupação e receita são consultados horas depois do momento certo.' },
              { n: '04', t: 'Sistemas que não conversam', d: 'PMS, channel manager e ferramentas internas funcionam como ilhas.' },
            ].map(p => (
              <div key={p.n} className={styles.problemCard}>
                <div className={styles.problemNum}>{p.n}</div>
                <h3 className={styles.problemTitle}>{p.t}</h3>
                <p className={styles.problemDesc}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className={styles.section} id="pilares">
        <div className="container">
          <h2 className={styles.sectionH2}>
            Três pilares.<br /><em>Uma operação integrada.</em>
          </h2>
          <div className={styles.pilaresGrid}>
            {PILARES.map(p => (
              <div key={p.num} className={styles.pilarCard}>
                <div className={styles.pilarNum}>{p.num}</div>
                <h3 className={styles.pilarTitle}>{p.title}</h3>
                <div className={styles.pilarSection}>
                  <span className={styles.pilarLabel}>O PROBLEMA</span>
                  <p>{p.prob}</p>
                </div>
                <div className={styles.pilarSection}>
                  <span className={styles.pilarLabel}>O QUE ENTREGAMOS</span>
                  <p>{p.entrega}</p>
                </div>
                <div className={styles.pilarRemote}>100% remoto</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTIMENTO */}
      <section className={`${styles.section} ${styles.sectionLight}`} id="investimento">
        <div className="container">
          <div className={styles.investGrid}>
            <div>
              <h2 className={styles.sectionH2}>
                Comece pelo<br /><em>diagnóstico.</em>
              </h2>
              <p className={styles.investDesc}>
                60 minutos. Mapeamos sua operação, calculamos o que está sendo
                desperdiçado e você sai com o plano exato — sem custo, sem compromisso.
              </p>
              <div className={styles.cronograma}>
                {[
                  { fase: 'Fase 01', prazo: 'Dias 1–7', titulo: 'Automação com IA' },
                  { fase: 'Fase 02', prazo: 'Dias 7–21', titulo: 'Dashboard em Tempo Real' },
                  { fase: 'Fase 03', prazo: 'Dias 21–45', titulo: 'Sistema Customizado' },
                ].map(f => (
                  <div key={f.fase} className={styles.cronoItem}>
                    <div className={styles.cronoFase}>{f.fase}</div>
                    <div className={styles.cronoPrazo}>{f.prazo}</div>
                    <div className={styles.cronoTitulo}>{f.titulo}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formBox}>
              <div className={styles.formBoxTitle}>// Diagnóstico Gratuito</div>
              <LeadForm
                origem="hotelaria"
                produto="hotelaria"
                ctaText="→ Quero meu Diagnóstico"
                showFields={['nome', 'email', 'telefone', 'empresa']}
              />
              <p className={styles.formNote}>
                Atendimento por indicação · André atende pessoalmente · Vagas limitadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerLogo}>André<span>.</span>Oliveira</div>
          <div className={styles.footerBy}>AlphaOps · Hotelaria</div>
          <div className={styles.footerCopy}>© 2025</div>
        </div>
      </footer>
    </>
  )
}
