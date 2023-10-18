#!/bin/sh
echo $(readlink $(command -v $1) | rev | cut -d/ -f2- | rev)/resources