/*
  # Mejorar función de creación de perfiles de usuario

  1. Función mejorada
    - handle_new_user: Manejo de conflictos y mejor fallback para nombres
    - Usar parte del email antes del @ como nombre por defecto
    - Actualizar perfil existente en caso de conflicto

  2. Actualización
    - Reemplazar función existente con versión mejorada
    - Mantener compatibilidad con usuarios existentes
*/

-- Crear función mejorada para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar perfil con datos del registro
  INSERT INTO public.profiles (id, name, role, license)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'auxiliar'),
    NEW.raw_user_meta_data->>'license'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    license = EXCLUDED.license,
    updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;