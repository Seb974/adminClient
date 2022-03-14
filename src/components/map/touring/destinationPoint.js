 export default function destinationPoint(lon, lat, distance, bearing) {
    var radius = 6371e3;

    var toRadians = function (v) {
        return (v * Math.PI) / 180;
    };
    var toDegrees = function (v) {
        return (v * 180) / Math.PI;
    };

    var δ = Number(distance) / radius;
    var θ = Number(bearing);

    var φ1 = toRadians(Number(lat));
    var λ1 = toRadians(Number(lon));

    var sinφ1 = Math.sin(φ1),
        cosφ1 = Math.cos(φ1);
    var sinδ = Math.sin(δ),
        cosδ = Math.cos(δ);
    var sinθ = Math.sin(θ),
        cosθ = Math.cos(θ);

    var sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * cosθ;
    var φ2 = Math.asin(sinφ2);
    var y = sinθ * sinδ * cosφ1;
    var x = cosδ - sinφ1 * sinφ2;
    var λ2 = λ1 + Math.atan2(y, x);

    return [((toDegrees(λ2) + 540) % 360) - 180, toDegrees(φ2)];
}