set -e
cd "$(dirname $(realpath "$0"))/.."

[ -d dist ] && rm -r dist
[ -d build ] && rm -r build
mkdir -p dist build

pnpm build:npm && pnpm build:exe

cp LICENSE dist
mv build/radiante-linux dist
mv build/radiante-win.exe dist
mv build/* dist/npm
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

7z a "$WINDOWS_ARCHIVE" LICENSE
7z a "$WINDOWS_ARCHIVE" radiante-win.exe
7z rn "$WINDOWS_ARCHIVE" radiante-win.exe "radiante-$BUILD_VERSION.exe"

rm LICENSE radiante-linux radiante-win.exe
cd .. && pwd
