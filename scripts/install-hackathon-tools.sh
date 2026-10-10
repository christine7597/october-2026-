#!/bin/sh
# Installs the Entire CLI in ephemeral cloud containers so the Claude Code
# hooks in .claude/settings.json keep recording sessions after a restart.
ENTIRE_VERSION="v0.11.4"
if ! command -v entire >/dev/null 2>&1; then
  GOTOOLCHAIN=auto go install "github.com/entireio/cli/cmd/entire@${ENTIRE_VERSION}" >/dev/null 2>&1 &&
    ln -sf "$(go env GOPATH)/bin/entire" /usr/local/bin/entire 2>/dev/null
fi
exit 0
