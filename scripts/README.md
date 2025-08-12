# Scripts

This folder contains utility scripts for the DS UTH Exam Bank project.

## bulk_upload.py

A Python script for bulk uploading PDF files to Supabase Storage and inserting metadata into the `exams` table.

### Features:
- Automatically detects PDF files in the `to_upload/` directory
- Uploads files to Supabase Storage with correct Content-Type headers
- Inserts file metadata into the database
- Handles both individual files and organized folder structures

### Usage:
```bash
cd scripts
python bulk_upload.py
```

### Requirements:
- Python 3.7+
- `supabase` library
- `requests` library
- Valid Supabase credentials in environment variables

### Configuration:
Set the following environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `BUCKET`: The storage bucket name (default: "exams")

### Setup:
1. Copy `bulk_upload_template.py` to `bulk_upload.py`
2. Set your environment variables:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
3. Run the script

**⚠️ Security Note:** The `bulk_upload.py` file is gitignored for security reasons. Always use environment variables for API keys and never commit sensitive credentials to the repository.
