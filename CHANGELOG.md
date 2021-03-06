# Change Log

All notable changes to the "vscode-knative" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.9.4 (2021/03/04)

-  Update `kn` cli to 0.21.0
-  Fix Wrong error alert message #136
-  Fix Extension stuck as it keeps looping inside the getServicesList method #137

## 0.9.3 (2021/03/01)

-  Update to a new set of icons
-  Validate image #30
-  Convert `kubectl apply` to `kn apply`
-  Update all dependencies
-  Fix Notification pop up for downloading kn cli sometimes does not appear #125
-  Fix Severing tree not loads when service has a not-existing image #133
-  Fix Cannot add service from an image URL in latest Knative (0.8.1) #109
-  Fix Error while quickly switching editor between revisions #66 
-  Fix Wrong display of tag #130
-  Fix Add tag on service command failed #129 
-  Fix Create closes tree kind #52 
-  Fix Error/failure report propagation into vscode-knative from cluster #79 
-  Fix When user is not logged in to the current cluster extension shows 'undefinedUnauthorized' error message #68 
-  Fix There is a slightly different behavior between how Kubernetes ext. and Knative ext. search for kubeconfig file #78 
-  Fix Import a Service kind/story #86
-  Fix Error if the connected cluster does not have knative #65
-  Fix Wrong error reporting if Knative Eventing is not installed #128
-  Fix 'No Service Found' item has context menu of regular Service item #67
-  Fix Adding validation for Add service inputs #77

## 0.9.2 (2021/01/19)

-  Display Eventing children
-  Update `kn` cli to 0.20.0
-  Update minimum required version of VSCode to 1.52.0

## 0.9.1 (2020/12/07)

-  Fix bugs in eventing
-  Update `kn` cli to 0.19.1

## 0.9.0 (2020/11/18)

-  Add Eventing tree
   -  Set it to read Eventing data and display it.
   -  Some Eventing concepts support displaying yaml.

## 0.8.1 (2020/10/17)

-  Update `kn` cli to 0.18.1
-  Update `kubectl` cli to 1.18.8
-  Fix bug; Error thrown when modifying a Service for the first time.
-  Fix bug; Allow deleting of tagged Revisions

## 0.8.0 (2020/09/15)

-  Add schema validation for Service YAML files.

## 0.7.0 (2020/08/05)

-  Edit Service YAML files and Apply them to the cluster.

## 0.6.0 (2020/06/08)

-  Add ability to add Tags to Revisions
-  Display tags on Revisions
-  Set Routes for any Revision with Traffic

## 0.5.0 (2020/06/02)

-  Add traffic percentage to the revision
-  Hide some unreachable commands from palette

## 0.4.1 (2020/05/22)

- Updated version of the `kn` cli to 0.14.0
- Removed double name displayed in the tree
- Added support for refresh when kubeconfig ENV changes 

## 0.4.0 (2020/05/11)

- Display yaml file for Services and Revisions when selected.
- Support Deletion of Services and Revisions

## 0.3.0 (2020/04/22)

- Display Revisions for each Service.

## 0.2.1 (2020/04/08)

- Patch to display icons in the explorer tree.

## 0.2.0 (2020/04/07)

- Feature added to allow you to create a new knative service.
  - This initial release is limited to just making a service with the name and image url.

## 0.1.4 (2020/03/13)

- Patch to allow locally built versions of the `kn` cli tool.
- Patch to add a `Refresh` button the explorer.
- Patch to fix the `Report Issue` button in the explorer.
- Patch to add a default value when no Service is found.

## 0.1.3 (2020/03/08)

- Patch to update the kn cli tool to v0.11.0.

## 0.1.2 (2020/03/07)

- Patch to fix download of cli tool.

## 0.1.0 (2020/02/15)

- Initial release
