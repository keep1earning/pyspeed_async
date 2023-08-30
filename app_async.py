# 引入Sanic框架和相关的模块
from sanic import Sanic, response
from sanic.log import logger
from sanic_cors import CORS
from sanic.response import file
import time
import os
import sys

# 初始化Sanic应用
app = Sanic("pyspeed_async")
app.config.TOUCHUP = False

# 为速度测试API添加跨域资源共享（CORS）配置
CORS(app, resources={r"/speedtest": {"origins": "*"}})

# 如果应用被打包
if getattr(sys, 'frozen', False):
    template_folder = sys._MEIPASS
else:
    template_folder = os.path.dirname(os.path.abspath(__file__))

# 设置静态文件路径
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

# 定义速度测试路由
@app.route("/speedtest", methods=["GET"])
async def speedtest(request):
    # 获取请求中的数据大小，默认为200,000,000字节
    # Get the data size from the request, default to 200,000,000 bytes
    size = int(request.args.get("size", 200000000))

    # 记录数据生成开始时间
    # Record the start time for data generation
    start_time = time.time()

    # 生成指定大小的二进制数据
    # Generate binary data of the specified size
    data = b"1" * size

    # 计算数据生成所需的时间
    # Calculate the time taken to generate the data
    elapsed_time = time.time() - start_time

    # 记录速度测试的日志
    # Log the speed test
    logger.info(f"Speedtest initiated. Data size: {size} bytes, Time taken to generate data: {elapsed_time:.2f} seconds.")

    # 设置响应头
    # Set response headers
    headers = {
        "Content-Type": "application/octet-stream",
        "Content-Length": str(size),
        "X-Elapsed-Time": str(elapsed_time)
    }

    # 返回生成的二进制数据
    # Return the generated binary data
    return response.raw(data, headers=headers)

# 主函数入口
# Main function entry point
if __name__ == "__main__":
    # 在0.0.0.0:5000上运行应用
    # Run the app on 0.0.0.0:5000
    app.run(host="0.0.0.0", port=5000, debug=False, single_process=True)
