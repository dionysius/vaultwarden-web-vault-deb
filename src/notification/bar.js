require('./bar.scss');

document.addEventListener('DOMContentLoaded', () => {
    var i18n = {};
    var lang = window.navigator.language;

    i18n.appName = chrome.i18n.getMessage('appName');
    i18n.close = chrome.i18n.getMessage('close');
    i18n.yes = chrome.i18n.getMessage('yes');
    i18n.never = chrome.i18n.getMessage('never');
    i18n.folder = chrome.i18n.getMessage('folder');
    i18n.notificationAddSave = chrome.i18n.getMessage('notificationAddSave');
    i18n.notificationNeverSave = chrome.i18n.getMessage('notificationNeverSave');
    i18n.notificationAddDesc = chrome.i18n.getMessage('notificationAddDesc');
    i18n.notificationChangeSave = chrome.i18n.getMessage('notificationChangeSave');
    i18n.notificationChangeDesc = chrome.i18n.getMessage('notificationChangeDesc');
    lang = chrome.i18n.getUILanguage();

    const lockedImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAACXBIWXMAAAsTAAALEwEAmpwYAAALr2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDItMjRUMDQ6MzgtMDc6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTA1LTIyVDEzOjUyOjQwLTA2OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTA1LTIyVDEzOjUyOjQwLTA2OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNmOWFlM2NjLTE3ZjAtNDY1MC05MmExLTk2MTY0NjE4NmY4OSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmZmYmI3ODM1LWM1ZDItZWE0Yy05MTQ5LWViNTBmNmIwNDBjOCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY3NGZmNzMyLTMyYmQtNDg2OS1iNTg4LWYwNzk1OGZjY2U0ZSIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iMSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjM4IiBleGlmOlBpeGVsWURpbWVuc2lvbj0iMzgiPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDU0Mjg3MjAtMjc0NS1kZTRjLWE1MTMtZTY5ZTg1MzJjYmFkPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Njc0ZmY3MzItMzJiZC00ODY5LWI1ODgtZjA3OTU4ZmNjZTRlIiBzdEV2dDp3aGVuPSIyMDIwLTAyLTI0VDA0OjM4LTA3OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGltYWdlL3BuZyB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MGFmNDQzYi1iZWUzLTQwOGQtYjY2My04ZmVhMTNmMDJjZGUiIHN0RXZ0OndoZW49IjIwMjAtMDUtMTRUMjM6MzY6NTQtMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmZTY3NzRhNi05ZjZkLTQ3ZTMtODMwYS1kOWVjYzk4NmM5NGMiIHN0RXZ0OndoZW49IjIwMjAtMDUtMjJUMTM6NTI6NDAtMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozZjlhZTNjYy0xN2YwLTQ2NTAtOTJhMS05NjE2NDYxODZmODkiIHN0RXZ0OndoZW49IjIwMjAtMDUtMjJUMTM6NTI6NDAtMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpmZTY3NzRhNi05ZjZkLTQ3ZTMtODMwYS1kOWVjYzk4NmM5NGMiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpkNTQyODcyMC0yNzQ1LWRlNGMtYTUxMy1lNjllODUzMmNiYWQiIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NzRmZjczMi0zMmJkLTQ4NjktYjU4OC1mMDc5NThmY2NlNGUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7ege38AAAEQElEQVRYhe2YW2xURRjHfzNnd9vTXRe3tqblppQIEjEqRrCRSEATHyrBBuMDhMY0xgRfkAppYkI0REyMFB58ABNSnwRiCoQQkBgkCg2NCQSJGIMage260N1tj91Lt3s5Mz60bLnY7q2tPPBPTnLOzPf/5pczc+ZyxPKOU9xSMl65wgp724YTFY121qhlGmQ47HClO9Xjq43uMj3DP+bK577WglbC7A9WfxYKPPJlJuVcqJV0TwcUgFbSnUk5F0YHPG9rW3pNz/BZIcg6APp6a/bFLPe66YIZT1bY25bNGnV1j4XXy0TUbLofoG4pZrnXJaJmk2Mw4t04XtDXH9TzyjNVUwbx/aUh1nfcuKd8MOLdKIcTFY3jGacSaqL8w0OupdK2ZfWUtl6C7KxR65jMhN90xzh4NjZhzLIFlbSvzf8uJhXMH85y7rfkhDEzqmRBuQqL+h/0AKxYPQArVg/AitV9CzapE+x4kvHfcfkP4Bj4iTNnUszfDW7T5OWVK5Hx1SjPgukG07iuduLs3c9DCFZpwRN6pJP+GErxw8mTmOoEmTnrSM9rBcT0gLn+2osz0MVqLdmsJB4gMlr3loZNCnZLONa7H3SadMPYDmzKwAzrAs5AF2u1pF1JuoWmQ2r+RgEwRxpszsI2JXFJOBTowvYtxfY9D+QZ/JGoXTJY5bVO6hC0jUJtkTbBqtksW9POx9u3YzbMY4u06RaaNiWpQ1B5rTPnnxDs0tVUSVAibUHsCs1K4AR2SY2umkt8yV62bmplQ0sLh48do352Azulxgk0KwGxKyPefGDfXkiUBjZ8A9AsQtAPBFCkZq5h1bM+nmuoAMA0TWqefpMgigiwCAHoUW8esEPnYljx4rtTZP4BwAek0QC43W46WseOqlbc5ufrI/cZNL67vBMO/mRas/OIxY4NNYVTaYVhnR9p5Lbi2sgB2t4dO1z7wxlEKJJ7vhVrWOexq1/M/1V+dWqQ119w0/ikWRCXM3AQZ/Aoi7XAo8GFYIkWEPCTDfhzcTNHLxC4EHi0ZrEWXA4eRVfU5AdTGt75oo/jH83i8UedecHM0GmWa8HnysiV7b3tfnwJOpXBVmnTHTpd2FrZH7Np/jTItVAmb6xhJ6m/oxOLUz0Cw04WvojfGMjyxo4gv1yfeApxGKVD3a6idhc3rSxrPglyuCf+n/XNjR7qqydnMSl62zOUUry3p4+Ne/oYiN05lcyvc5bRiXeBGYYaKMV4pCfOS+29HDwTQ+tJoslJ2bLSneop1W7Fbd7fF+LVbb18dzFBxtYk0+VTCp1JOWbURPckomZTOYl+9adp2X0TAN9gtnywbGJQur3J456HE11lZxuVEgbpMvxpQNvphAOgbm6kpd9p+62wt61csJT3KU4kg8wSKrf+FSoLOCGUysA5cc/P4dCMrcl4xQqlpKcUMJHup+ryhxD/sxQ7Bly0oelfwo2jbs49CP4AAAAASUVORK5CYII=";
    // delay 50ms so that we get proper body dimensions
    setTimeout(load, 50);

    function load() {
        const isVaultLocked = getQueryVariable('isVaultLocked') == 'true';
        if (isVaultLocked) {
            document.getElementById('logo').src = lockedImage;
        }

        var closeButton = document.getElementById('close-button'),
            body = document.querySelector('body'),
            bodyRect = body.getBoundingClientRect();

        // i18n
        body.classList.add('lang-' + lang.slice(0, 2));

        document.getElementById('logo-link').title = i18n.appName;
        closeButton.title = i18n.close;
        closeButton.setAttribute('aria-label', i18n.close);

        if (bodyRect.width < 768) {
            document.querySelector('#template-add .add-save').textContent = i18n.yes;
            document.querySelector('#template-add .never-save').textContent = i18n.never;
            document.querySelector('#template-add .select-folder').style.display = 'none';
            document.querySelector('#template-change .change-save').textContent = i18n.yes;
        } else {
            document.querySelector('#template-add .add-save').textContent = i18n.notificationAddSave;
            document.querySelector('#template-add .never-save').textContent = i18n.notificationNeverSave;
            document.querySelector('#template-add .select-folder').style.display = isVaultLocked ? 'none' : 'initial';
            document.querySelector('#template-add .select-folder').setAttribute('aria-label', i18n.folder);
            document.querySelector('#template-change .change-save').textContent = i18n.notificationChangeSave;
        }

        document.querySelector('#template-add .add-text').textContent = i18n.notificationAddDesc;
        document.querySelector('#template-change .change-text').textContent = i18n.notificationChangeDesc;

        if (getQueryVariable('add')) {
            setContent(document.getElementById('template-add'));

            var addButton = document.querySelector('#template-add-clone .add-save'),
                neverButton = document.querySelector('#template-add-clone .never-save');

            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                const folderId = document.querySelector('#template-add-clone .select-folder').value;
                sendPlatformMessage({
                    command: 'bgAddSave',
                    folder: folderId,
                });
            });

            neverButton.addEventListener('click', (e) => {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'bgNeverSave'
                });
            });

            if (!isVaultLocked) {
                const responseFoldersCommand = 'notificationBarGetFoldersList';
                chrome.runtime.onMessage.addListener((msg) => {
                    if (msg.command === responseFoldersCommand && msg.data) {
                        fillSelectorWithFolders(msg.data.folders);
                    }
                });
                sendPlatformMessage({
                    command: 'bgGetDataForTab',
                    responseCommand: responseFoldersCommand
                });
            }
        } else if (getQueryVariable('change')) {
            setContent(document.getElementById('template-change'));
            var changeButton = document.querySelector('#template-change-clone .change-save');
            changeButton.addEventListener('click', (e) => {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'bgChangeSave'
                });
            });
        } else if (getQueryVariable('info')) {
            setContent(document.getElementById('template-alert'));
            document.getElementById('template-alert-clone').textContent = getQueryVariable('info');
        }

        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            sendPlatformMessage({
                command: 'bgCloseNotificationBar'
            });
        });

        sendPlatformMessage({
            command: 'bgAdjustNotificationBar',
            data: {
                height: body.scrollHeight
            }
        });
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) {
                return pair[1];
            }
        }

        return null;
    }

    function setContent(element) {
        const content = document.getElementById('content');
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        var newElement = element.cloneNode(true);
        newElement.id = newElement.id + '-clone';
        content.appendChild(newElement);
    }

    function sendPlatformMessage(msg) {
        chrome.runtime.sendMessage(msg);
    }

    function fillSelectorWithFolders(folders) {
        const select = document.querySelector('#template-add-clone .select-folder');
        select.appendChild(new Option(chrome.i18n.getMessage('selectFolder'), null, true));
        folders.forEach((folder) => {
            //Select "No Folder" (id=null) folder by default
            select.appendChild(new Option(folder.name, folder.id || '', false));
        });
    }
});
