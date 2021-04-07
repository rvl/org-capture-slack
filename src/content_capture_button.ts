
function isOurButton(el: HTMLButtonElement) {
  const label = (el as any).ariaLabel;
  return el.type === "button" &&
    (label === "Add to saved items" || label === "Remove from saved items");
}

document.addEventListener("click", e => {
  for (let target = e.target; target && target !== document; target = (target as Element).parentNode) {
    //console.log("slack body clicked - target", target);
    const button = target as HTMLButtonElement
    if (isOurButton(button)) {
      console.log("it's ours, with dataset", button.dataset);
      const meta = button.dataset.focusMetadata ? JSON.parse(button.dataset.focusMetadata) : undefined;
      console.log("meta is", meta);
      // delete button.dataset.focusMetadata;

      chrome.storage.local.set({ captureMetadata: meta });

      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
}, false);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.token) {
    document.body.dataset.token = request.token;

    const font1 = `font: bold x-large "Helvetica", sans-serif; color: blue;`;
    const font2 = `font: x-large "Courier", monospace; color: red; background: yellow;`;
    console.info(`%c 🦄 Your Slack API token is: %c${request.token}%c 🦄`, font1, font2, font1);

    // const el = document.createElement("script");
    // el.src = "https://cdn.jsdelivr.net/npm/@slack/web-api@6.1.0/dist/WebClient.js";
    // (el as any).onload = `window.client = new WebClient("${request.token}");`;
    // document.body.appendChild(el);

    sendResponse({msg: "OK"});
  }
});
