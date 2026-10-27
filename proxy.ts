import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  COOKIE,
  THIRTY_DAYS,
  SESSION_WINDOW,
  assignVariant,
  parseLog,
  serializeLog,
  cookieOptions,
  isVariant,
} from './lib/experiment'

export function proxy(request: NextRequest) {
  const url = request.nextUrl
  const isSecure = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'

  // Si incluye parámetro de preview, no procesamos cookies ni impresiones
  const preview = url.searchParams.get('preview')
  if (preview && (preview === 'a' || preview === 'b')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // 1. Obtener o asignar Visitante y Variante
  let visitorId = request.cookies.get(COOKIE.visitor)?.value
  let variant = request.cookies.get(COOKIE.variant)?.value

  const isNewVisitor = !visitorId || !isVariant(variant)

  if (isNewVisitor) {
    visitorId = crypto.randomUUID()
    variant = assignVariant(visitorId)

    response.cookies.set(COOKIE.visitor, visitorId, cookieOptions(isSecure, THIRTY_DAYS))
    response.cookies.set(COOKIE.variant, variant, cookieOptions(isSecure, THIRTY_DAYS))
  }

  // 2. Control de Impresión (1 por sesión de 30 minutos)
  const isImpressedInSession = request.cookies.has(COOKIE.impressed)

  if (!isImpressedInSession && isVariant(variant)) {
    // Marcamos la sesión activa por 30 minutos
    response.cookies.set(COOKIE.impressed, '1', cookieOptions(isSecure, SESSION_WINDOW))

    // Actualizamos los conteos en el log de eventos
    const currentLogRaw = request.cookies.get(COOKIE.log)?.value
    const log = parseLog(currentLogRaw)

    log[variant].impressions += 1

    response.cookies.set(COOKIE.log, serializeLog(log), cookieOptions(isSecure, THIRTY_DAYS))
  }

  return response
}

export const config = {
  matcher: ['/practica'],
}