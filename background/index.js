chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);
    switch (command) {
      case "open-capture-window":
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            sendInitMessage(tabs[0])
        })
      default:
        return undefined;
    }
  });

  function sendInitMessage (tab) {
    // skip urls like "chrome://" to avoid extension error
    if (tab.url?.startsWith("chrome://")) return undefined;
    
    chrome.tabs.sendMessage(tab.id, {message: 'init'});
  }