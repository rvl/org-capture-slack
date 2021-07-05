import { browser, Runtime } from "webextension-polyfill-ts";

import { CaptureMetadataMsg} from "./types";
import { doCapture, defaultCaptureTemplate } from "./orgProtocol";

browser.storage.sync.set({ captureTemplate: defaultCaptureTemplate });
console.log(`Default capture template is %c${defaultCaptureTemplate}`, 'background: #222; color: #bada55');

browser.runtime.onConnect.addListener((p: Runtime.Port) => {
  p.onMessage.addListener(async (msg: CaptureMetadataMsg) => {
    if (msg.captureMetadata) {
      const { captureTemplate } = await browser.storage.sync.get("captureTemplate");
      const { token } = await browser.storage.local.get("token");
      if (token) {
        const uri = await doCapture(msg.captureMetadata, token, captureTemplate);
        p.postMessage({ uri });
        return uri;
      }
    }
  });
});
