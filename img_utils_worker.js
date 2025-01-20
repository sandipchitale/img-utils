(async () => {
    const rorateActions = {
        'plus90': 'Rotate 90 degree',
        'plus180': 'Rotate 180 degree',
        'plus270': 'Rotate -90 degree',
        'flipVertically': 'Flip Vertically',
        'flipHorizontally': 'Flip Horizontally',
    }

    chrome.runtime.onInstalled.addListener(async () => {
        for (let [id, label] of Object.entries(rorateActions)) {
            chrome.contextMenus.create({
                id: id,
                title: label,
                type: 'normal',
                contexts: ["image"]
            });
        }
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab  ) => {
        chrome.tabs.create({ url: info.srcUrl, active: true },  (tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async (menuItemId) => {
                    let imageElement = document.querySelector("img");
                    if (imageElement) {
                        console.log(menuItemId);
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
                },
                args: [info.menuItemId]
            });
        });
    });
})();
