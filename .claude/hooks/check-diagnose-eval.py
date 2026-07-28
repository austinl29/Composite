#!/usr/bin/env python3
"""
PreToolUse (Bash) push-gate: blocks `git push` unless evals/.last-run.json
shows the eval suite ran against the current state of the diagnosis-related
files (covering /api/diagnose, /api/followup-questions, /api/synthesize,
and the file-upload path they read from: /api/upload, lib/fileContext.ts,
lib/uploadedFileParam.ts), with zero blocking failures — fabrication, forbidden-
technique match, a fabricated-projection/citation-claim pattern hit, a
malformed structured response, a grounded-plan echo mismatch, or an
unmarked-hypothetical Composite Insight example.

Dumb and fast on purpose: no LLM calls, just a stdin JSON read, one regex
check for whether this is actually a git-push command, a file-existence
check, a sha256 comparison, and a field read. See scripts/run-evals.mjs for
the file list and hashing logic this must match.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys


def allow():
    sys.exit(0)


def deny(reason):
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )
    sys.exit(0)


try:
    payload = json.load(sys.stdin)
except Exception:
    # Can't read our own input — don't block on our own failure.
    allow()

command = (payload.get("tool_input") or {}).get("command") or ""

# Only care about commands that actually invoke `git push` (as the first
# command, or chained after && / ; / |). Everything else bails out fast.
if not re.search(r"(^|&&|;|\|)\s*git\s+push\b", command):
    allow()

try:
    repo_root = pathlib.Path(
        subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"], text=True, stderr=subprocess.DEVNULL
        ).strip()
    )
except Exception:
    # Not in a git repo (shouldn't happen for a git push command) — don't
    # block on our own inability to locate the repo.
    allow()

last_run_path = repo_root / "evals" / ".last-run.json"
DIAGNOSIS_RELATED_FILES = [
    "app/api/diagnose/route.ts",
    "lib/prompts/diagnose.ts",
    "lib/diagnose.ts",
    "evals/diagnose-cases.json",
    "lib/prompts/followup.ts",
    "lib/followup.ts",
    "app/api/followup-questions/route.ts",
    "lib/prompts/synthesize.ts",
    "lib/synthesize.ts",
    "app/api/synthesize/route.ts",
    "evals/followup-synthesize-cases.json",
    "app/api/leads/route.ts",
    "lib/fileContext.ts",
    "lib/uploadedFileParam.ts",
    "app/api/upload/route.ts",
]

if not last_run_path.exists():
    deny(
        "Blocked: evals/.last-run.json not found. Run `node scripts/run-evals.mjs` "
        "(it writes this file) before pushing changes to the diagnosis agent."
    )

try:
    last_run = json.loads(last_run_path.read_text())
except Exception:
    deny(
        "Blocked: evals/.last-run.json exists but is not valid JSON. "
        "Run `node scripts/run-evals.mjs` again."
    )

hasher = hashlib.sha256()
for rel in DIAGNOSIS_RELATED_FILES:
    p = repo_root / rel
    if p.exists():
        hasher.update(p.read_bytes())
    else:
        hasher.update(f"__MISSING__:{rel}".encode())
current_hash = hasher.hexdigest()

stored_hash = last_run.get("fileHash")
if stored_hash != current_hash:
    deny(
        "Blocked: diagnosis-related files ("
        + ", ".join(DIAGNOSIS_RELATED_FILES)
        + ") have changed since the last recorded eval run. Run "
        "`node scripts/run-evals.mjs` and try again."
    )

blocking = last_run.get("blockingFailureCount")
if blocking is None or blocking != 0:
    deny(
        f"Blocked: the last eval run recorded {blocking} blocking failure(s) "
        "(fabricated technique id, forbidden-technique match, or a "
        "fabricated-projection pattern match) — these must be zero before "
        "pushing. Run `node scripts/run-evals.mjs`, fix the issue, and try again."
    )

allow()
