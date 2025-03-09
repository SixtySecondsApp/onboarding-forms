-- Add public access policies without touching existing ones

-- Allow anyone to view forms (public access)
CREATE POLICY IF NOT EXISTS "Forms are publicly viewable" ON forms
  FOR SELECT USING (true);

-- Allow anyone to update forms (for client submissions)
CREATE POLICY IF NOT EXISTS "Forms are publicly updatable" ON forms
  FOR UPDATE USING (true);

-- Allow anyone to view form sections (public access)
CREATE POLICY IF NOT EXISTS "Sections are publicly viewable" ON form_sections
  FOR SELECT USING (true);

-- Allow anyone to create form sections (for sharing)
CREATE POLICY IF NOT EXISTS "Sections are publicly insertable" ON form_sections
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update form sections (for client submissions)
CREATE POLICY IF NOT EXISTS "Sections are publicly updatable" ON form_sections
  FOR UPDATE USING (true); 