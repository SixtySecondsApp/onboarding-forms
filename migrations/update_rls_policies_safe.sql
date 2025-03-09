-- First, check which policies exist and drop only the ones we want to replace
DO $$
BEGIN
    -- Drop restrictive policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Forms are viewable by created user' AND tablename = 'forms') THEN
        DROP POLICY "Forms are viewable by created user" ON forms;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Forms are updatable by created user' AND tablename = 'forms') THEN
        DROP POLICY "Forms are updatable by created user" ON forms;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sections are viewable by form owner' AND tablename = 'form_sections') THEN
        DROP POLICY "Sections are viewable by form owner" ON form_sections;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sections are insertable by form owner' AND tablename = 'form_sections') THEN
        DROP POLICY "Sections are insertable by form owner" ON form_sections;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sections are updatable by form owner' AND tablename = 'form_sections') THEN
        DROP POLICY "Sections are updatable by form owner" ON form_sections;
    END IF;
    
    -- Create new policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Forms are publicly viewable' AND tablename = 'forms') THEN
        CREATE POLICY "Forms are publicly viewable" ON forms
          FOR SELECT USING (true);
    END IF;
    
    -- Keep the existing policy for form insertion (requires authentication)
    -- No need to recreate it
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Forms are publicly updatable' AND tablename = 'forms') THEN
        CREATE POLICY "Forms are publicly updatable" ON forms
          FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sections are publicly viewable' AND tablename = 'form_sections') THEN
        CREATE POLICY "Sections are publicly viewable" ON form_sections
          FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sections are publicly insertable' AND tablename = 'form_sections') THEN
        CREATE POLICY "Sections are publicly insertable" ON form_sections
          FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sections are publicly updatable' AND tablename = 'form_sections') THEN
        CREATE POLICY "Sections are publicly updatable" ON form_sections
          FOR UPDATE USING (true);
    END IF;
END
$$; 