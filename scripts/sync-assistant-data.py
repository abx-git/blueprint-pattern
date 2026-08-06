#!/usr/bin/env python3
"""Extract session prompts from prompts/workflows/*.md into docs/assistant/workflows.json.

Each workflow .md must include **Track**, **Activity**, and **Mode** in its metadata table.
Run scripts/sync-workflow-metadata.py when adding workflows from the catalog template.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WF_DIR = ROOT / "prompts" / "workflows"
OUT = ROOT / "docs" / "assistant" / "workflows.json"
STUDIO_PUBLIC = ROOT / "docs" / "studio" / "public"
STUDIO_ASSISTANT = STUDIO_PUBLIC / "assistant"
STUDIO_CATALOG = ROOT / "docs" / "studio" / "src" / "catalog"
ADOPT_SRC = ROOT / "prompts" / "adopt-standalone.md"
ADOPT_PROC = ROOT / "docs" / "reference" / "adopt-procedure.md"
ADOPT_OUT = ROOT / "docs" / "assistant" / "adopt-prompt.txt"

ROLE_TRACK_FALLBACK = {
    "bootstrap": "Build",
    "maintenance": "Evolve",
    "architecture-work": "Architect",
    "domain-work": "Domain",
    "review": "Verify",
}


def table_field(text: str, name: str) -> str:
    m = re.search(rf"\*\*{re.escape(name)}\*\*\s*\|\s*(.+?)\s*\|", text)
    return m.group(1).strip() if m else ""


def parse_steps(prompt: str) -> list[str]:
    steps: list[str] = []
    in_instructions = False
    for line in prompt.splitlines():
        if re.match(r"^Instructions:\s*$", line.strip()):
            in_instructions = True
            continue
        if in_instructions:
            if re.match(r"^Output\s+\[\[ANCHOR:", line.strip()):
                break
            m = re.match(r"^\d+\.\s+(.+)$", line.strip())
            if m:
                steps.append(re.sub(r"\s+", " ", m.group(1)).strip())
            elif line.strip() and steps:
                steps[-1] = f"{steps[-1]} {line.strip()}"
    if steps:
        return steps

    body: list[str] = []
    skip_prefixes = ("AGM", "Architecture Graph Method", "Workflow:", "Role:", "Output ")
    for line in prompt.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if any(stripped.startswith(p) for p in skip_prefixes):
            continue
        if stripped.startswith("Instructions:"):
            break
        if re.match(r"^[A-Za-z].+:\s*$", stripped) and "<" not in stripped:
            continue
        body.append(stripped)
    return body


def parse_placeholders(prompt: str) -> list[str]:
    return sorted(set(re.findall(r"<([^>]+)>", prompt)))


def fresh_chat_value(text: str) -> tuple[bool, str]:
    raw = table_field(text, "Fresh session")
    if not raw:
        return False, ""
    lower = raw.lower()
    required = "required" in lower
    return required, raw


def main() -> int:
    items = []
    for path in sorted(WF_DIR.glob("*.md")):
        if path.name == "ACTIVE.md":
            continue
        text = path.read_text(encoding="utf-8")
        role = table_field(text, "Role").strip("`")
        track = table_field(text, "Track") or ROLE_TRACK_FALLBACK.get(role, role)
        activity = table_field(text, "Activity")
        mode = table_field(text, "Mode")
        when = table_field(text, "When")
        prerequisite = table_field(text, "Prerequisite")
        fresh_chat, fresh_note = fresh_chat_value(text)
        block = re.search(r"## Session prompt\s+```\s*\n(.*?)```", text, re.S)
        prompt = block.group(1).strip() if block else ""
        anchors = sorted(set(re.findall(r"\[\[ANCHOR:([A-Z_]+)\]\]", prompt)))
        steps = parse_steps(prompt)
        placeholders = parse_placeholders(prompt)

        entry = {
            "id": path.stem,
            "track": track,
            "activity": activity,
            "mode": mode,
            "role": role,
            "group": track,
            "when": when,
            "prerequisite": prerequisite,
            "freshChat": fresh_chat,
            "freshNote": fresh_note,
            "anchors": anchors,
            "steps": steps,
            "placeholders": placeholders,
            "prompt": prompt,
        }
        items.append(entry)

    OUT.write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} workflows to {OUT}")

    if ADOPT_SRC.is_file():
        text = ADOPT_SRC.read_text(encoding="utf-8")
        block = re.search(r"## Session prompt\s+```\s*\n(.*?)```", text, re.S)
        prompt = block.group(1).strip() if block else text.strip()
        if ADOPT_PROC.is_file():
            procedure = ADOPT_PROC.read_text(encoding="utf-8").strip()
            prompt = f"{prompt}\n\n---\n\n{procedure}"
        ADOPT_OUT.write_text(prompt + "\n", encoding="utf-8")
        print(f"Wrote adoption prompt to {ADOPT_OUT}")

    # Mirror assistant data into Review Studio (Vite public/ + SPA catalog + iframe copy)
    if STUDIO_PUBLIC.is_dir():
        STUDIO_PUBLIC.mkdir(parents=True, exist_ok=True)
        STUDIO_ASSISTANT.mkdir(parents=True, exist_ok=True)
        STUDIO_CATALOG.mkdir(parents=True, exist_ok=True)
        for name in ("workflows.json", "anchors.json", "adopt-prompt.txt"):
            src = OUT.parent / name
            if src.is_file():
                text = src.read_text(encoding="utf-8")
                (STUDIO_PUBLIC / name).write_text(text, encoding="utf-8")
                (STUDIO_ASSISTANT / name).write_text(text, encoding="utf-8")
                # Bundle into SPA so Session/Adopt does not depend on runtime fetch
                if name in ("workflows.json", "adopt-prompt.txt"):
                    (STUDIO_CATALOG / name).write_text(text, encoding="utf-8")
        for name in ("index.html", "app.js", "app.css"):
            src = OUT.parent / name
            if src.is_file():
                (STUDIO_ASSISTANT / name).write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"Synced assistant assets into {STUDIO_PUBLIC} and {STUDIO_CATALOG}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
