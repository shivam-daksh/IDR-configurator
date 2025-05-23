const path = require('path');
const fs = require('fs');

module.exports = {
  packagerConfig: {
    executableName: "idr-configurator",
    asar: false,
    icon: 'images/idr',
    ignore: [
      "^(\/\.vscode$)",
      "^(\/support$)",
      ".gitattributes",
      ".gitignore",
      ".github",
      ".git",
      "3D_model_creation.md",
      "LICENSE",
      "MAPPROXY.md",
      "package-lock.json",
      "README.md",
      "idr_icon_128.psd",
    ]
  },
  hooks: {
    // Uniform artifact file names
    postMake: async (config, makeResults) => {
      makeResults.forEach(result => {
        var baseName = `${result.packageJSON.productName.replace(' ', '-')}_${result.platform}_${result.arch}_${result.packageJSON.version}`;
        result.artifacts.forEach(artifact => {
          var artifactStr = artifact.toString();
          var newPath = path.join(path.dirname(artifactStr), baseName + path.extname(artifactStr));
          newPath = newPath.replace('Configurator_win32_ia32', 'Configurator_Win32');
          newPath = newPath.replace('Configurator_win32_x64', 'Configurator_Win64');
          newPath = newPath.replace('Configurator_darwin', 'Configurator_MacOS');
          fs.renameSync(artifactStr, newPath);
          console.log('Artifact: ' + newPath);
        });
      });
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-wix',
      config: {
        name: "IDR Configurator",
        shortName: "IDR",
        exe: "idr-configurator",
        description: "Configurator for the open source flight controller software IDR.",
        programFilesFolderName: "idr-configurator",
        shortcutFolderName: "IDR",
        manufacturer: "The IDR open source project",
        appUserModelId: "com.idr.configurator",
        icon: path.join(__dirname, "./assets/windows/idr_installer_icon.ico"),
        upgradeCode: "13606ff3-b0bc-4dde-8fac-805bc8aed2f8",
        ui : {
          enabled: false,
          chooseDirectory: true,
          images: {
            background: path.join(__dirname, "./assets/windows/background.jpg"),
            banner: path.join(__dirname, "./assets/windows/banner.jpg")
          }
        },
        // Standard WiX template appends the unsightly "(Machine - WSI)" to the name, so use our own template
        beforeCreate: (msiCreator) => {
          return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname,"./assets/windows/wix.xml"), "utf8" , (err, content) => {
                if (err) {
                    reject (err);
                }
                msiCreator.wixTemplate = content;
                resolve();
            });
          });
        }
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: "IDR Configurator",
        background: "./assets/osx/dmg-background.png",
        icon: "./images/idr.icns"
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'linux', 'darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: "idr-configurator",
          productName: "IDR Configurator",
          categories: ["Utility"],
          icon: "./assets/linux/icon/idr_icon_128.png",
          description: "Configurator for the open source flight controller software IDR.",
          homepage: "https://github.com/idrflight/",

        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          name: "idr-configurator",
          productName: "IDR Configurator",
          license: "GPL-3.0",
          categories: ["Utility"],
          icon: "./assets/linux/icon/idr_icon_128.png",
          description: "Configurator for the open source flight controller software IDR.",
          homepage: "https://github.com/idrflight/",
        }
      },
    },
  ],
};
