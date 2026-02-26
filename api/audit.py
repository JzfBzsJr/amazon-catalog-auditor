import sys
import os
import json
import tempfile
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_root / "amazon-catalog-cli-main"))

from flask import Flask, request, jsonify
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

app = Flask(__name__)

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


def _register_all(engine):
    for cls in ALL_QUERY_CLASSES:
        engine.register_query(cls())


def _add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


# Handle both /api/audit (Vercel passes full path) and / (some runtimes strip prefix)
@app.route("/", methods=["POST", "OPTIONS"])
@app.route("/api/audit", methods=["POST", "OPTIONS"])
def audit():
    if request.method == "OPTIONS":
        return _add_cors(jsonify({}))

    if "file" not in request.files:
        return _add_cors(jsonify({"detail": "No file uploaded (field name must be 'file')"})), 400

    f = request.files["file"]
    fn = (f.filename or "").lower()

    if not (fn.endswith(".xlsx") or fn.endswith(".xlsm")):
        return _add_cors(jsonify({"detail": "Only .xlsx or .xlsm files are accepted"})), 400

    suffix = ".xlsm" if fn.endswith(".xlsm") else ".xlsx"
    tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
    tmp_path = tmp.name

    try:
        f.save(tmp)
        tmp.close()

        parser = CLRParser(tmp_path)
        engine = QueryEngine(parser)
        _register_all(engine)
        results = engine.execute_all()

        return _add_cors(jsonify(json.loads(format_json(results))))

    except Exception as e:
        return _add_cors(jsonify({"detail": f"Audit failed: {e}"})), 500

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
