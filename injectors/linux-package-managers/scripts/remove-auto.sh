#!/bin/sh
canary=$(/usr/share/shelter/find-resources.sh discord-canary)
stable=$(/usr/share/shelter/find-resources.sh discord)
ptb=$(/usr/share/shelter/find-resources.sh discord-ptb)

if test -f "$stable/app"; then
  /usr/share/shelter/remove.sh "$stable"
fi

if test -f "$canary/app"; then
  /usr/share/shelter/remove.sh "$canary"
fi

if test -f "$ptb/app"; then
  /usr/share/shelter/remove.sh "$ptb"
fi