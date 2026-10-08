# Ranking Nacional Argentino de Footgolf

Desarrollado por David Martín - carlosdavidmartin@gmail.com

Una Aplicación Web Progresiva (PWA) que muestra y gestiona el ranking nacional de Footgolf en Argentina. La aplicación obtiene datos de una hoja de cálculo de Google y proporciona una interfaz con capacidad offline para ver los rankings de los jugadores.

## Características

- 📊 Visualización en tiempo real del ranking desde Google Sheets
- 📱 Soporte para Aplicación Web Progresiva (PWA)
- 🔄 Funcionalidad offline
- 📱 Diseño responsive para todos los dispositivos
- 🎯 Interfaz fácil de usar
- 🔍 Capacidades rápidas de búsqueda y filtrado

## Detalles Técnicos

- Desarrollado con TypeScript y Vite
- Utiliza la API de Google Sheets para los datos
- Implementa Service Workers para soporte offline
- Diseño responsive usando CSS moderno
- Características PWA incluyendo:
  - Instalable en dispositivos
  - Soporte offline
  - Experiencia tipo aplicación

## Configuración

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Para desarrollo: `npm run dev`
4. Para build: `npm run build`
5. Para preview: `npm run preview`

## Despliegue

La aplicación se publica en [GitHub Pages](https://davidrnr.github.io/ranking-footgolf/) con el workflow `.github/workflows/deploy.yml`.

- Un push a `main` despliega el sitio. Esa es la rama de publicación a largo plazo.
- Hasta que `feature/vite_ts` se fusione en `main`, un push a `feature/vite_ts` también despliega, para que el sitio en producción siga actualizándose.
- Los pull requests hacia `main` o `feature/vite_ts` ejecutan la comprobación de tipos, el lint y el build, y no despliegan.

Cuando `feature/vite_ts` ya no haga falta, hay que quitarla de `on.push.branches` y de la condición del job `deploy`.

### Despliegue Manual

1. Ejecutar `npm run build`
2. Los archivos de build estarán en la carpeta `dist/`
3. Subir el contenido de `dist/` a tu servidor web

## Soporte Offline

La aplicación funciona sin conexión gracias a los Service Workers. Los siguientes recursos se almacenan en caché:

- Todos los archivos esenciales de la aplicación
- Recursos (íconos e imágenes)
- Fuentes de Google

## Contribuir

¡No dudes en enviar problemas y solicitudes de mejora!

## Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.
