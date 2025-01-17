set -e
cd "$(dirname $(realpath "$0"))"

git diff --quiet || {
  echo "Commit the changes before running $(basename "$0")"
  exit 1
}

[ -z "$SIGNING_KEY" ] && SIGNING_KEY="8d22f9f41e8cff1dd1746a1fe2671a1056c87108"
SIGNING_KEY="$(echo "$SIGNING_KEY" | tr '[:upper:]' '[:lower:]')"

gpg --list-keys "$SIGNING_KEY"

[ -d dist ] && rm -r dist
[ -d build ] && rm -r build

mkdir -p dist/ build/
pnpm build

cp ../../LICENSE dist
cp build/radiante-linux dist
cp build/radiante-win.exe dist
cd dist

if [ -n "$FULL_RELEASE" ]; then
  BUILD_VERSION="v$(pnpm pkg get version | tr -d '"')"
else
  BUILD_VERSION="r$(git rev-parse --short HEAD || echo 0000000)"
fi

LINUX_ARCHIVE="radiante-linux-$BUILD_VERSION.7z"
WINDOWS_ARCHIVE="radiante-windows-$BUILD_VERSION.7z"

7z a "$LINUX_ARCHIVE" LICENSE
7z a "$LINUX_ARCHIVE" radiante-linux
7z rn "$LINUX_ARCHIVE" radiante-linux "radiante-$BUILD_VERSION"

sha256sum "$LINUX_ARCHIVE" >"$LINUX_ARCHIVE.sha256"
gpg -u "$SIGNING_KEY" --armor --output "$LINUX_ARCHIVE.sha256.sig" --detach-sign "$LINUX_ARCHIVE.sha256"

7z a "$WINDOWS_ARCHIVE" LICENSE
7z a "$WINDOWS_ARCHIVE" radiante-win.exe
7z rn "$WINDOWS_ARCHIVE" radiante-win.exe "radiante-$BUILD_VERSION.exe"

sha256sum "$WINDOWS_ARCHIVE" >"$WINDOWS_ARCHIVE.sha256"
gpg -u "$SIGNING_KEY" --armor --output "$WINDOWS_ARCHIVE.sha256.sig" --detach-sign "$WINDOWS_ARCHIVE.sha256"

git tag -a "$BUILD_VERSION" -m "Release "$(echo "$BUILD_VERSION" | cut -c2-)""
rm LICENSE radiante-linux radiante-win.exe

echo "$(basename "$0"): Done."
