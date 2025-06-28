#!/bin/sh
echo $(readlink -f $(command -v $1) | rev | cut -d/ -f2- | rev)/resources
