## Hizli Baslangic

### Tek seferlik kurulum
```powershell
# 1. Repo'yu klonla
git clone <repo-url>
cd Eco-Wings

# 2. PowerShell execution policy (sadece bir kere)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 3. Frontend bagimliliklar
cd frontend\ecowings
npm install
cd ..\..

# 4. Python servisleri icin venv kurulumu
.\setup-python-services.ps1
```

### Tum servisleri baslat
```powershell
.\start-ecowings.ps1
```

### Tum servisleri durdur
```powershell
.\stop-ecowings.ps1
```

### Servis adresleri
| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API (Swagger) | https://localhost:5000/swagger |
| FAQ Service (Swagger) | http://localhost:8001/docs |
| Eco Agent Service (Swagger) | http://localhost:8002/docs |
| ML Service | ONNX export scripti (port yok) |
