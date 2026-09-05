# Seguridad — Explorador del Presupuesto PGN 2027

Este repositorio es **de solo contenido estático** (HTML/JS/Datos abiertos); no
procesa entrada de usuarios ni almacena datos personales.

## Reportar una vulnerabilidad

Si detectás una vulnerabilidad (p. ej., en el CSP, en un CDN usado o en un dato
expuesto), NO abras un issue público con detalles sensibles:

- Reportá por privado a los mantenedores (GitHub "Report vulnerability" del repo)
  o escríbenos al contacto del autor en muchotexto.net.

## Prácticas aplicadas

- HTTPS obligatorio (GitHub Pages + custom domain) con `Enforce HTTPS`.
- **Content Security Policy** restrictiva en el explorador (solo CDNs de confianza;
  `frame-ancestors 'none'`, `base-uri 'self'`).
- Sin formularios, sin cookies propias, sin analítica de terceros.
- Datos públicos con atribución de fuente; sin datos personales en el repo.
- Dependencias de Jekyll/Acciones monitoreadas por Dependabot (alerts + PRs).

## Alcance

El sitio depende de CDNs de terceros (ECharts, marked, Google Fonts) para
funcionar; una indisponibilidad de esos servicios degrada el renderizado (el
sitio muestra un aviso sin romperse).
