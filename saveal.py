import os
import zipfile
from datetime import datetime

def backup_project():
    # 1. Yedekleme İsmi Oluştur (Tarih-Saat)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    zip_filename = f"Yedek_{timestamp}.zip"
    
    # 2. Yoksayılacak Klasörler (Gereksiz ağırlık yapanlar)
    IGNORE_DIRS = {
        'node_modules', '.next', '.git', 'dist', 'build', '.vscode', 
        'coverage', '__pycache__'
    }
    
    # 3. Yoksayılacak Dosyalar
    IGNORE_FILES = {
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
        '.DS_Store', 'backup_project.py', zip_filename
    }

    print(f"📦 Yedekleme başlatılıyor: {zip_filename}")
    
    try:
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk("."):
                # Gereksiz klasörleri yerinde filtrele (içine girmesin)
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
                
                for file in files:
                    # Kendi oluşturduğumuz zip'i veya scripti yedekleme
                    if file in IGNORE_FILES or file.endswith('.zip'):
                        continue
                        
                    file_path = os.path.join(root, file)
                    # Zip içine dosyayı ekle
                    zipf.write(file_path, arcname=os.path.relpath(file_path, "."))
                    
        print(f"✅ Başarılı! Dosya oluşturuldu: {zip_filename}")
        print(f"   (Node_modules ve gereksiz dosyalar hariç tutuldu)")
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")

if __name__ == "__main__":
    backup_project()