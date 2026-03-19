#!/usr/bin/env python3
"""
doctor.py — Antigravity Kit Health Diagnostics
Verifica a integridade completa do .agent/ (agentes, skills, workflows, scripts, memory).
Usage: python .agent/scripts/doctor.py
"""
import sys
from pathlib import Path

# ── constants ──────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
AGENT_DIR = REPO_ROOT / ".agent"
AGENTS_DIR = AGENT_DIR / "agents"
SKILLS_DIR = AGENT_DIR / "skills"
WORKFLOWS_DIR = AGENT_DIR / "workflows"
SCRIPTS_DIR = AGENT_DIR / "scripts"
TESTS_DIR = AGENT_DIR / "tests"
MEMORY_DIR = AGENT_DIR / "memory"
RULES_DIR = AGENT_DIR / "rules"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"


# ── helpers ─────────────────────────────────────────────────────────────────
def ok(msg: str) -> None:
    print(f"  {GREEN}✔{RESET} {msg}")


def fail(msg: str) -> None:
    print(f"  {RED}✘{RESET} {msg}")


def warn(msg: str) -> None:
    print(f"  {YELLOW}⚠{RESET} {msg}")


def section(title: str) -> None:
    print(f"\n{CYAN}{BOLD}{title}{RESET}")


def extract_frontmatter_field(content: str, field: str) -> str:
    """Extract a field value from YAML frontmatter."""
    for line in content.splitlines():
        if line.startswith(f"{field}:"):
            return line.split(":", 1)[1].strip()
    return ""


def collect_skill_refs_from_frontmatter(content: str) -> list[str]:
    """Extract skills listed in agent frontmatter skills: field."""
    raw = extract_frontmatter_field(content, "skills")
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


# ── check functions ──────────────────────────────────────────────────────────
def check_directory_structure() -> int:
    """Verify required .agent/ subdirectories exist."""
    errors = 0
    required_dirs = [
        AGENTS_DIR, SKILLS_DIR, WORKFLOWS_DIR,
        SCRIPTS_DIR, RULES_DIR,
    ]
    optional_dirs = [TESTS_DIR, MEMORY_DIR]

    for directory in required_dirs:
        if directory.exists():
            ok(f"{directory.name}/ found")
        else:
            fail(f"{directory.name}/ MISSING (required)")
            errors += 1

    for directory in optional_dirs:
        if directory.exists():
            ok(f"{directory.name}/ found")
        else:
            warn(f"{directory.name}/ not found (optional — will be created on first use)")

    return errors


def check_agents() -> int:
    """Validate all agent .md files have required frontmatter."""
    errors = 0
    agents = list(AGENTS_DIR.glob("*.md")) if AGENTS_DIR.exists() else []

    if not agents:
        fail("No agents found in .agent/agents/")
        return 1

    broken = []
    for agent_path in sorted(agents):
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        name = extract_frontmatter_field(content, "name")
        if not name:
            broken.append(agent_path.name)

    if broken:
        for b in broken:
            fail(f"agents/{b} — missing 'name:' in frontmatter")
        errors += len(broken)
    else:
        ok(f"Agents: {len(agents)} found, 0 broken frontmatter")

    return errors


def check_skills() -> int:
    """Validate all skill directories have a SKILL.md."""
    errors = 0
    skill_dirs = [d for d in SKILLS_DIR.iterdir() if d.is_dir()] if SKILLS_DIR.exists() else []

    if not skill_dirs:
        fail("No skills found in .agent/skills/")
        return 1

    missing_skill_md = []
    empty_skill_md = []
    for skill_dir in sorted(skill_dirs):
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            missing_skill_md.append(skill_dir.name)
        elif skill_md.stat().st_size < 100:
            empty_skill_md.append(skill_dir.name)

    if missing_skill_md:
        for s in missing_skill_md:
            fail(f"skills/{s}/SKILL.md — MISSING")
        errors += len(missing_skill_md)
    else:
        ok(f"Skills: {len(skill_dirs)} found, 0 missing SKILL.md")

    if empty_skill_md:
        for s in empty_skill_md:
            warn(f"skills/{s}/SKILL.md — appears nearly empty (<100 chars)")

    return errors


def check_cross_references() -> int:
    """Check that skills referenced in agent frontmatter actually exist."""
    errors = 0
    ghost_refs: list[str] = []
    agents = list(AGENTS_DIR.glob("*.md")) if AGENTS_DIR.exists() else []
    available_skills = {d.name for d in SKILLS_DIR.iterdir() if d.is_dir()} if SKILLS_DIR.exists() else set()

    for agent_path in agents:
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        skill_refs = collect_skill_refs_from_frontmatter(content)
        for ref in skill_refs:
            ref_slug = ref.replace(" ", "-").lower()
            # Try exact match and partial match (some refs use short names)
            if ref_slug not in available_skills and ref not in available_skills:
                # Check if any available skill name contains the ref slug
                partial_match = any(ref_slug in s for s in available_skills)
                if not partial_match:
                    ghost_refs.append(f"{agent_path.name} → '{ref}'")

    if ghost_refs:
        for ref in ghost_refs:
            warn(f"Possible ghost skill reference: {ref}")
        # Warnings only — skill names may use aliases
    else:
        ok(f"Cross-references: 0 ghost skills detected")

    return errors


def check_workflows() -> int:
    """Validate all workflow files have a description in frontmatter."""
    errors = 0
    workflows = list(WORKFLOWS_DIR.glob("*.md")) if WORKFLOWS_DIR.exists() else []

    if not workflows:
        fail("No workflows found in .agent/workflows/")
        return 1

    broken = []
    for wf_path in sorted(workflows):
        content = wf_path.read_text(encoding="utf-8", errors="ignore")
        desc = extract_frontmatter_field(content, "description")
        if not desc:
            broken.append(wf_path.name)

    if broken:
        for b in broken:
            fail(f"workflows/{b} — missing 'description:' in frontmatter")
        errors += len(broken)
    else:
        ok(f"Workflows: {len(workflows)} found, 0 broken frontmatter")

    return errors


def check_master_scripts() -> int:
    """Verify master scripts exist in .agent/scripts/."""
    errors = 0
    expected_scripts = ["checklist.py", "verify_all.py"]
    optional_scripts = ["doctor.py", "sync_ide.py"]

    for script_name in expected_scripts:
        script_path = SCRIPTS_DIR / script_name
        if script_path.exists():
            ok(f"scripts/{script_name}: ✅")
        else:
            fail(f"scripts/{script_name}: MISSING (required)")
            errors += 1

    for script_name in optional_scripts:
        script_path = SCRIPTS_DIR / script_name
        if script_path.exists():
            ok(f"scripts/{script_name}: ✅")
        else:
            warn(f"scripts/{script_name}: not found (optional)")

    return errors


def check_tests() -> int:
    """Check that kit integrity test file exists."""
    test_file = TESTS_DIR / "test_kit_integrity.py"
    if TESTS_DIR.exists() and test_file.exists():
        ok(f"tests/test_kit_integrity.py: ✅")
    else:
        warn("tests/test_kit_integrity.py: not found (run /ade to create)")
    return 0


def check_memory_layer() -> int:
    """Verify memory layer is initialized."""
    lessons = MEMORY_DIR / "lessons.md"
    gotchas = MEMORY_DIR / "gotchas.md"

    if MEMORY_DIR.exists() and lessons.exists() and gotchas.exists():
        ok("Memory layer: lessons.md + gotchas.md ✅")
    elif MEMORY_DIR.exists():
        warn("Memory layer: directory exists but files incomplete")
    else:
        warn("Memory layer: .agent/memory/ not found (run: mkdir .agent/memory/)")
    return 0


def check_gemini_rules() -> int:
    """Verify GEMINI.md rules file exists."""
    gemini_path = RULES_DIR / "GEMINI.md"
    if gemini_path.exists() and gemini_path.stat().st_size > 1000:
        ok(f"GEMINI.md (P0 rules): ✅ ({gemini_path.stat().st_size} bytes)")
    else:
        fail("GEMINI.md: MISSING or too small")
        return 1
    return 0


def check_python_version() -> int:
    """Check Python version compatibility."""
    version = sys.version_info
    if version >= (3, 9):
        ok(f"Python {version.major}.{version.minor}.{version.micro} ✅")
    else:
        fail(f"Python {version.major}.{version.minor} — version 3.9+ required")
        return 1
    return 0


# ── main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    print(f"\n{BOLD}🏥 Antigravity Kit — System Diagnostics{RESET}")
    print("─" * 50)

    total_errors = 0

    section("Python Environment")
    total_errors += check_python_version()

    section("Directory Structure")
    total_errors += check_directory_structure()

    section("GEMINI.md Rules (P0)")
    total_errors += check_gemini_rules()

    section("Agents")
    total_errors += check_agents()

    section("Skills")
    total_errors += check_skills()

    section("Cross-References (Agents → Skills)")
    total_errors += check_cross_references()

    section("Workflows")
    total_errors += check_workflows()

    section("Master Scripts")
    total_errors += check_master_scripts()

    section("Kit Tests")
    check_tests()

    section("Memory Layer")
    check_memory_layer()

    print("\n" + "─" * 50)
    if total_errors == 0:
        print(f"\n{GREEN}{BOLD}✅ All checks passed! Kit is healthy.{RESET}\n")
        sys.exit(0)
    else:
        print(f"\n{RED}{BOLD}❌ {total_errors} issue(s) found. Fix before proceeding.{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
