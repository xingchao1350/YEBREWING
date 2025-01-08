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
    const cnFont = document.getElementById('fontSelect').value;
    const enFont = document.getElementById('enFontSelect').value;

    if (!previewItem) {
        previewItem = { number, name, nameEn, price, abv, volume };
    } else {
        Object.assign(previewItem, { number, name, nameEn, price, abv, volume });
    }

    updatePreview(true);
    
    // 更新字体
    const preview = document.getElementById('menu-preview');
    preview.style.setProperty('--cn-font', cnFont);
    preview.style.setProperty('--en-font', enFont);
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

    if (menuItems.length >= 20) {
        alert('最多只能添加20个项目');
        return;
    }

    menuItems.push({ number, name, nameEn, price, abv, volume });
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
    updatePreview();
}

function updatePreview(showPreview = false) {
    const container = document.getElementById('menu-items');
    container.innerHTML = '';

    menuItems.forEach((item, index) => {
        const itemElement = createMenuItem(item);
        itemElement.addEventListener('click', () => selectItem(index));
        if (index === selectedItemIndex) {
            itemElement.classList.add('selected');
        }
        container.appendChild(itemElement);
    });

    if (showPreview && previewItem && (previewItem.number || previewItem.name || previewItem.nameEn || previewItem.price || previewItem.abv || previewItem.volume)) {
        const previewDiv = createMenuItem(previewItem);
        previewDiv.classList.add('preview-item');
        container.appendChild(previewDiv);
    }
}

function createMenuItem(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <div class="number">${item.number}</div>
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

function selectItem(index) {
    selectedItemIndex = index;
    const item = menuItems[index];
    document.getElementById('number').value = item.number;
    document.getElementById('name').value = item.name;
    document.getElementById('nameEn').value = item.nameEn;
    document.getElementById('price').value = item.price;
    document.getElementById('abv').value = item.abv;
    document.getElementById('volume').value = item.volume;

    document.getElementById('addButton').disabled = true;
    document.getElementById('updateButton').disabled = false;
    document.getElementById('cancelButton').disabled = false;

    updatePreview();
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

    menuItems[selectedItemIndex] = { number, name, nameEn, price, abv, volume };
    cancelEdit();
}

function cancelEdit() {
    selectedItemIndex = -1;
    clearInputs();
    document.getElementById('addButton').disabled = false;
    document.getElementById('updateButton').disabled = true;
    document.getElementById('cancelButton').disabled = true;
    updatePreview();
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
            menuItems = data.items;
            
            // 恢复样式设置
            if (data.styles) {
                document.getElementById('titleCn').value = data.styles.titleCn;
                document.getElementById('titleEn').value = data.styles.titleEn;
                document.getElementById('titleSize').value = data.styles.titleSize;
                document.getElementById('contentSize').value = data.styles.contentSize;
                document.getElementById('mainColor').value = data.styles.mainColor;
                document.getElementById('subColor').value = data.styles.subColor;
                document.getElementById('fontSelect').value = data.styles.cnFont;
                document.getElementById('enFontSelect').value = data.styles.enFont;
                
                updateTitle();
                updateFontSizes();
                updateColors();
                
                const preview = document.getElementById('menu-preview');
                preview.style.setProperty('--cn-font', data.styles.cnFont);
                preview.style.setProperty('--en-font', data.styles.enFont);
            }
            
            // 恢复背景图片
            if (data.background) {
                if (data.background.startsWith('data:')) {
                    currentBgImage = data.background;
                    document.getElementById('bgImage').src = currentBgImage;
                } else {
                    currentBgImage = null;
                    document.getElementById('bgImage').src = data.background;
                }
            }
            
            updatePreview();
        } catch (error) {
            alert('文件格式错误');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function generateImage() {
    const preview = document.getElementById('menu-preview');
    html2canvas(preview, {
        backgroundColor: '#000000',
        scale: 1,
        width: 1080,
        height: 1920
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'beer-menu.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function updateFontSizes() {
    const titleSize = document.getElementById('titleSize').value;
    const contentSize = document.getElementById('contentSize').value;
    
    document.documentElement.style.setProperty('--title-size', `${titleSize}px`);
    document.documentElement.style.setProperty('--content-size', `${contentSize}px`);
}

function updateColors() {
    const mainColor = document.getElementById('mainColor').value;
    const subColor = document.getElementById('subColor').value;
    
    document.documentElement.style.setProperty('--main-color', mainColor);
    document.documentElement.style.setProperty('--sub-color', subColor);
}

function updateTitle() {
    const titleCn = document.getElementById('titleCn').value;
    const titleEn = document.getElementById('titleEn').value;
    
    document.getElementById('mainTitle').textContent = titleCn;
    document.getElementById('subTitle').textContent = titleEn;
}

// 移动端标签切换
document.addEventListener('DOMContentLoaded', function() {
    updateFontSizes();
    updateColors();
    updateTitle();

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
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // 处理移动端预览缩放
    function updatePreviewScale() {
        const preview = document.getElementById('menu-preview');
        if (window.innerWidth <= 768) {
            const container = document.querySelector('.preview-section');
            const containerWidth = container.clientWidth - 20; // 减去padding
            const scale = containerWidth / 1080; // 1080是原始宽度
            preview.style.transform = `scale(${scale})`;
        } else {
            preview.style.transform = 'none';
        }
    }

    // 监听窗口大小变化
    window.addEventListener('resize', updatePreviewScale);
    // 初始化缩放
    updatePreviewScale();
});
