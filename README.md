# Interfaz de carga en terreno

Formulario móvil para registrar encuestas del Centro de Balneoterapia de Copahue. Guarda respuestas en Google Sheets mediante Google Apps Script y conserva una cola local cuando no hay conectividad.

## Configuración

1. Crear una Google Sheet vacía y nombrar una pestaña `Respuestas`.
2. En la hoja, abrir `Extensiones > Apps Script`.
3. Reemplazar el contenido de `Code.gs` por el archivo `google_apps_script/Code.gs` de este proyecto.
4. En Apps Script elegir `Implementar > Nueva implementación`.
5. Tipo: `Aplicación web`. Ejecutar como: propietario de la hoja. Acceso: las personas que utilizarán el formulario.
6. Autorizar y copiar la URL terminada en `/exec`.
7. Pegar esa URL en `config.js`, dentro de `sheetsWebAppUrl`.
8. Publicar la carpeta `carga_campo` junto con el dashboard o en un repositorio privado para el equipo encuestador.

## Operación sin conexión

Después de abrirlo una primera vez con conexión, el formulario queda disponible como aplicación web instalable. Cada envío fallido queda en `localStorage` del dispositivo. El contador superior informa respuestas pendientes. Al recuperar conexión, el formulario intenta sincronizarlas; también puede usarse el botón `Sincronizar`.

No se recomienda borrar datos del navegador ni utilizar navegación privada mientras existan respuestas pendientes.
