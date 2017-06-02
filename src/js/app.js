"use strict"

class App {
  constructor() {
    let self = this;

    self.settingsClass = new SettingsClass();
    self.settingsClass.restore()
      .then(settings => {
        self.settings = settings;
        let id = document.querySelector('html').id;
        self.route(id + 'Page');
      });
  }

  // Simple little page/view router
  route(pageId) {
    let self = this;

    // Settings Page
    this.settingsPage = () => {
      // Cache oft used DOM elements
      let txtUserId = document.getElementById('userId');
      let txtAccessToken = document.getElementById('accessToken');
      let btnSave = document.getElementById('btnSave');
      let btnReset = document.getElementById('btnReset');

      // Set initial field values
      txtUserId.value = self.settings.userId;
      txtAccessToken.value = self.settings.accessToken;
      document.querySelector('#notifyFollowers').checked = self.settings.notifyFollowers;
      document.querySelector(`input[value="${self.settings.publishStatus}"]`).checked = true

      // Bind Save button
      btnSave.addEventListener('click', () => {
        self.settings.userId = txtUserId.value;
        self.settings.accessToken = txtAccessToken.value;
        self.settings.notifyFollowers = document.querySelector('#notifyFollowers').checked;
        self.settings.publishStatus = document.querySelector('input[name="publishStatus"]:checked').value;

        self.settingsClass.save()
          .then(results => {
            self.status('Settings saved');
          })
          .catch(reason => {
            self.status('Unable to save settings because: ' + reason);
          });
      });

      // Bind Reset button
      btnReset.addEventListener('click', () => {
        self.settingsClass.clear()
          .then(() => {
            // Todo: later, clear() will call restore to get defaults before returning, then we populate defaults here
            txtUserId.value = '';
            txtAccessToken.value = '';
            self.status('Settings reset');

          });
      });

      // Bind AccessToken change so that we auto fetch corresponding UserId
      txtAccessToken.addEventListener('change', (e) => {
        self.settingsClass.getUser(e.currentTarget.value)
          .then((user) => {
            txtUserId.value = user.id;
          })
          .catch(reason => {
            self.status(reason);
          });
      });
    }

    // Extension Page
    this.extensionPage = () => {
      // Cache oft used DOM elements
      let txtTitle = document.getElementById('title');
      let txtSelection = document.getElementById('selection');
      let btnSave = document.getElementById('btnSave');
      let btnClose = document.getElementById('btnClose');
      let btnOptions = document.getElementById('btnOptions');

      // Create a new post object based on the current tab
      new Post()
        .then((post) => {
          // post contains page object <-- improve semantics of page vs post, etc
          // Update UI
          txtTitle.value = post.page.title;
          txtSelection.innerHTML = post.page.selection;
          document.querySelector('#notifyFollowers').checked = self.settings.notifyFollowers;
          document.querySelector(`input[value="${self.settings.publishStatus}"]`).checked = true

          // Bind buttons
          btnSave.addEventListener('click', () => {
            post.page.title = txtTitle.value;
            post.page.selection = txtSelection.innerHTML;
            post.page.tags = document.getElementById('tags').value.split(',');
            post.page.notifyFollowers = document.querySelector('#notifyFollowers').checked;
            post.page.publishStatus = document.querySelector('input[name="publishStatus"]:checked').value; // Todo: refactor to use Id

            post.saveToMedium(self.settings.userId, self.settings.accessToken)
              .then(() => {
                window.close();
              })
          });

          btnClose.addEventListener('click', () => {
            window.close();
          });

          btnOptions.addEventListener('click', (e) => {
            chrome.runtime.openOptionsPage(function () {
              //window.close();
            });
          });


        })
        .catch(reason => {
          console.log('PromiseAll reason', reason);
          self.status(reason);
        })
    }

    return this[pageId]();
  }

  status(str) {
    document.getElementById('status').innerHTML = document.getElementById('status').innerHTML + '<br/><br/>' + (typeof (str) === 'object' ? JSON.stringify(str) : str);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});

(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-100340642-2', 'auto');
ga('set', 'checkProtocolTask', function () { }); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');
ga('send', 'pageview', '/' + document.querySelector('html').id);
