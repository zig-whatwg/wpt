# Lane sw1-b4: a navigation preload target. Its body names the
# Service-Worker-Navigation-Preload header the request carried ("none" when
# it carried none) and the request's method, as an HTML page.
def main(request, response):
    value = request.headers.get(b"Service-Worker-Navigation-Preload", b"none")
    body = b"<!DOCTYPE html><body>" + value + b" " + request.method.encode() + b"</body>"
    return [(b"Content-Type", b"text/html")], body
