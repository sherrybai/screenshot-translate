console.log("content script injected");

// create an overlay to freeze the page when rectangle drawing is active
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100vw';
overlay.style.height = '100vh';
overlay.style.zIndex = '10000'; // Very high z-index
overlay.style.background = 'rgba(0, 0, 0, 0.0)'; // transparent background, or another color.
overlay.style.pointerEvents = 'auto'; // capture all pointer events

// define the crop rectangle before drawing
// adapted from https://jsfiddle.net/ck0be4rL/
const rectangle = document.createElement("div");
rectangle.style.position = "absolute";
rectangle.style.border = "1px dashed black";
rectangle.style.zIndex = '20000'; // higher than the overlay div

let isDragged = false;
let rectangleCoords = [];

// helper methods for drawing the rectangle
const clearRectangleCoords = () => {
    rectangleCoords = [{x: 0, y: 0}, {x: 0, y: 0}];
};

const addFirstRectangleCoords = coords => {
    rectangleCoords[0] = coords;
};

const addSecondRectangleCoords = coords => {
    rectangleCoords[1] = coords;
};

const getRectangleParams = () => {
    const top = Math.min(rectangleCoords[0].y, rectangleCoords[1].y);
    const height = Math.max(rectangleCoords[0].y, rectangleCoords[1].y) - top;
    const left = Math.min(rectangleCoords[0].x, rectangleCoords[1].x);
    const width = Math.max(rectangleCoords[0].x, rectangleCoords[1].x) - left;
    return {
        top: top,
        height: height,
        left: left,
        width: width
    }
}

const redrawRectangle = () => {
    const rectParams = getRectangleParams();
    rectangle.style.top = rectParams.top + "px";
    rectangle.style.height = rectParams.height + "px";
    rectangle.style.left = rectParams.left + "px";
    rectangle.style.width = rectParams.width + "px";
    if (isDragged) {
        rectangle.style.backgroundColor = "rgba(204,230,255, 0.5)";
    } else {
        rectangle.style.backgroundColor = "rgba(0,0,0, 0.0)";
    }
};

function startRectangleDraw(e) {
    document.body.appendChild(rectangle);

    isDragged = true;
    clearRectangleCoords();
    addFirstRectangleCoords({ x: e.pageX, y: e.pageY });
    addSecondRectangleCoords({ x: e.pageX, y: e.pageY });
    redrawRectangle();

    // prevent mouse interaction
    e.stopPropagation();
    e.preventDefault();
}

function drawOnMouseMove(e) {
    if (isDragged) {
        addSecondRectangleCoords({ x: e.pageX, y: e.pageY });
        redrawRectangle();

        // prevent mouse interaction
        e.stopPropagation();
        e.preventDefault();
    }
}

function finishRectangleDraw(e) {
    if (isDragged) {
        isDragged = false;
        addSecondRectangleCoords({ x: e.pageX, y: e.pageY });
        redrawRectangle();
        // remove all the event handlers
        document.removeEventListener("mousedown", startRectangleDraw);
        document.removeEventListener("mousemove", drawOnMouseMove);
        document.removeEventListener("mouseup", drawOnMouseMove);

        // process the rectangle
        processRectangle();

        // prevent mouse interaction
        e.stopPropagation();
        e.preventDefault();

        // add listener for clearing rectangle
        document.addEventListener("mousedown", clearRectangle);
    }
}

function clearRectangle(e) {
    clearRectangleCoords();
    redrawRectangle();
    // self-destruct
    document.removeEventListener("mousedown", clearRectangle);
    rectangle.remove();
    overlay.remove();
}

function processRectangle() {
    // from https://medium.com/tarkalabs-til/cropping-a-screenshot-captured-with-a-chrome-extension-a52ac9816d10
    chrome.runtime.sendMessage({ message: "capture_tab" },
        function (response) {
            console.log(`${response.imgSrc}`)

            const image = new Image()
            image.src = response.imgSrc
            image.onload = function () {
                const canvas = document.createElement("canvas")
                const rectParams = getRectangleParams();

                canvas.width = rectParams.width
                canvas.height = rectParams.height
                const ctx = canvas.getContext("2d")

                ctx.drawImage(
                    image,
                    rectParams.left,
                    rectParams.top,
                    rectParams.width,
                    rectParams.height,
                    0,
                    0,
                    rectangle.width,
                    rectangle.height
                )

                const croppedImage = canvas.toDataURL()
                //Do stuff with your cropped image
                console.log(`${croppedImage}`)
            }
        }
    )
}

// listener for extension trigger command
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log(`received message ${req.message}`)
    switch (req.message) {
        case "init":
            listenForRectangleDraw();
        default:
            return undefined;
    }
});

function listenForRectangleDraw() {
    console.log("listen for rectangle executed");
    
    // prevent mouse interaction with all events
    document.body.appendChild(overlay);

    document.addEventListener("mousedown", startRectangleDraw);
    document.addEventListener("mousemove", drawOnMouseMove);
    document.addEventListener("mouseup", finishRectangleDraw);
}