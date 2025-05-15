import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "search-in-open-files.searchOpenFiles",
      () => {
        searchInAllOpenFiles();
      }
    ),

    vscode.commands.registerCommand(
      "search-in-open-files.searchOpenFilesInActiveGroup",
      () => {
        searchInActiveEditorFiles();
      }
    )
  );
}

async function searchInAllOpenFiles() {
  const allOpenTabs = vscode.window.tabGroups.all
    .map((tabGroup) => tabGroup.tabs)
    .flat();

  await searchInTabs(allOpenTabs);
}

async function searchInActiveEditorFiles() {
  const activeTabGroup = vscode.window.tabGroups.activeTabGroup;
  const activeTabs = activeTabGroup.tabs;

  await searchInTabs(activeTabs);
}

async function searchInTabs(tabs: readonly vscode.Tab[]) {
  const tabFilenames = tabs
    .map((tab) => {
      if (tab.input instanceof vscode.TabInputText) {
        return vscode.workspace.asRelativePath(tab.input.uri);
      }

      return null;
    })
    .filter((filename): filename is string => filename !== null);

  const filePattern = tabFilenames.join(", ");

  try {
    await vscode.commands.executeCommand("workbench.action.findInFiles", {
      filesToInclude: filePattern,
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `an error occurred while opening search :(\n
	  please consider reporting this on GitHub: \n
	  https://github.com/f-person/vscode-search-in-open-files
	  ${error}`
    );
  }
}

export function deactivate() {}
