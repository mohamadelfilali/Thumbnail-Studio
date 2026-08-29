// متغيرات عامة
let canvas, ctx;
let backgroundImage = null;
let currentPreset = 'none';

// تهيئة الصفحة
window.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // الاستماع للتغييرات
    document.getElementById('imageQuality').addEventListener('input', function(e) {
        document.getElementById('qualityValue').textContent = e.target.value + '%';
    });
    
    document.getElementById('mainTextSize').addEventListener('input', function(e) {
        document.getElementById('mainTextSizeValue').textContent = e.target.value + 'px';
    });
    
    document.getElementById('secondaryTextSize').addEventListener('input', function(e) {
        document.getElementById('secondaryTextSizeValue').textContent = e.target.value + 'px';
    });
    
    document.getElementById('backgroundType').addEventListener('change', updateBackground);
    document.getElementById('mainTextStyle').addEventListener('change', updateStyleControls);
    
    // رسم أول مرة
    updateCanvas();
});

// تبديل العلامات
function switchTab(tabName) {
    // إخفاء جميع التبويبات
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // إزالة الحالة النشطة من الأزرار
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // عرض التبويب المختار
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// تحديث أبعاد لوحة الرسم
function updateCanvasDimensions() {
    const width = parseInt(document.getElementById('canvasWidth').value);
    const height = parseInt(document.getElementById('canvasHeight').value);
    
    // تحديث الإدخالات والمنزلقات
    document.getElementById('canvasWidth').value = width;
    document.getElementById('widthSlider').value = width;
    document.getElementById('canvasHeight').value = height;
    document.getElementById('heightSlider').value = height;
    
    // تحديث حجم Canvas
    canvas.width = width;
    canvas.height = height;
    
    updateCanvas();
}

// تطبيق قالب معياري
function applyPreset(width, height) {
    document.getElementById('canvasWidth').value = width;
    document.getElementById('widthSlider').value = width;
    document.getElementById('canvasHeight').value = height;
    document.getElementById('heightSlider').value = height;
    
    canvas.width = width;
    canvas.height = height;
    
    updateCanvas();
}

// تحديث الخلفية
function updateBackground() {
    const type = document.getElementById('backgroundType').value;
    
    // إخفاء جميع التحكمات
    document.getElementById('solidColorControls').style.display = 'none';
    document.getElementById('gradientControls').style.display = 'none';
    document.getElementById('imageControls').style.display = 'none';
    
    // عرض التحكم المناسب
    switch(type) {
        case 'color':
            document.getElementById('solidColorControls').style.display = 'block';
            break;
        case 'gradient':
            document.getElementById('gradientControls').style.display = 'block';
            break;
        case 'image':
            document.getElementById('imageControls').style.display = 'block';
            break;
    }
    
    updateCanvas();
}

// معالجة رفع صورة الخلفية
function handleBackgroundImage() {
    const file = document.getElementById('backgroundImage').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                backgroundImage = img;
                updateCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// تحميل صورة من رابط
function loadImageFromUrl() {
    const url = document.getElementById('imageUrl').value;
    if (url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            backgroundImage = img;
            updateCanvas();
        };
        img.onerror = function() {
            alert('فشل تحميل الصورة. تأكد من الرابط');
        };
        img.src = url;
    }
}

// تحديث تحكمات الأنماط
function updateStyleControls() {
    const style = document.getElementById('mainTextStyle').value;
    
    // إخفاء جميع التحكمات الإضافية
    document.getElementById('borderControls').style.display = 'none';
    document.getElementById('textBackgroundControls').style.display = 'none';
    
    // عرض التحكمات المناسبة
    if (style.includes('border') || style.includes('outline')) {
        document.getElementById('borderControls').style.display = 'block';
    }
    if (style.includes('background') || style.includes('glow')) {
        document.getElementById('textBackgroundControls').style.display = 'block';
    }
    
    updateCanvas();
}

// رسم الخلفية
function drawBackground() {
    const type = document.getElementById('backgroundType').value;
    
    switch(type) {
        case 'color':
            drawSolidBackground();
            break;
        case 'gradient':
            drawGradientBackground();
            break;
        case 'image':
            drawImageBackground();
            break;
    }
}

// رسم خلفية موحدة
function drawSolidBackground() {
    const color = document.getElementById('backgroundColor').value;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// رسم خلفية متدرجة
function drawGradientBackground() {
    const color1 = document.getElementById('gradientColor1').value;
    const color2 = document.getElementById('gradientColor2').value;
    const direction = document.getElementById('gradientDirection').value;
    
    let gradient;
    
    switch(direction) {
        case 'linear-h':
            gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            break;
        case 'linear-v':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            break;
        case 'diagonal-1':
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            break;
        case 'diagonal-2':
            gradient = ctx.createLinearGradient(canvas.width, 0, 0, canvas.height);
            break;
        case 'radial':
            gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2);
            break;
    }
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// رسم خلفية صورة
function drawImageBackground() {
    if (backgroundImage) {
        const size = parseInt(document.getElementById('imageSizeSlider').value) / 100;
        const posX = parseInt(document.getElementById('imagePositionX').value);
        const posY = parseInt(document.getElementById('imagePositionY').value);
        const opacity = parseInt(document.getElementById('imageOpacity').value) / 100;
        
        // رسم الخلفية أولاً
        const bgColor = document.getElementById('backgroundColor').value;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // حفظ السياق
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // حساب حجم الصورة
        const imgWidth = backgroundImage.width * size;
        const imgHeight = backgroundImage.height * size;
        
        // حساب الموضع
        const x = (canvas.width - imgWidth) * (posX / 100);
        const y = (canvas.height - imgHeight) * (posY / 100);
        
        ctx.drawImage(backgroundImage, x, y, imgWidth, imgHeight);
        ctx.restore();
    } else {
        drawSolidBackground();
    }
}

// رسم النص
function drawText() {
    const mainText = document.getElementById('mainText').value;
    const secondaryText = document.getElementById('secondaryText').value;
    const mainFont = document.getElementById('mainFont').value;
    const mainSize = parseInt(document.getElementById('mainTextSize').value);
    const mainColor = document.getElementById('mainTextColor').value;
    const mainWeight = document.getElementById('mainFontWeight').value;
    const mainStyle = document.getElementById('mainFontStyle').value;
    const textStyle = document.getElementById('mainTextStyle').value;
    
    // رسم النص الرئيسي
    ctx.font = `${mainStyle} ${mainWeight} ${mainSize}px ${mainFont}`;
    ctx.fillStyle = mainColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 50;
    
    // تطبيق التأثيرات
    applyTextStyle(mainText, centerX, centerY, mainColor, textStyle, mainSize);
    
    // رسم النص الثانوي
    if (secondaryText) {
        const secondaryFont = document.getElementById('secondaryFont').value;
        const secondarySize = parseInt(document.getElementById('secondaryTextSize').value);
        const secondaryColor = document.getElementById('secondaryTextColor').value;
        
        ctx.font = `400 ${secondarySize}px ${secondaryFont}`;
        ctx.fillStyle = secondaryColor;
        
        const secondaryCenterY = centerY + mainSize + 40;
        ctx.fillText(secondaryText, centerX, secondaryCenterY);
    }
}

// تطبيق تأثيرات النص
function applyTextStyle(text, x, y, color, style, size) {
    switch(style) {
        case 'none':
            ctx.fillText(text, x, y);
            break;
            
        case 'border-white':
        case 'border-black':
        case 'border-gold':
            const borderColors = {
                'border-white': '#ffffff',
                'border-black': '#000000',
                'border-gold': '#FFD700'
            };
            const borderColor = borderColors[style];
            const borderWidth = parseInt(document.getElementById('borderWidth').value) || 3;
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
            break;
            
        case 'shadow-soft':
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText(text, x, y);
            ctx.shadowColor = 'transparent';
            break;
            
        case 'shadow-hard':
            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.fillText(text, x, y);
            ctx.shadowColor = 'transparent';
            break;
            
        case 'glow-blue':
        case 'glow-pink':
        case 'glow-green':
            const glowColors = {
                'glow-blue': '#0099ff',
                'glow-pink': '#ff0099',
                'glow-green': '#00ff99'
            };
            const glowColor = glowColors[style];
            
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillText(text, x, y);
            ctx.shadowColor = 'transparent';
            break;
            
        case '3d-effect':
            for (let i = 3; i > 0; i--) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillText(text, x + i, y + i);
            }
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            break;
            
        case 'neon-effect':
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeText(text, x, y);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);
            ctx.shadowColor = 'transparent';
            break;
            
        case 'gradient-text':
            const gradient = ctx.createLinearGradient(x - size * text.length / 2, y, x + size * text.length / 2, y);
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(0.5, '#00ff00');
            gradient.addColorStop(1, '#0000ff');
            ctx.fillStyle = gradient;
            ctx.fillText(text, x, y);
            break;
            
        case 'chrome-effect':
            const metalGradient = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
            metalGradient.addColorStop(0, '#e0e0e0');
            metalGradient.addColorStop(0.5, '#ffffff');
            metalGradient.addColorStop(1, '#808080');
            ctx.fillStyle = metalGradient;
            ctx.fillText(text, x, y);
            ctx.strokeStyle = '#404040';
            ctx.lineWidth = 1;
            ctx.strokeText(text, x, y);
            break;
            
        case 'retro-80s':
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.strokeText(text, x, y);
            ctx.fillStyle = '#ffff00';
            ctx.fillText(text, x, y);
            ctx.shadowColor = 'transparent';
            break;
            
        case 'holographic':
            for (let i = 0; i < 3; i++) {
                ctx.globalAlpha = 0.5;
                const hues = ['#ff0080', '#0080ff', '#00ff80'];
                ctx.fillStyle = hues[i];
                ctx.fillText(text, x + i * 2, y + i * 2);
            }
            ctx.globalAlpha = 1;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            break;
            
        case 'glitch-effect':
            ctx.fillStyle = '#ff0000';
            ctx.fillText(text, x + 3, y);
            ctx.fillStyle = '#00ff00';
            ctx.fillText(text, x - 3, y);
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            break;
            
        case 'vintage':
            ctx.fillStyle = 'rgba(139, 90, 43, 0.3)';
            ctx.fillText(text, x + 2, y + 2);
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            break;
            
        case 'cosmic':
            const cosmicGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            cosmicGradient.addColorStop(0, '#ffff00');
            cosmicGradient.addColorStop(1, '#ff00ff');
            ctx.fillStyle = cosmicGradient;
            ctx.fillText(text, x, y);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeText(text, x, y);
            break;
            
        default:
            ctx.fillText(text, x, y);
    }
}

// تحديث Canvas
function updateCanvas() {
    // تنظيف Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الخلفية
    drawBackground();
    
    // رسم النص
    drawText();
}

// تحميل الصورة
function downloadImage() {
    const quality = parseInt(document.getElementById('imageQuality').value) / 100;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg', quality);
    link.download = 'thumbnail.jpg';
    link.click();
}

// إعادة تعيين
function resetCanvas() {
    document.getElementById('mainText').value = 'نص مصغرة جميل';
    document.getElementById('secondaryText').value = 'اختياري';
    document.getElementById('backgroundColor').value = '#1a1a1a';
    document.getElementById('mainTextColor').value = '#ffffff';
    document.getElementById('secondaryTextColor').value = '#cccccc';
    document.getElementById('canvasWidth').value = '1200';
    document.getElementById('canvasHeight').value = '630';
    document.getElementById('widthSlider').value = '1200';
    document.getElementById('heightSlider').value = '630';
    document.getElementById('mainTextSize').value = '80';
    document.getElementById('mainTextSizeValue').textContent = '80px';
    document.getElementById('secondaryTextSize').value = '32';
    document.getElementById('secondaryTextSizeValue').textContent = '32px';
    
    canvas.width = 1200;
    canvas.height = 630;
    backgroundImage = null;
    
    updateCanvas();
}

// نسخ الصورة
function copyToClipboard() {
    canvas.toBlob(blob => {
        navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ]).then(() => {
            alert('تم نسخ الصورة إلى الحافظة!');
        }).catch(err => {
            alert('فشل النسخ');
        });
    });
}
