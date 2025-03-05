-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_reminder TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create form_sections table
CREATE TABLE form_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  data JSONB,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sections ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Forms are viewable by created user" ON forms
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Forms are insertable by authenticated users" ON forms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Forms are updatable by created user" ON forms
  FOR UPDATE USING (auth.uid() = created_by);

-- Form sections policies
CREATE POLICY "Sections are viewable by form owner" ON form_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_sections.form_id 
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "Sections are insertable by form owner" ON form_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_sections.form_id 
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "Sections are updatable by form owner" ON form_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_sections.form_id 
      AND forms.created_by = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX forms_created_by_idx ON forms(created_by);
CREATE INDEX form_sections_form_id_idx ON form_sections(form_id);
CREATE INDEX form_sections_order_idx ON form_sections(form_id, order_index); 