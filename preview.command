#!/bin/zsh
# Local-only preview. Stop with Ctrl+C.
cd -- "${0:A:h}" || exit 1
print '本地预览 / Local preview: http://127.0.0.1:8765/'
python3 -m http.server 8765 --bind 127.0.0.1
