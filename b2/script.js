let menuItems = [];
let previewItem = null;
let selectedItemIndex = -1;
let defaultBgImage = 'bg.png';
let currentBgImage = null;

function handleBgImageSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentBgImage = e.target.result;
        document.getElementById('bgImage').src = currentBgImage;
    };
    reader.readAsDataURL(file);
}

function resetBgImage() {
    currentBgImage = null;
    document.getElementById('bgImage').src = defaultBgImage;
}

function updatePreviewRealtime() {
    const number = document.getElementById('number').value;
    const name = document.getElementById('name').value;
    const nameEn = document.getElementById('nameEn').value;
    const price = document.getElementById('price').value;
    const abv = document.getElementById('abv').value;
    const volume = document.getElementById('volume').value;

    previewItem = { number, name, nameEn, price, abv, volume };
    updatePreview();
}

function addRow() {
    const number = document.getElementById('number').value;
    const name = document.getElementById('name').value;
    const nameEn = document.getElementById('nameEn').value;
    const price = document.getElementById('price').value;
    const abv = document.getElementById('abv').value;
    const volume = document.getElementById('volume').value;

    if (!number || !name || !nameEn || !price || !abv || !volume) {
        alert('请填写所有字段');
        return;
    }

    // 检查编号是否已存在
    const existingIndex = menuItems.findIndex(item => item.number === formatNumber(parseInt(number)));
    if (existingIndex !== -1) {
        // 如果编号已存在，更新该项
        menuItems[existingIndex] = { 
            number: formatNumber(parseInt(number)), 
            name, 
            nameEn, 
            price, 
            abv, 
            volume 
        };
    } else {
        // 如果是新编号，添加新项
        if (menuItems.length >= 20) {
            alert('最多只能添加20个项目');
            return;
        }
        menuItems.push({ 
            number: formatNumber(parseInt(number)), 
            name, 
            nameEn, 
            price, 
            abv, 
            volume 
        });
    }

    updatePreview();
    clearInputs();
}

function clearInputs() {
    document.getElementById('number').value = '';
    document.getElementById('name').value = '';
    document.getElementById('nameEn').value = '';
    document.getElementById('price').value = '';
    document.getElementById('abv').value = '';
    document.getElementById('volume').value = '';
    previewItem = null;
    selectedItemIndex = -1;
    updatePreview();
    updateButtons();
}

function selectItem(index) {
    selectedItemIndex = index;
    const item = menuItems[index];
    
    document.getElementById('number').value = item.number;
    document.getElementById('name').value = item.name;
    document.getElementById('nameEn').value = item.nameEn;
    document.getElementById('price').value = item.price;
    document.getElementById('abv').value = item.abv;
    document.getElementById('volume').value = item.volume;
    
    updatePreview();
    updateButtons();
}

function updateSelectedItem() {
    if (selectedItemIndex === -1) return;
    
    const number = document.getElementById('number').value;
    const name = document.getElementById('name').value;
    const nameEn = document.getElementById('nameEn').value;
    const price = document.getElementById('price').value;
    const abv = document.getElementById('abv').value;
    const volume = document.getElementById('volume').value;

    if (!number || !name || !nameEn || !price || !abv || !volume) {
        alert('请填写所有字段');
        return;
    }

    // 检查新编号是否与其他项目冲突（排除当前项）
    const conflictIndex = menuItems.findIndex((item, index) => 
        index !== selectedItemIndex && item.number === formatNumber(parseInt(number))
    );
    
    if (conflictIndex !== -1) {
        alert('该编号已被使用');
        return;
    }

    menuItems[selectedItemIndex] = { 
        number: formatNumber(parseInt(number)), 
        name, 
        nameEn, 
        price, 
        abv, 
        volume 
    };
    cancelEdit();
}

function cancelEdit() {
    clearInputs();
    updateButtons();
}

function updateButtons() {
    const addButton = document.getElementById('addButton');
    const updateButton = document.getElementById('updateButton');
    const cancelButton = document.getElementById('cancelButton');
    
    if (selectedItemIndex === -1) {
        addButton.disabled = false;
        updateButton.disabled = true;
        cancelButton.disabled = true;
    } else {
        addButton.disabled = true;
        updateButton.disabled = false;
        cancelButton.disabled = false;
    }
}

function updatePreview() {
    const preview = document.getElementById('menu-preview');
    if (!preview) return;

    // 更新标题
    const mainTitle = document.getElementById('mainTitle');
    const subTitle = document.getElementById('subTitle');
    if (mainTitle) mainTitle.textContent = document.getElementById('titleCn').value || '野鹅微醺';
    if (subTitle) subTitle.textContent = document.getElementById('titleEn').value || 'YE BREWING';

    // 更新菜单项
    const menuItemsElement = document.getElementById('menu-items');
    if (!menuItemsElement) return;

    // 清空现有内容
    menuItemsElement.innerHTML = '';

    // 根据编号排序菜单项
    const sortedItems = [...menuItems].sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    });

    // 添加菜单项
    sortedItems.forEach((item, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        if (menuItems.indexOf(item) === selectedItemIndex) {
            menuItem.classList.add('selected');
        }
        
        // 编号
        const number = document.createElement('div');
        number.className = 'number';
        number.textContent = item.number;
        menuItem.appendChild(number);
        
        // 名称
        const nameContainer = document.createElement('div');
        nameContainer.className = 'name';
        
        const nameCn = document.createElement('div');
        nameCn.className = 'chinese';
        nameCn.textContent = item.name;
        nameContainer.appendChild(nameCn);
        
        const nameEn = document.createElement('div');
        nameEn.className = 'english';
        nameEn.textContent = item.nameEn;
        nameContainer.appendChild(nameEn);
        
        menuItem.appendChild(nameContainer);
        
        // 价格
        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = item.price;
        menuItem.appendChild(price);
        
        // ABV
        const abv = document.createElement('div');
        abv.className = 'abv';
        abv.textContent = item.abv;
        menuItem.appendChild(abv);
        
        // 容量
        const volume = document.createElement('div');
        volume.className = 'volume';
        volume.textContent = item.volume;
        menuItem.appendChild(volume);

        // 添加点击事件
        menuItem.addEventListener('click', () => selectItem(menuItems.indexOf(item)));
        
        menuItemsElement.appendChild(menuItem);
    });

    // 更新缩放
    updateScale();
}

function updateScale() {
    const preview = document.getElementById('menu-preview');
    if (!preview) return;

    const previewSection = preview.parentElement;
    if (!previewSection) return;

    // 获取容器宽度
    const containerWidth = previewSection.offsetWidth - 40; // 减去padding
    
    // 计算缩放比例
    const scale = containerWidth / 1080;
    
    // 应用缩放
    preview.style.transform = `scale(${scale})`;
    preview.style.transformOrigin = 'top center';
    
    // 更新容器高度以适应缩放后的内容
    const originalHeight = preview.offsetHeight;
    previewSection.style.height = (originalHeight * scale + 40) + 'px'; // 加上padding
}

function updateTitle() {
    const mainTitle = document.getElementById('mainTitle');
    const subTitle = document.getElementById('subTitle');
    
    if (mainTitle) mainTitle.textContent = document.getElementById('titleCn').value || '野鹅微醺';
    if (subTitle) subTitle.textContent = document.getElementById('titleEn').value || 'YE BREWING';
}

function updateFontSizes() {
    const preview = document.getElementById('menu-preview');
    if (!preview) return;

    const titleSize = document.getElementById('titleSize').value;
    const contentSize = document.getElementById('contentSize').value;

    preview.style.setProperty('--title-size', titleSize + 'px');
    preview.style.setProperty('--content-size', contentSize + 'px');
}

function updateColors() {
    const preview = document.getElementById('menu-preview');
    if (!preview) return;

    const mainColor = document.getElementById('mainColor').value;
    const subColor = document.getElementById('subColor').value;

    preview.style.setProperty('--main-color', mainColor);
    preview.style.setProperty('--sub-color', subColor);
}

function saveMenuData() {
    const data = {
        items: menuItems,
        styles: {
            titleCn: document.getElementById('titleCn').value,
            titleEn: document.getElementById('titleEn').value,
            titleSize: document.getElementById('titleSize').value,
            contentSize: document.getElementById('contentSize').value,
            mainColor: document.getElementById('mainColor').value,
            subColor: document.getElementById('subColor').value,
            cnFont: document.getElementById('fontSelect').value,
            enFont: document.getElementById('enFontSelect').value
        },
        background: currentBgImage || defaultBgImage
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu.bm';
    link.click();
    URL.revokeObjectURL(url);
}

function loadMenuData() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 验证文件格式
            if (!data.items || !Array.isArray(data.items)) {
                throw new Error('无效的菜单文件格式');
            }
            
            menuItems = data.items;
            selectedItemIndex = -1; // 重置选中状态
            
            // 恢复样式设置
            if (data.styles) {
                const titleCn = document.getElementById('titleCn');
                const titleEn = document.getElementById('titleEn');
                const titleSize = document.getElementById('titleSize');
                const contentSize = document.getElementById('contentSize');
                const mainColor = document.getElementById('mainColor');
                const subColor = document.getElementById('subColor');
                const fontSelect = document.getElementById('fontSelect');
                const enFontSelect = document.getElementById('enFontSelect');

                if (titleCn) titleCn.value = data.styles.titleCn || '野鹅微醺';
                if (titleEn) titleEn.value = data.styles.titleEn || 'YE BREWING';
                if (titleSize) titleSize.value = data.styles.titleSize || '36';
                if (contentSize) contentSize.value = data.styles.contentSize || '20';
                if (mainColor) mainColor.value = data.styles.mainColor || '#ffffff';
                if (subColor) subColor.value = data.styles.subColor || '#d3cbcb';
                if (fontSelect) fontSelect.value = data.styles.cnFont || "'Microsoft YaHei'";
                if (enFontSelect) enFontSelect.value = data.styles.enFont || 'Arial';
                
                updateTitle();
                updateFontSizes();
                updateColors();
                
                const preview = document.getElementById('menu-preview');
                if (preview) {
                    preview.style.setProperty('--cn-font', data.styles.cnFont || "'Microsoft YaHei'");
                    preview.style.setProperty('--en-font', data.styles.enFont || 'Arial');
                }
            }
            
            // 恢复背景图片
            if (data.background) {
                const bgImage = document.getElementById('bgImage');
                if (bgImage) {
                    if (data.background.startsWith('data:')) {
                        currentBgImage = data.background;
                        bgImage.src = currentBgImage;
                    } else {
                        currentBgImage = null;
                        bgImage.src = data.background;
                    }
                }
            }
            
            clearInputs(); // 清空输入框
            updatePreview(); // 更新预览
        } catch (error) {
            alert('加载文件失败：' + error.message);
            console.error('文件加载错误：', error);
        }
    };
    
    reader.onerror = function() {
        alert('读取文件时发生错误');
    };
    
    reader.readAsText(file);
    input.value = ''; // 清空input，允许重复选择同一个文件
}

async function generateImage() {
    const preview = document.getElementById('menu-preview');
    if (!preview) return;

    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1080px';
    tempContainer.style.visibility = 'hidden';
    document.body.appendChild(tempContainer);

    // 克隆预览内容
    const tempPreview = preview.cloneNode(true);
    tempPreview.style.transform = 'none';
    tempPreview.style.width = '1080px';
    tempPreview.style.height = 'auto';
    tempPreview.style.position = 'relative';
    tempContainer.appendChild(tempPreview);

    // 确保所有图片加载完成
    const bgImage = tempPreview.querySelector('.background-image');
    if (bgImage) {
        await new Promise((resolve) => {
            if (bgImage.complete) {
                resolve();
            } else {
                bgImage.onload = resolve;
            }
        });
    }

    try {
        // 计算实际高度
        const menuContent = tempPreview.querySelector('.menu-content');
        const computedHeight = menuContent ? menuContent.getBoundingClientRect().height + 80 : 1920;

        // 设置html2canvas选项
        const options = {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: 1080,
            height: computedHeight,
            scrollY: -window.scrollY,
            windowWidth: 1080,
            windowHeight: computedHeight,
            logging: false,
            onclone: function(clonedDoc) {
                const clonedPreview = clonedDoc.querySelector('#menu-preview');
                if (clonedPreview) {
                    clonedPreview.style.width = '1080px';
                    clonedPreview.style.height = computedHeight + 'px';
                    clonedPreview.style.transform = 'none';
                    
                    const content = clonedPreview.querySelector('.menu-content');
                    if (content) {
                        content.style.minHeight = computedHeight + 'px';
                    }
                }
            }
        };

        // 生成图片
        const canvas = await html2canvas(tempPreview, options);
        
        // 转换为图片并下载
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'beer-menu.png';
        link.href = image;
        link.click();
    } catch (error) {
        console.error('生成图片时出错:', error);
        alert('生成图片失败，请重试');
    } finally {
        // 清理临时元素
        document.body.removeChild(tempContainer);
    }
}

function updateEditSelect() {
    const select = document.getElementById('editItemSelect');
    // 保存当前选中的值
    const currentValue = select.value;
    
    // 清空选项
    select.innerHTML = '<option value="">新增行</option>';
    
    // 添加所有现有项目
    menuItems.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = item.number;
        option.textContent = `${item.number}. ${item.name}`;
        select.appendChild(option);
    });
    
    // 恢复之前的选择
    if (currentValue) {
        select.value = currentValue;
    }
}

function selectItemByNumber() {
    const select = document.getElementById('editItemSelect');
    const number = select.value;
    
    if (!number) {
        // 如果选择了"新增行"，清空输入框
        clearInputs();
        return;
    }
    
    // 查找对应的项目索引
    const index = menuItems.findIndex(item => item.number === number);
    if (index !== -1) {
        selectItem(index);
    }
}

function onNumberSelect() {
    const number = document.getElementById('number').value;
    
    if (!number) {
        clearInputs();
        return;
    }

    // 查找是否存在该编号的项目
    const existingIndex = menuItems.findIndex(item => item.number === formatNumber(parseInt(number)));
    if (existingIndex !== -1) {
        // 如果找到，选中该项目
        selectItem(existingIndex);
    } else {
        // 如果是新编号，清空其他输入框
        document.getElementById('name').value = '';
        document.getElementById('nameEn').value = '';
        document.getElementById('price').value = '';
        document.getElementById('abv').value = '';
        document.getElementById('volume').value = '';
        selectedItemIndex = -1;
        updateButtons();
        updatePreviewRealtime();
    }
}

function createMenuItem(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <div class="number">${formatNumber(parseInt(item.number))}</div>
        <div class="name">
            ${item.name}
            <div class="english">${item.nameEn}</div>
        </div>
        <div class="price">${item.price}</div>
        <div class="abv">${item.abv}</div>
        <div class="volume">${item.volume}</div>
    `;
    return div;
}

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

// 监听窗口大小变化
window.addEventListener('resize', function() {
    updateScale();
    
    // 在窗口大小改变时，如果从移动端变为桌面端，移除active类
    if (window.innerWidth > 768) {
        document.querySelector('.input-section').classList.remove('active');
        document.querySelector('.preview-section').classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动端标签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const inputSection = document.querySelector('.input-section');
    const previewSection = document.querySelector('.preview-section');

    function switchTab(tab) {
        // 更新按钮状态
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // 更新区域显示
        if (tab === 'input') {
            inputSection.classList.add('active');
            previewSection.classList.remove('active');
        } else {
            inputSection.classList.remove('active');
            previewSection.classList.add('active');
            // 切换到预览时更新缩放
            setTimeout(updateScale, 100);
        }
    }

    // 绑定标签切换事件
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // 初始化其他功能
    updateScale();
    updateTitle();
    updateFontSizes();
    updateColors();
    updatePreview();

    // 默认显示编辑面板
    if (window.innerWidth <= 768) {
        switchTab('input');
    }
});
