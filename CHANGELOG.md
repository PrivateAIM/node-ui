# Changelog

## [0.3.2](https://github.com/PrivateAIM/node-ui/compare/v0.3.1...v0.3.2) (2026-01-07)


### Features

* **analysis:** add analysis result cache ([fb1f74a](https://github.com/PrivateAIM/node-ui/commit/fb1f74a85141c69d31c4107589d390fa6ad655b2))
* **auth:** add toasts for RBAC permission errors ([c7d5e8f](https://github.com/PrivateAIM/node-ui/commit/c7d5e8f34d3abfa45f1f8390f0f5d3f4a7e58579))
* **rbac:** redirect to 403 page if invalid users attempts analysis log access ([f1c539b](https://github.com/PrivateAIM/node-ui/commit/f1c539b4b05795918664719cbfe200dd636c3b0e))


### Bug Fixes

* **analysis:** modify updateAnalysisRun to work with array ([ad407d6](https://github.com/PrivateAIM/node-ui/commit/ad407d6505d7770605caf8ad9bd6a8f2a7f7ce59))
* **analysis:** rerun button now deletes analysis before starting again ([4235141](https://github.com/PrivateAIM/node-ui/commit/4235141b1718e41367f79469ff3310bd2828f0d5))
* **analysis:** rerun button now deletes analysis before starting again ([4156f47](https://github.com/PrivateAIM/node-ui/commit/4156f47855f9f46649032ad66909eb716b88120c))
* **counter:** provided correct variable to counter ([f4b2074](https://github.com/PrivateAIM/node-ui/commit/f4b2074890a70a1f1709ab04e8c11655c81f273a))


### Performance Improvements

* better parsing of dynamic analyses ([8e508b3](https://github.com/PrivateAIM/node-ui/commit/8e508b38a23789f56d386ffa6d0f9d20eab0f74e))
* consolidate toasts ([415ed85](https://github.com/PrivateAIM/node-ui/commit/415ed859c865c81179518ce16787633330718180))


### Reverts

* **analysis:** update analysis btn works again ([f0b193d](https://github.com/PrivateAIM/node-ui/commit/f0b193da9395881b72073178eb90ce2ef12b8c13))

## [0.3.1](https://github.com/PrivateAIM/node-ui/compare/v0.3.0...v0.3.1) (2025-11-15)


### Bug Fixes

* **analysis:** enable buttons if no datastore but node is aggregator ([6c0cd17](https://github.com/PrivateAIM/node-ui/commit/6c0cd17a1e12fb242a8a29daf9b4a36bc671cd62))
* **analysis:** enable buttons if no datastore but node is aggregator ([3b840bf](https://github.com/PrivateAIM/node-ui/commit/3b840bf31b6fce0b34c7693ebe4b5f7bfb4b77d6))

## [0.3.0](https://github.com/PrivateAIM/node-ui/compare/v0.2.21...v0.3.0) (2025-11-11)


### ⚠ BREAKING CHANGES

* add token refresh routine

### Features

* add token refresh routine ([12ae26a](https://github.com/PrivateAIM/node-ui/commit/12ae26a0663d9f789236a85bd7f50c3c9bca2996))
* **analysis:** add progress bar for analyses ([cd70822](https://github.com/PrivateAIM/node-ui/commit/cd708221feea79031c17785c18f937b48c7c6252))
* **analysis:** progress and run status now updated from sources on update button click ([fc01080](https://github.com/PrivateAIM/node-ui/commit/fc010809b4c8d40b724f3d3a70ad71216c0bb4ee))
* **ds:** add dynamic options for S3 data stores ([12e96f4](https://github.com/PrivateAIM/node-ui/commit/12e96f4ae786ee865716bea30421ee8ce298e017))
* **logs:** add download and copy buttons ([8bb26ad](https://github.com/PrivateAIM/node-ui/commit/8bb26ad60aedd9ea00204e904691e1b02a6705e9))


### Bug Fixes

* **analysis:** buttons remain disabled if missing data store ([4b4f70d](https://github.com/PrivateAIM/node-ui/commit/4b4f70d191793f131d18aecaa25e2e2cf4c956b7))
* **ds:** have connection error toast show correct server name ([e177033](https://github.com/PrivateAIM/node-ui/commit/e17703349dc32d1b9c33fde88c05d1aea5453065))
* **ds:** send correct datastore name upon creation ([27a1536](https://github.com/PrivateAIM/node-ui/commit/27a1536f9797d9e38d5e2fc06f5cfa93780c9836))
* **toast:** prevent connection error toast spamming ([8bf14b3](https://github.com/PrivateAIM/node-ui/commit/8bf14b36cf0f7059fe0fe299cf16db3fe601f454))


### Performance Improvements

* **analysis:** better PO response parsing ([cd7ca02](https://github.com/PrivateAIM/node-ui/commit/cd7ca020259662d949e7f2121d53430b45db1460))


### Reverts

* **cleanup:** add zombies back to cleanup options ([0b73695](https://github.com/PrivateAIM/node-ui/commit/0b73695e65972b40e50b2bc824b6953ad0c92268))
* **logs:** no longer gatherLogs using onMounted to prevent RefreshSwitch bug ([f9a2fc5](https://github.com/PrivateAIM/node-ui/commit/f9a2fc581d7176cc85194213d5ecbd6110d42749))
* **update:** remove hub call for updat ([2370f89](https://github.com/PrivateAIM/node-ui/commit/2370f8979b33ae714119bd73ae67d429dff02204))

## [0.2.21](https://github.com/PrivateAIM/node-ui/compare/v0.2.20...v0.2.21) (2025-10-22)


### Features

* **analysis:** poll PO for pod status updates ([cd0e78b](https://github.com/PrivateAIM/node-ui/commit/cd0e78bee836a4b2184d050e3c7aa71462903c53))
* **analysis:** update table with analysis run status from PO ([94122fa](https://github.com/PrivateAIM/node-ui/commit/94122fa2f956445f432c0d7298e90734e33f3b42))
* **cleanup:** add keycloak cleanup option ([4ee8365](https://github.com/PrivateAIM/node-ui/commit/4ee836548806586295b0c0fb3d7fdc5b8c9dc1f0))
* **logs:** auto refresh enabled when logs present ([e3385c8](https://github.com/PrivateAIM/node-ui/commit/e3385c8bf319ec5327da6619d1d2941df3c77320))

## [0.2.20](https://github.com/PrivateAIM/node-ui/compare/v0.2.19...v0.2.20) (2025-10-21)


### Bug Fixes

* **auth:** enable localhost authentication in k8s ([76f5565](https://github.com/PrivateAIM/node-ui/commit/76f55654de39be407e080051a770261b321999e5))

## [0.2.19](https://github.com/PrivateAIM/node-ui/compare/v0.2.18...v0.2.19) (2025-09-25)


### Features

* **ds:** add connection test results to data store initialization page ([b6486f2](https://github.com/PrivateAIM/node-ui/commit/b6486f2c6df0e90b5246ff9c332a9f788b78eea3))
* **ds:** add manual connection test button to data store table ([2409066](https://github.com/PrivateAIM/node-ui/commit/2409066cc3b4a863c78456f08949bb974a316205))
* **ds:** add redirect to analysis page on successful data store registration ([eed4502](https://github.com/PrivateAIM/node-ui/commit/eed4502b392408b51db338bf122f21c5463a0076))


### Bug Fixes

* **ds:** remove comma from port number ([4401606](https://github.com/PrivateAIM/node-ui/commit/4401606d685d4ef8cfd96f46bec706acbee8d5a8))
* **plugin:** add check for node type request ([b66217f](https://github.com/PrivateAIM/node-ui/commit/b66217fcc125a9a109387ff6401b38cf7b3bea10))

## [0.2.18](https://github.com/PrivateAIM/node-ui/compare/v0.2.17...v0.2.18) (2025-08-26)


### Bug Fixes

* **proxy:** both proxy and no_proxy now respected ([057b9b2](https://github.com/PrivateAIM/node-ui/commit/057b9b2361f22a1df914cb87625c6f1526b8c586))

## [0.2.17](https://github.com/PrivateAIM/node-ui/compare/v0.2.16...v0.2.17) (2025-08-25)


### Features

* **analysis:** disable data store requirement if node is aggregator ([3d6aa23](https://github.com/PrivateAIM/node-ui/commit/3d6aa23da78bb54f276f90792191fe6752c1d349))
* **cleanup:** add dialog box to clean up resources ([227e587](https://github.com/PrivateAIM/node-ui/commit/227e5878235b383d288618e7b84682294d618ecb))


### Bug Fixes

* **idp:** add keycloak as default provider if none given in env vars ([fce63c9](https://github.com/PrivateAIM/node-ui/commit/fce63c947698e0de74ab28ad5759a69f5819f061))


### Performance Improvements

* **analysis:** make node type global instead of session-based ([428b62d](https://github.com/PrivateAIM/node-ui/commit/428b62d68487aad606ead6606f352ed8b73f8001))

## [0.2.16](https://github.com/PrivateAIM/node-ui/compare/v0.2.15...v0.2.16) (2025-08-15)


### Features

* **idp:** add Auth0, OneLogin, Okta, and Zitadel to accepted IDPs ([65dc99c](https://github.com/PrivateAIM/node-ui/commit/65dc99ce0e19715686fc26a8f1d50028d842d2c6))
* **idp:** add authentik as possible idp ([0312969](https://github.com/PrivateAIM/node-ui/commit/0312969a999b2e504cd55911cab2acaa56e6b856))


### Bug Fixes

* **idp:** env var naming ([c26dbd4](https://github.com/PrivateAIM/node-ui/commit/c26dbd42eb3789b1786820e1ed29f9125698cc67))

## [0.2.15](https://github.com/PrivateAIM/node-ui/compare/v0.2.14...v0.2.15) (2025-08-06)


### Features

* **proxy:** parse NO_PROXY env vars ([a01a58e](https://github.com/PrivateAIM/node-ui/commit/a01a58e26aafe5542d20e251be59918eb8f4a039))
* **proxy:** parse NO_PROXY env vars ([8e9984c](https://github.com/PrivateAIM/node-ui/commit/8e9984ccfd1bb244e2276e832d4b1374c28a649a))


### Bug Fixes

* **analysis:** enable log button when run status is finished ([0b2ab36](https://github.com/PrivateAIM/node-ui/commit/0b2ab36d01f7084023668140e17cad33320457ba))
* **analysis:** fix rerun button if pod is finished ([6117a16](https://github.com/PrivateAIM/node-ui/commit/6117a168f74659c3728561198636d8c6f75727ca))
* **analysis:** small bug in pod status check ([3a36fad](https://github.com/PrivateAIM/node-ui/commit/3a36fade3eaca353542be0d29d96eeb5a462840d))
* **ds:** project name parsing now works ([428e0c2](https://github.com/PrivateAIM/node-ui/commit/428e0c25a8fdb2b2f0cd9c90aa3baefd0b97fabe))
* **keycloak:** update keycloak link to /keycloak/admin ([545162f](https://github.com/PrivateAIM/node-ui/commit/545162f20ce521a079f699fc8efa0216e40497e6))
* **logs:** break up long strings to prevent container overflow ([3c67e0d](https://github.com/PrivateAIM/node-ui/commit/3c67e0d58df4929f3148a059f9a1893f2a0552cf))
* **logs:** break up long strings to prevent container overflow ([034659f](https://github.com/PrivateAIM/node-ui/commit/034659f0cfc3adaed83a0b88d9aa5a36c576797e))

## [0.2.14](https://github.com/PrivateAIM/node-ui/compare/v0.2.13...v0.2.14) (2025-06-25)


### Features

* **analysis:** add column indicating datastore status ([0eb3250](https://github.com/PrivateAIM/node-ui/commit/0eb3250c38b3ee8757678ef1fd02989ab1b06ed7))
* **analysis:** add column indicating datastore status ([b5f7f02](https://github.com/PrivateAIM/node-ui/commit/b5f7f0226943498c8ba7aa0d66598c96150fe500))
* **analysis:** basic analysis counter ([70d227b](https://github.com/PrivateAIM/node-ui/commit/70d227b1310eee02858fe93d1e459bec54aa0eb1))
* **counter:** working filter highlighting ([f0da1ce](https://github.com/PrivateAIM/node-ui/commit/f0da1cebd29bd8fe58c54c73ddcbd1792b293b77))
* **logs:** show previous failed run if no current run ([1f299dd](https://github.com/PrivateAIM/node-ui/commit/1f299ddcc8db290720703344691e9e65c31011bf))
* **proxy:** add manual patch to enable proxy ([a44e249](https://github.com/PrivateAIM/node-ui/commit/a44e2496c9b65ee9c6094e89e11ca8280e525877))
* **toast:** improve error parsing for toasts ([ecb716a](https://github.com/PrivateAIM/node-ui/commit/ecb716a5b3a3ecbcf59d5542ecec14f2be7f56ab))


### Bug Fixes

* **analysis:** fix duplication bug on analysis table refresh and add unit test ([b5108b6](https://github.com/PrivateAIM/node-ui/commit/b5108b64f16362aa6329dc3ce769c08057af22a1))
* **analysis:** fixed bug where buttons were not updating ([58d20f4](https://github.com/PrivateAIM/node-ui/commit/58d20f49561375bd0f72fd1bbfa0799b6259d51c))
* **counter:** change prop to computed ([fd3a925](https://github.com/PrivateAIM/node-ui/commit/fd3a9253396901e74a963356adb42b5152d3901c))

## [0.2.13](https://github.com/PrivateAIM/node-ui/compare/v0.2.12...v0.2.13) (2025-06-04)


### Features

* **analysis:** working dynamic pagination using hub offset ([ae32ed9](https://github.com/PrivateAIM/node-ui/commit/ae32ed907aab2053ecba2e8d8e50120ebbd78453))
* **error:** add error toast for missing registry credentials ([ed1311c](https://github.com/PrivateAIM/node-ui/commit/ed1311c4291315109c0391e0078ff43dabd0f9ca))
* update response parsing for new HA ([92a36ed](https://github.com/PrivateAIM/node-ui/commit/92a36ed4cc06dc8453f8c0684b3120b0a9333a03))


### Bug Fixes

* add empty input for helper method ([61a3386](https://github.com/PrivateAIM/node-ui/commit/61a338665b6c97d3300fa3fa0c09af7bbfaadeab))
* **analysis:** run status no longer stuck on starting during failed start ([e730223](https://github.com/PrivateAIM/node-ui/commit/e7302237f0bda67078b7d370315b7375f36e5e93))

## [0.2.12](https://github.com/PrivateAIM/node-ui/compare/v0.2.11...v0.2.12) (2025-05-23)


### Features

* **analysis:** add button to update analysis using PO ([4072369](https://github.com/PrivateAIM/node-ui/commit/4072369b75e670e0666fbfaafd72fd8a03edfac1))


### Bug Fixes

* **kong:** improve check for existing analysis entry in kong and control button update ([91cecd8](https://github.com/PrivateAIM/node-ui/commit/91cecd871280651bb1628b850543c741f9baa0bd))

## [0.2.11](https://github.com/PrivateAIM/node-ui/compare/v0.2.10...v0.2.11) (2025-05-07)


### Features

* check for running pod if kong consumer already exists ([aa70912](https://github.com/PrivateAIM/node-ui/commit/aa709123248a3e1b16947d2874d83c15dfe489e9))
* improved downstream error analysis ([2c63130](https://github.com/PrivateAIM/node-ui/commit/2c63130273940c37cf71c03b0f3fc9af860062af))
* log scroll bottom works on periodic update ([3b34005](https://github.com/PrivateAIM/node-ui/commit/3b34005113a21292ce0301fc7a29490853d53246))
* **logs:** jump to bottom of logs ([876a9f0](https://github.com/PrivateAIM/node-ui/commit/876a9f0fb6edcc10f5fb37a83ab4884a730502b6))


### Bug Fixes

* better PO response inspection ([0396216](https://github.com/PrivateAIM/node-ui/commit/0396216293bb2a7cb88d190890f0f8245c90a9a1))

## [0.2.10](https://github.com/PrivateAIM/node-ui/compare/v0.2.9...v0.2.10) (2025-04-22)


### Features

* add tooltips to tables ([9c526cc](https://github.com/PrivateAIM/node-ui/commit/9c526ccc2af7c3cd183d567949e352eee5a7abff))
* add tooltips to tables ([ae61488](https://github.com/PrivateAIM/node-ui/commit/ae61488b4f3ba8c81f527c894be3e349642c6919))
* **analyses:** add loading icon to proposals approve reject buttons build_image ([004e961](https://github.com/PrivateAIM/node-ui/commit/004e96145962012cc2b332e7fee5042c546b652e))
* **analyses:** add node name as column to analysis table build_image ([27608b2](https://github.com/PrivateAIM/node-ui/commit/27608b28ad008ed25f1ec81fd7aee9f955cb4c69))
* **analyses:** disable analysis control buttons if build status is not "finished" build_image ([8cab744](https://github.com/PrivateAIM/node-ui/commit/8cab7447ce50e7059a55bcdf87195c1ed6122523))
* **analyses:** update run status tag dynamically when starting and stopping ([d6e0a41](https://github.com/PrivateAIM/node-ui/commit/d6e0a418844696ebbf353bd4349e11bd598ee406))
* **analysis:** add approve reject buttons to analysis table and disable them ([54dd2d5](https://github.com/PrivateAIM/node-ui/commit/54dd2d55d28c9875489303942c15fdab8568459c))
* **analysis:** add approve reject buttons to analysis table and disable them ([ba1a22d](https://github.com/PrivateAIM/node-ui/commit/ba1a22d06b2f2923562d93c5d905b9140bbf6e9d))
* **analysis:** begin adding project data to pass to analysis ([c4f0552](https://github.com/PrivateAIM/node-ui/commit/c4f0552b105fe90afe0aeca5484c8104737dd1e6))
* **analysis:** move missing data store toast to analysis table component ([1f03df1](https://github.com/PrivateAIM/node-ui/commit/1f03df187994c56ac47032d3764e43c45e240213))
* **analysis:** project names now in analysis table ([ce4f24a](https://github.com/PrivateAIM/node-ui/commit/ce4f24a581203ef104d12a3eca01547b440365b7))
* **analysis:** remove build_status from analysis table and fix run status ([cd6a92b](https://github.com/PrivateAIM/node-ui/commit/cd6a92b4c36cc99f2d7c95731be669b3a3e16770))
* **analysis:** set button to emit when data store missing ([41d68ba](https://github.com/PrivateAIM/node-ui/commit/41d68ba0953b305f6ae46d93428e011eec41151d))
* **analysis:** working auto data link when pod starts ([a3cd913](https://github.com/PrivateAIM/node-ui/commit/a3cd91396bb6dd287165adb4e82259f96db163af))
* **api:** set analysis control buttons to use simple fetch ([4ed0710](https://github.com/PrivateAIM/node-ui/commit/4ed07104966db4eaa22c6df0f285b522f4edc810))
* **api:** update api definitions ([4131ca4](https://github.com/PrivateAIM/node-ui/commit/4131ca445bf6e90bcbdbd53d144165b6c0c6d89c))
* **api:** update hub adapter api models ([79fd0b1](https://github.com/PrivateAIM/node-ui/commit/79fd0b1e03747ee77307a9a3eee1676532d6d0e9))
* **api:** update hub adapter api models to include updated AnalysisNodeRunStatus ([a360e8e](https://github.com/PrivateAIM/node-ui/commit/a360e8efe284771833aa3c34a52eb779d5f2ed57))
* **auth:** begin playing with sidebase ([a8a52b7](https://github.com/PrivateAIM/node-ui/commit/a8a52b747554ca1e6a90db6e24e00da7a7b8241d))
* **auth:** catch invalid credential error and notify user with toast ([a3f0c81](https://github.com/PrivateAIM/node-ui/commit/a3f0c816e3cac3bd95599d8ac657ccfe2a7aaed0))
* **auth:** catch invalid credential error and notify user with toast ([66fffcc](https://github.com/PrivateAIM/node-ui/commit/66fffcc26a26604d03ebed2113855150ab91b8ca))
* **auth:** enable gloabl auth but disable for landing ([28b8b82](https://github.com/PrivateAIM/node-ui/commit/28b8b82b4da381c25fddb4d7e93b2f035d151698))
* **auth:** runtime config options ([d3c219b](https://github.com/PrivateAIM/node-ui/commit/d3c219b135df69f865588bc6391e1d5d0935bd0d))
* **auth:** working sidebase middleware ([0f1b3c2](https://github.com/PrivateAIM/node-ui/commit/0f1b3c242edc6ba1d7834289e46eeb0c08a8faed))
* **ci:** add version tag to images ([b8265c0](https://github.com/PrivateAIM/node-ui/commit/b8265c00d02ed6cc18746f8d827d662695b8eb47))
* **css:** add primeui preset ([0c7c20b](https://github.com/PrivateAIM/node-ui/commit/0c7c20b0ea9087ec6ed92a46923cda8a60e825a2))
* **css:** add tailwind and try configuring it ([b0e896a](https://github.com/PrivateAIM/node-ui/commit/b0e896a58dbe89e06628431050d9a8535d6a8469))
* **css:** begin fixing log container CSS ([b61d9ed](https://github.com/PrivateAIM/node-ui/commit/b61d9edaaea41dafbf09fae936522ed2540c2913))
* **css:** fix footer shadow ([ea4e78b](https://github.com/PrivateAIM/node-ui/commit/ea4e78b2bb5b99872d5a2d0e8d481293bc08b562))
* **css:** major fixes to styling throughtout ([57e9ff1](https://github.com/PrivateAIM/node-ui/commit/57e9ff1901ac5614f2f44afc1faeac873dae3e30))
* dark mode cookie ([f114703](https://github.com/PrivateAIM/node-ui/commit/f1147031b5b7bc724f6a1ada9f92ed38ebcf88db))
* **datastore:** add data store tags build_image ([74389c6](https://github.com/PrivateAIM/node-ui/commit/74389c609fe8384810d95bf3443b8df65c6329f2))
* **datastore:** add loading to delete buttons in data store views ([6e78e48](https://github.com/PrivateAIM/node-ui/commit/6e78e486a6c3a461670620d337316662a51f878d))
* **datastore:** add toasts to kong components ([f77e79b](https://github.com/PrivateAIM/node-ui/commit/f77e79ba4d38d9dd3295717e91ccf7ae707abfe6))
* **datastore:** first version of combining datastore and project creation ([45c4ebc](https://github.com/PrivateAIM/node-ui/commit/45c4ebcdac7df765773a89ee2633b73d0abb6e3d))
* **datastore:** simply data store overview tabs build_image ([b5b9769](https://github.com/PrivateAIM/node-ui/commit/b5b9769c6be6e7ca7678dc7980953df6ec5d4c86))
* **date:** add date object to returned formatted date fields ([1212d42](https://github.com/PrivateAIM/node-ui/commit/1212d42e0576348ad3d9ccfb51eef5b4808eb163))
* **date:** allow dates to be sorted and add dates to analysis table ([9cdcd7f](https://github.com/PrivateAIM/node-ui/commit/9cdcd7fc5ab4e6f7f943ee7916490c31b2b0440d))
* **dates:** add long and short dates ([36979a4](https://github.com/PrivateAIM/node-ui/commit/36979a4affa1225818020771dc73035d05494b2a))
* **ds:** add text to help fields ([3608604](https://github.com/PrivateAIM/node-ui/commit/3608604c5f64fa999839889970c0cf800375ad83))
* **ds:** start help box ([9012c40](https://github.com/PrivateAIM/node-ui/commit/9012c401527034d5699c99a48ad72de490833efb))
* **filter:** filter available data store projects and analyses based on node ID build_image ([8ffe4f5](https://github.com/PrivateAIM/node-ui/commit/8ffe4f53ca0e1b74cd5ddae43971dc4c696c49a4))
* **filter:** improve categorical table filters by making them reactive ([bef04d2](https://github.com/PrivateAIM/node-ui/commit/bef04d26dedadca708c476f19ddae7c2105faab5))
* **footer:** add package version to footer ([19fa15f](https://github.com/PrivateAIM/node-ui/commit/19fa15fceb324ad754e10e64d2a5cf3f3943b97f))
* **footer:** add package version to footer ([9b9329c](https://github.com/PrivateAIM/node-ui/commit/9b9329cac2f75aae76e987efa2d590a2561965b0))
* **keycloak:** add func to dynamically add required endpoints if an env var is present ([794cb58](https://github.com/PrivateAIM/node-ui/commit/794cb581cc2e081cab3ec352cc5907d303e3f9f9))
* **kong:** add duplicate entry error toast ([8a36808](https://github.com/PrivateAIM/node-ui/commit/8a368086410587df9f5ab7bc2378af81a9473d4d))
* **kong:** add loading symbol to data store delete button ([6241955](https://github.com/PrivateAIM/node-ui/commit/624195592cd598aa3e9d7d7f735cbc157262867a))
* **kong:** add project ID to data dropdown option build_image ([5235827](https://github.com/PrivateAIM/node-ui/commit/52358276bbe6f01489e4a235621382f7f7812348))
* **kong:** remove kong-admin-service from data store table build_image ([06edafa](https://github.com/PrivateAIM/node-ui/commit/06edafa24590df905f388160720f7ef57bff9968))
* **kong:** working datastore project combo creator ([c949015](https://github.com/PrivateAIM/node-ui/commit/c949015936094d5f4d31caf9ade4b7633f1f614a))
* **links:** add link to keycloak admin console in menu header ([924f661](https://github.com/PrivateAIM/node-ui/commit/924f6614738ac4e2e4fef1dc0a603e6efe707992))
* **logs:** add button to go to logs page for analysis ([60c2fb4](https://github.com/PrivateAIM/node-ui/commit/60c2fb470a27de228a86691b2937b7400711571d))
* **logs:** add previous analysis logs ([237d1b5](https://github.com/PrivateAIM/node-ui/commit/237d1b535fe45023bf91bec39aff0936dba0607d))
* **logs:** create working log update switch ([cf26573](https://github.com/PrivateAIM/node-ui/commit/cf2657344f47fd40f1ba73a0a8bd4cf3dd99bbc3))
* **logs:** handle when there are multiple containers ([9a7fd41](https://github.com/PrivateAIM/node-ui/commit/9a7fd41f65357174dbfcb855c71f7858e94269a3))
* **logs:** progress on log component for analysis containers ([8666c16](https://github.com/PrivateAIM/node-ui/commit/8666c1634ea4d47587087d3e6f84cf29be9ea95f))
* **logs:** start creating log component for analyses ([092e3dc](https://github.com/PrivateAIM/node-ui/commit/092e3dcb31f912537ef093ed411f15f0cfaab66e))
* **logs:** working id display in log component ([df2d130](https://github.com/PrivateAIM/node-ui/commit/df2d130f8010b06327ff650fefa28b67a8c3b640))
* **logs:** working log parsing ([50504e9](https://github.com/PrivateAIM/node-ui/commit/50504e98abf7b2648123860dbd200769a9b0e44b))
* **middleware:** improve middleware for checking token expiration ([d53920f](https://github.com/PrivateAIM/node-ui/commit/d53920fb7b3a0d48cbefb2b3240cc942f0fde428))
* **projects:** continue adding proiject parsing to analysis table ([602c894](https://github.com/PrivateAIM/node-ui/commit/602c8942e174955d81e7abd391a939ba110091be))
* **robot:** parse the hub adapter response when improper robot id used ([ffb3f0f](https://github.com/PrivateAIM/node-ui/commit/ffb3f0f84752f57ba5a937520638d59ac52dc3a0))
* **robot:** parse the hub adapter response when improper robot id used ([37a0ea6](https://github.com/PrivateAIM/node-ui/commit/37a0ea6740bd040692e7eb1dec8fa23e8ac160e2))
* **search:** add clear filter button to all tables and update dates ([e0a231b](https://github.com/PrivateAIM/node-ui/commit/e0a231be8b1971866f157f0cacbecdbee66cf020))
* **search:** add global search bar to analysis table ([3f332cf](https://github.com/PrivateAIM/node-ui/commit/3f332cf017fd71e05d32b5b0959bc8f876e39ecb))
* **search:** add search to project proposals ([a6625e2](https://github.com/PrivateAIM/node-ui/commit/a6625e2206e7abe06a1855a3128563ee3a3102d2))
* **search:** add search to projects and data store tables ([b499e77](https://github.com/PrivateAIM/node-ui/commit/b499e77acc54668101fbbd02a7c43ad785fc737e))
* **search:** begin testing column search ([ae51ace](https://github.com/PrivateAIM/node-ui/commit/ae51acecef2173a56952a439ec1096a6f3ec07ea))
* **sort:** update GET requests from hub to retrieve last updated results first ([125ff8a](https://github.com/PrivateAIM/node-ui/commit/125ff8a46d899de53f5f86add5142af1c1211f75))
* **status:** manually check each pod to see if running on node build_image ([59c8697](https://github.com/PrivateAIM/node-ui/commit/59c86971cfaae1850a36a5b162e12206f94831d7))
* **tables:** add broken refresh button to the tables ([ee96bd7](https://github.com/PrivateAIM/node-ui/commit/ee96bd787a93954b5c4ad05449754eb0eaa8f632))
* **tables:** working refresh button ([5aedb47](https://github.com/PrivateAIM/node-ui/commit/5aedb4706cc53f272e861bc0cd31e2c0613b19f9))
* **tags:** add status tags to analyses and ability to filter ([b410f2c](https://github.com/PrivateAIM/node-ui/commit/b410f2c458c3dff3f1e2efd874495702f3e8d821))
* **tags:** add status tags to proposals and ability to filter ([3515b77](https://github.com/PrivateAIM/node-ui/commit/3515b77691bf8b895e55d4b3ee043eebef2ee812))
* **tailwind:** add base tailwind css ([411a5f0](https://github.com/PrivateAIM/node-ui/commit/411a5f0fe67cdfca05f6ce4216f58b209c83a804))
* **tailwind:** set base theme to Lara and work off main.css ([84352ff](https://github.com/PrivateAIM/node-ui/commit/84352ff93632a08c6fe103b13c5f18e4b9e67fd6))
* **toast:** add new toast error for downstream service error ([6584689](https://github.com/PrivateAIM/node-ui/commit/6584689dd22aee95431d95c5f35eafa931dc085b))
* **tooltip:** add close button ([1774c81](https://github.com/PrivateAIM/node-ui/commit/1774c81be31ea4daed37948b0ddb9528d61e8e54))
* **tooltip:** add short hover tooltips ([184d811](https://github.com/PrivateAIM/node-ui/commit/184d8113a03bcd13efc72ba5eb8f4917f394b70d))
* **tooltip:** add short hover tooltips ([44de824](https://github.com/PrivateAIM/node-ui/commit/44de824f925c9062cb2b484d7f6f9dd57ade8e0e))
* **tooltip:** working expanding tooltip box ([523b5c6](https://github.com/PrivateAIM/node-ui/commit/523b5c67b10969035a923697a372393fae8f5b5c))
* **uuids:** begin removing UUIDs from columns in tables ([25290cc](https://github.com/PrivateAIM/node-ui/commit/25290cc078c0202be09d1c1ac53450d75f54e1e6))
* **v4:** begin migration to primevue v4 ([cd58eac](https://github.com/PrivateAIM/node-ui/commit/cd58eac5f875b392c50865f032e9ede808fb2e8b))
* working dark mode toggle ([4d79be4](https://github.com/PrivateAIM/node-ui/commit/4d79be40c339ed256bdb0b105acaff3113372a2f))


### Bug Fixes

* allow run and build status for control buttons to be null ([775c3fb](https://github.com/PrivateAIM/node-ui/commit/775c3fbab8e35314ea97cd993e9356ff02bca41f))
* allow run and build status for control buttons to be null ([50b5585](https://github.com/PrivateAIM/node-ui/commit/50b5585914e0f3d20290287c8f0366f199d0392d))
* **analysis:** fix analysis table row expansion by using proper id param build_image ([d157c79](https://github.com/PrivateAIM/node-ui/commit/d157c79914223fde891ff121813e5ea894896cfd))
* **analysis:** move pod check hack to button component build_image ([67c3c51](https://github.com/PrivateAIM/node-ui/commit/67c3c51904cb8ea687a16b780c5ca18b21a86aa1))
* **analysis:** proper button update on run status update ([eccabba](https://github.com/PrivateAIM/node-ui/commit/eccabbae1b89d4e8fd7a242f195a87c4c1762662))
* **analysis:** update node ID path for analysis control buttons build_image ([32f30ef](https://github.com/PrivateAIM/node-ui/commit/32f30ef993b9d00c8e091f984f4866e09c300b0d))
* **api:** add async to response error return ([14a3acf](https://github.com/PrivateAIM/node-ui/commit/14a3acf82c62e3b3845876b57ebcc60f1d2a8ef7))
* **api:** remove unused fetch definitions ([65ecffc](https://github.com/PrivateAIM/node-ui/commit/65ecffcd138886dc0f682fa333de8c63020e03c7))
* **auth:** enable JWT callback for API ([0467cdb](https://github.com/PrivateAIM/node-ui/commit/0467cdbaf0bdd4cacf10c1b3536267e7df3759cb))
* **avatar:** fix avatar menu breaking when logged in ([b92c46e](https://github.com/PrivateAIM/node-ui/commit/b92c46ec4975e321d64ff8bdc87058ca0c6bed5b))
* **avatar:** menu popup works ([67349dd](https://github.com/PrivateAIM/node-ui/commit/67349ddaa7184b6260dcc8ae013779f58899cf93))
* buggy dark mode toggle is checked at mounting ([f2c7674](https://github.com/PrivateAIM/node-ui/commit/f2c767496f97d14206d3adf19cdd071108dfc42c))
* **build:** add baseUrl to auth in nuxt config ([db4fdc2](https://github.com/PrivateAIM/node-ui/commit/db4fdc29a6a4487454b587522793ca9aaf35d64b))
* **callback:** add callback page and disable pkce build_image ([287a386](https://github.com/PrivateAIM/node-ui/commit/287a3866763b8a808301fe5c43f15c6a3089e6e1))
* change toggle for use with SSR ([d110f77](https://github.com/PrivateAIM/node-ui/commit/d110f77d1bf7922596af0c88818d6317d9aff629))
* ci ([501dcfe](https://github.com/PrivateAIM/node-ui/commit/501dcfe29ccdc462b459fcfc2e1b302c99500280))
* ci ([9192f15](https://github.com/PrivateAIM/node-ui/commit/9192f155ce1b1ece5e7521c0ae53f439bbeb9370))
* ci ([6617bb0](https://github.com/PrivateAIM/node-ui/commit/6617bb065a450e007b0db0a3dac470e4dc0e9bb6))
* ci again ([4145058](https://github.com/PrivateAIM/node-ui/commit/4145058781e5b5ab3468ae7f8bd5752005e7f3af))
* ci again ([8dafe73](https://github.com/PrivateAIM/node-ui/commit/8dafe73c48fa38eaab69e3697d7c868f405f094b))
* ci again ([ed80bd5](https://github.com/PrivateAIM/node-ui/commit/ed80bd59ed08469b2493f944a3802e75517a99c0))
* ci again ([569e0c9](https://github.com/PrivateAIM/node-ui/commit/569e0c9f4ab8d2d1d09ae096b1c96f8b8a5756b1))
* ci again ([718587b](https://github.com/PrivateAIM/node-ui/commit/718587ba6807d9e36fbc25e2060c4d2cb45ec047))
* ci again ([092ab6c](https://github.com/PrivateAIM/node-ui/commit/092ab6c72bc29e2435a5701d48138dd0d0130512))
* ci again ([47174e0](https://github.com/PrivateAIM/node-ui/commit/47174e01f04f3de6aaabf4b7407c9fe72a1c456b))
* ci again ([9e6502f](https://github.com/PrivateAIM/node-ui/commit/9e6502f9a689e010503631faf19f2d8625801b6e))
* **ci:** add outputs to metadata job ([d50cda8](https://github.com/PrivateAIM/node-ui/commit/d50cda8958cb6fdbe54cb903ccc969f0fe723099))
* **ci:** add pkg version tag ([d829d5a](https://github.com/PrivateAIM/node-ui/commit/d829d5a56583d74c0cbccdec929a0d9ce77d729e))
* **ci:** add workflow_dispatch as condition for canary tag ([25776a6](https://github.com/PrivateAIM/node-ui/commit/25776a64c1bb95a0d608ba700eb81a432c0ba59b))
* **ci:** change context to git for metadata build_image ([d773929](https://github.com/PrivateAIM/node-ui/commit/d77392949f56bdf6144bc867d08395c9308149b7))
* **ci:** debug ([b053866](https://github.com/PrivateAIM/node-ui/commit/b053866becea18ff9113293ac8e78a75cbe38f87))
* **ci:** disable enable condition for metadata ([7601474](https://github.com/PrivateAIM/node-ui/commit/7601474cdbdf4bc2819206531b7640da13cd377f))
* **ci:** env vars ([2623980](https://github.com/PrivateAIM/node-ui/commit/26239804628ef67c9fd15906cfe68b216b49e1b2))
* **ci:** exchange suffix for image tags ([23fe65c](https://github.com/PrivateAIM/node-ui/commit/23fe65c45b4d6d86046b19e064fc90dd94564bf7))
* **ci:** metadata dependency ([6fc9c06](https://github.com/PrivateAIM/node-ui/commit/6fc9c06f795b4d86bc4e84d2f4e475d03322c210))
* **ci:** properly extract image metadata ([3b4a881](https://github.com/PrivateAIM/node-ui/commit/3b4a88134245e5766f7d9ab4d46141b42d95edfc))
* **ci:** remove edge ([966869c](https://github.com/PrivateAIM/node-ui/commit/966869ce33787f5c3929afc30b435708d4f5e2d5))
* **ci:** remove env.package ([8b0ee62](https://github.com/PrivateAIM/node-ui/commit/8b0ee6243400d4f0316e39956eec735fce72b829))
* **ci:** remove merged condition ([b2ea130](https://github.com/PrivateAIM/node-ui/commit/b2ea1308be370a0cb1a0a712365481cfc9ea6304))
* **ci:** remove reference to env in tags ([7b6cf61](https://github.com/PrivateAIM/node-ui/commit/7b6cf61f60ebd64720d7d215cb9881a000bb184e))
* **ci:** remove show tags step ([3fcf45e](https://github.com/PrivateAIM/node-ui/commit/3fcf45e40beebf3ab8adc66a9f502743dcb022a5))
* **ci:** remove suffixes and add conditions to metadata tags ([7335cbe](https://github.com/PrivateAIM/node-ui/commit/7335cbe6b98def88032c1dd7953a70b15337741e))
* **ci:** set correct Dockerfile for prod deployment test build_image ([4d0d1df](https://github.com/PrivateAIM/node-ui/commit/4d0d1df74ec7729c00506f6689fc671ff5d46856))
* **ci:** test ([db2eda2](https://github.com/PrivateAIM/node-ui/commit/db2eda2d586294f3f543a3ed1be420b40338c7fd))
* **ci:** utilize tag_suffix ([0959cfa](https://github.com/PrivateAIM/node-ui/commit/0959cfa8e0ad879eebfe6648c440bc2c208c9f68))
* **config:** hack fix issuer claim conflict build_image ([9d931b7](https://github.com/PrivateAIM/node-ui/commit/9d931b788ebf1225d1e4a44f731a01d26e326e47))
* **config:** update nuxt config to include correct URIs for IDP endpoints ([6bf5fae](https://github.com/PrivateAIM/node-ui/commit/6bf5fae4b8dec269d498105156ca42c220d9d175))
* **css:** add missing CSS for cards and link styling ([001967f](https://github.com/PrivateAIM/node-ui/commit/001967f6a31e8fb4067e9d03f7ec329675affb19))
* **css:** footer matcher menu bar ([0086599](https://github.com/PrivateAIM/node-ui/commit/008659979888cc4587d1b19f8b67bf62d6b01d3f))
* **css:** header custom headers CSS ([1796371](https://github.com/PrivateAIM/node-ui/commit/1796371f33efaa2eb8a7313bf7c448df15fe9940))
* **css:** proper logs header styling ([f361124](https://github.com/PrivateAIM/node-ui/commit/f3611243eb1a54190539578940145574fa457049))
* **css:** working default dark mode ([0adedf7](https://github.com/PrivateAIM/node-ui/commit/0adedf71467a5a93a95f4e452950cc19f0361d02))
* **data-stores:** initialize data store tab vars with empty arrays ([2879f11](https://github.com/PrivateAIM/node-ui/commit/2879f11c9a1636c68667484952770e0f55b35e19))
* **datastore:** fix data store analyses table not updating after deletion ([d8ebd06](https://github.com/PrivateAIM/node-ui/commit/d8ebd06978e6349406efa76a0d9bfb0eb3dd5571))
* **datastore:** fix data store projects table not updating after deletion ([f44cb88](https://github.com/PrivateAIM/node-ui/commit/f44cb889986e07b47954d92d7a4ae3444c55e614))
* **datastore:** fix data store table not updating after deletion build_image ([e530b05](https://github.com/PrivateAIM/node-ui/commit/e530b0577d2975a6aaf474ff300ae2e660a41596))
* docker image action version ([bdcbd1e](https://github.com/PrivateAIM/node-ui/commit/bdcbd1e4dcc5d0d22d6391537f28bd52e263e2bc))
* docker image action version ([834f60e](https://github.com/PrivateAIM/node-ui/commit/834f60ead80bb4038a233b30f058317b7cbd8f66))
* docker semver tagging in ci ([45e0521](https://github.com/PrivateAIM/node-ui/commit/45e052165ec104e6e15e3e8e089138edec760c17))
* **docs:** add missing sidebase env vars ([4a7b6c7](https://github.com/PrivateAIM/node-ui/commit/4a7b6c720869fbae463b2c15d02269af9eb66774))
* **ds:** working tabs in data store overview and fix css ([cbf7b0f](https://github.com/PrivateAIM/node-ui/commit/cbf7b0f4a20410e9e72d934eb2f24dee29af55c3))
* **env:** add well known var to config ([3105bd9](https://github.com/PrivateAIM/node-ui/commit/3105bd921e4de6df1bbf02c6d1740b507021f00f))
* **expand:** add props to expand all comp to pass unique id prop ([b81890c](https://github.com/PrivateAIM/node-ui/commit/b81890c947e2bb25da07e5fe59b97b92c37641ef))
* fake fix ([efd8db2](https://github.com/PrivateAIM/node-ui/commit/efd8db2c9d78b947d0443e0ac5c1b9d72a48da2e))
* fake fix ([85c70b6](https://github.com/PrivateAIM/node-ui/commit/85c70b63fb0d38c18dca1cc868da5ef7cc665384))
* grab color preference after mounting ([4e07119](https://github.com/PrivateAIM/node-ui/commit/4e07119060fc1ccbc87f92e58f39f323f4701424))
* **hub:** add toast for when hub is unreacheable ([c399398](https://github.com/PrivateAIM/node-ui/commit/c3993981416bb7c7aebaaadf801fa3b2a7c29039))
* **kong:** disable udp option ([b5f35f7](https://github.com/PrivateAIM/node-ui/commit/b5f35f75c222e9f2ec6d942c12aa2d690b23d018))
* **kong:** proper analysis UUID parsing in kong table build_image ([46edc00](https://github.com/PrivateAIM/node-ui/commit/46edc00a2dc19e6aabf95da2b11fc5049f4b6f36))
* **kong:** specify confirm popup using distinct group names build_image ([6007dde](https://github.com/PrivateAIM/node-ui/commit/6007dde679afb4e92205ffd6e4100f4c8438eff2))
* **kong:** update project list after data store creation ([7dc4b43](https://github.com/PrivateAIM/node-ui/commit/7dc4b4331ade076b731fbe1718a8e530693060a2))
* **lint:** disable errors with typing and catch ([c7a9aff](https://github.com/PrivateAIM/node-ui/commit/c7a9aff98dd851dc8b066fc6ab5db512789fc70a))
* **middleware:** disable rerouting if response is 403 ([8f83007](https://github.com/PrivateAIM/node-ui/commit/8f830073cd41e0b55bebfa3d2cf5d9c9b51cea91))
* **prod:** enable new env vars for working prod build build_image ([cd6bfa9](https://github.com/PrivateAIM/node-ui/commit/cd6bfa985a3e5d32c4ffae20934b67110944b6e0))
* properly inject toast in SSR ([33f8e7f](https://github.com/PrivateAIM/node-ui/commit/33f8e7f0fa4d45d85d8b8bce2d02490490cb8592))
* properly parse accept and reject resp ([1a7e621](https://github.com/PrivateAIM/node-ui/commit/1a7e6211c4ca2754da33c266227e6b3915a2c105))
* remove component in tag ([f01f06b](https://github.com/PrivateAIM/node-ui/commit/f01f06b43ff9011c78474112206c03dfe2eb992a))
* **ripple:** ripple ends at rounded corners ([a5ebb83](https://github.com/PrivateAIM/node-ui/commit/a5ebb8345e2966e7bd837733e9f931816b209a10))
* **sort:** change date cols to filter using timestamp ([aff7490](https://github.com/PrivateAIM/node-ui/commit/aff74906060cabcedabc785313a6a60848ea3986))
* **tailwind:** working pkg combo ([60673be](https://github.com/PrivateAIM/node-ui/commit/60673beead737ac954976339eb4d01019dd72bf9))
* test bumping ([b266a75](https://github.com/PrivateAIM/node-ui/commit/b266a75637f2caed0a412100e6161ace6cdd717f))
* test bumping ([9dfbfb7](https://github.com/PrivateAIM/node-ui/commit/9dfbfb7e2525391cb5bdc934a74712bcae261fc0))
* **test:** improve typing of responses ([0b807a2](https://github.com/PrivateAIM/node-ui/commit/0b807a25852eeab96d19655c6b3bc8384db81e45))
* **timestamp:** only parse timestamp fields if they haven't been already ([3118bd6](https://github.com/PrivateAIM/node-ui/commit/3118bd64474771dcf12a4f459be3ee1f864d505e))
* **toast:** change error toast when service unreacheable ([3bd689f](https://github.com/PrivateAIM/node-ui/commit/3bd689ff52fe4beab1af4c1e96d9eba8140845c1))
* **toast:** set stop success toast to only show once ([94a6977](https://github.com/PrivateAIM/node-ui/commit/94a69772ac0be070a6a7daecca0dd0270a047d89))
* try copilot fix for setting branch name ([58af779](https://github.com/PrivateAIM/node-ui/commit/58af77908cc9750ef3c5ce99b37c76efa1337a45))
* **user:** set website to only show username and not private name build_image ([6ce5457](https://github.com/PrivateAIM/node-ui/commit/6ce5457da9994bd2af342d90e4635091338522f7))
* **workflow:** remove condition in canary ([7e140e5](https://github.com/PrivateAIM/node-ui/commit/7e140e5b9b3df9a8b5f99a2972c7ab8da7c4bcf1))
* **workflow:** remove v from local action ([ff45c27](https://github.com/PrivateAIM/node-ui/commit/ff45c2707f625c037cb719173f993228c42ed5c0))
* **workflow:** remove v from local action ([9a2c78f](https://github.com/PrivateAIM/node-ui/commit/9a2c78f0ac87bfc679a04067502352bb6984b290))
* **workflow:** wrap if in brackets ([9f0f921](https://github.com/PrivateAIM/node-ui/commit/9f0f9216fc462f17dee7089e76d35e957054c39a))


### Performance Improvements

* **analyses:** simplify expand all of analysis table ([1526c44](https://github.com/PrivateAIM/node-ui/commit/1526c44834c52f2984021785cab60b8457917962))
* **proposals:** update project proposal approval buttons to use ofetch ([f46f9cc](https://github.com/PrivateAIM/node-ui/commit/f46f9cc7bee8fc0bdeadeec8f7846ff35036b482))


### Reverts

* **auth:** expose access token build_image ([cb2c7aa](https://github.com/PrivateAIM/node-ui/commit/cb2c7aa531275f326d4efda97b6b7a0b7e3025b4))
* **auth:** hacky fix build_image ([52d61a1](https://github.com/PrivateAIM/node-ui/commit/52d61a16ed545ecc64c6631cc983ce7a578b42e6))
* **config:** re-enable user access token build_image ([66e14b0](https://github.com/PrivateAIM/node-ui/commit/66e14b0c0a122887e979b52b9ea5c2213a36928c))
* **config:** reenable userinfo url param ([57df29f](https://github.com/PrivateAIM/node-ui/commit/57df29fe1f93979363811fc875fe466650da7648))
* **css:** go to styled primevue ([d28e5aa](https://github.com/PrivateAIM/node-ui/commit/d28e5aa9a78993b7a63a5cac8603f49742685973))
* final 0.2.9 ([abd13d7](https://github.com/PrivateAIM/node-ui/commit/abd13d7040264ac3623562204a866eb497acb702))
* **nginx:** reset nginx conf build_image ([44a78cc](https://github.com/PrivateAIM/node-ui/commit/44a78ccb7466fb1d83e90e196a6c49e2e30b6a99))
* **pkce:** disable pkce build_image ([555ca57](https://github.com/PrivateAIM/node-ui/commit/555ca57bad7a5912de777391c4b4ccedf87827ec))
* **ssr:** no worky without SSR ([a1e0125](https://github.com/PrivateAIM/node-ui/commit/a1e01258ac299d217b2487af9627a182b9fbcbbb))
* to 0.2.9 again ([993f033](https://github.com/PrivateAIM/node-ui/commit/993f033b810e86a763715a52cf0a88eb307032e8))
* to v0.2.9 ([61251cb](https://github.com/PrivateAIM/node-ui/commit/61251cbbf62eb48a22350c37cd3ae05bf60f3f84))
* token ([81c453c](https://github.com/PrivateAIM/node-ui/commit/81c453c2da3eac09da88e8819ba7a74dd89dde1f))
* version ([73d6937](https://github.com/PrivateAIM/node-ui/commit/73d6937ef1774a1b140286b12db0df7e371c44b9))
* **workflow:** revert allowed push branch for trigger ([51c97e7](https://github.com/PrivateAIM/node-ui/commit/51c97e72b925e85e2d16772fef5665bca21d0b95))

## Changelog
