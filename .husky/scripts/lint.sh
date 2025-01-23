#!/bin/sh

RESET='\033[0m'
BOLD='\033[1m'
MAGENTA='\033[35m'
RED='\033[31m'

FAILURE=0

dir=$(pwd)
echo "${MAGENTA}${BOLD}"
echo "~~~~~ Linting $(basename $dir) ~~~~~" | sed  -e :a -e "s/^.\{1,$(tput cols)\}$/ & /;ta" | tr -d '\n' | head -c $(tput cols)
echo $RESET
yarn run eslint --fix $dir -c $dir/eslint.config.mjs
if [ $? -ne 0 ]; then
    FAILURE=1
fi
if [ $FAILURE -ne 0 ]; then
	echo "${BOLD}${RED}Linting failed. Aborting...${RESET}"
	exit $FAILURE
fi

git add .