module.exports = function(moduleName) {
    delete require.cache[moduleName];
    return require(moduleName);
}