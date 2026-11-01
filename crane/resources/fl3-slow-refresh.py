import time

# A document with "Refresh: 0" to its own URL, answered after `delay` ms: its
# refresh is a reload whose response is as slow as the first load was.
def main(request, response):
    delay = float(request.GET.first(b"delay", b"1500")) / 1000
    time.sleep(delay)
    return 200, [(b"Content-Type", b"text/html"), (b"Refresh", b"0")], b"<!doctype html><p>refreshing"
