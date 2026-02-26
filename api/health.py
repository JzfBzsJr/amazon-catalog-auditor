from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})
