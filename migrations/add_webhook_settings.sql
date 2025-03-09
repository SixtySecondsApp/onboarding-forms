-- Create a system_settings table for global webhook configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  webhook_url TEXT,
  webhook_enabled BOOLEAN DEFAULT FALSE,
  webhook_secret TEXT,
  notify_on_section_completion BOOLEAN DEFAULT FALSE,
  notify_on_form_completion BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default record
INSERT INTO system_settings (webhook_url, webhook_enabled, webhook_secret, notify_on_section_completion, notify_on_form_completion)
VALUES ('', FALSE, '', FALSE, TRUE);

-- Remove webhook columns from forms table if they exist
ALTER TABLE forms DROP COLUMN IF EXISTS webhook_url;
ALTER TABLE forms DROP COLUMN IF EXISTS webhook_enabled;
ALTER TABLE forms DROP COLUMN IF EXISTS webhook_secret;

-- Create a new table for form submissions tracking
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  section_id UUID REFERENCES form_sections(id) ON DELETE CASCADE,
  client_ip TEXT,
  user_agent TEXT,
  submission_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on the new table
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for form submissions
CREATE POLICY "Submissions are viewable by form owner" ON form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_submissions.form_id 
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "Submissions are insertable by anyone" ON form_submissions
  FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX form_submissions_form_id_idx ON form_submissions(form_id);
CREATE INDEX form_submissions_created_at_idx ON form_submissions(created_at); 