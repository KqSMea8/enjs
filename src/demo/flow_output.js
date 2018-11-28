var __flow__ = {
    flow: [
        486774961,
        102149741,
        251369405,
        227671032,
        348687916
    ],
    step: 0,
    next: function () {
        return this.flow[this.step];
    }
};
function f() {
    while (1) {
        var end = false;
        switch (__flow__.next()) {
        case 486774961:
            var a = 1;
            __flow__.step = 1;
            break;
        case 227671032:
            console.log('a:' + a);
            __flow__.step = 4;
            break;
        case 102149741:
            console.log('a===1');
            __flow__.step = 2;
            break;
        case 348687916:
            end = true;
            break;
        case 251369405:
            console.log('a!==1');
            __flow__.step = 3;
            break;
        }
        if (end)
            break;
    }
}
f();