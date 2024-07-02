import {
    assetManager,
    bezier,
    Canvas,
    director,
    instantiate,
    js,
    Label,
    log,
    Node,
    Prefab,
    ProgressBar,
    resources,
    sys,
    tween,
    UIOpacity,
    UITransform,
    Vec2,
    Vec3,
} from "cc";

export namespace GateUtils {
    export function gateLog(message) {
        log("GateLog: " + message);
    }

    export function scaleVector(scale) {
        return new Vec3(scale, scale, scale);
    }

    export function formatMoney(money) {
        money = Number(money);
        if (!js.isNumber(money)) return "";

        var strValue = money.toString();
        var pos = strValue.length - 3;
        while (pos > 0) {
            strValue = [strValue.slice(0, pos), ".", strValue.slice(pos)].join(
                ""
            );
            pos -= 3;
        }
        return strValue;
    }

    export function formatDateTime(
        dateTime: string,
        hasDate: boolean,
        hasTime: boolean
    ) {
        var arr = dateTime.split("-");
        var year = arr[0];
        var month = arr[1];
        var date = arr[2].substr(0, 2);

        var arrTime = arr[2].split(":");
        var hour = arrTime[0].substr(arrTime[0].length - 2, 2);
        var minute = arrTime[1];

        if (hasDate && hasTime)
            return hour + ":" + minute + " " + date + "-" + month + "-" + year;
        // + ':' + second;
        else if (hasDate) return date + "-" + month + "-" + year;
        else if (hasTime) return hour + ":" + minute;
    }

    export function parseTime(totalSec, haveHour = null) {
        if (!haveHour)
            return (
                this.padString(Math.floor(totalSec / 60), 2) +
                ":" +
                this.padString(totalSec % 60, 2)
            );
        else
            return (
                this.padString(Math.floor(totalSec / 3600), 2) +
                ":" +
                this.padString(Math.floor((totalSec % 3600) / 60), 2) +
                ":" +
                this.padString(totalSec % 60, 2)
            );
    }

    export function padString(n, width, z = "0") {
        n = n + "";
        return n.length >= width
            ? n
            : new Array(width - n.length + 1).join(z) + n;
    }

    export function convertNumberToKM(num, pad) {
        if (!pad) pad = 0;
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(pad).replace(/\.0$/, "") + "B";
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(pad).replace(/\.0$/, "") + "M";
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(pad).replace(/\.0$/, "") + "K";
        }
        return num;
    }

    export function formatBalance(num) {
        // if (!pad) pad = 0;
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(3).replace(/\./g, ",") + "B";
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(3).replace(/\./g, ",") + "M";
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(3).replace(/\.0$/, "");
        }
        return num;
    }
    export function shuffleArray(array) {
        array = array.sort(function (a, b) {
            return 0.5 - Math.random();
        });
        return array;
    }

    export function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

