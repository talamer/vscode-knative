import * as path from 'path';
import { URL } from 'url';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as chai from 'chai';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as yaml from 'yaml';
import { ServingContextType } from '../../src/cli/config';
import { compareNodes } from '../../src/knative/knativeItem';
import * as revision from '../../src/knative/revision';
import { Revision } from '../../src/knative/revision';
import * as service from '../../src/knative/service';
import { Service } from '../../src/knative/service';
import { ServingTreeItem } from '../../src/servingTree/servingTreeItem';

chai.use(sinonChai);

suite('ServingTreeItem', () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
  });

  teardown(() => {
    sandbox.restore();
  });

  // Example A
  const yamlServiceAContentUnfiltered = `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"serving.knative.dev/v1","kind":"Service","metadata":{"annotations":{"serving.knative.dev/creator":"system:admin","serving.knative.dev/lastModifier":"system:admin"},"name":"exampleA","namespace":"a-serverless-exampleA"},"spec":{"template":{"spec":{"containerConcurrency":0,"containers":[{"image":"quay.io/rhdevelopers/knative-tutorial-greeter:quarkus","name":"user-container","readinessProbe":{"successThreshold":1,"tcpSocket":{"port":0}},"resources":{}}],"timeoutSeconds":300}},"traffic":[{"latestRevision":true,"percent":100}]}}
    serving.knative.dev/creator: system:admin
    serving.knative.dev/lastModifier: system:admin
  creationTimestamp: "2020-07-23T22:53:04Z"
  generation: 5
  managedFields:
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:kubectl.kubernetes.io/last-applied-configuration: {}
      f:spec:
        .: {}
        f:template:
          .: {}
          f:spec:
            .: {}
            f:containers: {}
            f:timeoutSeconds: {}
    manager: kubectl
    operation: Update
    time: "2020-07-23T23:23:04Z"
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:status:
        f:address:
          .: {}
          f:url: {}
        f:conditions: {}
        f:latestCreatedRevisionName: {}
        f:latestReadyRevisionName: {}
        f:observedGeneration: {}
        f:traffic: {}
        f:url: {}
    manager: controller
    operation: Update
    time: "2020-07-23T23:23:59Z"
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:spec:
        f:traffic: {}
    manager: kn
    operation: Update
    time: "2020-07-23T23:23:59Z"
  name: exampleA
  namespace: a-serverless-exampleA
  resourceVersion: "81373"
  selfLink: /apis/serving.knative.dev/v1/namespaces/a-serverless-exampleA/services/exampleA
  uid: b643305a-c4b1-4c45-8efb-f8edb1c86623
spec:
  template:
    metadata:
      creationTimestamp: null
    spec:
      containerConcurrency: 0
      containers:
      - image: quay.io/rhdevelopers/knative-tutorial-greeter:quarkus
        name: user-container
        readinessProbe:
          successThreshold: 1
          tcpSocket:
            port: 0
        resources: {}
      timeoutSeconds: 300
  traffic:
  - latestRevision: true
    percent: 100
  - latestRevision: false
    percent: 0
    revisionName: exampleA-2fvz4
    tag: old
  - latestRevision: false
    percent: 0
    revisionName: exampleA-75w7v
    tag: current
status:
  address:
    url: http://exampleA.a-serverless-exampleA.svc.cluster.local
  conditions:
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: ConfigurationsReady
  - lastTransitionTime: "2020-07-23T23:23:59Z"
    status: "True"
    type: Ready
  - lastTransitionTime: "2020-07-23T23:23:59Z"
    status: "True"
    type: RoutesReady
  latestCreatedRevisionName: exampleA-75w7v
  latestReadyRevisionName: exampleA-75w7v
  observedGeneration: 5
  traffic:
  - latestRevision: true
    percent: 100
    revisionName: exampleA-75w7v
  - latestRevision: false
    percent: 0
    revisionName: exampleA-2fvz4
    url: http://old-exampleA-a-serverless-exampleA.apps.devcluster.openshift.com
  - latestRevision: false
    percent: 0
    revisionName: exampleA-75w7v
    tag: current
    url: http://current-exampleA-a-serverless-exampleA.apps.devcluster.openshift.com
  url: http://exampleA-a-serverless-exampleA.apps.devcluster.openshift.com
    `;
  const jsonServiceAContentUnfiltered = yaml.parse(yamlServiceAContentUnfiltered) as service.Items;
  const testServiceA: Service = new Service(
    'exampleA',
    'http://exampleA-a-serverless-exampleA.apps.devcluster.openshift.com',
    jsonServiceAContentUnfiltered,
  );
  testServiceA.modified = false;
  const testServiceATreeItem: ServingTreeItem = new ServingTreeItem(
    null,
    testServiceA,
    { label: 'exampleA' },
    ServingContextType.SERVICE,
    vscode.TreeItemCollapsibleState.Expanded,
    null,
    null,
  );
  const testServiceAModified: Service = new Service(
    'exampleA',
    'http://exampleA-a-serverless-exampleA.apps.devcluster.openshift.com',
    jsonServiceAContentUnfiltered,
  );
  testServiceAModified.modified = true;
  const testServiceATreeItemModified: ServingTreeItem = new ServingTreeItem(
    null,
    testServiceAModified,
    { label: 'exampleA' },
    ServingContextType.SERVICE_MODIFIED,
    vscode.TreeItemCollapsibleState.Expanded,
    null,
    null,
  );

  const exampleA75w7vYaml = `apiVersion: serving.knative.dev/v1
kind: Revision
metadata:
  annotations:
    serving.knative.dev/creator: system:admin
    serving.knative.dev/lastPinned: "1595546588"
  creationTimestamp: "2020-07-23T23:23:04Z"
  generateName: exampleA-
  generation: 1
  labels:
    serving.knative.dev/configuration: exampleA
    serving.knative.dev/configurationGeneration: "3"
    serving.knative.dev/route: exampleA
    serving.knative.dev/service: exampleA
  managedFields:
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:serving.knative.dev/creator: {}
          f:serving.knative.dev/lastPinned: {}
        f:generateName: {}
        f:labels:
          .: {}
          f:serving.knative.dev/configuration: {}
          f:serving.knative.dev/configurationGeneration: {}
          f:serving.knative.dev/route: {}
          f:serving.knative.dev/service: {}
        f:ownerReferences:
          .: {}
          k:{"uid":"44de9281-8fff-4aeb-8a69-7bea9947f43d"}:
            .: {}
            f:apiVersion: {}
            f:blockOwnerDeletion: {}
            f:controller: {}
            f:kind: {}
            f:name: {}
            f:uid: {}
      f:spec:
        .: {}
        f:containerConcurrency: {}
        f:containers: {}
        f:timeoutSeconds: {}
      f:status:
        .: {}
        f:conditions: {}
        f:imageDigest: {}
        f:logUrl: {}
        f:observedGeneration: {}
        f:serviceName: {}
    manager: controller
    operation: Update
    time: "2020-07-23T23:24:08Z"
  name: exampleA-75w7v
  namespace: a-serverless-exampleA
  ownerReferences:
  - apiVersion: serving.knative.dev/v1
    blockOwnerDeletion: true
    controller: true
    kind: Configuration
    name: exampleA
    uid: 44de9281-8fff-4aeb-8a69-7bea9947f43d
  resourceVersion: "81531"
  selfLink: /apis/serving.knative.dev/v1/namespaces/a-serverless-exampleA/revisions/exampleA-75w7v
  uid: e0fe4445-ed60-44f7-b4b1-7126fb252810
spec:
  containerConcurrency: 0
  containers:
  - image: quay.io/rhdevelopers/knative-tutorial-greeter:quarkus
    name: user-container
    readinessProbe:
      successThreshold: 1
      tcpSocket:
        port: 0
    resources: {}
  timeoutSeconds: 300
status:
  conditions:
  - lastTransitionTime: "2020-07-23T23:24:08Z"
    message: The target is not receiving traffic.
    reason: NoTraffic
    severity: Info
    status: "False"
    type: Active
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: ContainerHealthy
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: Ready
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: ResourcesAvailable
  imageDigest: quay.io/rhdevelopers/knative-tutorial-greeter@sha256:767e2f4b37d29de3949c8c695d3285739829c348df1dd703479bbae6dc86aa5a
  logUrl: http://localhost:8001/api/v1/namespaces/knative-monitoring/services/kibana-logging/proxy/app/kibana#/discover?_a=(query:(match:(kubernetes.labels.knative-dev%2FrevisionUID:(query:'e0fe4445-ed60-44f7-b4b1-7126fb252810',type:phrase))))
  observedGeneration: 1
  serviceName: exampleA-75w7v
  `;
  const exampleA75w7vJson = yaml.parse(exampleA75w7vYaml) as revision.Items;
  const exampleA75w7vRevision: Revision = new Revision('exampleA-75w7v', 'exampleA', exampleA75w7vJson, [
    {
      tag: null,
      revisionName: 'exampleA-75w7v',
      configurationName: null,
      latestRevision: true,
      percent: 100,
      url: null,
    },
    {
      tag: 'current',
      revisionName: 'exampleA-75w7v',
      configurationName: null,
      latestRevision: false,
      percent: 0,
      url: new URL('http://current-exampleA-a-serverless-exampleA.apps.devcluster.openshift.com'),
    },
    {
      tag: 'old',
      revisionName: 'exampleA-2fvz4',
      configurationName: null,
      latestRevision: false,
      percent: 0,
      url: new URL('http://old-exampleA-a-serverless-exampleA.apps.devcluster.openshift.com'),
    },
  ]);
  const exampleA75w7vTreeItemModified: ServingTreeItem = new ServingTreeItem(
    testServiceATreeItemModified,
    exampleA75w7vRevision,
    { label: 'exampleA-75w7v' },
    ServingContextType.REVISION_TAGGED,
    vscode.TreeItemCollapsibleState.None,
    null,
    null,
  );

  const exampleA2fvz4Yaml = `apiVersion: serving.knative.dev/v1
kind: Revision
metadata:
  annotations:
    serving.knative.dev/creator: system:admin
    serving.knative.dev/lastPinned: "1595544804"
  creationTimestamp: "2020-07-23T22:53:04Z"
  generateName: exampleA-
  generation: 1
  labels:
    serving.knative.dev/configuration: exampleA
    serving.knative.dev/configurationGeneration: "1"
    serving.knative.dev/route: exampleA
    serving.knative.dev/service: exampleA
  managedFields:
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:serving.knative.dev/creator: {}
          f:serving.knative.dev/lastPinned: {}
        f:generateName: {}
        f:labels:
          .: {}
          f:serving.knative.dev/configuration: {}
          f:serving.knative.dev/configurationGeneration: {}
          f:serving.knative.dev/route: {}
          f:serving.knative.dev/service: {}
        f:ownerReferences:
          .: {}
          k:{"uid":"44de9281-8fff-4aeb-8a69-7bea9947f43d"}:
            .: {}
            f:apiVersion: {}
            f:blockOwnerDeletion: {}
            f:controller: {}
            f:kind: {}
            f:name: {}
            f:uid: {}
      f:spec:
        .: {}
        f:containerConcurrency: {}
        f:containers: {}
        f:timeoutSeconds: {}
      f:status:
        .: {}
        f:conditions: {}
        f:imageDigest: {}
        f:logUrl: {}
        f:observedGeneration: {}
        f:serviceName: {}
    manager: controller
    operation: Update
    time: "2020-07-23T23:23:52Z"
  name: exampleA-2fvz4
  namespace: a-serverless-exampleA
  ownerReferences:
  - apiVersion: serving.knative.dev/v1
    blockOwnerDeletion: true
    controller: true
    kind: Configuration
    name: exampleA
    uid: 44de9281-8fff-4aeb-8a69-7bea9947f43d
  resourceVersion: "81118"
  selfLink: /apis/serving.knative.dev/v1/namespaces/a-serverless-exampleA/revisions/exampleA-2fvz4
  uid: 38d9e4ce-a187-40f2-bc51-d50be5596e01
spec:
  containerConcurrency: 0
  containers:
  - image: quay.io/rhdevelopers/knative-tutorial-greeter:quarkus
    name: user-container
    readinessProbe:
      successThreshold: 1
      tcpSocket:
        port: 0
    resources: {}
  timeoutSeconds: 300
status:
  conditions:
  - lastTransitionTime: "2020-07-23T22:54:24Z"
    message: The target is not receiving traffic.
    reason: NoTraffic
    severity: Info
    status: "False"
    type: Active
  - lastTransitionTime: "2020-07-23T22:53:24Z"
    status: "True"
    type: ContainerHealthy
  - lastTransitionTime: "2020-07-23T22:53:24Z"
    status: "True"
    type: Ready
  - lastTransitionTime: "2020-07-23T22:53:24Z"
    status: "True"
    type: ResourcesAvailable
  imageDigest: quay.io/rhdevelopers/knative-tutorial-greeter@sha256:767e2f4b37d29de3949c8c695d3285739829c348df1dd703479bbae6dc86aa5a
  logUrl: http://localhost:8001/api/v1/namespaces/knative-monitoring/services/kibana-logging/proxy/app/kibana#/discover?_a=(query:(match:(kubernetes.labels.knative-dev%2FrevisionUID:(query:'38d9e4ce-a187-40f2-bc51-d50be5596e01',type:phrase))))
  observedGeneration: 1
  serviceName: exampleA-2fvz4
    `;
  const exampleA2fvz4Json = yaml.parse(exampleA2fvz4Yaml) as revision.Items;
  const exampleA2fvz4Revision: Revision = new Revision('exampleA-2fvz4', 'exampleA', exampleA2fvz4Json);
  const exampleA2fvz4TreeItemNoTraffic: ServingTreeItem = new ServingTreeItem(
    testServiceATreeItem,
    exampleA2fvz4Revision,
    { label: 'exampleA-2fvz4' },
    ServingContextType.REVISION,
    vscode.TreeItemCollapsibleState.None,
    null,
    null,
  );

  // Example B
  const yamlServiceBContentUnfiltered = `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"serving.knative.dev/v1","kind":"Service","metadata":{"annotations":{"serving.knative.dev/creator":"system:admin","serving.knative.dev/lastModifier":"system:admin"},"name":"exampleB","namespace":"a-serverless-exampleB"},"spec":{"template":{"spec":{"containerConcurrency":0,"containers":[{"image":"quay.io/rhdevelopers/knative-tutorial-greeter:quarkus","name":"user-container","readinessProbe":{"successThreshold":1,"tcpSocket":{"port":0}},"resources":{}}],"timeoutSeconds":300}},"traffic":[{"latestRevision":true,"percent":100}]}}
    serving.knative.dev/creator: system:admin
    serving.knative.dev/lastModifier: system:admin
  creationTimestamp: "2020-07-23T22:53:04Z"
  generation: 5
  managedFields:
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:kubectl.kubernetes.io/last-applied-configuration: {}
      f:spec:
        .: {}
        f:template:
          .: {}
          f:spec:
            .: {}
            f:containers: {}
            f:timeoutSeconds: {}
    manager: kubectl
    operation: Update
    time: "2020-07-23T23:23:04Z"
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:status:
        f:address:
          .: {}
          f:url: {}
        f:conditions: {}
        f:latestCreatedRevisionName: {}
        f:latestReadyRevisionName: {}
        f:observedGeneration: {}
        f:traffic: {}
        f:url: {}
    manager: controller
    operation: Update
    time: "2020-07-23T23:23:59Z"
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:spec:
        f:traffic: {}
    manager: kn
    operation: Update
    time: "2020-07-23T23:23:59Z"
  name: exampleB
  namespace: a-serverless-exampleB
  resourceVersion: "81373"
  selfLink: /apis/serving.knative.dev/v1/namespaces/a-serverless-exampleB/services/exampleB
  uid: b643305a-c4b1-4c45-8efb-f8edb1c86623
spec:
  template:
    metadata:
      creationTimestamp: null
    spec:
      containerConcurrency: 0
      containers:
      - image: quay.io/rhdevelopers/knative-tutorial-greeter:quarkus
        name: user-container
        readinessProbe:
          successThreshold: 1
          tcpSocket:
            port: 0
        resources: {}
      timeoutSeconds: 300
  traffic:
  - latestRevision: true
    percent: 100
  - latestRevision: false
    percent: 0
    revisionName: exampleB-2fvz4
    tag: old
  - latestRevision: false
    percent: 0
    revisionName: exampleB-75w7v
    tag: current
status:
  address:
    url: http://exampleB.a-serverless-exampleB.svc.cluster.local
  conditions:
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: ConfigurationsReady
  - lastTransitionTime: "2020-07-23T23:23:59Z"
    status: "True"
    type: Ready
  - lastTransitionTime: "2020-07-23T23:23:59Z"
    status: "True"
    type: RoutesReady
  latestCreatedRevisionName: exampleB-75w7v
  latestReadyRevisionName: exampleB-75w7v
  observedGeneration: 5
  traffic:
  - latestRevision: true
    percent: 100
    revisionName: exampleB-75w7v
  - latestRevision: false
    percent: 0
    revisionName: exampleB-2fvz4
    tag: old
    url: http://old-exampleB-a-serverless-exampleB.apps.devcluster.openshift.com
  - latestRevision: false
    percent: 0
    revisionName: exampleB-75w7v
    tag: current
    url: http://current-exampleB-a-serverless-exampleB.apps.devcluster.openshift.com
  url: http://exampleB-a-serverless-exampleB.apps.devcluster.openshift.com
    `;
  const jsonServiceBContentUnfiltered = yaml.parse(yamlServiceBContentUnfiltered) as service.Items;
  const testServiceB: Service = new Service(
    'exampleB',
    'http://exampleB-a-serverless-exampleB.apps.devcluster.openshift.com',
    jsonServiceBContentUnfiltered,
  );
  testServiceB.modified = false;
  const testServiceBTreeItem: ServingTreeItem = new ServingTreeItem(
    null,
    testServiceB,
    { label: 'exampleB' },
    ServingContextType.SERVICE,
    vscode.TreeItemCollapsibleState.Expanded,
    null,
    null,
  );
  const testServiceBModified: Service = new Service(
    'exampleB',
    'http://exampleB-a-serverless-exampleB.apps.devcluster.openshift.com',
    jsonServiceBContentUnfiltered,
  );
  testServiceBModified.modified = true;
  const testServiceBTreeItemModified: ServingTreeItem = new ServingTreeItem(
    null,
    testServiceBModified,
    { label: 'exampleB' },
    ServingContextType.SERVICE_MODIFIED,
    vscode.TreeItemCollapsibleState.Expanded,
    null,
    null,
  );

  const exampleB75w7vYaml = `apiVersion: serving.knative.dev/v1
kind: Revision
metadata:
  annotations:
    serving.knative.dev/creator: system:admin
    serving.knative.dev/lastPinned: "1595546588"
  creationTimestamp: "2020-07-23T23:23:04Z"
  generateName: exampleB-
  generation: 1
  labels:
    serving.knative.dev/configuration: exampleB
    serving.knative.dev/configurationGeneration: "3"
    serving.knative.dev/route: exampleB
    serving.knative.dev/service: exampleB
  managedFields:
  - apiVersion: serving.knative.dev/v1
    fieldsType: FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .: {}
          f:serving.knative.dev/creator: {}
          f:serving.knative.dev/lastPinned: {}
        f:generateName: {}
        f:labels:
          .: {}
          f:serving.knative.dev/configuration: {}
          f:serving.knative.dev/configurationGeneration: {}
          f:serving.knative.dev/route: {}
          f:serving.knative.dev/service: {}
        f:ownerReferences:
          .: {}
          k:{"uid":"44de9281-8fff-4aeb-8a69-7bea9947f43d"}:
            .: {}
            f:apiVersion: {}
            f:blockOwnerDeletion: {}
            f:controller: {}
            f:kind: {}
            f:name: {}
            f:uid: {}
      f:spec:
        .: {}
        f:containerConcurrency: {}
        f:containers: {}
        f:timeoutSeconds: {}
      f:status:
        .: {}
        f:conditions: {}
        f:imageDigest: {}
        f:logUrl: {}
        f:observedGeneration: {}
        f:serviceName: {}
    manager: controller
    operation: Update
    time: "2020-07-23T23:24:08Z"
  name: exampleB-75w7v
  namespace: a-serverless-exampleB
  ownerReferences:
  - apiVersion: serving.knative.dev/v1
    blockOwnerDeletion: true
    controller: true
    kind: Configuration
    name: exampleB
    uid: 44de9281-8fff-4aeb-8a69-7bea9947f43d
  resourceVersion: "81531"
  selfLink: /apis/serving.knative.dev/v1/namespaces/a-serverless-exampleB/revisions/exampleB-75w7v
  uid: e0fe4445-ed60-44f7-b4b1-7126fb252810
spec:
  containerConcurrency: 0
  containers:
  - image: quay.io/rhdevelopers/knative-tutorial-greeter:quarkus
    name: user-container
    readinessProbe:
      successThreshold: 1
      tcpSocket:
        port: 0
    resources: {}
  timeoutSeconds: 300
status:
  conditions:
  - lastTransitionTime: "2020-07-23T23:24:08Z"
    message: The target is not receiving traffic.
    reason: NoTraffic
    severity: Info
    status: "False"
    type: Active
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: ContainerHealthy
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: Ready
  - lastTransitionTime: "2020-07-23T23:23:08Z"
    status: "True"
    type: ResourcesAvailable
  imageDigest: quay.io/rhdevelopers/knative-tutorial-greeter@sha256:767e2f4b37d29de3949c8c695d3285739829c348df1dd703479bbae6dc86aa5a
  logUrl: http://localhost:8001/api/v1/namespaces/knative-monitoring/services/kibana-logging/proxy/app/kibana#/discover?_a=(query:(match:(kubernetes.labels.knative-dev%2FrevisionUID:(query:'e0fe4445-ed60-44f7-b4b1-7126fb252810',type:phrase))))
  observedGeneration: 1
  serviceName: exampleB-75w7v
  `;
  const exampleB75w7vJson = yaml.parse(exampleB75w7vYaml) as revision.Items;
  const exampleB75w7vRevision: Revision = new Revision('exampleB-75w7v', 'exampleB', exampleB75w7vJson, [
    {
      tag: null,
      revisionName: 'exampleB-75w7v',
      configurationName: null,
      latestRevision: true,
      percent: 100,
      url: null,
    },
    {
      tag: 'current',
      revisionName: 'exampleB-75w7v',
      configurationName: null,
      latestRevision: false,
      percent: 0,
      url: new URL('http://current-exampleB-a-serverless-exampleB.apps.devcluster.openshift.com'),
    },
  ]);
  const exampleB75w7vTreeItem: ServingTreeItem = new ServingTreeItem(
    testServiceBTreeItem,
    exampleB75w7vRevision,
    { label: 'exampleB-75w7v' },
    ServingContextType.REVISION_TAGGED,
    vscode.TreeItemCollapsibleState.None,
    null,
    null,
  );

  test('should compare 2 nodes and return a positive number when they are NOT in alphabetical order', () => {
    const compareResult: number = compareNodes(testServiceBTreeItem, testServiceATreeItem);
    expect(compareResult).to.equal(1);
  });

  test('should compare 2 nodes and return a negative number when they are NOT in alphabetical order', () => {
    const compareResult: number = compareNodes(testServiceATreeItem, testServiceBTreeItem);
    expect(compareResult).to.equal(-1);
  });

  test('should compare 2 modified nodes and return a positive number when they are NOT in alphabetical order', () => {
    const compareResult: number = compareNodes(testServiceBTreeItemModified, testServiceATreeItemModified);
    expect(compareResult).to.equal(1);
  });

  test('should compare 2 modified nodes and return a negative number when they are NOT in alphabetical order', () => {
    const compareResult: number = compareNodes(testServiceATreeItemModified, testServiceBTreeItemModified);
    expect(compareResult).to.equal(-1);
  });

  test('should compare 2 nodes and return a positive number when the first has no context', () => {
    const NoServiceContextTreeItem: ServingTreeItem = new ServingTreeItem(
      null,
      testServiceB,
      { label: 'exampleB' },
      null,
      vscode.TreeItemCollapsibleState.Expanded,
      null,
      null,
    );

    const compareResult: number = compareNodes(testServiceBTreeItem, NoServiceContextTreeItem);
    expect(compareResult).to.equal(1);
  });

  test('should compare 2 nodes and return a negative number when the second has no context', () => {
    const NoServiceContextTreeItem: ServingTreeItem = new ServingTreeItem(
      null,
      testServiceB,
      { label: 'exampleB' },
      null,
      vscode.TreeItemCollapsibleState.Expanded,
      null,
      null,
    );

    const compareResult: number = compareNodes(NoServiceContextTreeItem, testServiceBTreeItem);
    expect(compareResult).to.equal(-1);
  });

  test('should create a tree item and set the traffic labels correctly', () => {
    const revLabel = exampleA75w7vTreeItemModified.label.label;
    expect(revLabel).to.equal(`exampleA-75w7v (100%)`);
  });

  test('should get the icon path', () => {
    const localDir = __dirname;
    // use regex for search since the backslash for windows needs to be escaped in a regex string
    const expected = vscode.Uri.file(
      `${localDir.substring(0, localDir.search(/out.test/))}images${path.sep}context${path.sep}revision.svg`,
    );
    const revPath = exampleA75w7vTreeItemModified.iconPath;
    expect(revPath).to.deep.equal(expected);
  });

  test('should get the tooltip', () => {
    const tested = exampleB75w7vTreeItem.tooltip;
    expect(tested).to.equal(`Revision: exampleB-75w7v`);
  });

  test('should get the description, it should be the tags for a Revision', () => {
    const tested = exampleB75w7vTreeItem.description;
    expect(tested).to.equal('latest current ');
  });

  test('should get the description and it should be blank when not modified', () => {
    const tested = testServiceATreeItem.description;
    expect(tested).to.equal('');
  });

  test('should get the description and it should modified when modified', () => {
    const tested = testServiceATreeItemModified.description;
    expect(tested).to.equal('modified');
  });

  test('should get the command for selected tree item and return undefined if No Service Found', () => {
    const noServiceFoundTreeItem = new ServingTreeItem(
      null,
      null,
      { label: 'No Service Found' },
      ServingContextType.NONE,
      vscode.TreeItemCollapsibleState.None,
      null,
      null,
    );
    const tested = noServiceFoundTreeItem.command;
    // eslint-disable-next-line no-unused-expressions
    expect(tested).to.be.undefined;
  });

  test('should get the command for selected tree item and return Edit if modified', () => {
    const tested = testServiceATreeItemModified.command;
    expect(tested.command).to.equal('service.explorer.edit');
  });

  test('should get the command for selected tree item and return Describe if NOT modified', () => {
    const tested = testServiceATreeItem.command;
    expect(tested.command).to.equal('service.explorer.openFile');
  });

  test('should get the children of Not Found', () => {
    const noServiceFoundTreeItem = new ServingTreeItem(
      null,
      null,
      { label: 'No Service Found' },
      ServingContextType.NONE,
      vscode.TreeItemCollapsibleState.None,
      null,
      null,
    );
    const tested = noServiceFoundTreeItem.getChildren();
    expect(tested).to.deep.equal([]);
  });

  test('should get the children of Revision', () => {
    const tested = exampleA2fvz4TreeItemNoTraffic.getChildren();
    expect(tested).to.deep.equal([]);
  });

  test('should get the children of Tagged Revision', () => {
    const tested = exampleA75w7vTreeItemModified.getChildren();
    expect(tested).to.deep.equal([]);
  });

  test('should get the children of Service', () => {
    const tested = testServiceATreeItem.getChildren();
    expect(tested).to.deep.equal([]);
  });

  test('should get the children of a Modified Service', () => {
    const tested = testServiceATreeItemModified.getChildren();
    expect(tested).to.deep.equal([]);
  });
});
