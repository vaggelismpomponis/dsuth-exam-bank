import os
import re
from supabase import create_client, Client

# Supabase config
SUPABASE_URL = "https://uyliukldtnwxurrpeoit.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5bGl1a2xkdG53eHVycnBlb2l0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY3MDgzMCwiZXhwIjoyMDY2MjQ2ODMwfQ.7gWJ2KC1rqSni82uIY5PcZcoLGOaQKkjSie7EqSn_ac"
BUCKET = "exams"
UPLOAD_FOLDER = "./to_upload"  # Ο φάκελος με τα αρχεία

COURSE_MAP = {
    "MathimatikiAnalisi": "Μαθηματική Ανάλυση",
    "PsifiakiSxediasi": "Ψηφιακή Σχεδίαση",
    "EisagogiProgrammatismo": "Εισαγωγή στον Προγραμματισμό",
    "PsifiakaSystimata": "Εισαγωγή στα Ψηφιακά Συστήματα",
    "Fysiki": "Φυσική",
    "DiakritaMathimatika": "Διακριτά Μαθηματικά",
    "PithanotitesStatistiki": "Πιθανότητες και Στατιστική",
    "Ilektroniki": "Ηλεκτρονική",
    "AntikeimenostrafisProgramatismos": "Αντικειμενοστρεφής Προγραμματισμός",
    "AnalisiSxediastSystimaton": "Ανάλυση και Σχεδίαση Συστημάτων",
    "ArithmitikiAnalisi": "Αριθμητική Ανάλυση",
    "ProxorimenosProgramatismos": "Προχωρημένος Προγραμματισμός",
    "Diktya1": "Δίκτυα Υπολογιστών I",
    "Diktya2": "Δίκτυα Υπολογιστών II",
    "DomesDedomenon": "Δομές Δεδομένων",
    "SymataSystimata": "Σήματα και Συστήματα",
    "GrammikiAlgebra": "Γραμμική Άλγεβρα",
    "KinitosDiaxitosYpologismos": "Κινητός και Διάχυτος Υπολογισμός",
    "BaseisDedomenon": "Συστήματα Βάσεων Δεδομένων",
    "PsifiakiEpeksergasiaSimatos": "Ψηφιακή Επεξεργασία Σήματος",
    "AnalisiSxediastAlgorithmon": "Ανάλυση και Σχεδίαση Αλγορίθμων",
    "OrganosiYpologistikonSystimaton": "Οργάνωση Υπολογιστικών Συστημάτων",
    "TexnologiaLogismikou": "Τεχνολογία Λογισμικού",
    "PsifiakaTilepSys": "Ψηφιακά Τηλεπικοινωνιακά Συστήματα",
    "TexnologiesEfarmogesDiadiktiou": "Τεχνολογίες και Εφαρμογές Διαδικτύου",
    "ParallilosProgramatismos": "Παράλληλος Προγραμματισμός",
    "ParallilaKatanemimenaSys": "Παράλληλα και Κατανεμημένα Συστήματα",
    "SysAftomatouElenxou": "Συστήματα Αυτομάτου Ελέγχου",
    "PlirforSysDioikisis": "Πληροφοριακά Συστήματα Διοίκησης",
    "EnsomatomenaSystimata": "Ενσωματωμένα Συστήματα",
    "MethodologiaErevnas": "Μεθοδολογία Έρευνας",
    "LeitourgikaSystimata": "Λειτουργικά Συστήματα",
    "EvryzonikesEpikinonies": "Ευρυζωνικές Επικοινωνίες",
    "ArchitektonikiYpologiston": "Αρχιτεκτονική Υπολογιστών",
    "AsfaliaPsifiakonSystimaton": "Ασφάλεια Ψηφιακών Συστημάτων",
    "EfarmogesGeoplirforikis": "Εφαρμογές Γεωπληροφορικής στο Περιβάλλον",
    "EfarmSysAkriviasProtogeniParagogi": "Εφαρμογές Συστημάτων Ακριβείας στην Πρωτογενή Παραγωγή",
    "EfarmPsifSysBiomixania": "Εφαρμογές Ψηφιακών Συστημάτων στη Βιομηχανία",
    "DiasfalisiPoiotitasPsifSys": "Διασφάλιση Ποιότητας Ψηφιακών Συστημάτων",
    "PsifSysProtogeniTomea": "Ψηφιακά Συστήματα στον Πρωτογενή Τομέα",
    "KvantikiYpol": "Κβαντική Υπολογιστική",
}

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_filename(filename):
    # Παράδειγμα: MathimatikiAnalisi_2020_Epanaliptiki_Themata.pdf ή ..._Themata_A.pdf
    pattern = r"^(.*?)_(\d{4})_([A-Za-zΑ-Ωα-ω]+)_Themata(?:_[A-Za-z0-9Α-Ωα-ω]+)?\.(pdf|docx?|jpe?g|png)$"
    match = re.match(pattern, filename, re.IGNORECASE)
    if not match:
        print(f"Δεν αναγνωρίζεται το όνομα αρχείου: {filename}")
        return None
    course, year, period, ext = match.groups()
    return {
        "course": course,
        "year": int(year),
        "period": period,
        "ext": ext
    }

def upload_file(filepath, filename):
    # Διαγραφή αν υπάρχει ήδη
    res_remove = supabase.storage.from_(BUCKET).remove([filename])
    print(f"Διαγραφή αποτελέσματος για {filename}: {res_remove}")
    with open(filepath, "rb") as f:
        res = supabase.storage.from_(BUCKET).upload(filename, f)
    if hasattr(res, "error") and res.error:
        print(f"Σφάλμα στο ανέβασμα: {filename} - {res.error}")
        return None
    public_url = supabase.storage.from_(BUCKET).get_public_url(filename)
    return public_url

ADMIN_UUID = "ae26da15-7102-4647-8cbb-8f045491433c"  # το δικό σου admin uuid

def insert_to_db(meta, public_url):
    course_name = COURSE_MAP.get(meta["course"], meta["course"])
    # Έλεγχος αν υπάρχει ήδη
    query = supabase.table("exams").select("id").eq("file_url", public_url)
    existing = query.execute()
    if existing.data and len(existing.data) > 0:
        print(f"Skip: Υπάρχει ήδη στη βάση: {public_url}")
        return
    data = {
        "course": course_name,
        "year": meta["year"],
        "period": meta["period"],
        "uploader": ADMIN_UUID,
        "file_url": public_url,
        "approved": True
    }
    res = supabase.table("exams").insert(data).execute()
    if hasattr(res, "status_code") and res.status_code >= 300:
        print(f"Σφάλμα στη βάση για {course_name} - {meta['year']} - {meta['period']}")
        print(res)
    else:
        print(f"✔️ {course_name} {meta['year']} {meta['period']} -> OK")

def main():
    for filename in os.listdir(UPLOAD_FOLDER):
        if filename.startswith("."):
            continue
        meta = parse_filename(filename)
        print(f"DEBUG: {filename} -> {meta}")  # <--- Προσθήκη για έλεγχο
        if not meta:
            continue
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        print(f"Ανέβασμα: {filename} ...")
        public_url = upload_file(filepath, filename)
        if public_url:
            insert_to_db(meta, public_url)

if __name__ == "__main__":
    main()