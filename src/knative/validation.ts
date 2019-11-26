/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import * as validator from "validator";

export abstract class Validation {
  static emptyName(message: string, value: string) {
    return validator.isEmpty(value) ? message : null;
  }

  static lengthName(message: string, value: string, offset: number) {
    return validator.isLength(value, 2, 63 - offset) ? null : message;
  }

  static validateUrl(message: string, value: string) {
    return validator.isURL(value) ? null : message;
  }

  static validateMatches(message: string, value: string) {
    return validator.matches(value, "^[a-z]([-a-z0-9]*[a-z0-9])*$")
      ? null
      : message;
  }

  static clusterURL(value: string) {
    const urlRegex = value.match("(https?://[^ ]*)");
    return urlRegex ? urlRegex[0] : null;
  }

  static ocLoginCommandMatches(value: string) {
    const ocloginRegex = /oc login (http|https):(.*?) --token=(.*)/;
    return ocloginRegex.test(value) ? value : null;
  }

  static getToken(value: string) {
    const tokenRegex = value.match("--tokens*=s*(.*)");
    return tokenRegex ? tokenRegex[1] : null;
  }
}