set -e

git diff --quiet || {
  echo "Commit the changes before running $(basename "$0")"
  exit 1
}

cd "$(dirname $(realpath "$0"))/.."
source scripts/build.sh && cd dist

git rev-parse "$BUILD_VERSION" && echo "Tag '$BUILD_VERSION' already exists" && exit 1

[ -z "$SIGNING_KEY" ] && SIGNING_KEY="8d22f9f41e8cff1dd1746a1fe2671a1056c87108"
SIGNING_KEY="$(echo "$SIGNING_KEY" | tr '[:upper:]' '[:lower:]')"

gpg --list-keys "$SIGNING_KEY"

sha256sum "$LINUX_ARCHIVE" >"$LINUX_ARCHIVE.sha256"
gpg -u "$SIGNING_KEY" --armor --output "$LINUX_ARCHIVE.sha256.sig" --detach-sign "$LINUX_ARCHIVE.sha256"

sha256sum "$WINDOWS_ARCHIVE" >"$WINDOWS_ARCHIVE.sha256"
gpg -u "$SIGNING_KEY" --armor --output "$WINDOWS_ARCHIVE.sha256.sig" --detach-sign "$WINDOWS_ARCHIVE.sha256"

gpg -o "pubkey_$SIGNING_KEY.asc" --armor --export "$SIGNING_KEY"

git tag -a "$BUILD_VERSION" -m "Release "$(echo "$BUILD_VERSION" | cut -c2-)""
echo "$(basename "$0"): Done."
