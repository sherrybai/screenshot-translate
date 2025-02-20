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
    const rect = {x: 0, y: 0, width: 1000, height: 1000};

    chrome.runtime.sendMessage({message: "capture_tab", rect: rect},
        function (response) {
            const image = new Image()
            image.src = response.imgSrc
            image.onload = function () {
                const canvas = document.createElement("canvas")
                const scale = window.devicePixelRatio

                canvas.width = rect.width * scale
                canvas.height = rect.height * scale
                const ctx = canvas.getContext("2d")

                ctx.drawImage(
                    image,
                    rect.x * scale,
                    rect.y * scale,
                    rect.width * scale,
                    rect.height * scale,
                    0,
                    0,
                    rect.width * scale,
                    rect.height * scale
                )

                const croppedImage = canvas.toDataURL()
                //Do stuff with your cropped image
                console.log(`${croppedImage}`)
            }
        }
    )
}