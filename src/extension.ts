// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { execSync, exec } from 'child_process';
import {os} from 'os';
const RET_CODE_ANDROID_HOME_NOT_FOUND = -1;
const REC_CODE_PACKAGE_NOT_FOUND = -2;
const RET_CODE_INPROGRESS = 0;
const RET_CODE_SUCCESS = 1;
const REC_CODE_LACK_OF_SRC_PATH_PARAMETER = -3;
const REC_CODE_LACK_OF_ENGINE_PARAMETER = -4;
const REC_CODE_LACK_OF_PACKAGE_PARAMETER = -5;


// get the pid of the package
function getPackagePid(adbPath: String, packageName: String) {
	try {
		const psOutput = execSync(`${adbPath} shell pidof ${packageName}`).toString().trim();
		return parseInt(psOutput);
	} catch (error) {
		return NaN;
	}
}

// get the ANDROID_HOME environment
function getAndroidHome() {
	const androidHome = process.env.ANDROID_HOME;
	console.log(process.env)
	const { ANDROID_HOME } = process.env;
	console.log(ANDROID_HOME)
	if (!androidHome) {
		return null
	}
	return androidHome;
}

function startGenrateLaunchJson(local_engine_src_path: String, local_engine: String, package_name: String, messageSender: Function) {

	// Step[1/11]  Get the ANDROID_HOME environment
	const androidHome = getAndroidHome();
	if (!androidHome || androidHome.length == 0) {
		const msg = 'ANDROID_HOME is empty. Please set the ANDROID_HOME environment variable'
		return { ret: RET_CODE_ANDROID_HOME_NOT_FOUND, msg: msg };
	}
	messageSender('Step[1/11]', 'Get the ANDROID_HOME environment: ' + androidHome)

	// Step[2/11]  Get the adb path
	const adbPath = `${androidHome}/platform-tools/adb`;
	const lldbServerLocalPath = `${androidHome}/lldb/lldb-server`;
	// Step[3/11]  Get the pid of the package (package_name)
	const applicationPid = getPackagePid(adbPath, package_name);
	if (!applicationPid) {
		const msg = 'The application is not running. Please run the application (' + package_name + ') first'
		return { ret: REC_CODE_PACKAGE_NOT_FOUND, msg: msg };
	}
	messageSender('Step[2/11]', 'Get the pid of the package (package_name): ' + applicationPid)

	// Step[4/11]  Push lldb-server to the device
	const LLDB_SERVER_DEVICE_TMP_PATH = '/data/local/tmp/lldb-server'
	const pushCmd = `${adbPath} push ${lldbServerLocalPath} ${LLDB_SERVER_DEVICE_TMP_PATH}`;
	execSync(pushCmd);
	messageSender('Step[3/11]', 'Push lldb-server to the device: ' + pushCmd)

	// Step[5/11]  Copy lldb-server to the application data directory
	const lldbServerDevicePath = `/data/data/${package_name}/lldb-server`;
	const cpCmd = `${adbPath} shell run-as ${package_name} cp -F ${LLDB_SERVER_DEVICE_TMP_PATH} ${lldbServerDevicePath}`
	execSync(cpCmd);
	messageSender('Step[4/11]', 'Copy lldb-server to the application data directory: ' + cpCmd)

	// Step[6/11]  Set the permission of lldb-server
	const chmodCmd = `${adbPath} shell run-as ${package_name} chmod a+x ${lldbServerDevicePath}`
	execSync(chmodCmd);
	messageSender('Step[5/11]', 'Set the permission of lldb-server: ' + chmodCmd)

	// Step[7/11]  Kill the lldb-server
	try {
		const killCmd = `${adbPath} shell run-as ${package_name} killall lldb-server`
		exec(killCmd);
		messageSender('Step[7/11]', 'Kill the lldb-server: ' + killCmd)
	} catch (error) {
		console.log(error);
	}

	// Step[8/11]  Start the lldb-server
	// The use of try to wrap it here is not to catch exceptions, but to prevent exceptions from causing subsequent codes to fail to execute
	try {
		var server_cmd = `${adbPath} shell run-as ${package_name} sh -c \\\'/data/data/${package_name}/lldb-server platform --server --listen unix-abstract:///data/data/${package_name}/debug.socket\\\'`
		exec(server_cmd)
		messageSender('Step[8/11]', 'Start the lldb-server: ' + server_cmd)
	} catch (error: any) {
		console.log(error.message);
	}

	const vscodeConfig = `
	{
		"version": "0.2.0",
		"configurations": [
		{
			"name": "remote_lldb",
			"type": "lldb",
			"request": "attach",
			"pid": "${applicationPid}",
			"initCommands": [
			"platform select remote-android",
			"platform connect unix-abstract-connect:///data/data/${package_name}/debug.socket"
			],
			"postRunCommands": [
			"add-dsym ${local_engine_src_path}/out/${local_engine}/libflutter.so",
			"settings set target.source-map ${local_engine_src_path} ${local_engine_src_path}"
			],
		}
		]
	}`;
	// Step[9/11]  Write to ${vscode.workspace.rootPath}/.vscode/launch.json
	if (vscode.workspace.rootPath && vscode.workspace.rootPath.length > 0) {
		execSync(`mkdir -p ${vscode.workspace.rootPath}/.vscode`);
	}
	const launchJsonPath = `${vscode.workspace.rootPath}/.vscode/launch.json`;
	execSync(`echo '${vscodeConfig}' > ${launchJsonPath}`);
	messageSender('Step[9/11]', `Write to ${vscode.workspace.rootPath}/.vscode/launch.json`)

	// Step[10/11]  Copy compile_commands.json to ${vscode.workspace.rootPath}/compile_commands.json
	const compileCommandsPath = `${local_engine_src_path}/out/${local_engine}/compile_commands.json`;
	const compileCommandsPathInWorkspace = `${vscode.workspace.rootPath}/compile_commands.json`;
	if (vscode.workspace.rootPath && vscode.workspace.rootPath.length > 0) {
		execSync(`rm -f ${compileCommandsPathInWorkspace}`);
	}
	messageSender('Step[10/11]', `Copy ${compileCommandsPath} to ${vscode.workspace.rootPath}/compile_commands.json`)

	// Step[11/11]  Copy compile_commands.json to ${vscode.workspace.rootPath}/compile_commands.json
	console.log(`Copy ${compileCommandsPath} to ${vscode.workspace.rootPath}/compile_commands.json`);
	execSync(`cp ${compileCommandsPath} ${vscode.workspace.rootPath}`);
	messageSender('Step[11/11]', `Copy ${compileCommandsPath} to ${vscode.workspace.rootPath}/compile_commands.json`)
	return { ret: RET_CODE_SUCCESS, msg: 'You can use press <b style="color:yellow">F5</b> to debug!!' };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flutter-engine-android-debugger" is now active!');

	const provider = new DebuggerViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(DebuggerViewProvider.viewType, provider, { webviewOptions: { retainContextWhenHidden: true } }));
}


class DebuggerViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'flutter-engine-android-debugger';

	private _view?: vscode.WebviewView;

	private _localEngineSrcPath?: String;
	private _localEngine?: String;
	private _packageName?: String;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'updateLocalEngineSrcPath': {
					this._localEngineSrcPath = data.value.trim();
					break;
				}
				case 'updateLocalEngine': {
					this._localEngine = data.value.trim();
					break;
				}
				case 'updatePackageName': {
					this._packageName = data.value.trim();
					break;
				}
				case 'startGenerateLaunchJson': {
					if (!this._localEngineSrcPath) {
						this.sendStepMessage(REC_CODE_LACK_OF_SRC_PATH_PARAMETER, 'Fail', 'Plasese enter the src path');
						return;
					}
					if (!this._localEngine) {
						this.sendStepMessage(REC_CODE_LACK_OF_ENGINE_PARAMETER, 'Fail', 'Plasese enter the local engine of the engine');
						return;
					}
					if (!this._packageName) {
						this.sendStepMessage(REC_CODE_LACK_OF_PACKAGE_PARAMETER, 'Fail', 'Plasese enter the package name of the application');
						return;
					}

					const ret = startGenrateLaunchJson(this._localEngineSrcPath!, this._localEngine!, this._packageName!, (step: string, log: string) =>
						this.sendStepMessage(RET_CODE_INPROGRESS, step, log));

					if (ret) {
						if (ret.ret == RET_CODE_SUCCESS) {
							this.sendStepMessage(RET_CODE_SUCCESS, 'Complete!', ret.msg);
						} else {
							this.sendStepMessage(ret.ret, 'Fail!', ret.msg);
						}
					}
					break;
				}

			}
		});
	}

	public sendStepMessage(code: number, step: string, log: string) {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'stepMessage', value: { 'code': code, 'step': step, 'log': log } });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Flutter engine Android Debugger</title>
			</head>
			<body>
				<div>
					<h3>local engine src path</h3>
					<input type='text' id='local-engine-src-path-input' placeholder='e.g. /User/xxx/src' />
					<p id="local-engine-src-path-p"></p>
					<h3>local engine</h3>
					<input type='text' id='local-engine-input' placeholder='e.g. android_debug_unopt_arm64' />
					<p id="local-engine-p"></p>
					<h3>package name</h3>
					<p id="package-name-p"></p>
					<input type='text' id='package-name-input'placeholder='e.g. com.example.myapp' />
					<br>					
					<button id="generate-button">Start</button>
					<div id="status" class="status-info"></div>					
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
