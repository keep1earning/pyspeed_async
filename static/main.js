document.addEventListener("DOMContentLoaded", function () {
    const speedText = document.getElementById("speed-text");
    const startSingleBtn = document.getElementById("start-single");
    const startMultiBtn = document.getElementById("start-multi");
    const speedChartCanvas = document.getElementById("speedChart");

    const apiUrl = `${window.location.origin}/speedtest`;
    let startTime = 0;
    let totalDataReceived = 0;
    let speedChart = null;
    let testEndTime = 0;
    let accumulatedSpeeds = 0;
    let speedUpdates = 0;

    const updateSpeed = (speed) => {
        speedText.textContent = `Speed: ${speed.toFixed(2)} MB/s`;
    };

    const updateChart = (speedData) => {
        const timestamp = new Date().toLocaleTimeString();
        speedChart.data.labels.push(timestamp);
        speedChart.data.datasets[0].data.push(speedData);
        if (speedChart.data.labels.length > 10) {
            speedChart.data.labels.shift();
            speedChart.data.datasets[0].data.shift();
        }
        speedChart.update();
    };

    const runSpeedTest = async (mode, threadCount = 1) => {
        if (speedChart) {
            speedChart.destroy();
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
            }
        });

        totalDataReceived = 0;
        accumulatedSpeeds = 0;
        speedUpdates = 0;
        const dataSize = 50000000;
        const params = new URLSearchParams({ mode, size: dataSize });
        startTime = performance.now();
        testEndTime = startTime + 15000;  // 15 seconds from now

        const intervalID = setInterval(() => {
            const elapsedSeconds = (performance.now() - startTime) / 1000;
            const currentSpeed = totalDataReceived / (1024 * 1024) / elapsedSeconds;
            updateSpeed(currentSpeed);
            updateChart(currentSpeed);
            accumulatedSpeeds += currentSpeed;
            speedUpdates++;
            totalDataReceived = 0;
        }, 1000);

        const fetchPromises = Array.from({ length: threadCount }, () => fetchAndMeasure(`${apiUrl}?${params}`));
        await Promise.all(fetchPromises);

        clearInterval(intervalID);

        const averageSpeed = accumulatedSpeeds / speedUpdates;
        updateSpeed(averageSpeed);
    };

    const fetchAndMeasure = async (url) => {
        while (performance.now() < testEndTime) {
            const response = await fetch(url);
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                totalDataReceived += value.length;
            }
        }
    };

    startSingleBtn.addEventListener("click", () => runSpeedTest("single"));
    startMultiBtn.addEventListener("click", () => runSpeedTest("multi", 4));
});
