#!/bin/sh
canary=$(/usr/share/shelter/find-resources.sh discord-canary)
stable=$(/usr/share/shelter/find-resources.sh discord)
ptb=$(/usr/share/shelter/find-resources.sh discord-ptb)

installSh () {
mv $1/app.asar $1/original.asar
cp -r /usr/share/shelter/app $1/app
}

if test -f "$stable/app.asar"; then
 installSh $stable
 echo "Installed shelter for Stable"
 fi

if test -f "$canary/app.asar"; then
  installSh $canary
  echo "Installed shelter for Canary"
  fi

if test -f "$ptb/app.asar"; then
 installSh $ptb
 echo "Installed shelter for PTB"
 fi