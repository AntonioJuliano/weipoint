const solc = require('solc');

const SolcImpl = {
    compile(source, version) {
        return this._compile(source, version, 0);
    },
    compileOptimized(source, version) {
        return this._compile(source, version, 1);
    },
    _compile(source, version, optNum) {
        let versionedSolc = solc;
        if (version != null) {
            versionedSolc = solc.useVersion(compilerVersion);
        }

        return Promise.resolve(
            {
                compiled: versionedSolc.compile(source, optNum),
                version: versionedSolc.version
            }
        );
    }
}

module.exports = SolcImpl;
