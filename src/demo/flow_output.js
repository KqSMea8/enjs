var __flow__ = {
    flow: [
        251602937,
        111680894,
        165640875,
        267934055,
        86325570,
        425784387
    ],
    next: function (__step__) {
        return this.flow[__step__];
    }
};
function f() {
    var __step__ = 0;
    while (1) {
        switch (__flow__.next(__step__)) {
        case 251602937:
            var a = 1;
            __step__ = 1;
            break;
        case 111680894:
            if (a === 1) {
                __step__ = 2;
            } else {
                __step__ = 3;
            }
            break;
        case 165640875:
            console.log('a===1');
            __step__ = 4;
            break;
        case 267934055:
            console.log('a!==1');
            __step__ = 4;
            break;
        case 86325570:
            console.log('a:' + a);
            __step__ = 5;
            break;
        case 425784387:
            __step__ = false;
            break;
        }
        if (__step__ === false)
            break;
    }
}
f();
