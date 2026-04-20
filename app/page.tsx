import Nav from '@/components/layout/Nav'
import LeadForm from '@/components/ui/LeadForm'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <Nav variant="default" />

      {/* HERO */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroGrid} />
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.heroTag}>
                <span className="mono">Automação Operacional</span>
              </div>
              <h1 className={styles.heroH1}>
                Donos de empresas<br />
                não deveriam<br />
                <em>trabalhar como<br />operadores.</em>
              </h1>
              <p className={styles.heroSub}>
                Construo <strong>sistemas sob medida</strong> que eliminam o trabalho manual do seu negócio — usando IA e desenvolvimento Full Stack — para que você pare de operar e comece a crescer.
              </p>
              <div className={styles.heroBtns}>
                <a href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico" className={styles.btnPrimary}>Quero meu Diagnóstico →</a>
                <a href="#produtos" className={styles.btnSecondary}>Ver soluções</a>
              </div>
              <div className={styles.credential}>
                <div className={styles.credentialBadge}>⬡</div>
                <div className={styles.credentialText}>
                  <strong>Metodologia da Infantaria do Exército Brasileiro</strong>
                  Executada com tecnologia de vanguarda — IA e Full Stack
                </div>
              </div>
            </div>
            <div className={styles.heroPanel}>
              <div className={styles.statCard}>
                <span className="mono">Custo do manual</span>
                <div className={styles.statNumber}><span>480</span>h</div>
                <div className={styles.statLabel}>horas desperdiçadas por ano com tarefas manuais de 2h/dia</div>
              </div>
              <div className={`${styles.statCard} ${styles.statCardGold}`}>
                <span className="mono">Após automação</span>
                <div className={styles.statNumber}><span style={{color:'var(--gold)'}}>40</span>s</div>
                <div className={styles.statLabel}>para gerar relatórios que antes levavam 4 horas semanais</div>
              </div>
              <div className={styles.statCard}>
                <span className="mono">Retorno</span>
                <div className={styles.statNumber}><span>1ª</span></div>
                <div className={styles.statLabel}>semana — tempo médio para recuperar o investimento</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className={`${styles.section} ${styles.sectionDark}`} id="dor">
        <div className="container">
          <div className={styles.dorGrid}>
            <div>
              <div className={styles.sectionLabel}><span className="mono">Reconhecimento de Terreno</span></div>
              <h2 className={styles.sectionH2}>O problema<br />que você já <em>conhece</em></h2>
              <p className={styles.sectionLead}>Se você reconhece alguma dessas situações, sua empresa tem um problema sistêmico — não operacional.</p>
              <div className={styles.dorList}>
                {[
                  {n:'01',t:'Você é indispensável para tudo',d:'Quando você some por 2 dias, algo inevitavelmente quebra. A operação depende da sua presença — não de um sistema.'},
                  {n:'02',t:'Horas perdidas no manual',d:'Tarefas repetitivas que poderiam ser feitas por um sistema estão consumindo seu tempo e o da sua equipe todo dia.'},
                  {n:'03',t:'Processo que só você domina',d:'Planilhas complexas, rotinas não documentadas — a empresa não escala assim.'},
                  {n:'04',t:'Sabe que precisa mudar',d:'Já tentou ferramentas que não funcionaram. O problema não é esforço — é falta do sistema certo.'},
                ].map(item => (
                  <div key={item.n} className={styles.dorItem}>
                    <div className={styles.dorIcon}>{item.n}</div>
                    <div><strong>{item.t}</strong><p>{item.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.calcBox}>
              <div className={styles.calcTitle}>// Calculadora de custo operacional</div>
              {[
                {l:'Horas manuais por dia',v:'2h'},
                {l:'Semanas por ano',v:'48'},
                {l:'Total desperdiçado',v:'480h'},
                {l:'Se sua hora vale R$200',v:'R$96k',highlight:true},
              ].map(row => (
                <div key={row.l} className={`${styles.calcRow} ${row.highlight ? styles.calcRowHighlight : ''}`}>
                  <span>{row.l}</span>
                  <span className={styles.calcVal}>{row.v}</span>
                </div>
              ))}
              <p className={styles.calcNote}>Esse é o custo real de não automatizar. Em reais. Por ano.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className={styles.section} id="produtos">
        <div className="container">
          <div className={styles.sectionLabel}><span className="mono">Soluções disponíveis</span></div>
          <h2 className={styles.sectionH2}>Três formas de<br /><em>transformar</em> sua operação</h2>
          <div className={styles.produtosGrid}>
            {[
              {num:'// 01',tag:'Entrada',featured:false,title:'Operação de Precisão',desc:'O guia militar para automatizar seu negócio.',price:'R$ 47',priceNote:'Acesso imediato',cta:'Quero o E-book →',href:'#',items:['Framework de mapeamento de processos','Calculadora de ROI de automação','Plano de implementação em 4 semanas','Templates e checklists prontos']},
              {num:'// 02',tag:'Recomendado',featured:true,title:'Diagnóstico Estratégico',desc:'Sessão individual de 60 minutos. Você sai com o mapa completo de automação — e o ROI calculado.',price:'Gratuito',priceNote:'Vagas limitadas',cta:'Agendar Diagnóstico →',href:'#metodo',items:['Mapeamento cirúrgico da operação','Cálculo de ROI em tempo real','Plano de ação personalizado','Gravação da sessão','Atendimento direto com André']},
              {num:'// 03',tag:'Alto Ticket',featured:false,title:'AlphaOps — Sistema Customizado',desc:'Desenvolvimento sob medida que substitui trabalho manual e escala sua operação.',price:'Sob consulta',priceNote:'Começa pelo diagnóstico',cta:'Conhecer o AlphaOps →',href:'/alphaops',items:['Sistema 100% customizado','Automação de ponta a ponta','Dashboard de comando','IA integrada','Suporte pós-implementação']},
            ].map(p => (
              <div key={p.num} className={`${styles.produtoCard} ${p.featured ? styles.produtoFeatured : ''}`}>
                <div className={styles.produtoNum}>{p.num}</div>
                <div className={styles.produtoTag}>{p.tag}</div>
                <h3 className={styles.produtoTitle}>{p.title}</h3>
                <p className={styles.produtoDesc}>{p.desc}</p>
                <ul className={styles.produtoFeatures}>{p.items.map(i => <li key={i}>{i}</li>)}</ul>
                <div className={styles.produtoPrice}>{p.price}</div>
                <div className={styles.produtoPriceNote}>{p.priceNote}</div>
                <a href={p.href} className={`${styles.produtoCta} ${p.featured ? styles.produtoCtaSolid : styles.produtoCtaOutline}`}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTODO */}
      <section className={`${styles.section} ${styles.sectionDark}`} id="metodo">
        <div className="container">
          <div className={styles.metodoGrid}>
            <div>
              <div className={styles.sectionLabel}><span className="mono">O processo</span></div>
              <h2 className={styles.sectionH2}>O método em<br /><em>3 movimentos</em></h2>
              {[
                {n:'01',t:'Reconhecimento',d:'Mapeamento cirúrgico da operação atual. Identificamos onde o tempo está sendo desperdiçado e calculamos o custo real.',dur:'20 minutos'},
                {n:'02',t:'Diagnóstico',d:'Cálculo de ROI de cada ponto de automação. Você sabe exatamente quanto cada gargalo custa por mês.',dur:'20 minutos'},
                {n:'03',t:'Plano de Ação',d:'Mapa completo: o que automatizar, com qual ferramenta, em qual ordem. Com ou sem minha ajuda na execução.',dur:'20 minutos'},
              ].map(s => (
                <div key={s.n} className={styles.step}>
                  <div className={styles.stepNum}>{s.n}</div>
                  <div>
                    <div className={styles.stepTitle}>{s.t}</div>
                    <p className={styles.stepDesc}>{s.d}</p>
                    <div className={styles.stepDur}>{s.dur}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className={styles.briefingBox}>
                <div className={styles.briefingTitle}>// Briefing da sessão</div>
                {[
                  {k:'Formato',v:'Videochamada ao vivo'},
                  {k:'Duração',v:'60 minutos exatos'},
                  {k:'Conduzido por',v:'André pessoalmente'},
                  {k:'Entregável',v:'Mapa + ROI calculado'},
                  {k:'Investimento',v:'Gratuito*'},
                  {k:'Garantia',v:'Devolução se não entregar clareza'},
                ].map(r => (
                  <div key={r.k} className={styles.briefingRow}>
                    <span className={styles.briefingKey}>{r.k}</span>
                    <span className={styles.briefingVal}>{r.v}</span>
                  </div>
                ))}
                <div style={{marginTop:24}}>
                  <LeadForm origem="landing_page" produto="consultoria" ctaText="→ Agendar minha sessão agora" showFields={['nome','email','telefone']} />
                </div>
                <p className={styles.briefingNote}>*VAGAS LIMITADAS — ANDRÉ ATENDE PESSOALMENTE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.ctaFinal}>
        <div className="container" style={{textAlign:'center',position:'relative',zIndex:1}}>
          <div className={styles.sectionLabel} style={{justifyContent:'center'}}><span className="mono">Decisão</span></div>
          <h2 className={styles.ctaH2}>Sua operação ainda vai<br /><em>depender de você amanhã?</em></h2>
          <p className={styles.ctaSub}>Cada semana sem o sistema certo é mais horas dentro da operação — e menos tempo construindo o negócio que você quer ter.</p>
          <a href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico" className={styles.btnPrimary}>Quero meu Diagnóstico Gratuito</a>
          <div className={styles.ctaNote}>Sem enrolação · 60 minutos · Resultado concreto · Vagas limitadas</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerLogo}>André<span>.</span>Oliveira</div>
          <div className={styles.footerLinks}>
            <a href="/alphaops">AlphaOps</a>
            <a href="/hotelaria">Hotelaria</a>
            <a href="#produtos">E-book</a>
            <a href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico">Diagnóstico</a>
          </div>
          <div className={styles.footerCopy}>© 2026 André Oliveira</div>
        </div>
      </footer>
    </>
  )
}
