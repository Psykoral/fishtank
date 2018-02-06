#!/usr/bin/env bash
npm start > stdout.txt 2> stderr.txt &
disown %1
