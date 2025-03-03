import { BBox, easeInOutCubic, Vector2 } from "@motion-canvas/core";

export type Ray = {
    from: Vector2;
    to: Vector2;
};

export type Rectangle = {
    position: Vector2; // Top-left corner
    size: Vector2; // Width and height
};

export type IntersectionResult = {
    point: Vector2;
    normal: Vector2;
} | null;

export function BBoxIntersect(
    box: BBox,
    r: Ray
): { point: Vector2 | null; normal: Vector2 | null } {
    const invDir = r.to.mul(-1);

    const tbot = box.topLeft.sub(r.from).mul(invDir); // Bottom intersection
    const ttop = box.topRight.sub(r.from).mul(invDir); // Top intersection

    const tmin = new Vector2(Math.min(ttop.x, tbot.x), Math.min(ttop.y, tbot.y));
    const tmax = new Vector2(Math.max(ttop.x, tbot.x), Math.max(ttop.y, tbot.y));

    const t0 = Math.max(tmin.x, tmin.y); // Largest minimum
    const t1 = Math.min(tmax.x, tmax.y); // Smallest maximum

    // Ensure intersection is valid
    if (t1 <= Math.max(t0, 0)) {
        return { point: null, normal: null };
    }

    // Calculate intersection point
    const point = r.from.add(r.to.sub(r.from).mul(t0));

    // Calculate normal
    let normal = new Vector2(0, 0);
    if (t0 === tmin.x) normal.x = invDir.x > 0 ? -1 : 1;
    else if (t0 === tmin.y) normal.y = invDir.y > 0 ? -1 : 1;

    return { point, normal };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => b != a ? (v - a) / (b - a) : 0;
export const remap = (oldMin: number, oldMax: number, newMin: number, newMax: number, v: number) => lerp(newMin, newMax, invLerp(oldMin, oldMax, v));
export const smooth_remap = (oldMin: number, oldMax: number, newMin: number, newMax: number, v: number) => easeInOutCubic(remap(oldMin, oldMax, newMin, newMax, v))

export const alphabet = "abcdefghijklmnopqrstuvwxyz";