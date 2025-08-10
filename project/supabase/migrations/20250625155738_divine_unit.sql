/*
  # Corrección de restricciones de clave foránea para kardex_entries y budget_transactions

  1. Cambios
    - Modificar la restricción de clave foránea en kardex_entries para permitir NULL en related_medication_id
    - Modificar la restricción de clave foránea en budget_transactions para permitir NULL en related_administration_id
    - Estas modificaciones corrigen errores de violación de restricción de clave foránea

  2. Seguridad
    - Mantiene todas las políticas de seguridad existentes
    - No afecta a la integridad de los datos existentes
*/

-- Eliminar y recrear la restricción de clave foránea para kardex_entries.related_medication_id
ALTER TABLE kardex_entries DROP CONSTRAINT IF EXISTS kardex_entries_related_medication_id_fkey;
ALTER TABLE kardex_entries ADD CONSTRAINT kardex_entries_related_medication_id_fkey 
  FOREIGN KEY (related_medication_id) REFERENCES medications(id) ON DELETE SET NULL;

-- Eliminar y recrear la restricción de clave foránea para budget_transactions.related_administration_id
ALTER TABLE budget_transactions DROP CONSTRAINT IF EXISTS budget_transactions_related_administration_id_fkey;
ALTER TABLE budget_transactions ADD CONSTRAINT budget_transactions_related_administration_id_fkey 
  FOREIGN KEY (related_administration_id) REFERENCES administrations(id) ON DELETE SET NULL;

-- Eliminar y recrear la restricción de clave foránea para budget_transactions.related_medication_id
ALTER TABLE budget_transactions DROP CONSTRAINT IF EXISTS budget_transactions_related_medication_id_fkey;
ALTER TABLE budget_transactions ADD CONSTRAINT budget_transactions_related_medication_id_fkey 
  FOREIGN KEY (related_medication_id) REFERENCES medications(id) ON DELETE SET NULL;