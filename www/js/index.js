// 支持 Cordova 设备和浏览器环境
if (window.cordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    // 浏览器环境 - 确保DOM已加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDeviceReady, false);
    } else {
        // DOM已经加载完成，直接初始化
        onDeviceReady();
    }
}

// 喝水令列表（第N次打卡时，显示第N+1个令）
const drinkOrders = [
    { id: 1, text: "干杯！第一杯，为今天的健康开个好头！" },
    { id: 2, text: "第二杯，身体细胞正在欢呼！" },
    { id: 3, text: "三杯成林，皮肤开始水润润～" },
    { id: 4, text: "四季平安，第四杯送上健康！" },
    { id: 5, text: "五福临门，第五杯为健康祝福！" },
    { id: 6, text: "六六大顺，身体机能运转更流畅！" },
    { id: 7, text: "七星高照，精神状态持续上升！" },
    { id: 8, text: "八方来财（水），第八杯带来满满活力！" },
    { id: 9, text: "九九归一，身体逐渐适应补水节奏！" },
    { id: 10, text: "十全十美，第十杯，今日健康目标达成过半！" },
    { id: 11, text: "第十一杯，继续加油，身体在说谢谢！" },
    { id: 12, text: "十二生肖保护你，第十二杯为健康加持！" },
    { id: 13, text: "第十四杯？跳过第13杯，直接来个吉利数字！" },
    { id: 14, text: "十五月圆，第十五杯圆满！" },
    { id: 15, text: "第十六杯，超过15杯目标了，你是喝水达人！" },
    { id: 16, text: "第十七杯，水润万物！" },
    { id: 17, text: "第十八杯，好汉不提当年勇，喝水也要勇往直前！" },
    { id: 18, text: "第十九杯，九九归一，健康常伴！" },
    { id: 20, text: "第二十杯，20杯达成！你是超级喝水达人！" }
];

function onDeviceReady() {
    console.log('App ready -', window.cordova ? 'Cordova device' : 'Browser');
    initApp();
}

function initApp() {
    const trackerCircle = document.getElementById('trackerCircle');

    // 检查元素是否存在
    if (!trackerCircle) {
        console.error('trackerCircle element not found!');
        return;
    }

    console.log('trackerCircle found:', trackerCircle);

    // 加载今天的记录
    let records = getTodayRecords();
    console.log('Initial records:', records);

    // 初始化时检查是否超过20次
    if (records.length > 20) {
        console.log('🔄 Init: Records exceeded 20, clearing...');
        records = [];
        saveTodayRecords(records);
        resetWaterColor();
    }

    // 更新显示
    updateDisplay(records);
    updateWaterLevel(records.length);
    updateDrinkOrder(records.length);
    updateFloatEffect(records.length); // 更新漂浮效果

    // 绑定点击事件 - 使用 click 而不是 pointerdown（更广泛支持）
    trackerCircle.addEventListener('click', function(e) {
        console.log('Click event triggered');
        handleCheckIn(e);
    });

    // 添加触摸事件支持（移动端）
    trackerCircle.addEventListener('touchend', function(e) {
        console.log('Touchend event triggered');
        handleCheckIn(e);
    });

    console.log('Event listeners attached');
}

function getTodayRecords() {
    const today = getTodayDateString();
    const stored = localStorage.getItem('drinkRecords');
    if (!stored) return [];

    try {
        const allRecords = JSON.parse(stored);
        return allRecords[today] || [];
    } catch (e) {
        console.error('Error parsing records:', e);
        return [];
    }
}

function saveTodayRecords(records) {
    const today = getTodayDateString();
    const stored = localStorage.getItem('drinkRecords');
    let allRecords = {};

    try {
        allRecords = stored ? JSON.parse(stored) : {};
        allRecords[today] = records;
        localStorage.setItem('drinkRecords', JSON.stringify(allRecords));
        console.log('Records saved to localStorage:', allRecords);
    } catch (e) {
        console.error('Error saving records:', e);
    }
}

function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// 根据喝水次数更新漂浮效果
function updateFloatEffect(count) {
    const trackerCircle = document.getElementById('trackerCircle');
    const orderSection = document.getElementById('drinkOrder').closest('.order-section');

    if (!trackerCircle || !orderSection) {
        console.error('Float elements not found!');
        return;
    }

    // 移除旧的漂浮等级类
    trackerCircle.classList.remove('float-level-0', 'float-level-1', 'float-level-2', 'float-level-3', 'float-level-4');
    orderSection.classList.remove('float-level-0', 'float-level-1', 'float-level-2', 'float-level-3', 'float-level-4');

    // 根据喝水次数确定漂浮等级
    let floatLevel = 0;
    if (count <= 3) {
        floatLevel = 0; // 轻度漂浮
    } else if (count <= 7) {
        floatLevel = 1; // 中度漂浮
    } else if (count <= 12) {
        floatLevel = 2; // 明显漂浮
    } else if (count <= 17) {
        floatLevel = 3; // 强烈漂浮
    } else {
        floatLevel = 4; // 超强漂浮
    }

    // 应用新的漂浮等级类
    trackerCircle.classList.add(`float-level-${floatLevel}`);
    orderSection.classList.add(`float-level-${floatLevel}`);

    console.log('Float level updated:', floatLevel, `(${count} cups)`);
}

function updateDrinkOrder(count) {
    const drinkOrderEl = document.getElementById('drinkOrder');

    if (!drinkOrderEl) {
        console.error('Drink order element not found!');
        return;
    }

    // 当打卡次数为N时，显示第N+1个令
    const nextOrderIndex = count;
    let orderText = '';

    if (nextOrderIndex === 0) {
        orderText = '点击按钮开始第一杯 💧';
    } else if (nextOrderIndex < drinkOrders.length) {
        const order = drinkOrders[nextOrderIndex];
        orderText = order.text;
    } else {
        orderText = '🎉 恭喜！已完成今日所有喝水令！';
    }

    drinkOrderEl.innerHTML = orderText;
    console.log('Drink order updated:', orderText);
}

function updateWaterLevel(count) {
    const waterLevel = document.getElementById('waterLevel');
    const waterProgress = document.getElementById('waterProgress');

    if (!waterLevel || !waterProgress) {
        console.error('Water elements not found!', { waterLevel, waterProgress });
        return;
    }

    // 每杯水位 = 1/15 ≈ 6.67%
    const percentage = Math.min((count / 15) * 100, 100);

    // 更新水位高度
    waterLevel.style.height = `${percentage}%`;

    // 更新进度显示
    waterProgress.textContent = count;

    console.log('Water level updated:', percentage.toFixed(1) + '%', count + '/15 cups');

    // 达到目标时的特效
    if (count >= 15) {
        celebrateGoal();
    }
}

function resetWaterColor() {
    const waterLevel = document.getElementById('waterLevel');
    if (waterLevel) {
        waterLevel.style.background = 'linear-gradient(180deg, rgba(0, 198, 251, 0.4) 0%, rgba(0, 91, 234, 0.5) 100%)';
        console.log('Water color reset to default');
    }
}

function celebrateGoal() {
    console.log('🎉 Goal reached! 15 cups!');
    // 可以添加庆祝动画或提示
    const waterLevel = document.getElementById('waterLevel');
    if (waterLevel) {
        waterLevel.style.background = 'linear-gradient(180deg, rgba(0, 255, 136, 0.5) 0%, rgba(0, 200, 83, 0.6) 100%)';
    }
}

let lastCheckInTime = 0;

function handleCheckIn(e) {
    // 防止重复触发（500ms内）
    const now = Date.now();
    if (now - lastCheckInTime < 500) {
        console.log('Debounced: too soon');
        return;
    }
    lastCheckInTime = now;

    e.preventDefault();
    e.stopPropagation();

    console.log('Check-in triggered at:', new Date().toISOString());

    const records = getTodayRecords();
    console.log('Current records count:', records.length);

    const newRecord = {
        time: now,
        formatted: formatTime(new Date(now)),
        index: records.length + 1
    };

    records.unshift(newRecord); // 新记录添加到最前面

    // 检查是否超过20次，超过则清零
    if (records.length > 20) {
        console.log('🔄 Reset: Records exceeded 20, clearing...');
        records.length = 0; // 清空记录
        resetWaterColor(); // 重置水色
    }

    saveTodayRecords(records);

    updateDisplay(records);
    updateWaterLevel(records.length);
    updateDrinkOrder(records.length);
    updateFloatEffect(records.length); // 更新漂浮效果

    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    console.log('Record saved:', newRecord);
    console.log('Total records today:', records.length);
}

function updateDisplay(records) {
    const todayCountEl = document.getElementById('todayCount');
    const recordsList = document.getElementById('recordsList');

    // 检查元素是否存在
    if (!todayCountEl || !recordsList) {
        console.error('Display elements not found!', { todayCountEl, recordsList });
        return;
    }

    // 更新计数
    todayCountEl.textContent = records.length;
    console.log('Updated count to:', records.length);

    // 更新记录列表
    if (records.length === 0) {
        recordsList.innerHTML = '<li class="empty-message">暂无记录</li>';
    } else {
        recordsList.innerHTML = records.map(record => `
            <li>
                <span class="record-time">${record.formatted}</span>
                <span class="record-index">${record.index}</span>
            </li>
        `).join('');
    }
    console.log('Updated display with', records.length, 'records');
}

// 防止双击缩放
document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// 防止长按选择
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
