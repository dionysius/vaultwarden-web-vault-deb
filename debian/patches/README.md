Based on the [instructions in the vaultwarden wiki](https://github.com/dani-garcia/vaultwarden/wiki/Building-binary#old-very-manual-way):

- replace `web_vault.patch` [with the best matching patch](https://github.com/dani-garcia/bw_web_builds/tree/master/patches) for the current build version
- update `resources` according to the instructions of the [apply_patch script](https://github.com/dani-garcia/bw_web_builds/blob/master/scripts/apply_patches.sh#L17)

In contrary to the upstream patch git, items in this resource folder mimic the destination path for easier copying
