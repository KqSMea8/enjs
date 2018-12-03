var __flow__ = {
    flow: [
        145563652,
        232941673,
        378150741,
        205687383,
        460378500,
        230250875
    ],
    next: function (__step__) {
        return this.flow[__step__];
    }
};
function f() {
    var __step__ = 0;
    while (1) {
        switch (__flow__.next(__step__)) {
        case 145563652:
            var a = 1;
            __step__ = 1;
            break;
        case 232941673:
            if (a === 1) {
                __step__ = 2;
            } else {
                __step__ = 3;
            }
            break;
        case 378150741:
            console.log('a===1');
            __step__ = 4;
            break;
        case 205687383:
            console.log('a!==1');
            __step__ = 4;
            break;
        case 460378500:
            console.log('a:' + a);
            __step__ = 5;
            break;
        case 230250875:
            __step__ = false;
            break;
        }
        if (__step__ === false)
            break;
    }
}
f();