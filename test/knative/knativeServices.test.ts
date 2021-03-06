import * as vscode from 'vscode';
import { expect } from 'chai';
import * as chai from 'chai';
import { beforeEach } from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { KnativeServices } from '../../src/knative/knativeServices';
import { Revision } from '../../src/knative/revision';
import { Service } from '../../src/knative/service';
import { ServingDataProvider } from '../../src/servingTree/servingDataProvider';
import { ServingTreeItem } from '../../src/servingTree/servingTreeItem';
import * as aaaServiceRevisionData from '../servingTree/aaaServiceRevisionList.json';
import * as bbbServiceRevisionData from '../servingTree/bbbServiceRevisionList.json';
import * as cccServiceRevisionData from '../servingTree/cccServiceRevisionList.json';
import * as multipleServiceData from '../servingTree/multipleServiceServicesList.json';
import * as exampleServiceRevisionData from '../servingTree/singleServiceRevisionList.json';

chai.use(sinonChai);

suite('Knative Services', () => {
  const sandbox = sinon.createSandbox();
  const servingDataProvider = new ServingDataProvider();

  const ksvc: KnativeServices = KnativeServices.Instance;

  let serviceTreeItems: ServingTreeItem[];
  let revisionTreeItems: ServingTreeItem[];
  let service: Service;
  let revision: Revision;
  beforeEach(async () => {
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox
      .stub(servingDataProvider.knExecutor, 'execute')
      .resolves({ error: undefined, stdout: JSON.stringify(multipleServiceData) });
    serviceTreeItems = await servingDataProvider.getChildren();
    service = serviceTreeItems[3].getKnativeItem() as Service;
    sandbox.restore();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox
      .stub(servingDataProvider.knExecutor, 'execute')
      .resolves({ error: undefined, stdout: JSON.stringify(aaaServiceRevisionData) });
    revisionTreeItems = await servingDataProvider.getRevisions(serviceTreeItems[0]);
    sandbox.restore();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox
      .stub(servingDataProvider.knExecutor, 'execute')
      .resolves({ error: undefined, stdout: JSON.stringify(bbbServiceRevisionData) });
    revisionTreeItems = await servingDataProvider.getRevisions(serviceTreeItems[1]);
    sandbox.restore();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox
      .stub(servingDataProvider.knExecutor, 'execute')
      .resolves({ error: undefined, stdout: JSON.stringify(cccServiceRevisionData) });
    revisionTreeItems = await servingDataProvider.getRevisions(serviceTreeItems[2]);
    sandbox.restore();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox
      .stub(servingDataProvider.knExecutor, 'execute')
      .resolves({ error: undefined, stdout: JSON.stringify(exampleServiceRevisionData) });
    revisionTreeItems = await servingDataProvider.getRevisions(serviceTreeItems[3]);
    revision = revisionTreeItems[0].getKnativeItem() as Revision;
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('Getting an instance', () => {
    test('should return an instance of the singleton', () => {
      const instance: KnativeServices = KnativeServices.Instance;
      expect(instance).to.deep.equal(ksvc);
    });
  });
  suite('Getting a Service', () => {
    test('should return a list of services from the instance', () => {
      const returnedService: Service = ksvc.getServices()[3];
      expect(returnedService).to.deep.equal(service);
    });
  });
  suite('Finding a Service', () => {
    test('should return a service using the service name', () => {
      const returnedService: Service = ksvc.findService('example');
      expect(returnedService).to.deep.equal(service);
    });
  });
  suite('Finding a Revision', () => {
    test('should return a revision using the revision name', () => {
      const returnedRevision: Revision = ksvc.findRevision('example-75w7v');
      expect(returnedRevision).to.deep.equal(revision);
    });
  });
  suite('Finding a Service and Revision', () => {
    test('should return an object with both service and revision using the revision name', () => {
      const returnedServiceRevision = ksvc.findRevisionAndService('example-75w7v');
      expect(returnedServiceRevision).to.deep.equal({ revision, service });
    });
  });
  suite('Check Traffic', () => {
    test('should a revision with 2 traffics one tagged', () => {
      const returnedRevision = ksvc.findRevision('example-75w7v');
      expect(revision).to.deep.equal(returnedRevision);
      expect(revision.traffic);
      expect(revision.traffic).to.have.lengthOf(2);
      expect(revision.traffic[0].percent).to.equal(100);
      expect(revision.traffic[1].tag).to.equal('current');
    });
  });
  suite('Finding Service and Revision indexes', () => {
    test('should return an object with both service and revision using the revision name', () => {
      const revisionIndex = 0;
      const serviceIndex = 3;
      const returnedServiceRevision = ksvc.findRevisionAndServiceIndex('example-75w7v');
      expect(returnedServiceRevision).to.deep.equal({ revisionIndex, serviceIndex });
    });
  });
  suite('Adding a Service', () => {
    test('should return the service added', () => {
      const remainingServices: Service[] = ksvc.removeService('example');
      expect(remainingServices).to.have.lengthOf(3);
      const returnedService: Service = ksvc.addService(service);
      expect(returnedService).to.deep.equal(service);
    });
  });
  suite('Adding multiple Services', () => {
    test('should return a list of services added', () => {
      const remainingServices: Service[] = ksvc.removeService('example');
      expect(remainingServices).to.have.lengthOf(3);
      const returnedService: Service[] = ksvc.addServices([service]);
      expect(returnedService).to.deep.equal([service]);
    });
  });
  suite('Updating a Service', () => {
    test('should return a list of services, including the updated one', () => {
      const returnedService: Service[] = ksvc.updateService(service);
      expect(returnedService[3]).to.deep.equal(service);
    });
  });

  suite('Removing a Revision', () => {
    test('should delete a revision from the list inside the service', () => {
      ksvc.removeRevision('example-2fvz4');
      ksvc.removeRevision('example-g4hm8');
      ksvc.removeRevision('example-75w7v');
      expect(service.revisions).to.deep.equal([]);
    });
  });
});
