// ==UserScript==
// @name         Bitbucket Server Blocked Pull Requests
// @namespace    https://github.com/kellyselden
// @version      1
// @description  Show which pull requests are blocked without opening them
// @updateURL    https://raw.githubusercontent.com/kellyselden/bitbucket-server-blocked-pull-requests/main/meta.js
// @downloadURL  https://raw.githubusercontent.com/kellyselden/bitbucket-server-blocked-pull-requests/main/user.js
// @author       Kelly Selden
// @license      MIT
// @supportURL   https://github.com/kellyselden/bitbucket-server-blocked-pull-requests
// @match        http*://*bitbucket*/dashboard
// ==/UserScript==
'use strict';

(async function() {
  async function getMergeBlockersCount(url) {
    let { project, repo, id } = url.match(/\/projects\/(?<project>\w+)\/repos\/(?<repo>\S+)\/pull-requests\/(?<id>\d+)\/overview/).groups;

    let response = await fetch(`/rest/ui/latest/projects/${project}/repos/${repo}/pull-requests/${id}/merge`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let data = await response.json();

    return data.vetoes.length;
  }

  function createElement(pr, mergeBlockersCount) {
    let div = document.createElement('div');

    let icon = document.createElement('span');

    icon.textContent = mergeBlockersCount ? '⚠️' : '🟢';

    div.appendChild(icon);

    let text = document.createElement('span');

    text.textContent = mergeBlockersCount;

    div.appendChild(text);

    let stateColumn = pr.querySelector('.state-column');

    let mergeBlockersColumn = document.createElement('td');

    mergeBlockersColumn.appendChild(div);

    pr.insertBefore(mergeBlockersColumn, stateColumn);
  }

  let prs = document.querySelectorAll(':is(.reviewing-pull-requests, .created-pull-requests) .pull-request-row');

  for (let pr of prs) {
    let a = pr.querySelector('.summary-column .title > a[href]');

    let url = a.getAttribute('href');

    let mergeBlockersCount = await getMergeBlockersCount(url);

    createElement(pr, mergeBlockersCount);
  }
})();
