chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);
  switch (command) {
    case "open-capture-window":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendInitMessage(tabs[0])
      })
      return true;
    default:
      return true;
  }
});

function sendInitMessage(tab) {
  // skip urls like "chrome://" to avoid extension error
  if (tab.url?.startsWith("chrome://")) return undefined;

  chrome.tabs.sendMessage(tab.id, { message: 'init' });
}

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  console.log(`received message ${req.message}`)
  switch (req.message) {
    case "capture_tab":
      var tabId
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        tabId = tabs[0].id
      })

      chrome.tabs.captureVisibleTab(
        tabId,
        { format: "png", quality: 100 },
        function (dataUrl) {
          sendResponse({ imgSrc: dataUrl })
        }
      )
  }
  return true;
})