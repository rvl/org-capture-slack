# Chrome extension to capture links to slack messages

This extension hijacks the "Add to saved items" button in Slack, and replaces it with an [org-protocol](https://orgmode.org/manual/The-capture-protocol.html#The-capture-protocol) call.

## Installing

Check out the source code, run:

```
npm install
npm run build
```

Then add the `dist` dir as an "Unpacked Extension" to your Chrome
profile extensions.

## Configuration

You need a URL scheme handler for `org-protocol://` configured.

The org-mode side is configured in a similar manner to [org-capture-extension](https://github.com/sprig/org-capture-extension).

Add something like the following to your `org-capture-templates`:

```lisp
(setq org-capture-templates
  '(("lm" "Slack message link" entry
      (file+headline org-default-notes-file "Slack inbox")
      "* TODO %?
  SCHEDULED: %t
  :LOGBOOK:
  - Captured: %U
  :END:

  [[%:link][%:description]]
  #+BEGIN_QUOTE
  %i
  #+END_QUOTE

")))
```

The capture key is hard-coded to `lm`.

## Work in progress

This is very rough code, under development. There is still some
leftover example code from the Chrome Extensions tutorial.
