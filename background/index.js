chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);
    switch (command) {
      case "open-capture-window":
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            inject(tabs[0])
        })
      default:
        return undefined;
    }
  });

  function inject (tab) {
    // skip urls like "chrome://" to avoid extension error
    if (tab.url?.startsWith("chrome://")) return undefined;
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: contentScriptFunc,
        args: ['action'],
        });
  }

  function contentScriptFunc (name) {
    alert(`"${name}" executed`);
  }