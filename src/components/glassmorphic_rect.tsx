import { Gradient, initial, Rect, RectProps, signal } from "@motion-canvas/2d";
import gaussianblur from "../shaders/glassmorphic.glsl";
import { Color, SignalValue, SimpleSignal, Vector2 } from "@motion-canvas/core";

export interface GMRectProps extends RectProps {
    translucency?: SignalValue<number>;
    darkness?: SignalValue<number>;
    borderModifier?: SignalValue<number>;
    blurstrength?: SignalValue<number>;
    removeShadow? : SignalValue<number>;
}

export class GMRect extends Rect {

    @initial(.9)
    @signal()
    public declare readonly translucency: SimpleSignal<number, this>;

    @initial(30)
    @signal()
    public declare readonly blurstrength: SimpleSignal<number, this>;

    @initial(0)
    @signal()
    public declare readonly darkness: SimpleSignal<number, this>;

    @initial(0)
    @signal()
    public declare readonly borderModifier: SimpleSignal<number, this>;

    @initial(1)
    @signal()
    public declare readonly removeShadow: SimpleSignal<number, this>;

    public constructor(props?: GMRectProps) {
        super({
            radius: 32,
            shadowColor: "#fffa",
            ...props,
        })
        const inShadowBlurRaw = props ? (props.shadowBlur) : undefined;
        const inShadowBlur = typeof inShadowBlurRaw == "function" ? inShadowBlurRaw() : 0;

        this.add(<Rect
            fill="white"
            size={this.size}
            radius={this.radius}
            shadowBlur={() => inShadowBlur == 0 ? this.removeShadow() : this.shadowBlur() * this.removeShadow()}
            shadowColor={this.shadowColor}
            shaders={{
                fragment: gaussianblur,
                uniforms: {
                    strength: 10.,
                    opacity: this.translucency,
                    darkness: this.darkness,
                    borderModifier: this.borderModifier,
                    blurstrength: this.blurstrength,
                }
            }}
        />)
        this.add(<Rect
            size={this.size}
            radius={this.radius}
            stroke={new Gradient({
                from: new Vector2(1., 2.),
                to: new Vector2(0., 0.),
                stops: [
                    { offset: 0, color: this.shadowColor().alpha(this.shadowColor().alpha() - 0.5) },
                    { offset: 1, color: this.shadowColor().alpha(this.shadowColor().alpha() - 0.3) },
                ]
            })}
            lineWidth={2}
        />)

    }
}