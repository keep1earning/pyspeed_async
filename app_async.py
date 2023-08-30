# 引入Sanic框架和相关的模块
# Import the Sanic framework and related modules
from sanic import Sanic, response
from sanic.log import logger
from sanic_cors import CORS
from sanic.response import file
import time

# 初始化Sanic应用
# Initialize the Sanic app
app = Sanic("pyspeed_async")
app.config.TOUCHUP = False
# 设置静态文件路径，这样CSS和JS文件就可以被访问
# Configure the static file path so that CSS and JS files can be served
app.static('/static', './static')

# 为速度测试API添加跨域资源共享（CORS）配置
# Add Cross-Origin Resource Sharing (CORS) configuration for the speed test API
CORS(app, resources={r"/speedtest": {"origins": "*"}})

# 定义主页路由
# Define the home route
@app.route("/")
async def home(request):
    # 记录访问主页的日志
    # Log the access to the home page
    logger.info("Home page accessed.")
    try:
        # 尝试返回HTML文件
        # Try to return the HTML file
        return await file("templates/index.html")
    except FileNotFoundError as e:
        # 文件未找到时记录错误并返回404状态码
        # Log the error and return a 404 status code when the file is not found
        logger.error(f"File not found: {e}")
        return response.text("File not found", status=404)
    except Exception as e:
        # 发生其他错误时记录错误并返回500状态码
        # Log the error and return a 500 status code when other exceptions occur
        logger.error(f"An error occurred: {e}")
        return response.text("An error occurred", status=500)

# 定义速度测试路由
# Define the speed test route
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
