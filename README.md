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

La aplicación se despliega automáticamente a GitHub Pages cuando se hace push a la rama `main`.

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
