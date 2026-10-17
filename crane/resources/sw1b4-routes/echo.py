# Lane sw1-b4: the network's answer, naming the request's method.
def main(request, response):
    return [(b"Content-Type", b"text/plain")], b"network " + request.method.encode()
