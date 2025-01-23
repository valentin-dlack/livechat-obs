#!/bin/bash

RESET='\033[0m'
BOLD='\033[1m'
RED='\033[31m'

MESSAGE=$(cat $1) 
COMMITFORMAT="^(feat|fix|docs|style|refactor|test|chore|perf|other)(\((.*)\))?: (.*)( \(#([0-9]+)\))?$"

if ! [[ "$MESSAGE" =~ $COMMITFORMAT ]]; then
  echo "${BOLD}${RED}Your commit was rejected due to the commit message. Aborting...${RESET}" 
  echo
  echo "Please use the following format:"
  echo "feat: feature example comment (#4321)"
  echo "fix(ui): bugfix example comment (#4321)"
  echo "doc: added documentation"
  echo "doc(install): added installation instructions"
  echo
  echo "More details on ${BOLD}docs/COMMITS.md${RESET}"
  exit 1
fi