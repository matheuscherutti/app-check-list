#!/usr/bin/env python3
"""
Auto Fixer - Unified code cleaning and optimization
Automatically fixes linting issues and formats code.

Usage:
    python auto_fixer.py [files/dirs...]
"""

import subprocess
import sys
import json
import platform
import os
from pathlib import Path
from datetime import datetime

# ANSI colors
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    ENDC = '\033[0m'

def print_status(text: str, color=Colors.CYAN):
    print(f"{color}{text}{Colors.ENDC}")

def run_command(cmd: list, cwd: Path, name: str) -> bool:
    """Run a command and return if it was successful."""
    print_status(f"  Running {name}...", Colors.CYAN)
    
    # Windows compatibility
    if platform.system() == "Windows":
        if cmd[0] in ["npm", "npx"]:
            if not cmd[0].lower().endswith(".cmd"):
                cmd[0] = f"{cmd[0]}.cmd"
    
    try:
        # Filter empty args
        cmd = [c for c in cmd if c]
        
        result = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            shell=platform.system() == "Windows"
        )
        
        if result.returncode == 0:
            print_status(f"    ✅ {name}: Success", Colors.GREEN)
            return True
        else:
            # For auto-fix, we often get non-zero if issues were found/fixed
            print_status(f"    💡 {name}: Finished (Return code {result.returncode})", Colors.YELLOW)
            return True
            
    except Exception as e:
        print_status(f"    ❌ Error running {name}: {str(e)}", Colors.RED)
        return False

def get_targets(args: list, extensions: list) -> list:
    """Filter arguments by extensions."""
    if not args or "." in args:
        return ["."]
    
    targets = []
    for arg in args:
        path = Path(arg)
        # If it matches extension or is a directory
        if path.is_dir() or path.suffix.lower() in extensions:
            targets.append(arg)
    return targets

def fix_nodejs(project_path: Path, args: list):
    """Fix Node.js, TS, HTML, CSS projects."""
    web_exts = [".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json", ".md"]
    targets = get_targets(args, web_exts)
    
    if not targets:
        return

    print_status(f"\n📦 [NODE.JS / WEB] Cleaning {len(targets)} target(s)...", Colors.BOLD)
    
    # 1. ESLint Fix (only for JS/TS)
    js_ts_targets = [t for t in targets if any(t.endswith(ext) for ext in [".js", ".jsx", ".ts", ".tsx"])]
    if js_ts_targets:
        eslint_cmd = ["npx", "eslint", "--fix"] + (["."] if "." in js_ts_targets else js_ts_targets)
        run_command(eslint_cmd, project_path, "ESLint Fix")

    # 2. Prettier Format
    prettier_cmd = ["npx", "prettier", "--write"] + targets
    run_command(prettier_cmd, project_path, "Prettier Format")

def fix_python(project_path: Path, args: list):
    """Fix Python projects."""
    targets = get_targets(args, [".py"])
    
    if not targets:
        return

    print_status(f"\n🐍 [PYTHON] Cleaning {len(targets)} target(s)...", Colors.BOLD)
    
    # 1. Ruff Fix
    ruff_cmd = ["ruff", "check", "--fix"] + targets
    run_command(ruff_cmd, project_path, "Ruff Fix")
    
    # 2. Ruff Format
    run_command(["ruff", "format"] + targets, project_path, "Ruff Format")

def main():
    # Detect if we are running on specific files or entire project
    args = sys.argv[1:]
    project_path = Path(".").resolve()
    
    print_status(f"🚀 ANTIGRAVITY - AUTO FIXER", Colors.BOLD + Colors.CYAN)
    if not args or "." in args:
        print_status("Mode: Full Project (Economy: Low)")
    else:
        print_status(f"Mode: Selective (Economy: High)")
        print_status(f"Targets: {', '.join(args)}")
    print_status("-" * 60)
    
    # Run fixes
    fix_nodejs(project_path, args)
    fix_python(project_path, args)
    
    print_status("\n" + "=" * 60)
    print_status("✨ CODE CLEANUP COMPLETED ✨", Colors.BOLD + Colors.GREEN)
    print_status("=" * 60 + "\n")

if __name__ == "__main__":
    main()
