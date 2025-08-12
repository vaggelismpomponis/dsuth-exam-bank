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
- `SUPABASE_KEY`: Your Supabase service role key
- `BUCKET`: The storage bucket name (default: "exams")
