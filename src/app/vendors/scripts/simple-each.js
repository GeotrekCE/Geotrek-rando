module.exports = function simpleEach (arr, fn) {
    var i = 0;
    var arrLen = arr.length;

    for (; i < arrLen; i++) {
        fn(arr[i]);
    }
};
