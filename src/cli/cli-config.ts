/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import { ensureDirSync, removeSync } from 'fs-extra';
import * as path from 'path';
import { commands, Progress, ProgressLocation, Uri, window } from 'vscode';
import { which } from 'shelljs';
import { fromFileSync } from 'hasha';
import { satisfies } from 'semver';
// import { KnCli, createCliCommand } from './cmdCli';
import { DownloadUtil } from '../util/download';
import { Platform } from '../util/platform';
import { KnAPI } from './kn-api';
import { KubectlAPI } from './kubectl-api';

// import loadJSON from '../util/parse';
// import * as configData from './cli-config.json';
import configData = require('./cli-config.json');
// const configData = './cli-config.json';

export interface Config {
  cmd: CliConfig;
}
export interface CliConfig {
  description: string;
  vendor: string;
  name: string;
  version: string;
  versionRange: string;
  versionRangeLabel: string;
  filePrefix: string;
  platform?: PlatformOS;
  url?: string;
  sha256sum?: string;
  dlFileName?: string;
  cmdFileName?: string;
}
export interface PlatformOS {
  win32: PlatformData;
  darwin: PlatformData;
  linux: PlatformData;
}
export interface PlatformData {
  url: string;
  sha256sum: string;
  dlFileName?: string;
  cmdFileName: string;
}

/**
 *
 * @param location
 */
async function getVersion(location: string): Promise<string> {
  let version: Promise<string>;
  const [cmd] = location.split(path.sep).slice(-1);
  if (cmd === 'kn') {
    version = KnAPI.getKnVersion(location);
  } else if (cmd === 'kubectl') {
    version = KubectlAPI.getKubectlVersion(location);
  }
  return version;
  // const version = new RegExp(
  //   `Version:\\s+v(((([0-9]+)\\.([0-9]+)\\.([0-9]+)|(([0-9]+)-([0-9a-zA-Z]+)-([0-9a-zA-Z]+)))(?:-([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?)(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?).*`,
  // );
  // let detectedVersion: string;

  // try {
  //   const data = await KnCli.getInstance().execute(createCliCommand(`${location}`, `version`));

  //   if (data.stdout) {
  //     const toolVersion: string[] = data.stdout
  //       .trim()
  //       .split('\n')
  //       // Find the line of text that has the version.
  //       .filter((value1) => version.exec(value1))
  //       // Pull out just the version from the line from above.
  //       .map((value2) => {
  //         const regexResult = version.exec(value2);
  //         if (regexResult[8]) {
  //           // if the version is a local build then we will find more regex value and we need to pull the 8th in the array
  //           return regexResult[8];
  //         }
  //         // if it is a released version then just get it
  //         return regexResult[1];
  //       });
  //     if (toolVersion.length) {
  //       [detectedVersion] = toolVersion;
  //     }
  //   }
  //   return detectedVersion;
  // } catch (error) {
  //   // eslint-disable-next-line no-console
  //   console.log(`GetVersion had an error: ${error}`);
  //   return undefined;
  // }
}

/**
 * Find which [CMD] cli is installed and ensure it is the correct version.
 *
 * @param locations
 * @param versionRange
 */
async function selectTool(locations: string[], versionRange: string, versionLocalBuildRange: number): Promise<string> {
  let foundLocation: string;
  // Check the version of the cli to make sure it matches what we coded against.
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const location of locations) {
      // Find the first location, in a list of locations, that actually exists.
      // This couldn't be done asynchronously because it would return a Promise, which
      // can not be evaluated as a boolean. Therefor the synchronous method is used.
      if (fs.existsSync(location)) {
        // eslint-disable-next-line no-await-in-loop
        const locationsVersion: string = await getVersion(location);

        // Check if the version is a local build after a certain date or matches the given vesion range for releases version.
        if (Number(locationsVersion) > versionLocalBuildRange || satisfies(locationsVersion, versionRange)) {
          foundLocation = location;
          break;
        }
      }
    }
    return foundLocation;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`The selectTool method had an error: ${error}`);
    return undefined;
  }
}

export class CmdCliConfig {
  public static loadMetadata(requirements, platform: string): Config | void {
    const reqs = JSON.parse(JSON.stringify(requirements));
    // eslint-disable-next-line no-restricted-syntax
    for (const object in requirements) {
      if (reqs[object].platform) {
        if (reqs[object].platform[platform]) {
          Object.assign(reqs[object], reqs[object].platform[platform]);
          delete reqs[object].platform;
        } else {
          delete reqs[object];
        }
      }
    }
    return reqs;
  }

  /**
   * This contains the knative cli config data needed to access and run the commands.
   */
  static tools: Config | void = CmdCliConfig.loadMetadata(configData, Platform.OS);

  /**
   * Reset the knative cli config data
   */
  static resetConfiguration(): void {
    // KnCliConfig.tools = loadMetadata(loadJSON(configData), Platform.OS);
    CmdCliConfig.tools = CmdCliConfig.loadMetadata(configData, Platform.OS);
  }

  /**
   * Check for the presence of the cli `cmd` passed in.
   * Set the cli or download the needed cli tool and set it.
   *
   * @param cmd
   * @returns toolLocation
   */
  static async detectOrDownload(cmd: string): Promise<string> {
    try {
      // If the location of the cli has been set, then read it.
      let toolLocation: string = CmdCliConfig.tools[cmd].location;

      // So if the tool location hasn't been set then we need to figure that out.
      if (toolLocation === undefined) {
        const cliFile = `.vs-${cmd}`;
        // Look in [HOME]/.vs-[CMD]/ for the [CMD] cli executable
        const toolCacheLocation = path.resolve(Platform.getUserHomePath(), cliFile, CmdCliConfig.tools[cmd].cmdFileName);
        // If [CMD] cli is installed, get it's install location/path
        const whichLocation = which(cmd);
        // Get a list of locations.
        const toolLocations: string[] = [whichLocation ? whichLocation.stdout : null, toolCacheLocation];
        // Check the list of locations and see if what we need is there.
        // selectTool(toolLocations, KnCliConfig.tools[cmd].versionRange).then((foundToolLocation) => {
        let foundToolLocation: string = await selectTool(
          toolLocations,
          CmdCliConfig.tools[cmd].versionRange,
          CmdCliConfig.tools[cmd].versionLocalBuildRange,
        );
        // If the cli tool is still not found then we will need to install it.
        if (foundToolLocation === undefined || foundToolLocation === null) {
          // Set the download location for the cli executable.
          const toolDlLocation = path.resolve(Platform.getUserHomePath(), cliFile, CmdCliConfig.tools[cmd].dlFileName);
          // Message for expected version number
          const installRequest = `Download and install v${CmdCliConfig.tools[cmd].version}`;
          // Create a pop-up that asks to download and install.
          // let response: string;
          const response: string = await window.showInformationMessage(
            `Cannot find ${CmdCliConfig.tools[cmd].description} ${CmdCliConfig.tools[cmd].versionRangeLabel}.`,
            installRequest,
            'Help',
            'Cancel',
          );
          // Ensure that the directory exists. If the directory structure does not exist, then create it.
          ensureDirSync(path.resolve(Platform.getUserHomePath(), cliFile));
          // If the user selected to download and install then do this.
          if (response === installRequest) {
            // Display a Progress notification while downloading
            await window.withProgress(
              {
                cancellable: true,
                location: ProgressLocation.Notification,
                title: `Downloading ${CmdCliConfig.tools[cmd].description}`,
              },
              async (
                progress: Progress<{ increment: number; message: string }>,
                // token: CancellationToken,
              ) => {
                await DownloadUtil.downloadFile(
                  CmdCliConfig.tools[cmd].url,
                  toolDlLocation,
                  // token,
                  (dlProgress, increment) => progress.report({ increment, message: `${dlProgress}%` }),
                );

                // Get the hash for the downloaded file.
                // TODO: There is something that gets lost in Node if we use the async version.
                const sha256sum: string = fromFileSync(toolDlLocation, { algorithm: 'sha256' });

                let action = 'hash matches so install it';
                // Check the hash against the one on file to make sure it downloaded. If it doesn't match tell the user,
                // so they can download it again.
                if (sha256sum !== CmdCliConfig.tools[cmd].sha256sum) {
                  // Delete the file since something went wrong with the download.
                  removeSync(toolDlLocation);
                  action = await window.showInformationMessage(
                    `Checksum for downloaded ${CmdCliConfig.tools[cmd].description} v${CmdCliConfig.tools[cmd].version} is not correct.`,
                    'Download again',
                    'Cancel',
                  );
                }

                if (action === 'Download again') {
                  // If the download failed and we need to start it over, recursively call it.
                  CmdCliConfig.detectOrDownload(cmd);
                } else if (action !== 'Cancel') {
                  // The downloaded file is an executable and we need to rename it to [CMD]
                  fs.renameSync(toolDlLocation, toolCacheLocation);
                  // Change the file permissions if on Linux or Mac
                  if (Platform.OS !== 'win32') {
                    fs.chmodSync(toolCacheLocation, 0o755);
                  }
                  foundToolLocation = toolCacheLocation;
                }
              },
            );
          } else if (response === `Help`) {
            commands.executeCommand(
              'vscode.open',
              Uri.parse(`https://github.com/talamer/vscode-knative/blob/master/README.md#requirements`),
            );
          }
        }
        if (foundToolLocation) {
          // eslint-disable-next-line require-atomic-updates
          CmdCliConfig.tools[cmd].location = foundToolLocation;
        }
        toolLocation = foundToolLocation;
        // });
      }
      return toolLocation;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
