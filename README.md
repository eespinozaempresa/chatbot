# 🎓 Chatbot de Cursos

Chatbot conversacional para consultar información de cursos académicos. Lee los datos desde **Google Sheets** y se despliega en **Render** con un solo clic.

---

## 📋 Estructura esperada del Google Sheet

Crea una hoja llamada **`Cursos`** con estas columnas exactas (fila 1 = encabezados):

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| categoria | curso | dia | hora | turno | profesor | asistente | whatsapp | meet |

**Ejemplo de datos:**

| categoria | curso | dia | hora | profesor | asistente | whatsapp | meet |
|---|---|---|---|---|---|---|---|
| Doctrinales | Biblia I | Lunes | 7:00 PM | Juan Pérez | María López | https://chat.whatsapp.com/xxx | https://meet.google.com/xxx |
| Liderazgo | Discipulado | Martes | 6:00 PM | Carlos Ruiz | Ana Torres | https://chat.whatsapp.com/yyy | https://meet.google.com/yyy |

> **Nota:** La columna `turno` es opcional; si no existe, el bot combina `dia` + `hora`.

---

## 🚀 Despliegue paso a paso

### 1. Crear una Service Account en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo (o usa uno existente)
3. Habilita la **Google Sheets API**
4. Ve a **IAM y administración → Cuentas de servicio**
5. Crea una cuenta de servicio y descarga el archivo **JSON de credenciales**
6. Copia el email de la Service Account (termina en `@...iam.gserviceaccount.com`)

### 2. Compartir el Google Sheet

1. Abre tu Google Sheet
2. Haz clic en **Compartir**
3. Pega el email de la Service Account
4. Dale permiso de **Lector**
5. Copia el ID del Sheet desde la URL:  
   `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`

### 3. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/chatbot-cursos.git
git push -u origin main
```

### 4. Desplegar en Render

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Haz clic en **New → Web Service**
3. Conecta tu repositorio de GitHub
4. Render detecta automáticamente el `render.yaml`
5. Configura las variables de entorno:

| Variable | Valor |
|---|---|
| `SPREADSHEET_ID` | El ID de tu Google Sheet |
| `SHEET_RANGE` | `Cursos!A:J` (o ajusta al nombre de tu hoja) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Pega aquí el contenido **completo** del JSON descargado |

6. Haz clic en **Create Web Service**
7. Render instalará dependencias y desplegará automáticamente ✅

---

## 🔧 Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env

# 3. Editar .env con tus valores reales
#    - SPREADSHEET_ID
#    - GOOGLE_KEY_FILE=credentials.json  (coloca el JSON aquí)

# 4. Iniciar el servidor
npm run dev

# Abre http://localhost:3000
```

---

## 🗂️ Estructura del proyecto

```
chatbot-cursos/
├── public/
│   └── index.html        ← Frontend del chatbot (chat UI)
├── src/
│   ├── server.js         ← Servidor Express + rutas API
│   └── sheetsService.js  ← Conexión a Google Sheets con caché
├── .env.example          ← Plantilla de variables de entorno
├── render.yaml           ← Configuración de Render
├── package.json
└── README.md
```

---

## 🔌 Endpoints API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categorias` | Lista de categorías únicas |
| GET | `/api/cursos/:categoria` | Cursos de una categoría |
| GET | `/api/curso/:id` | Detalle completo de un curso |
| POST | `/api/refresh` | Limpia el caché (fuerza re-lectura del Sheet) |

---

## ⚡ Caché

Los datos se cachean **10 minutos** para reducir llamadas a Google Sheets.  
Para forzar una actualización inmediata, llama a `POST /api/refresh`.

---

## 📞 Soporte

Si tienes problemas con la conexión a Google Sheets, verifica que:
- La Service Account tiene permiso de lectura en el Sheet
- El `SPREADSHEET_ID` es correcto
- El JSON de la Service Account está completo y bien formateado en la variable de entorno
