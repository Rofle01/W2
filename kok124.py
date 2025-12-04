import os

# Yoksayılacak klasörler ve dosyalar
IGNORE_DIRS = {'.git', 'node_modules', '__pycache__', 'dist', 'build', '.next', '.vscode'}
IGNORE_FILES = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store', 'export_project.py'}
# Sadece bu uzantıları al (Gereksiz binary dosyaları almamak için)
ALLOWED_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.py', '.css', '.json', '.md', '.html', '.prisma', '.sql'}

def is_allowed_file(filename):
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS) and filename not in IGNORE_FILES

def main():
    output_file = "tum_kodlar.txt"
    
    with open(output_file, "w", encoding="utf-8") as outfile:
        # Önce proje ağacını yazdıralım
        outfile.write("=== PROJE DOSYA AĞACI ===\n")
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace(os.getcwd(), '').count(os.sep)
            indent = ' ' * 4 * (level)
            outfile.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = ' ' * 4 * (level + 1)
            for f in files:
                if is_allowed_file(f):
                    outfile.write(f"{subindent}{f}\n")
        
        outfile.write("\n\n=== DOSYA İÇERİKLERİ ===\n\n")

        # Dosya içeriklerini yazdıralım
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS] # Dizinleri filtrele
            
            for file in files:
                if is_allowed_file(file):
                    path = os.path.join(root, file)
                    try:
                        with open(path, "r", encoding="utf-8") as infile:
                            content = infile.read()
                            outfile.write(f"\n{'='*50}\n")
                            outfile.write(f"DOSYA YOLU: {path}\n")
                            outfile.write(f"{'='*50}\n")
                            outfile.write(content + "\n")
                    except Exception as e:
                        outfile.write(f"\n!!! HATA: {path} okunamadı: {e}\n")

    print(f"İşlem tamamlandı! Tüm kodlar '{output_file}' dosyasına kaydedildi.")

if __name__ == "__main__":
    main()