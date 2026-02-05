# Vaultwarden web vault deb packages

Easy to install and highly configurable debian packages for running [Vaultwarden](https://github.com/dani-garcia/vaultwarden) on your system natively without docker.

## Installation

Head over to [vaultwarden-deb](https://github.com/dionysius/vaultwarden-deb) for installation instructions as this repository contains the debian source for building the web vault part.

Alternatively, download prebuilt packages from the [releases section](https://github.com/dionysius/immich-deb/releases) and verify signatures with the [signing-key](signing-key.pub). Packages are automatically built in [Github Actions](https://github.com/dionysius/immich-deb/actions). You will also need [vaultwarden-deb](https://github.com/dionysius/vaultwarden-deb).

## Build source package

This debian source package builds [Vaultwarden Web Vault](https://github.com/vaultwarden/vw_web_builds) natively on your build environment. No annoying docker! It is managed with [git-buildpackage](https://wiki.debian.org/PackagingWithGit) and aims to be a pretty good quality debian source package. You can find the maintaining command summary in [debian/gbp.conf](debian/gbp.conf).

### Requirements

Installed `git-buildpackage` from your apt

Installed build dependencies as defined in [debian/control `Build-Depends`](debian/control) (will notify you in the build process otherwise). [`mk-build-deps`](https://manpages.debian.org/testing/devscripts/mk-build-deps.1.en.html) can help you automate the installation, for example:

```bash
mk-build-deps -i -r debian/control -t "apt-get -o Debug::pkgProblemResolver=yes --no-install-recommends --yes"
```

If `nodejs`/`npm` is not recent enough don't forget to look into your `*-updates`/`*-backports` apt sources for newer versions or use a package from [nodesource](https://github.com/nodesource/distributions/blob/master/README.md)

### Build package

Clone with git-buildpackage and switch to the folder:

```bash
gbp clone https://github.com/dionysius/vaultwarden-web-vault-deb.git
cd vaultwarden-web-vault-deb
```

Build with git-buildpackage - there are many arguments to fine-tune the build (see `gbp buildpackage --help` and `dpkg-buildpackage --help`), notable options: `-b` (binary-only, no source files), `-us` (unsigned source package), `-uc` (unsigned .buildinfo and .changes file), `--git-export-dir=<somedir>` (before building the package export the source there), for example:

```bash
gbp buildpackage -b -us -uc
```

On successful build packages can now be found in the parent directory `ls ../*.deb`.
