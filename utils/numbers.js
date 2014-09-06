exports.random = function(low, high) {
    return Math.random() * (high - low) + low;
}
exports.randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
exports.randomIntInc = function(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
exports.leftPad  = function(str, length) {
    str = str == null ? '' : String(str);
    length = ~~length;
    pad = '';
    padLength = length - str.length;

    while(padLength--) {
        pad += '0';
    }

    return pad + str;
}
