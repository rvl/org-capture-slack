
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
