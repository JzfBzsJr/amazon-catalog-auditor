import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_root / "amazon-catalog-cli-main"))

from flask import Flask, jsonify
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


@app.route("/", methods=["GET"])
@app.route("/api/queries", methods=["GET"])
def queries():
    engine = QueryEngine(None)
    for cls in ALL_QUERY_CLASSES:
        engine.register_query(cls())
    return jsonify(engine.list_queries())
