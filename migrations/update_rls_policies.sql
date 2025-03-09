-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Forms are viewable by created user" ON forms;
DROP POLICY IF EXISTS "Forms are updatable by created user" ON forms;
DROP POLICY IF EXISTS "Forms are insertable by authenticated users" ON forms;
DROP POLICY IF EXISTS "Sections are viewable by form owner" ON form_sections;
DROP POLICY IF EXISTS "Sections are insertable by form owner" ON form_sections;
DROP POLICY IF EXISTS "Sections are updatable by form owner" ON form_sections;

-- Create new policies for forms
-- Allow anyone to view forms (public access)
CREATE POLICY "Forms are publicly viewable" ON forms
  FOR SELECT USING (true);

-- Allow authenticated users to create forms
CREATE POLICY "Forms are insertable by authenticated users" ON forms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow anyone to update forms (for client submissions)
CREATE POLICY "Forms are publicly updatable" ON forms
  FOR UPDATE USING (true);

-- Create new policies for form sections
-- Allow anyone to view form sections (public access)
CREATE POLICY "Sections are publicly viewable" ON form_sections
  FOR SELECT USING (true);

-- Allow anyone to create form sections (for sharing)
CREATE POLICY "Sections are publicly insertable" ON form_sections
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update form sections (for client submissions)
CREATE POLICY "Sections are publicly updatable" ON form_sections
  FOR UPDATE USING (true); 