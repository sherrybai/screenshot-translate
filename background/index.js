chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);
  switch (command) {
    case "open-capture-window":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        sendInitMessage(tabs[0])
      })
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
      return true;
    case "process_ocr":
      processOCR(req.imgSrc)
  }
})

function processOCR(image) {
  console.log("processing ocr")
  console.log(`${image}`)

  let base64Image = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""); // Remove the prefix
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
      let init = {
          method: 'POST',
          async: true,
          headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
          },
          'contentType': 'json',
          body: JSON.stringify({
            "requests": [
              {
                "image": {
                  "content": base64Image
                },
                "features": [
                  {
                    "type": "TEXT_DETECTION"
                  }
                ]
              }
            ]
          })
      };
      fetch(
          'https://vision.googleapis.com/v1/images:annotate',
          init)
          .then((response) => response.json())
          .then(function (data) {
              console.log(data)
          });
  });
}