"use strict";

class SettingsClass {
  constructor() {
    let self = this;
    
    this.data = {
      userId: '',
      accessToken: '',
      tags: [],
      publishStatus: 'draft',
      notifyFollowers: false
    };

    return self;
  }


  /**
   * 
   * 
   * @returns a Promise containing the restored settings or defaults if no settings have been saved yet
   * 
   * @memberof SettingsClass
   */
  restore() {
    let self = this;
    return new Promise(function (resolve, reject) {
      let obj = self.data;
      chrome.storage.sync.get(obj, function (data) {
        if (chrome.runtime.error) {
          reject(chrome.runtime.error)
        } else {
          let options = data.options;
          self.data = data;
          resolve(data);
        }
      });
    });
  }


  /**
   * 
   * 
   * @returns a Promise containing the saved settings
   * 
   * @memberof SettingsClass
   */
  save() {
    let self = this;

    return new Promise(function (resolve, reject) {
      let obj =  self.data;
      chrome.storage.sync.set(obj, function () {
        if (chrome.runtime.error) {
          reject(chrome.runtime.error)
        }
        else {
          resolve(obj)
        }
      });
    });
  }


  /**
   * 
   * 
   * @returns a Promise with the empty default values
   * 
   * @memberof SettingsClass
   */
  clear() {
    return new Promise(function (resolve, reject) {
      chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
          reject('clear error', error);
        } else {
          // Todo: call restore so we return defaults
          resolve();
        }
      });
    });

  }


  /**
   * 
   * 
   * @param {string} accessToken 
   * @returns a Promise with the Medium user profile
   * 
   * @memberof SettingsClass
   */
  getUser(accessToken) {
    const url = 'https://api.medium.com/v1/me';

    const opts = {
      headers: new Headers({
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
      })
    }

    return fetch(url, opts)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return data.data;
      })
      .catch(function (reason) {
        console.error('fetch failed because: ', reason)
        return reason;
      });
  }
}
