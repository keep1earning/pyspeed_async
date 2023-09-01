from sanic import Sanic, response
from sanic.log import logger
from sanic_cors import CORS
from sanic.response import file
import time
import os
import sys
import asyncio

app = Sanic("pyspeed_async")
app.config.TOUCHUP = False
CORS(app, resources={r"/speedtest": {"origins": "*"}})

if getattr(sys, 'frozen', False):
    template_folder = sys._MEIPASS
else:
    template_folder = os.path.dirname(os.path.abspath(__file__))

static_folder = os.path.join(template_folder, 'static')
app.static('/static', static_folder)

@app.route("/")
async def home(request):
    logger.info("Home page accessed.")
    index_path = os.path.join(template_folder, 'templates', 'index.html')
    try:
        return await file(index_path)
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        return response.text("File not found", status=404)
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return response.text("An error occurred", status=500)

@app.route("/speedtest", methods=["GET"])
async def speedtest(request):
    size = int(request.args.get("size", 50000000))
    data = b"1" * size
    headers = {"Content-Type": "application/octet-stream"}
    logger.info(f"Speedtest initiated. Sending data of size {size}.")
    return response.raw(data, headers=headers)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, single_process=True)
