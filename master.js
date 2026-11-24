const PageMaster = (() => {
    const audioMap = {
        index: 'i.mp3',
        novel: 'n.mp3',
        horror: 'h.mp3',
        detectives: 'd.mp3'
    };

    const player = new Audio();
    player.loop = true;
    let currentKey = 'index';
    let isMuted = false;

    function playAudioFor(key) {
        currentKey = key;
        const src = audioMap[key] || 'i.mp3';
        if (player.getAttribute('src') !== src) {
            player.src = src;
        }
        if (!isMuted) {
            player.play().catch(() => {
                // Browser autoplay block fallback on next interaction
            });
        }
    }

    function openInIframe(pageFile, audioKey, labelText) {
        const container = document.getElementById('page-frame-container');
        const iframe = document.getElementById('story-iframe');
        const titleEl = document.getElementById('frame-title');

        if (!container || !iframe) return;

        if (titleEl && labelText) {
            titleEl.textContent = labelText;
        }

        iframe.src = pageFile;
        container.classList.add('active');
        playAudioFor(audioKey);
    }

    function closeIframe() {
        const container = document.getElementById('page-frame-container');
        const iframe = document.getElementById('story-iframe');

        if (container) container.classList.remove('active');
        if (iframe) iframe.src = 'about:blank';

        playAudioFor('index');
    }

    function toggleMute() {
        isMuted = !isMuted;
        const btn = document.getElementById('btn-toggle-audio');
        if (isMuted) {
            player.pause();
            if (btn) btn.textContent = '🔇 Audio Off';
        } else {
            player.play().catch(() => {});
            if (btn) btn.textContent = '🔊 Audio On';
        }
    }

    function initMaster(defaultAudioKey = 'index') {
        playAudioFor(defaultAudioKey);

        // Unlock audio on first user click/key if browser blocked initial autoplay
        const unlockOnce = () => {
            if (!isMuted && player.paused) {
                playAudioFor(currentKey);
            }
            window.removeEventListener('pointerdown', unlockOnce);
            window.removeEventListener('keydown', unlockOnce);
        };
        window.addEventListener('pointerdown', unlockOnce);
        window.addEventListener('keydown', unlockOnce);

        // Listen to messages from pages inside iframe
        window.addEventListener('message', (event) => {
            if (!event.data || typeof event.data !== 'object') return;
            if (event.data.type === 'GO_HOME') {
                closeIframe();
            } else if (event.data.type === 'PLAY_AUDIO' && event.data.key) {
                playAudioFor(event.data.key);
            }
        });
    }

    return {
        initMaster,
        openInIframe,
        closeIframe,
        toggleMute,
        playAudioFor
    };
})();
