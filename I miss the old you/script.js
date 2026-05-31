document.addEventListener("DOMContentLoaded", function() {

    // ==============================
    // 1. 背景音乐
    // ==============================
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', function() {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicBtn.innerText = "♫ 暂停";
                    musicBtn.classList.add('playing');
                }).catch(err => console.log("播放触发异常:", err));
            } else {
                bgMusic.pause();
                musicBtn.innerText = "♫ 播放回忆";
                musicBtn.classList.remove('playing');
            }
        });
    }

    // ==============================
    // 2. 照片信息：先内置一份，txt 能读到就覆盖
    //    这样本地打开或 fetch 失败时，悬停文字也不会消失
    // ==============================
    const builtinInfo = `01|2024.05|常州极克店
02|2024.08|太湖自驾
03|2024.11|茅山脚下
04|2025.02|长荡湖湿地公园
05|2025.02|长荡湖湿地公园
06|2025.03|溧水庐山观音寺
07|2025.03|公司办公室
08|2025.04|广德太极洞
09|2025.04|广德鼓角楼
10|2025.05|宜兴团氿
11|2025.05|宜兴团氿
12|2025.05|宜兴万达广场
13|2025.06|宜兴
14|2025.08|公司客户审核
15|2025.09|聚餐 抽空跑出来看你一眼
16|2026.01|汤山小镇火锅
17|2026.01|汤山温泉小镇
18|2026.02|安吉云上草原 山上很冷，你牵着我的手
19|2026.02|安吉排队海盗船
20|2026.02|安吉茶山
21|2026.02|安吉天荒坪电站 你终于休息一点了
22|2026.02|安吉玻璃桥 你坐在黄色小骆驼背上
23|2026.02|安吉玻璃桥
24|2026.02|无锡惠山古镇
25|2026.02|无锡惠山古镇`;

    const photoGrid = document.getElementById('photoGrid');
    const infoMap = new Map();

    function loadInfoText(text) {
        text.split('\n').forEach(line => {
            if (!line || !line.includes('|')) return;
            const parts = line.split('|');
            if (parts.length < 3) return;
            const id = parts[0].trim();
            const time = parts[1].trim();
            const place = parts.slice(2).join('|').trim();
            infoMap.set(id, { time, place });
        });
    }

    loadInfoText(builtinInfo);

    fetch('照片信息.txt')
        .then(res => res.ok ? res.text() : '')
        .then(data => {
            if (data && data.trim()) {
                infoMap.clear();
                loadInfoText(data);
            }
        })
        .catch(() => {
            // 用内置信息，不影响显示
        })
        .finally(() => {
            buildPhotoWall();
            initFadeIn();
        });

    // ==============================
    // 3. 纯照片墙：只生成25张照片，不插入正文
    // ==============================
    function buildPhotoWall() {
        if (!photoGrid) return;
        photoGrid.innerHTML = "";

        for (let i = 1; i <= 25; i++) {
            const num = i.toString().padStart(2, '0');
            const info = infoMap.get(num) || { time: '', place: '' };

            const card = document.createElement('div');
            card.className = 'photo-card fade-in';

            card.innerHTML = `
                <img src="images/${num}.jpg" alt="照片-${num}" loading="eager" decoding="async">
                <div class="item-meta">
                    <span class="meta-date">${info.time || ''}</span>
                    <span class="meta-place">${info.place || ''}</span>
                </div>
            `;

            card.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    const isActive = this.classList.contains('active');
                    document.querySelectorAll('.photo-card').forEach(c => c.classList.remove('active'));
                    if (!isActive) this.classList.add('active');
                }
            });

            photoGrid.appendChild(card);
        }
    }

    // ==============================
    // 4. 只做透明度淡入，不动 transform，避免文字/照片错位
    // ==============================
    function initFadeIn() {
        const items = document.querySelectorAll('.fade-in');
        if (!('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.02 });

        items.forEach(el => observer.observe(el));
    }
});
