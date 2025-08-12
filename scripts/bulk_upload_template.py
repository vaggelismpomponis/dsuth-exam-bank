import os
import re
from supabase import create_client, Client
import requests

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

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
SUPABASE_SERVICE_KEY = SUPABASE_KEY

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

def upload_file_with_requests(filepath, filename):
    with open(filepath, "rb") as f:
        file_data = f.read()
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/pdf",
        "x-upsert": "true"
    }
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{filename}"
    response = requests.post(url, headers=headers, data=file_data)
    if response.status_code >= 300:
        print(f"Σφάλμα στο ανέβασμα (requests): {filename} - {response.text}")
        return None
    # Δημιουργία public URL
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{filename}"
    return public_url

def upload_file(filepath, filename):
    # Διαγραφή αν υπάρχει ήδη
    supabase.storage.from_(BUCKET).remove([filename])
    if filename.lower().endswith(".pdf"):
        return upload_file_with_requests(filepath, filename)
    # Για άλλα αρχεία, χρησιμοποίησε το supabase-py
    with open(filepath, "rb") as f:
        res = supabase.storage.from_(BUCKET).upload(
            filename, f, None
        )
    if res:
        # Δημιουργία public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{filename}"
        return public_url
    return None

def main():
    if not os.path.exists(UPLOAD_FOLDER):
        print(f"Ο φάκελος {UPLOAD_FOLDER} δεν υπάρχει!")
        return

    files = [f for f in os.listdir(UPLOAD_FOLDER) if os.path.isfile(os.path.join(UPLOAD_FOLDER, f))]
    
    if not files:
        print(f"Δεν βρέθηκαν αρχεία στον φάκελο {UPLOAD_FOLDER}")
        return

    print(f"Βρέθηκαν {len(files)} αρχεία για ανέβασμα")
    
    for filename in files:
        print(f"\nΕπεξεργασία: {filename}")
        
        # Parse το όνομα αρχείου
        parsed = parse_filename(filename)
        if not parsed:
            continue
            
        course, year, period, ext = parsed["course"], parsed["year"], parsed["period"], parsed["ext"]
        
        # Έλεγχος αν το μάθημα υπάρχει στο map
        if course not in COURSE_MAP:
            print(f"  ⚠️  Άγνωστο μάθημα: {course}")
            continue
            
        course_name = COURSE_MAP[course]
        print(f"  📚 Μάθημα: {course_name}")
        print(f"  📅 Έτος: {year}")
        print(f"  📋 Περίοδος: {period}")
        
        # Ανέβασμα αρχείου
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        public_url = upload_file(filepath, filename)
        
        if public_url:
            print(f"  ✅ Ανέβηκε επιτυχώς: {public_url}")
        else:
            print(f"  ❌ Σφάλμα στο ανέβασμα")

if __name__ == "__main__":
    main()
