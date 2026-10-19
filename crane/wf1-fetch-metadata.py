import json


def main(request, response):
    destination = request.headers.get(b"sec-fetch-dest", b"").decode("ascii")
    return [(b"Content-Type", b"text/javascript"), (b"Cache-Control", b"no-store")], (
        "export const destination = " + json.dumps(destination) + ";"
    ).encode("utf-8")
