#!/usr/bin/env python3
"""
install_hooks.py — Instala o Git pre-commit hook para o Antigravity Kit.
Executa os testes de integridade automaticamente antes de cada commit.
Usage: python .agent/scripts/install_hooks.py
"""
import sys
import stat
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
GIT_HOOKS_DIR = REPO_ROOT / ".git" / "hooks"
PRE_COMMIT_PATH = GIT_HOOKS_DIR / "pre-commit"

# ── hook script content ───────────────────────────────────────────────────────
# Git on Windows runs hooks via sh/bash; we write a .py file alongside the hook
# and a shell wrapper that calls `py` (Windows Python launcher) or `python3`.
HOOK_CONTENT_PY = '''\
"""
pre-commit hook — Antigravity Kit integrity check.
Auto-installed by install_hooks.py. Do not edit manually.
"""
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def run_check(command: list, label: str) -> bool:
    print(f"\\n  [pre-commit] Running: {label}...")
    result = subprocess.run(command, cwd=str(REPO_ROOT))
    return result.returncode == 0


def main() -> None:
    print("\\n🔍 Antigravity Kit — Pre-commit check")
    print("─" * 40)

    ok = run_check(
        [sys.executable, "-m", "pytest",
         ".agent/tests/test_kit_integrity.py", "-q", "--tb=short"],
        "Kit Integrity Tests",
    )

    if not ok:
        print("\\n❌ Pre-commit BLOCKED: Kit integrity tests failed.")
        print("   Fix the issues above before committing.")
        print("   To skip in an emergency: git commit --no-verify")
        sys.exit(1)

    print("\\n✅ Pre-commit checks passed. Proceeding with commit.\\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
'''

# Shell script that calls the .py hook — works on Git for Windows (Git Bash)
# Uses $(dirname $0) so it always finds pre-commit.py next to itself
HOOK_CONTENT_SH = '''\
#!/bin/sh
# pre-commit — Antigravity Kit
# Calls the Python hook. Works on Windows (py launcher) and Linux/macOS (python3).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if command -v py >/dev/null 2>&1; then
    py "$SCRIPT_DIR/pre-commit.py"
elif command -v python3 >/dev/null 2>&1; then
    python3 "$SCRIPT_DIR/pre-commit.py"
else
    python "$SCRIPT_DIR/pre-commit.py"
fi
'''


GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"


def main() -> None:
    print(f"\n{BOLD}🪝 Installing Antigravity pre-commit hook...{RESET}")

    if not GIT_HOOKS_DIR.exists():
        print(f"  {RED}✘{RESET} .git/hooks/ not found — is this a git repository?")
        sys.exit(1)

    pre_commit_sh = GIT_HOOKS_DIR / "pre-commit"
    pre_commit_py = GIT_HOOKS_DIR / "pre-commit.py"

    # Backup existing hook if it's not ours
    if pre_commit_sh.exists():
        existing = pre_commit_sh.read_text(encoding="utf-8", errors="ignore")
        if "Antigravity Kit" not in existing:
            pre_commit_sh.rename(pre_commit_sh.with_suffix(".backup"))
            print("  ⚠  Existing hook backed up to: pre-commit.backup")
        else:
            print(f"  {GREEN}✔{RESET} Updating existing hook...")

    # Write shell wrapper (git calls this)
    pre_commit_sh.write_text(HOOK_CONTENT_SH, encoding="utf-8")
    mode = pre_commit_sh.stat().st_mode
    pre_commit_sh.chmod(mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    # Write Python logic file (shell wrapper calls this)
    pre_commit_py.write_text(HOOK_CONTENT_PY, encoding="utf-8")

    print(f"  {GREEN}✔{RESET} Hook installed: .git/hooks/pre-commit (shell wrapper)")
    print(f"  {GREEN}✔{RESET} Logic:          .git/hooks/pre-commit.py (Python tests)")
    print(f"\n{BOLD}How it works:{RESET}")
    print("  • git commit  →  runs pytest .agent/tests/ first")
    print("  • Tests PASS  →  commit proceeds normally")
    print("  • Tests FAIL  →  commit is BLOCKED with error message")
    print("  • Emergency?  →  git commit --no-verify  (bypasses hook)\n")


if __name__ == "__main__":
    main()

