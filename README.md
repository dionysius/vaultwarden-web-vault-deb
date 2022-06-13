<p align="center">
  <img src="https://raw.githubusercontent.com/bitwarden/brand/master/screenshots/apps-combo-logo.png" alt="Bitwarden" />
</p>
<p align="center">
  <a href="https://github.com/bitwarden/clients/actions/workflows/build-browser.yml?query=branch:master" target="_blank">
    <img src="https://github.com/bitwarden/clients/actions/workflows/build-browser.yml/badge.svg?branch=master" alt="Github Workflow browser build on master" />
  </a>
  <a href="https://github.com/bitwarden/clients/actions/workflows/build-desktop.yml?query=branch:master" target="_blank">
    <img src="https://github.com/bitwarden/clients/actions/workflows/build-desktop.yml/badge.svg?branch=master" alt="Github Workflow desktop build on master" />
  </a>
  <a href="https://gitter.im/bitwarden/Lobby" target="_blank">
    <img src="https://badges.gitter.im/bitwarden/Lobby.svg" alt="gitter chat" />
  </a>
</p>

---

# Bitwarden Client Applications

This repository houses all Bitwarden client applications except the [Mobile application](https://github.com/bitwarden/mobile).

Please refer to the [Clients section](https://contributing.bitwarden.com/clients/) of the [Contributing Documentation](https://contributing.bitwarden.com/) for build instructions, recommended tooling, code style tips, and lots of other great information to get you started.

## Related projects:

- [bitwarden/server](https://github.com/bitwarden/server): The core infrastructure backend (API, database, Docker, etc).
- [bitwarden/mobile](https://github.com/bitwarden/mobile): The mobile app vault (iOS and Android).
- [bitwarden/directory-connector](https://github.com/bitwarden/directory-connector): A tool for syncing a directory (AD, LDAP, Azure, G Suite, Okta) to an organization.

# We're Hiring!

Interested in contributing in a big way? Consider joining our team! We're hiring for many positions. Please take a look at our [Careers page](https://bitwarden.com/careers/) to see what opportunities are currently open as well as what it's like to work at Bitwarden.

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [Contributing Guidelines](https://contributing.bitwarden.com/contributing/). Check out the [Contributing Documentation](https://contributing.bitwarden.com/) for how to get started with your first contribution.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.

## Migrate PRs from old repositories

We recently migrated from individual client repositories. And some PRs were unfortunately left behind in the old repositories. Luckily it's fairly straightforward to sync them up again. Please follow all the instructions below in order to avoid most merge conflicts.

### Desktop

```
# Merge master
git merge master

# Merge branch mono-repo-prep
git merge 28bc4113b9bbae4dba2b5af14d460764fce79acf

# Verify files are placed in apps/desktop

# Add remote
git remote add clients git@github.com:bitwarden/clients.git

# Merge against clients master
git fetch clients
git merge clients/master

# Push to clients or your own fork
```

### CLI

```
# Merge master
git merge master

# Merge branch mono-repo-prep
git merge 980429f4bdcb178d8d92d8202cbdacfaa45c917e

# Verify files are placed in apps/cli

# Add remote
git remote add clients git@github.com:bitwarden/clients.git

# Merge against clients master
git fetch clients
git merge clients/master

# Push to clients or your own fork
```

### Web

```
# Merge master
git merge master

# Merge branch mono-repo-prep
git merge 02fe7159034b04d763a61fcf0200869e3209fa33

# Verify files are placed in apps/web

# Add remote
git remote add clients git@github.com:bitwarden/clients.git

# Merge against clients master
git fetch clients
git merge clients/master

# Push to clients or your own fork
```

### Jslib

```
# Merge master
git merge master

# Merge branch mono-repo
git merge d7492e3cf320410e74ebd0e0675ab994e64bd01a

# Verify files are placed in libs

# Add remote
git remote add clients git@github.com:bitwarden/clients.git

# Merge against clients master
git fetch clients
git merge clients/master

# Push to clients or your own fork
```
