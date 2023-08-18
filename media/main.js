//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const RET_CODE_ANDROID_HOME_NOT_FOUND = -1;
    const REC_CODE_PACKAGE_NOT_FOUND = -2;
    const RET_CODE_INPROGRESS = 0;
    const RET_CODE_SUCCESS = 1;
    const REC_CODE_LACK_OF_PARAMETER = -3;

    const oldState = vscode.getState() || { colors: [] };

    /** @type {Array<{ value: string }>} */
    let colors = oldState.colors;

    document.getElementById('local-engine-input')?.addEventListener('change', function (event) {
        const p = document.getElementById('local-engine-p');
        if (p) {
            // @ts-ignore
            const value = event.target?.value;
            p.innerHTML = `<b>local engine:</b> ${value}`;
            vscode.postMessage({ type: 'updateLocalEngine', value: value });
        }
    });

    document.getElementById('local-engine-src-path-input')?.addEventListener('change', function (event) {
        const p = document.getElementById('local-engine-src-path-p');
        if (p) {
            // @ts-ignore
            const value = event.target?.value;
            p.innerHTML = `<b>local engine src path:</b> ${value}`;
            vscode.postMessage({ type: 'updateLocalEngineSrcPath', value: value });
        }
    });

    document.getElementById('package-name-input')?.addEventListener('change', function (event) {
        const p = document.getElementById('package-name-p');
        if (p) {
            // @ts-ignore
            const value = event.target?.value;
            p.innerHTML = `<b>package name:</b>${value}`;
            vscode.postMessage({ type: 'updatePackageName', value: value });
        }
    });

    document.getElementById('generate-button')?.addEventListener('click', () => {
        vscode.postMessage({ type: 'startGenerateLaunchJson', value: {} });
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'stepMessage':
                {
                    const { code, step, log } = message.value;
                    const p = document.getElementById('status');
                    if (p) {
                        p.innerHTML = `${step} ${log}`;
                        p.style.backgroundColor = "black";
                        if (code === RET_CODE_SUCCESS) {
                            p.style.color = "green";
                        } else if (code === RET_CODE_INPROGRESS) {
                            p.style.color = "white";
                        } else if (code === RET_CODE_ANDROID_HOME_NOT_FOUND) {
                            p.style.color = "red";
                        } else if (code === REC_CODE_PACKAGE_NOT_FOUND) {
                            p.style.color = "red";
                        } else if (code === REC_CODE_LACK_OF_PARAMETER) {
                            p.style.color = "orange";
                        }
                    }

                    break;
                }

        }
    });

}());


