var __flow__ = {
    flow: {
        '204961096': 126728977,
        '274966802': 104781108,
        '321377520': 458221788,
        '323882793': 483818604,
        '378833509': 208372903,
        '504072047': 419042415
    },
    next: function (__step__) {
        return this.flow[__step__];
    }
};
function f() {
    var __step__ = 274966802;
    while (1) {
        switch (__flow__.next(__step__)) {
        case 104781108:
            var a = 1;
            __step__ = 378833509;
            break;
        case 208372903:
            switch (a) {
            case 1:
                __step__ = 504072047;
                break;
            case 2:
                __step__ = 323882793;
                break;
            default:
                __step__ = 204961096;
                break;
            }
            __step__ = 321377520;
            break;
        case 419042415:
            console.log('a == 1');
            __step__ = 321377520;
            break;
        case 483818604:
            console.log('a == 2');
            __step__ = 321377520;
            break;
        case 126728977:
            console.log('default');
            __step__ = 321377520;
            break;
        case 458221788:
            __step__ = false;
            break;
        }
        if (__step__ === false)
            break;
    }
}
f();