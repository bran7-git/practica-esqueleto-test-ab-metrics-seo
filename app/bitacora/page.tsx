import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  COOKIE,
  HASH_EXAMPLE_ID,
  TEST_CASE,
  VARIANTS,
  assignVariant,
  conversionRate,
  formatCount,
  formatPoints,
  formatRate,
  parseLog,
  rateGap,
  type Variant,
} from '@/lib/experiment'

export const metadata: Metadata = {
  title: 'Bitácora',
  robots: { index: false, follow: false },
}

const ROWS: Variant[] = ['a', 'b']

export default async function BitacoraPage() {
  const cookieStore = await cookies()
  const rawLog = cookieStore.get(COOKIE.log)?.value
  const realLog = parseLog(rawLog)

  const demoVariant = assignVariant(HASH_EXAMPLE_ID)

  return (
    <main id="contenido" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:py-14">
      <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
        Panel de Métricas · Experimento A/B
      </p>
      
      <h1 className="max-w-2xl font-serif text-4xl tracking-tight text-balance md:text-5xl">
        Bitácora de Resultados
      </h1>

      {/* Sección 1: Eventos Reales de la Sesión Actual */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl">Métricas Reales (En vivo)</h2>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 font-medium">Variante</th>
              <th className="py-2 font-medium">Impresiones</th>
              <th className="py-2 font-medium">Conversiones</th>
              <th className="py-2 font-medium">Tasa</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((variant) => (
              <tr key={variant} className="border-b border-border">
                <td className="py-3">
                  {variant.toUpperCase()} · {VARIANTS[variant].name}
                </td>
                <td className="py-3 font-mono">{formatCount(realLog[variant].impressions)}</td>
                <td className="py-3 font-mono">{formatCount(realLog[variant].conversions)}</td>
                <td className="py-3 font-mono">{formatRate(conversionRate(realLog[variant]))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="font-mono text-sm">
          Diferencia B − A: {formatPoints(rateGap(realLog))}
        </p>
      </section>

      {/* Sección 2: Caso de Prueba Fijo Obligatorio */}
      <section className="flex flex-col gap-4 pt-6 border-t border-border">
        <h2 className="font-serif text-2xl">Caso de Prueba Fijo (Evaluación)</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Cohorte fija de control para validar las fórmulas de cálculo de tasa y diferencia porcentual.
        </p>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 font-medium">Variante</th>
              <th className="py-2 font-medium">Impresiones</th>
              <th className="py-2 font-medium">Conversiones</th>
              <th className="py-2 font-medium">Tasa</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((variant) => (
              <tr key={variant} className="border-b border-border">
                <td className="py-3">
                  {variant.toUpperCase()} · {VARIANTS[variant].name}
                </td>
                <td className="py-3 font-mono">{formatCount(TEST_CASE[variant].impressions)}</td>
                <td className="py-3 font-mono">{formatCount(TEST_CASE[variant].conversions)}</td>
                <td className="py-3 font-mono">{formatRate(conversionRate(TEST_CASE[variant]))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="font-mono text-sm font-semibold">
          Diferencia B − A: {formatPoints(rateGap(TEST_CASE))}
        </p>
      </section>

      {/* Sección 3: Verificación de Hash Determinístico */}
      <section className="flex flex-col gap-2 rounded-lg border border-border p-4 bg-muted/20">
        <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Verificación del Hash Determinístico
        </h3>
        <p className="font-mono text-sm">
          assignVariant(&apos;{HASH_EXAMPLE_ID}&apos;) → <span className="font-bold text-primary">{demoVariant.toUpperCase()}</span>
        </p>
      </section>

      <div>
        <Link href="/practica" className="text-sm text-muted-foreground underline hover:text-foreground">
          ← Volver a la landing
        </Link>
      </div>
    </main>
  )
}