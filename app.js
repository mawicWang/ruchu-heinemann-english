document.addEventListener('DOMContentLoaded', () => {
    const fileListContainer = document.getElementById('file-list');
    const searchInput = document.getElementById('search-input');
    const audioPlayer = document.getElementById('audio-player');
    const trackNameDisplay = document.getElementById('track-name');
    const sourceSelect = document.getElementById('source-select');

    const SOURCES = {
        'qiniu': 'http://t8d9rg9ev.hd-bkt.clouddn.com',
        'r2': 'https://pub-bf941e18a2b946d588e85e7141c87b2c.r2.dev',
        'aliyun': 'https://ruchu-heinemann-english-2.oss-cn-hongkong.aliyuncs.com'
    };

    let allFiles = []; // To store the full tree for search/reset

    // Fetch the playlist JSON
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            allFiles = data;
            renderTree(data, fileListContainer);
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            fileListContainer.innerHTML = '<div style="padding:20px; text-align:center;">无法加载音频列表 (playlist.json missing?)</div>';
        });

    // Render the file tree
    function renderTree(items, container) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<div style="padding:15px; color:#888;">无内容</div>';
            return;
        }

        items.forEach(item => {
            const itemDiv = document.createElement('div');

            // Create the item header (clickable row)
            const itemRow = document.createElement('div');
            itemRow.className = `item ${item.type}`;
            itemRow.innerHTML = `
                <span class="item-icon">${item.type === 'directory' ? '📁' : '🎵'}</span>
                <span class="item-name">${item.name}</span>
            `;

            itemDiv.appendChild(itemRow);

            if (item.type === 'directory') {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'children-container';
                itemDiv.appendChild(childrenContainer);

                // Handle folder click
                itemRow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = childrenContainer.classList.toggle('expanded');
                    itemRow.querySelector('.item-icon').textContent = isExpanded ? '📂' : '📁';

                    // Lazy render children if not already rendered
                    if (isExpanded && childrenContainer.children.length === 0) {
                         renderTree(item.children, childrenContainer);
                    }
                });
            } else {
                // Handle file click
                itemRow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    playFile(item);
                });
            }

            container.appendChild(itemDiv);
        });
    }

    // Play a file
    function playFile(fileItem) {
        trackNameDisplay.textContent = fileItem.name;

        const selectedSource = sourceSelect.value;
        const baseUrl = SOURCES[selectedSource];

        // Handle case where path might already be absolute (legacy support or safety)
        if (fileItem.path.startsWith('http')) {
             audioPlayer.src = fileItem.path;
        } else {
             audioPlayer.src = `${baseUrl}/${fileItem.path}`;
        }

        audioPlayer.play();

        // Update document title
        document.title = `▶ ${fileItem.name}`;
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        if (!query) {
            renderTree(allFiles, fileListContainer);
            return;
        }

        // Flatten the tree and filter
        const results = searchFiles(allFiles, query);
        renderFlatList(results, fileListContainer);
    });

    function searchFiles(items, query) {
        let results = [];
        items.forEach(item => {
            if (item.type === 'file' && item.name.toLowerCase().includes(query)) {
                results.push(item);
            }
            if (item.type === 'directory') {
                results = results.concat(searchFiles(item.children, query));
            }
        });
        return results;
    }

    function renderFlatList(items, container) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<div style="padding:15px; color:#888;">未找到匹配的音频</div>';
            return;
        }

        items.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = `item ${item.type}`;
            itemRow.innerHTML = `
                <span class="item-icon">🎵</span>
                <span class="item-name">${item.name}</span>
                <span style="font-size:0.8em; color:#999; margin-left:auto;">${decodeURIComponent(item.path)}</span>
            `;

            itemRow.addEventListener('click', () => playFile(item));
            container.appendChild(itemRow);
        });
    }
});
