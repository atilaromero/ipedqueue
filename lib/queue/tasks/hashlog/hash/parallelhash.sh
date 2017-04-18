#!/bin/bash -e
: ${1?Use $0 SOURCE}
ORIG="${1##*/}"
PDEST="${1%/*}"
MYDIR="$(cd "$(dirname "$0")"; pwd)"
if [[ "$(uname -m)" == "x86_64" ]]
then
    MYARCH=64
else
    MYARCH=32
fi

mkdir -p "$PDEST"
cd "$PDEST"
time "$MYDIR"/parallelhash"$MYARCH" -y -i "$ORIG" --sha1 hashlog.sha1,1Gi --md5 hashlog.md5,1Gi || exit 1
