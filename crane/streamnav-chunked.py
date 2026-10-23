import time


def main(request, response):
    """An HTML document in two chunks, a second apart: the first posts
    "first" to its parent, the second holds #second."""
    response.headers.set(b"Content-Type", b"text/html; charset=utf-8")
    response.headers.set(b"Cache-Control", b"no-store")
    response.headers.set(b"Transfer-Encoding", b"chunked")
    response.write_status_headers()

    body = u"""<!DOCTYPE html>
<p id="first">first</p>
<script>parent.postMessage("first", "*");</script>
""" + u"<!--" + u"x" * 4096 + u"-->"
    response.writer.write(u"%x\r\n" % len(body))
    response.writer.write(body)
    response.writer.write(u"\r\n")

    time.sleep(1)

    body = u"""<p id="second">second</p>
"""
    response.writer.write(u"%x\r\n" % len(body))
    response.writer.write(body)
    response.writer.write(u"\r\n")
    response.writer.write(u"0\r\n\r\n")
