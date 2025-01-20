(async () => {
    const imageActions = {
        'plus90': 'Rotate 90 degree',
        'plus180': 'Rotate 180 degree',
        'plus270': 'Rotate -90 degree',
        'flipVertically': 'Flip Vertically',
        'flipHorizontally': 'Flip Horizontally',
    }

    chrome.runtime.onInstalled.addListener(async () => {
        // create actions based on map above
        for (let [id, label] of Object.entries(imageActions)) {
            chrome.contextMenus.create({
                id: id,
                title: label,
                type: 'normal',
                contexts: ["image"]
            });
        }
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        // Handle invoked menu item, create new tab using the context image url and execute a script
        chrome.tabs.create({url: info.srcUrl, active: true}, (tab) => {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                func: async (menuItemId, tabId, windowId) => {
                    // Inception level 1 - Browser
                    // Locate <img> tag
                    let imageElement = document.querySelector("img");
                    imageElement.style.border = `1px solid ${document.body.style.backgroundColor}`;
                    imageElement.style.outline = `1px solid white`;
                    if (imageElement) {
                        // Transform the image based in menu item id
                        if (menuItemId === 'plus90') {
                            imageElement.style.transform = 'rotate(270deg)';
                        } else if (menuItemId === 'plus180') {
                            imageElement.style.transform = 'rotate(180deg)';
                        } else if (menuItemId === 'plus270') {
                            imageElement.style.transform = 'rotate(90deg)';
                        } else if (menuItemId === 'flipVertically') {
                            imageElement.style.transform = 'scaleY(-1)';
                        } else if (menuItemId === 'flipHorizontally') {
                            imageElement.style.transform = 'scaleX(-1)';
                        }
                    }
                    setTimeout(() => {
                        // Inception jump into level 2
                        // Now get the image rect and send it to service worker using message
                        chrome.runtime.sendMessage({
                            type: 'rect',
                            windowId: windowId,
                            tabId: tabId,
                            rect: imageElement.getBoundingClientRect()
                        })
                    }, 0);
                },
                args: [info.menuItemId, tab.id, tab.windowId]
            });
        });
    });

    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.type === 'rect') {
            // Inception level 2 - Back into service worker
            // Process the message and data
            let dataUrl = await chrome.tabs.captureVisibleTab(request.windowId, {
                format: 'png'
            });

            await chrome.scripting.executeScript({
                target: {tabId: request.tabId},
                func: async (dataUrl, rect) => {
                    // Inception level 3 - Browser
                    // Load dataUrl into a blob
                    let response = await fetch(dataUrl);
                    let blob = await response.blob();
                    // Create a ClipboardItem with the image Blob
                    const clipboardItem = new ClipboardItem({
                        [blob.type]: blob
                    });

                    // Write the ClipboardItem to the clipboard
                    try {
                        await navigator.clipboard.write([clipboardItem]);
                    } catch (e) {
                        alert(`Could not copy ${clipboardItem} ${e}`);
                    }
                },
                args: [dataUrl, request.rect]
            });
        }
    });
})();
