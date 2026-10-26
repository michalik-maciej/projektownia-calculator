# Changelog

## [1.7.1](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.7.0...v1.7.1) (2026-10-26)


### Bug Fixes

* count gondola end caps once per gondola ([76410db](https://github.com/michalik-maciej/projektownia-calculator/commit/76410db42488cd3c6a9f5679da2e9fdfd2177be2))

## [1.7.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.6.0...v1.7.0) (2026-10-26)


### Features

* show catalogue and discounted line prices in the breakdown, hidden in print ([264714a](https://github.com/michalik-maciej/projektownia-calculator/commit/264714a7c9eca5db75e807fae9d73cfb63df0b7c))

## [1.6.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.5.0...v1.6.0) (2026-10-25)


### Features

* add and edit impulse layouts in the configurator ([03a3b66](https://github.com/michalik-maciej/projektownia-calculator/commit/03a3b664ab482abd425c4f986179bf0f1400e094))
* add shelf stops for a share of shelves ([07e9cd2](https://github.com/michalik-maciej/projektownia-calculator/commit/07e9cd2db7da223767c9185511fa35c974ba8bb4))
* import impulse runs from a PDF drawing ([731f866](https://github.com/michalik-maciej/projektownia-calculator/commit/731f8663fd1cc75300c4b9b2243430c9c3b0c494))
* price impulse layouts with shared legs and bent supports ([801356e](https://github.com/michalik-maciej/projektownia-calculator/commit/801356e693deca896d9a7e8a73074a381e6914fb))


### Bug Fixes

* sync seed catalogue with dev and fit impulse back shelves to back depth ([84a7452](https://github.com/michalik-maciej/projektownia-calculator/commit/84a745224802766512fac0d3596d83a9f1476750))

## [1.5.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.4.0...v1.5.0) (2026-10-23)


### Features

* add pdf import guide ([a41cae6](https://github.com/michalik-maciej/projektownia-calculator/commit/a41cae6bf20caac40d1c19361f8d813465c5f6bc))
* import wall runs and gondolas from a PDF drawing ([c046d87](https://github.com/michalik-maciej/projektownia-calculator/commit/c046d872dcd232762cf0278d476e52b723ba40d5))


### Bug Fixes

* harden pdf import against empty paths, repeated run numbers and untyped files ([44eae29](https://github.com/michalik-maciej/projektownia-calculator/commit/44eae29a766f77a6b1638840f118d438a527d578))
* sort components by size, misc by name, in catalogue and breakdown ([e24c1b0](https://github.com/michalik-maciej/projektownia-calculator/commit/e24c1b09e171702e87ff3f6372fcec1fe5a7db09))

## [1.4.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.3.0...v1.4.0) (2026-10-22)


### Features

* add an offer sharing dialog for admins ([1e636ce](https://github.com/michalik-maciej/projektownia-calculator/commit/1e636ce9776219c4db33473b8c7fbe3aeae51e71))
* add offer settings with price strip and metal colours ([7c4be58](https://github.com/michalik-maciej/projektownia-calculator/commit/7c4be584bacedccd30a1b936b06f2fd32b0aa5f9))
* add share and delete actions to the saved offers list ([531dd1b](https://github.com/michalik-maciej/projektownia-calculator/commit/531dd1bd6f36a46778c714ff4932bead7f069a20))
* let an admin share offers with chosen users ([a4b51ff](https://github.com/michalik-maciej/projektownia-calculator/commit/a4b51fff9ea2949c1349aa5fe641704d987e66c2))
* refuse offer saves based on an outdated version ([c969da7](https://github.com/michalik-maciej/projektownia-calculator/commit/c969da7c8725ff33df1c61dbb37dff10ab7a9f8a))
* show catalogue parts read only to accounts other than admin ([867e3b0](https://github.com/michalik-maciej/projektownia-calculator/commit/867e3b04b6a3602e8e2bc718ff49194f02a033f0))
* show the offer author in the admin offer list ([126b5fe](https://github.com/michalik-maciej/projektownia-calculator/commit/126b5fedb482caeb5a91eeb4c3b97f73e0cd0b98))
* start new gondolas with an end cap on both ends ([07c66b6](https://github.com/michalik-maciej/projektownia-calculator/commit/07c66b67bf53f970d0c5a3713d55b08052904105))
* track when an offer was last updated ([8f818bc](https://github.com/michalik-maciej/projektownia-calculator/commit/8f818bc2b659ff1708334ee6ccc469b347de244a))


### Bug Fixes

* answer database errors in offer controllers with a JSON 500 ([ec03311](https://github.com/michalik-maciej/projektownia-calculator/commit/ec03311e9eef1af23c2bdfcad9effb0d02836948))
* pass the API environment through Turbo to the dev task ([b6e9ce9](https://github.com/michalik-maciej/projektownia-calculator/commit/b6e9ce919f930767ebae0f628423994bdd6415cf))
* share top covers between gondola sides ([0a2676c](https://github.com/michalik-maciej/projektownia-calculator/commit/0a2676cf5ee32c40adac14733b5ae9068bf392db))
* skip seeding the catalogue when it already has components ([d04fd99](https://github.com/michalik-maciej/projektownia-calculator/commit/d04fd998da2fc3348f7e59357a0dad7321ace76e))
* validate the accounts an offer is shared with ([70787b4](https://github.com/michalik-maciej/projektownia-calculator/commit/70787b4472ace6446a0411ac6d25e165b246ca73))
* wait for a running autosave before sending the next one ([f54143c](https://github.com/michalik-maciej/projektownia-calculator/commit/f54143c6fbfc8d17292bd281830c43fd9fdee398))


### Performance Improvements

* poll the open offer only on the routes that show it ([ca9e4a1](https://github.com/michalik-maciej/projektownia-calculator/commit/ca9e4a1e358ba9314b90a725bef0d2c677e52cea))

## [1.3.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.2.1...v1.3.0) (2026-10-21)


### Features

* add price strips ([f060728](https://github.com/michalik-maciej/projektownia-calculator/commit/f0607287bfb0e049a28aa3d5b186bc0fd29498b0))
* add top covers as a run option ([7832d54](https://github.com/michalik-maciej/projektownia-calculator/commit/7832d544ba7535e56762f6bd9d14bf69efe6c09e))
* link the top bar logo ([fbb9d63](https://github.com/michalik-maciej/projektownia-calculator/commit/fbb9d636145edbc90a58e4b1a3c199b64c9527ad))
* restrict catalogue editing to admins ([572ee0b](https://github.com/michalik-maciej/projektownia-calculator/commit/572ee0b21e6e5e22c41c4792cd70c92d1ea293fe))


### Bug Fixes

* describe a gondola by one side instead of summing both ([72b861a](https://github.com/michalik-maciej/projektownia-calculator/commit/72b861a250eb7cee8e1a7d6d5f067a71d9e8894c))
* use Tailwind v4 variable syntax in select dropdown classes ([b886568](https://github.com/michalik-maciej/projektownia-calculator/commit/b88656871a2cbce06cfcb0fc9043431d7b9308ca))

## [1.2.1](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.2.0...v1.2.1) (2026-10-21)


### Miscellaneous Chores

* release 1.2.1 ([1c98d07](https://github.com/michalik-maciej/projektownia-calculator/commit/1c98d076bb5a11cfb740730257010f58457cd951))

## [1.2.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.1.0...v1.2.0) (2026-10-21)


### Features

* add a user menu with role, user management and logout ([e9384ed](https://github.com/michalik-maciej/projektownia-calculator/commit/e9384ed0eade026cf2087e4d9f4f3aae7bd5ce2f))
* default new offers to a 44% discount ([de45dfe](https://github.com/michalik-maciej/projektownia-calculator/commit/de45dfe4e53492453bc1cee18a71c0e152bb206f))
* order part groups ([5ec5bc7](https://github.com/michalik-maciej/projektownia-calculator/commit/5ec5bc7163a185cf7355bfb59e011a5d081f5884))
* price offers at current catalogue prices when opened ([4d2b517](https://github.com/michalik-maciej/projektownia-calculator/commit/4d2b5174737a764f8dbcff6e182b15668e2e55d5))
* rotate end cap labels to face the gondola centre ([3e25507](https://github.com/michalik-maciej/projektownia-calculator/commit/3e255074d1152c5fcf5cc5267f92b058cd9e4105))
* show catalogue prices with two decimal places ([406ead3](https://github.com/michalik-maciej/projektownia-calculator/commit/406ead3adb23c439e3f3617064f8b58d1c96044e))
* start new runs at 210 cm high and 47 cm deep with six shelves ([42ce023](https://github.com/michalik-maciej/projektownia-calculator/commit/42ce0230f5932cae0b0c4e41e11130b7381b853b))


### Bug Fixes

* keep password manager icons out of catalogue fields ([972fee2](https://github.com/michalik-maciej/projektownia-calculator/commit/972fee268916f5ffde7e6d7870f8109a71382bbe))
* show parts added to an open catalogue section ([a220758](https://github.com/michalik-maciej/projektownia-calculator/commit/a220758fe7b75f5382477106f38c84e1e433e7bd))
* trigger dialog and accordion animations on Radix state attributes ([b6d8f5f](https://github.com/michalik-maciej/projektownia-calculator/commit/b6d8f5fdefc7dc990e6562e7642234459df5a97a))

## [1.1.0](https://github.com/michalik-maciej/projektownia-calculator/compare/v1.0.0...v1.1.0) (2026-10-17)


### Features

* add inline price editing ([8b97824](https://github.com/michalik-maciej/projektownia-calculator/commit/8b97824e48a5cab2870a8b6d401c24a728ea3895))
* add runs from a slot at the end of the plan ([ad5afaa](https://github.com/michalik-maciej/projektownia-calculator/commit/ad5afaaf3e7a8bfc651c5ad0a482a532bd38179e))
* apply light industrial theme tokens and drop dark mode ([8adc4c7](https://github.com/michalik-maciej/projektownia-calculator/commit/8adc4c76cc2ef5b626cb32ee535978c08d167999))
* check base cover by default ([6576220](https://github.com/michalik-maciej/projektownia-calculator/commit/65762200fde9f90af7b39a5cb1770832f4b576ef))
* describe a gondola by its summed units ([3af2392](https://github.com/michalik-maciej/projektownia-calculator/commit/3af2392de0f0e9c10c42a49468477c3d5aefd860))
* describe each side of an asymmetric gondola ([300df69](https://github.com/michalik-maciej/projektownia-calculator/commit/300df69501151d1a27a51838eb76e25f296554b5))
* describe layouts by dimensions and label them with P/G/Z codes ([103a058](https://github.com/michalik-maciej/projektownia-calculator/commit/103a058d0f4e10838c680637019aad7055e1b1b6))
* draw the configurator plan as a dimensioned technical drawing ([32866a6](https://github.com/michalik-maciej/projektownia-calculator/commit/32866a683a783cd8d8c378d787d8bf554ea12724))
* expose the running version and commit in the API and UI ([0f9a471](https://github.com/michalik-maciej/projektownia-calculator/commit/0f9a471ee31d6414b4a04dc7f882eef58872ec64))
* let each side of a gondola be edited on its own ([3a3c689](https://github.com/michalik-maciej/projektownia-calculator/commit/3a3c689945c89f75129d77545e59c97936c8a312))
* list item set components in the layout description ([d37f8ae](https://github.com/michalik-maciej/projektownia-calculator/commit/d37f8aefda26f17fbd32b2ca83a1162d3648bd62))
* model a gondola as two independent sides ([bb91707](https://github.com/michalik-maciej/projektownia-calculator/commit/bb917071aad1511d6f02165e888481ce326b89f7))
* outline the active tab in the top navigation bar ([ce01c93](https://github.com/michalik-maciej/projektownia-calculator/commit/ce01c93ffcf8c14414003b1fbc0a9d3e342959b9))
* pick offer components through per-category tag selects ([ad4b055](https://github.com/michalik-maciej/projektownia-calculator/commit/ad4b055894543ef9b4d7ae7a27b82f6ca553c47a))
* restyle the login dialog ([c0bbda4](https://github.com/michalik-maciej/projektownia-calculator/commit/c0bbda470afb95a66031efa4efc484fd77aa7088))
* restyle the offer page and unify compact typography ([a707e0b](https://github.com/michalik-maciej/projektownia-calculator/commit/a707e0b9a252b739b5a7dbb2f8fb2d093a1ec733))
* restyle the parts catalogue and its edit dialog ([f2189b2](https://github.com/michalik-maciej/projektownia-calculator/commit/f2189b29a7151688f96649da80cbdcdbc07589e7))
* restyle top bar and show offer save status on every page ([7450530](https://github.com/michalik-maciej/projektownia-calculator/commit/7450530d7b235a9b4342d619aa823ad1c02f134d))
* show offer rows as a table with a separate quantity column ([d440eb5](https://github.com/michalik-maciej/projektownia-calculator/commit/d440eb50d189b8c0950fc3d1d82a545231872a8b))
* show the breakdown as one table with category sections ([cded615](https://github.com/michalik-maciej/projektownia-calculator/commit/cded61512cfc1260a9d75875251b45cf64d3b4b2))
* sort inventory catalog items by size ([1f9223a](https://github.com/michalik-maciej/projektownia-calculator/commit/1f9223a2e92d74321d72a0ed4ff1769000fbbc28))
* use brand mark as logo and favicon ([457f67e](https://github.com/michalik-maciej/projektownia-calculator/commit/457f67ebaa30337b5e2ff8b6ab4f6679d3f5c246))


### Bug Fixes

* pin the top barfix: pin the top bar ([4eef94f](https://github.com/michalik-maciej/projektownia-calculator/commit/4eef94f9784e6e859b46ae912cdfcfa59b5fe2ec))
* send the user to login when the session is no longer valid ([ed39839](https://github.com/michalik-maciej/projektownia-calculator/commit/ed39839745195d537c61014f904771c305616d41))
