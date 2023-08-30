// 当文档加载完成后执行下面的函数
// Executes the function once the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // 获取页面元素
    // Get elements from the HTML page
    const speedText = document.getElementById("speed-text");
    const startSingleBtn = document.getElementById("start-single");
    const startMultiBtn = document.getElementById("start-multi");
    const speedChartCanvas = document.getElementById("speedChart"); // 获取 canvas 元素
    // Get the canvas element

    const apiUrl = `${window.location.origin}/speedtest`;
    let startTime = 0;
    let totalDataReceived = 0;
    let lastUpdateTimestamp = 0;
    let speedChart = null; // 声明一个变量来存储 Chart.js 实例
    // Declare a variable to store the Chart.js instance

    // 更新速度显示
    // Function to update speed display
    const updateSpeed = (speed) => {
        speedText.textContent = `Speed: ${speed.toFixed(2)} MB/s`;
    };

    // 更新图表
    // Function to update chart
    const updateChart = (speedData) => {
        const timestamp = new Date().toLocaleTimeString();

        // 添加一个新的数据点，并在标签超过一定限制时删除第一个
        // Push a new data point and remove the first one if the labels exceed a certain limit
        speedChart.data.labels.push(timestamp);
        speedChart.data.datasets[0].data.push(speedData);
        if (speedChart.data.labels.length > 10) {
            speedChart.data.labels.shift();
            speedChart.data.datasets[0].data.shift();
        }
        speedChart.update();
    };

    // 运行速度测试
    // Function to run speed test
    const runSpeedTest = async (mode, threadCount = 1) => {
        // 创建或重新创建 Chart.js 实例
        // Create or recreate the Chart.js instance
        if (speedChart) {
            speedChart.destroy(); // 如果已存在图表则销毁
            // Destroy the existing chart if it exists
        }
        speedChart = new Chart(speedChartCanvas.getContext("2d"), {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Speed (MB/s)",
                    data: [],
                    fill: false,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true }
                }
            }
        });

        totalDataReceived = 0;
        const dataSize = 200000000;
        const params = new URLSearchParams({ mode, size: dataSize });
        startTime = performance.now();
        lastUpdateTimestamp = 0;

        const fetchPromises = Array.from({ length: threadCount }, () => fetchAndMeasure(`${apiUrl}?${params}`));
        await Promise.all(fetchPromises);

        // 计算平均速度并更新图表
        // Calculate average speed and update the chart
        const elapsedSeconds = (performance.now() - startTime) / 1000;
        const speed = totalDataReceived / (1024 * 1024) / elapsedSeconds;
        updateSpeed(speed);
        updateChart(speed);
    };

    // 执行数据抓取和速度测量
    // Function to execute data fetch and measure the speed
    const fetchAndMeasure = async (url) => {
        const response = await fetch(url);
        const reader = response.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalDataReceived += value.length;

            const now = performance.now();
            if (now - lastUpdateTimestamp >= 1000) {
                const elapsedSeconds = (now - startTime) / 1000;
                const currentSpeed = totalDataReceived / (1024 * 1024) / elapsedSeconds;

                // 更新图表并重置数据
                // Update the chart and reset the data
                updateChart(currentSpeed);
                lastUpdateTimestamp = now;
                startTime = now;
                totalDataReceived = 0;
            }
        }
    };

    // 添加事件监听器以启动速度测试
    // Add event listeners to initiate speed tests
    startSingleBtn.addEventListener("click", () => runSpeedTest("single"));
    startMultiBtn.addEventListener("click", () => runSpeedTest("multi", 4));
});