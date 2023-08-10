# Changelog

## 0.5.0
- Added `CapsuleConfig` as 3rd parameter to `Capsule` constructor
- `Date` objects can now be retrieved as a `Date` instead of a `string`, by passing `hydrateDates: true` in the config 

## 0.4.1
- Fixed bug where `Uncaught ReferenceError: global is not defined` was thrown when including the project in areas where `global` was not defined or provided by bundling tool.