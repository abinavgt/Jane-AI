"""
Root entrypoint for Render, Railway, and PaaS deployments.
Allows uvicorn main:app to work even when Root Directory is not set to 'backend'.
"""
import sys
import os
from pathlib import Path
import importlib.util

root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"

os.chdir(backend_dir)
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

backend_main_file = backend_dir / "main.py"
spec = importlib.util.spec_from_file_location("backend_main", backend_main_file)
mod = importlib.util.module_from_spec(spec)
sys.modules["backend_main"] = mod
spec.loader.exec_module(mod)

app = mod.app
