'use server'

import { cookies } from 'next/headers'
import {
  COOKIE,
  THIRTY_DAYS,
  parseLog,
  serializeLog,
  cookieOptions,
  isVariant,
} from '@/lib/experiment'

export async function recordConversion(): Promise<{ status: 'ok' | 'ignored' }> {
  const cookieStore = await cookies()
  const variant = cookieStore.get(COOKIE.variant)?.value

  // Si no hay variante válida asignada, no podemos atribuir la conversión
  if (!isVariant(variant)) {
    return { status: 'ignored' }
  }

  // Verificar si el visitante ya convirtió previamente
  const hasConverted = cookieStore.has(COOKIE.converted)
  if (hasConverted) {
    return { status: 'ignored' }
  }

  // Marcar la cookie de conversión del visitante por 30 días
  const isSecure = process.env.NODE_ENV === 'production'
  cookieStore.set(COOKIE.converted, '1', cookieOptions(isSecure, THIRTY_DAYS))

  // Actualizar el log global de conversiones
  const currentLogRaw = cookieStore.get(COOKIE.log)?.value
  const log = parseLog(currentLogRaw)

  log[variant].conversions += 1

  cookieStore.set(COOKIE.log, serializeLog(log), cookieOptions(isSecure, THIRTY_DAYS))

  return { status: 'ok' }
}