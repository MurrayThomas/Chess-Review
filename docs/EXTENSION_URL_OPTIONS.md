# Extension URL options — report only

23 October 2026. Assumption: item 10 refers to the browser address bar above
the review page. No URL, manifest ID, launch route or link has been changed.

The current Chrome route is chrome-extension://<ID>/analysis.html#<job UUID>;
Firefox uses moz-extension://<internal UUID>/analysis.html#<job UUID>. The launcher
uses runtime.getURL rather than hard-coding the origin. The final UUID selects a
job handoff in extension storage and the per-tab session copy used by Reload.

| Part | Can we improve it safely? |
| --- | --- |
| Browser scheme and ID | They are browser extension identity, not a configurable website address. Chrome's key can preserve an existing development ID; it cannot choose a readable domain. Preserve the published identity. Firefox's URL UUID is separate from the fixed add-on ID in manifest.json. |
| analysis.html | A name such as chess-review.html is possible. Keep analysis.html as a compatibility entry, update launchers and package inputs, and verify relative module/asset paths and old open tabs. Changing a filename alone brings little benefit while the browser ID remains. |
| The #job UUID | We can eventually move the launch identifier into per-tab state and replace the visible fragment with a friendly route after successful startup. First redesign loadJob and rememberReviewJob together: simply deleting or renaming the hash today breaks reload/recovery and risks cross-tab confusion. Preserve independent games in multiple tabs, library switching and failed-job retries. |
| A custom HTTPS address | This would be a separately hosted web application, or a launch page directing users into the extension. A web page does not inherit extension storage, APIs or permissions. It requires architectural work and a data bridge or migration; it is not a safe cosmetic rename. History APIs require the same origin and cannot disguise an extension page as a different website. |
| Tab title | This can be made more descriptive independently of the address, with very low compatibility risk. It will not change the address bar. |

Recommendation: keep the extension identity and current entry page. If the random
job fragment is what bothers you, a friendly visible route backed by per-tab
session state is the smallest meaningful change. Implement it separately with
reload, duplicate-tab, parallel-game, cancelled-import and old-link compatibility
checks. No implementation was requested for this item.

If “link in the top” instead means a button/link inside the app header, its
label and target can be edited without changing extension identity. That is a
different, smaller UI change and needs the specific link identified.

Sources: [Chrome manifest key and consistent IDs](https://developer.chrome.com/docs/extensions/reference/manifest/key),
[Mozilla extension resource URL schemes and internal UUIDs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources),
[Mozilla runtime.getURL](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getURL),
[History.replaceState same-origin rule](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState).
Local evidence: analyze-flow.js openAnalysisTab; analysis.js loadJob and
rememberReviewJob; manifest.json browser_specific_settings.gecko.id.
