import os
import requests
from supabase import create_client, Client

# Supabase config
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

# Admin email to add
ADMIN_EMAIL = "your-admin-email@example.com"

def add_admin_user():
    """Add admin user to the system"""
    
    # Create Supabase client with service role key
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    print(f"🔍 Αναζήτηση χρήστη με email: {ADMIN_EMAIL}")
    
    # First, check if user exists in auth.users
    try:
        # Get user by email using admin API
        response = requests.get(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers={
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
            },
            params={"filter": f"email.eq.{ADMIN_EMAIL}"}
        )
        
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                user_id = user['id']
                print(f"✅ Βρέθηκε χρήστης με ID: {user_id}")
                
                # Check if profile exists
                profile_response = supabase.from_('profiles').select('*').eq('id', user_id).execute()
                
                if profile_response.data:
                    # Update existing profile to admin
                    update_response = supabase.from_('profiles').update({
                        'role': 'admin',
                        'updated_at': 'now()'
                    }).eq('id', user_id).execute()
                    
                    if update_response.data:
                        print(f"✅ Ενημερώθηκε το προφίλ του χρήστη {ADMIN_EMAIL} ως admin")
                        return True
                    else:
                        print(f"❌ Σφάλμα ενημέρωσης προφίλ: {update_response.error}")
                        return False
                else:
                    # Create new profile for admin
                    profile_data = {
                        'id': user_id,
                        'email': ADMIN_EMAIL,
                        'role': 'admin',
                        'first_name': 'Admin',
                        'last_name': 'User',
                        'created_at': 'now()',
                        'updated_at': 'now()'
                    }
                    
                    insert_response = supabase.from_('profiles').insert(profile_data).execute()
                    
                    if insert_response.data:
                        print(f"✅ Δημιουργήθηκε νέο προφίλ admin για {ADMIN_EMAIL}")
                        return True
                    else:
                        print(f"❌ Σφάλμα δημιουργίας προφίλ: {insert_response.error}")
                        return False
            else:
                print(f"❌ Δεν βρέθηκε χρήστης με email: {ADMIN_EMAIL}")
                print("💡 Πρέπει πρώτα να κάνετε sign up με αυτό το email")
                return False
        else:
            print(f"❌ Σφάλμα αναζήτησης χρήστη: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Σφάλμα: {str(e)}")
        return False

def main():
    print("🚀 Προσθήκη admin user...")
    print("=" * 50)
    
    success = add_admin_user()
    
    print("=" * 50)
    if success:
        print("✅ Επιτυχής προσθήκη admin!")
        print(f"📧 Το email {ADMIN_EMAIL} είναι τώρα admin")
        print("🔑 Μπορείτε να συνδεθείτε με αυτό το email")
    else:
        print("❌ Αποτυχία προσθήκης admin")
        print("💡 Βεβαιωθείτε ότι:")
        print("   1. Το email έχει κάνει sign up")
        print("   2. Έχετε σωστά τα environment variables")
        print("   3. Έχετε service role key")

if __name__ == "__main__":
    main()
