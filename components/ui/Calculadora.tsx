'use client'
import { useState } from 'react'
import styles from './Calculadora.module.css'

export default function Calculadora() {
  const [horas, setHoras]  = useState(2)
  const [valor, setValor]  = useState(200)

  const semanas     = 48
  const totalHoras  = horas * 5 * semanas          // 5 dias úteis
  const custoAnual  = totalHoras * valor

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <div className={styles.box}>
      <div className={styles.title}>// Calculadora de custo operacional</div>

      <div className={styles.sliderGroup}>
        <div className={styles.sliderLabel}>
          <span>Horas manuais por dia</span>
          <span className={styles.sliderVal}>{horas}h</span>
        </div>
        <input
          type="range" min={0.5} max={8} step={0.5}
          value={horas}
          onChange={e => setHoras(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderTicks}>
          <span>0.5h</span><span>4h</span><span>8h</span>
        </div>
      </div>

      <div className={styles.sliderGroup}>
        <div className={styles.sliderLabel}>
          <span>Valor da sua hora</span>
          <span className={styles.sliderVal}>{fmt(valor).replace('R$\u00a0','R$ ')}</span>
        </div>
        <input
          type="range" min={50} max={1000} step={50}
          value={valor}
          onChange={e => setValor(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderTicks}>
          <span>R$50</span><span>R$500</span><span>R$1k</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <span>Horas desperdiçadas/ano</span>
        <span className={styles.rowVal}>{totalHoras}h</span>
      </div>
      <div className={styles.row}>
        <span>Semanas trabalhadas</span>
        <span className={styles.rowVal}>{semanas}</span>
      </div>
      <div className={`${styles.row} ${styles.rowHighlight}`}>
        <span>Custo real do manual</span>
        <span className={styles.rowHighlightVal}>{fmt(custoAnual)}</span>
      </div>

      <p className={styles.note}>
        Esse é o custo real de não automatizar. Em reais. Por ano.
      </p>
    </div>
  )
}
