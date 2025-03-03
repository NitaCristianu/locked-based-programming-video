import { Rect, RectProps } from "@motion-canvas/2d";
import backgroundglsl from "../shaders/background.glsl";

export interface BackgroundProps extends RectProps {}

export class Background extends Rect{
    public constructor(props? : BackgroundProps){
        super({
            size : '100%',
            shaders : backgroundglsl,
            zIndex : -999,
            ...props,
        })

    }    
}