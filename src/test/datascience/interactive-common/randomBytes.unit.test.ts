import { ISystemPseudoRandomNumberGenerator } from '../../../client/datascience/types';
import { assert } from 'chai';
import { SystemPseudoRandomNumberGenerator } from '../../../client/datascience/interactive-ipynb/randomBytes';
import { PlatformService } from '../../../client/common/platform/platformService';
import { ProcessServiceFactory } from '../../../client/common/process/processFactory';
import { BufferDecoder } from '../../../client/common/process/decoder';
import { ProcessLogger } from '../../../client/common/process/logger';
import { EnvironmentVariablesProvider } from '../../../client/common/variables/environmentVariablesProvider';
import { PathUtils } from '../../../client/common/platform/pathUtils';
import { EnvironmentVariablesService } from '../../../client/common/variables/environment';
import { MockOutputChannel } from '../../mockClasses';
import { mock } from 'ts-mockito';
import { WorkspaceService } from '../../../client/common/application/workspace';
import { getOSType, OSType } from '../../common';
import { MockFileSystem } from '../mockFileSystem';

suite('DataScience - RandomBytes', () => {
    let prng: ISystemPseudoRandomNumberGenerator;
    setup(() => {
        const fileSystem = new MockFileSystem();
        const platformService = new PlatformService();
        const workspaceService = new WorkspaceService();
        const pathUtils = new PathUtils(getOSType() === OSType.Windows);
        const outputChannel = mock(MockOutputChannel);
        const environmentVariablesService = new EnvironmentVariablesService(pathUtils, fileSystem);

        const environmentVariablesProvider = new EnvironmentVariablesProvider(
            environmentVariablesService,
            [],
            platformService,
            workspaceService
        );
        const processLogger = new ProcessLogger(outputChannel, pathUtils);
        const bufferDecoder = new BufferDecoder();

        const processServiceFactory = new ProcessServiceFactory(
            environmentVariablesProvider,
            processLogger,
            bufferDecoder,
            []
        );

        prng = new SystemPseudoRandomNumberGenerator(platformService, processServiceFactory, fileSystem);
    });

    test('Generate random bytes', async () => {
        const numRequestedBytes = 1024;
        const generatedBytes = await prng.randomBytes(numRequestedBytes);
        const numGeneratedBytes = generatedBytes.length;
        assert.ok(
            numGeneratedBytes === numRequestedBytes,
            `Expected to generate ${numRequestedBytes} random bytes but instead generated ${numGeneratedBytes} random bytes`
        );
        assert.ok(generatedBytes.filter((byte) => byte !== 0).length > 0, `Generated bytes are all null`);
    });
});