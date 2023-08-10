# Changelog

## 0.4.1
- Fixed bug where `Uncaught ReferenceError: global is not defined` was thrown when including the project in areas where `global` was not defined or provided by bundling tool.