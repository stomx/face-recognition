# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Removed empty useEffect hooks in HomePage (HIGH priority)
- Added division by zero guards in CoordinateTransformer (MEDIUM)
- Fixed unsafe type assertions in CreateUserStrategy (MEDIUM)

### Changed
- Optimized face detection loop with object caching (MEDIUM)
- Replaced console.log with debug utility for dev-only logging (MEDIUM)
- Enhanced deprecation notices with migration guide (LOW)
- Removed unused getter methods in CoordinateTransformer (LOW)

### Added
- Debug utility (`src/shared/lib/debug.ts`) for development-only logging
- Performance monitoring utilities (`src/shared/lib/performance.ts`)
- Type guards for face detection results validation
- Comprehensive error context in all error messages
