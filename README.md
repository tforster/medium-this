# Medium This 0.1.0

_A Chrome extension to save URLs and page content as drafts to your Medium Blog_

# Built With

* [Visual Studio Code 1.12.2](https://code.visualstudio.com/)
* [Google Chrome for Windows Version 58.0.3029.110 (64-bit)](https://www.google.com/chrome/)
* [Medium REST API](https://github.com/Medium/medium-api-docs)
* [to-markdown.js](https://github.com/domchristie/to-markdown)

# For Developers

There is not much to getting started with this project other than cloning/forking the repository, running `yarn install` and opening up your code editor to the src/ folder. Build the project using `gulp build`. Note that currently only the dev target is available (e.g. build/dev). Once gulp-uglify can be coerced into
supporting ES6 syntax then `gulp build --target stage | prod` will be available.

## Installing The Extension in Developer Mode

Testing is done locally by side-loading the extension in developer mode. 

1. Navigate to [chrome://extensions/](chrome://extensions/)
1. Check the box in the top right that says "Developer mode"
1. Click the button "Load unpacked extension..." and select the build/dev folder.
1. For first time use choose Options from the extension when it appears in the toolbar and add a valid Medium integration token that can be generated
from [https://medium.com/me/settings](https://medium.com/me/settings).

## Tips
1. Refresh the extensions page to reload the extension following code changes
1. Right-click the extension button and choose Inspect popup to get an extension specific Developer Tools window

# Roadmap

* Switch integration tokens for more robust oAuth2
* Allow user to choose draft or publish as default behaviour
* Synchronize tags with those already on the users Medium blog
* Improve gulp build tasks to support minification of ES6 syntax

# Change Log

0.1.0: Initial Release and early MVP (2017-05-25)
* Posts a source URL from the current page to a Medium draft
* Blockquotes any selected text
* Has simple options page to edit Medium integration token
