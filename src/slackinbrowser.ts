// Automatically follow "Open in browser" in Slack links.
//
// Thanks to "Open Slack in Browser, not App extension" for the tip
// https://chrome.google.com/webstore/detail/open-slack-in-browser-not/jkgehijlkoolgcjifalbiicaomkngakb
//
// TODO: prevent navigation to the slack:// URL

function selectLinks(sel: string) {
  return Array.from(document.querySelectorAll(sel));
}

const selectV1 = selectLinks(".fallback a");
const selectV2 = selectLinks(".p-ssb_redirect__loading_messages a");

const url =
      selectV1
      .concat(selectV2)
      .map(a => (a as HTMLLinkElement).href)
      .find(href => href.includes("/messages"));

if (url) {
  console.log("Opening Slack link in browser:", url);
  chrome.tabs.query({currentWindow: true, active: true}, tabs => {
    chrome.tabs.update((tabs[0].id as number), {url});
  });
} else {
  console.error("Open in browser link was not found.");
}
