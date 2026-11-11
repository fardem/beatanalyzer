# BeatThis - Lokale Windows-Installation mit isolierter Python-Umgebung (venv)

Diese Anleitung zeigt dir, wie du **BeatThis** und das [CPJKU/beat_this](https://github.com/CPJKU/beat_this) Transformer-Modell vollständig lokal auf deinem Windows-PC (Windows 10 / Windows 11) in einer isolierten virtuellen Umgebung (`venv`) ausführst.

---

## ⚡ Schnellstart in 2 Schritten

### 1. Einmalige Voraussetzung: Python 3
Falls du Python noch nicht installiert hast:
1. Lade **Python 3.10, 3.11 oder 3.12** von [python.org/downloads](https://www.python.org/downloads/) herunter.
2. ⚠️ **Sehr wichtig:** Setze beim Installer ganz unten den Haken bei:  
   **☑ "Add python.exe to PATH"** (bzw. "Add Python to PATH").
3. Klicke auf *Install Now*.

### 2. Doppelklick auf `install_and_run.bat`
Mache einfach einen Doppelklick auf die Datei **`install_and_run.bat`** im Projektordner:
- ✅ Prüft deine Python-Installation.
- ✅ Erstellt automatisch die isolierte Umgebung im Ordner `venv\` (dein restliches Windows-System bleibt völlig unberührt).
- ✅ Installiert **PyTorch**, **CPJKU beat_this**, **Librosa**, **SoundFile** und **FastAPI**.
- ✅ Startet den lokalen Server und öffnet automatisch deinen Browser auf **`http://localhost:8000`**!

---

## 📁 Die fertigen Windows-Batch-Dateien im Überblick

| Datei | Funktion |
|---|---|
| **`install_and_run.bat`** | **Erstinstallation**: Erstellt das `venv`, lädt alle Pakete herunter und startet die Web-App. |
| **`start.bat`** | **Täglicher Schnellstart**: Überspringt die Installation und startet Server & Browser direkt in 1 Sekunde. |
| **`run_cli.bat`** | **Drag & Drop**: Ziehe eine beliebige `.mp3`, `.wav`, `.aac` oder `.flac` Datei direkt mit der Maus auf die `run_cli.bat` im Windows Explorer, um sie sofort im Terminal zu analysieren! |

---

## 🚀 Brauche ich Node.js / npm?
**Nein!**  
Das Web-Frontend ist im Ordner `dist/` bereits fertig vorkompiliert. Der lokale Python-Server liefert die vollständige Benutzeroberfläche inklusive interaktiver Wellenform, Metronom und Export direkt an deinen Browser aus.

---

## 🎮 GPU-Beschleunigung (Optional mit NVIDIA Grafikkarten)
PyTorch erkennt auf Windows automatisch, ob ein NVIDIA-Grafiktreiber mit CUDA vorhanden ist.
- Mit NVIDIA GPU: Analysezeit ca. **0,5 bis 1,5 Sekunden** für einen kompletten Song.
- Mit CPU: Analysezeit ca. **3 bis 6 Sekunden**.

---

## 🛠️ Häufige Fragen & Fehlerbehebung

### „Der Befehl 'python' ist entweder falsch geschrieben...“
- Du hast Python installiert, aber vergessen, den Haken bei *„Add Python to PATH“* zu setzen.
- **Lösung:** Starte den Python-Installer erneut, wähle *Modify* und aktiviere *Add to PATH*.

### Wie beende ich die App?
- Klicke einfach in das geöffnete schwarze Eingabeaufforderungs-Fenster und drücke **`STRG + C`** oder schließe das Fenster.

### Wie lösche ich die Installation wieder restlos?
- Da alles in einer isolierten virtuellen Umgebung läuft, löschst du einfach den Ordner **`venv\`**. Es bleiben keine Restdateien auf deinem System zurück.
