#!/usr/bin/env bash

api_key=$(secret-tool search account addons.mozilla.org |& awk '$1=="attribute.UserName" { print $3; }')
api_secret=$(secret-tool lookup account addons.mozilla.org)

exec npx web-ext sign --api-key=$api_key --api-secret=$api_secret "$@"
