import { notFound } from 'next/navigation'
import { db } from '@/lib/firebase-admin'
import { Metadata } from 'next'
import DemoClient from './DemoClient'

export const metadata: Metadata = {
  title: 'AlphaOps · Demo',
  description: 'Demonstração privada AlphaOps',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DemoPage({ params }: Props) {
  const { slug } = await params

  const doc = await db.collection('demos').doc(slug).get()

  if (!doc.exists) {
    notFound()
  }

  const data = doc.data()

  if (!data?.ativo) {
    notFound()
  }

  const demoData = {
    slug,
    cliente: data.cliente || '',
    contato: data.contato || '',
    tipo: data.tipo || 'geral',
    cenarios: data.cenarios || [],
    cores: data.cores || null,
    mensagem_topo: data.mensagem_topo || null,
  }

  return <DemoClient demo={demoData} />
}
