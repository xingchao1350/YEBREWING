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
    const isDailyBeer = document.getElementById('isDailyBeer').checked;

    if (selectedItemIndex === -1) {  // 只在新增模式下显示预览
        if (number && name && nameEn && price && abv && volume) {
            previewItem = {
                number: formatNumber(parseInt(number)),
                name,
                nameEn,
                price,
                abv,
                volume,
                isDailyBeer
            };
        } else {
            previewItem = null;
        }
    }
    
    updatePreview();
}

function addRow() {
    const number = document.getElementById('number').value;
    const name = document.getElementById('name').value;
    const nameEn = document.getElementById('nameEn').value;
    const price = document.getElementById('price').value;
    const abv = document.getElementById('abv').value;
    const volume = document.getElementById('volume').value;
    const isDailyBeer = document.getElementById('isDailyBeer').checked;

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
            volume,
            isDailyBeer
        };
    } else {
        // 如果是新编号，添加新项
        if (menuItems.length >= 24) {
            alert('最多只能添加24个项目');
            return;
        }
        menuItems.push({ 
            number: formatNumber(parseInt(number)), 
            name, 
            nameEn, 
            price, 
            abv, 
            volume,
            isDailyBeer
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
    document.getElementById('isDailyBeer').checked = false;
    previewItem = null;
    selectedItemIndex = -1;
    updatePreview();
    updateButtons();
}

function selectItem(index) {
    selectedItemIndex = index;
    const item = menuItems[index];
    
    // 更新所有输入框的值
    document.getElementById('number').value = item.number;
    document.getElementById('name').value = item.name;
    document.getElementById('nameEn').value = item.nameEn;
    document.getElementById('price').value = item.price;
    document.getElementById('abv').value = item.abv;
    document.getElementById('volume').value = item.volume;
    document.getElementById('isDailyBeer').checked = item.isDailyBeer || false;
    
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
    const isDailyBeer = document.getElementById('isDailyBeer').checked;

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
        volume,
        isDailyBeer
    };

    updatePreview();
    clearInputs();
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

function updatePreview(showPreview = false) {
    const preview = document.getElementById('menu-preview');
    if (!preview) return;
    
    let menuContent = preview.querySelector('.menu-content');
    if (!menuContent) {
        menuContent = document.createElement('div');
        menuContent.className = 'menu-content';
        preview.appendChild(menuContent);
    }
    
    // 清空现有内容
    menuContent.innerHTML = '';
    
    // 添加标签行
    const labels = createMenuLabels();
    menuContent.appendChild(labels);

    // 添加分隔线
    const divider = document.createElement('div');
    divider.className = 'header-divider';
    menuContent.appendChild(divider);

    // 根据编号排序菜单项
    const sortedItems = [...menuItems].sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    });

    // 创建菜单项容器
    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.id = 'menu-items';
    menuItemsContainer.className = 'menu-items';
    menuContent.appendChild(menuItemsContainer);

    // 添加菜单项
    sortedItems.forEach((item, index) => {
        const menuItem = createMenuItem(item);
        menuItem.addEventListener('click', () => selectItem(menuItems.indexOf(item)));
        
        // 如果是选中的项目，添加选中样式
        if (menuItems.indexOf(item) === selectedItemIndex) {
            menuItem.classList.add('selected');
        }
        
        menuItemsContainer.appendChild(menuItem);
    });

    // 如果有预览项且不是在编辑状态，显示预览项
    if (previewItem && selectedItemIndex === -1) {
        const previewElement = createMenuItem(previewItem);
        previewElement.classList.add('preview');
        menuItemsContainer.appendChild(previewElement);
    }

    // 更新缩放
    updateScale();
}

function createMenuLabels() {
    const labels = document.createElement('div');
    labels.className = 'header-labels';
    labels.innerHTML = `
        <div class="right-labels">
            <div class="label-abv">ABV</div>
            <div class="label-ml">ml</div>
            <div class="label-rmb">RMB</div>
        </div>
    `;
    return labels;
}

function updateScale() {
    const preview = document.getElementById('menu-preview');
    const scale = preview.offsetWidth / 1080;
    preview.style.transform = `scale(${scale})`;
}

function saveMenuData() {
    const data = {
        items: menuItems,
        styles: {
            contentSize: document.getElementById('contentSize').value,
            enContentSize: document.getElementById('enContentSize').value,
            paramSize: document.getElementById('paramSize').value,
            mainColor: document.getElementById('mainColor').value,
            subColor: document.getElementById('subColor').value,
            cnFont: document.getElementById('fontSelect').value,
            enFont: document.getElementById('enFontSelect').value
        },
        background: currentBgImage || defaultBgImage
    };
    
    // 保存到本地存储
    localStorage.setItem('lastMenuData', JSON.stringify(data));
    
    // 保存为文件
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu.bm';
    link.click();
    URL.revokeObjectURL(url);
}

function loadMenuData() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = ''; // 清空之前的选择，确保能重复选择同一个文件
        fileInput.click();
    } else {
        console.error('找不到文件输入元素');
    }
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
                const contentSize = document.getElementById('contentSize');
                const enContentSize = document.getElementById('enContentSize');
                const paramSize = document.getElementById('paramSize');
                const mainColor = document.getElementById('mainColor');
                const subColor = document.getElementById('subColor');
                const fontSelect = document.getElementById('fontSelect');
                const enFontSelect = document.getElementById('enFontSelect');

                // 恢复样式
                if (contentSize) contentSize.value = data.styles.contentSize || '20';
                if (enContentSize) enContentSize.value = data.styles.enContentSize || '16';
                if (paramSize) paramSize.value = data.styles.paramSize || '18';
                if (mainColor) mainColor.value = data.styles.mainColor || '#ffffff';
                if (subColor) subColor.value = data.styles.subColor || '#d3cbcb';
                if (fontSelect) fontSelect.value = data.styles.cnFont || "'Microsoft YaHei'";
                if (enFontSelect) enFontSelect.value = data.styles.enFont || 'Arial';
                
                // 更新显示
                updateFontSizes(); // 更新字体大小
                updateColors();    // 更新颜色
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
    const loadingIndicator = document.getElementById('loading-indicator');
    
    try {
        loadingIndicator.style.display = 'block';
        
        // 保存原始状态
        const originalTransform = preview.style.transform;
        
        // 重置预览状态
        preview.style.transform = 'none';
        
        // 等待样式应用
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const options = {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: 1080,
            height: 1920,
            windowWidth: 1080,
            windowHeight: 1920
        };

        const canvas = await html2canvas(preview, options);
        
        // 恢复原始状态
        preview.style.transform = originalTransform;
        
        // 下载图片
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = '野鹅微醺菜单.png';
        link.href = image;
        link.click();
    } catch (error) {
        console.error('生成图片错误:', error);
        alert('生成图片时出现错误，请重试');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function updateFontSizes() {
    const contentSize = parseInt(document.getElementById('contentSize').value) || 20;
    const enContentSize = parseInt(document.getElementById('enContentSize').value) || 16;
    const paramSize = parseInt(document.getElementById('paramSize').value) || 18;
    
    // 更新中文和英文酒名字体大小以及参数列字体大小
    if (contentSize >= 12 && contentSize <= 48) {
        document.documentElement.style.setProperty('--content-size', `${contentSize}px`);
    }
    
    if (enContentSize >= 10 && enContentSize <= 36) {
        document.documentElement.style.setProperty('--en-content-size', `${enContentSize}px`);
    }
    
    if (paramSize >= 10 && paramSize <= 36) {
        document.documentElement.style.setProperty('--param-size', `${paramSize}px`);
    }
    
    // 保存字体大小设置
    localStorage.setItem('contentSize', contentSize);
    localStorage.setItem('enContentSize', enContentSize);
    localStorage.setItem('paramSize', paramSize);
}

function updateColors() {
    const mainColor = document.getElementById('mainColor').value;
    const subColor = document.getElementById('subColor').value;
    
    document.documentElement.style.setProperty('--main-color', mainColor);
    document.documentElement.style.setProperty('--sub-color', subColor);
}

// 更新编辑下拉框选项
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

// 根据序号选择项目
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

// 移动端标签切换
document.addEventListener('DOMContentLoaded', function() {
    // 初始化按钮状态
    updateButtons();
    
    // 初始化样式
    updateFontSizes();
    updateColors();
    
    // 初始化预览
    updatePreview();
    
    // 移动端标签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const inputSection = document.querySelector('.input-section');
    const previewSection = document.querySelector('.preview-section');

    function switchTab(tab) {
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        if (tab === 'input') {
            inputSection.classList.add('active');
            previewSection.classList.remove('active');
        } else {
            inputSection.classList.remove('active');
            previewSection.classList.add('active');
            setTimeout(updatePreviewScale, 100);
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // 初始化缩放
    updatePreviewScale();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
        requestAnimationFrame(updatePreviewScale);
    });
});

// 当选择编号时触发
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
    
    // 如果是酒花日用酒，添加daily-beer类
    if (item.isDailyBeer) {
        div.classList.add('daily-beer');
    }
    
    div.innerHTML = `
        <div class="name">
            ${item.name}
            <div class="english">${item.nameEn}</div>
        </div>
        <div class="abv">${item.abv}</div>
        <div class="volume">${item.volume}</div>
        <div class="price">${item.price}</div>
    `;
    return div;
}

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

// 更新预览缩放函数
function updatePreviewScale() {
    const preview = document.getElementById('menu-preview');
    const container = document.querySelector('.preview-section');
    
    if (!preview || !container) return;
    
    const containerWidth = container.clientWidth - 40; // 减去padding
    const scale = containerWidth / 1080;
    
    preview.style.transform = `scale(${scale})`;
    preview.style.transformOrigin = 'top center';
}

// 添加 updatePreview 函数
function updatePreview() {
    const menuItemsContainer = document.getElementById('menu-items');
    if (!menuItemsContainer) return;
    
    // 清空现有内容
    menuItemsContainer.innerHTML = '';
    
    // 根据编号排序菜单项
    const sortedItems = [...menuItems].sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    });

    // 添加菜单项
    sortedItems.forEach((item, index) => {
        const menuItem = createMenuItem(item);
        menuItem.addEventListener('click', () => selectItem(menuItems.indexOf(item)));
        
        // 如果是选中的项目，添加选中样式
        if (menuItems.indexOf(item) === selectedItemIndex) {
            menuItem.classList.add('selected');
        }
        
        menuItemsContainer.appendChild(menuItem);
    });

    // 如果有预览项且不是在编辑状态，显示预览项
    if (previewItem && selectedItemIndex === -1) {
        const previewElement = createMenuItem(previewItem);
        previewElement.classList.add('preview');
        menuItemsContainer.appendChild(previewElement);
    }
}

// 修改updateTitle函数
function updateTitle() {
    // 标题已被移除，此函数不再需要执行任何操作
}

// 添加加载上次菜单的函数
function loadLastMenu() {
    try {
        const lastData = localStorage.getItem('lastMenuData');
        if (!lastData) {
            alert('没有找到上次的菜单数据');
            return;
        }

        const data = JSON.parse(lastData);
        
        // 验证数据格式
        if (!data.items || !Array.isArray(data.items)) {
            throw new Error('无效的菜单数据格式');
        }
        
        // 加载数据
        menuItems = data.items;
        selectedItemIndex = -1;
        
        // 恢复样式设置
        if (data.styles) {
            const contentSize = document.getElementById('contentSize');
            const enContentSize = document.getElementById('enContentSize');
            const paramSize = document.getElementById('paramSize');
            const mainColor = document.getElementById('mainColor');
            const subColor = document.getElementById('subColor');
            const fontSelect = document.getElementById('fontSelect');
            const enFontSelect = document.getElementById('enFontSelect');

            if (contentSize) contentSize.value = data.styles.contentSize || '20';
            if (enContentSize) enContentSize.value = data.styles.enContentSize || '16';
            if (paramSize) paramSize.value = data.styles.paramSize || '18';
            if (mainColor) mainColor.value = data.styles.mainColor || '#ffffff';
            if (subColor) subColor.value = data.styles.subColor || '#d3cbcb';
            if (fontSelect) fontSelect.value = data.styles.cnFont || "'Microsoft YaHei'";
            if (enFontSelect) enFontSelect.value = data.styles.enFont || 'Arial';
            
            updateFontSizes();
            updateColors();
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
        
        clearInputs();
        updatePreview();
        alert('已加载上次的菜单数据');
    } catch (error) {
        alert('加载上次菜单失败：' + error.message);
        console.error('加载失败：', error);
    }
}
