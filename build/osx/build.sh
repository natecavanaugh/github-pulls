#!/bin/bash

# Inspired by Gisto's (https://github.com/Gisto/Gisto) build script

NW="/Applications/node-webkit.app"
APP='Github Pulls.app'

BASE_PATH="$(perl -e "use Cwd qw(realpath);print realpath('$0');" | xargs dirname)"
ROOT_PATH="${BASE_PATH}/../.."
APP_PATH="$BASE_PATH/$APP"
APP_SRC_PATH="${ROOT_PATH}/app"
BIN_PATH="${ROOT_PATH}/bin"
BUILD_APP_PATH="$BIN_PATH/${APP}"

if [[ !(-a "$NW") ]]; then
    NW="${HOME}$NW"

    if [[ !(-a "$NW") ]]; then
        echo "This script requires node-webkit.app in your applications folder"

        exit 1
    fi
fi

cd $APP_SRC_PATH
npm install --loglevel error
cd -

cp -r "$NW" "$APP_PATH"

cp -r "$APP_SRC_PATH" "$APP_PATH/Contents/Resources/app.nw"

cp -r "${BASE_PATH}/app.icns" "$APP_PATH/Contents/Resources"
cp -r "${BASE_PATH}/info.plist" "$APP_PATH/Contents"

if [[ -a "$BUILD_APP_PATH" ]]; then
	rm -rf "$BUILD_APP_PATH"
fi

mv -f "$APP" "$BIN_PATH"

echo "$APP copied to bin directory"