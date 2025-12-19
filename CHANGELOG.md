# Change Log

All notable changes to the "search-in-open-files" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Added
- Search in all files with git changes (modified, staged, unstaged, and untracked files)
  - Command: `Search: Find in all Files with Git Changes`
  - Keybinding: `Ctrl+Shift+Alt+G` (Windows/Linux) / `Cmd+Shift+Alt+G` (Mac)
- Search in staged files only
  - Command: `Search: Find in Staged Files`
  - Keybinding: `Ctrl+Shift+Alt+S` (Windows/Linux) / `Cmd+Shift+Alt+S` (Mac)
- Search in unstaged files only
  - Command: `Search: Find in Unstaged Files`
  - Keybinding: `Ctrl+Shift+Alt+U` (Windows/Linux) / `Cmd+Shift+Alt+U` (Mac)

## [1.0.1] - 2024-12-19

### Fixed
- Keybinding command

### Changed
- Added missing metadata info

## [1.0.0] - 2024-12-19

### Added
- Initial release
- Search in all open files
  - Command: `Search: Find in all Open Files`
  - Keybinding: `Ctrl+Shift+G` (Windows/Linux) / `Cmd+Shift+G` (Mac)
- Search in files of the active tab group
  - Command: `Search: Find in Files of the Active Tab Group`