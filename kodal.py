import os

# =============================================================================
# AYARLAR (İhtiyacına göre burayı düzenleyebilirsin)
# =============================================================================

# Bu klasörler tamamen yok sayılacak
IGNORE_DIRS = {
    '.git', 'node_modules', '__pycache__', 'dist', 'build', '.next', 
    '.vscode', '.idea', 'coverage', 'tmp', 'temp'
}

# Bu dosyalar yok sayılacak
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store', 
    'export_project.py', 'tum_kodlar.txt', '.env.local', '.env'
}

# Sadece bu uzantılara sahip dosyalar okunacak (Gereksiz binary/resim dosyalarını almamak için)
ALLOWED_EXTENSIONS = {
    # Web & JS
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json',
    # Python & Backend
    '.py', '.sql', '.prisma',
    # Config & Doc
    '.md', '.txt', '.yml', '.yaml', '.xml', '.ini', '.toml',
    # Config Files
    '.babelrc', '.eslintrc', '.prettierrc', 'Dockerfile'
}

OUTPUT_FILE = "tum_kodlar.txt"

# =============================================================================
# FONKSİYONLAR
# =============================================================================

def is_allowed_file(filename):
    """Dosyanın okunup okunmayacağına karar verir."""
    if filename in IGNORE_FILES:
        return False
    # Dockerfile gibi uzantısız ama önemli dosyalar için istisna
    if filename in ALLOWED_EXTENSIONS: 
        return True
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)

def get_file_content(filepath):
    """Dosya içeriğini okur ve gereksiz boşlukları temizler (Token tasarrufu)."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Token Tasarrufu: Çoklu boş satırları tek satıra indir
        lines = content.splitlines()
        cleaned_lines = [line.rstrip() for line in lines] # Satır sonu boşluklarını sil
        
        # Boş satırları tamamen silmek yerine, kod okunabilirliği için 
        # ardışık boş satırları teke düşürebiliriz. Ama burada direkt yazıyoruz.
        # İstersen filter(None, cleaned_lines) ile tüm boş satırları silebilirsin.
        return "\n".join(cleaned_lines)
    except Exception as e:
        return f"!!! HATA: Dosya okunamadı ({e}) !!!"

def generate_tree(startpath):
    """Proje klasör yapısını ağaç olarak string döndürür."""
    tree_str = "=== PROJE DOSYA AĞACI ===\n./\n"
    
    for root, dirs, files in os.walk(startpath):
        # Yoksayılan klasörleri yerinde filtrele (böylece içlerine girmez)
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        level = root.replace(startpath, '').count(os.sep)
        indent = '    ' * (level)
        subindent = '    ' * (level + 1)
        
        if root != startpath:
            tree_str += f"{indent}{os.path.basename(root)}/\n"
            
        for f in files:
            if is_allowed_file(f):
                tree_str += f"{subindent}{f}\n"
                
    return tree_str

def main():
    print(f"🚀 İşlem başlatılıyor... Hedef dosya: {OUTPUT_FILE}")
    
    current_dir = os.getcwd()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # 1. BÖLÜM: Dosya Ağacı (AI'ın modüler yapıyı anlaması için)
        tree = generate_tree(current_dir)
        outfile.write(tree)
        outfile.write("\n\n=== DOSYA İÇERİKLERİ ===\n\n")
        
        # 2. BÖLÜM: Dosya İçerikleri
        file_count = 0
        for root, dirs, files in os.walk(current_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if is_allowed_file(file):
                    filepath = os.path.join(root, file)
                    relative_path = os.path.relpath(filepath, current_dir)
                    
                    # AI'ın dosyayı tanıması için başlık
                    outfile.write(f"\n{'='*50}\n")
                    outfile.write(f"DOSYA YOLU: .\\{relative_path}\n")
                    outfile.write(f"{'='*50}\n")
                    
                    content = get_file_content(filepath)
                    outfile.write(content + "\n")
                    file_count += 1
                    print(f"Okundu: {relative_path}")

    print(f"\n✅ İşlem Tamamlandı!")
    print(f"📂 Toplam {file_count} dosya '{OUTPUT_FILE}' içine yazıldı.")
    print("👉 Şimdi bu dosyayı AI asistanına yükleyebilirsin.")

if __name__ == "__main__":
    main()