/*
  # Mejora en la función de creación de perfiles de usuario

  1. Cambios
    - Mejora en la función handle_new_user para manejar mejor la creación de perfiles
    - Añade soporte para actualizar perfiles existentes
    - Mejora el manejo de nombres de usuario cuando no se proporciona uno

  2. Seguridad
    - Mantiene la seguridad definer para la función
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