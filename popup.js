document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#load_diff_btn').addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        var regexInputEl = document.querySelector('#files_to_ignore_regex');
        var openViewedFilesEl = document.querySelector('#open_viewed_files');

        chrome.storage.sync.set({
            "popupFormValue": {
                ignoreRegex: regexInputEl.value,
                openViewedFiles: openViewedFilesEl.checked
            }
        });
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            function: init,
        });
    });
})




function init() {
    var formValue;
    chrome.storage.sync.get("popupFormValue", function({
        popupFormValue
    }) {
        formValue = popupFormValue;
        scrollAndLoadDiff();
    });




    function loadDiff() {
        document.querySelectorAll('.hide-file-notes-toggle').forEach(el => {
            var filename = el.querySelector('[name="path"]').value;
            var customIgnoreRegex = new RegExp(formValue.ignoreRegex);
            if (customIgnoreRegex.test(filename)) {
                return;
            }
            el.querySelector('.load-diff-button').click()
        });


        if (formValue.openViewedFiles) {
            // load viewed files
            document.querySelectorAll('[data-file-user-viewed]:not(.open) .btn-octicon').forEach(el => {
                el.click()
            });
        }
    }

    function scrollAndLoadDiff() {
        var filesTotal = document.querySelector('#files_tab_counter').innerText;
        var actualItemsInPage = document.querySelectorAll('[data-details-container-group]').length;
        var needToScroll = actualItemsInPage < filesTotal;
        if (needToScroll) {
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(() => loadDiff(), 1000);
            setTimeout(() => scrollAndLoadDiff(), 2000);
        } else {
            setTimeout(() => loadDiff(), 1000);
        }
    }
}