# Animal Sweet - Kardex Veterinario

Sistema completo de gestión veterinaria con Supabase como base de datos.

## 🚀 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración (puede tomar unos minutos)

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. En tu proyecto de Supabase, ve a **Settings > API**

3. Copia las siguientes variables a tu archivo `.env`:
   ```env
   VITE_SUPABASE_URL=tu_project_url
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

### 3. Ejecutar Migraciones

1. En tu proyecto de Supabase, ve a **SQL Editor**

2. Copia y ejecuta el contenido del archivo `supabase/migrations/001_initial_schema.sql`

3. Esto creará todas las tablas, políticas de seguridad y datos iniciales

### 4. Configurar Autenticación

1. Ve a **Authentication > Settings**

2. Configura las siguientes opciones:
   - **Enable email confirmations**: Deshabilitado (para desarrollo)
   - **Enable phone confirmations**: Deshabilitado
   - **Enable custom SMTP**: Opcional

### 5. Configurar Storage (Opcional)

Si planeas subir archivos:

1. Ve a **Storage**
2. Crea un bucket llamado `patient-files`
3. Configura las políticas de acceso según tus necesidades

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <repository-url>
   cd animal-sweet-kardex
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno (ver sección anterior)

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **profiles**: Perfiles de usuario extendidos
- **patients**: Información de pacientes
- **medications**: Medicaciones prescritas
- **administrations**: Registro de administraciones
- **kardex_entries**: Entradas del kardex
- **budget_transactions**: Transacciones de presupuesto
- **patient_files**: Archivos médicos
- **medication_costs**: Costos de medicamentos

### Características de Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas de acceso** basadas en roles (médico/auxiliar)
- **Autenticación** con email y contraseña
- **Perfiles automáticos** creados al registrarse

## 🔄 Actualizaciones en Tiempo Real

El sistema utiliza Supabase Realtime para:

- Sincronización automática de datos entre usuarios
- Actualizaciones instantáneas del kardex
- Notificaciones de nuevas administraciones
- Cambios en tiempo real del presupuesto

## 👥 Roles de Usuario

### Médico Veterinario
- Crear y editar pacientes
- Prescribir medicaciones
- Gestionar costos de medicamentos
- Acceso completo al sistema

### Auxiliar Veterinario
- Ver pacientes existentes
- Administrar medicaciones
- Registrar observaciones
- Gestionar archivos de pacientes

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Variables de Entorno para Producción

Asegúrate de configurar las mismas variables de entorno en tu plataforma de despliegue:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 Solución de Problemas

### Error de Conexión a Supabase

1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Revisa que las migraciones se hayan ejecutado correctamente

### Problemas de Autenticación

1. Verifica la configuración de autenticación en Supabase
2. Asegúrate de que RLS esté habilitado
3. Revisa las políticas de seguridad

### Datos No Se Actualizan

1. Verifica la conexión a internet
2. Revisa la consola del navegador para errores
3. Asegúrate de que Realtime esté habilitado en Supabase

## 📝 Funcionalidades

- ✅ **Gestión de Pacientes**: Registro completo con presupuesto
- ✅ **Kardex Digital**: Seguimiento detallado de tratamientos
- ✅ **Administración de Medicamentos**: Control de horarios y dosis
- ✅ **Gestión de Presupuesto**: Control de gastos por paciente
- ✅ **Archivos Médicos**: Subida y gestión de documentos
- ✅ **Reportes**: Estadísticas y análisis
- ✅ **Facturación**: Control de costos y facturación
- ✅ **Tiempo Real**: Sincronización automática
- ✅ **Responsive**: Optimizado para móviles y tablets
- ✅ **Modo Oscuro**: Interfaz adaptable

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Desarrollado por

**andresch** de [@tiendastelegram](https://t.me/tiendastelegram)

© 2025 Animal Sweet - Sistema de Kardex Veterinario
