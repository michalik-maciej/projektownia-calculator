# Changelog

## [1.1.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.0.0...v1.1.0) (2026-10-01)


### Features

* add run options section with back variant and base cover ([fe73e94](https://github.com/michalik-maciej/projektownia-calculator/commit/fe73e94cf09144cba3a8f577997421b572ab94cc))
* allow arbitrary dimensions in the inventory item form ([dcc7dad](https://github.com/michalik-maciej/projektownia-calculator/commit/dcc7dadc1f747d66aaaa9b22b7aa81c82aa796e9))
* close registration and add security headers ([7267357](https://github.com/michalik-maciej/projektownia-calculator/commit/7267357b6801f19d5a3d30e940efaac06130776b))
* let visitors try the app as a read-only demo role ([b20ac45](https://github.com/michalik-maciej/projektownia-calculator/commit/b20ac45e538217be1b8f2aa2b59cc721f233898f))
* navigate units and shelves inside the editor ([769367f](https://github.com/michalik-maciej/projektownia-calculator/commit/769367f63974faa502b3d9d8f8b9ee5b4b7817ab))
* open the demo account's example offer immediately on login ([9d27f11](https://github.com/michalik-maciej/projektownia-calculator/commit/9d27f1130f912170d2640d7bb484be422b93409c))
* rate limit failed login attempts ([c4b2dbd](https://github.com/michalik-maciej/projektownia-calculator/commit/c4b2dbd36d25b2010437de4924cd176229e45453))
* report an offer that is missing or not yours ([944cde8](https://github.com/michalik-maciej/projektownia-calculator/commit/944cde8e0c2ca95d77e87e15f59ae423cc93c091))
* scope offers to the user who created them ([0c38675](https://github.com/michalik-maciej/projektownia-calculator/commit/0c3867531bd828f84220c187c051236c0c82f0ec))
* seed a demo account behind an explicit switch ([f31ef0e](https://github.com/michalik-maciej/projektownia-calculator/commit/f31ef0ea7f39dcec357142b6b7a9d32a8689d507))
* seed a priced example offer into every fresh demo account ([493c440](https://github.com/michalik-maciej/projektownia-calculator/commit/493c440d611fc061117a4ff055c37249bedce76b))
* validate the environment before the API starts ([536a83d](https://github.com/michalik-maciej/projektownia-calculator/commit/536a83d18f152dc3f74651cf4b48439125f90956))


### Bug Fixes

* accept unknown in RouteError and stop auto-proposing major bumps ([f9b6401](https://github.com/michalik-maciej/projektownia-calculator/commit/f9b64015b2297e1ca8b8fd06d0c9091cc2c77d14))
* answer with JSON when the storage behind an endpoint fails ([40db9cf](https://github.com/michalik-maciej/projektownia-calculator/commit/40db9cf897d6ef8ea2d12c0208233eea123985ea))
* build shared packages before the apps that reference them ([665b6d3](https://github.com/michalik-maciej/projektownia-calculator/commit/665b6d33223eeda938c6b696f3400ae85361b04a))
* do not parse a 204 response as JSON ([32fc799](https://github.com/michalik-maciej/projektownia-calculator/commit/32fc7992fe4e2abe74f1ad66f07167f064dd2d75))
* give every demo session its own account ([d475c4c](https://github.com/michalik-maciej/projektownia-calculator/commit/d475c4c83783f3522c5614033a52123dd0a550c0))
* import the order route's components relatively ([dc0e046](https://github.com/michalik-maciej/projektownia-calculator/commit/dc0e04616380ee50621ac84ec2f3269a701b2228))
* read the offer id from the correct route param ([adcfbf9](https://github.com/michalik-maciej/projektownia-calculator/commit/adcfbf9371548c47ed9f2a8ee691d31989f78ccc))
* remove dead drawer component ([af2e559](https://github.com/michalik-maciej/projektownia-calculator/commit/af2e559aa656be215f4d43042063ace60d7fbed1))
* set the auth test's own JWT_SECRET instead of borrowing .env ([834947b](https://github.com/michalik-maciej/projektownia-calculator/commit/834947b4162c086513585866173112f432f60e8d))
* stop production devtools and auth-check retries on 401 ([8be2983](https://github.com/michalik-maciej/projektownia-calculator/commit/8be298390007cb2cede0a484aecdd92462dbe80c))
* submit the login form once and validate it in the browser ([f96c9b9](https://github.com/michalik-maciej/projektownia-calculator/commit/f96c9b96c2c4abcc6b7f7273f3b4e310a4778c8f))
