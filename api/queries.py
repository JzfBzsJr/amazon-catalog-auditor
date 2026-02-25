import sys
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, str(Path(__file__).parent.parent / "amazon-catalog-cli-main"))

from catalog.query_engine import QueryEngine
from catalog.queries import (
    MissingAttributesQuery,
    MissingAnyAttributesQuery,
    LongTitlesQuery,
    TitleProhibitedCharsQuery,
    RufusBulletsQuery,
    ProhibitedCharsQuery,
    ProductTypeMismatchQuery,
    MissingVariationsQuery,
    NewAttributesQuery,
)

ALL_QUERY_CLASSES = [
    MissingAttributesQuery,
    MissingAnyAttributesQuery,
    LongTitlesQuery,
    TitleProhibitedCharsQuery,
    RufusBulletsQuery,
    ProhibitedCharsQuery,
    ProductTypeMismatchQuery,
    MissingVariationsQuery,
    NewAttributesQuery,
]


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        engine = QueryEngine(None)
        for QueryClass in ALL_QUERY_CLASSES:
            engine.register_query(QueryClass())

        body = json.dumps(engine.list_queries()).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass
