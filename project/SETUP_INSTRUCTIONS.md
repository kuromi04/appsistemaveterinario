# 🚀 Configuración de Supabase para Animal Sweet

## ⚠️ IMPORTANTE: Sigue estos pasos EXACTAMENTE

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta o inicia sesión
4. Crea un nuevo proyecto:
   - **Name**: Animal Sweet Kardex
   - **Database Password**: (elige una contraseña segura y guárdala)
   - **Region**: South America (São Paulo) - más cercano a Colombia
5. **ESPERA 2-3 minutos** a que se complete la configuración (no continúes hasta que esté listo)

### 2. Configurar Variables de Entorno
1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia el **Project URL** y **anon public key**
3. En este proyecto, copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edita el archivo `.env` y reemplaza con tus valores reales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   ```

### 3. Ejecutar las Migraciones (CRÍTICO)
1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia TODO el contenido del archivo `supabase/migrations/20250624002545_foggy_hall.sql`
4. Pégalo en el editor y haz clic en **RUN**
5. **Verifica que se ejecutó sin errores** (debe mostrar "Success. No rows returned")
6. Si hay errores, NO continúes hasta resolverlos

### 4. Configurar Autenticación (MUY IMPORTANTE)
1. Ve a **Authentication** → **Settings**
2. En **User Signups**:
   - ❌ **Enable email confirmations**: **DESHABILITADO** (CRÍTICO para desarrollo)
   - ❌ **Enable phone confirmations**: **DESHABILITADO**
3. **Guarda los cambios** haciendo clic en "Save"

> **⚠️ CRÍTICO**: Si no deshabilitas la confirmación de email, obtendrás errores de "Email not confirmed" al intentar iniciar sesión.

### 5. Verificar Instalación
1. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
2. Ve a la aplicación en tu navegador
3. Deberías ver "Supabase Configurado" en verde
4. **REGISTRA un nuevo usuario** usando "Regístrate aquí"
5. Después de registrarte, intenta iniciar sesión con esas credenciales

## ✅ Checklist de Verificación

Antes de reportar problemas, verifica:

- [ ] ✅ Proyecto de Supabase creado y activo
- [ ] ✅ Variables de entorno configuradas correctamente en `.env`
- [ ] ✅ Migraciones SQL ejecutadas sin errores
- [ ] ✅ **Confirmación de email DESHABILITADA** (paso más importante)
- [ ] ✅ Servidor de desarrollo reiniciado después de configurar .env
- [ ] ✅ Usuario registrado en la aplicación
- [ ] ✅ Inicio de sesión funciona con credenciales registradas

## 🔧 Funcionalidades disponibles después de la configuración:

- 👥 **Autenticación**: Registro e inicio de sesión
- 🐕 **Gestión de Pacientes**: CRUD completo con presupuesto
- 💊 **Medicaciones**: Prescripción y seguimiento
- ⏰ **Administraciones**: Control de horarios y dosis
- 📋 **Kardex Digital**: Historial completo en tiempo real
- 💰 **Presupuesto**: Control de gastos por paciente
- 📁 **Archivos**: Subida de documentos médicos
- 📊 **Reportes**: Estadísticas y análisis
- 💳 **Facturación**: Control de costos
- 🌙 **Modo Oscuro**: Interfaz adaptable
- 📱 **Responsive**: Optimizado para móviles

## 🆘 Solución de Problemas Comunes

### ❌ Error: "Email not confirmed" o "email_not_confirmed"
**Causa**: La confirmación de email está habilitada en Supabase.
**Solución**: 
1. Ve a tu proyecto de Supabase
2. **Authentication** → **Settings**
3. **Deshabilita "Enable email confirmations"**
4. Guarda los cambios
5. Intenta registrarte/iniciar sesión nuevamente

### ❌ Error: "Failed to fetch"
**Causa**: Variables de entorno incorrectas o problema de conectividad.
**Solución**: 
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Verifica que las URLs y keys son exactamente las de tu proyecto Supabase
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. Verifica tu conexión a internet

### ❌ Error: "Invalid login credentials"
**Causa**: Intentas iniciar sesión sin haber registrado un usuario primero.
**Solución**: 
1. Usa "Regístrate aquí" para crear tu primera cuenta
2. Después inicia sesión con esas credenciales

### ❌ Error: "Supabase not configured"
**Causa**: Variables de entorno faltantes o incorrectas.
**Solución**: 
1. Verifica que el archivo `.env` existe
2. Verifica que las URLs y keys son correctas
3. Reinicia el servidor de desarrollo

### ❌ Error: "PGRST116" o tablas no encontradas
**Causa**: Las migraciones SQL no se ejecutaron correctamente.
**Solución**: 
1. Ve al SQL Editor de Supabase
2. Ejecuta nuevamente el archivo de migración completo
3. Verifica que no hay errores en la ejecución

### ❌ La aplicación no carga o muestra errores
**Causa**: Configuración incompleta.
**Solución**: 
1. Sigue TODOS los pasos en orden
2. No omitas ningún paso
3. Verifica cada paso antes de continuar al siguiente

## 📝 Notas Importantes

- **Usa el rol "medico"** al registrarte para tener permisos completos
- **El rol "auxiliar"** tiene permisos limitados
- **Los datos se sincronizan en tiempo real** entre usuarios
- **Todos los cambios se guardan automáticamente** en Supabase
- **La aplicación funciona offline** parcialmente (solo lectura)

## 🎯 Después de la Configuración

Una vez completados todos los pasos:

1. **Registra tu primer usuario** con rol "medico"
2. **Explora las funcionalidades** del sistema
3. **Crea tu primer paciente** para probar el kardex
4. **Prescribe medicaciones** y administra tratamientos
5. **Revisa los reportes** y estadísticas

¡Tu aplicación estará 100% funcional una vez completes estos pasos correctamente!

---

**💡 Tip**: Si sigues teniendo problemas, revisa la consola del navegador (F12) para ver errores específicos y compártelos para obtener ayuda más precisa.

## 🔍 Diagnóstico de Errores

Si encuentras errores, la aplicación ahora muestra mensajes más detallados:

- **"Email not confirmed"**: Deshabilita confirmación de email en Supabase
- **"Failed to fetch"**: Verifica variables de entorno y conectividad
- **"Invalid credentials"**: Registra un usuario primero
- **"Supabase not configured"**: Configura variables de entorno

La aplicación incluye un botón "Reintentar" que recarga la página para aplicar cambios en variables de entorno.