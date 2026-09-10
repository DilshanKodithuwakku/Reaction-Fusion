"""
ReactionFusion Plugin Backend Server
Starts the FastAPI Inference API on http://127.0.0.1:8000 for the Chrome Extension.
"""

import os
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    print("=" * 70)
    print("  REACTIONFUSION: FACEBOOK PLUGIN INFERENCE SERVER")
    print("=" * 70)

    venv_python = ROOT / ".venv/Scripts/python.exe"
    if not venv_python.exists():
        venv_python = Path(sys.executable)

    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = f"{ROOT / 'src'};{ROOT / 'platform/backend'}"

    print(f"Starting server on http://127.0.0.1:8000 ...")
    print(f"Swagger API Docs: http://127.0.0.1:8000/docs\n")

    try:
        subprocess.run(
            [
                str(venv_python), "-m", "uvicorn",
                "app.main:app",
                "--host", "127.0.0.1",
                "--port", "8000",
                "--reload"
            ],
            cwd=str(ROOT / "platform/backend"),
            env=backend_env,
            check=True
        )
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    main()
