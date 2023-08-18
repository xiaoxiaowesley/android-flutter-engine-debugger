//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const RET_CODE_ANDROID_HOME_NOT_FOUND = -1;
    const REC_CODE_PACKAGE_NOT_FOUND = -2;
    const RET_CODE_INPROGRESS = 0;
    const RET_CODE_SUCCESS = 1;
    const REC_CODE_LACK_OF_SRC_PATH_PARAMETER = -3;
    const REC_CODE_LACK_OF_ENGINE_PARAMETER = -4;
    const REC_CODE_LACK_OF_PACKAGE_PARAMETER = -5;

    document.getElementById('local-engine-input')?.addEventListener('change', function (event) {
        // @ts-ignore
        const value = event.target?.value;
        vscode.postMessage({ type: 'updateLocalEngine', value: value });

    });

    document.getElementById('local-engine-src-path-input')?.addEventListener('change', function (event) {
        // @ts-ignore
        const value = event.target?.value;
        vscode.postMessage({ type: 'updateLocalEngineSrcPath', value: value });

    });

    document.getElementById('package-name-input')?.addEventListener('change', function (event) {
        // @ts-ignore
        const value = event.target?.value;
        vscode.postMessage({ type: 'updatePackageName', value: value });
        
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
                    const status = document.getElementById('status');
                    if (status) {
                        status.innerHTML = `${step} ${log}`;
                        status.style.backgroundColor = "black";
                        if (code === RET_CODE_SUCCESS) {
                            status.style.color = "green";
                        } else if (code === RET_CODE_INPROGRESS) {
                            status.style.color = "white";
                        } else if (code === RET_CODE_ANDROID_HOME_NOT_FOUND) {
                            status.style.color = "red";
                        } else if (code === REC_CODE_PACKAGE_NOT_FOUND) {
                            status.style.color = "red";
                        } else if (code === REC_CODE_LACK_OF_SRC_PATH_PARAMETER) {
                            status.style.color = "orange";
                            const src_p = document.getElementById('local-engine-src-path-p');
                            if (src_p) {
                                src_p.innerHTML = `<b>${log}</b> `;
                                src_p.style.color = "orange";
                            }
                            // @ts-ignore
                            document.getElementById('local-engine-p').innerHTML = "";
                            // @ts-ignore
                            document.getElementById('package-name-p').innerHTML = "";

                        } else if (code == REC_CODE_LACK_OF_ENGINE_PARAMETER) {
                            status.style.color = "orange";
                            const p = document.getElementById('local-engine-p');
                            if (p) {
                                p.innerHTML = `<b>${log}</b> `;
                                p.style.color = "orange";
                            }
                            // @ts-ignore
                            document.getElementById('local-engine-src-path-p').innerHTML = "";
                            // @ts-ignore
                            document.getElementById('package-name-p').innerHTML = "";
                        } else if (code == REC_CODE_LACK_OF_PACKAGE_PARAMETER) {
                            status.style.color = "orange";
                            const p = document.getElementById('package-name-p');
                            if (p) {
                                p.innerHTML = `<b>${log}</b> `;
                                p.style.color = "orange";
                            }
                            // @ts-ignore
                            document.getElementById('local-engine-src-path-p').innerHTML = "";
                            // @ts-ignore
                            document.getElementById('local-engine-p').innerHTML = "";
                        }
                    }
                    break;
                }

        }
    });

}());


