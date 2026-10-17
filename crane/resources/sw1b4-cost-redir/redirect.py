# Lane sw1-b4: a 302 to the `to` query parameter (a URL in or out of scope).
def main(request, response):
    return 302, [(b"Location", request.GET.first(b"to"))], b""
