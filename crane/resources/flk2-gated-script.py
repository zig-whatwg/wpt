# A script whose response the server holds until the page releases it
# (crane/flk2-iframe-load-during-blocked-parse.html): no clock decides the
# order, the page does.
#
#   ?key=<uuid>                  the script: answered once ?action=release
#                                arrived for the same key
#   ?key=<uuid>&action=release   release it
#
# A script nobody releases is answered after 6 seconds with a body that says
# so, so the page fails by an assertion and not by its harness timeout.
import time


def main(request, response):
    key = request.GET.first(b"key")
    stash = request.server.stash
    if request.GET.first(b"action", b"") == b"release":
        stash.put(key, b"released")
        return [(b"Content-Type", b"text/plain")], b"released"
    released = False
    for _ in range(600):
        if stash.take(key) is not None:
            released = True
            break
        time.sleep(0.01)
    body = b"window.gatedScript = 'released';" if released else b"window.gatedScript = 'never released';"
    return [(b"Content-Type", b"text/javascript"), (b"Cache-Control", b"no-store")], body
