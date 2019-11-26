/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/

import { KnativeTreeObject } from "./knativeTreeObject";

export interface KnatvieTreeEvent {
  readonly type: "deleted" | "inserted" | "changed";
  readonly data: KnativeTreeObject;
  readonly reveal: boolean;
}

export class KnatvieTreeEventImpl implements KnatvieTreeEvent {
  constructor(
    readonly type: "deleted" | "inserted" | "changed",
    readonly data: KnativeTreeObject,
    readonly reveal: boolean = false
  ) {}
}