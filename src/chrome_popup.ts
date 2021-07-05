// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor") as HTMLElement;

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", () => {
  //const tab = await new Promise<chrome.tabs.Tab>(resolve => chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0] as chrome.tabs.Tab)));
  //const tabId = (tab as chrome.tabs.Tab).id as number;
  // fixme: it's different with MV2
  // chrome.tabs.executeScript(tabId, {
  //   code: setPageBackgroundColor
  // }, () => {
  // });
  // chrome.storage.sync.set({color});
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
}
