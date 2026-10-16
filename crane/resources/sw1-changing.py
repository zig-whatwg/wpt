# A service worker script whose bytes change on every fetch: an update finds
# it changed.
import time


def main(request, response):
    return [(b"Content-Type", b"text/javascript")], ("// %r\n" % time.time()).encode()
