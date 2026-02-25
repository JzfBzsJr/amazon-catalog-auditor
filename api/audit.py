import sys
import os
import json
import tempfile
import cgi
from pathlib import Path
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, str(Path(__file__).parent.parent / "amazon-catalog-cli-main"))

from catalog.parser import CLRParser
from catalog.query_engine import QueryEngine
from catalog.output import format_json
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

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def _register_all(engine: QueryEngine):
    for QueryClass in ALL_QUERY_CLASSES:
        engine.register_query(QueryClass())


def _run_audit(file_path: str) -> dict:
    parser = CLRParser(file_path)
    engine = QueryEngine(parser)
    _register_all(engine)
    results = engine.execute_all()
    return json.loads(format_json(results))


def _send_json(req: BaseHTTPRequestHandler, status: int, data: dict):
    body = json.dumps(data).encode()
    req.send_response(status)
    req.send_header("Content-Type", "application/json")
    req.send_header("Content-Length", str(len(body)))
    req.send_header("Access-Control-Allow-Origin", "*")
    req.end_headers()
    req.wfile.write(body)


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_type = self.headers.get("Content-Type", "")
        content_length = int(self.headers.get("Content-Length", 0))

        if content_length > MAX_FILE_SIZE:
            _send_json(self, 413, {"detail": "File too large (max 50 MB)"})
            return

        if "multipart/form-data" not in content_type:
            _send_json(self, 400, {"detail": "Expected multipart/form-data"})
            return

        # Parse multipart upload
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": content_type,
                "CONTENT_LENGTH": str(content_length),
            },
        )

        file_item = form.get("file")
        if not file_item or not file_item.filename:
            _send_json(self, 400, {"detail": "No file uploaded (field name must be 'file')"})
            return

        filename = file_item.filename.lower()
        if not (filename.endswith(".xlsx") or filename.endswith(".xlsm")):
            _send_json(self, 400, {"detail": "Only .xlsx or .xlsm files are accepted"})
            return

        suffix = ".xlsm" if filename.endswith(".xlsm") else ".xlsx"
        tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        tmp_path = tmp.name
        try:
            tmp.write(file_item.file.read())
            tmp.close()
            result = _run_audit(tmp_path)
            _send_json(self, 200, result)
        except Exception as e:
            _send_json(self, 500, {"detail": f"Audit failed: {e}"})
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    def log_message(self, format, *args):
        pass
