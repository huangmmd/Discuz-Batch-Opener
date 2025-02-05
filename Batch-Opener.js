// ==UserScript==
// @name         论坛帖子批量选择小助手
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在任何网页中多选帖子并批量打开
// @author       黄萌萌可爱多
// @match        *://*/*
// @grant        GM_addValueChangeListener
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 存储选中的帖子链接
    let selectedPosts = [];
    // 存储第一次选中的帖子索引
    let firstSelectedIndex = -1;
    // 存储最后一次选中的帖子索引
    let lastSelectedIndex = -1;

    // 获取所有可点击的链接元素
    const clickableLinks = Array.from(document.querySelectorAll('a[href]')).filter(link => {
        const text = link.textContent.trim();

        // 检查是否为时间格式（如 YYYY-MM-DD 或 HH:MM）
        const isTimeFormat = /^\d{4}-\d{2}-\d{2}$|^\d{2}:\d{2}$/.test(text);
        // 检查是否为纯数字、纯英文或数字加英文（可以包含符号）
        const isPureNumericOrAlphanumeric = /^[a-zA-Z0-9\s\p{P}]*$/.test(text) && !/[\u4e00-\u9fa5\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf]/u.test(text);
        // 检查文本长度是否大于8个字符
        const isLongEnough = text.length > 8;
        // 检查是否包含日文字符
        const containsJapanese = /[\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf]/u.test(text);
        // 返回筛选条件
        return isLongEnough && !isPureNumericOrAlphanumeric && !isTimeFormat || containsJapanese;
    });

    // 添加点击事件监听
    clickableLinks.forEach((link, index) => {
        link.addEventListener('click', function(event) {
            const postLink = this.href; // 获取链接

            // 检查是否按下了 Ctrl 键
            if (event.ctrlKey) {
                event.preventDefault(); // 阻止默认的链接跳转行为
                if (!selectedPosts.includes(postLink)) {
                    selectedPosts.push(postLink);
                    this.classList.add('selected'); // 添加选中样式
                } else {
                    selectedPosts = selectedPosts.filter(link => link !== postLink);
                    this.classList.remove('selected');
                }
            }
            // 检查是否按下了 Shift 键
            else if (event.shiftKey) {
                event.preventDefault(); // 阻止默认的链接跳转行为
                if (firstSelectedIndex === -1) {
                    // 如果是第一次按下 Shift 键，记录第一个选中的链接索引
                    firstSelectedIndex = index;
                }
                // 更新最后一个选中的链接索引
                lastSelectedIndex = index;

                // 确定选择范围
                const startIndex = Math.min(firstSelectedIndex, lastSelectedIndex);
                const endIndex = Math.max(firstSelectedIndex, lastSelectedIndex);

                // 清空之前的选中状态
                selectedPosts = [];
                clickableLinks.forEach(l => l.classList.remove('selected'));

                // 选择范围内的所有链接
                for (let i = startIndex; i <= endIndex; i++) {
                    selectedPosts.push(clickableLinks[i].href);
                    clickableLinks[i].classList.add('selected');
                }
            }
            // 如果已经有选中的链接，并且再次点击任意一条被选择的链接
            else if (selectedPosts.includes(postLink)) {
                event.preventDefault(); // 阻止默认的链接跳转行为
                selectedPosts.forEach(link => {
                    window.open(link, '_blank', 'noopener,noreferrer'); // 确保打开新标签页但不切换焦点且静默打开
                });
                selectedPosts = []; // 清空选中列表
                clickableLinks.forEach(link => link.classList.remove('selected'));
                firstSelectedIndex = -1; // 重置第一次选中的链接索引
                lastSelectedIndex = -1; // 重置最后一次选中的链接索引
            }
        });
    });

    // 监听点击页面非链接位置的事件
    document.addEventListener('click', function(event) {
        // 检查点击的是否是非链接位置
        if (!event.target.closest('a[href]')) {
            // 清空选中列表
            selectedPosts = [];
            clickableLinks.forEach(link => link.classList.remove('selected'));
            firstSelectedIndex = -1; // 重置第一次选中的链接索引
            lastSelectedIndex = -1; // 重置最后一次选中的链接索引
        }
    });

    // 创建批量打开按钮
    const openButton = document.createElement('button');
    openButton.textContent = '批量打开选中的链接';
    openButton.style.position = 'fixed';
    openButton.style.top = '10px';
    openButton.style.right = '10px';
    openButton.style.zIndex = '9999';
    openButton.style.padding = '10px 20px';
    openButton.style.backgroundColor = '#4CAF50';
    openButton.style.color = 'white';
    openButton.style.border = 'none';
    openButton.style.borderRadius = '5px';
    openButton.style.cursor = 'pointer';
    openButton.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';

    // 添加按钮点击事件
    openButton.addEventListener('click', function() {
        selectedPosts.forEach(link => {
            window.open(link, '_blank', 'noopener,noreferrer'); // 确保打开新标签页但不切换焦点且静默打开
        });
        selectedPosts = []; // 清空选中列表
        clickableLinks.forEach(link => link.classList.remove('selected'));
        firstSelectedIndex = -1; // 重置第一次选中的链接索引
        lastSelectedIndex = -1; // 重置最后一次选中的链接索引
        window.focus(); // 确保当前窗口保持焦点
    });

    // 创建清除选择按钮
    const clearButton = document.createElement('button');
    clearButton.textContent = '清除选择';
    clearButton.style.position = 'fixed';
    clearButton.style.top = '50px';
    clearButton.style.right = '10px';
    clearButton.style.zIndex = '9999';
    clearButton.style.padding = '10px 20px';
    clearButton.style.backgroundColor = '#f44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '5px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';

    // 添加清除选择按钮点击事件
    clearButton.addEventListener('click', function() {
        selectedPosts = []; // 清空选中列表
        clickableLinks.forEach(link => link.classList.remove('selected'));
        firstSelectedIndex = -1; // 重置第一次选中的链接索引
        lastSelectedIndex = -1; // 重置最后一次选中的链接索引
    });

    // 创建使用说明按钮
    const helpButton = document.createElement('button');
    helpButton.textContent = '使用说明';
    helpButton.style.position = 'fixed';
    helpButton.style.top = '90px';
    helpButton.style.right = '10px';
    helpButton.style.zIndex = '9999';
    helpButton.style.padding = '10px 20px';
    helpButton.style.backgroundColor = '#2196F3';
    helpButton.style.color = 'white';
    helpButton.style.border = 'none';
    helpButton.style.borderRadius = '5px';
    helpButton.style.cursor = 'pointer';
    helpButton.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';

    // 添加使用说明按钮点击事件
    helpButton.addEventListener('click', function() {
        // 创建悬浮框
        const helpBox = document.createElement('div');
        helpBox.style.position = 'fixed';
        helpBox.style.top = '100px'; // 调整悬浮框的顶部位置
        helpBox.style.right = '60px'; // 调整悬浮框的右侧位置，避免被关闭按钮遮挡
        helpBox.style.width = '300px'; // 修改悬浮框宽度
        helpBox.style.height = '300px'; // 修改悬浮框高度
        helpBox.style.backgroundColor = 'white';
        helpBox.style.border = '1px solid #ccc';
        helpBox.style.zIndex = '10000';
        helpBox.style.padding = '20px';
        helpBox.style.boxShadow = '5px 5px 10px rgba(0, 0, 0, 0.3)';
        helpBox.style.borderRadius = '5px';
        helpBox.style.fontFamily = 'Arial, sans-serif';

        // 添加使用说明内容
        const helpContent = document.createElement('ol'); // 使用 <ol> 标签来有序排列
        helpContent.style.margin = '0 0 10px 0';
        helpContent.style.paddingLeft = '20px';

        // 添加使用说明的各个点
        const points = [
            '第一次在某个网页使用批量打开功能时，需要手动关闭网页的阻止弹窗。',
            '按住 Ctrl 键并点击多个链接以多选链接。',
            '按住 Shift 键并点击链接以选择范围内的链接。',
            '（快捷）当选择有链接时，再次点击任意一条链接即可全部打开。点击空白处即可取消选择全部链接。',
            '链接选择的逻辑参照 Windows 文件管理器。'
        ];

        points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            li.style.marginBottom = '10px'; // 增加间距
            helpContent.appendChild(li);
        });

        // 添加作者信息和版本号
        const authorInfo = document.createElement('p');
        authorInfo.textContent = '作者: 黄萌萌可爱多';
        authorInfo.style.marginBottom = '10px';
        helpBox.appendChild(authorInfo);

        const versionInfo = document.createElement('p');
        versionInfo.textContent = '版本: 1.0'; // 修改版本号
        versionInfo.style.marginBottom = '10px';
        helpBox.appendChild(versionInfo);

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(helpBox);
        });

        // 将内容和关闭按钮添加到悬浮框
        helpBox.appendChild(helpContent);
        helpBox.appendChild(closeButton);

        // 将悬浮框添加到页面
        document.body.appendChild(helpBox);
    });

    // 将按钮添加到页面
    document.body.appendChild(openButton);
    document.body.appendChild(clearButton);
    document.body.appendChild(helpButton);

    // 添加选中样式
    const style = document.createElement('style');
    style.textContent = `
        a.selected {
            background-color: #87CEEB; // 修改选中颜色为天蓝色
        }
    `;
    document.head.appendChild(style);

    // 获取 hideButtons 的初始值并设置按钮的显示状态
    const hideButtons = GM_getValue('hideButtons', false);
    openButton.style.display = hideButtons ? 'none' : 'block';
    clearButton.style.display = hideButtons ? 'none' : 'block';
    helpButton.style.display = hideButtons ? 'none' : 'block';

    // 添加油猴设置菜单项
    GM_addValueChangeListener('hideButtons', (name, oldValue, newValue) => {
        openButton.style.display = newValue ? 'none' : 'block';
        clearButton.style.display = newValue ? 'none' : 'block';
        helpButton.style.display = newValue ? 'none' : 'block';
    });

    GM_registerMenuCommand('⚙️ 设置', () => {
        // 创建设置弹窗
        const settingsBox = document.createElement('div');
        settingsBox.style.position = 'fixed';
        settingsBox.style.top = '50%';
        settingsBox.style.left = '50%';
        settingsBox.style.transform = 'translate(-50%, -50%)';
        settingsBox.style.width = '300px';
        settingsBox.style.height = '150px';
        settingsBox.style.backgroundColor = 'white';
        settingsBox.style.border = '1px solid #ccc';
        settingsBox.style.zIndex = '10000';
        settingsBox.style.padding = '20px';
        settingsBox.style.boxShadow = '5px 5px 10px rgba(0, 0, 0, 0.3)';
        settingsBox.style.borderRadius = '5px';
        settingsBox.style.fontFamily = 'Arial, sans-serif';

        // 添加设置内容
        const settingsContent = document.createElement('div');
        settingsContent.style.margin = '0 0 10px 0';

        // 添加“隐藏悬浮按钮”文本和开关
        const hideButtonsLabel = document.createElement('label');
        hideButtonsLabel.textContent = '隐藏悬浮按钮';
        hideButtonsLabel.style.marginRight = '10px';

        const hideButtonsSwitch = document.createElement('input');
        hideButtonsSwitch.type = 'checkbox';
        hideButtonsSwitch.checked = GM_getValue('hideButtons', false);
        hideButtonsSwitch.addEventListener('change', () => {
            GM_setValue('hideButtons', hideButtonsSwitch.checked);
        });

        settingsContent.appendChild(hideButtonsLabel);
        settingsContent.appendChild(hideButtonsSwitch);

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(settingsBox);
        });

        // 将内容和关闭按钮添加到设置弹窗
        settingsBox.appendChild(settingsContent);
        settingsBox.appendChild(closeButton);

        // 将设置弹窗添加到页面
        document.body.appendChild(settingsBox);
    });

})();