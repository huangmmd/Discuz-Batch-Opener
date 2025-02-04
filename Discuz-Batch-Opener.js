// ==UserScript==
// @name         论坛多选帖子并批量打开工具
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在论坛中多选帖子并批量打开
// @author       黄萌萌可爱多
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 存储选中的帖子链接
    let selectedPosts = [];
    // 存储第一次选中的帖子索引
    let firstSelectedIndex = -1;
    // 存储最后一次选中的帖子索引
    let lastSelectedIndex = -1;

    // 获取所有帖子标题的元素，Discuz! 论坛的帖子标题通常在 <a> 标签中
    const postTitles = document.querySelectorAll('.s.xst, a[href]'); // 修改选择器以匹配 .s.xst 和 href 标签

    // 添加页面加载时的验证逻辑
    if (!document.querySelector('.xst')) {
        // 如果页面中没有找到 .xst 类名的元素，则认为不是 Discuz! 论坛页面
        console.log('This is not a Discuz! forum page.');
        return;
    }

    // 添加点击事件监听
    postTitles.forEach((title, index) => {
        title.addEventListener('click', function(event) {
            const postLink = this.href; // 获取帖子链接

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
                    // 如果是第一次按下 Shift 键，记录第一个选中的帖子索引
                    firstSelectedIndex = index;
                }
                // 更新最后一个选中的帖子索引
                lastSelectedIndex = index;

                // 确定选择范围
                const startIndex = Math.min(firstSelectedIndex, lastSelectedIndex);
                const endIndex = Math.max(firstSelectedIndex, lastSelectedIndex);

                // 清空之前的选中状态
                selectedPosts = [];
                postTitles.forEach(t => t.classList.remove('selected'));

                // 选择范围内的所有帖子
                for (let i = startIndex; i <= endIndex; i++) {
                    selectedPosts.push(postTitles[i].href);
                    postTitles[i].classList.add('selected');
                }
            }
            // 如果已经有选中的链接，并且再次点击任意一条被选择的链接
            else if (selectedPosts.includes(postLink)) {
                event.preventDefault(); // 阻止默认的链接跳转行为
                selectedPosts.forEach(link => {
                    window.open(link, '_blank', 'noopener,noreferrer'); // 确保打开新标签页但不切换焦点且静默打开
                });
                selectedPosts = []; // 清空选中列表
                postTitles.forEach(title => title.classList.remove('selected'));
                firstSelectedIndex = -1; // 重置第一次选中的帖子索引
                lastSelectedIndex = -1; // 重置最后一次选中的帖子索引
            }
        });
    });

    // 监听点击页面非链接位置的事件
    document.addEventListener('click', function(event) {
        // 检查点击的是否是非链接位置
        if (!event.target.closest('.xst')) {
            // 清空选中列表
            selectedPosts = [];
            postTitles.forEach(title => title.classList.remove('selected'));
            firstSelectedIndex = -1; // 重置第一次选中的帖子索引
            lastSelectedIndex = -1; // 重置最后一次选中的帖子索引
        }
    });

    // 创建批量打开按钮
    const openButton = document.createElement('button');
    openButton.textContent = '批量打开选中的帖子';
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
        postTitles.forEach(title => title.classList.remove('selected'));
        firstSelectedIndex = -1; // 重置第一次选中的帖子索引
        lastSelectedIndex = -1; // 重置最后一次选中的帖子索引
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
        postTitles.forEach(title => title.classList.remove('selected'));
        firstSelectedIndex = -1; // 重置第一次选中的帖子索引
        lastSelectedIndex = -1; // 重置最后一次选中的帖子索引
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
        helpBox.style.width = '300px';
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
            '第一次在某个论坛使用批量打开网页功能时，需要手动关闭网页的阻止弹窗。',
            '按住 Ctrl 键并点击多个帖子标题以多选帖子。',
            '按住 Shift 键并点击帖子标题以选择范围内的帖子。',
            '（快捷）当选择有链接时，再次点击任意一条链接即可全部打开。点击空白处即可取消选择全部链接帖子。',
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
        versionInfo.textContent = '版本: 1.0'; // 更新版本号
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
        .xst.selected {
            background-color: #87CEEB; // 修改选中颜色为天蓝色
        }
    `;
    document.head.appendChild(style);
})();