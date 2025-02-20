console.log("content script injected");

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log(`received message ${req.message}`)
    switch (req.message) {
        case "init":
            drawRectangle();
        default:
            return undefined;
    }
});

function drawRectangle () {
    console.log("draw rectangle executed");

    // from https://medium.com/tarkalabs-til/cropping-a-screenshot-captured-with-a-chrome-extension-a52ac9816d10
    const rect = {x: 0, y: 0, width: 100, height: 100};

    chrome.runtime.sendMessage({message: "capture_tab", rect: rect},
        function (response) {
            //response.imgSrc is your cropped image as a data URL
            
        }
    )
}