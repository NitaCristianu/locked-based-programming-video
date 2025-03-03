import { Img, ImgProps } from "@motion-canvas/2d";
import mouseicon from "../assets/macursor.png";
import { easeInOutCubic, PossibleVector2, tween, Vector2, waitFor } from "@motion-canvas/core";

export interface MouseCursorProps extends ImgProps {}

export class MouseCursor extends Img {

    public constructor(props?: MouseCursorProps) {
        super({
            src : mouseicon,
            scale : 0.3,
            offsetX : -.7,
            offsetY : -.7,
            ...props,
        })
        
    }

    public *click (){
        yield* this.scale(.25, .2).back(.2);
    }

    public *goTo(position: PossibleVector2, second: number = .6, ratio: number = 1.5){
        const lerp = Vector2.createArcLerp(false, ratio);
        const from: Vector2 = this.position();
        yield* tween(second, (val:number) => this.position(lerp(from, new Vector2(position), easeInOutCubic(val))));
    }

}