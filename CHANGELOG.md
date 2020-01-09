# Change Log

All notable changes to this project will be documented in this file.

## v.0.1.0-alpha

- Implemented timeout logic to event subscriptions + tests
- Moved http2 headers stripping logic to a middleware
- Implemented retry policy
- Worked on error handling (Still lots to do)
- Implemented multiple upstreams logic
- Included original response headers to Cached responses
- Added `matchHeader` attribute to proxy Config
- Worked on queueing system (Redis)
- Started versioning

## v.0.1.0-alpha2
- Implemented Queue strategies (Ref)
- Implemented in memory queue strategy
- Merged `feat/queue` && `feat/env-automation` branches to master
- Deprecated `Queue.enabled` Configuration. The in memory queue us always enabled by default

## Issues
### It can serve cached responses to requests with invalid or expired authorization headers