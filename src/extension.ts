import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
    ),

    vscode.commands.registerCommand(
      "search-in-open-files.searchGitChangedFiles",
      () => {
        searchInAllGitChangedFiles();
      }
    ),

    vscode.commands.registerCommand(
      "search-in-open-files.searchStagedFiles",
      () => {
        searchInStagedFiles();
      }
    ),

    vscode.commands.registerCommand(
      "search-in-open-files.searchUnstagedFiles",
      () => {
        searchInUnstagedFiles();
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

async function getGitFiles(gitCommand: string): Promise<string[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    vscode.window.showWarningMessage("No workspace folder open");
    return [];
  }

  try {
    const { stdout } = await execAsync(gitCommand, {
      cwd: workspaceFolder.uri.fsPath,
      maxBuffer: 10 * 1024 * 1024, // Handle large repos
    });

    return stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  } catch (error) {
    // Check if it's a "not a git repository" error
    if (error instanceof Error && error.message.includes("not a git repository")) {
      vscode.window.showWarningMessage("Current workspace is not a git repository");
    } else {
      vscode.window.showErrorMessage(`Git command failed: ${error}`);
    }
    return [];
  }
}

async function searchInGitFiles(files: string[], fileType: string) {
  if (files.length === 0) {
    vscode.window.showInformationMessage(`No ${fileType} files found`);
    return;
  }

  const filePattern = files.join(", ");

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

async function searchInAllGitChangedFiles() {
  // Get both modified files and untracked files
  const modifiedFiles = await getGitFiles("git diff --name-only HEAD");
  const untrackedFiles = await getGitFiles("git ls-files --others --exclude-standard");

  // Combine and deduplicate
  const allFiles = [...new Set([...modifiedFiles, ...untrackedFiles])];

  await searchInGitFiles(allFiles, "changed");
}

async function searchInStagedFiles() {
  const files = await getGitFiles("git diff --name-only --cached");
  await searchInGitFiles(files, "staged");
}

async function searchInUnstagedFiles() {
  const files = await getGitFiles("git diff --name-only");
  await searchInGitFiles(files, "unstaged");
}

export function deactivate() {}
