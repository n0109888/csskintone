#!/usr/bin/env python3
"""Tiny static dev server that disables caching.

Browsers aggressively cache `main.js`, which means edits don't show up on
reload. This serves every file with no-store headers so a refresh always gets
the latest code. Usage: `python3 server.py [port]` (default 5173).
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
