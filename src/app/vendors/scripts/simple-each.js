module.exports = function simpleEach (arr, fn) {
    var i = 0;
    if (!arr) return false;
    var arrLen = arr.length;
    if (!arrLen) return false;

    for (; i < arrLen; i++) {
        fn(arr[i]);
    }
};
