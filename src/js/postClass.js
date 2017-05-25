"use strict";

class Post {
  constructor() {
    let self = this;

    this.page = {
      favIconUrl: '',
      selection: '',
      tags: [],
      title: '',
      url: ''
    }

    return Promise.all([self.getSelection(), self.getTab()])
      .then(() => {
        return Promise.resolve(self);
      })
  }

  /**
   * 
   * 
   * @param {string} Medium account userId 
   * @param {string} Medium account accessToken 
   * @returns 
   * 
   * @memberof Post
   */
  saveToMedium(userId, accessToken) {
    let self = this;

    // Add citation
    self.page.selection += `\n\nSource: [${self.page.url}](${self.page.url})`
    // Prefix all lines with markdown blockquote character
    self.page.selection = self.page.selection.replace(/^[\b\B]?/gm, '> ');

    let post = {
      title: self.page.title,
      contentFormat: 'markdown',
      content: self.page.selection,
      canonicalUrl: '',
      tags: self.page.tags,
      publishStatus: 'draft',
      notifyFollowers: false
    }

    let url = `https://api.medium.com/v1/users/${userId}/posts`;
    let opts = {
      body: JSON.stringify(post),
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
      })
    }

    return fetch(url, opts)
      .then(response => {
        return response.json();
      })
      .then(() => {
        window.close();
      })
      .catch(err => {
        self.status(err);
      })
  }


  /**
   * Populates self.data.tab with the current tab details
   * 
   * @returns an empty Promise
   * 
   * @memberof Post
   */
  getTab() {
    let self = this;
    return new Promise(function (resolve, reject) {
      chrome.tabs.getSelected(null, function (tab) {

        self.page.title = tab.title;
        self.page.url = tab.url;
        self.page.favIconUrl = tab.favIconUrl;

        resolve('getTab');
      });
    });
  }


  /**
   * Populates self.data.selection with any selected markup
   * 
   * @returns an empty Promise
   * 
   * @memberof Post
   */
  getSelection() {
    let self = this;
    return new Promise(function (resolve, reject) {
      chrome.tabs.executeScript({
        code: "var selection, range, clone, div;selection = window.getSelection();range = selection.getRangeAt(0);clone = range.cloneContents();div=document.createElement('div');div.appendChild(clone);div.innerHTML"
      }, function (range) {
        if (range) {
          let gfm = toMarkdown(range[0], { gfm: true });
          self.page.selection = gfm;
        }
        resolve('getSelection');
      });
    });
  }
}

