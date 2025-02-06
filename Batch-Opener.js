// ==UserScript==
// @name         论坛帖子批量选择小助手
// @namespace    http://tampermonkey.net/
// @version      1.0T
// @description  在任何网页中多选帖子并批量打开
// @author       黄萌萌可爱多
// @match        *://*/*
// @license           MIT
// @grant        GM_addValueChangeListener
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @downloadURL https://update.greasyfork.org/scripts/525999/%E8%AE%BA%E5%9D%9B%E5%B8%96%E5%AD%90%E6%89%B9%E9%87%8F%E9%80%89%E6%8B%A9%E5%B0%8F%E5%8A%A9%E6%89%8B.user.js
// @updateURL https://update.greasyfork.org/scripts/525999/%E8%AE%BA%E5%9D%9B%E5%B8%96%E5%AD%90%E6%89%B9%E9%87%8F%E9%80%89%E6%8B%A9%E5%B0%8F%E5%8A%A9%E6%89%8B.meta.js
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

    // 将按钮添加到页面
    document.body.appendChild(openButton);
    document.body.appendChild(clearButton);

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

    // 添加油猴设置菜单项
    GM_addValueChangeListener('hideButtons', (name, oldValue, newValue) => {
        openButton.style.display = newValue ? 'none' : 'block';
        clearButton.style.display = newValue ? 'none' : 'block';
    });

    GM_registerMenuCommand('⚙️ 设置', () => {
        // 创建设置弹窗
        const settingsBox = document.createElement('div');
        settingsBox.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 400px; background-color: #ffffff; border: 1px solid #ddd; z-index: 10000; padding: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 12px; font-family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif';">
                <div style="margin: 0 0 20px 0;">
                    <label style="margin-right: 10px; display: flex; align-items: center; font-size: 18px;">
                        <input type="checkbox" id="hideButtonsCheckbox" style="margin-right: 10px;" ${GM_getValue('hideButtons', false) ? 'checked' : ''}>
                        <span style="margin-left: 10px;">隐藏悬浮按钮</span>
                    </label>
                </div>
                <ol style="margin: 0 0 20px 0; padding-left: 20px; list-style-type: decimal;">
                    <li style="margin-bottom: 10px;">第一次在某个网页使用批量打开功能时，需要手动关闭网页的阻止弹窗。</li>
                    <li style="margin-bottom: 10px;">按住 Ctrl 键并点击多个链接以多选链接。</li>
                    <li style="margin-bottom: 10px;">按住 Shift 键并点击链接以选择范围内的链接。</li>
                    <li style="margin-bottom: 10px;">当选择有链接时，再次点击任意一条链接即可全部打开。点击空白处即可取消选择全部链接。</li>
                    <li style="margin-bottom: 10px;">链接选择的逻辑参照 Windows 文件管理器。</li>
                </ol>
                <p style="margin-bottom: 10px; color: #555;">作者: 黄萌萌可爱多</p>
                <p style="margin-bottom: 10px; color: #555;">版本: 1.0</p>
                <button style="position: absolute; top: 10px; right: 10px; padding: 8px 16px; background-color: #f44336; color: white; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);" onclick="document.body.removeChild(this.parentElement.parentElement)">关闭</button>
            </div>
        `;

        // 添加事件监听器
        const hideButtonsCheckbox = settingsBox.querySelector('#hideButtonsCheckbox');
        hideButtonsCheckbox.addEventListener('change', () => {
            GM_setValue('hideButtons', hideButtonsCheckbox.checked);
            openButton.style.display = hideButtonsCheckbox.checked ? 'none' : 'block';
            clearButton.style.display = hideButtonsCheckbox.checked ? 'none' : 'block';
        });

        // 将设置弹窗添加到页面
        document.body.appendChild(settingsBox);
    });

})();
